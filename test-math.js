import { calculateExpression } from './src/utils/calculator.js';
import { parseSpeechToMath, detectVoiceCommand, convertWordNumbersToDigits, detectAmbiguity, isHindiSpeech } from './src/utils/speechParser.js';
import { numberToHindiWords } from './src/utils/speechSynthesis.js';

console.log('=== VOCALC COMPREHENSIVE TEST SUITE ===\n');

// 1. Math Tests (Basic Arithmetic, Precedence, Functions)
const mathTests = [
  // Basic operations
  { expr: '25 + 17', expected: 42 },
  { expr: '100 - 45', expected: 55 },
  { expr: '9 * 8', expected: 72 },
  { expr: '144 / 12', expected: 12 },
  { expr: '10 % 3', expected: 1 },
  { expr: '2 ^ 3', expected: 8 },

  // Chained complex expressions
  { expr: '2 * 3 * 29 - 2', expected: 172 },
  { expr: '2*3*29-2', expected: 172 },
  { expr: '5 + 10 * 3 - 4 / 2', expected: 33 },
  { expr: '100 - 20 * 3 + 15 / 5', expected: 43 },

  // Functions (sqrt, cbrt)
  { expr: 'sqrt(144)', expected: 12 },
  { expr: 'sqrt(100)', expected: 10 },
  { expr: 'cbrt(27)', expected: 3 },
  { expr: '2 + sqrt(144)', expected: 14 },
  { expr: 'sqrt(9) * sqrt(16)', expected: 12 },
  { expr: '((15 / 100) * 240)', expected: 36 },

  // Precedence
  { expr: '2 + 3 * 4', expected: 14 },
  { expr: '5 + 3 * 2', expected: 11 },
  { expr: '2 * 3 ^ 2', expected: 18 },
  { expr: '2 + 3 * 4 ^ 2', expected: 50 },

  // Parentheses
  { expr: '(5 + 3) * 2', expected: 16 },
  { expr: '(2 + 3) * 4', expected: 20 },
  { expr: '((5 + 3) * 2) / 4', expected: 4 },
  { expr: '3 * (4 + (2 * 5))', expected: 42 },

  // Unary minus & Signs
  { expr: '-5 + 8', expected: 3 },
  { expr: '4 * -2', expected: -8 },
  { expr: '-10 * -5', expected: 50 },
  { expr: '-(5 + 3)', expected: -8 },

  // Implicit multiplication
  { expr: '2(3)', expected: 6 },
  { expr: '(4)(5)', expected: 20 },
  { expr: '5(2 + 3)', expected: 25 },
  { expr: '(2 + 3)4', expected: 20 },

  // Decimals & Precision
  { expr: '0.1 + 0.2', expected: 0.3 },
  { expr: '1.5 * 2.5', expected: 3.75 },
  { expr: '0.7 - 0.4', expected: 0.3 },

  // Error Cases
  { expr: '10 / 0', expectedError: 'Cannot divide by zero' },
  { expr: '5 / (2 - 2)', expectedError: 'Cannot divide by zero' },
  { expr: '10 % 0', expectedError: 'Cannot divide by zero' },
  { expr: 'sqrt(-9)', expectedError: 'Cannot calculate square root of a negative number' },
  { expr: '((5 + 3)', expectedError: 'Mismatched parentheses' },
  { expr: '5 + 3)', expectedError: 'Mismatched parentheses' },
  { expr: '5.5.5 + 2', expectedError: 'multiple decimal points' }
];

let mathSuccess = 0;
for (const [idx, t] of mathTests.entries()) {
  const res = calculateExpression(t.expr);
  if (t.expectedError) {
    if (!res.success && res.error.toLowerCase().includes(t.expectedError.toLowerCase())) {
      console.log(`[PASS Math ${idx+1}] ${t.expr} -> Correctly caught: "${res.error}"`);
      mathSuccess++;
    } else {
      console.error(`[FAIL Math ${idx+1}] ${t.expr} -> Expected error "${t.expectedError}", got`, res);
    }
  } else {
    if (res.success && Math.abs(res.result - t.expected) < 1e-9) {
      console.log(`[PASS Math ${idx+1}] ${t.expr} = ${res.result} (${res.formattedResult})`);
      mathSuccess++;
    } else {
      console.error(`[FAIL Math ${idx+1}] ${t.expr} -> Expected ${t.expected}, got`, res);
    }
  }
}
console.log(`\nMath tests passed: ${mathSuccess}/${mathTests.length}`);

