// server/api/orders/new.ts
import { prisma } from "@/server/db";
import { Create } from "../logs/create";

export async function createNewOrder(data: {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  problem: string;
  arriveDate: string;
  visitType: string;
  callRequired: boolean;
  isProfessional: boolean;
  equipmentType: string;
  paymentType: string;
  leaflet: string;
  whoDid:string
}) {
  console.log(data)
   
const order = await prisma.order.create({
  data: {
    fullName: data.fullName,
    phone: data.phone,
    address: data.address,
    city: {
      connect: {
        id: parseInt(data.city),
      },
    },
    leaflet: {
      connect: {
        id: parseInt(data.leaflet),
      },
    },
    problem: data.problem,
    arriveDate: new Date(data.arriveDate),
    visitType: data.visitType,
    callRequired: data.callRequired,
    isProfessional: data.isProfessional,
    equipmentType: data.equipmentType,
    status: "PENDING",
    paymentType: data.paymentType,
  },
});

await Create({
  whoDid: data.whoDid,
  whatHappend: `Создал заказ <a href="https://tamsyam.su/admin/orders/${order.id}" target="_blank">#${order.id}</a>`,
  type: "orders",
});
return order;
}

