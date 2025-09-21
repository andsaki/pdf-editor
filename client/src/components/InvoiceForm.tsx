import React, { useRef } from 'react';
import type { InvoiceData, LayoutItem } from '../types';

interface InvoiceFormProps {
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

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ setInvoiceData, selectedObjectId, setSelectedObjectId, undo, redo, canUndo, canRedo, cut, paste, clipboard }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addTextObject = () => {
    const newText = {
      id: crypto.randomUUID(),
      type: "text" as const,
      content: "Sample Text",
      x: 100,
      y: 100,
      width: 100,
      height: 20,
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newText],
    }));
  };

  const addTableObject = () => {
    const newTable = {
      id: crypto.randomUUID(),
      type: "table" as const,
      x: 100,
      y: 200,
      width: 300,
      height: 100,
      data: [
        ["Header 1", "Header 2"],
        ["Cell 1", "Cell 2"],
      ],
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newTable],
    }));
  };

  const deleteSelectedObject = () => {
    if (!selectedObjectId) return;
    setInvoiceData(prev => ({
      ...prev,
      layout: prev.layout.filter(item => item.id !== selectedObjectId),
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Tools</h3>
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={addTextObject}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline bg-gray-200 text-gray-800 mb-2'}`}>
            <span>Add Text</span>
          </button>
          <button
            onClick={addTableObject}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline bg-gray-200 text-gray-800 mb-2'}`}>
            <span>Add Table</span>
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>Add Image</span>
          </button>
          <button
            onClick={deleteSelectedObject}
            disabled={!selectedObjectId}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
            <span>Delete</span>
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>Redo</span>
          </button>
          <button
            onClick={cut}
            disabled={!selectedObjectId}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>Cut</span>
          </button>
          <button
            onClick={paste}
            disabled={!clipboard}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mb-2"
          >
            <span>Paste</span>
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