import { NextRequest, NextResponse } from "next/server";
import { createManager } from "@/server/api/manager/new";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { name, username, visibility, password, role } = data;

    // Передаём visibility только если роль не advertising
    const managerData: any = { name, username, role };
    if (role !== "advertising") {
      managerData.visibility = visibility;
    }
    if (password) {
      managerData.password = password;
    }

    const manager = await createManager(managerData);

    // Не возвращаем пароль в ответе
    const { password: _, ...result } = manager;

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
  
    return NextResponse.json({ error: error.message || "Ошибка сервера" }, { status: 500 });
  }
}
