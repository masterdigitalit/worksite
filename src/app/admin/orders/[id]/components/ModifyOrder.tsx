"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  order: {
    id: number;
    status: string;
    masterId?: number;
    paymentType?: "LOW" | "MEDIUM" | "HIGH";
  };
  setTab: (tab: string) => void;
  refetch: () => void;
}

interface Worker {
  id: number;
  fullName: string;
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
      fetch("/api/workers/getworkers")
        .then((res) => res.json())
        .then(setWorkers)
        .catch(() => toast.error("Ошибка загрузки работников"));
    }
  }, [order.status]);

  useEffect(() => {
    const r = parseInt(received);
    const o = parseInt(outlay);
    if (!isNaN(r) && !isNaN(o)) {
      const profit = r - o;
      let percent = 0.5;
      if (order.paymentType === "LOW") percent = 0.7;
      else if (order.paymentType === "MEDIUM") percent = 0.6;
      const calculated = Math.floor(profit * percent);
      setReceivedWorker(calculated.toString());
    }
  }, [received, outlay, order.paymentType]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const handleAction = async () => {
    if (!nextStatus) return;
    setLoading(true);
    try {
      const payload: Record<string, any> = { status: nextStatus };

      if (nextStatus === "ON_THE_WAY") {
        const worker = workers.find(
          (w) => w.fullName.toLowerCase() === inputValue.toLowerCase()
        );
        if (!worker) {
          toast.error("Работник не найден");
          setLoading(false);
          return;
        }
        payload.masterId = worker.id;
      }

      if (nextStatus === "IN_PROGRESS") {
        payload.dateStarted = new Date().toISOString();
      }

      if (nextStatus === "DONE") {
        const r = parseInt(received);
        const o = parseInt(outlay);
        const rw = parseInt(receivedWorker);

        if (isNaN(r)) return toastError("Введите корректную сумму получена");
        if (isNaN(o)) return toastError("Введите корректные расходы");
        if (isNaN(rw)) return toastError("Введите корректную сумму выплаты мастеру");
        if (!order.masterId) return toastError("Не назначен мастер");
        if (r < o) return toastError("Прибыль должна быть положительной");
        if (rw > r - o) return toastError("Выплата мастеру не может превышать прибыль");

        Object.assign(payload, {
          received: r,
          outlay: o,
          receivedworker: rw,
          dateDone: new Date().toISOString(),
          masterId: order.masterId,
        });
      }

      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Ошибка обновления статуса");
      } else {
        toast.success("Статус успешно обновлен");
        refetch();
        setTab("info");
      }
    } catch (err) {
      toast.error("Ошибка обновления статуса");
      console.error(err);
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
              <button onClick={handleAction} className={greenBtn}>
                Закрыть заказ
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
          />
          <datalist id="workers">
            {workers.map((w) => (
              <option key={w.id} value={w.fullName} />
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
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
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
              className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition"
            >
              Мастер забрал с собой
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
