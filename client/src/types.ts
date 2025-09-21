import { z } from 'zod';
import {
  InvoiceDataSchema,
  InvoiceImageSchema,
  TableItemSchema,
} from './schemas';

export type InvoiceImage = z.infer<typeof InvoiceImageSchema>;
export type TableItem = z.infer<typeof TableItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
