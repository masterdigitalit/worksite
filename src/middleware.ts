

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const url = req.nextUrl.clone();

      // если вообще нет токена → редиректим
      if (!token) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
        if (!token?.jti) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      // если нет dbToken (мы кладём его в jwt как token.dbToken) → старая авторизация
      if (!token.dbToken) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      // проверяем роль и путь
      const role = token.role as string | undefined;
      const path = url.pathname;

      if (path.startsWith("/admin")) {
        if (role !== "admin") {
          url.pathname = "/login";
          return NextResponse.redirect(url);
        }
      }

      if (path.startsWith("/advertising")) {
        if (!(role === "admin" || role === "advertising")) {
          url.pathname = "/login";
          return NextResponse.redirect(url);
        }
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/advertising/:path*"],
};
