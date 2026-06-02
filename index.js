const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN or BOT_TOKEN is required");
  process.exit(1);
}

const apiBase = `https://api.telegram.org/bot${token}`;
let offset = 0;

function mainKeyboard() {
  return {
    keyboard: [
      [{ text: "Создать раскраску" }],
      [{ text: "Мои работы" }, { text: "Купить Premium" }],
      [{ text: "Поддержка" }],
    ],
    resize_keyboard: true,
  };
}

async function telegram(method, body = {}) {
  const response = await fetch(`${apiBase}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(`${method} failed: ${JSON.stringify(payload)}`);
  }
  return payload.result;
}

async function sendMessage(chatId, text, replyMarkup) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || "";

  if (text === "/start") {
    await sendMessage(chatId, "Загрузите фото, и я превращу его в раскраску.", mainKeyboard());
    return;
  }

  if (text === "Создать раскраску") {
    await sendMessage(chatId, "Пришлите JPEG, PNG или WEBP до 20 МБ.");
    return;
  }

  if (text === "Мои работы") {
    await sendMessage(chatId, "История работ появится после подключения базы данных.");
    return;
  }

  if (text === "Купить Premium") {
    await sendMessage(chatId, "Premium скоро будет доступен. Сейчас тестируем запуск бота.");
    return;
  }

  if (text === "Поддержка") {
    await sendMessage(chatId, "Напишите ваш вопрос одним сообщением, и мы вернемся с ответом.");
    return;
  }

  if (message.photo || message.document) {
    await sendMessage(chatId, "Фото получено. Генерацию раскрасок подключим следующим шагом.");
    return;
  }

  await sendMessage(chatId, "Нажмите «Создать раскраску» или отправьте /start.", mainKeyboard());
}

async function poll() {
  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: 50,
        allowed_updates: ["message"],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) {
          await handleMessage(update.message);
        }
      }
    } catch (error) {
      console.error(error);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function start() {
  const me = await telegram("getMe");
  await telegram("deleteWebhook", { drop_pending_updates: true });
  console.log(`Bot polling started for @${me.username}`);
  await poll();
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