// 2. Scientific Math Tests (Trigonometry, Logarithms, Constants, Powers, Percentages)
console.log('\n--- Scientific Math Tests (Trigonometry, Logarithms, Constants, Powers) ---');
const scientificTests = [
  // Trigonometry in DEG mode
  { expr: 'sin(90)', options: { angleMode: 'deg' }, expected: 1 },
  { expr: 'cos(0)', options: { angleMode: 'deg' }, expected: 1 },
  { expr: 'cos(90)', options: { angleMode: 'deg' }, expected: 0 },
  { expr: 'sin(180)', options: { angleMode: 'deg' }, expected: 0 },
  { expr: 'tan(45)', options: { angleMode: 'deg' }, expected: 1 },
  { expr: '2 * sin(30)', options: { angleMode: 'deg' }, expected: 1 },
  { expr: '2sin(30)', options: { angleMode: 'deg' }, expected: 1 },
  { expr: 'tan(90)', options: { angleMode: 'deg' }, expectedError: 'Cannot calculate tan(90°): undefined' },

  // Trigonometry in RAD mode
  { expr: 'sin(pi / 2)', options: { angleMode: 'rad' }, expected: 1 },
  { expr: 'cos(pi)', options: { angleMode: 'rad' }, expected: -1 },

  // Logarithms
  { expr: 'log(100)', expected: 2 },
  { expr: 'log(10)', expected: 1 },
  { expr: 'log(1000)', expected: 3 },
  { expr: 'ln(e)', expected: 1 },
  { expr: '2 * log(100)', expected: 4 },
  { expr: 'log(0)', expectedError: 'Cannot calculate log of zero or negative number' },
  { expr: 'log(-5)', expectedError: 'Cannot calculate log of zero or negative number' },
  { expr: 'ln(-2)', expectedError: 'Cannot calculate natural log of zero or negative number' },

  // Constants & Implicit multiplication
  { expr: 'pi', expected: Math.PI },
  { expr: '2pi', expected: 2 * Math.PI },
  { expr: 'pi * 2', expected: 2 * Math.PI },
  { expr: '(3)pi', expected: 3 * Math.PI },
  { expr: 'e', expected: Math.E },
  { expr: 'e^2', expected: Math.E ** 2 },
  { expr: '2e', expected: 2 * Math.E },

  // Powers & Roots
  { expr: '2 ^ 3', expected: 8 },
  { expr: '5²', expected: 25 },
  { expr: '2³', expected: 8 },
  { expr: 'sqrt(144)', expected: 12 },
  { expr: 'cbrt(27)', expected: 3 },
  { expr: '√100', expected: 10 },

  // Percentages
  { expr: '50%', expected: 0.5 },
  { expr: '240 * 15%', expected: 36 },
  { expr: '100 + 20%', expected: 100.2 }
];

let sciSuccess = 0;
for (const [idx, st] of scientificTests.entries()) {
  const res = calculateExpression(st.expr, st.options || { angleMode: 'deg' });
  if (st.expectedError) {
    if (!res.success && res.error.toLowerCase().includes(st.expectedError.toLowerCase())) {
      console.log(`[PASS Sci ${idx+1}] ${st.expr} -> Correctly caught: "${res.error}"`);
      sciSuccess++;
    } else {
      console.error(`[FAIL Sci ${idx+1}] ${st.expr} -> Expected error "${st.expectedError}", got`, res);
    }
  } else {
    if (res.success && Math.abs(res.result - st.expected) < 1e-9) {
      console.log(`[PASS Sci ${idx+1}] ${st.expr} = ${res.result} (${res.formattedResult})`);
      sciSuccess++;
    } else {
      console.error(`[FAIL Sci ${idx+1}] ${st.expr} -> Expected ${st.expected}, got`, res);
    }
  }
}
console.log(`Scientific math tests passed: ${sciSuccess}/${scientificTests.length}`);

