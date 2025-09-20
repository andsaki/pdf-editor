import { useState } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { PdfPreview } from "./components/PdfPreview";
import type { InvoiceData } from "./types";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument } from "./components/InvoiceDocument";
import { StatePreview } from "./components/StatePreview";

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    to: "John Doe",
    from: "Jane Doe",
    items: [{ description: "Sample Item", amount: 100 }],
    customTexts: [],
    images: [],
  });
  const [activeTool, setActiveTool] = useState<"select" | "text">("select");

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
      <main className="grid grid-cols-2 gap-16 h-[calc(100vh-120px)] px-8">
        <div className="col-span-1">
          <InvoiceForm
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />
        </div>
        <div className="col-span-1">
          <PdfPreview
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />
        </div>
      </main>
      <div className="px-8 mt-8">
        <details>
          <summary>State Preview</summary>
          <StatePreview data={invoiceData} />
        </details>
      </div>
    </div>
  );
}

export default App;
