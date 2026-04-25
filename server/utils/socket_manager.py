import socketio
from datetime import datetime, timezone
from bson import ObjectId

from app.database import db
from utils.jwt_handler import verify_token
from utils.telegram_bot import forward_user_message_to_telegram


sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# In-memory connection index (good for single backend instance).
sid_to_user: dict[str, str] = {}


def _user_room(user_id: str) -> str:
    return f"user:{user_id}"


async def _get_or_create_session(user_id: str) -> str:
    existing = await db.chat_sessions.find_one({"user_id": user_id})
    now = datetime.now(timezone.utc)

    if existing:
        await db.chat_sessions.update_one(
            {"_id": existing["_id"]}, {"$set": {"updated_at": now}}
        )
        return str(existing["_id"])

    payload = {"user_id": user_id, "created_at": now, "updated_at": now}
    created = await db.chat_sessions.insert_one(payload)
    return str(created.inserted_id)


async def _get_user_name(user_id: str) -> str | None:
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None
    if not user:
        return None
    return user.get("name")


async def persist_chat_message(
    *,
    session_id: str,
    user_id: str,
    direction: str,
    text: str,
    telegram_message_id: int | None = None,
) -> dict:
    now = datetime.now(timezone.utc)
    doc = {
        "session_id": session_id,
        "user_id": user_id,
        "direction": direction,  # user_to_admin | admin_to_user
        "text": text,
        "created_at": now,
        "telegram_message_id": telegram_message_id,
    }
    result = await db.chat_messages.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def emit_admin_message_to_user(user_id: str, message: dict) -> None:
    await sio.emit("chat_message", message, room=_user_room(user_id))


@sio.event
async def connect(sid, environ, auth):
    token = None
    if isinstance(auth, dict):
        token = auth.get("token")

    if not token:
        return False

    user_id = verify_token(token)
    if not user_id:
        return False

    sid_to_user[sid] = user_id
    await sio.enter_room(sid, _user_room(user_id))

    session_id = await _get_or_create_session(user_id)
    await sio.emit("session_ready", {"session_id": session_id}, to=sid)


@sio.event
async def disconnect(sid):
    sid_to_user.pop(sid, None)


@sio.event
async def send_message(sid, payload):
    user_id = sid_to_user.get(sid)
    if not user_id:
        return {"ok": False, "error": "Unauthorized socket"}

    text = (payload or {}).get("message", "").strip()
    if not text:
        return {"ok": False, "error": "Message cannot be empty"}

    session_id = await _get_or_create_session(user_id)
    message = await persist_chat_message(
        session_id=session_id,
        user_id=user_id,
        direction="user_to_admin",
        text=text,
    )

    await forward_user_message_to_telegram(
        user_id=user_id,
        session_id=session_id,
        text=text,
        user_name=await _get_user_name(user_id),
    )

    await sio.emit(
        "chat_message",
        {
            "id": str(message["_id"]),
            "direction": "user_to_admin",
            "from": "me",
            "message": text,
            "created_at": message["created_at"].isoformat(),
        },
        to=sid,
    )
    return {"ok": True}


async def get_chat_history_for_user(user_id: str, limit: int = 100) -> list[dict]:
    session = await db.chat_sessions.find_one({"user_id": user_id})
    if not session:
        return []

    cursor = (
        db.chat_messages.find({"session_id": str(session["_id"])})
        .sort("created_at", 1)
        .limit(limit)
    )
    messages: list[dict] = []
    async for item in cursor:
        messages.append(
            {
                "id": str(item["_id"]),
                "direction": item.get("direction"),
                "from": "me" if item.get("direction") == "user_to_admin" else "admin",
                "message": item.get("text", ""),
                "created_at": item.get("created_at").isoformat()
                if item.get("created_at")
                else None,
            }
        )
    return messages
