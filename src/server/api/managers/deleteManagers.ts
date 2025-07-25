import { prisma } from "@/server/db";

export async function deleteManage(id: number) {
  return prisma.user.delete({
    where: { id },
  });
}
