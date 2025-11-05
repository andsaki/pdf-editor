import React from 'react';

interface ContainerProps {
  children?: React.ReactNode;
  sx?: React.CSSProperties;
  className?: string;
}

/**
 * Box/Divの代替コンポーネント
 * MUIのBoxと同様にスタイルを受け取れるシンプルなコンテナ
 */
export const Container: React.FC<ContainerProps> = ({ children, sx, className }) => {
  return (
    <div style={sx} className={className}>
      {children}
    </div>
  );
};
