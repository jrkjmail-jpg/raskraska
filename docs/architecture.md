# Architecture

## Компоненты

- `apps/web`: клиентский сценарий загрузки и просмотра результата.
- `apps/api`: REST API, Celery tasks, adapters for OpenAI and S3, Telegram entrypoint.
- `postgres`: persistent product data.
- `redis`: Celery broker and result backend.
- `minio`: local S3-compatible storage.

## Основные сущности

- `User`: сайт или Telegram пользователь.
- `Generation`: одна заявка на раскраску.
- `Plan`: Free, Premium, Premium+ и подписка.
- `PromptTemplate`: управляемые промпты для режимов и возрастов.
- `ErrorLog`: ошибки генерации и интеграций.

## SLA цели

- API upload response: до 1 секунды.
- Очередь + генерация + PDF: 5-15 секунд при нормальном ответе Images API.
- UI polling: раз в 2 секунды.

## Ограничения MVP

- Платежная интеграция вынесена за интерфейс тарифов.
- Telegram bot entrypoint подготовлен, но сценарии требуют подключения webhook или polling.
- Админ-панель дает основу API и UI, расширяется под реальные роли.
