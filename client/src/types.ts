export interface InvoiceData {
  to: string;
  from: string;
  items: { description: string; amount: number }[];
}
