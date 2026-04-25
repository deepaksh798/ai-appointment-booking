import os
import re
import httpx


TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID")
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "")


def parse_session_id_from_text(text: str) -> str | None:
    match = re.search(r"(?:^|\s)/session\s+([a-fA-F0-9]{24})(?:\s|$)", text or "")
    if match:
        return match.group(1)
    return None


def parse_reply_text_after_session_command(text: str) -> str:
    match = re.search(r"(?:^|\s)/session\s+[a-fA-F0-9]{24}\s+(.+)$", text or "")
    return match.group(1).strip() if match else ""


async def forward_user_message_to_telegram(
    *, user_id: str, session_id: str, text: str, user_name: str | None = None
) -> int | None:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_ADMIN_CHAT_ID:
        # Keep API alive even when telegram config is missing.
        return None

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    body = {
        "chat_id": TELEGRAM_ADMIN_CHAT_ID,
        "text": (
            f"New user message\n"
            f"Name: {user_name or 'Unknown'}\n"
            f"User: {user_id}\n"
            f"Session: {session_id}\n\n"
            f"Message: {text}\n\n"
            f"Reply format:\n/session {session_id} <your message>"
        ),
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=body)
        resp.raise_for_status()
        data = resp.json()
        result = data.get("result") or {}
        return result.get("message_id")

