/**
 * ============================================================================
 * Font Fallback System
 * ============================================================================
 * 
 * Provides fallback fonts for browsers that don't support the Font Access API.
 * 
 * Why Fallback Fonts?
 * 
 * When Font Access API (queryLocalFonts) is unavailable:
 * - Firefox, Safari, and older browsers can't access system fonts
 * - We provide a curated list of "web-safe" fonts
 * - These fonts are pre-installed on most operating systems
 * 
 * Font Categories:
 * 
 * 1. Brand Fonts
 *    - Citi Sans: brand font
 * 
 * 2. System Fonts
 *    - system-ui: Adapts to user's OS (macOS, Windows, Linux)
 * 
 * 3. Cross-Platform Fonts
 *    - Arial: Windows, macOS
 *    - Helvetica: macOS (similar to Arial)
 *    - Times New Roman: Universal
 *    - Verdana: Windows
 *    - Georgia: Universal serif
 * 
 * CSS Font Stack:
 * We always add fallbacks like 'system-ui, sans-serif' to ensure
 * text always displays, even if the primary font isn't available.
 * 
 * @module fonts/fontFallback
 */

/**
 * ============================================================================
 * Fallback Font List
 * ============================================================================
 */

/**
 * Fallback fonts list
 * 
 * Used when Font Access API is unavailable (Firefox, Safari, etc.)
 * 
 * These fonts are chosen for:
 * - Wide availability across operating systems
 * - Good rendering quality
 * - Multiple style variants (Regular, Bold, Italic)
 * 
 * Order matters: fonts listed first are preferred when available.
 */
export const fallbackFonts = [
  "Citi Sans",        // Brand font - Brand identity
  "system-ui",        // OS-native font (automatic fallback)
  "Arial",            // Windows, macOS - most universal
  "Helvetica",        // macOS - premium sans-serif
  "Times New Roman",   // Universal serif
  "Courier New",      // Universal monospace
  "Verdana",          // Windows - excellent readability
  "Georgia",          // Universal serif - elegant
  "Trebuchet MS",     // Windows - modern sans-serif
  "Impact",           // Universal - bold display
  "Comic Sans MS"     // Universal - casual/fun
] as const;

/**
 * ============================================================================
 * CSS Formatting Utilities
 * ============================================================================
 */

/**
 * Format font family for CSS font-family property
 * 
 * CSS font-family requires:
 * 1. Quotes around multi-word font names
 * 2. Fallback fonts at the end
 * 
 * @param fontFamily - The font family name to format
 * @returns CSS-formatted font-family string
 * 
 * @example
 * ```typescript
 * formatFontFamily("Times New Roman")
 * // Returns: '"Times New Roman", system-ui, sans-serif'
 * 
 * formatFontFamily("Arial")
 * // Returns: 'Arial, system-ui, sans-serif'
 * ```
 */
export function formatFontFamily(fontFamily: string): string {
  // Check if font name needs quotes
  // Multi-word names like "Times New Roman" must be quoted
  // Also check for hyphens which can cause issues
  const needsQuotes = /[\s-]/.test(fontFamily) && !fontFamily.startsWith('"');
  
  // Wrap in quotes if needed
  const formatted = needsQuotes ? `"${fontFamily}"` : fontFamily;
  
  // Always add fallback fonts for reliability
  // system-ui: adapts to user's OS
  // sans-serif: generic fallback if nothing else works
  return `${formatted}, system-ui, sans-serif`;
}
