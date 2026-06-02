"use strict";

const TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.BOT_TOKEN ||
  process.env.TELEGRAM_TOKEN;

if (!TOKEN) {
  console.error("Missing bot token. Add TELEGRAM_BOT_TOKEN in BotHost environment variables.");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;
let offset = 0;
let handled = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function menu() {
  return {
    keyboard: [
      [{ text: "Создать раскраску" }],
      [{ text: "Мои работы" }, { text: "Купить Premium" }],
      [{ text: "Поддержка" }],
    ],
    resize_keyboard: true,
  };
}

async function callTelegram(method, payload = {}) {
  const response = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    const details = data ? JSON.stringify(data) : await response.text().catch(() => "");
    throw new Error(`${method} failed: HTTP ${response.status} ${details}`);
  }
  return data.result;
}

async function reply(chatId, text, replyMarkup) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || "";

  if (text === "/start") {
    await reply(chatId, "Загрузите фото, и я превращу его в раскраску.", menu());
  } else if (text === "Создать раскраску") {
    await reply(chatId, "Пришлите фото в формате JPEG, PNG или WEBP до 20 МБ.");
  } else if (text === "Мои работы") {
    await reply(chatId, "История работ появится после подключения базы данных.");
  } else if (text === "Купить Premium") {
    await reply(chatId, "Premium скоро будет доступен. Сейчас проверяем стабильный запуск бота.");
  } else if (text === "Поддержка") {
    await reply(chatId, "Напишите ваш вопрос одним сообщением.");
  } else if (message.photo || message.document) {
    await reply(chatId, "Фото получено. Генерацию раскрасок подключим следующим шагом.");
  } else {
    await reply(chatId, "Нажмите «Создать раскраску» или отправьте /start.", menu());
  }

  handled += 1;
  console.log(`Handled message #${handled} from chat ${chatId}`);
}

async function poll() {
  while (true) {
    try {
      const updates = await callTelegram("getUpdates", {
        offset,
        timeout: 45,
        allowed_updates: ["message"],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) {
          await handleMessage(update.message);
        }
      }
    } catch (error) {
      console.error(error.message || error);
      await sleep(3000);
    }
  }
}

async function start() {
  const me = await callTelegram("getMe");
  await callTelegram("deleteWebhook", { drop_pending_updates: true });
  console.log(`Bot polling started for @${me.username}`);
  await poll();
}

process.on("SIGTERM", () => {
  console.log("SIGTERM received, stopping bot");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, stopping bot");
  process.exit(0);
});

start().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
