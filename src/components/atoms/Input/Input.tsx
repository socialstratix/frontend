import React, { useState, forwardRef } from 'react';
import { classNames } from '../../../utils';
import { VisibilityOnIcon, VisibilityOffIcon } from '../../../assets/icons';
import { colors } from '../../../constants/colors';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  label?: string;
  variant?: 'default' | 'login' | 'floating';
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error,
  required = false,
  icon,
  label,
  variant = 'default',
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState('');
  const hasValue = value !== undefined && value !== null && value !== '' || internalValue !== '';
  const isLabelFloating = isFocused || hasValue;
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  // Base classes for default variant
  const baseClasses = variant === 'login'
    ? `w-full h-14 ${isPasswordType ? 'pl-4 pr-12' : 'px-4'} border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:border-1px placeholder:text-gray-400 bg-white transition-colors duration-200`
    : `w-full ${isPasswordType ? 'pl-4 pr-12' : 'px-4'} border border-gray-300 rounded-lg font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:border-2 bg-white shadow-sm transition-colors duration-200`;

  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : '';

  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : '';

  const iconClasses = icon ? 'pl-12' : '';

  // Padding adjustments for floating label
  const getPaddingTop = () => {
    if (!label) return variant === 'login' ? 'px-4' : 'py-3';
    // When label is floating on border, use normal padding
    return isLabelFloating ? 'py-3' : 'pt-3 pb-3';
  };

  const loginStyles: React.CSSProperties = variant === 'login' ? {
    width: '100%',
    maxWidth: '100%',
    height: '56px',
    borderRadius: '4px',
    border: `${isFocused ? '2px' : '1px'} solid ${colors.border.purple}`,
    boxSizing: 'border-box' as const,
  } : {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setInternalValue(e.target.value);
    if (onBlur) {
      onBlur(e);
    }
  };

  // Floating variant with label inside (legacy support)
  if (variant === 'floating' && label) {
    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            placeholder={label}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '4px',
              border: `${isFocused ? '2px' : '1px'} solid ${colors.border.purple}`,
              padding: isPasswordType ? '0 48px 0 16px' : '0 16px',
              transition: 'all 0.2s ease-in-out'
            }}
            className={classNames(
              'w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
              error ? 'border-red-500' : '',
              className
            )}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10 flex items-center justify-center"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              tabIndex={-1}
            >
              <img 
                src={showPassword ? VisibilityOffIcon : VisibilityOnIcon} 
                alt={showPassword ? "Hide password" : "Show password"}
                className="w-5 h-5"
              />
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={variant === 'login' ? 'flex flex-col gap-2.5' : 'w-full'} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        {label && (
          <label
            style={{
              fontFamily: 'Poppins',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '0%',
              color: error && isLabelFloating ? colors.red.main : colors.text.primary,
              height: '21px',
            }}
            className={classNames(
              'absolute left-4 pointer-events-none transition-all duration-200 origin-left z-10',
              icon ? 'left-12' : '',
              isLabelFloating
                ? '-top-2.5 bg-white px-1.5'
                : 'top-1/2 -translate-y-1/2',
              variant === 'login' && isLabelFloating ? '-top-2.5 bg-white px-1.5' : '',
              variant === 'login' && !isLabelFloating ? 'top-7' : ''
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={inputType}
          placeholder={!label ? placeholder : ''}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          style={variant === 'login' ? loginStyles : {}}
          className={classNames(
            baseClasses,
            getPaddingTop(),
            errorClasses,
            disabledClasses,
            iconClasses,
            label && !isLabelFloating && 'placeholder:opacity-0',
            className
          )}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10 flex items-center justify-center"
            style={{
              width: '24.768001556396484px',
              height: '23.13599967956543px',
              background: 'transparent',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            tabIndex={-1}
          >
            <img 
              src={showPassword ? VisibilityOffIcon : VisibilityOnIcon} 
              alt={showPassword ? "Hide password" : "Show password"}
              className="w-5 h-5"
            />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

