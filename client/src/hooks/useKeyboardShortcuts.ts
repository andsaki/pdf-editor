import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
}

/**
 * キーボードショートカットを登録するカスタムフック
 * Ctrl+C (Cmd+C): コピー
 * Ctrl+X (Cmd+X): 切り取り
 * Ctrl+V (Cmd+V): 貼り付け
 */
export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はスキップ
      const isInputFocused =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      if (isInputFocused) {
        return;
      }

      // Ctrl+C または Cmd+C でコピー
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && handlers.onCopy) {
        e.preventDefault();
        handlers.onCopy();
      }

      // Ctrl+X または Cmd+X で切り取り
      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && handlers.onCut) {
        e.preventDefault();
        handlers.onCut();
      }

      // Ctrl+V または Cmd+V で貼り付け
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && handlers.onPaste) {
        e.preventDefault();
        handlers.onPaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
