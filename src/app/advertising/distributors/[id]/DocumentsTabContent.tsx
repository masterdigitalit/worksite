"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { toast } from "react-toastify";

interface Document {
  id: number;
  distributorId: number;
  type: string;
  url: string;
}

export default function DocumentsTabContent({
  distributorId,
}: {
  distributorId: number;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const loadDocs = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(
        `/api/document/distributor/documents?distributorId=${distributorId}`
      );
      if (!res.ok) throw new Error("Ошибка загрузки документов");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось загрузить документы");
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocs();
    // перезагружаем, если сменился distributorId
  }, [distributorId]);

  const fixPath = (url: string) =>
    url.startsWith("public/") ? url.slice("public".length) : url;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadClick = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.warn("Выберите файл(ы) для загрузки");
      return;
    }

    setIsUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("distributorId", distributorId.toString());

        const res = await fetch("/api/document/distributor", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Ошибка загрузки");
      }

      toast.success("Файлы успешно загружены");
      await loadDocs();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Ошибка при загрузке файлов");
    } finally {
      setIsUploading(false);
      setSelectedFiles(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Галерея */}
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {loadingDocs ? (
          <p className="text-gray-500 text-sm">Загрузка документов...</p>
        ) : documents.length === 0 ? (
          <p className="text-gray-400 text-sm">Документы отсутствуют</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {documents.map((doc) => {
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
        )}
      </div>

      {/* Файл-инпут и кнопка */}
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-fit"
        >
          📁 Выбрать файлы
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {selectedFiles && selectedFiles.length > 0 && (
          <p className="text-sm text-gray-600">
            Выбрано файлов: {selectedFiles.length}
          </p>
        )}
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className={clsx(
            "px-4 py-2 rounded text-white transition",
            isUploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          )}
        >
          {isUploading ? "Загрузка..." : "Загрузить"}
        </button>
      </div>

      {/* Модалка */}
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
