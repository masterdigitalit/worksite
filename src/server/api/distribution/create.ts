import { prisma } from "@/server/db";
import { LeafletOrderState } from "@prisma/client";
export async function createLeafletOrder(data: {
  profitType: "MKD" | "CHS";
  quantity: number;
  leafletId: number;
  cityId: number;
  distributorId: number;
}) {
  return await prisma.$transaction(async (tx) => {
    // Проверяем наличие листовки
    const leaflet = await tx.leaflet.findUnique({
      where: { id: data.leafletId },
      select: { value: true },
    });

    if (!leaflet) {
      throw new Error("Листовка не найдена");
    }

    if (leaflet.value < data.quantity) {
      throw new Error("Недостаточно листовок на складе");
    }

    // Создаём заказ с фиксированным state
    const order = await tx.leafletOrder.create({
      data: {
        profitType: data.profitType,
        quantity: data.quantity,
        leafletId: data.leafletId,
        cityId: data.cityId,
        distributorId: data.distributorId,
        state: LeafletOrderState.IN_PROGRESS,
      },
    });

    // Обновляем количество в листовке
    await tx.leaflet.update({
      where: { id: data.leafletId },
      data: {
        value: {
          decrement: data.quantity,
        },
      },
    });

    return order;
  });
}
