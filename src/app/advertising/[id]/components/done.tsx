"use client";

interface Props {
  given: number | null;
  returned: number | null;
  profit: number | null;
}

export default function DoneSummary({ given, returned, profit, order }: Props) {
  return (
    <div className="mt-6 p-4 bg-gray-50 border rounded-xl">
      <h2 className="font-semibold mb-2 text-lg">📊 Результаты</h2>
      <p><strong>Раздал:</strong> {given ?? "-"}</p>
      <p><strong>Вернул:</strong> {returned ?? "-"}</p>
      <p><strong>Заработал:</strong> {profit ?? "-"}</p>
      
      <a href={'/distribution/' + order.paymentPhoto} target="_blank" rel="noopener noreferrer">Фото оплаты</a>
         
        
    </div>
  );
}
