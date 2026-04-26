/**
 * ============================================================================
 * Input Panel Component
 * ============================================================================
 * 
 * The first screen where users enter text to animate.
 * 
 * Features:
 * - Single-line text input for simplicity
 * - Character count display
 * - Validation to ensure text is entered
 * - Loading state during submission
 * 
 * This is the entry point of the application flow.
 * 
 * @module components/InputPanel
 */

import React, { useState } from 'react';

/**
 * Props for InputPanel component
 */
interface InputPanelProps {
  /** Callback when user submits the form */
  onSubmit: (input: string) => void;
  
  /** Whether form is in loading state */
  isLoading: boolean;
}

/**
 * Text Input Form Component
 * 
 * Provides a simple text input with character count and validation.
 * 
 * @param props - Component props
 * @param props.onSubmit - Callback with input text on form submission
 * @param props.isLoading - Disable input during loading
 */
export const InputPanel: React.FC<InputPanelProps> = ({ onSubmit, isLoading }) => {
  // Input text state
  const [input, setInput] = useState('');
  
  // Error message state
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   * Validates input and calls onSubmit callback
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate: ensure text is not empty
    if (!input.trim()) {
      setError('Please enter some text');
      return;
    }
    
    onSubmit(input);
  };

  return (
    <div className="input-panel">
      <form onSubmit={handleSubmit}>
        {/* Main text input */}
        <input
          type="text"
          className="text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          disabled={isLoading}
        />
        
        {/* Footer with character count and error */}
        <div className="input-footer">
          <div className="char-count">{input.length} characters</div>
          {error && <div className="error-message">{error}</div>}
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="submit-btn"
          disabled={isLoading || !input.trim()}
        >
          Continue
        </button>
      </form>
    </div>
  );
};
