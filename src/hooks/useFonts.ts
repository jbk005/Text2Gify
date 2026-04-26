/**
 * ============================================================================
 * Font Loading Hook
 * ============================================================================
 * 
 * React hook for loading and accessing available fonts.
 * 
 * This hook provides:
 * - Font list loading with caching
 * - Loading state management
 * - Helper function to get styles for a specific font
 * - Manual refresh capability
 * 
 * Loading Behavior:
 * 
 * 1. On mount: Load fonts asynchronously
 * 2. Cache results: Don't reload on subsequent renders
 * 3. Manual refresh: Can force reload if needed
 * 
 * @module useFonts
 */

import { useState, useEffect, useCallback } from 'react';
import { getAvailableFonts, AvailableFont } from '../core/fonts/fontLoader';

/**
 * ============================================================================
 * Hook Return Type
 * ============================================================================
 */

/**
 * Return type for the useFonts hook
 */
export interface UseFontsReturn {
  /** 
   * List of available fonts with their styles
   * 
   * Each font has a family name and array of available styles.
   * Example: [{ family: 'Arial', styles: ['Regular', 'Bold'] }]
   */
  fonts: AvailableFont[];
  
  /** 
   * Whether fonts are currently loading
   * 
   * True during initial load and refresh operations.
   */
  loading: boolean;
  
  /** 
   * Get available styles for a specific font family
   * 
   * @param family - The font family name
   * @returns Array of style names available for that font
   * 
   * @example
   * ```typescript
   * const styles = getStylesForFont('Arial');
   * // Returns: ['Regular', 'Bold', 'Italic', 'Bold Italic']
   * ```
   */
  getStylesForFont: (family: string) => string[];
  
  /** 
   * Force refresh the font list
   * 
   * Useful if fonts may have changed (rare) or
   * if initial load failed.
   */
  refreshFonts: () => Promise<void>;
}

/**
 * ============================================================================
 * Hook Implementation
 * ============================================================================
 */

/**
 * Hook to load and access available fonts
 * 
 * This hook manages font loading state and provides
 * convenient access to the font list and styles.
 * 
 * @returns Object with font loading state and helper functions
 */
export function useFonts(): UseFontsReturn {
  // Font list state
  const [fonts, setFonts] = useState<AvailableFont[]>([]);
  
  // Loading indicator
  const [loading, setLoading] = useState(true);
  
  // Cache flag to prevent multiple loads
  const [cached, setCached] = useState(false);

  /**
   * Load fonts from the system or fallback list
   * 
   * Uses caching to avoid redundant loads.
   * Called automatically on mount.
   */
  const loadFonts = useCallback(async () => {
    // Skip if already cached
    if (cached) return;
    
    setLoading(true);
    try {
      // Get fonts from fontLoader module
      // This tries Font Access API first, falls back to web-safe fonts
      const availableFonts = await getAvailableFonts();
      setFonts(availableFonts);
      setCached(true);
    } catch (error) {
      console.warn('Failed to load fonts:', error);
      setFonts([]);  // Reset to empty on error
    } finally {
      setLoading(false);
    }
  }, [cached]);

  // Load fonts on component mount
  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  /**
   * Get available styles for a specific font family
   * 
   * Searches the fonts array for matching family.
   * Returns ['Regular'] as fallback if font not found.
   * 
   * @param family - Font family name to look up
   * @returns Array of available style names
   */
  const getStylesForFont = useCallback((family: string): string[] => {
    const font = fonts.find(f => f.family === family);
    return font?.styles || ['Regular'];
  }, [fonts]);

  /**
   * Force refresh the font list
   * 
   * Clears cache and reloads fonts.
   * Use this if fonts may have changed since initial load.
   */
  const refreshFonts = useCallback(async () => {
    setCached(false);
    setLoading(true);
    try {
      const availableFonts = await getAvailableFonts();
      setFonts(availableFonts);
      setCached(true);
    } catch (error) {
      console.warn('Failed to refresh fonts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fonts,
    loading,
    getStylesForFont,
    refreshFonts
  };
}
