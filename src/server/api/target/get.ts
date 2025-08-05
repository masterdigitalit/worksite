// server/api/goal/get.ts
import { prisma } from "@/server/db";

export async function getGoal() {
  return await prisma.goal.findUnique({ where: { id: 1 } });
}
