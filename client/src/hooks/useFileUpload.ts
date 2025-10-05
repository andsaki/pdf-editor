import { useCallback } from "react";
import type { LayoutItem } from "../utils/types";
import { getNewZIndex } from "../utils/layoutUtils";

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
   * PDFファイルのアップロード処理
   * Note: PDF読み込み機能は現在無効化されています
   * PDFから画像への変換が必要な場合は、サーバーサイドでの処理を検討してください
   */
  const handlePdfUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      alert("PDF読み込み機能は現在利用できません。画像ファイルをアップロードしてください。");
      event.target.value = "";
    },
    []
  );

  return {
    handleImageUpload,
    handlePdfUpload,
  };
};
