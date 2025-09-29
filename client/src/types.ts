import { z } from "zod";
import {
  InvoiceDataSchema,
  LayoutItemSchema,
  TableItemSchema,
  TextItemSchema,
  ShapeItemSchema,
  CompanyInfoSchema,
  type TextItemStyle,
} from "./schemas";

export type LayoutItem = z.infer<typeof LayoutItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
export type TextItem = z.infer<typeof TextItemSchema>;
export type TableItem = z.infer<typeof TableItemSchema>;
export type ShapeItem = z.infer<typeof ShapeItemSchema>;
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type { TextItemStyle };
