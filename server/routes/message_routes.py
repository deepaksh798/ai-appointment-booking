from fastapi import APIRouter, Depends, HTTPException, Query, Request
from bson import ObjectId

from app.database import db
from utils.jwt_handler import get_current_user
from utils.socket_manager import (
    emit_admin_message_to_user,
    get_chat_history_for_user,
    persist_chat_message,
)
from utils.telegram_bot import (
    TELEGRAM_ADMIN_CHAT_ID,
    TELEGRAM_WEBHOOK_SECRET,
    parse_reply_text_after_session_command,
    parse_session_id_from_text,
)


router = APIRouter()


@router.get("/chat/history")
async def chat_history(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(default=100, ge=1, le=500),
):
    user_id = current_user["user_id"]
    messages = await get_chat_history_for_user(user_id=user_id, limit=limit)
    return {"messages": messages}


@router.post("/telegram/webhook")
async def telegram_webhook(request: Request, secret: str | None = Query(default=None)):
    if TELEGRAM_WEBHOOK_SECRET and secret != TELEGRAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    payload = await request.json()
    message = payload.get("message") or payload.get("edited_message") or {}
    chat = message.get("chat") or {}
    chat_id = str(chat.get("id", ""))

    # Accept only messages from your admin chat.
    if TELEGRAM_ADMIN_CHAT_ID and chat_id != str(TELEGRAM_ADMIN_CHAT_ID):
        return {"ok": True, "ignored": "not-admin-chat"}

    text = (message.get("text") or "").strip()
    if not text:
        return {"ok": True, "ignored": "non-text-message"}

    session_id = parse_session_id_from_text(text)
    reply_text = parse_reply_text_after_session_command(text)

    if not session_id or not reply_text:
        return {
            "ok": True,
            "ignored": "format",
            "hint": "Use: /session <session_id> <reply text>",
        }

    try:
        session_object_id = ObjectId(session_id)
    except Exception:
        return {"ok": True, "ignored": "invalid-session-id"}

    session = await db.chat_sessions.find_one({"_id": session_object_id})
    if not session:
        return {"ok": True, "ignored": "session-not-found"}

    user_id = session["user_id"]
    saved = await persist_chat_message(
        session_id=session_id,
        user_id=user_id,
        direction="admin_to_user",
        text=reply_text,
        telegram_message_id=message.get("message_id"),
    )

    await emit_admin_message_to_user(
        user_id=user_id,
        message={
            "id": str(saved["_id"]),
            "direction": "admin_to_user",
            "from": "admin",
            "message": reply_text,
            "created_at": saved["created_at"].isoformat(),
        },
    )
    return {"ok": True}

