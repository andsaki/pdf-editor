export interface InvoiceImage {
  id: string;
  data: string; // Base64 data URL
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TableItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: string[][];
}

// 状態管理のService Interfaceに該当
export interface InvoiceData {

  customTexts: { id: string; content: string; x: number; y: number }[];
  images: InvoiceImage[];
  tables: TableItem[];
}