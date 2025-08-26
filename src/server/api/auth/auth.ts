import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/server/db";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // обязателен для стабильных JWT
  debug: false, // можешь включить true при отладке

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
        lat: { label: "Latitude", type: "text" },
        lng: { label: "Longitude", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        // 1) Находим пользователя
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user) return null;

        // 2) Проверка пароля
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // 3) Генерим и сохраняем сессию в твоей таблице
        const sessionToken = randomUUID();
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        // user-agent и ip корректно в разных рантаймах
        const headers: Record<string, string | string[] | undefined> =
          // @ts-expect-error — в Node это IncomingMessage, в App Router — Request-like
          req?.headers ?? {};

        const userAgent =
          (typeof headers.get === "function"
            ? headers.get("user-agent")
            : (headers["user-agent"] as string | undefined)) || null;

        const xffRaw =
          (typeof headers.get === "function"
            ? headers.get("x-forwarded-for")
            : (headers["x-forwarded-for"] as string | undefined)) || "";

        // @ts-expect-error может отсутствовать в Edge
        const socketIp = req?.socket?.remoteAddress as string | undefined;

        const ip =
          (Array.isArray(xffRaw) ? xffRaw[0] : xffRaw)?.toString() ||
          socketIp ||
          null;

        const sessionInDb = await prisma.session.create({
          data: {
            userId: user.id,
            token: sessionToken,             // <- ЭТО ТОКЕН ИЗ БД
            valid: true,
            latitude: credentials.lat ? parseFloat(credentials.lat) : null,
            longitude: credentials.lng ? parseFloat(credentials.lng) : null,
            expiresAt: expires,
            userAgent,
            ip,
          },
        });

        console.log("[authorize] created DB session:", {
          userId: user.id,
          token: sessionInDb.token,
          expiresAt: sessionInDb.expiresAt.toISOString(),
        });

        // 4) Возвращаем объект пользователя + наш токен БД
        return {
          id: user.id,
          name: user.username,
          role: user.role,
          fullName: user.fullName,
          visibility: user.visibility,
          token: sessionInDb.token,     // <- вернётся в jwt(user)
          expiresAt: sessionInDb.expiresAt,
        };
      },
    }),
  ],

  callbacks: {
    // Содержимое JWT — живёт в cookie (jwt strategy)
    async jwt({ token, user }) {
      if (user) {
        // Первый вход (signIn)
        token.id = user.id;
        token.role = user.role;
        token.fullName = user.fullName;
        token.visibility = user.visibility;

        // КЛЮЧЕВОЕ: кладём токен БД в СВОЁ поле, не jti
        token.dbToken = user.token;
        token.expiresAt = user.expiresAt?.toISOString();
        token.valid = true;

        console.log("[jwt][login] set dbToken from user:", token.dbToken);
      } else {
        // Рефреш/любые последующие запросы — ничего не трогаем
        // (dbToken остаётся прежним)
        // Можно опционально проверять валидность в БД:
        // if (token.dbToken) {
        //   const db = await prisma.session.findUnique({ where: { token: token.dbToken } });
        //   if (!db || !db.valid || db.expiresAt < new Date()) {
        //     // инвалидируем
        //     token.valid = false;
        //   }
        // }
      }
      return token;
    },

    // То, что уйдёт на клиент через useSession()/getServerSession()
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
        session.user.visibility = token.visibility as string;

        // КЛЮЧЕВОЕ: прокидываем токен из БД в сессию пользователя
        session.user.token = token.dbToken as string | undefined;
        session.user.expiresAt = token.expiresAt as string | undefined;

        console.log("[session] user.token (from dbToken):", session.user.token);
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  // Мы используем JWT-стратегию. Токен куки — это весь JWT,
  // он НЕ обязан совпадать со значением из твоей таблицы.
  // Совпадает именно session.user.token === токен из БД (dbToken).
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
};

export default NextAuth(authOptions);
