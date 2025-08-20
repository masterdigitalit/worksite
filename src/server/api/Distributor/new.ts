// /server/api/Distributor/new.ts
import { prisma } from "@/server/db";

export async function createDistributor(data: {
  fullName: string;
  phone: string;
  telegram: string;
  state?: "IN_PROCESS" 
 invitedBy:string
}) {

  return prisma.distributor.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      telegram: data.telegram,
      invitedBy:data.invitedBy
      
    },
  });
}
