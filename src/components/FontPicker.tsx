/**
 * ============================================================================
 * Font Picker Component
 * ============================================================================
 * 
 * Dropdown component for selecting fonts from available system fonts.
 * 
 * Features:
 * - Search/filter fonts by name
 * - Shows font name in its own typeface
 * - Displays available styles for each font
 * - Click outside to close
 * - Loading and empty states
 * 
 * @module components/FontPicker
 */

import React, { useState, useMemo } from 'react';
import { AvailableFont } from '../core/fonts/fontLoader';

/**
 * Props for FontPicker component
 */
interface FontPickerProps {
  /** Available fonts list from useFonts hook */
  fonts: AvailableFont[];
  
  /** Currently selected font family name */
  selectedFont: string;
  
  /** Callback when font is selected */
  onChange: (font: string) => void;
  
  /** Whether fonts are still loading */
  loading?: boolean;
}

/**
 * Font Picker Component
 * 
 * Dropdown for selecting from available system fonts.
 * Each font is displayed in its own typeface for preview.
 */
export const FontPicker: React.FC<FontPickerProps> = ({
  fonts,
  selectedFont,
  onChange,
  loading = false
}) => {
  // Search filter text
  const [search, setSearch] = useState('');
  
  // Dropdown open/closed state
  const [isOpen, setIsOpen] = useState(false);

  // Filter fonts by search term
  const filteredFonts = useMemo(() => {
    if (!search.trim()) return fonts;
    const searchLower = search.toLowerCase();
    return fonts.filter(font => font.family.toLowerCase().includes(searchLower));
  }, [fonts, search]);

  /**
   * Handle font selection
   * Updates selection, closes dropdown, clears search
   */
  const handleSelect = (font: string) => {
    onChange(font);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="font-picker">
      {/* Selected font display / dropdown trigger */}
      <div className="font-picker-selected" onClick={() => setIsOpen(!isOpen)}>
        <span 
          className="font-preview" 
          style={{ fontFamily: `"${selectedFont}", system-ui, sans-serif` }}
        >
          {selectedFont}
        </span>
        <svg 
          className={`font-picker-arrow ${isOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div className="font-picker-dropdown">
          {/* Search input */}
          <input
            type="text"
            className="font-picker-search"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          
          {/* Font list */}
          {loading ? (
            <div className="font-picker-loading">Loading fonts...</div>
          ) : (
            <div className="font-picker-list">
              {filteredFonts.length === 0 ? (
                <div className="font-picker-empty">No fonts found</div>
              ) : (
                filteredFonts.map((font) => (
                  <div
                    key={font.family}
                    className={`font-picker-option ${font.family === selectedFont ? 'selected' : ''}`}
                    onClick={() => handleSelect(font.family)}
                  >
                    {/* Font name rendered in its own typeface */}
                    <span style={{ fontFamily: `"${font.family}", system-ui, sans-serif` }}>
                      {font.family}
                    </span>
                    {/* Available styles hint */}
                    <span className="font-styles-hint">
                      {font.styles.join(', ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && <div className="font-picker-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
};
