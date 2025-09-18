import React, { useState } from 'react';
import type { InvoiceData } from '../types';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, setInvoiceData }) => {
  const [newCustomText, setNewCustomText] = useState('');

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

  const handleCustomTextChange = (index: number, value: string) => {
    const newCustomTexts = [...invoiceData.customTexts];
    newCustomTexts[index] = value;
    setInvoiceData({ ...invoiceData, customTexts: newCustomTexts });
  };

  const addCustomText = () => {
    if (newCustomText.trim() !== '') {
      setInvoiceData({
        ...invoiceData,
        customTexts: [...invoiceData.customTexts, newCustomText.trim()],
      });
      setNewCustomText('');
    }
  };

  const removeCustomText = (index: number) => {
    const newCustomTexts = invoiceData.customTexts.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, customTexts: newCustomTexts });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Invoice Details</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">To:</label>
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={invoiceData.to}
          onChange={(e) => setInvoiceData({ ...invoiceData, to: e.target.value })}
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">From:</label>
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={invoiceData.from}
          onChange={(e) => setInvoiceData({ ...invoiceData, from: e.target.value })}
        />
      </div>

      <h3 className="text-xl font-bold mb-2 text-gray-800">Items</h3>
      {invoiceData.items.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="text"
            placeholder="Description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-2 leading-tight focus:outline-none focus:shadow-outline"
            value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 mr-2 leading-tight focus:outline-none focus:shadow-outline"
            value={item.amount}
            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
          />
          <button onClick={() => removeItem(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Remove
          </button>
        </div>
      ))}
      <button onClick={addItem} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Add Item
      </button>

      <h3 className="text-xl font-bold mb-2 mt-6 text-gray-800">Custom Texts</h3>
      {invoiceData.customTexts.map((text, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-2 leading-tight focus:outline-none focus:shadow-outline"
            value={text}
            onChange={(e) => handleCustomTextChange(index, e.target.value)}
          />
          <button onClick={() => removeCustomText(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Remove
          </button>
        </div>
      ))}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Add custom text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-2 leading-tight focus:outline-none focus:shadow-outline"
          value={newCustomText}
          onChange={(e) => setNewCustomText(e.target.value)}
        />
        <button onClick={addCustomText} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Add Text
        </button>
      </div>
    </div>
  );
};
