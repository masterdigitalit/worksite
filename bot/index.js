import { Telegraf } from "telegraf";
import cron from "node-cron";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const ADMIN_CHAT_ID = process.env.CHAT_ID;
const API_BASE_URL = process.env.API_BASE_URL;
const SITE_URL = process.env.SITE_URL;

const visitTypeMap = {
  FIRST: "Первичный",
  GARAGE: "Гарантийный",
  FOLLOW_UP: "Повторный",
};

function logWithTime(emoji, message) {
  const time = new Date().toLocaleTimeString("ru-RU");
  console.log(`[${time}] ${emoji} ${message}`);
}

async function notifyUpcomingOrders() {
  try {
    logWithTime("⏰", "Запуск проверки заказов...");

    const res = await fetch(`${API_BASE_URL}/api/telegram`);
    if (!res.ok) throw new Error(`Ошибка API: ${res.status}`);

    const orders = await res.json();

    if (orders.length === 0) {
      logWithTime("🔕", "Нет заказов для уведомления.");
      return;
    }

    for (const order of orders) {
      const msg =
        `🔔 <b>Приближается заявка #${order.id}</b>\n\n` +
        `📅 Дата и время: <i>${new Date(order.arriveDate).toISOString().replace("T", " ").slice(0, 16)}</i>\n` +
        `🚗 Тип визита: <b>${visitTypeMap[order.visitType] || order.visitType}</b>\n` +
        `🏙️ Город: ${order.city}\n` +
        `📍 Адрес: ${order.address}\n` +
        `🛠️ Проблема: ${order.problem}\n` +
        `📞 Телефон: ${order.phone}\n` +
        `👤 Клиент: ${order.fullName}\n\n` +
        `${SITE_URL}/admin/orders/${order.id}"\n\n` +
        `@OxyMilles  @Broke_Name`;

      await bot.telegram.sendMessage(ADMIN_CHAT_ID, msg, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });

      logWithTime("📨", `Отправлено уведомление по заказу #${order.id}`);

      try {
        await fetch(`${API_BASE_URL}/api/telegram`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: order.id }),
        });
        logWithTime("✅", `Заказ #${order.id} отмечен как уведомлённый`);
      } catch (e) {
        logWithTime("❌", `Ошибка обновления заказа #${order.id}: ${e.message}`);
      }
    }

    logWithTime("🎉", "Завершена проверка и уведомления по заказам.");
  } catch (e) {
    logWithTime("🔥", `Ошибка при уведомлении: ${e.message}`);
  }
}

cron.schedule("*/1 * * * *", () => {
  notifyUpcomingOrders();
});
