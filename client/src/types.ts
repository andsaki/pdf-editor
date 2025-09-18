export interface InvoiceImage {
  data: string; // Base64 data URL
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InvoiceData {
  to: string;
  from: string;
  items: { description: string; amount: number }[];
  customTexts: { content: string; x: number; y: number }[];
  images: InvoiceImage[];
}
