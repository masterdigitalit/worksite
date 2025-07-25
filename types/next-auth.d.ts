// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email?: string;
      image?: string;
      role?: string;
      fullName?: string; // 👈 добавляем
    };
  }

  interface User {
    role?: string;
    fullName?: string; // 👈 добавляем
  }
}





export {};
