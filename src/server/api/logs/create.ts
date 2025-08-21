import { prisma } from "@/server/db";

type LogType = "orders" | "advertising" | "accounts";

interface CompleteLeafletOrderInput {	
  whoDid: string;
  whatHappend: string;
  type: LogType;
}

export async function Create({ whoDid, whatHappend, type }: CompleteLeafletOrderInput) {
  return prisma.logs.create({
    data: {
      whoDid,
      whatHappend,
      type,
    },
  });
}
