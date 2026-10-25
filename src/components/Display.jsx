import React, { useState } from 'react';
import { Copy, Check, Delete, RotateCcw, AlertCircle, HelpCircle, X, Volume2 } from 'lucide-react';

export default function Display({
  expression,
  result,
  previewResult,
  error,
  clarification,
  voiceTranscript,
  isListening,
  calcMode = 'basic',
  angleMode = 'deg',
  onClear,
  onBackspace,
  onResolveClarification,
  onDismissClarification,
  onSpeakResult
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = result !== null && result !== '' ? result.toString() : expression;
    if (!textToCopy) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Human friendly expression display (render standard operators, powers, roots, and constants nicely)
  const formattedDisplayExpr = expression
    ? expression
        .replace(/sqrt\(/g, '√(')
        .replace(/cbrt\(/g, '∛(')
        .replace(/\bpi\b/g, 'π')
        .replace(/\^2\b/g, '²')
        .replace(/\^3\b/g, '³')
        .replace(/\^/g, ' ^ ')
        .replace(/\*/g, ' × ')
        .replace(/\//g, ' ÷ ')
        .replace(/-/g, ' − ')
        .replace(/\+/g, ' + ')
        .replace(/\s+/g, ' ')
        .trim()
    : '0';

  return (
    <div className="calculator-display-card" role="region" aria-label="Calculator Display">
      {/* Top Bar with Voice Transcript or Mode Status */}
      <div className="display-top-bar">
        <div className="display-status-area">
          {isListening ? (
            <div className="voice-listening-indicator" role="status" aria-live="polite">
              <span className="pulsing-dot" aria-hidden="true"></span>
              <span className="listening-label">
                {voiceTranscript ? `Hearing: "${voiceTranscript}"` : 'Listening for equation...'}
              </span>
            </div>
          ) : voiceTranscript ? (
            <div className="voice-heard-indicator" role="status" aria-live="polite">
              <span className="voice-icon-pill" aria-hidden="true">Voice</span>
              <span className="heard-text">"{voiceTranscript}"</span>
            </div>
          ) : (
            <div className="display-mode-label">
              <span className="mode-pill-tag">
                {calcMode === 'scientific' ? `Scientific · ${angleMode.toUpperCase()}` : 'Basic Mode'}
              </span>
            </div>
          )}
        </div>

        {/* Display Actions (Copy, Backspace, Clear) */}
        <div className="display-actions">
          {expression && (
            <button
              type="button"
              className="display-mini-btn"
              onClick={onBackspace}
              aria-label="Delete last character"
              title="Delete (Backspace)"
            >
              <Delete size={15} />
            </button>
          )}

          {expression && (
            <button
              type="button"
              className="display-mini-btn"
              onClick={onClear}
              aria-label="Clear all"
              title="Clear (Escape)"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {result !== null && onSpeakResult && (
            <button
              type="button"
              className="display-mini-btn speak-result-btn"
              onClick={onSpeakResult}
              aria-label="Speak answer aloud"
              title="Speak answer aloud"
            >
              <Volume2 size={14} className="speak-mini-icon" />
              <span className="mini-btn-text">Speak</span>
            </button>
          )}

          <button
            type="button"
            className={`display-mini-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            disabled={!expression && result === null}
            aria-label={copied ? 'Copied to clipboard' : 'Copy result to clipboard'}
            title="Copy value"
          >
            {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
            <span className="mini-btn-text">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Ambiguity Clarification Banner */}
      {clarification && (
        <div className="clarification-panel" role="alert" aria-live="polite">
          <div className="clarification-header">
            <div className="clarification-title-wrap">
              <HelpCircle size={16} className="clarification-icon" />
              <span className="clarification-title">Clarification Needed</span>
            </div>
            {onDismissClarification && (
              <button
                type="button"
                className="clarification-dismiss-btn"
                onClick={onDismissClarification}
                aria-label="Dismiss clarification"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <p className="clarification-question">{clarification.question}</p>
          {clarification.options && clarification.options.length > 0 && (
            <div className="clarification-options-row">
              {clarification.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="clarification-option-btn"
                  onClick={() => onResolveClarification(opt)}
                  aria-label={`Select: ${opt.label}`}
                >
                  <span className="option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expression line */}
      <div
        className="display-expression-row"
        aria-label={`Expression: ${formattedDisplayExpr}`}
      >
        <span className={`display-expression-text ${expression ? 'has-content' : 'is-empty'}`}>
          {formattedDisplayExpr}
        </span>
      </div>

      {/* Main Result or Error Row */}
      <div className="display-result-row">
        {error ? (
          <div className="display-error-badge" role="alert" aria-live="assertive">
            <AlertCircle size={18} className="error-icon" />
            <span className="error-message">{error}</span>
          </div>
        ) : (
          <div className="display-result-content" role="status" aria-live="polite">
            {result !== null && result !== '' ? (
              <span className="display-result-main" aria-label={`Result: ${result}`}>
                = {result}
              </span>
            ) : previewResult !== null && previewResult !== '' && previewResult !== expression ? (
              <span className="display-result-preview" aria-label={`Live preview: ${previewResult}`}>
                ≈ {previewResult}
              </span>
            ) : (
              <span className="display-result-placeholder" aria-hidden="true">
                ready
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
