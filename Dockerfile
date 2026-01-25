# === Stage 1: Build ===
FROM node:24-alpine AS builder

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь исходный код
COPY . .

# Копируем env-файлы, если нужны для сборки
COPY .env* ./

# Собираем Next.js
RUN npm run build

# === Stage 2: Production image ===
FROM node:24-alpine AS runner

WORKDIR /app

# Копируем необходимые файлы из билд-стейджа
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Устанавливаем только prod зависимости
RUN npm ci --omit=dev

# Экспонируем порт
EXPOSE 3000

# Команда запуска
CMD ["npm", "run", "start"]

