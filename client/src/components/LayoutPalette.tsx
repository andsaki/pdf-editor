import React from "react";
import type { InvoiceData, LayoutItem } from "../types";
import { TextObjectPalette } from "./TextObjectPalette";
import { TableObjectPalette } from "./TableObjectPalette";

interface LayoutPaletteProps {
  selectedObject: LayoutItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

/**
 * 選択されたオブジェクトのプロパティを表示・編集するためのパレットコンポーネントです。
 * @param {LayoutPaletteProps} props コンポーネントのプロパティ
 * @returns {JSX.Element | null} 選択されたオブジェクトがない場合はnullを返します。
 */
export const LayoutPalette: React.FC<LayoutPaletteProps> = ({
  selectedObject,
  setInvoiceData,
}) => {
  if (!selectedObject) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">レイアウトパレット</h3>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          ID:
        </label>
        <p className="text-xs text-gray-500">{selectedObject.id}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Type:
        </label>
        <p>{selectedObject.type === 'text' ? 'テキスト' : selectedObject.type === 'table' ? 'テーブル' : '画像'}</p>
      </div>
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
