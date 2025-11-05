// bot.ts
import { Telegraf } from "telegraf";
import cron from "node-cron";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
const ADMIN_CHAT_ID = process.env.CHAT_ID!;
const API_BASE_URL = process.env.API_BASE_URL!;
const SITE_URL = process.env.SITE_URL!;
const OWNER_ID = Number(process.env.OWNER_ID!) || 5273914742;

const bot = new Telegraf(TELEGRAM_TOKEN);

type VisitType = "FIRST" | "GARAGE" | "FOLLOW_UP";
const visitTypeMap: Record<VisitType, string> = {
  FIRST: "Первичный",
  GARAGE: "Гарантийный",
  FOLLOW_UP: "Повторный",
};

interface Order {
  id: number;
  arriveDate: string;
  visitType: VisitType;
  city?: { name: string } | string;
  address: string;
  problem: string;
  phone: string;
  fullName: string;
  leaflet?: { name?: string };
}

function logWithTime(emoji: string, message: string) {
  const time = new Date().toLocaleTimeString("ru-RU");
  console.log(`[${time}] ${emoji} ${message}`);
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

// ======================
// 📨 Notify upcoming orders
// ======================
export async function notifyUpcomingOrders() {
  try {
    logWithTime("⏰", "Запуск проверки заказов...");
    const res = await fetch(`${API_BASE_URL}/api/telegram`);
    if (!res.ok) throw new Error(`Ошибка API: ${res.status}`);
    const orders: Order[] = await res.json();

    if (!orders.length) {
      logWithTime("🔕", "Нет заказов для уведомления.");
      return;
    }

    for (const order of orders) {
      const msg = `🔔 <b>Приближается заявка #${order.id}</b>\n\n` +
        `📅 Дата и время: <i>${formatDate(order.arriveDate)}</i>\n` +
        `🚗 Тип визита: <b>${visitTypeMap[order.visitType]}</b>\n` +
        `🏙️ Город: ${order.city?.name || order.city}\n` +
        `📍 Адрес: ${order.address}\n` +
        `🛠️ Проблема: ${order.problem}\n` +
        `📞 Телефон: ${order.phone}\n` +
        `👤 Клиент: ${order.fullName}\n` +
        `Листовка - ${order.leaflet?.name || "Не указана"}\n\n` +
        `${SITE_URL}/admin/orders/${order.id}\n\n` +
        `@Broke_Name   @OxyMilles`;

      await bot.telegram.sendMessage(ADMIN_CHAT_ID, msg, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });

      logWithTime("📨", `Отправлено уведомление по заказу #${order.id}`);

      try {
        await fetch(`${API_BASE_URL}/api/telegram`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: order.id }),
        });
        logWithTime("✅", `Заказ #${order.id} отмечен как уведомлённый`);
      } catch (e: any) {
        logWithTime("❌", `Ошибка обновления заказа #${order.id}: ${e.message}`);
      }
    }
    logWithTime("🎉", "Завершена проверка уведомлений.");
  } catch (e: any) {
    logWithTime("🔥", `Ошибка при уведомлении: ${e.message}`);
  }
}

// ======================
// ❤️ Heartbeat
// ======================
async function heartbeat() {
  try {
    await bot.telegram.sendMessage(OWNER_ID, "✅ Бот работает стабильно", {
      disable_notification: true,
    });
    logWithTime("💚", "Отправлен heartbeat");
  } catch (e: any) {
    logWithTime("💔", "Ошибка heartbeat: " + e.message);
  }
}

// ======================
// 📸 Функция отправки фото
// ======================
export async function sendPhotoToAdmin(filePath: string, caption: string) {
  console.log(filePath, caption)
  try {
    await bot.telegram.sendMessage(ADMIN_CHAT_ID,caption)
    logWithTime("✅", `Фото ${filePath} отправлено в чат`);
  } catch (err) {
    console.error("❌ Ошибка при отправке фото:", err);
  }
}

// ======================
// 🛠 Команды бота
// ======================
bot.command("notify", async ctx => {
  if (ctx.from?.id !== OWNER_ID) return ctx.reply("⛔ У тебя нет прав");
  await bot.telegram.sendMessage(ADMIN_CHAT_ID, "⚠️ Плановое отключение через 10 минут", { parse_mode: "HTML" });
  await ctx.reply("✅ Уведомление отправлено");
});

bot.command("work", async ctx => {
  if (ctx.from?.id !== OWNER_ID) return ctx.reply("⛔ У тебя нет прав");
  await bot.telegram.sendMessage(ADMIN_CHAT_ID, "✅ Сайт снова работает!", { parse_mode: "HTML" });
  await ctx.reply("✅ Сообщение отправлено");
});

bot.command("callback", async ctx => {
  if (ctx.from?.id !== OWNER_ID) return ctx.reply("⛔ У тебя нет прав");
  await bot.telegram.sendMessage(OWNER_ID, "✅ Сайт работает стабильно", { parse_mode: "HTML" });
});

// ======================
// 🕒 Cron задачи
// ======================
// cron.schedule("0 */4 * * *", heartbeat);
// cron.schedule("*/30 * * * *", notifyUpcomingOrders);

// ======================
// 🚀 Запуск бота
// ======================
// bot.launch().then(() => logWithTime("🤖", "Бот запущен и готов к работе."));
