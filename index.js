"use strict";

const TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.BOT_TOKEN ||
  process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini";

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

async function getTelegramFile(fileId) {
  const file = await callTelegram("getFile", { file_id: fileId });
  const response = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`);
  if (!response.ok) {
    throw new Error(`Telegram file download failed: HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    bytes: new Uint8Array(arrayBuffer),
    name: file.file_path.split("/").pop() || "photo.jpg",
  };
}

function promptForColoringPage() {
  return [
    "Create a clean black-and-white coloring book page from the uploaded image.",
    "Requirements:",
    "- white background",
    "- thick black outlines",
    "- no grayscale",
    "- no shading",
    "- no shadows",
    "- no color",
    "- printable coloring book style",
    "- preserve likeness of the subject",
    "- child-friendly design",
    "- large coloring areas",
    "- simplified details",
    "Output must look like a professional coloring book page.",
  ].join("\n");
}

async function createColoringPage(imageBytes, fileName) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing in BotHost environment variables.");
  }

  const formData = new FormData();
  formData.append("model", OPENAI_IMAGE_MODEL);
  formData.append("prompt", promptForColoringPage());
  formData.append("size", "1024x1024");
  formData.append("output_format", "png");
  formData.append("image", new Blob([imageBytes], { type: "image/jpeg" }), fileName);

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data?.[0]?.b64_json) {
    throw new Error(`OpenAI image edit failed: HTTP ${response.status} ${JSON.stringify(payload)}`);
  }

  return Buffer.from(payload.data[0].b64_json, "base64");
}

async function reply(chatId, text, replyMarkup) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

async function sendPhoto(chatId, pngBuffer, caption) {
  const formData = new FormData();
  formData.append("chat_id", String(chatId));
  if (caption) {
    formData.append("caption", caption);
  }
  formData.append("photo", new Blob([pngBuffer], { type: "image/png" }), "raskraska.png");

  const response = await fetch(`${API}/sendPhoto`, {
    method: "POST",
    body: formData,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(`sendPhoto failed: HTTP ${response.status} ${JSON.stringify(payload)}`);
  }
}

async function generateFromMessage(message) {
  const chatId = message.chat.id;
  await reply(chatId, "Фото получено. Делаю раскраску, обычно это занимает 5-15 секунд.");

  const photo = message.photo?.[message.photo.length - 1];
  const document = message.document;
  const fileId = photo?.file_id || document?.file_id;
  if (!fileId) {
    await reply(chatId, "Не нашел файл изображения. Пришлите фото или документ JPEG/PNG/WEBP.");
    return;
  }

  const file = await getTelegramFile(fileId);
  const png = await createColoringPage(file.bytes, file.name);
  await sendPhoto(chatId, png, "Готово. Вот ваша раскраска.");
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
    await generateFromMessage(message);
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
          try {
            await handleMessage(update.message);
          } catch (error) {
            console.error(error.message || error);
            await reply(
              update.message.chat.id,
              "Не получилось создать раскраску. Проверьте OPENAI_API_KEY в BotHost и попробуйте еще раз."
            ).catch((replyError) => console.error(replyError.message || replyError));
          }
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
  console.log(`OpenAI image model: ${OPENAI_IMAGE_MODEL}`);
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
