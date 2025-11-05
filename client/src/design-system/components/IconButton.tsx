import React from 'react';
import { colors, radii, accessibilityLevels } from 'accessibility-learning/src/design-system/tokens';
import type { WCAGLevel } from 'accessibility-learning/src/design-system/tokens';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** アイコンコンポーネント */
  children: React.ReactNode;
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** WCAGアクセシビリティレベル */
  wcagLevel?: WCAGLevel;
}

/**
 * アイコンボタンコンポーネント
 * アイコンのみを表示する正方形のボタン
 */
export const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = 'md',
  disabled,
  wcagLevel = 'AA',
  ...props
}) => {
  const levelFocus = accessibilityLevels.focus[wcagLevel];

  const [isKeyboardFocus, setIsKeyboardFocus] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardFocus(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardFocus(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const sizeStyles = {
    sm: {
      width: '32px',
      height: '32px',
      fontSize: '1rem',
    },
    md: {
      width: '40px',
      height: '40px',
      fontSize: '1.25rem',
    },
    lg: {
      width: '48px',
      height: '48px',
      fontSize: '1.5rem',
    },
  };

  const baseStyles: React.CSSProperties = {
    ...sizeStyles[size],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    borderRadius: radii.borderRadius.full,
    backgroundColor: 'transparent',
    color: colors.text.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    position: 'relative',
  };

  const hoverStyles: React.CSSProperties = disabled
    ? {}
    : {
        backgroundColor: colors.background.hover || 'rgba(0, 0, 0, 0.04)',
      };

  const focusStyles: React.CSSProperties = isKeyboardFocus
    ? {
        outline: `${levelFocus.outlineWidth} solid ${levelFocus.outline}`,
        outlineOffset: levelFocus.outlineOffset,
      }
    : {};

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      style={{
        ...baseStyles,
        ...(isHovered ? hoverStyles : {}),
        ...focusStyles,
      }}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
};
