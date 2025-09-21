import { useState } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { PdfPreview } from "./components/PdfPreview";
import type { InvoiceData, LayoutItem } from "./types";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument } from "./components/InvoiceDocument";
import { StatePreview } from "./components/StatePreview";
import { LayoutPalette } from "./components/LayoutPalette";
import { useHistoryState } from "./hooks/useHistoryState";

function App() {
  const { state: invoiceData, setState: setInvoiceData, undo, redo, canUndo, canRedo } = useHistoryState<InvoiceData>({
    layout: [
      {
        id: crypto.randomUUID(),
        type: "text",
        content: "Sample Text",
        x: 100,
        y: 100,
        width: 100,
        height: 20,
      },
      {
        id: crypto.randomUUID(),
        type: "table",
        x: 150,
        y: 150,
        width: 300,
        height: 100,
        data: [
          ["Default Header 1", "Default Header 2"],
          ["Default Cell 1", "Default Cell 2"],
        ],
      },
    ],
  });
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<LayoutItem | null>(null);

  const cut = () => {
    if (!selectedObjectId) return;
    const objectToCut = invoiceData.layout.find(item => item.id === selectedObjectId);
    if (objectToCut) {
      setClipboard(objectToCut);
      setInvoiceData(prev => ({
        ...prev,
        layout: prev.layout.filter(item => item.id !== selectedObjectId),
      }));
      setSelectedObjectId(null);
    }
  };

  const paste = () => {
    if (!clipboard) return;
    const newObject = {
      ...clipboard,
      id: crypto.randomUUID(),
      x: clipboard.x + 10,
      y: clipboard.y + 10,
    };
    setInvoiceData(prev => ({
      ...prev,
      layout: [...prev.layout, newObject],
    }));
  };

  const downloadPdf = async () => {
    const blob = await pdf(
      <InvoiceDocument invoiceData={invoiceData} />
    ).toBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "invoice.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPdfInNewTab = async () => {
    const blob = await pdf(
      <InvoiceDocument invoiceData={invoiceData} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const selectedObject = invoiceData.layout.find(obj => obj.id === selectedObjectId);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 py-8">
      <header className="flex justify-between items-center mb-8 px-8">
        <h1 className="text-4xl font-bold text-gray-900">Invoice Editor</h1>
        <div>
          <button
            onClick={openPdfInNewTab}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
          >
            Open in New Tab
          </button>
          <button
            onClick={downloadPdf}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Download PDF
          </button>
        </div>
      </header>
      <main className="grid grid-cols-3 gap-8 h-[calc(100vh-120px)] px-8">
        <div className="col-span-1">
          <InvoiceForm
            setInvoiceData={setInvoiceData}
            selectedObjectId={selectedObjectId}
            setSelectedObjectId={setSelectedObjectId}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            cut={cut}
            paste={paste}
            clipboard={clipboard}
          />
          {selectedObject && (
            <div className="mt-8">
              <LayoutPalette
                selectedObject={selectedObject}
                setInvoiceData={setInvoiceData}
              />
            </div>
          )}
          <div className="mt-8">
            <details open>
              <summary>State Preview</summary>
              <StatePreview data={invoiceData} />
            </details>
          </div>
        </div>
        <div className="col-span-2">
          <PdfPreview
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            selectedObjectId={selectedObjectId}
            setSelectedObjectId={setSelectedObjectId}
          />
        </div>
      </main>

    </div>
  );
}

export default App;