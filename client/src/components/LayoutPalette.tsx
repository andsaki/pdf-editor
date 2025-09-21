import React from 'react';
import type { InvoiceData, LayoutItem } from '../types';
import { TextItemSchema } from '../schemas';
import { z } from 'zod';

type TextItem = z.infer<typeof TextItemSchema>;

interface LayoutPaletteProps {
  selectedObject: LayoutItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

/**
 * 選択されたオブジェクトのプロパティを表示・編集するためのパレットコンポーネントです。
 * @param {LayoutPaletteProps} props コンポーネントのプロパティ
 * @returns {JSX.Element | null} 選択されたオブジェクトがない場合はnullを返します。
 */
export const LayoutPalette: React.FC<LayoutPaletteProps> = ({ selectedObject, setInvoiceData }) => {

  /**
   * テキストオブジェクトのスタイルプロパティの変更を処理します。
   * @param {Partial<TextItem['style']>} newStyle 新しいスタイルプロパティ
   */
  const handleStyleChange = (newStyle: Partial<TextItem['style']>) => {
    setInvoiceData(prev => ({
      ...prev,
      layout: prev.layout.map(item => {
        if (item.id === selectedObject.id && item.type === 'text') {
          return { ...item, style: { ...item.style, ...newStyle } };
        }
        return item;
      })
    }));
  };

  /**
   * テーブルの行数・列数の変更を処理し、テーブルデータをリサイズします。
   * @param {number} rows 新しい行数
   * @param {number} cols 新しい列数
   */
  const handleTableDataChange = (rows: number, cols: number) => {
    if (selectedObject.type !== 'table') return;

    const newRows = Math.max(2, rows);
    const newCols = Math.max(2, cols);

    const newData = Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) =>
        selectedObject.data[r]?.[c] || ''
      )
    );

    setInvoiceData(prev => ({
      ...prev,
      layout: prev.layout.map(item => {
        if (item.id === selectedObject.id && item.type === 'table') {
          return { ...item, data: newData };
        }
        return item;
      })
    }));
  };

  if (!selectedObject) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Layout Palette</h3>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">ID:</label>
        <p className="text-xs text-gray-500">{selectedObject.id}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Type:</label>
        <p>{selectedObject.type}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">X:</label>
        <input type="number" value={selectedObject.x} onChange={e => setInvoiceData(prev => ({ ...prev, layout: prev.layout.map(item => item.id === selectedObject.id ? { ...item, x: parseFloat(e.target.value) } : item) }))} />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Y:</label>
        <input type="number" value={selectedObject.y} onChange={e => setInvoiceData(prev => ({ ...prev, layout: prev.layout.map(item => item.id === selectedObject.id ? { ...item, y: parseFloat(e.target.value) } : item) }))} />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Width:</label>
        <input type="number" value={selectedObject.width} onChange={e => setInvoiceData(prev => ({ ...prev, layout: prev.layout.map(item => item.id === selectedObject.id ? { ...item, width: parseFloat(e.target.value) } : item) }))} />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Height:</label>
        <input type="number" value={selectedObject.height} onChange={e => setInvoiceData(prev => ({ ...prev, layout: prev.layout.map(item => item.id === selectedObject.id ? { ...item, height: parseFloat(e.target.value) } : item) }))} />
      </div>

      {selectedObject.type === 'text' && (
        <>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
            <textarea value={selectedObject.content} onChange={e => setInvoiceData(prev => ({ ...prev, layout: prev.layout.map(item => item.id === selectedObject.id && item.type === 'text' ? { ...item, content: e.target.value } : item) }))} />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Font Family:</label>
            <select value={selectedObject.style?.fontFamily || 'Helvetica'} onChange={e => handleStyleChange({ fontFamily: e.target.value as any })}>
              <option value="Helvetica">Helvetica</option>
              <option value="BIZ UDPGothic">BIZ UDPGothic</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Font Size:</label>
            <input type="number" value={selectedObject.style?.fontSize || 12} onChange={e => handleStyleChange({ fontSize: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Line Height:</label>
            <input type="number" value={selectedObject.style?.lineHeight || 1} onChange={e => handleStyleChange({ lineHeight: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Text Align:</label>
            <select value={selectedObject.style?.textAlign || 'left'} onChange={e => handleStyleChange({ textAlign: e.target.value as any })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Vertical Align:</label>
            <select value={selectedObject.style?.verticalAlign || 'top'} onChange={e => handleStyleChange({ verticalAlign: e.target.value as any })}>
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Color:</label>
            <input type="color" value={selectedObject.style?.color || '#000000'} onChange={e => handleStyleChange({ color: e.target.value })} />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" checked={selectedObject.style?.bold || false} onChange={e => handleStyleChange({ bold: e.target.checked })} />
              <span className="ml-2">Bold</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={selectedObject.style?.italic || false} onChange={e => handleStyleChange({ italic: e.target.checked })} />
              <span className="ml-2">Italic</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={selectedObject.style?.wordWrap || false} onChange={e => handleStyleChange({ wordWrap: e.target.checked })} />
              <span className="ml-2">Word Wrap</span>
            </label>
          </div>
        </>
      )}

      {selectedObject.type === 'table' && (
        <>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Rows:</label>
            <input
              type="number"
              min="2"
              value={selectedObject.data.length}
              onChange={e => handleTableDataChange(parseInt(e.target.value), selectedObject.data[0]?.length || 1)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Columns:</label>
            <input
              type="number"
              min="2"
              value={selectedObject.data[0]?.length || 1}
              onChange={e => handleTableDataChange(selectedObject.data.length, parseInt(e.target.value))}
            />
          </div>
        </>
      )}
    </div>
  );
};
