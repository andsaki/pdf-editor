import type { LayoutItem, InvoiceData, CompanyInfo, TableCell } from "./types";

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
  item: LayoutItem | TableCell,
  invoiceData: InvoiceData,
  companyInfo?: CompanyInfo
): string => {
  if ("type" in item && item.type !== "text") return "";
  const { contentType, content, label } = item;

  const variableName = content.match(/{{(.*?)}}/)?.[1];

  if (!variableName) {
    return content;
  }

  const keys = variableName.trim().split(".");
  let currentValue: any = { form: invoiceData.form, companyInfo };

  for (const key of keys) {
    if (currentValue && typeof currentValue === "object") {
      if (Array.isArray(currentValue) && !isNaN(Number(key))) {
        currentValue = currentValue[Number(key)];
      } else if (key in currentValue) {
        currentValue = currentValue[key];
      } else {
        currentValue = undefined;
        break;
      }
    } else {
      currentValue = undefined;
      break;
    }
  }

  if (currentValue !== undefined) {
    if (contentType === "labeled-variable") {
      return `${label}${currentValue}`;
    }
    return currentValue;
  }

  if (contentType === "labeled-variable") {
    const value = ""; // fallback for unresolved variables
    return `${label}${value}`;
  }

  return content;
};
