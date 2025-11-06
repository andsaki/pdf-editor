import React from 'react';
import { colors } from 'accessibility-learning/src/design-system/tokens';

export interface DividerProps {
  sx?: React.CSSProperties;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Divider代替コンポーネント
 * セクションを区切る水平線
 */
export const Divider: React.FC<DividerProps> = ({ sx, style, className }) => {
  const baseStyles: React.CSSProperties = {
    border: 0,
    borderTop: `1px solid ${colors.border.default}`,
    margin: 0,
    ...sx,
    ...style,
  };

  return <hr style={baseStyles} className={className} />;
};
