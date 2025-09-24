import React from "react";
import type { InvoiceData, LayoutItem } from "../types";
import { TextObjectPalette } from "./TextObjectPalette";
import { TableObjectPalette } from "./TableObjectPalette";

interface LayoutPaletteProps {
  selectedObject: LayoutItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onMoveLayer: (direction: "up" | "down") => void;
  onDelete: () => void;
}

export const LayoutPalette: React.FC<LayoutPaletteProps> = ({
  selectedObject,
  setInvoiceData,
  onMoveLayer,
  onDelete,
}) => {
  if (!selectedObject) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">プロパティ</h3>
      
      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold mb-2">配置</h4>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onMoveLayer("up")} className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300">一つ前面へ</button>
            <button onClick={() => onMoveLayer("down")} className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300">一つ背面へ</button>
        </div>
        <div className="mt-4">
            <button onClick={onDelete} className="w-full px-3 py-1 rounded text-sm bg-red-500 hover:bg-red-600 text-white">削除</button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold mb-2">共通</h4>
        <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">X:</label>
            <input
            type="number"
            value={selectedObject.x}
            onChange={(e) =>
                setInvoiceData((prev) => ({
                ...prev,
                layout: prev.layout.map((item) =>
                    item.id === selectedObject.id
                    ? { ...item, x: parseFloat(e.target.value) }
                    : item
                ),
                }))
            }
            />
        </div>
        <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Y:</label>
            <input
            type="number"
            value={selectedObject.y}
            onChange={(e) =>
                setInvoiceData((prev) => ({
                ...prev,
                layout: prev.layout.map((item) =>
                    item.id === selectedObject.id
                    ? { ...item, y: parseFloat(e.target.value) }
                    : item
                ),
                }))
            }
            />
        </div>
        <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">幅:</label>
            <input
            type="number"
            value={selectedObject.width}
            onChange={(e) =>
                setInvoiceData((prev) => ({
                ...prev,
                layout: prev.layout.map((item) =>
                    item.id === selectedObject.id
                    ? { ...item, width: parseFloat(e.target.value) }
                    : item
                ),
                }))
            }
            />
        </div>
        <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">高さ:</label>
            <input
            type="number"
            value={selectedObject.height}
            onChange={(e) =>
                setInvoiceData((prev) => ({
                ...prev,
                layout: prev.layout.map((item) =>
                    item.id === selectedObject.id
                    ? { ...item, height: parseFloat(e.target.value) }
                    : item
                ),
                }))
            }
            />
        </div>
      </div>

      {selectedObject.type === "text" && (
        <TextObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
        />
      )}

      {selectedObject.type === "table" && (
        <TableObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
        />
      )}
    </div>
  );
};
