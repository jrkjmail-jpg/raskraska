# BotHost Deploy

Схема: GitHub repository -> BotHost project -> auto deploy on push.

## Репозиторий

```text
https://github.com/jrkjmail-jpg/raskraska.git
```

Branch:

```text
main
```

## Если BotHost запускает проект из корня

Используйте:

```bash
python bot.py
```

В корне есть:

- `bot.py` - entrypoint для Telegram-бота.
- `requirements.txt` - легкая зависимость только для Telegram-бота на BotHost.
- `Procfile` - fallback-команда для платформ, которые его читают.

## Если BotHost позволяет выбрать рабочую папку

Root directory:

```text
apps/api
```

Start command:

```bash
python -m app.telegram_bot
```

## Environment Variables

Минимум для старта Telegram-бота:

```env
TELEGRAM_BOT_TOKEN=token_from_botfather
```

Если BotHost автоматически передает токен из поля `Bot Token` как `BOT_TOKEN`, бот тоже его подхватит.

Для полной генерации также нужны:

```env
OPENAI_API_KEY=
DATABASE_URL=
REDIS_URL=
S3_ENDPOINT_URL=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=coloring-book
S3_PUBLIC_BASE_URL=
ADMIN_API_TOKEN=
```

## Важное ограничение

BotHost хорошо подходит для long-running Telegram bot process. Полный MVP проекта состоит из нескольких сервисов:

- FastAPI API
- Celery worker
- PostgreSQL
- Redis
- S3-compatible storage
- Next.js frontend

Если на BotHost запускается только один bot process, он не заменяет всю backend-инфраструктуру. Для полной генерации нужно либо:

- размещать API, worker, Postgres, Redis и S3 отдельно;
- либо использовать хостинг/VPS с Docker Compose;
- либо переписать Telegram-бота в single-process режим для MVP.
