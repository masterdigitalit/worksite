"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Package } from "lucide-react";

interface Props {
  submitting: boolean;
  onFinish: (state: string, extraData?: { distributed?: number; returned?: number }) => void;
}

export default function InProcessActions({ submitting, onFinish }: Props) {
  const [finishMode, setFinishMode] = useState<null | "partial">(null);
  const [distributed, setDistributed] = useState<number | "">("");
  const [returned, setReturned] = useState<number | "">("");

  if (finishMode === "partial") {
    return (
         <div className="space-y-3 mt-8">
        <input
          type="number"
          placeholder="Сколько раздал"
          className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
          value={distributed}
          onChange={(e) => setDistributed(e.target.value ? Number(e.target.value) : "")}
        />
        <input
          type="number"
          placeholder="Сколько вернул"
          className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
          value={returned}
          onChange={(e) => setReturned(e.target.value ? Number(e.target.value) : "")}
        />

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (distributed === "" || returned === "") {
                alert("Заполни оба поля");
                return;
              }
              onFinish("", { distributed: Number(distributed), returned: Number(returned) });
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={submitting}
          >
            Отправить
          </button>

          <button
            onClick={() => {
              setFinishMode(null);
              setDistributed("");
              setReturned("");
            }}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mt-8">
      <button
        onClick={() => onFinish("success")}
        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        disabled={submitting}
      >
        <CheckCircle className="w-5 h-5" /> Раздал всё
      </button>

      <button
        onClick={() => setFinishMode("partial")}
        className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        disabled={submitting}
      >
        <Package className="w-5 h-5" /> Частично
      </button>

      <button
        onClick={() => onFinish("cancelled")}
        className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        disabled={submitting}
      >
        <XCircle className="w-5 h-5" /> Отмена
      </button>
    </div>
  );
}
