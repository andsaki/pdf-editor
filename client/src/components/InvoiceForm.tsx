import React, { useState, useRef } from 'react';
import type { InvoiceData } from '../types';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  activeTool: "select" | "text";
  setActiveTool: React.Dispatch<React.SetStateAction<"select" | "text">>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, setInvoiceData, activeTool, setActiveTool }) => {
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
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Tools</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              console.log('Select button clicked');
              setActiveTool("select");
            }}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${activeTool === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
            <span>Select</span>
          </button>
          <button
            onClick={() => {
              console.log('Add Text button clicked');
              setActiveTool("text");
            }}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${activeTool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
            <span>Add Text</span>
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>Add Image</span>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Invoice Details</h2>

      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Items</h3>
        <div className="space-y-4">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 group">
              <div className="grid grid-cols-2 gap-2 w-full">
                <input
                  type="text"
                  placeholder="Description"
                  className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.amount}
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                />
              </div>
              <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-4 flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Add Item</span>
        </button>
      </div>
    </div>
  );
};
