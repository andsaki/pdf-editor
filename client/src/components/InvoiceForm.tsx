import React, { useState, useRef } from 'react';
import type { InvoiceData } from '../types';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, setInvoiceData }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newItems = [...invoiceData.items];
    if (field === 'amount') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
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
          setInvoiceData((prev) => ({
            ...prev,
            images: [
              ...(prev.images || []),
              {
                data,
                x: 50,
                y: 50,
                width: img.width,
                height: img.height,
              },
            ],
          }));
        };
        img.src = data;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">To:</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={invoiceData.to}
              onChange={(e) => setInvoiceData({ ...invoiceData, to: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">From:</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={invoiceData.from}
              onChange={(e) => setInvoiceData({ ...invoiceData, from: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">Items</h3>
        <div className="space-y-2">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={item.amount}
                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
              />
              <button onClick={() => removeItem(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Add Item
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2 mt-6 text-gray-800">Images</h3>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Image
        </button>
        <div className="mt-4 space-y-2">
          {invoiceData.images?.map((_, index) => (
            <div key={`image-form-${index}`} className="p-2 border rounded flex justify-between items-center">
              <p className="text-sm font-bold">Image {index + 1}</p>
              <p className="text-xs text-gray-500">You can move and resize the image on the preview.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
