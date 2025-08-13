import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface NewManagerData {
  name: string;
  username: string;
  password: string;
  role: "admin" | "advertising"; // добавили role
  visibility?: "MINIMAL" | "PARTIAL" | "ADVERTISING"; // теперь необязательно
}

export async function createManager(data: NewManagerData) {
  const { name, username, visibility, password, role } = data;

  if (!name || !username || !password || password.length < 4) {
    throw new Error("Invalid data");
  }

  // Проверяем, что username уникален
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    throw new Error("Username уже занят");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Формируем объект для prisma
  const prismaData: any = {
    fullName: name,
    username,
    password: hashedPassword,
    role,
  };

  // Добавляем visibility только если роль не advertising
  if (role !== "advertising") {
    if (!visibility) {
      throw new Error("Visibility обязателен для роли admin");
    }
    prismaData.visibility = visibility;
  }

  const manager = await prisma.user.create({
    data: prismaData,
  });

  return manager;
}
