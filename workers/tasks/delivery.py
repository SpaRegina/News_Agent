import smtplib
import httpx
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List
import os

# Настройки SMTP из окружения
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_email(recipients: List[str], subject: str, body: str) -> bool:
    """Отправляет дайджест по email."""
    if not recipients or not SMTP_USER:
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = ", ".join(recipients)
        msg.attach(MIMEText(body, "plain", "utf-8"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, recipients, msg.as_string())
        return True
    except Exception as e:
        print(f"Ошибка отправки email: {e}")
        return False


def send_telegram(bot_token: str, chat_id: str, message: str) -> bool:
    """Отправляет дайджест через Telegram Bot API."""
    if not bot_token or not chat_id:
        return False
    # Telegram ограничивает сообщения 4096 символами — делим при необходимости
    chunks = [message[i:i+4096] for i in range(0, len(message), 4096)]
    try:
        for chunk in chunks:
            httpx.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                json={"chat_id": chat_id, "text": chunk, "parse_mode": "Markdown"},
                timeout=15,
            )
        return True
    except Exception as e:
        print(f"Ошибка отправки в Telegram: {e}")
        return False
