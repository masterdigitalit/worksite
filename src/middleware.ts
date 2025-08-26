import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function checkRole(token: any, allowedRoles: string[]) {
  if (!token) return false;
  return allowedRoles.includes(token.role);
}

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const url = req.nextUrl.clone();

      // Ограничение по маршрутам
      const path = req.nextUrl.pathname;

      // /admin доступ только admin
      if (path.startsWith("/admin") && !checkRole(token, ["admin"])) {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      // /manager доступ только manager
      if (path.startsWith("/manager") && !checkRole(token, ["manager"])) {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*"],
};
