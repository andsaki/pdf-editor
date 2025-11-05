/**
 * PDF座標変換ユーティリティ
 */

/**
 * ピクセル(ポイント)単位からミリメートル単位に変換
 * PDF座標系: 595px x 842px (A4サイズのポイント)
 * Playwright座標系: 210mm x 297mm (A4サイズのミリメートル)
 *
 * @param px ピクセル値
 * @returns ミリメートル値
 */
export const pxToMm = (px: number): number => {
  return (px * 210) / 595;
};

/**
 * ミリメートル単位からピクセル(ポイント)単位に変換
 *
 * @param mm ミリメートル値
 * @returns ピクセル値
 */
export const mmToPx = (mm: number): number => {
  return (mm * 595) / 210;
};
