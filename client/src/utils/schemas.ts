import { z } from "zod";

export const CompanyInfoSchema = z.record(
  z.string(),
  z.object({
    label: z.string(),
    value: z.string(),
  })
);

export const CompanyInfoGqlSchema = z.object({
  getCompanyInfo: CompanyInfoSchema,
});

const BaseLayoutItemSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number(),
  locked: z.boolean().optional(),
  visible: z.boolean().optional(),
  rotation: z.number().optional(), // 回転角度（度数法）
});

const textItemStyleSchema = z.object({
  fontFamily: z.enum(["Helvetica", "BIZ UDPGothic"]).optional(),
  fontSize: z.number().optional(),
  lineHeight: z.number().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  verticalAlign: z.enum(["top", "center", "bottom"]).optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  wordWrap: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  textShadow: z.string().optional(),
  isBullet: z.boolean().optional(),
});

export const TableCellSchema = z.object({
  id: z.string(),
  content: z.string(),
  contentType: z
    .enum(["fixed", "variable", "labeled-variable"])
    .default("fixed"),
  label: z.string().optional(),
  style: textItemStyleSchema.optional(),
});

export const TextItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("text"),
  content: z.string(),
  contentType: z
    .enum(["fixed", "variable", "labeled-variable"])
    .default("fixed"),
  label: z.string().optional(),
  style: textItemStyleSchema.optional(),
});

export const ImageItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("image"),
  src: z.string(),
});

export const TableItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("table"),
  data: z
    .array(
      z.array(TableCellSchema).min(2, "テーブルには少なくとも2つの列が必要です")
    )
    .min(2, "テーブルには少なくとも2つの行が必要です"),
  style: z
    .object({
      backgroundColor: z.string().optional(),
    })
    .optional(),
});

export const ShapeItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("shape"),
  shapeType: z.enum(["rect", "h-line", "v-line"]),
  style: z
    .object({
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      borderWidth: z.number().optional(),
      borderStyle: z.enum(["solid", "dashed", "dotted"]).optional(),
    })
    .optional(),
});

export const LayoutItemSchema = z.discriminatedUnion("type", [
  TextItemSchema,
  ImageItemSchema,
  TableItemSchema,
  ShapeItemSchema,
]);

const FormFieldSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});

const LineItemSchema = z.object({
  name: FormFieldSchema.optional(),
  date: FormFieldSchema.optional(),
  quantity: FormFieldSchema.optional(),
  unit_price: FormFieldSchema.optional(),
  amount: FormFieldSchema.optional(),
});

export const InvoiceDataSchema = z.object({
  layout: z.array(LayoutItemSchema),
  form: z.object({
    issue_date: FormFieldSchema.optional(),
    due_date: FormFieldSchema.optional(),
    invoice_number: FormFieldSchema.optional(),
    recipient_name: FormFieldSchema.optional(),
    recipient_title: FormFieldSchema.optional(),
    recipient_zip: FormFieldSchema.optional(),
    recipient_prefecture: FormFieldSchema.optional(),
    recipient_city: FormFieldSchema.optional(),
    recipient_street: FormFieldSchema.optional(),
    recipient_building: FormFieldSchema.optional(),
    recipient_tel: FormFieldSchema.optional(),
    recipient_email: FormFieldSchema.optional(),
    recipient_department_name: FormFieldSchema.optional(),
    recipient_contact_name: FormFieldSchema.optional(),
    subtotal: FormFieldSchema.optional(),
    tax: FormFieldSchema.optional(),
    total: FormFieldSchema.optional(),
    line_items: z.array(LineItemSchema).optional(),
    notes: FormFieldSchema.optional(),
  }),
});

export const InvoiceGqlSchema = z.object({
  getInvoice: InvoiceDataSchema,
});

export type TextItemStyle = z.infer<typeof textItemStyleSchema>;
export type TableCell = z.infer<typeof TableCellSchema>;
