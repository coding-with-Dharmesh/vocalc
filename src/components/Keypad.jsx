import React from 'react';
import { Calculator, Atom } from 'lucide-react';

export default function Keypad({
  calcMode = 'basic',
  onToggleCalcMode,
  angleMode = 'deg',
  onToggleAngleMode,
  onDigit,
  onOperator,
  onDecimal,
  onParenthesis,
  onClear,
  onBackspace,
  onToggleSign,
  onFunction,
  onConstant,
  onPower,
  onEquals
}) {
  const isScientific = calcMode === 'scientific';

  // Basic Mode 4x5 Grid Keys (Simple, clean, uncluttered)
  const basicKeys = [
    { label: 'AC', type: 'clear', action: onClear, aria: 'All Clear', keybinding: 'Esc / C' },
    { label: 'DEL', type: 'special', action: onBackspace, aria: 'Delete last character', keybinding: 'Backspace' },
    { label: '%', type: 'operator', action: () => onOperator('%'), aria: 'Percentage', keybinding: '%' },
    { label: '÷', type: 'operator', action: () => onOperator('/'), aria: 'Divide', keybinding: '/' },

    { label: '7', type: 'digit', action: () => onDigit('7'), aria: '7', keybinding: '7' },
    { label: '8', type: 'digit', action: () => onDigit('8'), aria: '8', keybinding: '8' },
    { label: '9', type: 'digit', action: () => onDigit('9'), aria: '9', keybinding: '9' },
    { label: '×', type: 'operator', action: () => onOperator('*'), aria: 'Multiply', keybinding: '*' },

    { label: '4', type: 'digit', action: () => onDigit('4'), aria: '4', keybinding: '4' },
    { label: '5', type: 'digit', action: () => onDigit('5'), aria: '5', keybinding: '5' },
    { label: '6', type: 'digit', action: () => onDigit('6'), aria: '6', keybinding: '6' },
    { label: '−', type: 'operator', action: () => onOperator('-'), aria: 'Subtract', keybinding: '-' },

    { label: '1', type: 'digit', action: () => onDigit('1'), aria: '1', keybinding: '1' },
    { label: '2', type: 'digit', action: () => onDigit('2'), aria: '2', keybinding: '2' },
    { label: '3', type: 'digit', action: () => onDigit('3'), aria: '3', keybinding: '3' },
    { label: '+', type: 'operator', action: () => onOperator('+'), aria: 'Add', keybinding: '+' },

    { label: '±', type: 'special', action: onToggleSign, aria: 'Toggle positive/negative', keybinding: '±' },
    { label: '0', type: 'digit', action: () => onDigit('0'), aria: '0', keybinding: '0' },
    { label: '.', type: 'digit', action: onDecimal, aria: 'Decimal point', keybinding: '.' },
    { label: '=', type: 'equals', action: onEquals, aria: 'Equals calculate', keybinding: 'Enter' }
  ];

  // Scientific Extra Keys (Trigonometry, Logarithms, Constants, Powers, Roots)
  const scientificFunctionKeys = [
    { label: 'sin', action: () => onFunction('sin('), aria: 'Sine function', tooltip: 'Sine (deg/rad)' },
    { label: 'cos', action: () => onFunction('cos('), aria: 'Cosine function', tooltip: 'Cosine (deg/rad)' },
    { label: 'tan', action: () => onFunction('tan('), aria: 'Tangent function', tooltip: 'Tangent (deg/rad)' },
    { label: 'log', action: () => onFunction('log('), aria: 'Logarithm base 10', tooltip: 'Log base 10' },
    { label: 'ln', action: () => onFunction('ln('), aria: 'Natural logarithm', tooltip: 'Natural log (base e)' },

    { label: 'π', action: () => onConstant('pi'), aria: 'Pi constant', tooltip: 'Pi (3.14159...)' },
    { label: 'e', action: () => onConstant('e'), aria: 'Euler constant', tooltip: 'Euler number (2.71828...)' },
    { label: 'xʸ', action: () => onPower('^'), aria: 'x to the power of y', tooltip: 'Power (^)' },
    { label: 'x²', action: () => onPower('^2'), aria: 'Square', tooltip: 'Square (^2)' },
    { label: '√', action: () => onFunction('sqrt('), aria: 'Square root', tooltip: 'Square root (√)' },

    { label: '(', action: () => onParenthesis('('), aria: 'Open parenthesis', tooltip: 'Open paren (' },
    { label: ')', action: () => onParenthesis(')'), aria: 'Close parenthesis', tooltip: 'Close paren )' },
    { label: '∛', action: () => onFunction('cbrt('), aria: 'Cube root', tooltip: 'Cube root (∛)' },
    { label: 'x³', action: () => onPower('^3'), aria: 'Cube', tooltip: 'Cube (^3)' },
    { label: '%', action: () => onOperator('%'), aria: 'Percentage', tooltip: 'Percentage (%)' }
  ];

  return (
    <div className={`calculator-keypad-wrapper ${isScientific ? 'mode-scientific' : 'mode-basic'}`}>
      {/* Mode Switcher Bar */}
      <div className="keypad-mode-bar" role="toolbar" aria-label="Calculator Mode and Angle Selector">
        <div className="mode-toggle-group">
          <button
            type="button"
            className={`mode-toggle-tab ${!isScientific ? 'is-active' : ''}`}
            onClick={() => onToggleCalcMode('basic')}
            aria-pressed={!isScientific}
            aria-label="Switch to Basic Calculator Mode"
          >
            <Calculator size={14} className="mode-tab-icon" />
            <span>Basic</span>
          </button>
          <button
            type="button"
            className={`mode-toggle-tab ${isScientific ? 'is-active' : ''}`}
            onClick={() => onToggleCalcMode('scientific')}
            aria-pressed={isScientific}
            aria-label="Switch to Scientific Calculator Mode"
          >
            <Atom size={14} className="mode-tab-icon" />
            <span>Scientific</span>
          </button>
        </div>

        {/* In Scientific Mode: Angle Mode Switch (DEG / RAD) */}
        {isScientific && (
          <div className="angle-mode-wrapper">
            <button
              type="button"
              className="angle-mode-btn"
              onClick={onToggleAngleMode}
              aria-label={`Angle mode is currently ${angleMode.toUpperCase()}. Click to switch.`}
              title={`Trig Angle Mode: ${angleMode.toUpperCase()} (Click to toggle)`}
            >
              <span className={`angle-badge ${angleMode === 'deg' ? 'is-deg' : 'is-rad'}`}>
                {angleMode.toUpperCase()}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Scientific Function Panel (Displayed when mode is Scientific) */}
      {isScientific && (
        <div className="scientific-panel" role="group" aria-label="Scientific Functions">
          <div className="scientific-grid">
            {scientificFunctionKeys.map((k, idx) => (
              <button
                key={idx}
                type="button"
                className="key-btn key-sci"
                onClick={k.action}
                aria-label={k.aria}
                title={k.tooltip}
              >
                <span className="key-label">{k.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Keypad Grid (Standard clean 4x5 layout) */}
      <div className="keypad-grid" role="group" aria-label="Numeric and Operator Keys">
        {basicKeys.map((k, idx) => (
          <button
            key={idx}
            type="button"
            className={`key-btn key-${k.type}`}
            onClick={k.action}
            aria-label={k.aria}
            title={`${k.aria} (${k.keybinding})`}
          >
            <span className="key-label">{k.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
