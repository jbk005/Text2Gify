/**
 * ============================================================================
 * Preview Canvas Component
 * ============================================================================
 * 
 * Live preview component for the text animation.
 * 
 * Features:
 * - Real-time canvas rendering of the animation
 * - Play/pause animation preview
 * - Dynamic canvas sizing based on text content
 * - Uses same rendering logic as the final GIF generator
 * 
 * How It Works:
 * 
 * 1. Canvas Dimensions
 *    - Calculated dynamically based on text width and height
 *    - Minimal padding around text content
 *    - Updates when font or text changes
 * 
 * 2. Animation Loop
 *    - Uses requestAnimationFrame for smooth 60fps playback
 *    - Same timing logic as GIF frame generator
 *    - Loops continuously when playing
 * 
 * 3. Rendering
 *    - Text drawn character by character
 *    - Vertical centering within canvas
 *    - Horizontal alignment (left, center, right)
 * 
 * @module components/PreviewCanvas
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { TextStyle, AnimationSettings } from '../types';
import { PADDING, FIRST_FRAME_HOLD_MS, ANIMATION_REVEAL_MS } from '../utils/constants';
import { formatFontFamily } from '../core/fonts/fontFallback';

/**
 * Props for PreviewCanvas component
 */
interface PreviewCanvasProps {
  /** Text content to display */
  text: string;
  
  /** Text styling configuration */
  style: TextStyle;
  
  /** Whether animation is playing */
  isPlaying: boolean;
  
  /** Canvas width from text processor */
  width: number;
  
  /** Canvas height from text processor */
  height: number;
  
  /** Array of text lines */
  lines: string[];
  
  /** Animation timing settings */
  animationSettings?: AnimationSettings;
}

/**
 * Canvas-based Animation Preview
 * 
 * Renders a live preview of the text animation using the same
 * logic as the final GIF generator.
 * 
 * @param props - Component props
 */
