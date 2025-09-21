import { z } from 'zod';

const BaseLayoutItemSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const TextItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal('text'),
  content: z.string(),
});

export const ImageItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal('image'),
  data: z.string(),
});

export const TableItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal('table'),
  data: z.array(z.array(z.string())),
});

export const LayoutItemSchema = z.discriminatedUnion("type", [
  TextItemSchema,
  ImageItemSchema,
  TableItemSchema,
]);

export const InvoiceDataSchema = z.object({
  layout: z.array(LayoutItemSchema),
});