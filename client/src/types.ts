export interface InvoiceImage {
  id: string;
  data: string; // Base64 data URL
  x: number;
  y: number;
  width: number;
  height: number;
}

// 状態管理のService Interfaceに該当
export interface InvoiceData {

  items: { description: string; amount: number }[];
  customTexts: { id: string; content: string; x: number; y: number }[];
  images: InvoiceImage[];
}