// 3. Natural Speech-to-Math Tests (English)
console.log('\n--- Natural Speech & Prepositional Math Tests (English) ---');
const speechTests = [
  // Required user phrases
  { phrase: 'What is 15 percent of 240?', expectedResult: 36 },
  { phrase: 'Square root of 144', expectedResult: 12 },
  { phrase: 'Add 25 to 75', expectedResult: 100 },

  // Scientific speech phrases
  { phrase: 'sin 90', expectedResult: 1 },
  { phrase: 'cos 0', expectedResult: 1 },
  { phrase: 'tan 45', expectedResult: 1 },
  { phrase: 'log 100', expectedResult: 2 },
  { phrase: 'natural log of e', expectedResult: 1 },
  { phrase: 'ln e', expectedResult: 1 },
  { phrase: 'pi times 2', expectedResult: 2 * Math.PI },
  { phrase: '2 to the power of 3', expectedResult: 8 },
  { phrase: '2 to the power 3', expectedResult: 8 },
  { phrase: '2 power 3', expectedResult: 8 },
  { phrase: '5 squared', expectedResult: 25 },
  { phrase: '2 cubed', expectedResult: 8 },
  { phrase: 'root 144', expectedResult: 12 },
  { phrase: '2 pi', expectedResult: 2 * Math.PI },
  { phrase: 'e squared', expectedResult: Math.E ** 2 },
  { phrase: 'sine of 90', expectedResult: 1 },
  { phrase: 'cosine of 0', expectedResult: 1 },
  { phrase: 'tangent of 45', expectedResult: 1 },
  { phrase: 'sin 90 plus cos 0', expectedResult: 2 },
  { phrase: 'square root of 144 plus 5', expectedResult: 17 },
  { phrase: 'log 100 times 5', expectedResult: 10 },

  // Additional natural phrases
  { phrase: 'Subtract 25 from 75', expectedResult: 50 },
  { phrase: 'Take away 20 from 100', expectedResult: 80 },
  { phrase: 'Multiply 12 by 8', expectedResult: 96 },
  { phrase: 'Divide 100 by 4', expectedResult: 25 },
  { phrase: 'Cube root of 27', expectedResult: 3 },
  { phrase: 'twenty percent of five hundred', expectedResult: 100 },

  // Standard phrases & Chained expressions
  { phrase: '2*3*29-2', expectedResult: 172 },
  { phrase: '2 * 3 * 29 - 2', expectedResult: 172 },
  { phrase: '2 times 3 times 29 minus 2', expectedResult: 172 },
  { phrase: '2 x 3 x 29 - 2', expectedResult: 172 },
  { phrase: 'calculate 2*3*29-2', expectedResult: 172 },
  { phrase: '5 + 10 * 3 - 4 / 2', expectedResult: 33 },
  { phrase: '100 - 20 * 3 + 15 / 5', expectedResult: 43 },
  { phrase: '25 plus 17', expectedResult: 42 },
  { phrase: '100 minus 45', expectedResult: 55 },
  { phrase: '9 times 8', expectedResult: 72 },
  { phrase: '144 divided by 12', expectedResult: 12 },
  { phrase: 'Open parenthesis 5 plus 3 close parenthesis times 2', expectedResult: 16 },
  { phrase: 'twenty five plus seventeen', expectedResult: 42 },
  { phrase: 'four squared', expectedResult: 16 }
];

let speechSuccess = 0;
for (const [idx, st] of speechTests.entries()) {
  const parsed = parseSpeechToMath(st.phrase);
  if (parsed.isAmbiguous) {
    console.error(`[FAIL Speech ${idx+1}] "${st.phrase}" unexpectedly flagged as ambiguous`);
    continue;
  }
  const calc = calculateExpression(parsed.expression);
  const mathMatches = calc.success && Math.abs(calc.result - st.expectedResult) < 1e-9;

  if (mathMatches && parsed.autoCalculate) {
    console.log(`[PASS Speech ${idx+1}] "${st.phrase}" -> "${parsed.expression}" = ${calc.result} (autoCalc: true)`);
    speechSuccess++;
  } else {
    console.error(`[FAIL Speech ${idx+1}] "${st.phrase}" -> parsed: "${parsed.expression}", autoCalc: ${parsed.autoCalculate}, calc:`, calc);
  }
}
console.log(`Speech tests passed: ${speechSuccess}/${speechTests.length}`);

