/**
 * ============================================================================
 * Download Button Component
 * ============================================================================
 * 
 * Displays generated GIF properties and provides download functionality.
 * 
 * Features:
 * - Editable filename with auto-generated timestamp
 * - GIF properties display (dimensions, size, format)
 * - Download button with custom filename
 * - Create new GIF button
 * 
 * @module components/DownloadButton
 */

import React, { useState, useEffect } from 'react';

/**
 * Props for DownloadButton component
 */
interface DownloadButtonProps {
  /** Generated GIF blob */
  blob: Blob | null;
  
  /** Callback to reset and create new GIF */
  onReset: () => void;
  
  /** Callback to modify current GIF (back to style screen) */
  onModify: () => void;
  
  /** GIF width in pixels */
  width?: number;
  
  /** GIF height in pixels */
  height?: number;
}

/**
 * Download Button Component
 * 
 * Shows generated GIF information and handles download.
 */
export const DownloadButton: React.FC<DownloadButtonProps> = ({
  blob,
  onReset,
  width = 0,
  height = 0
}) => {
  // Editable filename state
  const [filename, setFilename] = useState('text-animation.gif');
  
  // Generate default filename with timestamp on mount
  useEffect(() => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '-');
    setFilename(`text-animation-${timestamp}.gif`);
  }, []);

  /**
   * Handle filename input changes
   * Ensures .gif extension is present
   */
  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let name = e.target.value;
    if (name && !name.toLowerCase().endsWith('.gif')) {
      name = name + '.gif';
    }
    setFilename(name);
  };

  /**
   * Trigger browser download with custom filename
   */
  const handleDownload = () => {
    if (blob && filename) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  if (!blob) return null;

  // Format file size for display
  const sizeKB = (blob.size / 1024).toFixed(1);
  const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="download-section">
      {/* Success message */}
      <div className="success-message">
        <span>GIF Generated Successfully!</span>
      </div>
      
      {/* GIF properties */}
      <div className="gif-properties">
        {/* Editable filename */}
        <div className="property-row filename-row">
          <span className="property-label">Filename</span>
          <input
            type="text"
            className="filename-input"
            value={filename}
            onChange={handleFilenameChange}
            placeholder="filename.gif"
          />
        </div>
        
        {/* Dimensions */}
        <div className="property-row">
          <span className="property-label">Dimensions</span>
          <span className="property-value">{width} × {height} px</span>
        </div>
        
        {/* File size */}
        <div className="property-row">
          <span className="property-label">File Size</span>
          <span className="property-value">{blob.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`}</span>
        </div>
        
        {/* Format */}
        <div className="property-row">
          <span className="property-label">Format</span>
          <span className="property-value">GIF</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="download-actions">
        <button
          type="button"
          className="download-btn"
          onClick={handleDownload}
        >
          Download GIF
        </button>
        
        <button
          type="button"
          className="reset-btn"
          onClick={onReset}
        >
          Create New
        </button>
      </div>
    </div>
  );
};
