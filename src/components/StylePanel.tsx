/**
 * ============================================================================
 * Style Panel Component
 * ============================================================================
 * 
 * Customization panel for text styling and animation settings.
 * 
 * Features:
 * - Background transparency toggle
 * - Color pickers for background and text
 * - Font family selection
 * - Font style selection (Regular, Bold, Italic, etc.)
 * - Animation timing controls (expandable accordion)
 * - GIF generation button with progress
 * 
 * @module components/StylePanel
 */

import React, { useState } from 'react';
import { TextStyle, AnimationSettings } from '../types';
import { FontPicker } from './FontPicker';
import { ColorPicker } from './ColorPicker';
import { useFonts } from '../hooks/useFonts';

/**
 * Props for StylePanel component
 */
interface StylePanelProps {
  /** Current text styling */
  style: TextStyle;
  
  /** Current animation settings */
  animationSettings: AnimationSettings;
  
  /** Callback when style changes */
  onChange: (style: TextStyle) => void;
  
  /** Callback when animation settings change */
  onAnimationChange: (settings: AnimationSettings) => void;
  
  /** Callback for back button */
  onBack: () => void;
  
  /** Callback to start GIF generation */
  onGenerate: () => void;
  
  /** Whether generation is in progress */
  isGenerating: boolean;
  
  /** Generation progress percentage */
  progress: number;
}

/**
 * Style Panel Component
 * 
 * Provides all customization options for the text animation.
 */
