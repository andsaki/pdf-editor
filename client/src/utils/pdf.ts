import type { LayoutItem, InvoiceData, CompanyInfo } from "./types";

/**
 * テキストアイテムのコンテンツを処理し、最終的な表示文字列を返します。
 * - 変数 (`{{...}}`) を実際の値に置き換えます。
 * - `labeled-variable` の場合は、ラベルと値を連結します。
 *
 * @param item レイアウトアイテム
 * @param invoiceData 請求書データ
 * @param companyInfo 会社情報
 * @returns 処理済みのコンテンツ文字列
 */
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
