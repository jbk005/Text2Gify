/**
 * ============================================================================
 * Frame Generator
 * ============================================================================
 * 
 * Generates animation frames for the text reveal effect.
 * 
 * Animation Concept:
 * The text reveal animation works like a typewriter effect:
 * 
 * ┌─────────────────────────────────────────┐
 * │  Frame 1: [████████████] Hold Duration  │  ← All text visible, pauses
 * │  Frame 2: [███████████░]                │  ← 1 char hidden
 * │  Frame 3: [██████████░░]                │  ← 2 chars hidden
 * │  Frame 4: [█████████░░░]                │  ← 3 chars hidden
 * │  ...                                    │
 * │  Last Frame: [░░░░░░░░░░░]              │  ← All chars hidden
 * └─────────────────────────────────────────┘
 *                        ↓
 *                 Animation loops back
 * 
 * Key Design Decisions:
 * - First frame is held longer (firstFrameHold) for emphasis
 * - Reveal frames show progressive character appearance
 * - Number of reveal frames scales with text length
 * 
 * Frame Count Formula:
 * - numRevealFrames = max(10, totalChars * 2)
 * - More characters = smoother animation = larger file
 * 
 * @module frameGenerator
 */

import { TextStyle, Frame } from '../types';
import {
  FIRST_FRAME_HOLD_MS,  // Default hold time (2 seconds)
  ANIMATION_REVEAL_MS   // Default reveal duration (1.2 seconds)
} from '../utils/constants';
import { formatFontFamily } from './fonts/fontFallback';

/**
 * ============================================================================
 * Main Frame Generation Function
 * ============================================================================
 */

/**
 * Generate animation frames for text reveal effect
 * 
 * This function creates a series of frames that, when played in sequence,
 * produce the typewriter-style text reveal animation.
 * 
 * Frame Structure:
 * - Frame 1: Full text (all characters visible)
 * - Frames 2-N: Progressive reveal (character by character)
 * 
 * The function uses an offscreen canvas to render each frame,
 * then extracts the pixel data as ImageData for GIF encoding.
 * 
 * @param lines - Array of text lines (already processed by textProcessor)
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param style - Complete text styling (colors, font, transparency)
 * @param animationSettings - Timing configuration (optional, uses defaults)
 * @returns Array of Frame objects ready for GIF encoding
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const lines = ['Hello', 'World'];
 * const frames = generateFrames(
 *   lines,
 *   400,  // width
 *   100,  // height
 *   { backgroundColor: '#000', fontColor: '#FFF', font: {...}, transparent: false },
 *   { firstFrameHold: 2000, revealDuration: 1200 }
 * );
 * // frames[0] = full text, frames[1..N] = progressively revealed
 * ```
 */
