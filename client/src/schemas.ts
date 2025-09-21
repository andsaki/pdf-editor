import { z } from 'zod';

export const InvoiceImageSchema = z.object({
  id: z.string(),
  data: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const TableItemSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  data: z.array(z.array(z.string())),
});

export const InvoiceDataSchema = z.object({
  customTexts: z.array(z.object({
    id: z.string(),
    content: z.string(),
    x: z.number(),
    y: z.number(),
  })),
  images: z.array(InvoiceImageSchema),
  tables: z.array(TableItemSchema),
});
