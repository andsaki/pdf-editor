import { useState } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { PdfPreview } from './components/PdfPreview';
import type { InvoiceData } from './types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    to: 'John Doe',
    from: 'Jane Doe',
    items: [{ description: 'Sample Item', amount: 100 }],
  });

  const downloadPdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    let y = height - 40;
    page.drawText('Invoice', { x: 50, y, size: 30, font });
    y -= 50;

    page.drawText(`To: ${invoiceData.to}`, { x: 50, y, size: fontSize, font });
    y -= 20;
    page.drawText(`From: ${invoiceData.from}`, { x: 50, y, size: fontSize, font });
    y -= 40;

    page.drawText('Description', { x: 50, y, size: fontSize, font });
    page.drawText('Amount', { x: width - 150, y, size: fontSize, font });
    y -= 20;

    let total = 0;
    invoiceData.items.forEach(item => {
      page.drawText(item.description, { x: 50, y, size: fontSize, font });
      page.drawText(`$${item.amount.toFixed(2)}`, { x: width - 150, y, size: fontSize, font });
      y -= 20;
      total += item.amount;
    });

    y -= 20;
    page.drawText(`Total: $${total.toFixed(2)}`, { x: width - 150, y, size: fontSize, font });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Invoice Editor</h1>
        <button 
          onClick={downloadPdf}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Download PDF
        </button>
      </header>
      <main className="grid grid-cols-2 gap-8 h-[calc(100vh-120px)]">
        <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
        <PdfPreview invoiceData={invoiceData} />
      </main>
    </div>
  );
}

export default App;