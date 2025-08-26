// НЕ переименовывай файл: next-auth.d.ts
// Убедись, что он попадает в tsconfig ("include": ["src", ...])

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      role?: string;
      fullName?: string;
      visibility?: string;
      token?: string;       // <- токен из БД (наш клейм)
      expiresAt?: string;   // <- ISO строка
    };
  }

  interface User {
    id: string;
    role?: string;
    fullName?: string;
    visibility?: string;
    token?: string;         // <- вернём из authorize
    expiresAt?: Date;       // <- вернём из authorize
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    fullName?: string;
    visibility?: string;
    dbToken?: string;       // <- НАШЕ поле, не jti!
    expiresAt?: string;
    valid?: boolean;
  }
}
