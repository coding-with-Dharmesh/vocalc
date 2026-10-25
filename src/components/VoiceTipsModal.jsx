import React, { useEffect } from 'react';
import { X, Mic, CheckCircle, Volume2, Sparkles, Languages, Atom } from 'lucide-react';

export default function VoiceTipsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tips-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Mic size={18} />
            </div>
            <div>
              <h2 id="tips-modal-title" className="modal-title">Voice Command Guide (English &amp; हिन्दी)</h2>
              <p className="modal-subtitle">Speak naturally in plain English, Hindi, or Hinglish</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close guide"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Scientific Math Voice Section */}
          <div className="guide-section" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '14px', background: 'rgba(56, 189, 248, 0.05)' }}>
            <h3 className="guide-section-title" style={{ color: '#38bdf8' }}>
              <Atom size={16} /> Trigonometry, Logarithms &amp; Constants (Scientific)
            </h3>
            <div className="guide-grid">
              <div className="guide-card">
                <span className="guide-label">Trigonometry</span>
                <span className="guide-say">“Sin 90”, “Cos 0”, “Tan 45”</span>
                <span className="guide-result">sin(90) = 1, cos(0) = 1, tan(45) = 1</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">Logarithms</span>
                <span className="guide-say">“Log 100”, “Natural log of e”</span>
                <span className="guide-result">log₁₀(100) = 2, ln(e) = 1</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">Constants</span>
                <span className="guide-say">“2 times pi”, “Pi squared”, “e squared”</span>
                <span className="guide-result">2π ≈ 6.283, π² ≈ 9.869, e² ≈ 7.389</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">Powers &amp; Roots</span>
                <span className="guide-say">“2 to the power of 3”, “Square root of 144”</span>
                <span className="guide-result">2³ = 8, √144 = 12</span>
              </div>
            </div>
          </div>

          {/* Hindi Voice Equations Section */}
          <div className="guide-section" style={{ border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '14px', background: 'rgba(139, 92, 246, 0.05)' }}>
            <h3 className="guide-section-title" style={{ color: '#a78bfa' }}>
              <Languages size={16} /> हिन्दी आवाज़ में समीकरण (Hindi Spoken Equations)
            </h3>
            <div className="guide-grid">
              <div className="guide-card">
                <span className="guide-label">त्रिकोणमिति (Trigonometry)</span>
                <span className="guide-say">“साइन 90”, “कॉस 0”, “टैन 45”</span>
                <span className="guide-result">sin(90) = 1, cos(0) = 1</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">लघुगणक (Logarithms)</span>
                <span className="guide-say">“लॉग 100”, “नेचुरल लॉग e”</span>
                <span className="guide-result">log(100) = 2, ln(e) = 1</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">पाई और स्थिरांक (Constants)</span>
                <span className="guide-say">“पाई गुना 2” / “2 पाई”</span>
                <span className="guide-result">2π ≈ 6.283185...</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">प्रतिशत (Percentage)</span>
                <span className="guide-say">“240 का 15 प्रतिशत क्या है?”</span>
                <span className="guide-result">(15 ÷ 100) × 240 = 36</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">वर्गमूल (Square Root)</span>
                <span className="guide-say">“एक सौ चौवालीस का वर्गमूल क्या होगा?”</span>
                <span className="guide-result">√144 = 12 (उत्तर: बारह)</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">घात (Powers)</span>
                <span className="guide-say">“दो की घात तीन” / “पाँच का वर्ग”</span>
                <span className="guide-result">2³ = 8 / 5² = 25</span>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <em>💡 AI उत्तर भी स्पष्ट हिन्दी में बोलकर सुनाएगा (जैसे: "उत्तर है बयालीस")।</em>
            </div>
          </div>

          {/* Standard Calculations */}
          <div className="guide-section">
            <h3 className="guide-section-title">
              <Sparkles size={15} /> Standard Calculations
            </h3>
            <div className="guide-grid">
              <div className="guide-card">
                <span className="guide-label">Addition</span>
                <span className="guide-say">“25 plus 17”</span>
                <span className="guide-result">25 + 17 = 42</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">Subtraction</span>
                <span className="guide-say">“100 minus 45”</span>
                <span className="guide-result">100 − 45 = 55</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">Multiplication</span>
                <span className="guide-say">“9 times 8”</span>
                <span className="guide-result">9 × 8 = 72</span>
              </div>
              <div className="guide-card">
                <span className="guide-label">Division</span>
                <span className="guide-say">“144 divided by 12”</span>
                <span className="guide-result">144 ÷ 12 = 12</span>
              </div>
            </div>
          </div>

          {/* Parentheses & Advanced Math */}
          <div className="guide-section">
            <h3 className="guide-section-title">
              <Sparkles size={15} /> Parentheses &amp; Natural Language Prepositions
            </h3>
            <div className="guide-list">
              <div className="guide-list-item">
                <CheckCircle size={15} className="item-icon" />
                <div>
                  <span className="item-say">“Open parenthesis 5 plus 3 close parenthesis times 2”</span>
                  <span className="item-converted">Evaluates: (5 + 3) × 2 = 16</span>
                </div>
              </div>
              <div className="guide-list-item">
                <CheckCircle size={15} className="item-icon" />
                <div>
                  <span className="item-say">“Add 25 to 75” / “Subtract 25 from 75”</span>
                  <span className="item-converted">Evaluates: 25 + 75 = 100, 75 − 25 = 50</span>
                </div>
              </div>
              <div className="guide-list-item">
                <CheckCircle size={15} className="item-icon" />
                <div>
                  <span className="item-say">“Three point five times two”</span>
                  <span className="item-converted">Evaluates: 3.5 × 2 = 7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Commands & Controls */}
          <div className="guide-section">
            <h3 className="guide-section-title">
              <Volume2 size={15} /> Voice Commands &amp; Control
            </h3>
            <div className="guide-commands-row">
              <div className="command-chip">
                <code>“Clear”</code> / <code>“साफ़ करें”</code>
                <span>Resets calculation</span>
              </div>
              <div className="command-chip">
                <code>“Delete”</code> / <code>“हटाएं”</code>
                <span>Removes last character</span>
              </div>
              <div className="command-chip">
                <code>“Calculate”</code> / <code>“बराबर”</code>
                <span>Solves equation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-action-btn" onClick={onClose}>
            Got it, let's calculate
          </button>
        </div>
      </div>
    </div>
  );
}
