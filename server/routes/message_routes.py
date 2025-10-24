from fastapi import FastAPI, Request, APIRouter
from utils.socket_manager import sio
from utils.telegram_bot import send_telegram_message
import os
import anyio

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

router = APIRouter()

@router.post("/telegram-webhook")
async def telegram_webhook(request: Request):
    print("Telegram webhook hit")
    data = await request.json()
    print("Received Telegram webhook data:", data)

    if "message" in data:
        chat_id = data["message"]["chat"]["id"]
        text = data["message"].get("text", "")

        # Broadcast to frontend via WebSocket
        print(f"Broadcasting to frontend: {chat_id=} {text=}")
        await sio.emit("telegram_message", {"from": chat_id, "message": text}, namespace="/")

    return {"ok": True}


# From frontend to send message via Telegram bot
@sio.event
async def send_message(sid, data):
    print("Message from client:", data)
    chat_id = data.get("chat_id")
    text = data.get("message")
    if not chat_id or not text:
        print("Invalid send_message payload:", data)
        return

    # send_telegram_message uses requests (blocking) — run in a thread
    await anyio.to_thread.run_sync(send_telegram_message, str(chat_id), str(text))