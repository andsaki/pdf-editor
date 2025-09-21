import { useState, useCallback } from 'react';

interface HistoryOptions {
  limit?: number;
}

export const useHistoryState = <T>(initialState: T, options: HistoryOptions = {}) => {
  const { limit = 50 } = options;
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const setState = useCallback((newState: T | ((prevState: T) => T)) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, index + 1);
      const currentState = prevHistory[index];
      const nextState = typeof newState === 'function' ? (newState as (prevState: T) => T)(currentState) : newState;
      newHistory.push(nextState);

      if (newHistory.length > limit) {
        return newHistory.slice(newHistory.length - limit);
      }

      return newHistory;
    });
    setIndex(prevIndex => {
      if (history.length > limit) {
        return limit - 1;
      }
      if (prevIndex + 1 > limit - 1) {
        return limit - 1;
      }
      return prevIndex + 1;
    });
  }, [index, limit, history.length]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(prevIndex => prevIndex - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(prevIndex => prevIndex + 1);
    }
  }, [index, history.length]);

  return {
    state: history[index],
    setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
};