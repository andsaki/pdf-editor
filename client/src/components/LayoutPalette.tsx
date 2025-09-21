import React from 'react';
import type { InvoiceData } from '../types';

interface LayoutPaletteProps {
  selectedObject: any; // A more specific type will be used later
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const LayoutPalette: React.FC<LayoutPaletteProps> = ({ selectedObject, setInvoiceData }) => {
  if (!selectedObject) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Layout Palette</h3>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">ID:</label>
        <p>{selectedObject.id}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Type:</label>
        <p>{selectedObject.type}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">X:</label>
        <p>{selectedObject.x}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Y:</label>
        <p>{selectedObject.y}</p>
      </div>
      {/* Add more properties here as needed */}
    </div>
  );
};
