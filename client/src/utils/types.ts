import { z } from "zod";
import {
  InvoiceDataSchema,
  LayoutItemSchema,
  TableItemSchema,
  TextItemSchema,
  ShapeItemSchema,
  ImageItemSchema,
  CompanyInfoSchema,
  CompanyInfoGqlSchema,
  InvoiceGqlSchema,
  TableCellSchema,
  type TextItemStyle,
} from "./schemas";

export type LayoutItem = z.infer<typeof LayoutItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
export type TextItem = z.infer<typeof TextItemSchema>;
export type TableItem = z.infer<typeof TableItemSchema>;
export type ShapeItem = z.infer<typeof ShapeItemSchema>;
export type ImageItem = z.infer<typeof ImageItemSchema>;
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type CompanyInfoGql = z.infer<typeof CompanyInfoGqlSchema>;
export type InvoiceGql = z.infer<typeof InvoiceGqlSchema>;
export type TableCell = z.infer<typeof TableCellSchema>;
export type { TextItemStyle };
