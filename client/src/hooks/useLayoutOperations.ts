import { useCallback } from "react";
import type { LayoutItem, TableCell } from "../utils/types";
import { getNewZIndex } from "../utils/layoutUtils";

/**
 * レイアウトアイテムの操作を管理するカスタムフック
 */
export const useLayoutOperations = (
  layout: LayoutItem[],
  setLayout: (value: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void,
  selectedObjectId: string | null,
  onSelectObject: (objectId: string | null) => void
) => {
  /**
   * テキストオブジェクトを追加
   */
  const addTextObject = useCallback(() => {
    const newText: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "テキスト",
      x: 100,
      y: 100,
      width: 150,
      height: 20,
      zIndex: getNewZIndex(layout),
      style: { isBullet: false, lineHeight: 1.2 },
    };
    setLayout((prevLayout) => [...(prevLayout || []), newText]);
    onSelectObject(newText.id);
  }, [layout, setLayout, onSelectObject]);

  /**
   * テーブルオブジェクトを追加
   */
  const addTableObject = useCallback(() => {
    const createCell = (content: string): TableCell => ({
      id: crypto.randomUUID(),
      content,
      contentType: "fixed",
      style: {},
    });

    const newTable: LayoutItem = {
      id: crypto.randomUUID(),
      type: "table",
      x: 100,
      y: 200,
      width: 300,
      height: 100,
      data: [
        [createCell("Header 1"), createCell("Header 2")],
        [createCell("Cell 1"), createCell("Cell 2")],
      ],
      zIndex: getNewZIndex(layout),
    };
    setLayout((prevLayout) => [...(prevLayout || []), newTable]);
    onSelectObject(newTable.id);
  }, [layout, setLayout, onSelectObject]);

  /**
   * 箇条書きオブジェクトを追加
   */
  const addBulletObject = useCallback(() => {
    const newBullet: LayoutItem = {
      id: crypto.randomUUID(),
      type: "text",
      contentType: "fixed",
      content: "項目1\n項目2\n項目3",
      x: 100,
      y: 100,
      width: 150,
      height: 60,
      zIndex: getNewZIndex(layout),
      style: { isBullet: true, lineHeight: 1.5 },
    };
    setLayout((prevLayout) => [...(prevLayout || []), newBullet]);
    onSelectObject(newBullet.id);
  }, [layout, setLayout, onSelectObject]);

  /**
   * 図形オブジェクトを追加
   */
  const addShapeObject = useCallback(
    (shapeType: "rect" | "h-line" | "v-line") => {
      const baseShape = {
        id: crypto.randomUUID(),
        type: "shape" as const,
        shapeType: shapeType,
        x: 100,
        y: 100,
        zIndex: getNewZIndex(layout),
      };

      let newShape: LayoutItem;
      if (shapeType === "h-line") {
        newShape = {
          ...baseShape,
          width: 200,
          height: 2,
          style: {
            backgroundColor: "#000000",
            borderColor: "#000000",
            borderWidth: 1,
            borderStyle: "solid",
          },
        };
      } else if (shapeType === "v-line") {
        newShape = {
          ...baseShape,
          width: 2,
          height: 100,
          style: {
            backgroundColor: "#000000",
            borderColor: "#000000",
            borderWidth: 1,
            borderStyle: "solid",
          },
        };
      } else {
        // 矩形
        newShape = {
          ...baseShape,
          width: 150,
          height: 100,
          style: {
            backgroundColor: "#cccccc",
            borderColor: "#000000",
            borderWidth: 1,
            borderStyle: "solid",
          },
        };
      }

      setLayout((prevLayout) => [...(prevLayout || []), newShape]);
      onSelectObject(newShape.id);
    },
    [layout, setLayout, onSelectObject]
  );

  /**
   * 選択中のオブジェクトを削除
   */
  const deleteSelectedObject = useCallback(() => {
    if (!selectedObjectId) return;
    setLayout((prevLayout) =>
      prevLayout.filter((item) => item.id !== selectedObjectId)
    );
    onSelectObject(null);
  }, [selectedObjectId, setLayout, onSelectObject]);

  /**
   * 選択中のオブジェクトをコピー
   */
  const copy = useCallback(() => {
    if (!selectedObjectId) return null;
    const objectToCopy = layout.find((item) => item.id === selectedObjectId);
    return objectToCopy || null;
  }, [selectedObjectId, layout]);

  /**
   * 選択中のオブジェクトを切り取り
   */
  const cut = useCallback(() => {
    if (!selectedObjectId) return null;
    const objectToCut = layout.find((item) => item.id === selectedObjectId);
    if (objectToCut) {
      setLayout((prevLayout) =>
        prevLayout.filter((item) => item.id !== selectedObjectId)
      );
      onSelectObject(null);
      return objectToCut;
    }
    return null;
  }, [selectedObjectId, layout, setLayout, onSelectObject]);

  /**
   * クリップボードのオブジェクトを貼り付け
   */
  const paste = useCallback(
    (clipboard: LayoutItem | null) => {
      if (!clipboard) return;
      const newObject: LayoutItem = {
        ...clipboard,
        id: crypto.randomUUID(),
        x: clipboard.x + 10,
        y: clipboard.y + 10,
      };
      setLayout((prevLayout) => [...prevLayout, newObject]);
    },
    [setLayout]
  );

  /**
   * レイヤーの順序を移動
   */
  const moveLayer = useCallback(
    (direction: "up" | "down") => {
      if (!selectedObjectId) return;

      const sortedLayout = [...layout].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = sortedLayout.findIndex(
        (item) => item.id === selectedObjectId
      );

      if (currentIndex === -1) return;

      const targetIndex =
        direction === "up" ? currentIndex + 1 : currentIndex - 1;

      if (targetIndex < 0 || targetIndex >= sortedLayout.length) return;

      const currentItem = sortedLayout[currentIndex];
      const targetItem = sortedLayout[targetIndex];

      setLayout((prevLayout) => {
        return prevLayout.map((item) => {
          if (item.id === currentItem.id) {
            return { ...item, zIndex: targetItem.zIndex };
          }
          if (item.id === targetItem.id) {
            return { ...item, zIndex: currentItem.zIndex };
          }
          return item;
        });
      });
    },
    [selectedObjectId, layout, setLayout]
  );

  return {
    addTextObject,
    addTableObject,
    addBulletObject,
    addShapeObject,
    deleteSelectedObject,
    copy,
    cut,
    paste,
    moveLayer,
  };
};
