/**
 * ============================================================================
 * Application Constants
 * ============================================================================
 * 
 * This file contains all application-wide constants and configuration values.
 * 
 * Benefits of centralized constants:
 * - Single source of truth for configuration
 * - Easy to find and modify values
 * - Consistent usage across all modules
 * - Self-documenting through clear naming
 * 
 * All values are carefully tuned for optimal user experience.
 * Changes here affect the entire application.
 */

/**
 * ============================================================================
 * Default Configuration
 * ============================================================================
 */

/**
 * Default font settings for new text inputs
 * 
 * These values are used when the user first enters text.
 * They can be customized via the Style Panel.
 * 
 * @see TextFont interface for field descriptions
 */
export const DEFAULT_FONT = {
  family: 'Citi Sans',      // Brand font for consistency
  style: 'normal' as const,  // Regular weight
  size: 32,                 // Good balance of visibility and canvas size
  lineHeight: 1.1,          // Tight spacing (110%) for compact appearance
  letterSpacing: 0,          // Default letter spacing
  alignment: 'left' as const  // Left aligned by default
} as const;

/**
 * Default styling for new text
 * 
 * Combines font settings with color and transparency options.
 * Represents the initial state when user starts the app.
 */
export const DEFAULT_STYLE = {
  backgroundColor: '#000000',  // Black background for contrast
  fontColor: '#FFFFFF',       // White text for readability
  font: DEFAULT_FONT,         // Inherit default font settings
  transparent: false           // Solid background by default
} as const;

/**
 * ============================================================================
 * Font Size Constraints
 * ============================================================================
 * 
 * Font size affects both the visual appearance and the file size.
 * Larger fonts create larger GIF files with more frames.
 */

/** Minimum allowed font size in pixels */
export const FONT_SIZE_MIN = 12;

/** Maximum allowed font size in pixels */
export const FONT_SIZE_MAX = 120;

/** Default font size when starting */
export const FONT_SIZE_DEFAULT = 32;

/**
 * ============================================================================
 * Line Height Constraints
 * ============================================================================
 * 
 * Line height controls vertical spacing between text lines.
 * It's expressed as a multiplier of the font size.
 */

/** Minimum line height (tight) */
export const LINE_HEIGHT_MIN = 1.0;  // 100% of font size

/** Maximum line height (very spacious) */
export const LINE_HEIGHT_MAX = 3.0;  // 300% of font size

/** Default line height */
export const LINE_HEIGHT_DEFAULT = 1.1;  // 110% - tight spacing

/**
 * ============================================================================
 * Letter Spacing Constraints
 * ============================================================================
 * 
 * Letter spacing controls horizontal space between characters.
 * Negative values tighten text, positive values spread it out.
 */

/** Minimum letter spacing (tightest) */
export const LETTER_SPACING_MIN = -5;  // Pixels - can overlap slightly

/** Maximum letter spacing (most spread out) */
export const LETTER_SPACING_MAX = 20;  // Pixels

/** Default letter spacing */
export const LETTER_SPACING_DEFAULT = 0;

/**
 * ============================================================================
 * Canvas Layout
 * ============================================================================
 * 
 * Canvas dimensions are calculated dynamically based on text content.
 * Padding ensures text doesn't touch canvas edges.
 */

/** 
 * Padding around text on all sides (in pixels)
 * 
 * This minimal padding prevents text from touching canvas edges.
 * It also provides room for font rendering at edges.
 */
export const PADDING = 8;

/** 
 * Maximum canvas width in pixels
 * 
 * Prevents excessively large GIFs on very long text.
 * Users can fit more text by reducing font size.
 */
export const MAX_WIDTH = 800;

/**
 * ============================================================================
 * Animation Timing
 * ============================================================================
 * 
 * Animation timing affects the feel of the text reveal.
 * These defaults provide a balanced animation speed.
 */

/** 
 * Default duration to show full text before revealing (milliseconds)
 * 
 * This is the "hold" time at the start of each animation loop.
 * Full text is visible, then characters begin revealing.
 */
export const FIRST_FRAME_HOLD_MS = 2000;  // 2 seconds

/** 
 * Default duration for the character reveal animation (milliseconds)
 * 
 * Time to progressively reveal all characters.
 * Each character becomes visible over this duration.
 */
export const ANIMATION_REVEAL_MS = 1400;  // 1.4 seconds

/**
 * ============================================================================
 * GIF Encoding Settings
 * ============================================================================
 * 
 * These settings control the gif.js library behavior.
 * They affect file size and encoding speed.
 */

/** 
 * GIF encoding quality configuration
 * 
 * workers: Number of web workers for parallel encoding
 *   - More workers = faster encoding but higher memory usage
 *   - 2 is a good balance for most devices
 * 
 * quality: Output quality (1 = best, higher = faster but worse quality)
 *   - 1 is recommended for text (clean edges)
 */
export const GIF_QUALITY = {
  workers: 2,   // Parallel encoding threads
  quality: 1    // Best quality
} as const;
