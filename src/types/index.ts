/**
 * ============================================================================
 * Type Definitions
 * ============================================================================
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the application. Proper typing ensures:
 * - Compile-time error checking
 * - Better IDE support and autocompletion
 * - Self-documenting code through type names
 * - Fewer runtime errors from unexpected data shapes
 */

/**
 * ============================================================================
 * Font Configuration
 * ============================================================================
 */

/**
 * Text font settings controlling text appearance
 * 
 * Font Style Values:
 * - 'normal' - Regular weight, upright
 * - 'bold' - Bold weight, upright
 * - 'italic' - Regular weight, italic
 * - 'bold italic' - Bold weight, italic
 * - Any other string - Custom style from system fonts
 */
export interface TextFont {
  /** 
   * Font family name
   * 
   * On Chrome/Edge: Uses system fonts via Font Access API
   * On other browsers: Uses web-safe fallback fonts
   * 
   * Examples: 'Arial', 'Helvetica', 'Times New Roman'
   */
  family: string;
  
  /** 
   * Font style/weight variant
   * 
   * Controls the weight and posture of the text.
   * Common values: 'normal', 'bold', 'italic', 'bold italic'
   * May contain custom style names from system fonts.
   */
  style: string;
  
  /** 
   * Font size in pixels
   * 
   * Affects both display and the calculated canvas dimensions.
   * Range: 12px - 120px (enforced by constants)
   */
  size: number;
  
  /** 
   * Line height as a multiplier
   * 
   * 1.0 = 100% of font size (tight)
   * 1.5 = 150% of font size (relaxed)
   * 
   * Used to calculate vertical spacing between lines
   * and total canvas height.
   */
  lineHeight: number;
  
  /** 
   * Letter spacing in pixels
   * 
   * Can be negative to tighten text or positive to spread it.
   * Range: -5px to +20px (enforced by constants)
   */
  letterSpacing: number;
  
  /** 
   * Text horizontal alignment within canvas
   * 
   * - 'left': Text aligned to left edge
   * - 'center': Text centered horizontally
   * - 'right': Text aligned to right edge
   */
  alignment: 'left' | 'center' | 'right';
}

/**
 * ============================================================================
 * Visual Styling
 * ============================================================================
 */

/**
 * Complete text styling options
 * 
 * Combines all visual settings needed to render the text animation.
 * This is the primary state object passed to generators and renderers.
 */
export interface TextStyle {
  /** 
   * Background color in hex format
   * 
   * Used when transparent is false.
   * Format: '#RRGGBB' (e.g., '#000000' for black)
   */
  backgroundColor: string;
  
  /** 
   * Text color in hex format
   * 
   * The color of the animated text characters.
   * Format: '#RRGGBB' (e.g., '#FFFFFF' for white)
   */
  fontColor: string;
  
  /** 
   * Font settings including family, size, style, etc.
   * 
   * See TextFont interface for full details.
   */
  font: TextFont;
  
  /** 
   * Whether background should be transparent
   * 
   * When true: GIF uses transparency, background is invisible
   * When false: GIF uses the backgroundColor
   * 
   * Transparency is useful for overlaying GIFs on other content.
   */
  transparent: boolean;
}

/**
 * ============================================================================
 * Animation Configuration
 * ============================================================================
 */

/**
 * Animation timing settings
 * 
 * Controls the pacing and duration of the text reveal animation.
 * These values are in milliseconds for easy human comprehension.
 */
export interface AnimationSettings {
  /** 
   * How long to show full text before revealing (milliseconds)
   * 
   * Animation sequence:
   * 1. First frame: All text visible, held for this duration
   * 2. Remaining frames: Characters progressively revealed
   * 3. Animation loops back to step 1
   * 
   * Recommended range: 500ms - 5000ms
   * - Too short: Text appears too briefly
   * - Too long: Animation feels slow
   */
  firstFrameHold: number;
  
  /** 
   * How long the reveal animation takes (milliseconds)
   * 
   * Time to reveal all characters from hidden to fully visible.
   * 
   * Recommended range: 60ms - 3000ms
   * - Too short: Animation feels rushed
   * - Too long: Reveal is too slow
   * 
   * Also affects frame count - longer duration = more frames = larger GIF
   */
  revealDuration: number;
}

/**
 * ============================================================================
 * Content Processing
 * ============================================================================
 */

/**
 * Raw content extracted from user input
 * 
 * Stored to preserve original input for reprocessing when settings change.
 */
export interface ExtractedContent {
  /** Raw text input from the user */
  text: string;
}

/**
 * Processed text ready for rendering
 * 
 * Result of text processing pipeline:
 * - Text has been split into lines (word wrapping)
 * - Canvas dimensions have been calculated
 * 
 * This is used by both preview and GIF generation.
 */
export interface ProcessedText {
  /** 
   * Array of text lines after word wrapping
   * 
   * Each element is a line of text that fits within the max width.
   * Lines are calculated based on font metrics.
   */
  lines: string[];
  
  /** 
   * Width of the widest text line in pixels
   * 
   * Used for canvas dimension calculations.
   * Does not include padding.
   */
  maxWidth: number;
  
  /** 
   * Total canvas width in pixels (including padding)
   * 
   * The actual canvas will have this width.
   * Calculated as: maxWidth + (PADDING * 2)
   */
  width: number;
  
  /** 
   * Total canvas height in pixels
   * 
   * Calculated based on number of lines and line height.
   * Includes padding at top and bottom.
   */
  height: number;
}

/**
 * ============================================================================
 * Animation Frames
 * ============================================================================
 */

/**
 * A single frame in the animation sequence
 * 
 * Each frame represents a distinct state of the animation
 * with a specific set of visible characters.
 */
export interface Frame {
  /** 
   * Canvas pixel data (RGBA values)
   * 
   * Contains the raw pixel data for this frame.
   * Generated by rendering the text to an offscreen canvas
   * and extracting the ImageData.
   */
  imageData: ImageData;
  
  /** 
   * Frame display duration in centiseconds (1/100 second)
   * 
   * GIF format requires time in 10ms increments (centiseconds).
   * We store values in milliseconds internally, convert during frame creation.
   * 
   * Example: 2000ms → 200 centiseconds
   */
  delay: number;
}

/**
 * ============================================================================
 * Generation State
 * ============================================================================
 */

/**
 * State of the GIF generation process
 * 
 * Tracks the progress and outcome of GIF creation.
 * Used by the useGifGenerator hook to manage UI state.
 */
export interface GenerationState {
  /** Whether generation is currently running */
  isGenerating: boolean;
  
  /** 
   * Progress percentage (0-100)
   * 
   * Updated during the generation process:
   * - 0%: Not started
   * - 30%: Text processing complete
   * - 50%: Frames generated
   * - 50-95%: GIF encoding in progress
   * - 100%: Complete
   */
  progress: number;
  
  /** Error message if generation failed */
  error: string | null;
  
  /** Generated GIF blob, if successful */
  blob: Blob | null;
}
