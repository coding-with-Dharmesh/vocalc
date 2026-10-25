import test from 'node:test';
import assert from 'node:assert/strict';
import { getSpeechRecognitionErrorMessage } from './useSpeechRecognition.js';

test('network errors are treated as transient service issues, not a bad connection warning', () => {
  const message = getSpeechRecognitionErrorMessage('network');

  assert.equal(
    message,
    'Voice recognition is temporarily unavailable. Please try again in a moment or use the keypad instead.'
  );
});

test('permission errors keep their explicit guidance', () => {
  const message = getSpeechRecognitionErrorMessage('not-allowed');

  assert.equal(
    message,
    'Microphone permission denied. Please allow microphone access in your browser.'
  );
});