// 4. Hindi Natural Speech & Question Tests (including Scientific)
console.log('\n--- Hindi & Hinglish Natural Speech Tests ---');
const hindiSpeechTests = [
  // Full conversational questions
  { phrase: 'पच्चीस प्लस सत्रह कितना होता है?', expectedResult: 42 },
  { phrase: 'दो सौ चालीस का पंद्रह प्रतिशत क्या है?', expectedResult: 36 },
  { phrase: 'एक सौ चौवालीस का वर्गमूल क्या होगा?', expectedResult: 12 },
  { phrase: 'पच्चीस में पचहत्तर जोड़ने पर क्या होगा?', expectedResult: 100 },
  { phrase: '75 में से 25 घटाने पर क्या आएगा?', expectedResult: 50 },
  { phrase: '12 को 8 से गुणा करने पर कितना होता है?', expectedResult: 96 },
  { phrase: '144 को 12 से भाग देने पर क्या आएगा?', expectedResult: 12 },
  { phrase: 'दो की घात तीन', expectedResult: 8 },
  { phrase: 'पाँच का वर्ग', expectedResult: 25 },
  { phrase: 'सत्ताईस का घनमूल', expectedResult: 3 },
  { phrase: 'कोष्टक में 5 प्लस 3 कोष्टक बंद गुना 2', expectedResult: 16 },
  { phrase: 'क्या आप बता सकते हैं 25 प्लस 17 का उत्तर क्या है?', expectedResult: 42 },
  { phrase: 'पच्चीस और सत्रह का जोड़', expectedResult: 42 },
  { phrase: 'सौ और पैंतालीस का अंतर', expectedResult: 55 },
  { phrase: 'बारह और आठ का गुणनफल', expectedResult: 96 },

  // Scientific in Hindi & Chained Hindi equations
  { phrase: 'दो गुना तीन गुना उनतीस माइनस दो', expectedResult: 172 },
  { phrase: 'साइन 90', expectedResult: 1 },
  { phrase: 'साइन नब्बे', expectedResult: 1 },
  { phrase: 'कॉस 0', expectedResult: 1 },
  { phrase: 'कॉस शून्य', expectedResult: 1 },
  { phrase: 'टैन 45', expectedResult: 1 },
  { phrase: 'लॉग 100', expectedResult: 2 },
  { phrase: 'नेचुरल लॉग e', expectedResult: 1 },
  { phrase: 'पाई गुना 2', expectedResult: 2 * Math.PI },
  { phrase: '2 पाई', expectedResult: 2 * Math.PI },
  { phrase: 'साइन 90 प्लस कॉस 0', expectedResult: 2 },
  { phrase: '144 का वर्गमूल प्लस 5', expectedResult: 17 },

  // Devanagari numerals
  { phrase: '२५ + १७', expectedResult: 42 },

  // Spoken Hindi words for numbers
  { phrase: 'पच्चीस प्लस सत्रह', expectedResult: 42 },
  { phrase: 'सौ माइनस पैंतालीस', expectedResult: 55 },
  { phrase: 'नौ गुना आठ', expectedResult: 72 },
  { phrase: 'एक सौ चौवालीस भाग बारह', expectedResult: 12 },
  { phrase: 'दो सौ चालीस का पंद्रह प्रतिशत', expectedResult: 36 },
  { phrase: 'एक सौ चौवालीस का वर्गमूल', expectedResult: 12 },
  { phrase: 'सताइस का घनमूल', expectedResult: 3 },
  { phrase: 'पच्चीस में पचहत्तर जोड़ें', expectedResult: 100 },
  { phrase: 'पचहत्तर में से पच्चीस घटाएं', expectedResult: 50 },

  // Prepositional & Grammar phrases
  { phrase: '240 का 15 प्रतिशत', expectedResult: 36 },
  { phrase: '144 का वर्गमूल', expectedResult: 12 },
  { phrase: '25 में 75 जोड़ें', expectedResult: 100 },
  { phrase: '75 में से 25 घटाएं', expectedResult: 50 },
  { phrase: '12 को 8 से गुणा करें', expectedResult: 96 },
  { phrase: '100 को 4 से भाग दें', expectedResult: 25 },
  { phrase: '25 प्लस 17', expectedResult: 42 },
  { phrase: '100 माइनस 45', expectedResult: 55 },
  { phrase: '144 भाग 12', expectedResult: 12 },

  // Hinglish phrases
  { phrase: '240 ka 15 percent', expectedResult: 36 },
  { phrase: '144 ka vargmool', expectedResult: 12 },
  { phrase: '25 me 75 jodo', expectedResult: 100 },
  { phrase: '75 me se 25 ghatao', expectedResult: 50 }
];