export function generateFrames(
  lines: string[],
  width: number,
  height: number,
  style: TextStyle,
  animationSettings?: { firstFrameHold: number; revealDuration: number }
): Frame[] {
  const frames: Frame[] = [];
  
  // Use provided animation settings or fall back to defaults
  // Defaults are defined in constants.ts for consistency
  const firstFrameHold = animationSettings?.firstFrameHold ?? FIRST_FRAME_HOLD_MS;
  const revealDuration = animationSettings?.revealDuration ?? ANIMATION_REVEAL_MS;
  
  // Create an offscreen canvas for rendering frames
  // This canvas is never added to the DOM
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Safety check - should never fail in browser environment
  if (!ctx) {
    console.error('Failed to create canvas context');
    return [];
  }
  
  // Count total characters across all lines
  // This determines how many reveal frames we need
  const totalChars = lines.join('').length;
  
  // Calculate number of frames for the reveal animation
  // Formula: max(10, totalChars * 2)
  // - Minimum 10 frames for very short text
  // - More frames for longer text = smoother animation
  // - Trade-off: More frames = larger GIF file size
  const numRevealFrames = Math.max(10, totalChars * 2);
  
  // Calculate delay per frame
  // Spread the reveal duration across all frames
  // GIF format requires centiseconds (1/100 second)
  const delayPerFrame = Math.max(1, Math.ceil(revealDuration / numRevealFrames));
  
  // Build CSS font string from style properties
  // Format: "style size/line-height family" or "style size family"
  const { family, size, style: fontStyle, lineHeight, letterSpacing } = style.font;
  
  // Handle combined 'bold italic' style
  const fontStyleStr = fontStyle === 'bold italic' ? 'bold italic' : fontStyle;
  
  // Add letter spacing if specified
  const letterSpacingStr = letterSpacing !== 0 ? ` ${letterSpacing}px` : '';
  
  // Build complete font string with fallback fonts
  const fontString = `${fontStyleStr} ${size}px${letterSpacingStr} ${formatFontFamily(family)}`;
  
  // Calculate line height in pixels
  // This is font size multiplied by the line height ratio
  const lineHeightPx = size * lineHeight;
  
  // Calculate vertical offset for centering
  // Centers the text block vertically within the canvas
  // If text is taller than canvas, offset is 0 (no centering)
  const totalTextHeight = lines.length * lineHeightPx;
  const verticalOffset = Math.max(0, (height - totalTextHeight) / 2);
  
  /**
   * Draw a single line of text at the specified position
   * 
   * This helper function handles horizontal alignment:
   * - Left: Text starts at x=0
   * - Center: Text is centered within canvas width
   * - Right: Text ends at canvas right edge
   * 
   * @param text - The text string to draw
   * @param yPos - Vertical position (top of text baseline)
   * @param canvasWidth - Width of the canvas for alignment calculation
   */
  const drawTextLine = (text: string, yPos: number, canvasWidth: number) => {
    let xPos = 0;  // Default: left alignment
    
    if (style.font.alignment === 'center') {
      // Center: start position is (canvasWidth - textWidth) / 2
      xPos = (canvasWidth - ctx.measureText(text).width) / 2;
    } else if (style.font.alignment === 'right') {
      // Right: start position is canvasWidth - textWidth
      xPos = canvasWidth - ctx.measureText(text).width;
    }
    
    // Draw the text at calculated position
    ctx.fillText(text, xPos, yPos);
  };
  
  /**
   * Draw a single frame showing a specific number of characters
   * 
   * This function:
   * 1. Fills the background (color or transparent)
   * 2. Draws each line with the appropriate number of visible characters
   * 3. Returns the pixel data as ImageData
   * 
   * @param visibleChars - Total number of characters to show (across all lines)
   * @returns ImageData containing the frame's pixel data
   */
  const drawFrame = (visibleChars: number): ImageData => {
    // Step 1: Handle background
    // Either fill with solid color OR clear for transparency
    if (!style.transparent) {
      // Solid background: fill entire canvas with backgroundColor
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Transparent: clear all pixels (set alpha to 0)
      ctx.clearRect(0, 0, width, height);
    }
    
    // Step 2: Set up text styling
    ctx.fillStyle = style.fontColor;
    ctx.font = fontString;
    ctx.textBaseline = 'top';  // Top of glyphs, not baseline
    
    // Step 3: Draw each line
    // Track global character position across all lines
    let currentChar = 0;
    
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      let lineCharPos = 0;  // Characters visible on this line
      
      // Count how many characters of this line should be visible
      for (let c = 0; c < line.length; c++) {
        currentChar++;  // Move to next character
        
        if (currentChar <= visibleChars) {
          // This character should be visible
          lineCharPos++;
        } else {
          // We've shown enough characters for this frame
          break;
        }
      }
      
      // Draw the visible portion of this line
      if (lineCharPos > 0) {
        const visibleText = line.substring(0, lineCharPos);
        const yPos = verticalOffset + (lineIdx * lineHeightPx);
        drawTextLine(visibleText, yPos, width);
      }
    }
    
    // Step 4: Extract pixel data for GIF encoding
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  
  // ========================================================================
  // Generate the frames
  // ========================================================================
  
  // Frame 1: Full text hold
  // Shows all text visible for the 'hold' duration
  const firstFrameImageData = drawFrame(totalChars);
  frames.push({
    imageData: firstFrameImageData,
    delay: firstFrameHold / 10  // Convert milliseconds to centiseconds
  });
  
  // Frames 2-N: Progressive reveal
  // Each frame reveals more characters
  for (let frame = 0; frame < numRevealFrames; frame++) {
    // Calculate progress (0 to 1)
    // frame=0 → progress=1/numRevealFrames (first reveal frame)
    // frame=numRevealFrames-1 → progress=1 (full reveal)
    const progress = (frame + 1) / numRevealFrames;
    
    // Calculate visible characters based on progress
    // Clamp to 1.0 to ensure we never exceed totalChars
    const visibleChars = Math.floor(Math.min(progress, 1) * totalChars);
    
    // Generate this frame
    const imageData = drawFrame(visibleChars);
    frames.push({
      imageData,
      delay: delayPerFrame / 10  // Convert to centiseconds
    });
  }
  
  return frames;
}
