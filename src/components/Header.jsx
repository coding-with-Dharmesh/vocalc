import React from 'react';
import { Volume2, VolumeX, HelpCircle, Sparkles, Mic, Sun, Moon, Languages } from 'lucide-react';

export default function Header({
  isMuted,
  onToggleMute,
  onOpenTips,
  isListening,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage
}) {
  const isDark = theme === 'dark';

  return (
    <header className="header-container" role="banner">
      <div className="header-brand">
        <div className="brand-logo-wrapper" aria-hidden="true">
          <div className="brand-glow"></div>
          <div className="brand-icon">
            <Mic className="brand-mic-icon" size={20} />
            <span className="brand-calc-symbol">fx</span>
          </div>
        </div>
        <div className="brand-text">
          <div className="brand-title-row">
            <h1 className="brand-title">Vocalc</h1>
            <span className="brand-badge">
              <Sparkles size={11} className="badge-sparkle" />
              Voice AI
            </span>
          </div>
          <p className="brand-tagline">Intelligent Voice & Keypad Calculator</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Language Selector Toggle: English / Hindi */}
        <button
          type="button"
          className={`header-btn language-toggle-btn ${language === 'hi' ? 'active-lang' : ''}`}
          onClick={onToggleLanguage}
          aria-label={language === 'hi' ? 'Switch speaking voice to English' : 'बोलने की भाषा हिन्दी में बदलें (Switch to Hindi)'}
          title={language === 'hi' ? 'Voice language: Hindi (Click for English)' : 'Voice language: English (Click for Hindi)'}
        >
          <Languages size={18} className="lang-icon" />
          <span className="header-btn-label">
            {language === 'hi' ? 'हिन्दी' : 'English'}
          </span>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          className="header-btn theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
          <span className="header-btn-label">{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* Voice Guide Modal */}
        <button
          type="button"
          className="header-btn"
          onClick={onOpenTips}
          aria-label="View Voice Commands Guide"
          title="Voice Commands Guide"
        >
          <HelpCircle size={18} />
          <span className="header-btn-label">Voice Guide</span>
        </button>

        {/* Mute / Speech Output Toggle */}
        <button
          type="button"
          className={`header-btn ${isMuted ? 'muted' : 'active'}`}
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute speech synthesis' : 'Mute speech synthesis'}
          aria-pressed={!isMuted}
          title={isMuted ? 'Unmute voice results' : 'Mute voice results'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="header-btn-label">{isMuted ? 'Muted' : 'Speaking'}</span>
        </button>
      </div>
    </header>
  );
}
