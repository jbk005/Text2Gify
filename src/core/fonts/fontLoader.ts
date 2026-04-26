/**
 * ============================================================================
 * Font Loader
 * ============================================================================
 * 
 * Handles loading available fonts from the user's system.
 * 
 * Font Loading Strategy:
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    Font Availability Check                       │
 * └─────────────────────────────────────────────────────────────────┘
 *                              │
 *              ┌───────────────┴───────────────┐
 *              ▼                               ▼
 *      ┌──────────────┐               ┌──────────────┐
 *      │   Chrome/     │               │   Firefox/   │
 *      │   Edge only   │               │   Safari/    │
 *      │      ▼        │               │   Others     │
 *      │ Font Access   │               │      ▼       │
 *      │     API       │               │   Fallback   │
 *      └──────────────┘               │    Fonts     │
 *              │                       └──────────────┘
 *              ▼                               │
 *      ┌──────────────┐                       │
 *      │ System fonts  │───────────────────────┘
 *      │ with styles   │
 *      └──────────────┘
 * 
 * Font Access API:
 * - Only available in Chromium browsers (Chrome, Edge)
 * - Returns fonts installed on the user's computer
 * - Returns actual style names from each font
 * 
 * Fallback:
 * - Web-safe fonts available on all browsers
 * - Uses common style names (Regular, Bold, Italic)
 * 
 * @module fonts/fontLoader
 */

import { fallbackFonts } from './fontFallback';

/**
 * ============================================================================
 * Type Definitions
 * ============================================================================
 */

/**
 * Font data returned by the Font Access API
 */
interface LocalFont {
  /** Font family name (e.g., "Arial", "Helvetica") */
  family: string;
  
  /** Full font name (e.g., "Arial Bold") */
  fullName: string;
  
  /** Font style (e.g., "Bold", "Italic", "Regular") */
  style: string;
}

/**
 * Available font with its available styles
 */
export interface AvailableFont {
  /** Font family name */
  family: string;
  
  /** Array of available style names for this font */
  styles: string[];
}

/**
 * ============================================================================
 * Font Loading Functions
 * ============================================================================
 */

/**
 * Get list of available fonts with their styles
 * 
 * This function tries to use the Font Access API (Chrome/Edge) to get
 * system fonts. If unavailable, it falls back to web-safe fonts.
 * 
 * Browser Support:
 * - Chrome 87+ (with flags)
 * - Edge 87+
 * - Firefox: Uses fallback
 * - Safari: Uses fallback
 * 
 * @returns Array of fonts with their available styles
 *          Sorted alphabetically by family name
 * 
 * @example
 * ```typescript
 * const fonts = await getAvailableFonts();
 * // Returns: [
 * //   { family: 'Arial', styles: ['Bold', 'Italic', 'Regular'] },
 * //   { family: 'Helvetica', styles: ['Bold', 'Regular'] },
 * //   ...
 * // ]
 * ```
 */
export async function getAvailableFonts(): Promise<AvailableFont[]> {
  try {
    // Check if Font Access API is available
    if ('queryLocalFonts' in window) {
      // Get all fonts from the system
      const fonts: LocalFont[] = await (window as any).queryLocalFonts();
      
      // Group fonts by family and collect their styles
      const fontMap = new Map<string, string[]>();
      
      for (const font of fonts) {
        const family = font.family.trim();
        if (!family) continue;  // Skip fonts without family name
        
        // Initialize array for this family if new
        if (!fontMap.has(family)) {
          fontMap.set(family, []);
        }
        
        // Add style to family's style list (avoiding duplicates)
        const style = font.style.trim();
        if (!fontMap.get(family)!.includes(style)) {
          fontMap.get(family)!.push(style);
        }
      }
      
      // Convert map to sorted array
      const result: AvailableFont[] = [];
      fontMap.forEach((styles, family) => {
        result.push({
          family,
          styles: styles.sort()  // Sort styles alphabetically
        });
      });
      
      // Sort fonts alphabetically by family name
      return result.sort((a, b) => a.family.localeCompare(b.family));
    }
  } catch (error) {
    // Font Access API may throw errors in some cases
    // (e.g., permission denied, feature disabled)
    console.warn('Font Access API error:', error);
  }
  
  // Fall back to web-safe fonts
  // These fonts are available on all major browsers
  return fallbackFonts.map(family => ({
    family,
    styles: ['Regular', 'Bold', 'Italic', 'Bold Italic']
  }));
}

/**
 * Check if Font Access API is supported
 * 
 * Use this to determine if the browser supports queryLocalFonts.
 * 
 * @returns true if Font Access API is available
 * 
 * @example
 * ```typescript
 * if (isFontAccessSupported()) {
 *   // Can use system fonts
 * } else {
 *   // Use fallback fonts
 * }
 * ```
 */
export function isFontAccessSupported(): boolean {
  return 'queryLocalFonts' in window;
}
