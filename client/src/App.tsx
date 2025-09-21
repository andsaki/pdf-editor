import { useState } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { PdfPreview } from "./components/PdfPreview";
import type { InvoiceData } from "./types";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument } from "./components/InvoiceDocument";
import { StatePreview } from "./components/StatePreview";

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    customTexts: [{ id: crypto.randomUUID(), content: "Sample Text", x: 100, y: 100 }],
    images: [],
    tables: [
      {
        id: crypto.randomUUID(),
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
          />
          <div className="mt-8">
            <details open>
              <summary>State Preview</summary>
              <StatePreview data={invoiceData} />
            </details>
          </div>
        </div>
        <div className="col-span-1">
          <PdfPreview
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />
        </div>
      </main>

    </div>
  );
}

export default App;