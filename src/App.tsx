/**
 * ============================================================================
 * Main Application Component
 * ============================================================================
 * 
 * This is the root component that orchestrates the entire application.
 * 
 * Application Flow:
 * 
 * ┌─────────┐    ┌─────────┐    ┌─────────┐
 * │  INPUT  │───▶│  STYLE  │───▶│ RESULT  │
 * └─────────┘    └─────────┘    └─────────┘
 *                    │               │
 *                    │               │
 *     Enter text     │    Configure  │    Download
 *                    │    & Preview  │    GIF
 *                    ▼               │
 *              ┌─────────┐           │
 *              │ BACK TO │◀──────────┘
 *              │  INPUT  │
 *              └─────────┘
 * 
 * Screen Definitions:
 * 
 * 1. INPUT Screen
 *    - User enters text to animate
 *    - Simple text input with character count
 *    - Continue button to proceed
 * 
 * 2. STYLE Screen
 *    - Preview canvas with live animation
 *    - Style customization panel
 *    - Background, colors, fonts, animation settings
 *    - Generate GIF button
 * 
 * 3. RESULT Screen
 *    - Display generated GIF
 *    - GIF properties (dimensions, size)
 *    - Editable filename
 *    - Download and create new options
 * 
 * State Management:
 * 
 * - screen: Current screen ('input' | 'style' | 'result')
 * - style: Complete styling configuration
 * - animationSettings: Animation timing
 * - processedText: Processed lines and dimensions
 * - blob: Generated GIF (from useGifGenerator hook)
 * 
 * @module App
 */

import React, { useState, useCallback, Component, ReactNode } from 'react';
import { InputPanel } from './components/InputPanel';
import { StylePanel } from './components/StylePanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { DownloadButton } from './components/DownloadButton';
import { useGifGenerator } from './hooks/useGifGenerator';
import { TextStyle, ExtractedContent, ProcessedText, AnimationSettings } from './types';
import { DEFAULT_STYLE, FIRST_FRAME_HOLD_MS, ANIMATION_REVEAL_MS } from './utils/constants';
import { processText } from './core/textProcessor';

/**
 * Screen type representing the three main app screens
 */
type Screen = 'input' | 'style' | 'result';

/**
 * Error boundary state for catching render errors
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches any React render errors and displays a fallback UI.
 * This prevents the entire app from crashing on component errors.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /** Update state when an error occurs */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main Application Component
 */
