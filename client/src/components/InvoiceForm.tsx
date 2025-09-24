import React from "react";
import type { InvoiceData } from "../types";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, setInvoiceData }) => {
  const handleFormChange = (field: keyof InvoiceData["form"], value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value,
      },
    }));
  };

  return (
    <div className="p-1">
      <h2 className="text-xl font-bold mb-4 text-gray-800">請求書詳細</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">自社情報</h3>
          <label className="block text-sm font-medium text-gray-700">
            名称
          </label>
          <input
            type="text"
            value={invoiceData.form.company_name || ''}
            onChange={(e) => handleFormChange("company_name", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">
            住所
          </label>
          <input
            type="text"
            value={invoiceData.form.company_address || ''}
            onChange={(e) =>
              handleFormChange("company_address", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">宛先</h3>
          <label className="block text-sm font-medium text-gray-700">
            名称
          </label>
          <input
            type="text"
            value={invoiceData.form.recipient_name || ''}
            onChange={(e) =>
              handleFormChange("recipient_name", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">
            住所
          </label>
          <input
            type="text"
            value={invoiceData.form.recipient_address || ''}
            onChange={(e) =>
              handleFormChange("recipient_address", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">請求書情報</h3>
          <label className="block text-sm font-medium text-gray-700">
            請求書番号
          </label>
          <input
            type="text"
            value={invoiceData.form.invoice_number || ''}
            onChange={(e) =>
              handleFormChange("invoice_number", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">
            発行日
          </label>
          <input
            type="text"
            value={invoiceData.form.issue_date || ''}
            onChange={(e) => handleFormChange("issue_date", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">
            支払期日
          </label>
          <input
            type="text"
            value={invoiceData.form.due_date || ''}
            onChange={(e) => handleFormChange("due_date", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
          />
        </div>
      </div>
    </div>
  );
};
