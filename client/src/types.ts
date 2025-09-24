import { z } from 'zod';
import {
  InvoiceDataSchema,
  LayoutItemSchema,
  TableItemSchema,
  TextItemSchema,
} from './schemas';

export type LayoutItem = z.infer<typeof LayoutItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
export type TextItem = z.infer<typeof TextItemSchema>;
export type TableItem = z.infer<typeof TableItemSchema>;