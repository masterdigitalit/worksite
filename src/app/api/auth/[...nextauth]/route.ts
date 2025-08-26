import NextAuth from "next-auth";
import { authOptions } from "@/server/api/auth/auth";



const handler = NextAuth(authOptions);

// ✅ App Router требует экспортировать методы явно
export { handler as GET, handler as POST };