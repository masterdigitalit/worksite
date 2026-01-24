// app/leaflet-orders/page.tsx
'use client'
import LeafletOrdersPage from "./components/LeafletOrdersPage";
import { useAuth } from 'contexts/AuthContext';





export default  function Page() {
   const { user} = useAuth();
  
  const fullName = user?.fullName || "Неизвестный пользователь";

  return <LeafletOrdersPage fullName={fullName} />;
}



