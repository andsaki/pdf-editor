import React, { useId } from 'react';
import { colors, spacing, typography, radii } from 'accessibility-learning/src/design-system/tokens';

export interface SelectWrapperProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** ラベルテキスト */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** ヘルプテキスト */
  helperText?: string;
  /** 必須項目かどうか */
  required?: boolean;
}

/**
 * アクセシブルなセレクトボックスコンポーネント（children対応）
 * accessibility-learningのデザイントークンを使用し、children（option要素）を受け取る
 */
export const SelectWrapper: React.FC<SelectWrapperProps> = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  id,
  children,
  ...props
}) => {
  const autoId = useId();
  const selectId = id || autoId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const selectStyles: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: typography.fontFamily.base,
    fontSize: typography.fontSize.base,
    borderRadius: radii.borderRadius.md,
    border: `2px solid ${error ? colors.border.error : colors.border.default}`,
    outline: 'none',
    padding: `${spacing.scale[2]} ${spacing.scale[3]}`,
    backgroundColor: disabled ? colors.background.disabled : colors.background.paper,
    color: disabled ? colors.text.disabled : colors.text.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: spacing.scale[1],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  };

  const helperTextStyles: React.CSSProperties = {
    marginTop: spacing.scale[1],
    fontSize: typography.fontSize.sm,
    color: error ? colors.text.error : colors.text.secondary,
  };

  const containerStyles: React.CSSProperties = {
    marginBottom: 0,
  };

  const getAriaDescribedBy = () => {
    const ids: string[] = [];
    if (error) ids.push(errorId);
    if (helperText && !error) ids.push(helperId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label htmlFor={selectId} style={labelStyles}>
          {label}
          {required && (
            <span
              style={{ color: colors.text.error, marginLeft: spacing.scale[1] }}
              aria-label="必須"
            >
              *
            </span>
          )}
        </label>
      )}

      <select
        id={selectId}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={getAriaDescribedBy()}
        style={selectStyles}
        {...props}
      >
        {children}
      </select>

      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          style={helperTextStyles}
        >
          {error}
        </div>
      )}

      {helperText && !error && (
        <div id={helperId} style={helperTextStyles}>
          {helperText}
        </div>
      )}
    </div>
  );
};
