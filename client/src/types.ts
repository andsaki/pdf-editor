import { z } from 'zod';
import {
  InvoiceDataSchema,
  LayoutItemSchema,
  TextItemSchema,
} from './schemas';

export type LayoutItem = z.infer<typeof LayoutItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
export type TextItem = z.infer<typeof TextItemSchema>;