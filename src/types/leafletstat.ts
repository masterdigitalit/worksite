interface LeafletStatsProps {
  stats: {
    IN_PROCESS: number;
    FORPAYMENT: number;
    DONE: number;
    CANCELLED: number;
    DECLINED: number;
    totalDistributorProfitTOpay: number;
    totalDistributorProfitPaid: number;
  };
}

const statusesUI = {
  IN_PROCESS: { label: "В процессе", color: "text-yellow-600" },
  FORPAYMENT: { label: "Ожидает оплаты", color: "text-orange-600" },
  DONE: { label: "Выполнено", color: "text-green-600" },
  CANCELLED: { label: "Отменено", color: "text-gray-500" },
  DECLINED: { label: "Отклонено", color: "text-red-600" },
};