import React, { useState } from 'react';
import { EditIcon } from '../../../assets/icons';
import { colors } from '../../../constants/colors';

interface EditButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  showIcon?: boolean;
}

export const EditButton: React.FC<EditButtonProps> = ({
  showIcon = true,
  style,
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '28px',
    height: '32px',
    borderRadius: '100px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: disabled ? colors.grey.disabled : 'rgba(120, 60, 145, 1)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    transform: isHovered ? 'scale(1.15)' : 'scale(1)',
    transition: 'transform 0.2s ease',
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {showIcon && (
        <img 
          src={EditIcon} 
          alt="Edit" 
          style={{ 
            width: '14px', 
            height: '14px',
            display: 'block'
          }} 
        />
      )}
    </button>
  );
};

