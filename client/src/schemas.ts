import { z } from 'zod';

const BaseLayoutItemSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const TextItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("text"),
  content: z.string(),
  contentType: z
    .enum(["fixed", "variable", "labeled-variable"])
    .default("fixed"),
  label: z.string().optional(),
  style: z
    .object({
      fontFamily: z.enum(["Helvetica", "BIZ UDPGothic"]).optional(),
      fontSize: z.number().optional(),
      lineHeight: z.number().optional(),
      textAlign: z.enum(["left", "center", "right"]).optional(),
      verticalAlign: z.enum(["top", "center", "bottom"]).optional(),
      color: z.string().optional(),
      bold: z.boolean().optional(),
      italic: z.boolean().optional(),
      wordWrap: z.boolean().optional(),
    })
    .optional(),
});

export const ImageItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal('image'),
  data: z.string(),
});

export const TableItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal('table'),
  data: z.array(z.array(z.string()).min(2, "テーブルには少なくとも2つの列が必要です")).min(2, "テーブルには少なくとも2つの行が必要です"),
});

export const LayoutItemSchema = z.discriminatedUnion("type", [
  TextItemSchema,
  ImageItemSchema,
  TableItemSchema,
]);

export const InvoiceDataSchema = z.object({
  layout: z.array(LayoutItemSchema),
  form: z.object({
    issue_date: z.string().optional(),
    due_date: z.string().optional(),
    invoice_number: z.string().optional(),
    company_name: z.string().optional(),
    company_zip: z.string().optional(),
    company_address: z.string().optional(),
    company_tel: z.string().optional(),
    company_email: z.string().optional(),
    recipient_name: z.string().optional(),
    recipient_title: z.string().optional(),
    recipient_zip: z.string().optional(),
    recipient_address: z.string().optional(),
    recipient_tel: z.string().optional(),
    recipient_email: z.string().optional(),
    subtotal: z.number().optional(),
    tax: z.number().optional(),
    total: z.number().optional(),
  }),
});