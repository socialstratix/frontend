import React from 'react';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'custom';
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  variant = 'default',
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = variant === 'custom' 
    ? {
        width: '100%',
        height: '121px',
        borderWidth: '1px',
        borderRadius: '4px',
        border: '1px solid rgba(170, 134, 185, 1)',
        opacity: 1,
        padding: '10px',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
        ...style,
      }
    : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {label && (
        <label
          style={{
            ...typography.label,
            color: colors.text.primary,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        style={variant === 'custom' ? baseStyle : undefined}
        className={variant === 'default' ? `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}` : className}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

