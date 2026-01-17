import React from 'react';
import { ArrowDropDownIcon } from '../../../assets/icons';
import { colors } from '../../../constants/colors';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  minLabel = 'Min',
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            style={{
              padding: '8px 32px 8px 12px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#1E002B',
              backgroundColor: '#FFFFFF',
              border: '1px solid #AA86B9',
              borderRadius: '4px',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
            }}
            value={minLabel}
            onChange={() => {}} // Read-only for now
          >
            <option value={minLabel}>{minLabel}</option>
          </select>
          <img
            src={ArrowDropDownIcon}
            alt="Dropdown"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: '#1E002B',
          }}
        >
          {value.toLocaleString()}
        </span>
      </div>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, ${colors.primary.main} 0%, ${colors.primary.main} ${percentage}%, #E0E0E0 ${percentage}%, #E0E0E0 100%)`,
            outline: 'none',
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />
        <style>
          {`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${colors.primary.main};
              cursor: pointer;
              border: 2px solid #FFFFFF;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${colors.primary.main};
              cursor: pointer;
              border: 2px solid #FFFFFF;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
          `}
        </style>
      </div>
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#1E002B',
          marginTop: '4px',
        }}
      >
        {label}
      </div>
    </div>
  );
};

