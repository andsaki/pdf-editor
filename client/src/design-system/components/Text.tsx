import React from 'react';
import { typography } from 'accessibility-learning/src/design-system/tokens';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2';

interface TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  gutterBottom?: boolean;
  sx?: React.CSSProperties;
  className?: string;
}

/**
 * Typography代替コンポーネント
 * デザイントークンベースのテキストコンポーネント
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body1',
  children,
  gutterBottom = false,
  sx,
  className
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.fontSize['5xl'],
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.lineHeight.tight,
          margin: 0,
        };
      case 'h2':
        return {
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.lineHeight.tight,
          margin: 0,
        };
      case 'h3':
        return {
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.tight,
          margin: 0,
        };
      case 'h4':
        return {
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.snug,
          margin: 0,
        };
      case 'h5':
        return {
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.snug,
          margin: 0,
        };
      case 'h6':
        return {
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.lineHeight.normal,
          margin: 0,
        };
      case 'subtitle1':
        return {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          lineHeight: typography.lineHeight.normal,
          margin: 0,
        };
      case 'subtitle2':
        return {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          lineHeight: typography.lineHeight.normal,
          margin: 0,
        };
      case 'body2':
        return {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.lineHeight.relaxed,
          margin: 0,
        };
      case 'body1':
      default:
        return {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.lineHeight.relaxed,
          margin: 0,
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    ...getVariantStyles(),
    marginBottom: gutterBottom ? '0.5em' : 0,
    ...sx,
  };

  const Tag = variant.startsWith('h') ? variant : 'p';

  return React.createElement(Tag, { style: baseStyles, className }, children);
};
