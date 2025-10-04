import type { LayoutItem } from "./types";

/**
 * レイアウトアイテムの新しいz-indexを計算する
 * @param layout 現在のレイアウトアイテムの配列
 * @returns 新しいz-index値
 */
export const getNewZIndex = (layout: LayoutItem[]): number => {
  if (layout.length === 0) return 1;
  const maxZIndex = layout.reduce(
    (max, item) => Math.max(max, item.zIndex),
    0
  );
  return maxZIndex + 1;
};
