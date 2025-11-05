import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  sx?: React.CSSProperties;
  className?: string;
  as?: React.ElementType;
}

/**
 * Box/Divの代替コンポーネント
 * MUIのBoxと同様にスタイルを受け取れるシンプルなコンテナ
 */
export const Container: React.FC<ContainerProps> = ({ children, sx, className, as, ...props }) => {
  const Tag = as || 'div';
  return React.createElement(Tag, { style: sx, className, ...props }, children);
};
