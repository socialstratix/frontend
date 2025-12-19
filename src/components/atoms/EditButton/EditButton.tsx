import React from 'react';
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
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '34px',
    height: '40px',
    borderRadius: '100px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: disabled ? colors.grey.disabled : 'rgba(120, 60, 145, 1)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled}
      {...props}
    >
      {showIcon && (
        <img 
          src={EditIcon} 
          alt="Edit" 
          style={{ 
            width: '16px', 
            height: '16px',
            display: 'block'
          }} 
        />
      )}
    </button>
  );
};

