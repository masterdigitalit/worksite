import { prisma } from "@/server/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { id } from "zod/v4/locales";

dayjs.extend(utc);

export async function getUpcomingOrders() {
  const now = dayjs().utc(); // текущее UTC-время
  const fourHoursLater = now.add(5, "hour");

  const orders = await prisma.order.findMany({
    where: {
      isNotificated : false,
      arriveDate: {
        gte: now.toDate(),
        lte: fourHoursLater.toDate(),
      },
      status: {
        notIn: ["DONE", "DECLINED"],
      },
      
    },
     include: { city: true, leaflet:true },
  });

  return orders;
  
}



export async function markOrderAsNotificated(Id: number) {

  return await prisma.order.update({
    where: { id: Id },
    data: { isNotificated: true },
  });
}