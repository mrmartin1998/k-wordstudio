import { useState } from 'react';

export default function FormattingControls({
  fontSize,
  lineHeight,
  paragraphSpacing,
  readingMode,
  onFontSizeChange,
  onLineHeightChange,
  onParagraphSpacingChange,
  onReadingModeChange
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-base-200 rounded-lg">
      <div className="form-control">
        <label className="label">Font Size</label>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${fontSize === 'small' ? 'btn-active' : ''}`}
            onClick={() => onFontSizeChange('small')}
          >
            Small
          </button>
          <button 
            className={`btn btn-sm ${fontSize === 'medium' ? 'btn-active' : ''}`}
            onClick={() => onFontSizeChange('medium')}
          >
            Medium
          </button>
          <button 
            className={`btn btn-sm ${fontSize === 'large' ? 'btn-active' : ''}`}
            onClick={() => onFontSizeChange('large')}
          >
            Large
          </button>
        </div>
      </div>

      <div className="form-control">
        <label className="label">Line Height</label>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${lineHeight === 'compact' ? 'btn-active' : ''}`}
            onClick={() => onLineHeightChange('compact')}
          >
            Compact
          </button>
          <button 
            className={`btn btn-sm ${lineHeight === 'normal' ? 'btn-active' : ''}`}
            onClick={() => onLineHeightChange('normal')}
          >
            Normal
          </button>
          <button 
            className={`btn btn-sm ${lineHeight === 'relaxed' ? 'btn-active' : ''}`}
            onClick={() => onLineHeightChange('relaxed')}
          >
            Relaxed
          </button>
        </div>
      </div>

      <div className="form-control">
        <label className="label">Paragraph Spacing</label>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${paragraphSpacing === 'tight' ? 'btn-active' : ''}`}
            onClick={() => onParagraphSpacingChange('tight')}
          >
            Tight
          </button>
          <button 
            className={`btn btn-sm ${paragraphSpacing === 'normal' ? 'btn-active' : ''}`}
            onClick={() => onParagraphSpacingChange('normal')}
          >
            Normal
          </button>
          <button 
            className={`btn btn-sm ${paragraphSpacing === 'loose' ? 'btn-active' : ''}`}
            onClick={() => onParagraphSpacingChange('loose')}
          >
            Loose
          </button>
        </div>
      </div>

      <div className="form-control">
        <label className="label">Reading Mode</label>
        <input 
          type="checkbox" 
          className="toggle toggle-primary" 
          checked={readingMode}
          onChange={(e) => onReadingModeChange(e.target.checked)}
        />
      </div>
    </div>
  );
} 