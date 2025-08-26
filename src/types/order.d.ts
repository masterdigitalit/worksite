const statusMap: Record<string, string> = {
  PENDING: "Ожидает",
  IN_PROGRESS: "В работе",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
};

const visitTypeMap: Record<string, string> = {
  FIRST: "Первичный",
  FOLLOW_UP: "Повторный",
};

const equipmentTypeMap: Record<string, string> = {
  Котёл: "Котёл",
  Кондиционер: "Кондиционер",
  Водонагреватель: "Водонагреватель",
};

interface Order {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  status: string;
  arriveDate: string;
  visitType: string;
  city: string;
  campaign: string;
  equipmentType: string;
  clientPrice: number | null;
  workerPrice: number | null;
  pureCheck: number | null;
  callRequired: boolean;
  documents?: Array<documents>;
  masterId?: number | null;
  received?: number | null;
  outlay?: number | null;
  receivedworker?: number | null;
}

interface documents {
  id: number;
  orderId: string;
  type: string;
  url: string;
}

interface Props {
  params: { id: string };
}

type Tab = "info" | "documents" | "master" | "modify";