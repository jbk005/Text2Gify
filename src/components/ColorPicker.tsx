/**
 * ============================================================================
 * Color Picker Component
 * ============================================================================
 * 
 * Modern color picker with presets and custom color support.
 * 
 * Features:
 * - Quick color presets (24 predefined colors)
 * - Hex input for direct color codes
 * - Native color picker for custom colors
 * - Click outside to close dropdown
 * - Disabled state support
 * 
 * @module components/ColorPicker
 */

import React, { useState, useRef, useEffect } from 'react';

/**
 * Props for ColorPicker component
 */
interface ColorPickerProps {
  /** Label text to display */
  label: string;
  
  /** Current color value (hex format) */
  value: string;
  
  /** Callback when color changes */
  onChange: (color: string) => void;
  
  /** Disable the picker */
  disabled?: boolean;
}

/**
 * Predefined color presets for quick selection
 */
const COLOR_PRESETS = [
  // Basic colors
  '#000000', '#FFFFFF', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  // Grays
  '#808080', '#C0C0C0',
  // Extended colors
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
  // Additional colors
  '#FFA500', '#A52A2A', '#DEB887', '#5F9EA0',
  '#7FFF00', '#D2691E', '#FF7F50', '#6495ED',
];

/**
 * Color Picker Component
 * 
 * Provides color selection with presets and custom input.
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  disabled = false
}) => {
  // Dropdown open state
  const [isOpen, setIsOpen] = useState(false);
  
  // Reference for click-outside detection
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handle hex input changes
   * Ensures proper hex format with # prefix
   */
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value;
    if (!hex.startsWith('#')) hex = '#' + hex;
    onChange(hex);
  };

  return (
    <div className="modern-color-picker" ref={pickerRef}>
      <label className="color-picker-label">{label}</label>
      
      <div className="color-picker-row">
        {/* Color swatch button (opens dropdown) */}
        <button
          type="button"
          className="color-swatch-btn"
          style={{ backgroundColor: value }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label={`Select ${label} color`}
        />
        
        {/* Hex input field */}
        <input
          type="text"
          className="color-hex-input"
          value={value}
          onChange={handleHexChange}
          disabled={disabled}
          placeholder="#000000"
          maxLength={7}
        />
      </div>
      
      {/* Color picker dropdown */}
      {isOpen && !disabled && (
        <div className="color-picker-dropdown">
          {/* Color preset grid */}
          <div className="color-presets">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-preset ${value === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          
          {/* Native color picker for custom colors */}
          <div className="color-picker-native">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <span>Custom</span>
          </div>
        </div>
      )}
    </div>
  );
};
