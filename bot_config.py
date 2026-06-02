import os

TOKEN_ENV_NAMES = ("TELEGRAM_BOT_TOKEN", "BOT_TOKEN", "TOKEN", "TG_BOT_TOKEN")


def get_bot_token() -> str | None:
    """Return the first configured Telegram bot token from supported env names."""
    for name in TOKEN_ENV_NAMES:
        value = os.environ.get(name)
        if value and value.strip():
            return value.strip()
    return None


def mask_token(token: str) -> str:
    """Mask token for logs without leaking secrets."""
    if len(token) <= 10:
        return "***"
    return f"{token[:6]}...{token[-4:]}"
