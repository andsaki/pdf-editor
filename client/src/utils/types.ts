import { z } from "zod";
import {
  InvoiceDataSchema,
  LayoutItemSchema,
  TableItemSchema,
  TextItemSchema,
  ShapeItemSchema,
  CompanyInfoSchema,
  CompanyInfoGqlSchema,
  InvoiceGqlSchema,
  type TextItemStyle,
} from "./schemas";

export type LayoutItem = z.infer<typeof LayoutItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
export type TextItem = z.infer<typeof TextItemSchema>;
export type TableItem = z.infer<typeof TableItemSchema>;
export type ShapeItem = z.infer<typeof ShapeItemSchema>;
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type CompanyInfoGql = z.infer<typeof CompanyInfoGqlSchema>;
export type InvoiceGql = z.infer<typeof InvoiceGqlSchema>;
export type { TextItemStyle };
