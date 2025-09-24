import React, { useRef } from "react";
import type { InvoiceData, LayoutItem } from "../types";

import { pdfjs } from "react-pdf";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  selectedObjectId: string | null;
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  cut: () => void;
  paste: () => void;
  clipboard: LayoutItem | null;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  setInvoiceData,
  selectedObjectId,
  setSelectedObjectId,
  undo,
  redo,
  canUndo,
  canRedo,
  cut,
  paste,
  clipboard,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (field: keyof InvoiceData["form"], value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value,
      },
    }));
  };

  const getNewZIndex = () => {
    const maxZIndex = invoiceData.layout.reduce(
      (max, item) => Math.max(max, item.zIndex),
      0
    );
    return maxZIndex + 1;
  };

  const addTextObject = () => {
    const newText: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "テキスト",
      x: 100,
      y: 100,
      width: 150,
      height: 20,
      zIndex: getNewZIndex(),
      style: { isBullet: false, lineHeight: 1.2 },
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newText],
    }));
    setSelectedObjectId(newText.id);
  };

  const addBulletObject = () => {
    const newBullet: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "項目1\n項目2\n項目3",
      x: 100,
      y: 100,
      width: 150,
      height: 60,
      zIndex: getNewZIndex(),
      style: { isBullet: true, lineHeight: 1.5 },
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newBullet],
    }));
    setSelectedObjectId(newBullet.id);
  };
  const addTableObject = () => {
    const newTable: LayoutItem = {
      id: crypto.randomUUID(),
      type: "table",
      x: 100,
      y: 200,
      width: 300,
      height: 100,
      data: [
        ["Header 1", "Header 2"],
        ["Cell 1", "Cell 2"],
      ],
      zIndex: getNewZIndex(),
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newTable],
    }));
  };

  const deleteSelectedObject = () => {
    if (!selectedObjectId) return;
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.filter((item) => item.id !== selectedObjectId),
    }));
    setSelectedObjectId(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      if (data) {
        const img = new Image();
        img.onload = () => {
          const newImage = {
            id: crypto.randomUUID(),
            type: "image" as const,
            data,
            x: 50,
            y: 50,
            width: img.width,
            height: img.height,
            zIndex: getNewZIndex(),
          };
          setInvoiceData((prev) => ({
            ...prev,
            layout: [...(prev.layout || []), newImage],
          }));
        };
        img.src = data;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as ArrayBuffer;
      if (data) {
        const pdf = await pdfjs.getDocument({ data }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const imageDataUrl = canvas.toDataURL("image/png");
            const newImage = {
              id: crypto.randomUUID(),
              type: "image" as const,
              data: imageDataUrl,
              x: 50,
              y: 50 + (i - 1) * (viewport.height + 20),
              width: viewport.width,
              height: viewport.height,
              zIndex: getNewZIndex(),
            };
            setInvoiceData((prev) => ({
              ...prev,
              layout: [...(prev.layout || []), newImage],
            }));
          }
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">ツール</h3>
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={addTextObject}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline bg-gray-200 text-gray-800 mb-2`}
          >
            <span>テキスト追加</span>
          </button>
          <button
            onClick={addTableObject}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline bg-gray-200 text-gray-800 mb-2`}
          >
            <span>テーブル追加</span>
          </button>
          <button
            onClick={addBulletObject}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline bg-gray-200 text-gray-800 mb-2`}
          >
            <span>箇条書き追加</span>
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <span>画像追加</span>
          </button>
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
          >
            <span>PDF追加</span>
          </button>
          <button
            onClick={deleteSelectedObject}
            disabled={!selectedObjectId}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                clipRule="evenodd"
              />
            </svg>
            <span>削除</span>
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>元に戻す</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>やり直し</span>
          </button>
          <button
            onClick={cut}
            disabled={!selectedObjectId}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>切り取り</span>
          </button>
          <button
            onClick={paste}
            disabled={!clipboard}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>貼り付け</span>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <input
            type="file"
            accept="application/pdf"
            ref={pdfInputRef}
            onChange={handlePdfUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">請求書詳細</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">自社情報</h3>
            <label className="block text-sm font-medium text-gray-700">
              名称
            </label>
            <input
              type="text"
              value={invoiceData.form.company_name}
              onChange={(e) => handleFormChange("company_name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            <label className="block text-sm font-medium text-gray-700">
              住所
            </label>
            <input
              type="text"
              value={invoiceData.form.company_address}
              onChange={(e) =>
                handleFormChange("company_address", e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">宛先</h3>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={invoiceData.form.recipient_name}
              onChange={(e) =>
                handleFormChange("recipient_name", e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={invoiceData.form.recipient_address}
              onChange={(e) =>
                handleFormChange("recipient_address", e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">請求書情報</h3>
            <label className="block text-sm font-medium text-gray-700">
              請求書番号
            </label>
            <input
              type="text"
              value={invoiceData.form.invoice_number}
              onChange={(e) =>
                handleFormChange("invoice_number", e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            <label className="block text-sm font-medium text-gray-700">
              発行日
            </label>
            <input
              type="text"
              value={invoiceData.form.issue_date}
              onChange={(e) => handleFormChange("issue_date", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            <label className="block text-sm font-medium text-gray-700">
              支払期日
            </label>
            <input
              type="text"
              value={invoiceData.form.due_date}
              onChange={(e) => handleFormChange("due_date", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
