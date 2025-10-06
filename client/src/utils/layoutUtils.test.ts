import { describe, it, expect } from 'vitest';
import { getNewZIndex } from './layoutUtils';
import type { LayoutItem } from './types';

describe('layoutUtils', () => {
  describe('getNewZIndex', () => {
    it('レイアウトが空の場合、1を返す', () => {
      const result = getNewZIndex([]);
      expect(result).toBe(1);
    });

    it('レイアウトにアイテムがある場合、最大zIndex + 1を返す', () => {
      const layout: LayoutItem[] = [
        {
          id: '1',
          type: 'text',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          zIndex: 1,
          content: 'テスト 1',
          contentType: 'fixed',
        },
        {
          id: '2',
          type: 'text',
          x: 50,
          y: 50,
          width: 100,
          height: 50,
          zIndex: 3,
          content: 'テスト 2',
          contentType: 'fixed',
        },
      ];

      const result = getNewZIndex(layout);
      expect(result).toBe(4);
    });

    it('単一アイテムのレイアウトを正しく処理する', () => {
      const layout: LayoutItem[] = [
        {
          id: '1',
          type: 'text',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          zIndex: 5,
          content: 'テスト',
          contentType: 'fixed',
        },
      ];

      const result = getNewZIndex(layout);
      expect(result).toBe(6);
    });
  });
});
