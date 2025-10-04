import { useCallback } from "react";
import type { LayoutItem } from "../utils/types";
import { getNewZIndex } from "../utils/layoutUtils";
import { pdfjs } from "react-pdf";

/**
 * ファイルアップロード処理を管理するカスタムフック
 */
export const useFileUpload = (
  layout: LayoutItem[],
  setLayout: (value: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void
) => {
  /**
   * 画像ファイルのアップロード処理
   */
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (data) {
          const img = new Image();
          img.onload = () => {
            const newImage: LayoutItem = {
              id: crypto.randomUUID(),
              type: "image",
              src: data,
              x: 50,
              y: 50,
              width: img.width,
              height: img.height,
              zIndex: getNewZIndex(layout),
            };
            setLayout((prevLayout) => [...(prevLayout || []), newImage]);
          };
          img.src = data;
        }
      };
      reader.readAsDataURL(file);
    },
    [layout, setLayout]
  );

  /**
   * PDFファイルのアップロード処理（各ページを画像として追加）
   */
  const handlePdfUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as ArrayBuffer;
        if (data) {
          const pdf = await pdfjs.getDocument({ data }).promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              const imageDataUrl = canvas.toDataURL("image/png");
              const newImage: LayoutItem = {
                id: crypto.randomUUID(),
                type: "image" as const,
                src: imageDataUrl,
                x: 50,
                y: 50 + (i - 1) * (viewport.height + 20),
                width: viewport.width,
                height: viewport.height,
                zIndex: getNewZIndex(layout),
              };
              setLayout((prevLayout) => [...(prevLayout || []), newImage]);
            }
          }
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [layout, setLayout]
  );

  return {
    handleImageUpload,
    handlePdfUpload,
  };
};
