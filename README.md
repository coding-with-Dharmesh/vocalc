# Vocalc — Intelligent Voice & Keypad Calculator

**Vocalc** is a production-grade, premium voice and manual calculator web application built with React, Vite, CSS3, the Web Speech API (`SpeechRecognition`), and the SpeechSynthesis API.

---

## 🌟 Key Features

1. **Intelligent Voice Calculations (Web Speech API)**
   - Voice math phrasing: _"25 plus 17"_, _"100 minus 45"_, _"9 times 8"_, _"144 divided by 12"_, _"Open parenthesis 5 plus 3 close parenthesis times 2"_.
   - Spoken number conversion: converts spoken number words (e.g. _"twenty five plus seventeen"_, _"three thousand five hundred"_) into digits.
   - Voice Commands: _"clear"_, _"clear all"_, _"delete"_, _"backspace"_, _"calculate"_, _"equals"_.
   - Animated visual feedback: glowing pulsing rings and audio equalizer wave animation while listening.
   - Fallback protection: displays browser compatibility status (recommends Chrome, Edge, Safari) and handles microphone permission denials gracefully.

2. **Safe Arithmetic Engine (Zero `eval()`)**
   - Implements Dijkstra's Shunting-yard algorithm to parse infix expressions to Reverse Polish Notation (RPN) and evaluate them via stack.
   - **Strictly avoids `eval()` and `new Function()`**.
   - Correct mathematical operator precedence (BODMAS / PEMDAS):
     - Parentheses `()` & Exponents `^`
     - Multiplication `*`, Division `/`, Modulo `%`
     - Addition `+`, Subtraction `-`
   - Handles unary minus (e.g. `-5 + 8 = 3`, `4 * -2 = -8`).
   - Handles implicit multiplication (e.g. `2(3) = 6`, `(5+3)2 = 16`).
   - Prevents floating-point artifacts (e.g. `0.1 + 0.2 = 0.3`).
   - Explicit zero-division handling (_"Cannot divide by zero"_).

3. **Speech Synthesis (Spoken Results)**
   - Uses `window.SpeechSynthesis` and `SpeechSynthesisUtterance` to speak calculated answers.
   - Cancels previous utterances to avoid overlapping speech.
   - Includes an audio toggle (Mute / Speaking) in the header.
   - Graceful fallback when Speech Synthesis is unavailable.

4. **SaaS-Grade UI & Design**
   - Deep navy background (`#070b14`) with ambient glowing orbs.
   - Glassmorphic panels with subtle translucent borders, backdrop blur, and smooth transitions.
   - Tactile manual keypad with distinct color-coding for digits, operators, clear, and equals.
   - Full keyboard support (`0-9`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`).
   - Interactive Calculation History: stores the latest 10 calculations, persisted in `localStorage`, with one-click reload and copy-to-clipboard actions.
   - Fully responsive for desktop, tablet, and mobile.
   - Comprehensive accessibility: semantic HTML, ARIA labels, `role="status"` live announcements, visible keyboard focus outlines, and `prefers-reduced-motion` support.

---
