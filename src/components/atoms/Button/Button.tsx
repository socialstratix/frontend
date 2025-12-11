import React, { useRef, useEffect } from 'react';
import { colors } from '../../../constants/colors';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'filled' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onFocus,
  onBlur,
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const originalStyleRef = useRef<React.CSSProperties>(style || {});
  const isFocusedRef = useRef(false);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    originalStyleRef.current = style || {};
  }, [style]);

  const baseStyles = variant === 'filled' 
    ? 'font-medium transition-all focus:outline-none flex items-center justify-center'
    : 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed',
    outline: disabled
      ? 'border border-gray-400 text-gray-400 cursor-not-allowed rounded-full'
      : 'border text-purple-600 focus:ring-purple-500 rounded-full',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed',
    filled: disabled 
      ? 'text-gray-600 rounded-full cursor-not-allowed'
      : 'text-white rounded-full',
    elevated: disabled
      ? 'text-gray-600 cursor-not-allowed'
      : 'hover:opacity-90 focus:ring-gray-500 rounded-full',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Handle hover state for filled, outline, and elevated variants with background color change
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'filled' && !disabled) {
      isHoveringRef.current = true;
      const element = e.currentTarget;
      element.style.backgroundColor = colors.purple.hover;
      element.style.boxShadow = '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)';
    } else if (variant === 'outline' && !disabled) {
      const element = e.currentTarget;
      element.style.backgroundColor = colors.border.light;
      // Ensure text color remains primary purple
      element.style.color = colors.primary.main;
    } else if (variant === 'elevated' && !disabled) {
      const element = e.currentTarget;
      element.style.boxShadow = '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)';
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'filled' && !disabled) {
      isHoveringRef.current = false;
      const element = e.currentTarget;
      // Return to focus state if focused, otherwise default
      element.style.backgroundColor = isFocusedRef.current ? colors.primary.dark : colors.primary.main;
      element.style.boxShadow = '';
    } else if (variant === 'outline' && !disabled) {
      const element = e.currentTarget;
      element.style.backgroundColor = '';
    } else if (variant === 'elevated' && !disabled) {
      const element = e.currentTarget;
      // Return to default shadow
      element.style.boxShadow = '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)';
    }
    onMouseLeave?.(e);
  };

  // Handle pressed/active state for filled variant
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'filled' && !disabled) {
      const element = e.currentTarget;
      // Keep hover color or use a slightly darker shade for press
      element.style.backgroundColor = colors.purple.hover;
      element.style.boxShadow = '0px 1px 2px 0px rgba(0, 0, 0, 0.2)';
      element.style.transform = 'scale(0.98)';
    }
    onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'filled' && !disabled) {
      const element = e.currentTarget;
      // Return to hover state on mouse up (if still hovering)
      element.style.backgroundColor = colors.purple.hover;
      element.style.boxShadow = '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)';
      element.style.transform = '';
    }
    onMouseUp?.(e);
  };

  // Handle focus state for filled variant
  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (variant === 'filled' && !disabled) {
      isFocusedRef.current = true;
      const element = e.currentTarget;
      // Only change to focus color if not hovering (hover takes precedence)
      if (!isHoveringRef.current) {
        element.style.backgroundColor = colors.primary.dark;
      }
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (variant === 'filled' && !disabled) {
      isFocusedRef.current = false;
      const element = e.currentTarget;
      // Return to default state on blur (unless hovering)
      if (!isHoveringRef.current) {
        element.style.backgroundColor = colors.primary.main;
      }
    }
    onBlur?.(e);
  };
  
  // Merge styles - for filled variant, add background color and exclude transform from initial style to allow dynamic changes
  const mergedStyle: React.CSSProperties = variant === 'filled' 
    ? { 
        ...style, 
        backgroundColor: disabled ? colors.grey.disabled : colors.primary.main,
        transform: undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    : variant === 'elevated'
    ? {
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
        borderRadius: '100px',
        backgroundColor: disabled ? colors.grey.disabled : colors.elevated.background,
        color: disabled ? colors.text.secondary : colors.primary.main,
        boxShadow: disabled 
          ? 'none' 
          : '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
      }
    : variant === 'outline'
    ? {
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
        borderRadius: '100px',
        borderWidth: '1px',
        borderColor: disabled ? colors.grey.disabled : colors.primary.main,
        color: disabled ? colors.text.secondary : colors.primary.main,
        backgroundColor: 'transparent',
        gap: '8px'
      }
    : { 
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1'
      };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={mergedStyle}
      disabled={disabled}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </button>
  );
};

