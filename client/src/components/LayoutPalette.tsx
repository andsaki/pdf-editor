import React from 'react';
import type { InvoiceData, LayoutItem } from '../types';

interface LayoutPaletteProps {
  selectedObject: LayoutItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const LayoutPalette: React.FC<LayoutPaletteProps> = ({ selectedObject, setInvoiceData }) => {

  const handleStyleChange = (newStyle: Partial<LayoutItem['style']>) => {
    setInvoiceData(prev => ({
      ...prev,
      layout: prev.layout.map(item => {
        if (item.id === selectedObject.id) {
          return { ...item, style: { ...item.style, ...newStyle } };
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
    </div>
  );
};