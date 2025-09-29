import type { LayoutItem, InvoiceData, CompanyInfo } from "./types";

export const getProcessedContent = (
  item: LayoutItem,
  invoiceData: InvoiceData,
  companyInfo?: CompanyInfo
): string => {
  if (item.type !== "text") return "";
  const { contentType, content, label } = item;
  const { form } = invoiceData;

  const variableName = content.match(/{{(.*?)}}/)?.[1];

  if (!variableName) {
    return content;
  }

  const [source, key] = variableName.split(".");

  if (source === "companyInfo" && companyInfo && companyInfo[key]) {
    return companyInfo[key].value;
  }

  if (source === "form" && form && form[key as keyof typeof form]) {
    // @ts-ignore
    return form[key as keyof typeof form].value;
  }

  if (contentType === "labeled-variable") {
    const value = ""; // fallback for unresolved variables
    return `${label}${value}`;
  }

  return content;
};
