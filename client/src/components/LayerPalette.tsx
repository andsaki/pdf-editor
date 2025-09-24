import React from "react";
import type { InvoiceData } from "../types";

interface LayerPaletteProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
}

export const LayerPalette: React.FC<LayerPaletteProps> = ({
  invoiceData,
  setInvoiceData,
  selectedObjectId,
  onSelectObject,
}) => {
  const sortedLayout = [...invoiceData.layout].sort(
    (a, b) => b.zIndex - a.zIndex
  );

  const toggleProperty = (itemId: string, property: 'locked' | 'visible') => {
    const newLayout = invoiceData.layout.map(item => {
      if (item.id === itemId) {
        return { ...item, [property]: !item[property] };
      }
      return item;
    });
    setInvoiceData(prev => ({ ...prev, layout: newLayout }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">レイヤー</h3>
      <ul>
        {sortedLayout.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelectObject(item.id)}
            className={`p-2 rounded-md cursor-pointer ${
              selectedObjectId === item.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>
                {item.type} - {item.id.substring(0, 8)}
              </span>
              <div>
                <button onClick={(e) => {e.stopPropagation(); toggleProperty(item.id, 'visible')}} className="px-2 py-1 text-sm text-gray-700">
                  {item.visible !== false ? "非表示" : "表示"}
                </button>
                <button onClick={(e) => {e.stopPropagation(); toggleProperty(item.id, 'locked')}} className="px-2 py-1 text-sm text-gray-700">
                  {item.locked ? "解除" : "ロック"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
