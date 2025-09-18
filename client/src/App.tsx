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
    customTexts: [
      { content: 'Description', x: 50, y: 200 },
      { content: 'Amount', x: 445, y: 200 },
    ],
    images: [],
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

  return (
    <div className="min-h-screen bg-gray-800 text-white py-8">
      <header className="flex justify-between items-center mb-8 px-8">
        <h1 className="text-4xl font-bold">Invoice Editor</h1>
        <button
          onClick={downloadPdf}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Download PDF
        </button>
      </header>
      <main className="grid grid-cols-3 gap-8 h-[calc(100vh-120px)] px-8">
        <div className="col-span-1">
          <InvoiceForm
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />
          <StatePreview data={invoiceData} />
        </div>
        <div className="col-span-2">
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
