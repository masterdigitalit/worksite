// /server/api/Distributor/new.ts
import { prisma } from "@/server/db";
import { Create } from "@/server/api/logs/create";
export async function createDistributor(data: {
  fullName: string;
  phone: string;
  telegram: string;
  state?: "IN_PROCESS" 
 invitedBy:string
}) {
  await Create({whoDid: data.invitedBy, whatHappend:`Добавил работника ${data.fullName}`,type: 'advertising'})

  return prisma.distributor.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      telegram: data.telegram,
      invitedBy:data.invitedBy
      
    },
  });
}
