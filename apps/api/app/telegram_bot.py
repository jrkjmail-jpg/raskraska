from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import KeyboardButton, Message, ReplyKeyboardMarkup

from app.config import get_settings


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
    settings = get_settings()
    bot = Bot(settings.telegram_bot_token)
    dp = Dispatcher()

    @dp.message(CommandStart())
    async def start(message: Message) -> None:
        await message.answer("Загрузите фото, и я превращу его в раскраску.", reply_markup=main_menu())

    @dp.message(F.text == "Создать раскраску")
    async def create(message: Message) -> None:
        await message.answer("Пришлите JPEG, PNG или WEBP до 20 МБ.")

    await dp.start_polling(bot)
