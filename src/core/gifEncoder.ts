/**
 * ============================================================================
 * GIF Encoder
 * ============================================================================
 * 
 * Handles encoding animation frames into GIF format using gif.js.
 * 
 * Why gif.js?
 * - Pure JavaScript GIF encoding (no server required)
 * - Runs in Web Workers (doesn't block UI)
 * - Produces well-compressed GIFs
 * - Supports transparency
 * 
 * Architecture:
 * 
 * ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 * │   Frames    │───▶│   Encoder   │───▶│  GIF Blob   │
 * │  [ImageData]│    │  (gif.js)   │    │  [Binary]   │
 * └─────────────┘    └─────────────┘    └─────────────┘
 * 
 * The encoder:
 * 1. Loads gif.js library (lazy, on first encode)
 * 2. Creates a GIF instance with desired settings
 * 3. Adds each frame with its delay
 * 4. Triggers rendering (runs in Web Worker)
 * 5. Returns progress updates and final blob
 * 
 * Transparency Handling:
 * - Solid backgrounds: Frame data already contains background color
 *   We copy ImageData directly to canvas
 * - Transparent backgrounds: Frames have alpha channel
 *   Canvas is cleared first, then frame is drawn on top
 * 
 * @module gifEncoder
 */

import { Frame } from '../types';
import { GIF_QUALITY } from '../utils/constants';

/**
 * ============================================================================
 * Type Definitions
 * ============================================================================
 */

/**
 * Configuration options for the GIF encoder
 */
export interface GifEncoderOptions {
  /** Canvas width in pixels */
  width: number;
  
  /** Canvas height in pixels */
  height: number;
  
  /** Number of web workers for encoding (default: 2) */
  workers?: number;
  
  /** Output quality 1-30 (lower = better, default: 1) */
  quality?: number;
  
  /** Number of loops (0 = infinite, default: 0) */
  repeat?: number;
  
  /** Whether to include transparency (default: false) */
  transparent?: boolean;
  
  /** Background color for solid backgrounds */
  backgroundColor?: string;
}

/**
 * Minimal type definition for gif.js library
 * 
 * gif.js is loaded dynamically and provides the GIF constructor.
 * We define only the methods we use to keep types minimal.
 */
interface GifJsInstance {
  new(options: {
    workers: number;
    quality: number;
    width: number;
    height: number;
    workerScript: string;
    repeat: number;
    transparent?: string | null;
    background?: string;
    debug?: boolean;
  }): GifJsInstance;
  
  /**
   * Add a frame to the GIF
   * 
   * @param ctx - Canvas context with rendered frame
   * @param options - Frame options
   * @param options.copy - Whether to copy pixel data (true recommended)
   * @param options.delay - Frame delay in centiseconds
   * @param options.dispose - Disposal method (1 = restore to background)
   */
  addFrame(
    ctx: CanvasRenderingContext2D, 
    options: { copy: boolean; delay: number; dispose?: number }
  ): void;
  
  /**
   * Event handlers
   */
  on(event: 'start' | 'abort', callback: () => void): void;
  on(event: 'progress', callback: (progress: number) => void): void;
  on(event: 'finished', callback: (blob: Blob) => void): void;
  
  /** Start GIF rendering (runs in Web Worker) */
  render(): void;
  
  /** Cancel ongoing rendering */
  abort(): void;
}

/**
 * ============================================================================
 * Library Loading
 * ============================================================================
 */

/**
 * Cached gif.js constructor
 * Initialized once, reused for all subsequent encodings
 */
let GIFConstructor: GifJsInstance | null = null;

/**
 * Load gif.js library dynamically
 * 
 * gif.js is loaded via dynamic script injection because:
 * 1. It's a legacy library that doesn't support ES modules well
 * 2. It includes a Web Worker that needs to be loaded separately
 * 3. We only load it when first needed (lazy loading)
 * 
 * The library files are served from /public (gif.js and gif.worker.js)
 * 
 * @returns Promise resolving to gif.js constructor
 */
