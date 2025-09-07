import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  // Пример: на основе роли или чего-то ещё выбираем видимость
  const visibility = session?.user?.visibility 


  return <OrdersClient visibility={visibility} />;
}
