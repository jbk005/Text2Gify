/**
 * ============================================================================
 * Text Processor
 * ============================================================================
 * 
 * Handles text preprocessing for canvas rendering:
 * - Wraps long text into multiple lines based on font metrics
 * - Calculates optimal canvas dimensions to fit the text
 * 
 * Why This Module Exists:
 * - Canvas API doesn't automatically wrap text
 * - We need to know dimensions before creating the canvas
 * - Different fonts have different character widths
 * 
 * Processing Pipeline:
 * 1. Create temporary canvas for font metrics measurement
 * 2. Split text into words
 * 3. Measure each word, start new lines as needed
 * 4. Calculate required canvas dimensions
 * 5. Return processed lines and dimensions
 * 
 * @module textProcessor
 */

import { ProcessedText, TextFont } from '../types';
import { PADDING, MAX_WIDTH } from '../utils/constants';
import { formatFontFamily } from './fonts/fontFallback';

/**
 * ============================================================================
 * Main Processing Function
 * ============================================================================
 */

/**
 * Process raw text for canvas rendering
 * 
 * This function transforms user input into a format ready for rendering.
 * It handles:
 * - Word wrapping to fit within max width
 * - Dimension calculation for dynamic canvas sizing
 * - Font metric measurements for accurate sizing
 * 
 * Processing Steps:
 * 1. Create a temporary canvas to measure font metrics
 * 2. Build the font string from font settings
 * 3. Wrap text into lines that fit within max width
 * 4. Find the widest line for horizontal sizing
 * 5. Calculate total height based on lines and line height
 * 
 * @param text - Raw input text (may contain spaces and newlines)
 * @param font - Font settings for width calculations (family, size, style, etc.)
 * @returns Processed text with wrapped lines and canvas dimensions
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const result = processText('Hello World', {
 *   family: 'Arial',
 *   size: 32,
 *   style: 'normal',
 *   lineHeight: 1.2,
 *   letterSpacing: 0,
 *   alignment: 'center'
 * });
 * 
 * console.log(result.lines);    // ['Hello World']
 * console.log(result.width);    // Canvas width in pixels
 * console.log(result.height);  // Canvas height in pixels
 * ```
 * 
 * @example
 * ```typescript
 * // Long text wraps automatically
 * const result = processText('This is a very long text that needs wrapping', font);
 * console.log(result.lines.length);  // Number of lines after wrapping
 * ```
 */
export function processText(text: string, font: TextFont): ProcessedText {
  // Create a temporary canvas for font metrics measurement
  // This canvas is never rendered - only used for measuring text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Fallback if canvas context fails (should never happen)
  // Provides minimal valid output to prevent crashes
  if (!ctx) {
    console.warn('Canvas context unavailable, using fallback dimensions');
    return {
      lines: text.split('\n').filter(l => l.trim()),
      maxWidth: 100,
      width: 116,
      height: 50
    };
  }
  
  // Build CSS font string for measurement
  // Format: "style size family" (e.g., "bold 32px Arial")
  const { family, size, style: fontStyle, letterSpacing } = font;
  
  // Handle special case for 'bold italic' combined style
  const fontStyleStr = fontStyle === 'bold italic' ? 'bold italic' : fontStyle;
  
  // Add letter spacing if non-zero
  const letterSpacingStr = letterSpacing !== 0 ? ` ${letterSpacing}px` : '';
  
  // Build complete font string with fallback fonts
  ctx.font = `${fontStyleStr} ${size}px${letterSpacingStr} ${formatFontFamily(family)}`;
  
  // Calculate available width for text (accounting for canvas padding)
  // Max width is limited to prevent excessively large GIFs
  const maxWidth = MAX_WIDTH - (PADDING * 2);
  
  // Wrap text into lines that fit within maxWidth
  const lines = wrapText(text, maxWidth, ctx);
  
  // Find the widest line to determine required canvas width
  // We need enough width to fit the longest line
  let textWidth = 0;
  for (const line of lines) {
    const lineWidth = ctx.measureText(line).width;
    if (lineWidth > textWidth) {
      textWidth = lineWidth;
    }
  }
  
  // Calculate canvas dimensions based on measured content
  // Width: fit to text width + padding on each side
  // Height: total lines × line height + padding top and bottom
  const lineHeightPx = size * font.lineHeight;
  const width = Math.min(MAX_WIDTH, Math.ceil(textWidth + PADDING * 2));
  const height = Math.ceil(lines.length * lineHeightPx + PADDING * 2);
  
  return {
    lines,
    maxWidth: Math.round(textWidth),  // Exact text width (no padding)
    width,                            // Canvas width (with padding)
    height                            // Canvas height (with padding)
  };
}

/**
 * ============================================================================
 * Word Wrapping Algorithm
 * ============================================================================
 */

/**
 * Wrap text into lines that don't exceed maximum width
 * 
 * This implements a greedy word-wrapping algorithm:
 * 1. Split input text into words (by whitespace)
 * 2. For each word, check if adding it exceeds maxWidth
 * 3. If yes, finalize current line and start a new one
 * 4. If no, add word to current line
 * 
 * Why Greedy?
 * - Simple and fast
 * - Works well for most text
 * - Predictable behavior
 * 
 * Limitations:
 * - Single words longer than maxWidth will overflow
 * - Doesn't optimize for balanced line lengths
 * 
 * @param text - Input text to wrap
 * @param maxWidth - Maximum width in pixels for each line
 * @param ctx - Canvas 2D context with font already set
 * @returns Array of wrapped lines
 */
function wrapText(
  text: string, 
  maxWidth: number, 
  ctx: CanvasRenderingContext2D
): string[] {
  // Split text by whitespace to get individual words
  // This preserves spaces within lines but breaks on line boundaries
  const words = text.split(/\s+/);
  
  const lines: string[] = [];
  let currentLine = '';
  
  // Process each word
  for (const word of words) {
    // Build the line as if we added this word
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    // Check if this would exceed max width
    if (metrics.width > maxWidth && currentLine) {
      // Line would be too wide - save current line and start new one
      lines.push(currentLine);
      currentLine = word;
    } else {
      // Word fits - add it to current line
      currentLine = testLine;
    }
  }
  
  // Don't forget the final line!
  // (The loop ends with the last word still in currentLine)
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * ============================================================================
 * Utility Functions
 * ============================================================================
 */

/**
 * Truncate text to a maximum length with ellipsis
 * 
 * Useful for:
 * - Preview text in tooltips
 * - Displaying truncated filenames
 * - UI elements with limited space
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length including the ellipsis
 * @returns Truncated text with "..." appended if needed
 * 
 * @example
 * ```typescript
 * truncateText('Hello World', 10);  // Returns 'Hello...'
 * truncateText('Hi', 10);           // Returns 'Hi' (no truncation needed)
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
