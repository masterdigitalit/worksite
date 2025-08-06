// server/api/orders/new.ts
import { prisma } from "@/server/db";

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
  paymentType:string;
}) {
  return prisma.order.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      city: {
        connect: {
          id: parseInt( data.city),
        },
      },

      problem: data.problem,
      arriveDate: new Date(data.arriveDate),
      visitType: data.visitType,
      callRequired: data.callRequired,
      isProfessional: data.isProfessional,
      equipmentType: data.equipmentType,
      status: "PENDING",
      paymentType:data.paymentType,
    },
  });
}
