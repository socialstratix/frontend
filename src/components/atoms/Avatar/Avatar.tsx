import React, { useState } from 'react';
import { PLACEHOLDER_IMAGE } from '../../../constants';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallback,
}) => {
  const [imageError, setImageError] = useState(false);
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl',
  };

  const displaySrc = imageError ? PLACEHOLDER_IMAGE : src;

  return (
    <div 
      className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{
        backgroundColor: displaySrc ? undefined : '#E0D5E5',
      }}
    >
      {displaySrc ? (
        <img 
          src={displaySrc} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span 
          style={{
            color: '#783C91',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
          }}
          className="font-semibold"
        >
          {(fallback || alt).charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

