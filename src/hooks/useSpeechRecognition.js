import { useState, useEffect, useRef, useCallback } from 'react';

// Detect browser SpeechRecognition
const getSpeechRecognitionAPI = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function getSpeechRecognitionErrorMessage(error, isManuallyStopped = false) {
  switch (error) {
    case 'not-allowed':
    case 'permission-denied':
      return 'Microphone permission denied. Please allow microphone access in your browser.';
    case 'no-speech':
      return 'No speech detected. Please speak into your microphone.';
    case 'network':
      return 'Voice recognition is temporarily unavailable. Please try again in a moment or use the keypad instead.';
    case 'aborted':
      return isManuallyStopped ? '' : 'Speech input was interrupted.';
    default:
      return `Speech recognition error: ${error}`;
  }
}

export function useSpeechRecognition({ language = 'en', onResult, onCommand, onError } = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  // Initialize SpeechRecognition support check
  useEffect(() => {
    const SpeechAPI = getSpeechRecognitionAPI();
    setIsSupported(!!SpeechAPI);
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Recognition might already be stopped
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechAPI = getSpeechRecognitionAPI();

    if (!SpeechAPI) {
      setErrorMessage('Speech Recognition is not supported in this browser. Try Chrome, Edge, or Safari.');
      if (onError) onError('Speech Recognition is not supported');
      return;
    }

    // If already listening, stop first
    if (isListening && recognitionRef.current) {
      stopListening();
      return;
    }

    setErrorMessage(null);
    setTranscript('');
    isManuallyStoppedRef.current = false;

    try {
      const recognition = new SpeechAPI();
      recognition.continuous = false; // Stop after a single phrase
      recognition.interimResults = true; // Show live interim transcript
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          currentTranscript += res[0].transcript;
          if (res.isFinal) {
            isFinal = true;
          }
        }

        setTranscript(currentTranscript);

        if (isFinal && onResult) {
          onResult(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        const msg = getSpeechRecognitionErrorMessage(event.error, isManuallyStoppedRef.current);

        if (msg) {
          setErrorMessage(msg);
          if (onError) onError(msg);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setErrorMessage('Failed to start speech recognition: ' + err.message);
      setIsListening(false);
      if (onError) onError(err.message);
    }
  }, [isListening, language, onError, onResult, stopListening]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    clearError: () => setErrorMessage(null)
  };
}
