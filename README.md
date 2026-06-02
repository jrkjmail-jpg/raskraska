# Raskraska BotHost

Минимальная ветка для запуска Telegram-бота на BotHost.

Бот написан на чистом Node.js без npm-зависимостей, чтобы BotHost не пытался запускать Python или Next.js.

## Start command

```bash
node index.js
```

## Environment variables

```env
TELEGRAM_BOT_TOKEN=token_from_botfather
```

Также поддерживается переменная `BOT_TOKEN`, если BotHost передает токен из поля Bot Token автоматически.
