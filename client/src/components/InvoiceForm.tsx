import React, { useState, useRef } from 'react';
import type { InvoiceData } from '../types';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  activeTool: "select" | "text" | "table";
  setActiveTool: React.Dispatch<React.SetStateAction<"select" | "text" | "table">>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, setInvoiceData, activeTool, setActiveTool }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);



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
                id: crypto.randomUUID(),
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
            onClick={() => {
              console.log('Add Table button clicked');
              setActiveTool("table");
            }}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${activeTool === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
            <span>Add Table</span>
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


    </div>
  );
};
