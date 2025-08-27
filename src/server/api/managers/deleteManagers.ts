import { prisma } from "@/server/db";

export async function deleteManager(id: string) {
  // сначала удаляем все сессии, потом пользователя
  await prisma.session.deleteMany({
    where: { userId: id },
  });

  const user = await prisma.user.delete({
    where: { id },
  });

  return user; // можно вернуть удалённого пользователя
}
