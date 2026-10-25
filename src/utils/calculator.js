/**
 * Safe Mathematical Expression Parser and Evaluator for Vocalc
 *
 * Implements Dijkstra's Shunting-yard algorithm to convert infix to RPN,
 * then evaluates RPN with a stack.
 *
 * Supports:
 * - Basic arithmetic (+, -, *, /, %)
 * - Scientific functions: Trigonometry (sin, cos, tan, asin, acos, atan), Logarithms (log, ln)
 * - Constants: pi (π), e
 * - Powers & Exponentiation: x^y, x², x³
 * - Roots: sqrt (√), cbrt (∛)
 * - Angle modes: DEG (degrees, default) and RAD (radians)
 * - Safe implicit multiplication: 2pi -> 2 * pi, 2sin(30) -> 2 * sin(30), (3)pi -> (3) * pi
 * - STRICTLY NEVER uses eval() or new Function().
 */

// Operator definition with precedence and associativity
const OPERATORS = {
  '+': { precedence: 1, associativity: 'L' },
  '-': { precedence: 1, associativity: 'L' },
  '*': { precedence: 2, associativity: 'L' },
  '/': { precedence: 2, associativity: 'L' },
  '%': { precedence: 2, associativity: 'L' },
  '^': { precedence: 3, associativity: 'R' },
  'u-': { precedence: 4, associativity: 'R', isUnary: true }, // Unary minus
  'sqrt': { precedence: 4, associativity: 'R', isUnary: true }, // Square root
  'cbrt': { precedence: 4, associativity: 'R', isUnary: true }, // Cube root
  'sin': { precedence: 4, associativity: 'R', isUnary: true },
  'cos': { precedence: 4, associativity: 'R', isUnary: true },
  'tan': { precedence: 4, associativity: 'R', isUnary: true },
  'asin': { precedence: 4, associativity: 'R', isUnary: true },
  'acos': { precedence: 4, associativity: 'R', isUnary: true },
  'atan': { precedence: 4, associativity: 'R', isUnary: true },
  'cot': { precedence: 4, associativity: 'R', isUnary: true },
  'sec': { precedence: 4, associativity: 'R', isUnary: true },
  'csc': { precedence: 4, associativity: 'R', isUnary: true },
  'log': { precedence: 4, associativity: 'R', isUnary: true }, // base 10
  'ln': { precedence: 4, associativity: 'R', isUnary: true },  // natural log (base e)
  'abs': { precedence: 4, associativity: 'R', isUnary: true }  // absolute value
};

/**
 * Standardize symbols (convert human symbols like ×, ÷, −, √, π to standard operators)
 */
export function normalizeExpression(expr) {
  if (!expr || typeof expr !== 'string') return '';
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/[\u2013\u2014]/g, '-') // en-dash, em-dash
    .replace(/,/g, '') // remove thousands separators
    .replace(/√/g, ' sqrt ')
    .replace(/∛/g, ' cbrt ')
    .replace(/π/g, ' pi ')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/(\d+(?:\.\d+)?)\s*%(?!\s*\d)/g, '($1 / 100)')
    .trim();
}

/**
 * Clean floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */
