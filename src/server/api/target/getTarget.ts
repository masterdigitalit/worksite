import { prisma } from "@/server/db";

export default async function getTarget() {
	return prisma.Goal.findMany()
		
}