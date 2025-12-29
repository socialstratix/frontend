import React from 'react';
import { colors } from '../../../constants/colors';

interface FormErrorProps {
  message?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className = '', style = {} }) => {
  if (!message) return null;

  return (
    <div
      className={className}
      style={{
        color: colors.red.main,
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
        marginTop: '4px',
        lineHeight: '1.4',
        ...style,
      }}
    >
      {message}
    </div>
  );
};

