/**
 * ============================================================================
 * GIF Generator Hook
 * ============================================================================
 * 
 * React hook that manages the complete GIF generation workflow.
 * 
 * This hook abstracts away the complexity of:
 * - Coordinating multiple processing stages
 * - Tracking progress through each stage
 * - Handling errors and aborting
 * - Managing state updates
 * 
 * Generation Pipeline:
 * 
 * ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
 * │  1. Process  │───▶│  2. Frames   │───▶│  3. Encode   │───▶│   4. Return   │
 * │    Text      │    │   Generate   │    │     GIF      │    │     Blob      │
 * └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
 *       30%                 50%              50-95%              100%
 * 
 * Progress Distribution:
 * - 0-30%: Text processing (wrapping, dimension calculation)
 * - 30-50%: Frame generation (rendering each frame)
 * - 50-95%: GIF encoding (Web Worker processing)
 * - 100%: Complete
 * 
 * @module useGifGenerator
 */

import { useState, useCallback, useRef } from 'react';
import { TextStyle, GenerationState, AnimationSettings } from '../types';
import { processText } from '../core/textProcessor';
import { generateFrames } from '../core/frameGenerator';
import { encodeFramesToGif } from '../core/gifEncoder';

/**
 * ============================================================================
 * Hook Definition
 * ============================================================================
 */

/**
 * Custom hook for GIF generation
 * 
 * This hook provides a complete interface for generating GIF animations
 * from text input, including progress tracking and error handling.
 * 
 * @returns Object containing:
 * - isGenerating: Whether generation is currently running
 * - progress: Progress percentage (0-100)
 * - error: Error message string if generation failed
 * - blob: Generated GIF Blob if successful
 * - generate: Function to start generation
 * - abort: Function to cancel ongoing generation
 * - reset: Function to reset all state
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { isGenerating, progress, blob, generate, reset } = useGifGenerator();
 * 
 *   const handleGenerate = async () => {
 *     const result = await generate(text, width, height, style, animation);
 *     if (result) {
 *       // GIF is ready
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleGenerate} disabled={isGenerating}>
 *         {isGenerating ? `Generating... ${progress}%` : 'Generate GIF'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGifGenerator() {
  // Generation state
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
    blob: null
  });
  
  // Ref for abort flag
  // Using ref instead of state to avoid stale closures in async operations
  // This allows checking abort status inside async callbacks
  const abortRef = useRef(false);
  
  /**
   * Generate a GIF from text
   * 
   * This function orchestrates the complete generation pipeline:
   * 1. Process text into lines
   * 2. Generate animation frames
   * 3. Encode frames to GIF format
   * 
   * Progress is updated at each stage to provide feedback.
   * 
   * @param text - Raw input text to animate
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   * @param style - Complete styling configuration
   * @param animationSettings - Animation timing configuration
   * @returns Promise resolving to GIF Blob, or null if cancelled
   */
  const generate = useCallback(async (
    text: string,
    width: number,
    height: number,
    style: TextStyle,
    animationSettings?: AnimationSettings
  ): Promise<Blob | null> => {
    // Initialize state for new generation
    setState({
      isGenerating: true,
      progress: 0,
      error: null,
      blob: null
    });
    
    abortRef.current = false;  // Reset abort flag
    
    try {
      // =====================================================================
      // STAGE 1: Process Text (0-30%)
      // =====================================================================
      // Wrap text into lines and calculate dimensions
      // This uses the textProcessor module
      
      const processed = processText(text, style.font);
      
      // Validate processing results
      if (processed.lines.length === 0) {
        throw new Error('Could not process text into lines');
      }
      
      // Update progress after first stage
      setState(prev => ({ ...prev, progress: 30 }));
      
      // Check for abort between stages
      if (abortRef.current) {
        setState(prev => ({ ...prev, isGenerating: false }));
        return null;
      }
      
      // =====================================================================
      // STAGE 2: Generate Frames (30-50%)
      // =====================================================================
      // Create animation frames with typewriter reveal effect
      // This uses the frameGenerator module
      
      const frames = generateFrames(
        processed.lines,
        width,
        height,
        style,
        animationSettings
      );
      
      // Validate frame generation
      if (frames.length === 0) {
        throw new Error('No frames generated');
      }
      
      // Update progress after frame generation
      setState(prev => ({ ...prev, progress: 50 }));
      
      // =====================================================================
      // STAGE 3: Encode to GIF (50-95%)
      // =====================================================================
      // Convert frames to GIF format using gif.js
      // This runs in a Web Worker for better performance
      
      const blob = await encodeFramesToGif(
        frames,
        {
          width,
          height,
          workers: 2,      // Parallel workers for speed
          quality: 1,       // Best quality
          repeat: 0,       // Loop forever
          transparent: style.transparent
        },
        (encodingProgress) => {
          // Map gif.js 0-1 progress to our 50-95% range
          setState(prev => ({
            ...prev,
            progress: 50 + Math.floor(encodingProgress * 45)
          }));
        }
      );
      
      // Check for abort after encoding
      if (abortRef.current) {
        setState(prev => ({ ...prev, isGenerating: false }));
        return null;
      }
      
      // =====================================================================
      // STAGE 4: Complete (100%)
      // =====================================================================
      // Update final state with blob
      setState({
        isGenerating: false,
        progress: 100,
        error: null,
        blob
      });
      
      return blob;
    } catch (error) {
      // Handle any errors during generation
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState({
        isGenerating: false,
        progress: 0,
        error: errorMessage,
        blob: null
      });
      
      return null;
    }
  }, []);
  
  /**
   * Abort the current generation
   * 
   * Note: This sets a flag that is checked between processing stages.
   * It cannot immediately stop an in-progress gif.js render,
   * but will prevent the result from being used.
   */
  const abort = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({
      ...prev,
      isGenerating: false,
      error: 'Generation cancelled'
    }));
  }, []);
  
  /**
   * Reset all state to initial values
   * 
   * Use this when starting a new GIF or when the user
   * wants to clear the current result.
   */
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      error: null,
      blob: null
    });
  }, []);
  
  // Return all state and methods
  return {
    ...state,
    generate,
    abort,
    reset
  };
}