export const StylePanel: React.FC<StylePanelProps> = ({
  style,
  animationSettings,
  onChange,
  onAnimationChange,
  onBack,
  onGenerate,
  isGenerating,
  progress
}) => {
  // Animation accordion open/closed state
  const [animationOpen, setAnimationOpen] = useState(false);
  
  // Style dropdown open state
  const [styleOpen, setStyleOpen] = useState(false);
  
  // Font loading hook
  const { fonts, loading, getStylesForFont } = useFonts();

  // Get available styles for current font
  const availableStyles = getStylesForFont(style.font.family);

  /**
   * Get the display name for current font style
   * Maps CSS style values to display names
   */
  const getStyleValue = (): string => {
    const { style: fontStyle } = style.font;
    const normalized = fontStyle.toLowerCase();
    if (normalized === 'bold italic') return 'Bold Italic';
    if (normalized === 'bold') return 'Bold';
    if (normalized === 'italic') return 'Italic';
    if (normalized === 'normal') return 'Regular';
    return fontStyle;
  };

  /**
   * Handle font style change
   * Maps display name to CSS style value
   */
  const handleStyleChange = (newStyle: string) => {
    const styleMap: Record<string, string> = {
      'Regular': 'normal',
      'Bold': 'bold',
      'Italic': 'italic',
      'Bold Italic': 'bold italic'
    };
    const cssStyle = styleMap[newStyle] || newStyle;
    onChange({
      ...style,
      font: { ...style.font, style: cssStyle }
    });
    setStyleOpen(false);
  };

  /**
   * Reset animation settings to defaults
   */
  const handleResetAnimation = () => {
    onAnimationChange({
      firstFrameHold: 2000,
      revealDuration: 1200
    });
  };

  return (
    <div className="style-panel">
      {/* Back button */}
      <div className="panel-header">
        <button type="button" className="back-btn" onClick={onBack}>
          Back
        </button>
      </div>
      
      {/* Transparency toggle */}
      <div className="style-option">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={style.transparent}
            onChange={(e) => onChange({ ...style, transparent: e.target.checked })}
          />
          Transparent Background
        </label>
      </div>
      
      {/* Color pickers */}
      <div className="colors-row">
        <ColorPicker
          label="Background"
          value={style.backgroundColor}
          onChange={(color) => onChange({ ...style, backgroundColor: color })}
          disabled={style.transparent}
        />
        
        <ColorPicker
          label="Text"
          value={style.fontColor}
          onChange={(color) => onChange({ ...style, fontColor: color })}
        />
      </div>
      
      {/* Font family selection */}
      <div className="style-option">
        <label>Font</label>
        <FontPicker
          fonts={fonts}
          selectedFont={style.font.family}
          onChange={(font) => onChange({ ...style, font: { ...style.font, family: font } })}
          loading={loading}
        />
      </div>
      
      {/* Font style and Alignment in two columns */}
      <div className="style-row">
        {/* Font style selection - Dropdown */}
        <div className="style-option">
          <div className="style-dropdown">
            <label>Style</label>
            <button
              type="button"
              className="style-dropdown-trigger"
              onClick={() => setStyleOpen(!styleOpen)}
            >
              <span>{getStyleValue()}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {styleOpen && (
              <div className="style-dropdown-menu">
                {availableStyles.map((styleName) => (
                  <button
                    key={styleName}
                    type="button"
                    className={`style-dropdown-item ${getStyleValue().toLowerCase() === styleName.toLowerCase() ? 'active' : ''}`}
                    onClick={() => handleStyleChange(styleName)}
                  >
                    {styleName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Text alignment selection - Icon only */}
        <div className="style-option">
          <label>Alignment</label>
          <div className="alignment-buttons">
            <button
              type="button"
              className={`alignment-btn ${style.font.alignment === 'left' ? 'active' : ''}`}
              onClick={() => onChange({ ...style, font: { ...style.font, alignment: 'left' } })}
              title="Align Left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="17" y1="18" x2="3" y2="18"></line>
              </svg>
            </button>
            <button
              type="button"
              className={`alignment-btn ${style.font.alignment === 'center' ? 'active' : ''}`}
              onClick={() => onChange({ ...style, font: { ...style.font, alignment: 'center' } })}
              title="Align Center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="10" x2="6" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="18" y1="18" x2="6" y2="18"></line>
              </svg>
            </button>
            <button
              type="button"
              className={`alignment-btn ${style.font.alignment === 'right' ? 'active' : ''}`}
              onClick={() => onChange({ ...style, font: { ...style.font, alignment: 'right' } })}
              title="Align Right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" y1="10" x2="7" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="7" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Animation Settings Accordion */}
      <div className="accordion">
        <div 
          className="accordion-header" 
          onClick={() => setAnimationOpen(!animationOpen)}
        >
          <h3>Animation Settings</h3>
          <svg 
            className={`accordion-arrow ${animationOpen ? 'open' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        {/* Accordion content */}
        <div className={`accordion-content ${animationOpen ? '' : 'collapsed'}`}>
          {/* First frame hold slider */}
          <div className="accordion-option">
            <label>
              First Frame Hold
              <span className="slider-value">{animationSettings.firstFrameHold / 1000}s</span>
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={animationSettings.firstFrameHold}
              onChange={(e) => onAnimationChange({ ...animationSettings, firstFrameHold: Number(e.target.value) })}
              className="range-slider"
            />
          </div>
          
          {/* Reveal duration slider */}
          <div className="accordion-option">
            <div className="slider-header">
              <label>Reveal Duration</label>
              <span className="slider-value">{animationSettings.revealDuration}ms</span>
            </div>
            <div className="slider-labels">
              <span className="slider-label-text">Fast</span>
              <input
                type="range"
                min="60"
                max="3000"
                step="10"
                value={animationSettings.revealDuration}
                onChange={(e) => onAnimationChange({ ...animationSettings, revealDuration: Number(e.target.value) })}
                className="range-slider"
              />
              <span className="slider-label-text">Slow</span>
            </div>
          </div>
          
          {/* Reset button */}
          <button
            type="button"
            className="reset-animation-btn"
            onClick={handleResetAnimation}
          >
            Reset to Default
          </button>
        </div>
      </div>
      
      {/* Generate button */}
      <div className="generate-section">
        <button
          type="button"
          className={`generate-btn ${isGenerating ? 'generating' : ''}`}
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="loader-content">
              <span className="loader-letter">G</span>
              <span className="loader-letter">e</span>
              <span className="loader-letter">n</span>
              <span className="loader-letter">e</span>
              <span className="loader-letter">r</span>
              <span className="loader-letter">a</span>
              <span className="loader-letter">t</span>
              <span className="loader-letter">i</span>
              <span className="loader-letter">n</span>
              <span className="loader-letter">g</span>
              <span className="loader-bar" />
            </span>
          ) : 'Generate GIF'}
        </button>
        
        {isGenerating && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
};
