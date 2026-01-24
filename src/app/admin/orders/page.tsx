'use client'
import OrdersClient from "./OrdersClient";
import { useAuth } from 'contexts/AuthContext';



export default  function OrdersPage() {
 const { user} = useAuth();

  // Пример: на основе роли или чего-то ещё выбираем видимость
  const visibility = user?.visibility;


  return <OrdersClient visibility={visibility} />;
}
