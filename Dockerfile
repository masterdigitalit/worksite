# === Stage 1: Build ===
FROM node:24-alpine AS builder

ENV NODE_OPTIONS="--max-old-space-size=1024"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
COPY .env* ./

RUN npm run build

# === Stage 2: Production ===
FROM node:24-alpine AS runner

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
