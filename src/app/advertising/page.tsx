// app/leaflet-orders/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import LeafletOrdersPage from "./components/LeafletOrdersPage";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const fullName = session?.user?.fullName || "Неизвестный пользователь";

  return <LeafletOrdersPage fullName={fullName} />;
}



