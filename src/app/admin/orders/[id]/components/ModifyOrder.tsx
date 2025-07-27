"use client";

import { useEffect, useState } from "react";

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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inProgressNextStep, setInProgressNextStep] = useState<"IN_PROGRESS_SD" | "DONE" | null>(null);

  useEffect(() => {
    if (order.status === "PENDING") {
      fetch("/api/workers/getworkers")
        .then((res) => res.json())
        .then((data) => setWorkers(data))
        .catch((err) => console.error("Ошибка загрузки работников:", err));
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
      else if (order.paymentType === "HIGH") percent = 0.5;

      const calculated = Math.floor(profit * percent);
            console.log(r, o, percent, calculated)
      setReceivedWorker(calculated.toString());
    }
  }, [received, outlay, order.paymentType]);

  const handleAction = async () => {
    setLoading(true);
    try {
      let payload: Record<string, any> = {};

      switch (order.status) {
        case "PENDING": {
          const worker = workers.find(
            (w) => w.fullName.toLowerCase() === inputValue.toLowerCase()
          );
          if (!worker) {
            setLoading(false);
            return;
          }

          payload = {
            masterId: worker.id,
            status: "ON_THE_WAY",
          };
          break;
        }

        case "ON_THE_WAY":
          payload = { status: "IN_PROGRESS", dateStarted: new Date().toISOString() };
          break;

        case "IN_PROGRESS": {
          if (!inProgressNextStep) {
            setLoading(false);
            return;
          }
          if (inProgressNextStep === "IN_PROGRESS_SD") {
            payload = { status: "IN_PROGRESS_SD" };
          } else if (inProgressNextStep === "DONE") {
            if (!received || !outlay || !receivedWorker || !order.masterId) {
              setLoading(false);
              return;
            }
            payload = {
              status: "DONE",
              received: parseInt(received),
              outlay: parseInt(outlay),
              receivedworker: parseInt(receivedWorker),
              dateDone: new Date().toISOString(),
              masterId: order.masterId,
            };
          }
          break;
        }

        case "IN_PROGRESS_SD": {
          if (!received || !outlay || !receivedWorker || !order.masterId) {
            setLoading(false);
            return;
          }
          payload = {
            status: "DONE",
            received: parseInt(received),
            outlay: parseInt(outlay),
            receivedworker: parseInt(receivedWorker),
            dateDone: new Date().toISOString(),
            masterId: order.masterId,
          };
          break;
        }

        default:
          setLoading(false);
          return;
      }
      console.log(payload)

      await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      refetch();
      setTab("info");
    } catch (err) {
      console.error("Ошибка обновления статуса:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderSteps = () => {
    switch (step) {
      case 1:
        return (
          <>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Сумма получена
            </label>
            <input
              type="number"
              className="w-full rounded border px-4 py-2"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              placeholder="Введите сумму"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!received}
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              Далее
            </button>
          </>
        );
      case 2:
        return (
          <>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Расходы
            </label>
            <input
              type="number"
              className="w-full rounded border px-4 py-2"
              value={outlay}
              onChange={(e) => setOutlay(e.target.value)}
              placeholder="Введите расходы"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setStep(1)}
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 transition"
              >
                Назад
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!outlay}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                Далее
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Мастеру выплачено
            </label>
            <input
              type="number"
              className="w-full rounded border px-4 py-2"
              value={receivedWorker}
              onChange={(e) => setReceivedWorker(e.target.value)}
              placeholder="Авторасчёт на основе прибыли"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setStep(2)}
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 transition"
              >
                Назад
              </button>
              <button
                onClick={handleAction}
                disabled={loading || !receivedWorker}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Закрытие..." : "Закрыть заказ"}
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {order.status === "PENDING" && (
        <>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Назначить работника
          </label>
          <input
            list="workers"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Введите или выберите работника"
            className="w-full rounded border px-4 py-2"
          />
          <datalist id="workers">
            {workers.map((worker) => (
              <option key={worker.id} value={worker.fullName} />
            ))}
          </datalist>
          <button
            onClick={handleAction}
            disabled={!inputValue || loading}
            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Назначение..." : "Назначить"}
          </button>
        </>
      )}

      {order.status === "ON_THE_WAY" && (
        <>
          <p className="text-sm text-gray-700">Подтвердите прибытие мастера:</p>
          <button
            onClick={handleAction}
            disabled={loading}
            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Обновление..." : "Мастер на месте"}
          </button>
        </>
      )}

      {order.status === "IN_PROGRESS" && (
        <>
          <p className="text-sm text-gray-700 font-medium mb-2">Выберите действие:</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setInProgressNextStep("IN_PROGRESS_SD");
                setStep(0);
                handleAction();
              }}
              disabled={loading}
              className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 transition"
            >
              Мастер забрал с собой
            </button>
            <button
              onClick={() => {
                setInProgressNextStep("DONE");
                setStep(1);
              }}
              disabled={loading}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
            >
              Закрыть заказ
            </button>
          </div>

          {step > 0 && renderSteps()}
        </>
      )}

      {order.status === "IN_PROGRESS_SD" && (
        <>
          <p className="text-sm text-gray-700 font-medium mb-2">Завершение заказа</p>
          {renderSteps()}
        </>
      )}
    </div>
  );
}
