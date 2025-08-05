// server/api/goal/set.ts
import { prisma } from "@/server/db";

export async function setGoal(
  data: { all?: number; month?: number; day?: number },
) {
  const current = await prisma.goal.findUnique({ where: { id: 1 } });

  const updatedFields: Record<string, number | null> = {};
  if (data.all !== undefined && data.all !== current?.all)
    updatedFields.all = data.all;
  if (data.month !== undefined && data.month !== current?.month)
    updatedFields.month = data.month;
  if (data.day !== undefined && data.day !== current?.day)
    updatedFields.day = data.day;

  if (Object.keys(updatedFields).length === 0) {
    throw new Error("Нечего обновлять");
  }

  return await prisma.goal.upsert({
    where: { id: 1 },
    update: updatedFields,
    create: {
      all: data.all ?? 0,
      month: data.month ?? 0,
      day: data.day ?? 0,
    },
  });
}