const App: React.FC = () => {
  // ========================================================================
  // Screen State
  // ========================================================================
  
  /** Current screen: 'input' | 'style' | 'result' */
  const [screen, setScreen] = useState<Screen>('input');
  
  /** Raw text content from user input */
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  
  /** Processed text with lines and dimensions */
  const [processedText, setProcessedText] = useState<ProcessedText | null>(null);
  
  /** Text styling configuration */
  const [style, setStyle] = useState<TextStyle>(DEFAULT_STYLE);
  
  /** Animation timing settings */
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>({
    firstFrameHold: FIRST_FRAME_HOLD_MS,
    revealDuration: ANIMATION_REVEAL_MS
  });
  
  /** Preview animation playing state */
  const [previewPlaying, setPreviewPlaying] = useState(false);
  
  /** Application-level error message */
  const [appError, setAppError] = useState<string | null>(null);

  // ========================================================================
  // GIF Generation Hook
  // ========================================================================
  
  const {
    isGenerating,  // Whether generation is in progress
    progress,      // Progress percentage (0-100)
    error,         // Error message from generation
    blob,          // Generated GIF blob
    generate,      // Function to start generation
    reset          // Function to reset state
  } = useGifGenerator();

  // ========================================================================
  // Event Handlers
  // ========================================================================
  
  /**
   * Handle text input submission
   * Processes text and navigates to style screen
   */
  const handleInputSubmit = useCallback((input: string) => {
    setAppError(null);
    
    if (!input.trim()) {
      setAppError('Please enter some text');
      return;
    }
    
    // Process text to wrap lines and calculate dimensions
    const processed = processText(input, style.font);
    setProcessedText(processed);
    setExtractedContent({ text: input });
    setScreen('style');
  }, [style.font]);

  /**
   * Handle style changes
   * Updates style and reprocesses text only when font family or size changes
   */
  const handleStyleChange = useCallback((newStyle: TextStyle) => {
    const oldStyle = style;
    setStyle(newStyle);
    
    // Always reprocess text when any font property changes
    // This ensures canvas dimensions match current font settings
    if (extractedContent) {
      const processed = processText(extractedContent.text, newStyle.font);
      setProcessedText(processed);
    }
  }, [extractedContent]);

  /**
   * Handle animation settings changes
   */
  const handleAnimationChange = useCallback((newSettings: AnimationSettings) => {
    setAnimationSettings(newSettings);
  }, []);

  /**
   * Handle GIF generation
   * Starts the generation process and navigates to result on success
   */
  const handleGenerate = useCallback(async () => {
    if (!extractedContent || !processedText) return;
    
    setAppError(null);
    setPreviewPlaying(false);  // Stop preview during generation
    
    try {
      const resultBlob = await generate(
        extractedContent.text,
        processedText.width,
        processedText.height,
        style,
        animationSettings
      );
      
      if (resultBlob) {
        setScreen('result');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate GIF';
      setAppError(message);
    }
  }, [extractedContent, processedText, style, animationSettings, generate]);

  /**
   * Handle reset - return to initial state
   */
  const handleReset = useCallback(() => {
    reset();
    setExtractedContent(null);
    setProcessedText(null);
    setStyle(DEFAULT_STYLE);
    setAnimationSettings({
      firstFrameHold: FIRST_FRAME_HOLD_MS,
      revealDuration: ANIMATION_REVEAL_MS
    });
    setScreen('input');
    setPreviewPlaying(false);
    setAppError(null);
  }, [reset]);

  /**
   * Handle back to style from result
   */
  const handleBackToStyle = useCallback(() => {
    setScreen('style');
    reset();  // Clear the generated blob
  }, [reset]);

  // Combine app errors with generation errors
  const displayError = appError || error;

  // ========================================================================
  // Render
  // ========================================================================
  
  return (
    <ErrorBoundary>
      <div className="app">
        {/* Header with branding */}
        <header className="app-header">
          <a
            href="https://jbk.framer.website/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-transform duration-200 hover:scale-105"
          >
            <strong className="gradient-text">JBK</strong>
          </a>
          <div className="app-header-content">
            <h1>Text to GIF</h1>
            <p>Create animated text GIFs</p>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="app-main">
          {/* INPUT SCREEN */}
          {screen === 'input' && (
            <InputPanel
              onSubmit={handleInputSubmit}
              isLoading={false}
            />
          )}
          
          {/* STYLE SCREEN */}
          {screen === 'style' && extractedContent && processedText && (
            <>
              {/* Preview canvas with live animation */}
              <PreviewCanvas
                text={extractedContent.text}
                style={style}
                isPlaying={previewPlaying}
                width={processedText.width}
                height={processedText.height}
                lines={processedText.lines}
                animationSettings={animationSettings}
              />
              
              {/* Play/Pause toggle button */}
              <button
                type="button"
                className="preview-toggle"
                onClick={() => setPreviewPlaying(!previewPlaying)}
              >
                {previewPlaying ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Play Preview
                  </>
                )}
              </button>
              
              {/* Style customization panel */}
              <StylePanel
                style={style}
                animationSettings={animationSettings}
                onChange={handleStyleChange}
                onAnimationChange={handleAnimationChange}
                onBack={() => setScreen('input')}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                progress={progress}
              />
            </>
          )}
          
          {/* RESULT SCREEN */}
          {screen === 'result' && (
            <>
              {/* GIF preview */}
              {blob && (
                <div className="result-preview">
                  <img
                    src={URL.createObjectURL(blob)}
                    alt="Generated GIF"
                  />
                </div>
              )}
              
              {/* Download and properties */}
              <DownloadButton
                blob={blob}
                onReset={handleReset}
                onModify={handleBackToStyle}
                width={processedText?.width ?? 0}
                height={processedText?.height ?? 0}
              />
            </>
          )}
          
          {/* Error banner */}
          {displayError && (
            <div className="error-banner">
              <span>{displayError}</span>
              <button onClick={handleReset}>Try Again</button>
            </div>
          )}
        </main>
        
        {/* Footer with branding */}
        <footer className="app-footer">
          {/* Left: Privacy text */}
          <div className="app-footer-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>No APIs - Privacy Friendly</span>
          </div>
          
          {/* Center: Social Media Icons */}
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-icon discord" title="Discord">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon github" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon linkedin" title="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://jbk.framer.website/" target="_blank" rel="noopener noreferrer" className="social-icon portfolio" title="Portfolio">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 10v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.45z" />
              </svg>
            </a>
          </div>
          
          {/* Right: Created by text */}
          <div className="app-footer-right">Created by <strong>JBK</strong>, Designer.</div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
