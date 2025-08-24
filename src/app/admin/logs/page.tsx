"use client";

import { useEffect, useState } from "react";

interface Log {
  id: number;
  whoDid: string | null;
  whatHappend: string | null;
  type: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("/api/logs");
      if (res.ok) {
        setLogs(await res.json());
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Журнал действий</h1>
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border rounded-lg p-3 shadow-sm bg-gray-50"
          >
            <div className="flex justify-between">
              <span className="font-semibold text-blue-600">{log.type}</span>
              <span className="text-sm text-gray-500">#{log.id}</span>
            </div>
            <div className="mt-1">
              <p>
                <span className="font-medium">Кто:</span> {log.whoDid ?? "—"}
              </p>
              <p>
                <span className="font-medium">Что сделал:</span>{" "}
             <div
  dangerouslySetInnerHTML={{ __html: log.whatHappend }}
/>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
