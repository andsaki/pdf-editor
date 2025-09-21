import { z } from 'zod';
import {
  InvoiceDataSchema,
  LayoutItemSchema,
} from './schemas';

export type LayoutItem = z.infer<typeof LayoutItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;