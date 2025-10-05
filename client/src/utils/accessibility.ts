import type { LayoutItem } from "./types";

/**
 * スクリーンリーダー用のアナウンスを管理するフック用のユーティリティ
 */
export const createAnnouncer = (
  setAnnouncement: (message: string) => void
) => {
  return (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(""), 1000);
  };
};

/**
 * キーボードナビゲーション用のハンドラーを生成
 */
export const createKeyboardHandler = (
  item: LayoutItem,
  updateLayoutItem: (
    itemId: string,
    updateFn: (item: LayoutItem) => LayoutItem
  ) => void,
  announce: (message: string) => void,
  onSelectObject: (id: string | null) => void
) => {
  return (e: React.KeyboardEvent) => {
    if (item.locked) return;

    const { key, ctrlKey, metaKey, shiftKey } = e;
    const isResizeMode = ctrlKey || metaKey;
    const step = shiftKey ? 1 : 10;

    if (isResizeMode) {
      // リサイズモード (Ctrl/Cmd + 矢印キー)
      switch (key) {
        case "ArrowUp":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            height: Math.max(20, item.height - step),
          }));
          announce(`高さ: ${Math.round(item.height - step)}px`);
          break;
        case "ArrowDown":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            height: item.height + step,
          }));
          announce(`高さ: ${Math.round(item.height + step)}px`);
          break;
        case "ArrowLeft":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            width: Math.max(20, item.width - step),
          }));
          announce(`幅: ${Math.round(item.width - step)}px`);
          break;
        case "ArrowRight":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            width: item.width + step,
          }));
          announce(`幅: ${Math.round(item.width + step)}px`);
          break;
      }
    } else {
      // ドラッグモード (矢印キー)
      switch (key) {
        case "ArrowUp":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            y: item.y - step,
          }));
          announce(`Y座標: ${Math.round(item.y - step)}px`);
          break;
        case "ArrowDown":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            y: item.y + step,
          }));
          announce(`Y座標: ${Math.round(item.y + step)}px`);
          break;
        case "ArrowLeft":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            x: item.x - step,
          }));
          announce(`X座標: ${Math.round(item.x - step)}px`);
          break;
        case "ArrowRight":
          e.preventDefault();
          updateLayoutItem(item.id, (item) => ({
            ...item,
            x: item.x + step,
          }));
          announce(`X座標: ${Math.round(item.x + step)}px`);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelectObject(item.id);
          announce(
            `${item.type === "text" ? "テキスト" : item.type === "image" ? "画像" : item.type === "table" ? "テーブル" : "図形"}を選択しました`
          );
          break;
      }
    }
  };
};

/**
 * アイテムタイプに応じたARIAラベルを生成
 */
export const getItemAriaLabel = (
  item: LayoutItem,
  processedContent?: string
): string => {
  if (item.type === "text" && processedContent) {
    return `テキスト要素: ${processedContent.substring(0, 20)}`;
  } else if (item.type === "image") {
    return "画像要素";
  } else if (item.type === "table") {
    return "テーブル要素";
  } else {
    return "図形要素";
  }
};
