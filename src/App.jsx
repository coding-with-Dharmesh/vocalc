import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Display from './components/Display';
import VoiceControls from './components/VoiceControls';
import Keypad from './components/Keypad';
import History from './components/History';
import VoiceTipsModal from './components/VoiceTipsModal';
import { calculateExpression } from './utils/calculator';
import { parseSpeechToMath, detectVoiceCommand, isHindiSpeech } from './utils/speechParser';
import { speaker } from './utils/speechSynthesis';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import './App.css';

const HISTORY_STORAGE_KEY = 'vocalc_history_v1';
const MUTED_STORAGE_KEY = 'vocalc_muted_v1';
const THEME_STORAGE_KEY = 'vocalc_theme_v1';
const LANGUAGE_STORAGE_KEY = 'vocalc_language_v1';
const CALC_MODE_STORAGE_KEY = 'vocalc_calc_mode_v1';
const ANGLE_MODE_STORAGE_KEY = 'vocalc_angle_mode_v1';

export default function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [error, setError] = useState(null);
  const [clarification, setClarification] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Calculator mode: 'basic' (simple uncluttered) or 'scientific' (advanced)
  const [calcMode, setCalcMode] = useState(() => {
    try {
      const saved = localStorage.getItem(CALC_MODE_STORAGE_KEY);
      return saved === 'scientific' ? 'scientific' : 'basic';
    } catch {
      return 'basic';
    }
  });

  // Angle mode for trigonometry: 'deg' (degrees, default) or 'rad' (radians)
  const [angleMode, setAngleMode] = useState(() => {
    try {
      const saved = localStorage.getItem(ANGLE_MODE_STORAGE_KEY);
      return saved === 'rad' ? 'rad' : 'deg';
    } catch {
      return 'deg';
    }
  });

  // Sync calcMode and angleMode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CALC_MODE_STORAGE_KEY, calcMode);
    } catch {
      // ignore
    }
  }, [calcMode]);

  useEffect(() => {
    try {
      localStorage.setItem(ANGLE_MODE_STORAGE_KEY, angleMode);
    } catch {
      // ignore
    }
  }, [angleMode]);

  const handleToggleCalcMode = useCallback((newMode) => {
    setCalcMode((prev) => (newMode ? newMode : prev === 'basic' ? 'scientific' : 'basic'));
  }, []);

  const handleToggleAngleMode = useCallback(() => {
    setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'));
  }, []);

  // Language state: 'en' (English) or 'hi' (हिन्दी), persisted in localStorage
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  // Sync language to speech synthesis speaker
  useEffect(() => {
    speaker.setLanguage(language);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const handleToggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  // Theme state: 'dark' or 'light', persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sync theme to document element and meta theme-color
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#070b14' : '#f1f5f9');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Mute preference persisted in localStorage
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // History state persisted in localStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync mute state to speaker
  useEffect(() => {
    speaker.setMuted(isMuted);
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, String(isMuted));
    } catch {
      // ignore
    }
  }, [isMuted]);

  // Sync history state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Live preview calculation on expression change
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setPreviewResult(null);
      return;
    }

    // Only compute preview if it looks like a calculable expression with an operator or function
    if (/[+\-*/%^]|sqrt|cbrt|sin|cos|tan|log|ln|pi|e/.test(expression) && /[0-9)pie]$/.test(expression.trim())) {
      const calc = calculateExpression(expression, { angleMode });
      if (calc.success) {
        setPreviewResult(calc.formattedResult);
      } else {
        setPreviewResult(null);
      }
    } else {
      setPreviewResult(null);
    }
  }, [expression, angleMode]);

  // Add calculation to history (max 10 items)
  const addToHistory = useCallback((expr, res) => {
    const newItem = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      expression: expr,
      result: res,
      timestamp: new Date().toISOString()
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
  }, []);

  // Main evaluation handler
  const handleCalculate = useCallback((customExpr = null, overrideLanguage = null) => {
    const exprToCalc = customExpr !== null ? customExpr : expression;

    if (!exprToCalc || exprToCalc.trim() === '') {
      return;
    }

    const calc = calculateExpression(exprToCalc, { angleMode, autoCloseParentheses: true });
    const targetLang = overrideLanguage || language;

    if (calc.success) {
      if (calc.normalizedExpression && calc.normalizedExpression !== exprToCalc) {
        setExpression(calc.normalizedExpression);
      }
      setResult(calc.formattedResult);
      setError(null);
      addToHistory(calc.normalizedExpression || exprToCalc, calc.formattedResult);
      speaker.speakResult(calc.result, { language: targetLang });
    } else {
      setError(calc.error);
      setResult(null);
      speaker.speakResult(calc.error, { language: targetLang });
    }
  }, [expression, angleMode, language, addToHistory]);

  const handleSpeakCurrentResult = useCallback(() => {
    if (result !== null) {
      speaker.speakResult(result, { language });
    } else if (expression) {
      handleCalculate(expression);
    }
  }, [result, expression, language, handleCalculate]);

  // Voice recognition result callback
  const handleVoiceResult = useCallback((spokenText) => {
    if (!spokenText || !spokenText.trim()) return;

    setVoiceTranscript(spokenText);

    // Auto-detect if phrase was spoken in Hindi or if UI is toggled to Hindi
    const isSpokenHindi = isHindiSpeech(spokenText) || language === 'hi';
    const effectiveLang = isSpokenHindi ? 'hi' : 'en';

    // 1. Check if spoken phrase is a system command
    const cmd = detectVoiceCommand(spokenText);
    if (cmd) {
      if (cmd.command === 'CLEAR') {
        setExpression('');
        setResult(null);
        setError(null);
        setClarification(null);
        setPreviewResult(null);
        speaker.speakResult('Cleared', { language: effectiveLang });
        return;
      }
      if (cmd.command === 'DELETE') {
        setClarification(null);
        setExpression((prev) => prev.slice(0, -1));
        return;
      }
      if (cmd.command === 'EQUALS') {
        handleCalculate(null, effectiveLang);
        return;
      }
    }

    // 2. Parse spoken phrase to mathematical expression
    const parsed = parseSpeechToMath(spokenText, {
      previousResult: result,
      language: effectiveLang
    });

    // Handle ambiguous speech: prompt for clarification instead of guessing
    if (parsed.isAmbiguous && parsed.clarification) {
      setClarification(parsed.clarification);
      setError(null);
      speaker.speakResult(parsed.clarification.question, { language: effectiveLang });
      return;
    }

    setClarification(null);

    if (parsed.expression) {
      setExpression(parsed.expression);
      setError(null);

      if (parsed.autoCalculate) {
        handleCalculate(parsed.expression, effectiveLang);
      }
    } else {
      setError(isSpokenHindi ? 'आवाज़ समझ नहीं आई। कृपया पुनः प्रयास करें।' : 'Could not understand speech. Please try again.');
    }
  }, [handleCalculate, language, result]);

  // Voice recognition hook
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript: liveTranscript,
    errorMessage: speechError,
    startListening,
    stopListening,
    clearError: clearSpeechError
  } = useSpeechRecognition({
    language,
    onResult: handleVoiceResult
  });

  // Keypad Handlers
  const handleDigit = useCallback((digit) => {
    setError(null);
    setClarification(null);
    // If a calculation was just completed, start fresh with new digit
    if (result !== null) {
      setExpression(digit);
      setResult(null);
    } else {
      setExpression((prev) => prev + digit);
    }
  }, [result]);

  const handleOperator = useCallback((op) => {
    setError(null);
    setClarification(null);
    setExpression((prev) => {
      // If result is active, continue calculation with the result
      if (result !== null) {
        setResult(null);
        return `${result} ${op} `;
      }

      if (!prev) {
        // If starting with minus, allow unary minus
        return op === '-' ? '-' : '';
      }

      const trimmed = prev.trim();
      const lastChar = trimmed[trimmed.length - 1];

      // Replace trailing operator if one already exists
      if (['+', '-', '*', '/', '%', '^'].includes(lastChar)) {
        return trimmed.slice(0, -1).trim() + ` ${op} `;
      }

      return `${prev} ${op} `;
    });
  }, [result]);

  const handleDecimal = useCallback(() => {
    setError(null);
    if (result !== null) {
      setExpression('0.');
      setResult(null);
      return;
    }

    setExpression((prev) => {
      if (!prev) return '0.';

      // Get last number segment
      const segments = prev.split(/[\s+\-*/%^()]+/);
      const lastSegment = segments[segments.length - 1];

      // If last segment already has a decimal, ignore
      if (lastSegment && lastSegment.includes('.')) {
        return prev;
      }

      if (/\s$/.test(prev) || /[+\-*/%^(]$/.test(prev.trim())) {
        return prev + '0.';
      }

      return prev + '.';
    });
  }, [result]);

  const handleParenthesis = useCallback((paren) => {
    setError(null);
    if (result !== null) {
      if (paren === '(') {
        setExpression('(');
        setResult(null);
        return;
      }
      setResult(null);
    }
    setExpression((prev) => prev + paren);
  }, [result]);

  const handleToggleSign = useCallback(() => {
    setError(null);
    if (result !== null) {
      const num = parseFloat(result.replace(/,/g, ''));
      if (!isNaN(num)) {
        const negated = (-num).toString();
        setExpression(negated);
        setResult(null);
        return;
      }
    }

    setExpression((prev) => {
      if (!prev) return '-';

      // Look for the last number token
      const match = prev.match(/([+\-*/]?\s*)(\d*\.?\d+)$/);
      if (match) {
        const prefix = prev.slice(0, match.index);
        const op = match[1];
        const num = match[2];

        if (op.includes('-')) {
          return prefix + op.replace('-', '+') + num;
        } else if (op.includes('+')) {
          return prefix + op.replace('+', '-') + num;
        } else {
          return prefix + op + `(-${num})`;
        }
      }

      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, [result]);

  const handleBackspace = useCallback(() => {
    setError(null);
    if (result !== null) {
      setResult(null);
      return;
    }
    setExpression((prev) => {
      if (!prev) return '';
      const trimmed = prev.trimEnd();
      return trimmed.slice(0, -1).trimEnd();
    });
  }, [result]);

  const handleClear = useCallback(() => {
    setExpression('');
    setResult(null);
    setPreviewResult(null);
    setError(null);
    setClarification(null);
    setVoiceTranscript('');
    speaker.cancel();
  }, []);

  const handleSqrt = useCallback(() => {
    setError(null);
    setClarification(null);
    if (result !== null) {
      setExpression(`sqrt(${result})`);
      setResult(null);
      return;
    }
    setExpression((prev) => {
      if (!prev) return 'sqrt(';
      if (/[0-9)pie]$/.test(prev.trim())) {
        return `${prev} * sqrt(`;
      }
      return `${prev}sqrt(`;
    });
  }, [result]);

  const handleFunction = useCallback((func) => {
    setError(null);
    setClarification(null);
    if (result !== null) {
      setExpression(func);
      setResult(null);
      return;
    }
    setExpression((prev) => {
      if (!prev) return func;
      if (/[0-9)pie]$/.test(prev.trim())) {
        return `${prev} * ${func}`;
      }
      return `${prev}${func}`;
    });
  }, [result]);

  const handleConstant = useCallback((constName) => {
    setError(null);
    setClarification(null);
    if (result !== null) {
      setExpression(constName);
      setResult(null);
      return;
    }
    setExpression((prev) => {
      if (!prev) return constName;
      if (/[0-9)pie]$/.test(prev.trim())) {
        return `${prev} * ${constName}`;
      }
      return `${prev}${constName}`;
    });
  }, [result]);

  const handlePower = useCallback((power) => {
    setError(null);
    setClarification(null);
    if (result !== null) {
      const res = result;
      setResult(null);
      return `${res}${power}`;
    }
    setExpression((prev) => {
      if (!prev) return `0${power}`;
      return `${prev}${power}`;
    });
  }, [result]);

  // Ambiguity Clarification Handlers
  const handleResolveClarification = useCallback((option) => {
    setClarification(null);
    setExpression(option.expression);
    handleCalculate(option.expression);
  }, [handleCalculate]);

  const handleDismissClarification = useCallback(() => {
    setClarification(null);
  }, []);

  // History Actions
  const handleSelectHistory = useCallback((item) => {
    setExpression(item.expression);
    setResult(item.result);
    setError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Quick voice simulation for sample chips
  const handleSelectExample = useCallback((phrase) => {
    handleVoiceResult(phrase);
  }, [handleVoiceResult]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is inside a modal or input
      if (isTipsOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        e.preventDefault();
        handleOperator(key);
      } else if (key === 'x' || key === 'X') {
        e.preventDefault();
        handleOperator('*');
      } else if (key === '^' || key === '%') {
        e.preventDefault();
        handleOperator(key);
      } else if (key === '.' || key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleParenthesis(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (key === ' ' && document.activeElement && document.activeElement.tagName !== 'BUTTON') {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTipsOpen,
    isListening,
    startListening,
    stopListening,
    handleDigit,
    handleOperator,
    handleDecimal,
    handleParenthesis,
    handleCalculate,
    handleBackspace,
    handleClear
  ]);

  // Global Clipboard Paste Support (e.g. user pastes 2*3*29-2)
  useEffect(() => {
    const handlePaste = (e) => {
      if (isTipsOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      const pasted = e.clipboardData ? e.clipboardData.getData('text') : null;
      if (pasted && pasted.trim()) {
        e.preventDefault();
        handleVoiceResult(pasted.trim());
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isTipsOpen, handleVoiceResult]);

  return (
    <div className="vocalc-app-root">
      {/* Background Ambience & Gradient Orbs */}
      <div className="bg-ambient-layer" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      <div className="vocalc-app-container">
        {/* Header */}
        <Header
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          onOpenTips={() => setIsTipsOpen(true)}
          isListening={isListening}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* Main 2-Column or Single-Column Layout */}
        <main className="vocalc-main-content">
          <section className="calculator-primary-column" aria-label="Calculator Workspace">
            {/* Display */}
            <Display
              expression={expression}
              result={result}
              previewResult={previewResult}
              error={error}
              clarification={clarification}
              voiceTranscript={liveTranscript || voiceTranscript}
              isListening={isListening}
              calcMode={calcMode}
              angleMode={angleMode}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onResolveClarification={handleResolveClarification}
              onDismissClarification={handleDismissClarification}
              onSpeakResult={handleSpeakCurrentResult}
            />

            {/* Voice Controls */}
            <VoiceControls
              isListening={isListening}
              isSupported={isSpeechSupported}
              errorMessage={speechError}
              voiceTranscript={liveTranscript || voiceTranscript}
              language={language}
              calcMode={calcMode}
              onStartListening={startListening}
              onStopListening={stopListening}
              onClearError={clearSpeechError}
              onSelectExample={handleSelectExample}
            />

            {/* Manual Keypad (Basic simple mode or Scientific expanded mode) */}
            <Keypad
              calcMode={calcMode}
              onToggleCalcMode={handleToggleCalcMode}
              angleMode={angleMode}
              onToggleAngleMode={handleToggleAngleMode}
              onDigit={handleDigit}
              onOperator={handleOperator}
              onDecimal={handleDecimal}
              onParenthesis={handleParenthesis}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onToggleSign={handleToggleSign}
              onFunction={handleFunction}
              onConstant={handleConstant}
              onPower={handlePower}
              onEquals={() => handleCalculate()}
            />
          </section>

          {/* History Column */}
          <aside className="calculator-secondary-column" aria-label="Calculation History Sidebar">
            <History
              history={history}
              onSelectHistory={handleSelectHistory}
              onClearHistory={handleClearHistory}
            />
          </aside>
        </main>

        {/* Accessible Footer */}
        <footer className="vocalc-footer" role="contentinfo">
          <p>
            Vocalc &bull; Safe Arithmetic Parser &bull; Web Speech API &bull; Keyboard &amp; Voice Enabled
          </p>
        </footer>
      </div>

      {/* Voice Guide Modal */}
      <VoiceTipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
}