export function cleanPrecision(num) {
  if (!Number.isFinite(num)) return num;
  // Use toPrecision(12) to trim tiny floating point artifacts without altering true precision
  const rounded = parseFloat(Number(num).toPrecision(12));
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Evaluates trigonometric functions with degree or radian precision
 */
export function evaluateTrig(func, val, angleMode = 'deg') {
  if (angleMode === 'deg') {
    // Normalize angle to [0, 360)
    const norm = ((val % 360) + 360) % 360;

    switch (func) {
      case 'sin': {
        if (norm === 0 || norm === 180) return 0;
        if (norm === 90) return 1;
        if (norm === 270) return -1;
        if (norm === 30 || norm === 150) return 0.5;
        if (norm === 210 || norm === 330) return -0.5;
        const rad = (val * Math.PI) / 180;
        return cleanPrecision(Math.sin(rad));
      }
      case 'cos': {
        if (norm === 90 || norm === 270) return 0;
        if (norm === 0) return 1;
        if (norm === 180) return -1;
        if (norm === 60 || norm === 300) return 0.5;
        if (norm === 120 || norm === 240) return -0.5;
        const rad = (val * Math.PI) / 180;
        return cleanPrecision(Math.cos(rad));
      }
      case 'tan': {
        if (norm === 90 || norm === 270) {
          throw new Error(`Cannot calculate tan(${val}°): undefined`);
        }
        if (norm === 0 || norm === 180) return 0;
        if (norm === 45 || norm === 225) return 1;
        if (norm === 135 || norm === 315) return -1;
        const rad = (val * Math.PI) / 180;
        return cleanPrecision(Math.tan(rad));
      }
      case 'asin': {
        if (val < -1 || val > 1) {
          throw new Error('Cannot calculate asin(x): x must be between -1 and 1');
        }
        return cleanPrecision((Math.asin(val) * 180) / Math.PI);
      }
      case 'acos': {
        if (val < -1 || val > 1) {
          throw new Error('Cannot calculate acos(x): x must be between -1 and 1');
        }
        return cleanPrecision((Math.acos(val) * 180) / Math.PI);
      }
      case 'atan': {
        return cleanPrecision((Math.atan(val) * 180) / Math.PI);
      }
      case 'cot': {
        const t = evaluateTrig('tan', val, 'deg');
        if (t === 0) throw new Error(`Cannot calculate cot(${val}°): undefined`);
        return cleanPrecision(1 / t);
      }
      case 'sec': {
        const c = evaluateTrig('cos', val, 'deg');
        if (c === 0) throw new Error(`Cannot calculate sec(${val}°): undefined`);
        return cleanPrecision(1 / c);
      }
      case 'csc': {
        const s = evaluateTrig('sin', val, 'deg');
        if (s === 0) throw new Error(`Cannot calculate csc(${val}°): undefined`);
        return cleanPrecision(1 / s);
      }
      default:
        throw new Error(`Unknown trig function: ${func}`);
    }
  } else {
    // Radian mode
    switch (func) {
      case 'sin':
        return cleanPrecision(Math.sin(val));
      case 'cos':
        return cleanPrecision(Math.cos(val));
      case 'tan': {
        const cosVal = Math.cos(val);
        if (Math.abs(cosVal) < 1e-15) {
          throw new Error(`Cannot calculate tan(${val} rad): undefined`);
        }
        return cleanPrecision(Math.tan(val));
      }
      case 'cot': {
        const t = Math.tan(val);
        if (Math.abs(t) < 1e-15) {
          throw new Error(`Cannot calculate cot(${val} rad): undefined`);
        }
        return cleanPrecision(1 / t);
      }
      case 'sec': {
        const c = Math.cos(val);
        if (Math.abs(c) < 1e-15) {
          throw new Error(`Cannot calculate sec(${val} rad): undefined`);
        }
        return cleanPrecision(1 / c);
      }
      case 'csc': {
        const s = Math.sin(val);
        if (Math.abs(s) < 1e-15) {
          throw new Error(`Cannot calculate csc(${val} rad): undefined`);
        }
        return cleanPrecision(1 / s);
      }
      case 'asin':
        if (val < -1 || val > 1) {
          throw new Error('Cannot calculate asin(x): x must be between -1 and 1');
        }
        return cleanPrecision(Math.asin(val));
      case 'acos':
        if (val < -1 || val > 1) {
          throw new Error('Cannot calculate acos(x): x must be between -1 and 1');
        }
        return cleanPrecision(Math.acos(val));
      case 'atan':
        return cleanPrecision(Math.atan(val));
      default:
        throw new Error(`Unknown trig function: ${func}`);
    }
  }
}

/**
 * Tokenize a sanitized mathematical expression
 */
export function tokenize(expression) {
  const normalized = normalizeExpression(expression);
  const tokens = [];
  let i = 0;
  const len = normalized.length;

  const checkImplicitMultiplication = () => {
    if (tokens.length > 0) {
      const prev = tokens[tokens.length - 1];
      if (prev.type === 'NUMBER' || (prev.type === 'PAREN' && prev.value === ')')) {
        tokens.push({ type: 'OPERATOR', value: '*' });
      }
    }
  };

  while (i < len) {
    const char = normalized[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Number (including decimals)
    if (/[0-9]/.test(char) || (char === '.' && i + 1 < len && /[0-9]/.test(normalized[i + 1]))) {
      let numStr = '';
      let hasDecimal = false;

      while (i < len && (/[0-9]/.test(normalized[i]) || normalized[i] === '.')) {
        if (normalized[i] === '.') {
          if (hasDecimal) {
            throw new Error('Invalid number format: multiple decimal points');
          }
          hasDecimal = true;
        }
        numStr += normalized[i];
        i++;
      }

      tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
      continue;
    }

    // Check for unary minus:
    // Occurs if '-' is the first token, or follows another operator or '('
    if (char === '-') {
      const prevToken = tokens[tokens.length - 1];
      const isUnary =
        !prevToken ||
        prevToken.type === 'OPERATOR' ||
        (prevToken.type === 'PAREN' && prevToken.value === '(');

      if (isUnary) {
        tokens.push({ type: 'OPERATOR', value: 'u-' });
        i++;
        continue;
      }
    }

    // Constants: pi, e
    if (normalized.startsWith('pi', i) && (i + 2 === len || !/[a-z0-9]/i.test(normalized[i + 2]))) {
      checkImplicitMultiplication();
      tokens.push({ type: 'NUMBER', value: Math.PI });
      i += 2;
      continue;
    }

    if (char === 'e' && (i + 1 === len || !/[a-z0-9]/i.test(normalized[i + 1]))) {
      checkImplicitMultiplication();
      tokens.push({ type: 'NUMBER', value: Math.E });
      i++;
      continue;
    }

    // Mathematical Functions
    const funcs = ['sqrt', 'cbrt', 'asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'abs'];
    let matchedFunc = null;
    for (const f of funcs) {
      if (normalized.startsWith(f, i)) {
        matchedFunc = f;
        break;
      }
    }
    if (matchedFunc) {
      checkImplicitMultiplication();
      tokens.push({ type: 'OPERATOR', value: matchedFunc });
      i += matchedFunc.length;
      continue;
    }

    // Binary Operators
    if (['+', '-', '*', '/', '%', '^'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    // Parentheses
    if (char === '(' || char === ')') {
      if (char === '(') {
        checkImplicitMultiplication();
      }

      tokens.push({ type: 'PAREN', value: char });
      i++;

      // Check for implicit multiplication after ')'
      if (
        char === ')' &&
        i < len &&
        (/[0-9]/.test(normalized[i]) ||
          normalized[i] === '(' ||
          normalized.startsWith('pi', i) ||
          normalized[i] === 'e')
      ) {
        tokens.push({ type: 'OPERATOR', value: '*' });
      }
      continue;
    }

    throw new Error(`Unexpected character: '${char}'`);
  }

  return tokens;
}

/**
 * Shunting-Yard Algorithm: Convert infix tokens to Reverse Polish Notation (RPN)
 */
export function infixToRPN(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'OPERATOR') {
      const op1 = token.value;
      const op1Def = OPERATORS[op1];
      if (!op1Def) {
        throw new Error(`Unknown operator: ${op1}`);
      }

      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'OPERATOR') {
          const op2 = top.value;
          const op2Def = OPERATORS[op2];

          if (
            (op1Def.associativity === 'L' && op1Def.precedence <= op2Def.precedence) ||
            (op1Def.associativity === 'R' && op1Def.precedence < op2Def.precedence)
          ) {
            outputQueue.push(operatorStack.pop());
            continue;
          }
        }
        break;
      }
      operatorStack.push(token);
    } else if (token.type === 'PAREN' && token.value === '(') {
      operatorStack.push(token);
    } else if (token.type === 'PAREN' && token.value === ')') {
      let foundMatching = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        if (top.type === 'PAREN' && top.value === '(') {
          foundMatching = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundMatching) {
        throw new Error('Mismatched parentheses: missing opening parenthesis');
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top.type === 'PAREN') {
      throw new Error('Mismatched parentheses: unclosed parenthesis');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Evaluate Reverse Polish Notation (RPN) tokens safely
 */
export function evaluateRPN(rpnTokens, options = { angleMode: 'deg' }) {
  const stack = [];
  const angleMode = options.angleMode || 'deg';

  for (const token of rpnTokens) {
    if (token.type === 'NUMBER') {
      stack.push(token.value);
    } else if (token.type === 'OPERATOR') {
      const op = token.value;

      // Unary Minus
      if (op === 'u-') {
        if (stack.length < 1) {
          throw new Error('Invalid expression: missing operand for unary minus');
        }
        stack.push(-stack.pop());
        continue;
      }

      // Trigonometric Functions
      if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'cot', 'sec', 'csc'].includes(op)) {
        if (stack.length < 1) {
          throw new Error(`Invalid expression: missing operand for ${op}`);
        }
        const val = stack.pop();
        stack.push(evaluateTrig(op, val, angleMode));
        continue;
      }

      // Logarithmic Functions
      if (op === 'log') {
        if (stack.length < 1) {
          throw new Error('Invalid expression: missing operand for log');
        }
        const val = stack.pop();
        if (val <= 0) {
          throw new Error('Cannot calculate log of zero or negative number');
        }
        stack.push(cleanPrecision(Math.log10(val)));
        continue;
      }

      if (op === 'ln') {
        if (stack.length < 1) {
          throw new Error('Invalid expression: missing operand for ln');
        }
        const val = stack.pop();
        if (val <= 0) {
          throw new Error('Cannot calculate natural log of zero or negative number');
        }
        stack.push(cleanPrecision(Math.log(val)));
        continue;
      }

      // Roots
      if (op === 'sqrt') {
        if (stack.length < 1) {
          throw new Error('Invalid expression: missing operand for square root');
        }
        const val = stack.pop();
        if (val < 0) {
          throw new Error('Cannot calculate square root of a negative number');
        }
        stack.push(cleanPrecision(Math.sqrt(val)));
        continue;
      }

      if (op === 'cbrt') {
        if (stack.length < 1) {
          throw new Error('Invalid expression: missing operand for cube root');
        }
        const val = stack.pop();
        stack.push(cleanPrecision(Math.cbrt(val)));
        continue;
      }

      // Absolute value
      if (op === 'abs') {
        if (stack.length < 1) {
          throw new Error('Invalid expression: missing operand for abs');
        }
        stack.push(cleanPrecision(Math.abs(stack.pop())));
        continue;
      }

      // Binary operations
      if (stack.length < 2) {
        throw new Error(`Invalid expression: missing operand for '${op}'`);
      }

      const b = stack.pop();
      const a = stack.pop();
      let res;

      switch (op) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
          res = a * b;
          break;
        case '/':
          if (b === 0) {
            throw new Error('Cannot divide by zero');
          }
          res = a / b;
          break;
        case '%':
          if (b === 0) {
            throw new Error('Cannot divide by zero');
          }
          res = a % b;
          break;
        case '^':
          res = Math.pow(a, b);
          break;
        default:
          throw new Error(`Unsupported operator: '${op}'`);
      }

      stack.push(cleanPrecision(res));
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return cleanPrecision(stack[0]);
}

/**
 * Format a number for human-friendly display
 */
export function formatResult(val) {
  if (typeof val !== 'number' || isNaN(val)) return '';
  if (!Number.isFinite(val)) return val.toString();

  // If number is very large or very small, use exponential notation
  if (Math.abs(val) >= 1e15 || (Math.abs(val) > 0 && Math.abs(val) < 1e-7)) {
    return val.toExponential(6).replace(/\+/, '');
  }

  // Format with sensible decimals
  const str = val.toString();
  if (str.includes('.')) {
    const parts = str.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${integerPart}.${parts[1]}`;
  }

  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Main evaluation entry point
 * @param {string} expression - Math expression to evaluate
 * @param {object} options - Options such as { angleMode: 'deg' | 'rad', autoCloseParentheses?: boolean }
 * Returns: { success: boolean, result?: number, formattedResult?: string, error?: string, normalizedExpression?: string }
 */
export function calculateExpression(expression, options = { angleMode: 'deg' }) {
  if (!expression || typeof expression !== 'string' || !expression.trim()) {
    return { success: false, error: 'Empty expression' };
  }

  try {
    let exprToParse = expression.trim();

    // Auto-close trailing unclosed parentheses if requested by UI/keypad evaluation
    if (options && options.autoCloseParentheses) {
      let openParenCount = 0;
      for (const ch of exprToParse) {
        if (ch === '(') openParenCount++;
        else if (ch === ')') openParenCount = Math.max(0, openParenCount - 1);
      }
      if (openParenCount > 0) {
        exprToParse += ')'.repeat(openParenCount);
      }
    }

    const tokens = tokenize(exprToParse);
    if (tokens.length === 0) {
      return { success: false, error: 'Empty expression' };
    }

    const rpn = infixToRPN(tokens);
    const result = evaluateRPN(rpn, options);

    if (isNaN(result)) {
      return { success: false, error: 'Calculation resulted in NaN' };
    }

    return {
      success: true,
      result,
      formattedResult: formatResult(result),
      normalizedExpression: exprToParse
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Malformed expression'
    };
  }
}
