import { prisma } from "@/server/db";
import { Create } from "../logs/create";
interface CompleteLeafletOrderInput {
	id: number;
	quantity:number;
	  whoDid : string;
}

export async function editLeafletOrder({
	id,
	quantity,
	whoDid
}: CompleteLeafletOrderInput) {
	 
await Create({
	whoDid,
	whatHappend: `Изменен заказ ${id}: выдали ${quantity}`,
	type: "advertising",
});

return prisma.leafletOrder.update({
	where: {  id },
	data: {
	 quantity,
	
	},
	});

}