export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  style,
  isPlaying,
  width,
  height,
  lines,
  animationSettings
}) => {
  // Canvas element ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation frame ID for cancellation
  const animationRef = useRef<number | null>(null);
  
  // Animation start time for timing calculations
  const startTimeRef = useRef<number>(0);
  
  // Cached canvas width for animation
  const textWidthRef = useRef<number>(width);
  
  // Animation timing from props or defaults
  const firstFrameHold = animationSettings?.firstFrameHold ?? FIRST_FRAME_HOLD_MS;
  const revealDuration = animationSettings?.revealDuration ?? ANIMATION_REVEAL_MS;
  
  // Total characters and animation duration
  const totalChars = lines.join('').length;
  const totalAnimationDuration = firstFrameHold + revealDuration;

  // Build CSS font string from style properties
  const formattedFont = useMemo(() => {
    const { family, size, style: fontStyle, letterSpacing } = style.font;
    const fontStyleStr = fontStyle === 'bold italic' ? 'bold italic' : fontStyle;
    const letterSpacingStr = letterSpacing !== 0 ? ` ${letterSpacing}px` : '';
    return `${fontStyleStr} ${size}px${letterSpacingStr} ${formatFontFamily(family)}`;
  }, [style.font]);

  // Calculate canvas dimensions to fit text content
  const canvasDimensions = useMemo(() => {
    if (!lines.length) return { canvasWidth: width, canvasHeight: height, verticalOffset: 0 };
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { canvasWidth: width, canvasHeight: height, verticalOffset: 0 };
    
    ctx.font = formattedFont;
    
    // Find the widest line
    let maxTextWidth = 0;
    for (const line of lines) {
      const lineWidth = ctx.measureText(line).width;
      if (lineWidth > maxTextWidth) {
        maxTextWidth = lineWidth;
      }
    }
    
    // Calculate dimensions with minimal padding
    const canvasWidth = Math.round(maxTextWidth + PADDING * 2);
    const lineHeightPx = style.font.size * style.font.lineHeight;
    const canvasHeight = Math.round(lines.length * lineHeightPx + PADDING * 2);
    
    // Calculate vertical offset for centering
    const totalTextHeight = lines.length * lineHeightPx;
    const verticalOffset = Math.max(0, (canvasHeight - totalTextHeight) / 2);
    
    textWidthRef.current = canvasWidth;
    
    return { canvasWidth, canvasHeight, verticalOffset };
  }, [lines, width, height, formattedFont, style.font.size, style.font.lineHeight]);

  /**
   * Draw text at given position with horizontal alignment
   */
  const drawTextLine = (ctx: CanvasRenderingContext2D, text: string, yPos: number, lineWidth: number) => {
    let xPos = 0;  // Default: left alignment
    
    if (style.font.alignment === 'center') {
      xPos = (lineWidth - ctx.measureText(text).width) / 2;
    } else if (style.font.alignment === 'right') {
      xPos = lineWidth - ctx.measureText(text).width;
    }
    
    ctx.fillText(text, xPos, yPos);
  };

  /**
   * Render a static frame on the canvas
   * Used for paused state and initial render
   */
  const renderFrame = useCallback((showAll: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear or fill background
    if (!style.transparent) {
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set text styling
    ctx.fillStyle = style.fontColor;
    ctx.font = formattedFont;
    ctx.textBaseline = 'top';
    
    const lineHeight = style.font.size * style.font.lineHeight;
    
    // Draw all text lines with vertical centering
    if (showAll) {
      lines.forEach((line, lineIdx) => {
        const yPos = canvasDimensions.verticalOffset + (lineIdx * lineHeight);
        drawTextLine(ctx, line, yPos, canvas.width);
      });
    }
  }, [style, lines, formattedFont, canvasDimensions.verticalOffset]);

  /**
   * Animation loop using requestAnimationFrame
   * Implements the same reveal logic as frameGenerator.ts
   */
  const animate = useCallback(() => {
    if (!isPlaying) return;
    
    // Calculate position in animation loop
    const elapsed = Date.now() - startTimeRef.current;
    const loopTime = elapsed % totalAnimationDuration;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = textWidthRef.current;
    
    // Draw background
    if (!style.transparent) {
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set text styling
    ctx.fillStyle = style.fontColor;
    ctx.font = formattedFont;
    ctx.textBaseline = 'top';
    
    // Calculate visible characters based on time in loop
    let charCount = 0;
    
    if (loopTime < firstFrameHold) {
      // During first frame hold, show all text
      charCount = totalChars;
    } else {
      // During reveal, progressively show characters
      const progress = (loopTime - firstFrameHold) / revealDuration;
      charCount = Math.floor(Math.min(progress, 1) * totalChars);
    }
    
    const lineHeight = style.font.size * style.font.lineHeight;
    
    // Draw text line by line, character by character
    let currentChar = 0;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      let lineCharPos = 0;
      
      // Count characters for this line
      for (let c = 0; c < line.length; c++) {
        currentChar++;
        if (currentChar <= charCount) {
          lineCharPos++;
        } else {
          break;
        }
      }
      
      // Draw visible portion of line
      if (lineCharPos > 0) {
        const visibleText = line.substring(0, lineCharPos);
        const yPos = canvasDimensions.verticalOffset + (lineIdx * lineHeight);
        drawTextLine(ctx, visibleText, yPos, canvasWidth);
      }
    }
    
    // Schedule next frame
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, firstFrameHold, revealDuration, totalAnimationDuration, totalChars, lines, style, formattedFont, canvasDimensions.verticalOffset]);

  // Re-render when style or lines change
  useEffect(() => {
    renderFrame(true);
  }, [style, lines, renderFrame, canvasDimensions]);

  // Start/stop animation based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderFrame(true);
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate, renderFrame]);

  return (
    <div className="preview-canvas">
      <canvas
        ref={canvasRef}
        width={canvasDimensions.canvasWidth}
        height={canvasDimensions.canvasHeight}
        style={{
          maxWidth: '100%',
          backgroundColor: style.transparent ? 'transparent' : style.backgroundColor
        }}
      />
    </div>
  );
};
