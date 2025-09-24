import { useState, useRef } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { PdfPreview } from "./components/PdfPreview";
import type { InvoiceData, LayoutItem } from "./types";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument } from "./components/InvoiceDocument";
import { StatePreview } from "./components/StatePreview";
import { LayoutPalette } from "./components/LayoutPalette";
import { LayerPalette } from "./components/LayerPalette";
import { useHistoryState } from "./hooks/useHistoryState";
import { useMutation, gql } from "@apollo/client";
import { LeftToolbar } from "./components/LeftToolbar";
import { pdfjs } from "react-pdf";

const SAVE_INVOICE_MUTATION = gql`
  mutation SaveInvoice($invoiceData: InvoiceDataInput!) {
    saveInvoice(invoiceData: $invoiceData)
  }
`;

function App() {
  const {
    state: invoiceData,
    setState: setInvoiceData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryState<InvoiceData>({
    layout: [],
    form: {
      issue_date: new Date().toLocaleDateString(),
      due_date: new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).toLocaleDateString(),
    },
  });
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<LayoutItem | null>(null);
  const [variableDisplayMode, setVariableDisplayMode] = useState<
    "name" | "example"
  >("example");
  const [activeRightPanel, setActiveRightPanel] = useState<'properties' | 'layers'>('properties');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [saveInvoiceMutation] = useMutation(SAVE_INVOICE_MUTATION);

  const getNewZIndex = () => {
    if (invoiceData.layout.length === 0) return 1;
    const maxZIndex = invoiceData.layout.reduce(
      (max, item) => Math.max(max, item.zIndex),
      0
    );
    return maxZIndex + 1;
  };

  const toggleLayersPanel = () => {
    setActiveRightPanel(prev => prev === 'layers' ? 'properties' : 'layers');
  };

  const handleSelectObject = (objectId: string | null) => {
    setSelectedObjectId(objectId);
    if (objectId) {
      setActiveRightPanel('properties');
    }
  };

  const addTextObject = () => {
    const newText: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "テキスト",
      x: 100,
      y: 100,
      width: 150,
      height: 20,
      zIndex: getNewZIndex(),
      style: { isBullet: false, lineHeight: 1.2 },
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newText],
    }));
    handleSelectObject(newText.id);
  };

  const addTableObject = () => {
    const newTable: LayoutItem = {
      id: crypto.randomUUID(),
      type: "table",
      x: 100,
      y: 200,
      width: 300,
      height: 100,
      data: [
        ["Header 1", "Header 2"],
        ["Cell 1", "Cell 2"],
      ],
      zIndex: getNewZIndex(),
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newTable],
    }));
    handleSelectObject(newTable.id);
  };

  const addBulletObject = () => {
    const newBullet: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "項目1\n項目2\n項目3",
      x: 100,
      y: 100,
      width: 150,
      height: 60,
      zIndex: getNewZIndex(),
      style: { isBullet: true, lineHeight: 1.5 },
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), newBullet],
    }));
    handleSelectObject(newBullet.id);
  };

  const deleteSelectedObject = () => {
    if (!selectedObjectId) return;
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.filter((item) => item.id !== selectedObjectId),
    }));
    handleSelectObject(null);
  };

  const cut = () => {
    if (!selectedObjectId) return;
    const objectToCut = invoiceData.layout.find(
      (item) => item.id === selectedObjectId
    );
    if (objectToCut) {
      setClipboard(objectToCut);
      setInvoiceData((prev) => ({
        ...prev,
        layout: prev.layout.filter((item) => item.id !== selectedObjectId),
      }));
      handleSelectObject(null);
    }
  };

  const paste = () => {
    if (!clipboard) return;
    const newObject: LayoutItem = {
      ...clipboard,
      id: crypto.randomUUID(),
      x: clipboard.x + 10,
      y: clipboard.y + 10,
    };
    setInvoiceData((prev) => ({
      ...prev,
      layout: [...prev.layout, newObject],
    }));
  };

  const moveLayer = (direction: "up" | "down") => {
    if (!selectedObjectId) return;

    const sortedLayout = [...invoiceData.layout].sort(
      (a, b) => a.zIndex - b.zIndex
    );
    const currentIndex = sortedLayout.findIndex(
      (item) => item.id === selectedObjectId
    );

    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= sortedLayout.length) return;

    const currentItem = sortedLayout[currentIndex];
    const targetItem = sortedLayout[targetIndex];

    const newLayout = invoiceData.layout.map((item) => {
      if (item.id === currentItem.id) {
        return { ...item, zIndex: targetItem.zIndex };
      }
      if (item.id === targetItem.id) {
        return { ...item, zIndex: currentItem.zIndex };
      }
      return item;
    });

    setInvoiceData((prev) => ({ ...prev, layout: newLayout }));
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
          const newImage: LayoutItem = {
            id: crypto.randomUUID(),
            type: "image",
            data,
            x: 50,
            y: 50,
            width: img.width,
            height: img.height,
            zIndex: getNewZIndex(),
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

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as ArrayBuffer;
      if (data) {
        const pdf = await pdfjs.getDocument({ data }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const imageDataUrl = canvas.toDataURL("image/png");
            const newImage: LayoutItem = {
              id: crypto.randomUUID(),
              type: "image" as const,
              data: imageDataUrl,
              x: 50,
              y: 50 + (i - 1) * (viewport.height + 20),
              width: viewport.width,
              height: viewport.height,
              zIndex: getNewZIndex(),
            };
            setInvoiceData((prev) => ({
              ...prev,
              layout: [...(prev.layout || []), newImage],
            }));
          }
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveInvoice = async () => {
    try {
      await saveInvoiceMutation({
        variables: {
          invoiceData,
        },
      });
      alert("Invoice saved successfully!");
    } catch (e) {
      console.error("Error saving invoice:", e);
      alert("An error occurred while saving the invoice.");
    }
  };

  const openPdfInNewTab = async () => {
    const blob = await pdf(
      <InvoiceDocument
        invoiceData={invoiceData}
        variableDisplayMode={variableDisplayMode}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const selectedObject = invoiceData.layout.find(
    (obj) => obj.id === selectedObjectId
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Invoice Editor</h1>
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <button onClick={undo} disabled={!canUndo} className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-200">
              元に戻す
            </button>
            <button onClick={redo} disabled={!canRedo} className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-200">
              やり直し
            </button>
            <button onClick={cut} disabled={!selectedObjectId} className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-200">
              切り取り
            </button>
            <button onClick={paste} disabled={!clipboard} className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-200">
              貼り付け
            </button>
            <button onClick={deleteSelectedObject} disabled={!selectedObjectId} className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-200 text-red-600">
              削除
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              setVariableDisplayMode((prev) =>
                prev === "name" ? "example" : "name"
              )
            }
            className="px-4 py-2 rounded text-sm font-medium border border-gray-300"
          >
            {variableDisplayMode === "name" ? "データ例で表示" : "変数で表示"}
          </button>
          <button
            onClick={openPdfInNewTab}
            className="px-4 py-2 rounded text-sm font-medium border border-gray-300"
          >
            プレビュー
          </button>
          <button
            onClick={() => alert("PDFトレース機能は未実装です")}
            className="px-4 py-2 rounded text-sm font-medium border border-gray-300"
          >
            PDFをトレース
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {}}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            キャンセル
          </button>
          <button
            onClick={saveInvoice}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            保存
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-16 bg-white p-2 border-r border-gray-200">
          <LeftToolbar
            onAddText={addTextObject}
            onAddBullet={addBulletObject}
            onAddTable={addTableObject}
            onAddImage={() => imageInputRef.current?.click()}
            onAddPdf={() => pdfInputRef.current?.click()}
            onToggleLayers={toggleLayersPanel}
          />
        </aside>
        <main className="flex-1 p-8 bg-gray-50 overflow-auto">
          <PdfPreview
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            selectedObjectId={selectedObjectId}
            onSelectObject={handleSelectObject}
            variableDisplayMode={variableDisplayMode}
          />
        </main>
        <aside className="w-80 bg-white p-4 border-l border-gray-200 overflow-y-auto">
          {(() => {
            if (activeRightPanel === 'layers') {
              return (
                <LayerPalette
                  invoiceData={invoiceData}
                  setInvoiceData={setInvoiceData}
                  selectedObjectId={selectedObjectId}
                  onSelectObject={handleSelectObject}
                />
              );
            }
            if (selectedObject) {
              return (
                <LayoutPalette
                  selectedObject={selectedObject}
                  setInvoiceData={setInvoiceData}
                  onMoveLayer={moveLayer}
                  onDelete={deleteSelectedObject}
                />
              );
            }
            return (
              <InvoiceForm
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
              />
            );
          })()}
        </aside>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
      <input
        type="file"
        accept="application/pdf"
        ref={pdfInputRef}
        onChange={handlePdfUpload}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default App;