let hindiSuccess = 0;
for (const [idx, ht] of hindiSpeechTests.entries()) {
  const parsed = parseSpeechToMath(ht.phrase);
  const calc = calculateExpression(parsed.expression);
  const matches = calc.success && Math.abs(calc.result - ht.expectedResult) < 1e-9;
  if (matches && parsed.autoCalculate) {
    console.log(`[PASS Hindi ${idx+1}] "${ht.phrase}" -> "${parsed.expression}" = ${calc.result} (autoCalc: true)`);
    hindiSuccess++;
  } else {
    console.error(`[FAIL Hindi ${idx+1}] "${ht.phrase}" -> parsed: "${parsed.expression}", autoCalc: ${parsed.autoCalculate}, calc:`, calc);
  }
}
console.log(`Hindi tests passed: ${hindiSuccess}/${hindiSpeechTests.length}`);

// 5. Hindi Number Words for Spoken Results (TTS Voice Output)
console.log('\n--- Spoken Hindi Number Words (TTS Localization) Tests ---');
const hindiWordsTests = [
  { num: 42, expected: 'बयालीस' },
  { num: 55, expected: 'पचपन' },
  { num: 36, expected: 'छत्तीस' },
  { num: 12, expected: 'बारह' },
  { num: 100, expected: 'एक सौ' },
  { num: 144, expected: 'एक सौ चौवालीस' },
  { num: 240, expected: 'दो सौ चालीस' },
  { num: 3500, expected: 'तीन हज़ार पाँच सौ' },
  { num: 15240, expected: 'पंद्रह हज़ार दो सौ चालीस' },
  { num: 3.14, expected: 'तीन दशमलव एक चार' },
  { num: -8, expected: 'माइनस आठ' },
  { num: 0, expected: 'शून्य' }
];

let hindiWordsSuccess = 0;
for (const [idx, hwt] of hindiWordsTests.entries()) {
  const resultWords = numberToHindiWords(hwt.num);
  if (resultWords === hwt.expected) {
    console.log(`[PASS HindiWords ${idx+1}] ${hwt.num} -> "${resultWords}"`);
    hindiWordsSuccess++;
  } else {
    console.error(`[FAIL HindiWords ${idx+1}] ${hwt.num} -> got "${resultWords}", expected "${hwt.expected}"`);
  }
}
console.log(`Hindi spoken words tests passed: ${hindiWordsSuccess}/${hindiWordsTests.length}`);

// 6. Ambiguity Detection & Clarification Tests
console.log('\n--- Ambiguity Detection & Clarification Tests ---');
const ambiguityTests = [
  { phrase: '25 and 75', expectAmbiguous: true, questionMatch: 'add or multiply' },
  { phrase: 'divide 10 and 2', expectAmbiguous: true, questionMatch: '10 ÷ 2 or 2 ÷ 10' },
  { phrase: 'subtract 20 and 50', expectAmbiguous: true, questionMatch: '50 − 20 or 20 − 50' },
  { phrase: 'square root of', expectAmbiguous: true, questionMatch: 'square root' },
  { phrase: '15 percent of', expectAmbiguous: true, questionMatch: '15%' },
  { phrase: '50 20', expectAmbiguous: true, questionMatch: '50 20' }
];

let ambiguitySuccess = 0;
for (const [idx, at] of ambiguityTests.entries()) {
  const parsed = parseSpeechToMath(at.phrase);
  if (parsed.isAmbiguous && parsed.clarification) {
    const questionMatches = parsed.clarification.question.toLowerCase().includes(at.questionMatch.toLowerCase());
    const hasOptions = Array.isArray(parsed.clarification.options) && parsed.clarification.options.length > 0;
    if (questionMatches && hasOptions) {
      console.log(`[PASS Ambiguity ${idx+1}] "${at.phrase}" correctly requested clarification: "${parsed.clarification.question}" (${parsed.clarification.options.length} options)`);
      ambiguitySuccess++;
    } else {
      console.error(`[FAIL Ambiguity ${idx+1}] "${at.phrase}" -> question: "${parsed.clarification.question}", options:`, parsed.clarification.options);
    }
  } else {
    console.error(`[FAIL Ambiguity ${idx+1}] "${at.phrase}" was NOT flagged as ambiguous, got:`, parsed);
  }
}
console.log(`Ambiguity tests passed: ${ambiguitySuccess}/${ambiguityTests.length}`);

