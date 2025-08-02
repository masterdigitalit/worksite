import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/server/db";
import { string } from "zod/v4";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },


async authorize(credentials) {
  const user = await prisma.user.findUnique({
    where: { username: credentials?.username },
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(credentials!.password, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    name: user.username,
    role: user.role,
    fullName: user.fullName, // 👈 добавлено!
    visibility: user.visibility
  };
}
,
    }),
  ],
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = (user as any).role;
      token.visibility = (user as any).visibility;
      token.fullName = (user as any).fullName; // 👈
    }
    return token;
  },
  async session({ session, token }) {
    session.user.role = token.role as string;
    session.user.visibility =  token.visibility as string;
    session.user.fullName = token.fullName as string; // 👈
    return session;
  },
},
  pages: {
    signIn: "/login",
  },
};
