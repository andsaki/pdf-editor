import React from "react";
import type { InvoiceData, LayoutItem } from "../types";

interface LayerPaletteProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  selectedObjectId: string | null;
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const LayerPalette: React.FC<LayerPaletteProps> = ({
  invoiceData,
  setInvoiceData,
  selectedObjectId,
  setSelectedObjectId,
}) => {
  const sortedLayout = [...invoiceData.layout].sort(
    (a, b) => b.zIndex - a.zIndex
  );

  const moveLayer = (itemId: string, direction: "up" | "down") => {
    const sortedLayout = [...invoiceData.layout].sort(
      (a, b) => a.zIndex - b.zIndex
    );
    const currentIndex = sortedLayout.findIndex((item) => item.id === itemId);

    if (currentIndex === -1) return;

    const nextIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= sortedLayout.length) return;

    const currentItem = sortedLayout[currentIndex];
    const nextItem = sortedLayout[nextIndex];

    const newLayout = invoiceData.layout.map((item) => {
      if (item.id === currentItem.id) {
        return { ...item, zIndex: nextItem.zIndex };
      }
      if (item.id === nextItem.id) {
        return { ...item, zIndex: currentItem.zIndex };
      }
      return item;
    });

    setInvoiceData((prev) => ({ ...prev, layout: newLayout }));
  };

  const toggleProperty = (itemId: string, property: 'locked' | 'visible') => {
    const newLayout = invoiceData.layout.map(item => {
      if (item.id === itemId) {
        return { ...item, [property]: !item[property] };
      }
      return item;
    });
    setInvoiceData(prev => ({ ...prev, layout: newLayout }));
  };

  const deleteLayer = (itemId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      layout: prev.layout.filter(item => item.id !== itemId),
    }));
    if (selectedObjectId === itemId) {
      setSelectedObjectId(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">レイヤー</h3>
      <ul>
        {sortedLayout.map((item) => (
          <li
            key={item.id}
            onClick={() => setSelectedObjectId(item.id)}
            className={`p-2 rounded-md cursor-pointer ${
              selectedObjectId === item.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>
                {item.type} - {item.id.substring(0, 8)}
              </span>
              <div>
                <button onClick={() => toggleProperty(item.id, 'visible')} className="px-2 py-1 text-sm text-gray-700">
                  {item.visible !== false ? "非表示" : "表示"}
                </button>
                <button onClick={() => toggleProperty(item.id, 'locked')} className="px-2 py-1 text-sm text-gray-700">
                  {item.locked ? "解除" : "ロック"}
                </button>
                <button onClick={() => moveLayer(item.id, 'up')} className="px-2 py-1 text-sm">▲</button>
                <button onClick={() => moveLayer(item.id, 'down')} className="px-2 py-1 text-sm">▼</button>
                <button onClick={() => deleteLayer(item.id)} className="px-2 py-1 text-sm text-red-500">
                  削除
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