// 7. Spoken Number Conversion
console.log('\n--- Spoken Number Parsing Tests ---');
const wordNumTests = [
  { text: 'twenty five', expected: '25' },
  { text: 'one hundred forty four', expected: '144' },
  { text: 'one hundred and forty four', expected: '144' },
  { text: 'three thousand five hundred', expected: '3500' }
];

let wordNumSuccess = 0;
for (const [idx, wt] of wordNumTests.entries()) {
  const converted = convertWordNumbersToDigits(wt.text);
  if (converted.trim() === wt.expected) {
    console.log(`[PASS WordNum ${idx+1}] "${wt.text}" -> "${converted}"`);
    wordNumSuccess++;
  } else {
    console.error(`[FAIL WordNum ${idx+1}] "${wt.text}" -> got "${converted}", expected "${wt.expected}"`);
  }
}
console.log(`Word number tests passed: ${wordNumSuccess}/${wordNumTests.length}`);

// 8. Voice Commands
console.log('\n--- Voice Command Tests ---');
const cmdTests = [
  { phrase: 'clear', expected: 'CLEAR' },
  { phrase: 'clear all', expected: 'CLEAR' },
  { phrase: 'reset', expected: 'CLEAR' },
  { phrase: 'delete', expected: 'DELETE' },
  { phrase: 'backspace', expected: 'DELETE' },
  { phrase: 'equals', expected: 'EQUALS' },
  { phrase: 'calculate', expected: 'EQUALS' },
  { phrase: 'साफ करें', expected: 'CLEAR' },
  { phrase: 'साफ़ करें', expected: 'CLEAR' },
  { phrase: 'बराबर', expected: 'EQUALS' },
  { phrase: 'उत्तर बताओ', expected: 'EQUALS' }
];

let cmdSuccess = 0;
for (const [idx, ct] of cmdTests.entries()) {
  const res = detectVoiceCommand(ct.phrase);
  if (res && res.command === ct.expected) {
    console.log(`[PASS Cmd ${idx+1}] "${ct.phrase}" -> ${res.command}`);
    cmdSuccess++;
  } else {
    console.error(`[FAIL Cmd ${idx+1}] "${ct.phrase}" -> got`, res);
  }
}
console.log(`Voice command tests passed: ${cmdSuccess}/${cmdTests.length}`);

