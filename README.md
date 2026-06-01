# AI Coloring Book Generator

Веб-сервис и Telegram-бот для создания печатных раскрасок из фотографий.

## Что входит в MVP

- Next.js фронтенд с загрузкой изображения, выбором режима и возраста.
- FastAPI backend с REST API для генерации, истории работ, тарифов и админских данных.
- Celery worker для фоновой обработки изображений.
- PostgreSQL для пользователей, генераций, тарифов, промптов и логов.
- Redis для очереди задач.
- S3-compatible storage для исходников, PNG и PDF.
- Интеграция с OpenAI Images API через отдельный адаптер.
- Генерация PDF A4 с полями для печати.

## Быстрый старт

1. Создайте `.env` из примера:

```bash
cp .env.example .env
```

2. Заполните `OPENAI_API_KEY` и S3-параметры.

3. Запустите инфраструктуру:

```bash
docker compose up --build
```

4. Откройте:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

## Структура

```text
apps/web       Next.js приложение
apps/api       FastAPI API, Celery worker, Telegram bot entrypoint
infra          Docker и SQL init
docs           продуктовая и техническая документация
```

## Основной пользовательский поток

1. Пользователь загружает JPEG/PNG/WEBP до 20 МБ.
2. Выбирает режим: Free, Premium или Premium+.
3. Выбирает возрастной уровень: 3-5, 6-8 или 9+.
4. Backend сохраняет исходник в S3 и ставит Celery-задачу.
5. Worker вызывает OpenAI Images API, валидирует результат, формирует PDF A4.
6. Пользователь получает ссылки на PNG и PDF.

## Модели

По ТЗ модель Free указана как `gpt-image-mini`. В коде дефолтом используется актуальное имя из OpenAI Images API:

- Free: `gpt-image-1-mini`
- Premium/Premium+: `gpt-image-1.5`

Модели вынесены в настройки тарифов и промптов, чтобы их можно было менять без правок бизнес-логики.
