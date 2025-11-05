"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { apiClient } from "lib/api-client";

interface Props {
  order: {
    id: number;
    status: string;
    master?: { id: number } | null;
    payment_type?: "LOW" | "MEDIUM" | "HIGH";
  };
  setTab: (tab: string) => void;
  refetch: () => void;
}

interface Worker {
  id: number;
  full_name: string;
}

export default function ModifyTabContent({ order, setTab, refetch }: Props) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [received, setReceived] = useState("");
  const [outlay, setOutlay] = useState("");
  const [receivedWorker, setReceivedWorker] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (order.status === "PENDING") {
      const fetchWorkers = async () => {
        try {
          const data = await apiClient.get<Worker[]>("/api/v1/workers/");
          setWorkers(data);
        } catch (err) {
          console.error("Failed to fetch workers:", err);
          toast.error("Ошибка загрузки работников");
        }
      };
      fetchWorkers();
    }
  }, [order.status]);
  console.log(workers)

  useEffect(() => {
    const r = parseInt(received);
    const o = parseInt(outlay);
    if (!isNaN(r) && !isNaN(o)) {
      const profit = r - o;
      let percent = 0.5;
      if (order.payment_type === "LOW") percent = 0.7;
      else if (order.payment_type === "MEDIUM") percent = 0.6;
      const calculated = Math.floor(profit * percent);
      setReceivedWorker(calculated.toString());
    }
  }, [received, outlay, order.payment_type]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const handleAction = async () => {
    if (!nextStatus) return;
    setLoading(true);
    try {
      const whoDid = "admin"; // Замените на реального пользователя

      if (nextStatus === "ON_THE_WAY") {
        const worker = workers.find(
          (w) => w.full_name.toLowerCase() === inputValue.toLowerCase()
        );
        if (!worker) {
          toast.error("Работник не найден");
          setLoading(false);
          return;
        }

        await apiClient.patch(
          `/api/v1/orders/${order.id}/set-pending-to-on-the-way/`,
          {
            masterId: worker.id,
            whoDid
          }
        );
      }
      else if (nextStatus === "IN_PROGRESS") {
        await apiClient.patch(
          `/api/v1/orders/${order.id}/set-on-the-way-to-in-progress/`,
          { whoDid }
        );
      }
      else if (nextStatus === "IN_PROGRESS_SD") {
        await apiClient.patch(
          `/api/v1/orders/${order.id}/set-progress-sd/`,
          { whoDid }
        );
      }
      else if (nextStatus === "DONE") {
        const r = parseInt(received);
        const o = parseInt(outlay);
        const rw = parseInt(receivedWorker);
      
        if (isNaN(r)) return toastError("Введите корректную сумму получена");
        if (isNaN(o)) return toastError("Введите корректные расходы");
        if (isNaN(rw)) return toastError("Введите корректную сумму выплаты мастеру");
        if (!order.master?.id) return toastError("Не назначен мастер");
        if (r < o) return toastError("Прибыль должна быть положительной");
        if (rw > r - o) return toastError("Выплата мастеру не может превышать прибыль");

        await apiClient.patch(
          `/api/v1/orders/${order.id}/complete/`,
          {
            received: r,
            outlay: o,
            masterId: order.master.id,
            receivedworker: rw,
            whoDid
          }
        );
      }

      toast.success("Статус успешно обновлен");
      refetch();
      setTab("info");
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      toast.error(err.message || "Ошибка обновления статуса");
    } finally {
      setLoading(false);
    }
  };

  const toastError = (msg: string) => {
    toast.error(msg);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;

    if (step === 1 && received) setStep(2);
    else if (step === 2 && outlay) setStep(3);
    else if (step === 3 && receivedWorker) handleAction();
  };

  const renderForm = () => {
    if (nextStatus !== "DONE") return null;

    const baseBtn = "px-4 py-2 rounded font-medium transition";
    const blueBtn = `${baseBtn} bg-blue-600 text-white hover:bg-blue-700`;
    const greenBtn = `${baseBtn} bg-green-600 text-white hover:bg-green-700`;
    const grayBtn = `${baseBtn} bg-gray-200 hover:bg-gray-300`;

    return (
      <>
        {step === 1 && (
          <div className="space-y-2">
            <label className="block font-medium">Сумма получена</label>
            <input
              type="number"
              ref={inputRef}
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full border px-4 py-2 rounded"
            />
            <button
              disabled={!received}
              onClick={() => setStep(2)}
              className={`${blueBtn} mt-2 disabled:opacity-50`}
            >
              Далее
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <label className="block font-medium">Расходы</label>
            <input
              type="number"
              ref={inputRef}
              value={outlay}
              onChange={(e) => setOutlay(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full border px-4 py-2 rounded"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep(1)} className={grayBtn}>
                Назад
              </button>
              <button
                disabled={!outlay}
                onClick={() => setStep(3)}
                className={`${blueBtn} disabled:opacity-50`}
              >
                Далее
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-2">
            <label className="block font-medium">Выплачено мастеру</label>
            <input
              type="number"
              ref={inputRef}
              value={receivedWorker}
              onChange={(e) => setReceivedWorker(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full border px-4 py-2 rounded"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep(2)} className={grayBtn}>
                Назад
              </button>
              <button 
                onClick={handleAction} 
                disabled={loading}
                className={`${greenBtn} disabled:opacity-50`}
              >
                {loading ? "Закрытие..." : "Закрыть заказ"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4 mt-6">
      {order.status === "PENDING" && (
        <>
          <label className="block font-medium">Назначить работника</label>
          <input
            list="workers"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Введите ФИО мастера"
          />
          <datalist id="workers">
            {workers.map((w) => (
              <option key={w.id} value={w.full_name} />
            ))}
          </datalist>
          <button
            disabled={!inputValue || loading}
            onClick={() => {
              setNextStatus("ON_THE_WAY");
              handleAction();
            }}
            className="px-4 py-2 mt-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Назначение..." : "Назначить"}
          </button>
        </>
      )}

      {order.status === "ON_THE_WAY" && (
        <>
          <p>Подтвердите прибытие мастера</p>
          <button
            onClick={() => {
              setNextStatus("IN_PROGRESS");
              handleAction();
            }}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Обновление..." : "Мастер на месте"}
          </button>
        </>
      )}

      {order.status === "IN_PROGRESS" && (
        <>
          <p>Выберите действие:</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setNextStatus("IN_PROGRESS_SD");
                handleAction();
              }}
              disabled={loading}
              className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition disabled:opacity-50"
            >
              {loading ? "Обновление..." : "Мастер забрал с собой"}
            </button>
            <button
              onClick={() => {
                setNextStatus("DONE");
                setStep(1);
              }}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Закрыть заказ
            </button>
          </div>
          {renderForm()}
        </>
      )}

      {order.status === "IN_PROGRESS_SD" && (
        <>
          <p>Завершение заказа</p>
          {!nextStatus && setNextStatus("DONE")}
          {!step && setStep(1)}
          {renderForm()}
        </>
      )}
    </div>
  );
}