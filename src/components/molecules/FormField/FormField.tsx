import React from 'react';
import { Input } from '../../atoms';

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label: string;
  error?: string;
  helperText?: string;
  value?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <div className="w-full">
      <Input label={label} error={error} {...props} />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

