"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

interface Document {
  id: number;
  orderId: string;
  type: string;
  url: string;
}

export default function DocumentsTabContent({
  documentsPhoto,
  orderId,
  onUpload,
}: {
  documentsPhoto?: Document[];
  orderId: number;
  onUpload?: () => void; // Чтобы обновить список после загрузки
}) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fixPath = (url: string) =>
    url.startsWith("public/") ? url.slice("public".length) : url;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadClick = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Выберите файл(ы)");
      return;
    }

    setIsUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("orderId", orderId.toString());

        const res = await fetch("/api/document", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Ошибка загрузки");
        }
      }

      alert("Файлы успешно загружены");
      onUpload?.();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Ошибка при загрузке файлов");
    } finally {
      setIsUploading(false);
      setSelectedFiles(null);
    }
  };

  return (
    <div>
      {/* Галерея */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4 max-h-[75vh] overflow-y-auto pr-2">
        {documentsPhoto?.map((doc) => {
          const src = fixPath(doc.url).startsWith("/")
            ? fixPath(doc.url)
            : `/${fixPath(doc.url)}`;

          return (
            <div
              key={doc.id}
              className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md"
              onClick={() => setModalImage(src)}
            >
              <Image
                src={src}
                alt={`Документ ${doc.id}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          );
        })}
      </div>

      {/* Кнопка загрузки */}
      <div className="flex flex-col items-start gap-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block"
        />
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className={clsx(
            "px-4 py-2 rounded text-white transition",
            isUploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {isUploading ? "Загрузка..." : "Загрузить"}
        </button>
      </div>

      {/* Модальное окно */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 overflow-auto flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={modalImage}
              alt="Полный просмотр"
              width={1200}
              height={900}
              className="w-auto max-w-full max-h-screen object-contain rounded"
            />
            <button
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
              onClick={() => setModalImage(null)}
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
