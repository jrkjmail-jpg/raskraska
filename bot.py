import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import KeyboardButton, Message, ReplyKeyboardMarkup


def main_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Создать раскраску")],
            [KeyboardButton(text="Мои работы"), KeyboardButton(text="Купить Premium")],
            [KeyboardButton(text="Поддержка")],
        ],
        resize_keyboard=True,
    )


async def run_bot() -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("BOT_TOKEN")
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN or BOT_TOKEN is required")

    logging.basicConfig(level=logging.INFO)
    bot = Bot(token)
    dp = Dispatcher()

    @dp.message(CommandStart())
    async def start(message: Message) -> None:
        await message.answer("Загрузите фото, и я превращу его в раскраску.", reply_markup=main_menu())

    @dp.message(F.text == "Создать раскраску")
    async def create(message: Message) -> None:
        await message.answer("Пришлите JPEG, PNG или WEBP до 20 МБ.")

    @dp.message(F.text == "Мои работы")
    async def works(message: Message) -> None:
        await message.answer("История работ появится после подключения базы данных.")

    @dp.message(F.text == "Купить Premium")
    async def premium(message: Message) -> None:
        await message.answer("Premium скоро будет доступен. Сейчас тестируем запуск бота.")

    @dp.message(F.text == "Поддержка")
    async def support(message: Message) -> None:
        await message.answer("Напишите ваш вопрос одним сообщением, и мы вернемся с ответом.")

    logging.info("Bot polling started")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(run_bot())
