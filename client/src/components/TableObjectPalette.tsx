import React, { useState } from "react";
import type { InvoiceData, TableItem } from "../types";
import { TableItemSchema } from "../schemas";

interface TableObjectPaletteProps {
  selectedObject: TableItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const TableObjectPalette: React.FC<TableObjectPaletteProps> = ({
  selectedObject,
  setInvoiceData,
}) => {
  const [tableErrors, setTableErrors] = useState<{
    rows?: string;
    cols?: string;
  }>({});

  const handleStyleChange = (newStyle: Partial<TableItem["style"]>) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "table") {
          const currentStyle = item.style || {};
          return { ...item, style: { ...currentStyle, ...newStyle } };
        }
        return item;
      }),
    }));
  };

  const handleTableDataChange = (rows: number, cols: number) => {
    if (selectedObject.type !== "table") return;

    const newRows = Math.max(2, rows);
    const newCols = Math.max(2, cols);

    const newData = Array.from({ length: newRows }, (_, r) =>
      Array.from(
        { length: newCols },
        (_, c) => selectedObject.data[r]?.[c] || ""
      )
    );

    const validation = TableItemSchema.shape.data.safeParse(newData);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten();
      setTableErrors({
        rows: formattedErrors.formErrors[0],
        cols: (formattedErrors.fieldErrors as any)?.[0]?.[0],
      });
    } else {
      setTableErrors({});
    }

    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "table") {
          return { ...item, data: newData };
        }
        return item;
      }),
    }));
  };

  return (
    <>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          背景色:
        </label>
        <input
          type="color"
          value={selectedObject.style?.backgroundColor || "#FFFFFF"}
          onChange={(e) =>
            handleStyleChange({ backgroundColor: e.target.value })
          }
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          行数:
        </label>
        <input
          type="number"
          min="2"
          value={selectedObject.data.length}
          onChange={(e) =>
            handleTableDataChange(
              parseInt(e.target.value),
              selectedObject.data[0]?.length || 1
            )
          }
        />
        {tableErrors.rows && (
          <span className="text-red-500 text-xs">{tableErrors.rows}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          列数:
        </label>
        <input
          type="number"
          min="2"
          value={selectedObject.data[0]?.length || 1}
          onChange={(e) =>
            handleTableDataChange(
              selectedObject.data.length,
              parseInt(e.target.value)
            )
          }
        />
        {tableErrors.cols && (
          <span className="text-red-500 text-xs">{tableErrors.cols}</span>
        )}
      </div>
    </>
  );
};