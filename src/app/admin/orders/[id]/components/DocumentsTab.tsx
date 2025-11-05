"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { toast } from "react-toastify";
import { s3Service } from "lib/s3-service";

interface Document {
  id: number;
  name: string;
  file_url: string;
  file_key?: string;
  file_name?: string;
  file_size?: string;
  uploaded_at: string;
  order_id?: number;
}

export default function DocumentsTabContent({
  orderId,
  onUpload,
}: {
  orderId: number;
  onUpload?: () => void;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [orderId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await s3Service.getOrderDocuments(orderId);
      setDocuments(docs);
    } catch (error) {
      setError("Не удалось загрузить документы");
      toast.error("Ошибка загрузки документов");
    } finally {
      setLoading(false);
    }
  };

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
      const results = await s3Service.uploadMultipleFiles(
        orderId, 
        Array.from(selectedFiles)
      );

      toast.success(`Успешно загружено ${results.length} файлов`);
      await loadDocuments();
      onUpload?.();
    } catch (error) {
      toast.error("Ошибка при загрузке файлов");
    } finally {
      setIsUploading(false);
      setSelectedFiles(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот документ?")) {
      return;
    }

    try {
      await s3Service.deleteOrderDocument(orderId, documentId);
      toast.success("Документ удален");
      await loadDocuments();
      onUpload?.();
    } catch (error) {
      toast.error("Ошибка при удалении документа");
    }
  };

  const getImageUrl = (doc: Document): string => {
    if (doc.file_url.startsWith('http')) {
      return doc.file_url;
    }
    
    if (doc.file_key) {
      return s3Service.getFileUrl(doc.file_key);
    }
    
    return s3Service.getFileUrl(doc.file_url);
  };

  const isImageFile = (doc: Document): boolean => {
    const url = doc.file_url.toLowerCase();
    return url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) !== null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (sizeString?: string) => {
    if (!sizeString) return 'Неизвестный размер';
    
    try {
      const size = parseInt(sizeString);
      if (isNaN(size)) return sizeString;
      
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } catch (error) {
      return sizeString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка документов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">❌ {error}</div>
        <button
          onClick={loadDocuments}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Статистика */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-blue-900">Документы заказа</h3>
            <p className="text-sm text-blue-700">
              Всего документов: {documents.length} | 
              Изображений: {documents.filter(doc => isImageFile(doc)).length}
            </p>
          </div>
          <button
            onClick={loadDocuments}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            title="Обновить список"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Галерея документов */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4 max-h-[75vh] overflow-y-auto pr-2">
        {documents.map((doc) => {
          const imageUrl = getImageUrl(doc);
          const isImage = isImageFile(doc);

          return (
            <div
              key={doc.id}
              className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group border hover:shadow-md transition-shadow"
            >
              {isImage ? (
                <>
                  {/* Изображение с исправленным кликом */}
                  <div 
                    className="w-full h-full cursor-pointer relative"
                    onClick={() => setModalImage(imageUrl)}
                  >
                    <Image
                      src={imageUrl}
                      alt={doc.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="transition-transform group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Информация при наведении - без перекрывающего фона */}
                  <div className="absolute inset-0 pointer-events-none flex items-end">
                    <div className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity w-full bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-xs truncate font-medium">{doc.name}</div>
                      {doc.file_size && (
                        <div className="text-xs opacity-80">{formatFileSize(doc.file_size)}</div>
                      )}
                      <div className="text-xs opacity-70">
                        {formatDate(doc.uploaded_at)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Документ (не изображение) */
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <div className="text-center p-2">
                    <div className="text-2xl mb-1">📄</div>
                    <div className="text-xs truncate font-medium">{doc.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatFileSize(doc.file_size)}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Кнопка удаления */}
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
                title="Удалить документ"
              >
                🗑️
              </button>

              {/* Индикатор типа файла */}
              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {isImage ? '🖼️' : '📄'}
              </div>
            </div>
          );
        })}

        {documents.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📁</div>
            <div className="text-lg font-medium">Нет загруженных документов</div>
            <div className="text-sm mt-1">Загрузите первый файл используя форму ниже</div>
          </div>
        )}
      </div>

      {/* Загрузка новых файлов */}
      <div className="border-t pt-4">
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-3">
            <label
              htmlFor="file-upload"
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              📁 Выбрать файлы
            </label>
            <span className="text-sm text-gray-600">
              Поддерживаются: JPG, PNG, PDF, DOC
            </span>
          </div>
          
          <input
            id="file-upload"
            type="file"
            accept="image/*, .pdf, .doc, .docx, .txt"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="w-full p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">Выбрано файлов: {selectedFiles.length}</p>
              <ul className="mt-2 max-h-32 overflow-y-auto space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <li key={index} className="flex justify-between items-center text-sm py-1">
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={handleUploadClick}
            disabled={isUploading || !selectedFiles || selectedFiles.length === 0}
            className={clsx(
              "px-6 py-2 rounded text-white transition font-medium",
              isUploading || !selectedFiles || selectedFiles.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Загрузка...
              </>
            ) : (
              <>
                ⬆️ Загрузить файлы
              </>
            )}
          </button>
        </div>
      </div>

      {/* Модальное окно просмотра - исправленная версия */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div 
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={modalImage}
              alt="Полный просмотр"
              width={1200}
              height={900}
              style={{ 
                width: 'auto', 
                height: 'auto', 
                maxWidth: '90vw', 
                maxHeight: '90vh',
                objectFit: 'contain' 
              }}
              className="rounded-lg shadow-2xl"
            />
            <button
              className="absolute -top-12 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              onClick={() => setModalImage(null)}
            >
              ❌ Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}