async function loadGifJs(): Promise<GifJsInstance> {
  // Return cached constructor if already loaded
  if (GIFConstructor) return GIFConstructor;
  
  return new Promise((resolve, reject) => {
    // Check if already loaded (e.g., from previous encoding)
    if ((window as any).GIF) {
      GIFConstructor = (window as any).GIF;
      resolve(GIFConstructor as GifJsInstance);
      return;
    }
    
    // Create script element for dynamic loading
    const script = document.createElement('script');
    script.src = '/gif.js';
    
    script.onload = () => {
      // gif.js exposes itself as window.GIF
      GIFConstructor = (window as any).GIF;
      resolve(GIFConstructor as GifJsInstance);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load gif.js library. Check that gif.js and gif.worker.js are in the /public directory.'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * ============================================================================
 * Encoder Factory
 * ============================================================================
 */

/**
 * Create a GIF encoder instance
 * 
 * Returns an encoder object with methods to:
 * - Add frames to the encoding queue
 * - Start rendering
 * - Abort encoding
 * 
 * Usage pattern:
 * ```typescript
 * const encoder = createGifEncoder({ width: 400, height: 100 });
 * frames.forEach(frame => encoder.addFrame(frame.imageData, frame.delay));
 * const blob = await encoder.render(progress => console.log(progress));
 * ```
 * 
 * @param options - Encoder configuration
 * @returns Encoder object with addFrame, render, and abort methods
 */
export function createGifEncoder(
  options: GifEncoderOptions
): {
  addFrame: (frame: ImageData, delay: number) => void;
  render: (onProgress?: (progress: number) => void) => Promise<Blob>;
  abort: () => void;
} {
  // Destructure with defaults
  const {
    width,
    height,
    workers = GIF_QUALITY.workers,
    quality = GIF_QUALITY.quality,
    repeat = 0,
    transparent = false,
    backgroundColor = '#000000'
  } = options;
  
  let gif: GifJsInstance | null = null;
  let aborted = false;
  
  // Store frames until render is called
  const frames: { imageData: ImageData; delay: number }[] = [];
  
  return {
    /**
     * Add a frame to the encoding queue
     * 
     * Frames are stored temporarily until render() is called.
     * This allows batching all frames before starting the encode process.
     * 
     * @param frame - ImageData containing pixel data
     * @param delay - Frame display duration in centiseconds
     */
    addFrame(frame: ImageData, delay: number): void {
      if (aborted) return;
      frames.push({ imageData: frame, delay });
    },
    
    /**
     * Render all queued frames to a GIF
     * 
     * This is an async operation that:
     * 1. Loads gif.js if not already loaded
     * 2. Creates GIF instance with configuration
     * 3. Draws each frame to a canvas
     * 4. Triggers Web Worker encoding
     * 5. Returns progress updates via callback
     * 6. Resolves with final Blob when complete
     * 
     * @param onProgress - Optional callback receiving 0-1 progress
     * @returns Promise resolving to GIF Blob
     */
    async render(onProgress?: (progress: number) => void): Promise<Blob> {
      // Validate we have frames to encode
      if (aborted || frames.length === 0) {
        throw new Error('No frames to render');
      }
      
      try {
        // Step 1: Load gif.js library
        const GIF = await loadGifJs();
        
        // Check for abort between steps
        if (aborted) {
          throw new Error('Render aborted');
        }
        
        // Step 2: Initialize GIF encoder
        gif = new GIF({
          workers,           // Number of parallel workers
          quality,           // 1 = best quality
          width,             // Output width
          height,            // Output height
          workerScript: '/gif.worker.js',  // Web Worker script path
          repeat,            // 0 = loop forever
          transparent: transparent ? '#000000' : null,  // Transparent color or none
          background: transparent ? undefined : backgroundColor,
          debug: false
        });
        
        // Step 3: Create canvas for drawing frames
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas 2D context');
        }
        
        // Step 4: Add each frame to the encoder
        for (let i = 0; i < frames.length; i++) {
          if (aborted) break;
          
          const { imageData, delay } = frames[i];
          
          // Create temporary canvas for ImageData
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (!tempCtx) continue;
          
          if (transparent) {
            // Transparent GIF: clear canvas, then draw frame
            // This preserves the transparent pixels from the frame
            ctx.clearRect(0, 0, width, height);
            tempCtx.putImageData(imageData, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
          } else {
            // Solid background: frame already has background baked in
            // Just copy ImageData directly (no compositing needed)
            ctx.putImageData(imageData, 0, 0);
          }
          
          // Add frame to GIF encoder
          // dispose: 1 means "restore to background" after each frame
          // This prevents frame accumulation issues
          gif.addFrame(ctx, { copy: true, delay: delay * 10, dispose: 1 });
        }
        
        // Check for abort after adding frames
        if (aborted) {
          throw new Error('Render aborted');
        }
        
        // Step 5: Set up event handlers and start rendering
        return new Promise((resolve) => {
          // Progress callback from Web Worker
          gif!.on('progress', (progress: number) => {
            if (onProgress) {
              onProgress(progress);
            }
          });
          
          // Final callback when encoding complete
          gif!.on('finished', (blob: Blob) => {
            resolve(blob);
          });
          
          // Start the encoding process (runs in Web Worker)
          gif!.render();
        });
      } catch (error) {
        throw error;
      }
    },
    
    /**
     * Abort the current encoding operation
     * 
     * Can be called at any time to cancel encoding.
     * Will prevent any further frames from being added or encoded.
     */
    abort(): void {
      aborted = true;
      if (gif) {
        gif.abort();
        gif = null;
      }
    }
  };
}

/**
 * ============================================================================
 * Convenience Function
 * ============================================================================
 */

/**
 * Encode an array of frames to a GIF blob
 * 
 * This is a convenience wrapper that:
 * 1. Creates an encoder
 * 2. Adds all frames
 * 3. Triggers rendering
 * 
 * For more control over the encoding process, use createGifEncoder directly.
 * 
 * @param frames - Array of Frame objects from frameGenerator
 * @param options - Encoder configuration
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to GIF Blob
 * 
 * @example
 * ```typescript
 * const blob = await encodeFramesToGif(frames, {
 *   width: 400,
 *   height: 100,
 *   transparent: false,
 *   backgroundColor: '#000000'
 * }, progress => console.log(`Encoding: ${Math.round(progress * 100)}%`));
 * 
 * // Use the blob for download or display
 * const url = URL.createObjectURL(blob);
 * ```
 */
export async function encodeFramesToGif(
  frames: Frame[],
  options: GifEncoderOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  // Create encoder and add all frames
  const encoder = createGifEncoder(options);
  
  frames.forEach(frame => {
    encoder.addFrame(frame.imageData, frame.delay);
  });
  
  // Trigger rendering
  return encoder.render(onProgress);
}
