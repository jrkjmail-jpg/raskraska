# Raskraska BotHost

Минимальная ветка для запуска Telegram-бота на BotHost.

## Start command

Python mode:

```bash
python main.py
```

Node fallback mode:

```bash
node index.js
```

## Environment variables

```env
TELEGRAM_BOT_TOKEN=token_from_botfather
```

Также поддерживается переменная `BOT_TOKEN`, если BotHost передает токен из поля Bot Token автоматически.