// 9. Phonetic Trigonometric & Math Homophones Tests (Fixing "tan 45" heard as "10 45" etc.)
console.log('\n--- Phonetic Trigonometric & Homophones Speech Tests ---');
const phoneticTests = [
  // User's exact reported issue: "tan45" heard as "10 45"
  { phrase: 'tan45', expectedResult: 1 },
  { phrase: 'tan 45', expectedResult: 1 },
  { phrase: '10 45', expectedResult: 1 },
  { phrase: 'ten 45', expectedResult: 1 },
  { phrase: 'ten forty five', expectedResult: 1 },
  { phrase: 'ten forty-five', expectedResult: 1 },
  { phrase: '10 of 45', expectedResult: 1 },
  { phrase: '10 degree 45', expectedResult: 1 },
  { phrase: '10 degrees 45', expectedResult: 1 },

  // Other tan angles:
  { phrase: '10 30', expectedResult: Math.tan(30 * Math.PI / 180) },
  { phrase: 'ten thirty', expectedResult: Math.tan(30 * Math.PI / 180) },
  { phrase: '10 60', expectedResult: Math.tan(60 * Math.PI / 180) },
  { phrase: 'ten sixty', expectedResult: Math.tan(60 * Math.PI / 180) },
  { phrase: '10 0', expectedResult: 0 },
  { phrase: 'ten zero', expectedResult: 0 },

  // Sin homophones:
  { phrase: 'sign 90', expectedResult: 1 },
  { phrase: 'sign90', expectedResult: 1 },
  { phrase: 'sin90', expectedResult: 1 },
  { phrase: 'sine90', expectedResult: 1 },
  { phrase: 'sign 30', expectedResult: 0.5 },
  { phrase: 'sign thirty', expectedResult: 0.5 },
  { phrase: 'seen 90', expectedResult: 1 },
  { phrase: 'shine 90', expectedResult: 1 },
  { phrase: 'scene 90', expectedResult: 1 },

  // Cos homophones:
  { phrase: 'cos0', expectedResult: 1 },
  { phrase: 'cos 0', expectedResult: 1 },
  { phrase: 'cause 0', expectedResult: 1 },
  { phrase: 'cause zero', expectedResult: 1 },
  { phrase: 'cost 0', expectedResult: 1 },
  { phrase: 'cost zero', expectedResult: 1 },
  { phrase: 'cause 60', expectedResult: 0.5 },
  { phrase: 'cost 60', expectedResult: 0.5 },
  { phrase: 'cos60', expectedResult: 0.5 },
  { phrase: 'cos45', expectedResult: Math.cos(45 * Math.PI / 180) },
  { phrase: 'cause 45', expectedResult: Math.cos(45 * Math.PI / 180) },
  { phrase: 'cost 45', expectedResult: Math.cos(45 * Math.PI / 180) },

  // Cot, Sec, Csc:
  { phrase: 'cot 45', expectedResult: 1 },
  { phrase: 'cot45', expectedResult: 1 },
  { phrase: 'court 45', expectedResult: 1 },
  { phrase: 'sec 60', expectedResult: 2 },
  { phrase: 'sec60', expectedResult: 2 },
  { phrase: 'second 60', expectedResult: 2 },
  { phrase: 'cosec 30', expectedResult: 2 },
  { phrase: 'cosec30', expectedResult: 2 },
  { phrase: 'csc 30', expectedResult: 2 },

  // Roots & Logs:
  { phrase: 'root144', expectedResult: 12 },
  { phrase: 'route 144', expectedResult: 12 },
  { phrase: 'log100', expectedResult: 2 },
  { phrase: 'lock 100', expectedResult: 2 },

  // Hindi trig variations:
  { phrase: 'टेन 45', expectedResult: 1 },
  { phrase: 'टेन45', expectedResult: 1 },
  { phrase: 'टैन45', expectedResult: 1 },
  { phrase: 'टेन पैंतालीस', expectedResult: 1 },
  { phrase: 'साइन90', expectedResult: 1 },
  { phrase: 'कॉस0', expectedResult: 1 },
  { phrase: 'कोस 0', expectedResult: 1 }
];

let phoneticSuccess = 0;
for (const [idx, pt] of phoneticTests.entries()) {
  const parsed = parseSpeechToMath(pt.phrase);
  const calc = calculateExpression(parsed.expression);
  const matches = calc.success && Math.abs(calc.result - pt.expectedResult) < 1e-6;
  if (matches && parsed.autoCalculate) {
    console.log(`[PASS Phonetic ${idx+1}] "${pt.phrase}" -> "${parsed.expression}" = ${calc.result} (autoCalc: true)`);
    phoneticSuccess++;
  } else {
    console.error(`[FAIL Phonetic ${idx+1}] "${pt.phrase}" -> parsed: "${parsed.expression}", autoCalc: ${parsed.autoCalculate}, calc:`, calc);
  }
}
console.log(`Phonetic speech tests passed: ${phoneticSuccess}/${phoneticTests.length}`);

const totalTests = mathTests.length + scientificTests.length + speechTests.length + hindiSpeechTests.length + hindiWordsTests.length + ambiguityTests.length + wordNumTests.length + cmdTests.length + phoneticTests.length;
const totalPassed = mathSuccess + sciSuccess + speechSuccess + hindiSuccess + hindiWordsSuccess + ambiguitySuccess + wordNumSuccess + cmdSuccess + phoneticSuccess;

if (totalPassed === totalTests) {
  console.log(`\n>>> ALL ${totalTests} TESTS PASSED WITH 100% SUCCESS! <<<`);
} else {
  console.error(`\n>>> SOME TESTS FAILED (${totalPassed}/${totalTests}) <<<`);
  process.exit(1);
}
