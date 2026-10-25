import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertTriangle, X, Radio, Square, Volume2 } from 'lucide-react';

export default function VoiceControls({
  isListening,
  isSupported,
  errorMessage,
  voiceTranscript,
  language = 'en',
  calcMode = 'basic',
  onStartListening,
  onStopListening,
  onClearError,
  onSelectExample
}) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const isHi = language === 'hi';
  const isSci = calcMode === 'scientific';

  // Timer while listening
  useEffect(() => {
    let timer;
    if (isListening) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isListening]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const englishBasicExamples = [
    { label: '15% of 240', text: 'what is 15 percent of 240' },
    { label: 'Square root of 144', text: 'square root of 144' },
    { label: 'Add 25 to 75', text: 'add 25 to 75' },
    { label: 'Subtract 25 from 75', text: 'subtract 25 from 75' },
    { label: '144 ÷ 12', text: '144 divided by 12' },
    { label: '“25 and 75” (Ambiguous test)', text: '25 and 75' }
  ];

  const englishSciExamples = [
    { label: 'sin 90', text: 'what is sin 90' },
    { label: 'log 100', text: 'log 100' },
    { label: '2π (2 × pi)', text: '2 times pi' },
    { label: 'ln e', text: 'natural log of e' },
    { label: '2³ (cube)', text: '2 to the power of 3' },
    { label: '15% of 240', text: '15 percent of 240' }
  ];

  const hindiBasicExamples = [
    { label: '240 का 15%', text: '240 का 15 प्रतिशत' },
    { label: '144 का वर्गमूल', text: '144 का वर्गमूल' },
    { label: '25 में 75 जोड़ें', text: '25 में 75 जोड़ें' },
    { label: '75 में से 25 घटाएं', text: '75 में से 25 घटाएं' },
    { label: '144 भाग 12', text: '144 भाग 12' },
    { label: '“25 और 75” (स्पष्टता जांच)', text: '25 and 75' }
  ];

  const hindiSciExamples = [
    { label: 'साइन 90', text: 'साइन 90' },
    { label: 'लॉग 100', text: 'लॉग 100' },
    { label: '2 पाई', text: 'पाई गुना 2' },
    { label: 'नेचुरल लॉग e', text: 'नेचुरल लॉग e' },
    { label: '2 की घात 3', text: 'दो की घात तीन' },
    { label: '144 का वर्गमूल', text: '144 का वर्गमूल' }
  ];

  const examplePhrases = isHi
    ? isSci
      ? hindiSciExamples
      : hindiBasicExamples
    : isSci
    ? englishSciExamples
    : englishBasicExamples;

  return (
    <div className="voice-controls-section" role="region" aria-label="Voice Controls & Live Audio">
      {/* Unsupported Browser Alert */}
      {!isSupported && (
        <div className="voice-alert voice-alert-warning" role="alert">
          <div className="alert-content">
            <AlertTriangle size={18} className="alert-icon" />
            <div>
              <strong>Voice Input Unavailable in this Browser</strong>
              <p>
                The Web Speech Recognition API is not supported in this browser. Please use
                Google Chrome, Microsoft Edge, or Safari for voice commands. Manual keypad remains fully functional!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="voice-alert voice-alert-error" role="alert">
          <div className="alert-content">
            <AlertTriangle size={18} className="alert-icon" />
            <div>
              <strong>Voice Recognition Notice</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            className="alert-close-btn"
            onClick={onClearError}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Voice Interactive Card */}
      <div className={`mic-interactive-card ${isListening ? 'is-recording' : ''}`}>
        
        {/* Left: Prominent Start/Stop Microphone Controls */}
        <div className="mic-action-group">
          <div className="mic-button-wrapper">
            {/* Animated Glow Rings when recording */}
            {isListening && (
              <>
                <div className="mic-pulse-ring ring-1" aria-hidden="true"></div>
                <div className="mic-pulse-ring ring-2" aria-hidden="true"></div>
                <div className="mic-pulse-ring ring-3" aria-hidden="true"></div>
              </>
            )}

            <button
              type="button"
              className={`mic-main-button ${isListening ? 'listening' : ''} ${!isSupported ? 'disabled' : ''}`}
              onClick={isListening ? onStopListening : onStartListening}
              disabled={!isSupported}
              aria-label={
                !isSupported
                  ? 'Voice input unsupported'
                  : isListening
                  ? 'Stop listening'
                  : 'Start voice calculation'
              }
              aria-pressed={isListening}
            >
              {isListening ? (
                <Radio className="mic-icon animate-pulse" size={32} />
              ) : (
                <Mic className="mic-icon" size={32} />
              )}
            </button>
          </div>

          {/* Explicit Start / Stop Button with Clear Text */}
          <button
            type="button"
            className={`mic-toggle-action-btn ${isListening ? 'btn-stop' : 'btn-start'} ${!isSupported ? 'disabled' : ''}`}
            onClick={isListening ? onStopListening : onStartListening}
            disabled={!isSupported}
            aria-label={isListening ? 'Stop microphone listening' : 'Start microphone listening'}
          >
            {isListening ? (
              <>
                <Square size={16} className="btn-action-icon fill-current" />
                <span className="btn-action-text">{isHi ? 'रोकें (Stop)' : 'Stop Listening'}</span>
              </>
            ) : (
              <>
                <Mic size={16} className="btn-action-icon" />
                <span className="btn-action-text">{isHi ? 'बोलना शुरू करें' : 'Start Listening'}</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Live Listening Indicator & Waveform */}
        <div className="mic-audio-feedback-area">
          <div className="mic-status-row">
            {/* Live Status Beacon */}
            <div className="live-status-pill">
              <span className={`status-beacon ${isListening ? 'recording' : 'idle'}`} aria-hidden="true"></span>
              <span className="status-badge-text">
                {isListening ? (isHi ? 'LIVE हिन्दी' : 'LIVE LISTENING') : (isHi ? 'हिन्दी MIC तैयार' : 'MIC READY')}
              </span>
              {isListening && (
                <span className="status-timer" aria-label={`Recording time ${elapsedTime} seconds`}>
                  {formatTimer(elapsedTime)}
                </span>
              )}
            </div>

            <span className="mic-hint-text">
              {isListening ? (isHi ? 'अपनी आवाज़ में बोलें...' : 'Speak your equation clearly') : (isHi ? 'शुरू करें पर टैप करें या स्पेस दबाएं' : 'Click Start or press spacebar to speak')}
            </span>
          </div>

          {/* Waveform Equalizer Animation */}
          <div
            className={`waveform-container ${isListening ? 'is-active' : 'is-idle'}`}
            aria-hidden="true"
            title={isListening ? 'Audio input active' : 'Waveform idle'}
          >
            <span className="wave-bar bar-1"></span>
            <span className="wave-bar bar-2"></span>
            <span className="wave-bar bar-3"></span>
            <span className="wave-bar bar-4"></span>
            <span className="wave-bar bar-5"></span>
            <span className="wave-bar bar-6"></span>
            <span className="wave-bar bar-7"></span>
            <span className="wave-bar bar-8"></span>
            <span className="wave-bar bar-9"></span>
            <span className="wave-bar bar-10"></span>
            <span className="wave-bar bar-11"></span>
            <span className="wave-bar bar-12"></span>
            <span className="wave-bar bar-13"></span>
            <span className="wave-bar bar-14"></span>
            <span className="wave-bar bar-15"></span>
            <span className="wave-bar bar-16"></span>
          </div>

          {/* Live Recognized Words Area */}
          <div className="recognized-words-card" role="status" aria-live="polite">
            <span className="recognized-label">
              <Volume2 size={13} className="recognized-icon" />
              {isHi ? 'पहचाने गए शब्द (Recognized):' : 'Recognized Words:'}
            </span>
            <div className="recognized-content">
              {voiceTranscript ? (
                <span className={`recognized-text ${isListening ? 'is-streaming' : 'is-final'}`}>
                  “{voiceTranscript}”
                  {isListening && <span className="streaming-cursor" aria-hidden="true">|</span>}
                </span>
              ) : isListening ? (
                <span className="recognized-placeholder listening">
                  {isHi ? 'आपकी आवाज़ सुनी जा रही है...' : 'Listening for your voice...'}
                </span>
              ) : (
                <span className="recognized-placeholder">
                  {isHi ? 'समीकरण बोलें (जैसे: “240 का 15 प्रतिशत”)' : 'Speak an equation (e.g. “What is 15 percent of 240?”)'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Sample Chips */}
      <div className="voice-examples-row">
        <span className="examples-heading">{isHi ? 'बोल कर देखें:' : 'Try saying:'}</span>
        <div className="example-chips-list">
          {examplePhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              className="example-chip-btn"
              onClick={() => onSelectExample(phrase.text)}
              aria-label={`Test example phrase: ${phrase.label}`}
              title={`Simulate speech: "${phrase.text}"`}
            >
              <span>{phrase.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
