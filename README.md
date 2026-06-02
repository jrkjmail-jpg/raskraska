# Raskraska BotHost Bot

Полностью пересобранный минимальный Telegram-бот для BotHost.

Ветка не содержит Next.js, FastAPI, Python-зависимостей или сборки. Только Node.js и прямой Telegram Bot API.

## Start command

```bash
node index.js
```

Если BotHost просит главный файл:

```text
index.js
```

## Environment variables

```env
TELEGRAM_BOT_TOKEN=token_from_botfather
```

Также поддерживаются `BOT_TOKEN` и `TELEGRAM_TOKEN`.
