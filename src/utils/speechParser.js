/**
 * Speech Parser for Vocalc
 *
 * Converts natural spoken language into valid mathematical expressions,
 * handles complex natural language math phrasing in English, Hindi (हिन्दी), and Hinglish,
 * detects voice command intents, and asks for clarification when speech is ambiguous.
 */

import { cleanPrecision } from './calculator.js';

// Comprehensive Hindi (Devanagari) number words 0 to 100 + magnitudes
const HINDI_DIGITS = {
  'शून्य': 0, 'सिफर': 0,
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15, 'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  'इक्कीस': 21, 'बाईस': 22, 'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25, 'छब्बीस': 26, 'सत्ताईस': 27, 'सताइस': 27, 'अट्ठाईस': 28, 'उनतीस': 29, 'तीस': 30,
  'इकतीस': 31, 'बत्तीस': 32, 'तैंतीस': 33, 'चौंतीस': 34, 'पैंतीस': 35, 'छत्तीस': 36, 'सैंतीस': 37, 'अड़तीस': 38, 'उनतालीस': 39, 'चालीस': 40,
  'इकतालीस': 41, 'बयालीस': 42, 'तैंतालीस': 43, 'चवालीस': 44, 'चौवालीस': 44, 'पैंतालीस': 45, 'छियालीस': 46, 'सैंतालीस': 47, 'अड़तालीस': 48, 'उनचास': 49, 'पचास': 50,
  'इक्यावन': 51, 'बावन': 52, 'तिरपन': 53, 'चौवन': 54, 'पचपन': 55, 'छप्पन': 56, 'सत्तावन': 57, 'अट्ठावन': 58, 'उनसठ': 59, 'साठ': 60,
  'इकसठ': 61, 'बासठ': 62, 'तिरसठ': 63, 'चौंसठ': 64, 'पैंसठ': 65, 'छियासठ': 66, 'सरसठ': 67, 'अड़सठ': 68, 'उनहत्तर': 69, 'सत्तर': 70,
  'इकहत्तर': 71, 'बहत्तर': 72, 'तिहत्तर': 73, 'चौहत्तर': 74, 'पचहत्तर': 75, 'छिहत्तर': 76, 'सतहत्तर': 77, 'अठहत्तर': 78, 'उन्यासी': 79, 'अस्सी': 80,
  'इक्यासी': 81, 'बयासी': 82, 'तिरासी': 83, 'चौरासी': 84, 'पचासी': 85, 'छियासी': 86, 'सत्तासी': 87, 'अट्ठासी': 88, 'नवासी': 89, 'नब्बे': 90,
  'इक्यानवे': 91, 'बानवे': 92, 'तिरानवे': 93, 'चौरानवे': 94, 'पचानवे': 95, 'पंचानवे': 95, 'छियानवे': 96, 'सत्तानवे': 97, 'अट्ठानवे': 98, 'निन्यानवे': 99
};

const HINDI_MAGNITUDES = {
  'सौ': 100,
  'हजार': 1000,
  'हज़ार': 1000,
  'लाख': 100000,
  'करोड़': 10000000
};

// Hinglish / Romanized Hindi numbers
const HINGLISH_NUMBER_WORDS = {
  'shunya': 0, 'ek': 1, 'do': 2, 'teen': 3, 'chaar': 4, 'char': 4, 'paanch': 5, 'panch': 5,
  'chhe': 6, 'chhah': 6, 'saat': 7, 'aath': 8, 'ath': 8, 'nau': 9, 'das': 10,
  'gyarah': 11, 'barah': 12, 'baarah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
  'solah': 16, 'satrah': 17, 'atharah': 18, 'athaarah': 18, 'unnees': 19, 'unnis': 19,
  'bees': 20, 'bis': 20, 'pachees': 25, 'pachis': 25, 'tees': 30, 'paintees': 35,
  'chalis': 40, 'chaalees': 40, 'paintaalees': 45, 'paintalis': 45, 'pachaas': 50, 'pachas': 50,
  'pachpan': 55, 'saath': 60, 'sattar': 70, 'pachattar': 75, 'pachhattar': 75, 'assee': 80,
  'assi': 80, 'nabbe': 90, 'sau': 100, 'hazaar': 1000, 'hazar': 1000, 'lakh': 100000, 'crore': 10000000
};

// English Number Words
const ENGLISH_NUMBER_WORDS = {
  zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
};

const ENGLISH_MAGNITUDES = {
  hundred: 100,
  thousand: 1000,
  million: 1000000
};

/**
 * Check if a text is Hindi or Hinglish
 */
export function isHindiSpeech(text) {
  if (!text) return false;
  // Check for Devanagari Unicode characters (0x0900 to 0x097F)
  if (/[\u0900-\u097F]/.test(text)) return true;

  // Common Romanized Hinglish mathematical/conversational terms
  const hinglishTerms = [
    'vargmool', 'ghanmool', 'ghaat', 'jodo', 'jode', 'ghatao', 'ghatana',
    'guna', 'bhag', 'pratishat', 'fisdi', 'sau', 'hazaar', 'lakh', 'crore',
    'kitna', 'hoga', 'hota', 'hai', 'batao', 'bataiye', 'pachees', 'pachis',
    'chaar', 'paanch', 'chhe', 'saat', 'aath', 'pandrah', 'gyarah', 'solah',
    'satrah', 'atharah', 'unnees', 'bees', 'tees', 'chalis', 'pachaas', 'saath',
    'sattar', 'assi', 'nabbe', 'pai', 'paai'
  ];
  const lower = text.toLowerCase();
  return hinglishTerms.some(term => new RegExp(`\\b${term}\\b`, 'i').test(lower));
}

/**
 * Parse Hindi compound spoken number words (e.g. "दो सौ चालीस" -> 240, "एक सौ चौवालीस" -> 144)
 */
export function convertHindiSpokenNumbers(text) {
  if (!text) return '';
  const tokens = text.split(/\s+/);
  const result = [];
  let buffer = [];

  const flush = () => {
    if (buffer.length === 0) return;

    let total = 0;
    let current = 0;
    let valid = true;

    for (const w of buffer) {
      if (HINDI_DIGITS[w] !== undefined) {
        current += HINDI_DIGITS[w];
      } else if (HINDI_MAGNITUDES[w] !== undefined) {
        if (current === 0) current = 1;
        current *= HINDI_MAGNITUDES[w];
        if (w === 'हजार' || w === 'हज़ार' || w === 'लाख' || w === 'करोड़') {
          total += current;
          current = 0;
        }
      } else {
        valid = false;
        break;
      }
    }

    if (valid) {
      result.push((total + current).toString());
    } else {
      result.push(...buffer);
    }
    buffer = [];
  };

  for (const token of tokens) {
    if (HINDI_DIGITS[token] !== undefined || HINDI_MAGNITUDES[token] !== undefined) {
      buffer.push(token);
    } else {
      flush();
      result.push(token);
    }
  }

  flush();
  return result.join(' ');
}

/**
 * Converts Hindi spoken phrases, Devanagari numerals, Hinglish, and terms to mathematical expressions
 */
export function convertHindiToMath(text) {
  if (!text) return '';
  let res = text.trim();

  // Convert Devanagari digits (०-९) to standard digits (0-9)
  res = res.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));

  // Convert Hindi number words and compound phrases (e.g. "दो सौ चालीस", "एक सौ चौवालीस")
  res = convertHindiSpokenNumbers(res);

  // Convert Romanized Hinglish numbers (e.g. "ek sau chauwaalees" -> 144, "do sau chalees" -> 240)
  for (const [hinglishWord, digit] of Object.entries(HINGLISH_NUMBER_WORDS)) {
    const regex = new RegExp(`\\b${hinglishWord}\\b`, 'gi');
    res = res.replace(regex, digit.toString());
  }

  // Parentheses in Hindi before stripping conversational parts
  // 1. Closing parentheses first so 'कोष्टक' doesn't greedily eat 'कोष्टक बंद'
  res = res.replace(/(?:कोष्टक\s+बंद|क्लोज़\s+कोष्टक|क्लोज़\s+ब्रैकेट|ब्रैकेट\s+बंद)/giu, ' ) ');
  // 2. Opening parentheses
  res = res.replace(/(?:कोष्टक\s+में|कोष्टक\s+शुरू|ओपन\s+कोष्टक|ओपन\s+ब्रैकेट|ब्रैकेट\s+में|ब्रैकेट\s+शुरू|कोष्टक|ब्रैकेट)/giu, ' ( ');

  // Conversational prefixes/suffixes in Hindi
  res = res.replace(/(?:का मान क्या है|का मान क्या होगा|का मान बताओ|का मान निकालें|का मान निकालो|का उत्तर क्या है|का उत्तर क्या होगा|का उत्तर बताओ|का उत्तर|कितना होता है|कितना होगा|कितना हुआ|कितना आएगा|क्या आएगा|क्या निकलेगा|क्या होगा|क्या है|बताइए|बताओ|निकालें|निकालो|आएगा|होता है|होगा)\s*$/gu, '');
  res = res.replace(/^(?:क्या आप बता सकते हैं|कृपया बताइए कि|कृपया बताइए|कृपया बताओ कि|कृपया बताओ|कृपया|बताइए कि|बताओ कि|बताइए|बताओ|उत्तर क्या है|उत्तर बताओ|गणना करें|गणना करो|हल करें|हल करो|सॉल्व करें|सॉल्व करो|निकालें|निकालो)\s+/gu, '');

  // Hinglish conversational prefixes/suffixes
  res = res.replace(/(?:ka man kya hai|ka answer kya hai|kitna hota hai|kitna hoga|kitna hua|kya aayega|kya hoga|kya hai|batao|bataiye)\s*$/giu, '');
  res = res.replace(/^(?:kya aap bata sakte hain|kya aap bata sakte ho|batao|bataiye|calculate karo|solve karo)\s+/giu, '');

  // Constants in Hindi:
  res = res.replace(/(?:पाई\s+का\s+मान|पाई|pai|paai)(?=[^\u0900-\u097F]|$|\s)/giu, ' pi ');
  res = res.replace(/(?:ई\s+का\s+मान|\bई\b)/giu, ' e ');
  // "2 पाई" -> 2 * pi, "दो पाई" -> 2 * pi
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:गुना|\*|into)?\s*pi\b/giu, '$1 * pi');
  res = res.replace(/pi\s*(?:गुना|\*|into)\s*(\d+(?:\.\d+)?)\b/giu, 'pi * $1');

  // Trigonometry in Hindi (including phonetic variations like टेन, कोस, कास्ट, etc.):
  res = res.replace(/(?:साइन|शाइन|सीन|\b(?:sine|sin)\b)\s*(?:का\s+मान)?\s*(?:(?:of\s+|का\s+)?(pi|e)|(-?\d+(?:\.\d+)?))(?:\s*(?:डिग्री|अंश|degrees?))?/giu, 'sin($1$2)');
  res = res.replace(/(?:कोसेक|\b(?:cosec|csc)\b)\s*(?:का\s+मान)?\s*(?:(?:of\s+|का\s+)?(pi|e)|(-?\d+(?:\.\d+)?))(?:\s*(?:डिग्री|अंश|degrees?))?/giu, 'csc($1$2)');
  res = res.replace(/(?:कॉस|कोस|कोसाइन|कास्ट|कॉस्ट|कास|\b(?:cosine|cos)\b)\s*(?:का\s+मान)?\s*(?:(?:of\s+|का\s+)?(pi|e)|(-?\d+(?:\.\d+)?))(?:\s*(?:डिग्री|अंश|degrees?))?/giu, 'cos($1$2)');
  res = res.replace(/(?:टैन|टेन|टैंजेंट|\b(?:tangent|tan)\b)\s*(?:का\s+मान)?\s*(?:(?:of\s+|का\s+)?(pi|e)|(-?\d+(?:\.\d+)?))(?:\s*(?:डिग्री|अंश|degrees?))?/giu, 'tan($1$2)');
  res = res.replace(/(?:कोट|कोटेन|\b(?:cot)\b)\s*(?:का\s+मान)?\s*(?:(?:of\s+|का\s+)?(pi|e)|(-?\d+(?:\.\d+)?))(?:\s*(?:डिग्री|अंश|degrees?))?/giu, 'cot($1$2)');
  res = res.replace(/(?:सेक|\b(?:sec)\b)\s*(?:का\s+मान)?\s*(?:(?:of\s+|का\s+)?(pi|e)|(-?\d+(?:\.\d+)?))(?:\s*(?:डिग्री|अंश|degrees?))?/giu, 'sec($1$2)');

  // Logarithms in Hindi:
  res = res.replace(/(?:नेचुरल\s+लॉग|natural\s+log|ln)\s*(?:का\s+मान)?\s*(-?\d+(?:\.\d+)?|pi|e)/giu, 'ln($1)');
  res = res.replace(/(?:लॉग|logarithm|लघुगणक|log)\s*(?:का\s+मान)?\s*(-?\d+(?:\.\d+)?|pi|e)/giu, 'log($1)');

  // 1. Percentage in Hindi & Hinglish:
  // "240 का 15 प्रतिशत", "240 का 15%", "240 ka 15 percent", "240 ka 15 fisdi"
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:का|ka)\s*(\d+(?:\.\d+)?)\s*(?:प्रतिशत|फीसदी|पर्सेंट|percent|percentage|%)/giu, '($2 / 100) * $1');
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:प्रतिशत|फीसदी|पर्सेंट|percent|percentage|%)\s*(?:का|ka|of)?\s*(\d+(?:\.\d+)?)/giu, '($1 / 100) * $2');

  // 2. Square Root in Hindi & Hinglish:
  // "144 का वर्गमूल", "वर्गमूल 144", "144 ka vargmool", "vargmool 144"
  res = res.replace(/(-?\d+(?:\.\d+)?|pi|e)\s*(?:का|ka)\s*(?:वर्गमूल|स्क्वायर\s+रूट|vargmool|square\s+root)/giu, 'sqrt($1)');
  res = res.replace(/(?:वर्गमूल|स्क्वायर\s+रूट|vargmool|square\s+root)\s*(?:of|का|ka)?\s*(-?\d+(?:\.\d+)?|pi|e)/giu, 'sqrt($1)');

  // 3. Cube Root in Hindi & Hinglish:
  // "27 का घनमूल", "घनमूल 27", "27 ka ghanmool"
  res = res.replace(/(-?\d+(?:\.\d+)?|pi|e)\s*(?:का|ka)\s*(?:घनमूल|क्यूब\s+रूट|ghanmool|cube\s+root)/giu, 'cbrt($1)');
  res = res.replace(/(?:घनमूल|क्यूब\s+रूट|ghanmool|cube\s+root)\s*(?:of|का|ka)?\s*(-?\d+(?:\.\d+)?|pi|e)/giu, 'cbrt($1)');

  // 4. Powers & Exponents in Hindi & Hinglish:
  // "2 की घात 3", "2 ki ghaat 3", "2 power 3"
  res = res.replace(/(\d+(?:\.\d+)?|pi|e)\s*(?:की\s+घात|की\s+पावर|घात|पावर|ki\s+ghaat|ki\s+power)\s*(-?\d+(?:\.\d+)?)/giu, '$1 ^ $2');
  // "5 का वर्ग", "5 ka varg", "5 का स्क्वायर" -> 5^2
  res = res.replace(/(\d+(?:\.\d+)?|pi|e)\s*(?:का\s+वर्ग|का\s+स्क्वायर|ka\s+varg|ka\s+square)/giu, '$1 ^ 2');
  // "5 का घन", "5 ka ghan", "5 का क्यूब" -> 5^3
  res = res.replace(/(\d+(?:\.\d+)?|pi|e)\s*(?:का\s+घन|का\s+क्यूब|ka\s+ghan|ka\s+cube)/giu, '$1 ^ 3');

  // 5. Formal Hindi phrases: "X और Y का जोड़/योग/गुणनफल/अंतर"
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:और|तथा|\+)\s*(\d+(?:\.\d+)?)\s*(?:का\s+जोड़|का\s+योग|ka\s+jod|ka\s+yog)/giu, '$1 + $2');
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:और|तथा)\s*(\d+(?:\.\d+)?)\s*(?:का\s+अंतर|ka\s+antar)/giu, '$1 - $2');
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:और|तथा|\*)\s*(\d+(?:\.\d+)?)\s*(?:का\s+गुणनफल|ka\s+gunanfal)/giu, '$1 * $2');
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:और|तथा|\/)\s*(\d+(?:\.\d+)?)\s*(?:का\s+भागफल|ka\s+bhagfal)/giu, '$1 / $2');

  // 6. Preposition Addition in Hindi:
  // "25 में 75 जोड़ें", "25 me 75 jodo", "25 में 75 जोड़ने पर", "25 jama 75"
  res = res.replace(/(\d+(?:\.\d+)?)\s+(?:में|me)\s+(\d+(?:\.\d+)?)\s+(?:जोड़ें|जोड़ो|जोड़े|जोड़ना|जोड़ने(?:\s+(?:पर|से))?|jodo|joden|jode)/giu, '$1 + $2');
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:जमा|jama)\s*(\d+(?:\.\d+)?)/giu, '$1 + $2');

  // 7. Preposition Subtraction in Hindi:
  // "75 में से 25 घटाएं", "75 me se 25 ghatao", "75 me se 25 ghata"
  res = res.replace(/(\d+(?:\.\d+)?)\s+(?:में\s+से|me\s+se|se)\s+(\d+(?:\.\d+)?)\s+(?:घटाएं|घटाओ|घटाए|घटाना|घटाने(?:\s+(?:पर|से))?|ghatao|ghataen|ghata)/giu, '$1 - $2');

  // 8. Preposition Multiplication in Hindi:
  // "12 को 8 से गुणा करें", "12 ko 8 se guna karo", "12 को 8 से गुणा करने पर"
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:को|ko)\s*(\d+(?:\.\d+)?)\s*(?:से|se)\s*(?:गुणा|गुना|मल्टीप्लाई|guna|multiply)(?:\s*(?:करने\s+पर|करें|करो|karo))?/giu, '$1 * $2');

  // 9. Preposition Division in Hindi:
  // "100 को 4 से भाग दें", "100 ko 4 se bhag do", "100 को 4 से भाग देने पर"
  res = res.replace(/(\d+(?:\.\d+)?)\s*(?:को|ko)\s*(\d+(?:\.\d+)?)\s*(?:से|se)\s*(?:भाग|भागे|विभाजित|डिवाइड|bhag|divide)(?:\s*(?:देने\s+पर|दें|दो|करें|करो|do|karo))?/giu, '$1 / $2');

  // 10. Operators in Hindi & Hinglish:
  res = res.replace(/(?:\b|\s)(?:धन|प्लस|plus)(?:\b|\s)/giu, ' + ');
  res = res.replace(/(?:\b|\s)(?:ऋण|माइनस|minus)(?:\b|\s)/giu, ' - ');
  res = res.replace(/(?:\b|\s)(?:गुणा|गुना|इंटू|into|guna)(?:\b|\s)/giu, ' * ');
  res = res.replace(/(?:\b|\s)(?:भाग|भागे|विभाजित|बटा|बटे|bhag|bate)(?:\b|\s)/giu, ' / ');

  return res;
}

/**
 * Converts a sequence of English number words into digits.
 * E.g., "twenty five" -> 25, "one hundred forty four" -> 144
 */
function parseSpokenNumberWords(words) {
  let total = 0;
  let current = 0;
  let hasNumber = false;

  for (const word of words) {
    if (ENGLISH_NUMBER_WORDS[word] !== undefined) {
      current += ENGLISH_NUMBER_WORDS[word];
      hasNumber = true;
    } else if (ENGLISH_MAGNITUDES[word] !== undefined) {
      if (current === 0) current = 1;
      current *= ENGLISH_MAGNITUDES[word];
      if (word === 'thousand' || word === 'million') {
        total += current;
        current = 0;
      }
      hasNumber = true;
    } else if (word === 'and') {
      continue;
    } else {
      return null;
    }
  }

  return hasNumber ? total + current : null;
}

/**
 * Replaces consecutive number words in a sentence with their digit representation
 */
export function convertWordNumbersToDigits(text) {
  if (!text) return '';
  // Only split hyphens between alphabetic words (e.g. "twenty-five" -> "twenty five"),
  // preserving mathematical minus signs in expressions like "29-2"
  const normalized = text.replace(/([a-zA-Z]+)-([a-zA-Z]+)/g, '$1 $2');
  const tokens = normalized.split(/\s+/);
  const resultTokens = [];
  let numWordBuffer = [];

  const flushBuffer = () => {
    if (numWordBuffer.length > 0) {
      const parsed = parseSpokenNumberWords(numWordBuffer);
      if (parsed !== null) {
        resultTokens.push(parsed.toString());
      } else {
        resultTokens.push(...numWordBuffer);
      }
      numWordBuffer = [];
    }
  };

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i].toLowerCase();

    if (
      ENGLISH_NUMBER_WORDS[word] !== undefined ||
      ENGLISH_MAGNITUDES[word] !== undefined ||
      (word === 'and' && numWordBuffer.length > 0 && i + 1 < tokens.length && ENGLISH_NUMBER_WORDS[tokens[i + 1].toLowerCase()] !== undefined)
    ) {
      numWordBuffer.push(word);
    } else {
      flushBuffer();
      resultTokens.push(tokens[i]);
    }
  }

  flushBuffer();
  return resultTokens.join(' ');
}

/**
 * Check if the input is a standalone voice command (English and Hindi)
 */
export function detectVoiceCommand(transcript) {
  if (!transcript) return null;
  const clean = transcript.trim().toLowerCase().replace(/[.!?,]/g, '');

  // Clear commands
  if (
    clean === 'clear' ||
    clean === 'clear all' ||
    clean === 'reset' ||
    clean === 'erase' ||
    clean === 'start over' ||
    clean === 'all clear' ||
    clean === 'ac' ||
    clean === 'साफ करें' ||
    clean === 'साफ़ करें' ||
    clean === 'साफ' ||
    clean === 'साफ़' ||
    clean === 'सब साफ करो' ||
    clean === 'सब साफ़ करो' ||
    clean === 'मिटाएं' ||
    clean === 'मिटाओ' ||
    clean === 'हटा दो सब' ||
    clean === 'क्लियर' ||
    clean === 'क्लियर करो'
  ) {
    return { type: 'COMMAND', command: 'CLEAR' };
  }

  // Delete / Backspace commands
  if (
    clean === 'delete' ||
    clean === 'backspace' ||
    clean === 'remove last' ||
    clean === 'delete last' ||
    clean === 'undo' ||
    clean === 'del' ||
    clean === 'हटाएं' ||
    clean === 'हटाओ' ||
    clean === 'काटो' ||
    clean === 'एक काटो' ||
    clean === 'पिछला मिटाओ' ||
    clean === 'डिलीट'
  ) {
    return { type: 'COMMAND', command: 'DELETE' };
  }

  // Calculate / Equals commands
  if (
    clean === 'equals' ||
    clean === 'calculate' ||
    clean === 'solve' ||
    clean === 'result' ||
    clean === 'what is the answer' ||
    clean === 'answer' ||
    clean === 'बराबर' ||
    clean === 'उत्तर' ||
    clean === 'हल करें' ||
    clean === 'हल करो' ||
    clean === 'उत्तर बताओ' ||
    clean === 'कितना हुआ' ||
    clean === 'बराबर कितना'
  ) {
    return { type: 'COMMAND', command: 'EQUALS' };
  }

  return null;
}

/**
 * Detect ambiguity in spoken math phrases and generate clarification questions with options
 */
export function detectAmbiguity(text, context = {}) {
  const t = text.trim().toLowerCase();
  const isHi = context.isHindi || context.language === 'hi';

  // 1. Missing operand for square root: "square root of", "वर्गमूल", "vargmool"
  if (/^(?:what is (?:the )?)?(?:square )?root(?: of)?$/i.test(t) || t === 'sqrt' || t === 'वर्गमूल' || t === 'vargmool') {
    return {
      isAmbiguous: true,
      question: isHi ? 'आप किस संख्या का वर्गमूल निकालना चाहते हैं?' : 'Which number would you like to find the square root of?',
      options: [
        { label: '√144 = 12', expression: 'sqrt(144)', preview: '12' },
        { label: '√100 = 10', expression: 'sqrt(100)', preview: '10' },
        { label: '√64 = 8', expression: 'sqrt(64)', preview: '8' }
      ]
    };
  }

  // 2. Missing base for percentage: "15 percent of", "15 प्रतिशत"
  const incompletePctMatch = t.match(/^(?:what is )?(\d+(?:\.\d+)?)\s*(?:percent|percentage|%|प्रतिशत)(?:\s+(?:of|का))?$/i);
  if (incompletePctMatch) {
    const pct = incompletePctMatch[1];
    const p = parseFloat(pct);
    return {
      isAmbiguous: true,
      question: isHi ? `आप किस संख्या का ${pct}% निकालना चाहते हैं?` : `What number would you like to calculate ${pct}% of?`,
      options: [
        { label: `${pct}% of 100 = ${cleanPrecision((p / 100) * 100)}`, expression: `(${pct} / 100) * 100`, preview: `${cleanPrecision((p / 100) * 100)}` },
        { label: `${pct}% of 200 = ${cleanPrecision((p / 100) * 200)}`, expression: `(${pct} / 100) * 200`, preview: `${cleanPrecision((p / 100) * 200)}` },
        { label: `${pct}% of 240 = ${cleanPrecision((p / 100) * 240)}`, expression: `(${pct} / 100) * 240`, preview: `${cleanPrecision((p / 100) * 240)}` }
      ]
    };
  }

  // 3. Ambiguous "X and Y" without any operation: "25 and 75", "25 और 75"
  const andOnlyMatch = t.match(/^(\d+(?:\.\d+)?)\s+(?:and|और|aur)\s+(\d+(?:\.\d+)?)$/i);
  if (andOnlyMatch) {
    const a = parseFloat(andOnlyMatch[1]);
    const b = parseFloat(andOnlyMatch[2]);
    return {
      isAmbiguous: true,
      question: isHi ? `क्या आप ${andOnlyMatch[1]} और ${andOnlyMatch[2]} को जोड़ना या गुणा करना चाहते हैं?` : `Did you mean to add or multiply ${andOnlyMatch[1]} and ${andOnlyMatch[2]}?`,
      options: [
        { label: `${andOnlyMatch[1]} + ${andOnlyMatch[2]} = ${cleanPrecision(a + b)}`, expression: `${andOnlyMatch[1]} + ${andOnlyMatch[2]}`, preview: `${cleanPrecision(a + b)}` },
        { label: `${andOnlyMatch[1]} × ${andOnlyMatch[2]} = ${cleanPrecision(a * b)}`, expression: `${andOnlyMatch[1]} * ${andOnlyMatch[2]}`, preview: `${cleanPrecision(a * b)}` }
      ]
    };
  }

  // 4. Ambiguous division order: "divide X and Y"
  const divideAndMatch = t.match(/^(?:divide|भाग)\s+(\d+(?:\.\d+)?)\s+(?:and|और)\s+(\d+(?:\.\d+)?)$/i);
  if (divideAndMatch) {
    const a = parseFloat(divideAndMatch[1]);
    const b = parseFloat(divideAndMatch[2]);
    return {
      isAmbiguous: true,
      question: isHi ? `क्या आपका मतलब ${divideAndMatch[1]} ÷ ${divideAndMatch[2]} या ${divideAndMatch[2]} ÷ ${divideAndMatch[1]} है?` : `Did you mean ${divideAndMatch[1]} ÷ ${divideAndMatch[2]} or ${divideAndMatch[2]} ÷ ${divideAndMatch[1]}?`,
      options: [
        { label: `${divideAndMatch[1]} ÷ ${divideAndMatch[2]} = ${b !== 0 ? cleanPrecision(a / b) : 'Cannot divide by zero'}`, expression: `${divideAndMatch[1]} / ${divideAndMatch[2]}`, preview: b !== 0 ? `${cleanPrecision(a / b)}` : 'Error' },
        { label: `${divideAndMatch[2]} ÷ ${divideAndMatch[1]} = ${a !== 0 ? cleanPrecision(b / a) : 'Cannot divide by zero'}`, expression: `${divideAndMatch[2]} / ${divideAndMatch[1]}`, preview: a !== 0 ? `${cleanPrecision(b / a)}` : 'Error' }
      ]
    };
  }

  // 5. Ambiguous subtraction order: "subtract X and Y"
  const subtractAndMatch = t.match(/^(?:subtract|take away|घटाएं)\s+(\d+(?:\.\d+)?)\s+(?:and|और)\s+(\d+(?:\.\d+)?)$/i);
  if (subtractAndMatch) {
    const a = parseFloat(subtractAndMatch[1]);
    const b = parseFloat(subtractAndMatch[2]);
    return {
      isAmbiguous: true,
      question: isHi ? `क्या आपका मतलब ${subtractAndMatch[2]} − ${subtractAndMatch[1]} या ${subtractAndMatch[1]} − ${subtractAndMatch[2]} है?` : `Did you mean ${subtractAndMatch[2]} − ${subtractAndMatch[1]} or ${subtractAndMatch[1]} − ${subtractAndMatch[2]}?`,
      options: [
        { label: `${subtractAndMatch[2]} − ${subtractAndMatch[1]} = ${cleanPrecision(b - a)}`, expression: `${subtractAndMatch[2]} - ${subtractAndMatch[1]}`, preview: `${cleanPrecision(b - a)}` },
        { label: `${subtractAndMatch[1]} − ${subtractAndMatch[2]} = ${cleanPrecision(a - b)}`, expression: `${subtractAndMatch[1]} - ${subtractAndMatch[2]}`, preview: `${cleanPrecision(a - b)}` }
      ]
    };
  }

  // 6. Dangling single operator prefix like "plus 25", "times 10"
  const danglingPrefixMatch = t.match(/^(?:plus|add|times|multiplied by|divided by|minus|subtract)\s+(\d+(?:\.\d+)?)$/i);
  if (danglingPrefixMatch) {
    const num = danglingPrefixMatch[1];
    const prev = context.previousResult !== null && context.previousResult !== undefined ? context.previousResult : null;

    if (prev !== null) {
      return {
        isAmbiguous: true,
        question: isHi ? `क्या आप इसे पिछले परिणाम (${prev}) पर लागू करना चाहते हैं?` : `Did you mean to apply this to previous result (${prev})?`,
        options: [
          { label: `${prev} with ${num}`, expression: `${prev} + ${num}`, preview: 'Continue' },
          { label: `Start fresh with ${num}`, expression: `${num}`, preview: num }
        ]
      };
    } else {
      return {
        isAmbiguous: true,
        question: isHi ? `आप ${num} के साथ किस संख्या की गणना करना चाहते हैं?` : `What number would you like to operate on with ${num}?`,
        options: []
      };
    }
  }

  // 7. Multiple standalone numbers in a row: "50 20", "5 10"
  const standaloneNumbersMatch = t.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);
  if (standaloneNumbersMatch) {
    const a = parseFloat(standaloneNumbersMatch[1]);
    const b = parseFloat(standaloneNumbersMatch[2]);
    return {
      isAmbiguous: true,
      question: isHi ? `सुनाई दिया '${standaloneNumbersMatch[1]} ${standaloneNumbersMatch[2]}'। आप कौन सी गणना करना चाहते हैं?` : `I heard '${standaloneNumbersMatch[1]} ${standaloneNumbersMatch[2]}'. Which operation would you like to perform?`,
      options: [
        { label: `${standaloneNumbersMatch[1]} + ${standaloneNumbersMatch[2]} = ${cleanPrecision(a + b)}`, expression: `${standaloneNumbersMatch[1]} + ${standaloneNumbersMatch[2]}`, preview: `${cleanPrecision(a + b)}` },
        { label: `${standaloneNumbersMatch[1]} − ${standaloneNumbersMatch[2]} = ${cleanPrecision(a - b)}`, expression: `${standaloneNumbersMatch[1]} - ${standaloneNumbersMatch[2]}`, preview: `${cleanPrecision(a - b)}` },
        { label: `${standaloneNumbersMatch[1]} × ${standaloneNumbersMatch[2]} = ${cleanPrecision(a * b)}`, expression: `${standaloneNumbersMatch[1]} * ${standaloneNumbersMatch[2]}`, preview: `${cleanPrecision(a * b)}` }
      ]
    };
  }

  return null;
}

/**
 * Normalizes phonetic misrecognitions of mathematical and trigonometric terms
 * (e.g. SpeechRecognition hearing "10 45" or "ten forty-five" for "tan 45",
 * "sign 90" for "sin 90", "cause 0" or "cost 0" for "cos 0", etc.)
 */
export function normalizeMathPhonetics(text) {
  if (!text) return '';
  let str = text;

  // 1. Spoken word angles following trig phonetics BEFORE general number word parsing
  // (Prevents "ten forty five" from becoming 10 + 45 = 55)
  const angleWordPairs = [
    [/(?:forty[\s-]five|fortyfive)/gi, '45'],
    [/(?:thirty[\s-]five|thirtyfive)/gi, '35'],
    [/(?:twenty[\s-]five|twentyfive)/gi, '25'],
    [/(?:one[\s-]eighty|one\s+hundred\s+eighty)/gi, '180'],
    [/(?:two[\s-]seventy|two\s+hundred\s+seventy)/gi, '270'],
    [/(?:three[\s-]sixty|three\s+hundred\s+sixty)/gi, '360'],
    [/(?:one[\s-]twenty|one\s+hundred\s+twenty)/gi, '120'],
    [/(?:one\s+hundred\s+thirty[\s-]five)/gi, '135'],
    [/(?:one\s+hundred\s+fifty)/gi, '150'],
    [/\bzero\b/gi, '0'],
    [/\bone\b/gi, '1'],
    [/\btwo\b/gi, '2'],
    [/\bthree\b/gi, '3'],
    [/\bfour\b/gi, '4'],
    [/\bfive\b/gi, '5'],
    [/\bsix\b/gi, '6'],
    [/\bseven\b/gi, '7'],
    [/\beight\b/gi, '8'],
    [/\bnine\b/gi, '9'],
    [/\bten\b/gi, '10'],
    [/\bfifteen\b/gi, '15'],
    [/\beighteen\b/gi, '18'],
    [/\btwenty\b/gi, '20'],
    [/\bthirty\b/gi, '30'],
    [/\bforty\b/gi, '40'],
    [/\bfifty\b/gi, '50'],
    [/\bsixty\b/gi, '60'],
    [/\bseventy\b/gi, '70'],
    [/\beighty\b/gi, '80'],
    [/\bninety\b/gi, '90'],
    [/\b(?:hundred|one\s+hundred)\b/gi, '100'],
    [/\b(?:one\s+forty\s+four|one\s+hundred\s+forty\s+four)\b/gi, '144']
  ];

  for (const [wordRegex, num] of angleWordPairs) {
    str = str.replace(new RegExp(`\\b(?:tan|tangent|ten|ton|dan)\\s+(?:of\\s+|degrees?\\s+|deg\\s+)?${wordRegex.source}`, 'gi'), `tan(${num})`);
    str = str.replace(new RegExp(`\\b10\\s+(?:of\\s+|degrees?\\s+|deg\\s+)?${wordRegex.source}`, 'gi'), `tan(${num})`);
    str = str.replace(new RegExp(`\\b(?:cosec|cosecant|csc)\\s+(?:of\\s+|degrees?\\s+|deg\\s+)?${wordRegex.source}`, 'gi'), `csc(${num})`);
    str = str.replace(new RegExp(`\\b(?:sin|sine|sign|shine|seen|scene|syn)\\s+(?:of\\s+|degrees?\\s+|deg\\s+)?${wordRegex.source}`, 'gi'), `sin(${num})`);
    str = str.replace(new RegExp(`\\b(?:cos|cosine|cause|cost|course|coz|cuz|coss)\\s+(?:of\\s+|degrees?\\s+|deg\\s+)?${wordRegex.source}`, 'gi'), `cos(${num})`);
    str = str.replace(new RegExp(`\\b(?:cot|cotangent|court|caught)\\s+(?:of\\s+|degrees?\\s+|deg\\s+)?${wordRegex.source}`, 'gi'), `cot(${num})`);
    str = str.replace(new RegExp(`\\b(?:sec|secant|second)\\s+(?:of\\s+|degrees?\\s+|deg\\s+)?${wordRegex.source}`, 'gi'), `sec(${num})`);
  }

  // 2. "tan" / "10" / "ten" followed by digits or constants
  // For digit 10: require space, "of", or "degrees" to avoid matching larger numbers like 100 or 1000
  str = str.replace(/\b10(?:\s*of\s+|\s*(?:degrees?|deg)\s+|\s+)([0-9]+(?:\.[0-9]+)?|pi|e)\b/gi, 'tan($1)');
  // For words tan, tangent, ten, ton, dan: if digits, space is optional (tan45); if letter constants (pi, e), require space or "of"
  str = str.replace(/\b(?:tan|tangent|ten|ton|dan)(?:\s*(?:degrees?|deg)\s*|\s*)([0-9]+(?:\.[0-9]+)?)\b/gi, 'tan($1)');
  str = str.replace(/\b(?:tan|tangent|ten|ton|dan)(?:\s*of\s+|\s+)(pi|e)\b/gi, 'tan($1)');

  // 3. Cosecant (MUST be before cos!)
  str = str.replace(/\b(?:cosec|cosecant|csc)(?:\s*(?:degrees?|deg)\s*|\s*)([0-9]+(?:\.[0-9]+)?)\b/gi, 'csc($1)');
  str = str.replace(/\b(?:cosec|cosecant|csc)(?:\s*of\s+|\s+)(pi|e)\b/gi, 'csc($1)');

  // 4. Sine homophones: "sign 90", "sign90", "sin90", "seen 90", "shine 90", "scene 90", "syn 90"
  // For digits: space is optional (sin90, sign90)
  str = str.replace(/\b(?:sine\s+of|sine|sin\s+of|sin|sign\s+of|sign|seen\s+of|seen|shine\s+of|shine|scene\s+of|scene|syn)(?:\s*(?:degrees?|deg)\s*|\s*)([0-9]+(?:\.[0-9]+)?)\b/gi, 'sin($1)');
  // For constants (pi, e): require separator or space so "sine" isn't split into sin + e!
  str = str.replace(/\b(?:sine\s+of|sine|sin\s+of|sin|sign\s+of|sign|seen\s+of|seen|shine\s+of|shine|scene\s+of|scene|syn)(?:\s*of\s+|\s+)(pi|e)\b/gi, 'sin($1)');

  // 5. Cosine homophones: "cause 0", "cost 0", "cos0", "cos45", "course 0", "coz 0", "cuz 0"
  str = str.replace(/\b(?:cosine\s+of|cosine|cos\s+of|cos|cause\s+of|cause|cost\s+of|cost|coz\s+of|coz|cuz\s+of|cuz|course\s+of|course)(?:\s*(?:degrees?|deg)\s*|\s*)([0-9]+(?:\.[0-9]+)?)\b/gi, 'cos($1)');
  str = str.replace(/\b(?:cosine\s+of|cosine|cos\s+of|cos|cause\s+of|cause|cost\s+of|cost|coz\s+of|coz|cuz\s+of|cuz|course\s+of|course)(?:\s*of\s+|\s+)(pi|e)\b/gi, 'cos($1)');

  // 6. Cotangent homophones: "cot 45", "cot45", "court 45", "caught 45"
  str = str.replace(/\b(?:cot\s+of|cot|cotangent\s+of|cotangent|court\s+of|court|caught\s+of|caught)(?:\s*(?:degrees?|deg)\s*|\s*)([0-9]+(?:\.[0-9]+)?)\b/gi, 'cot($1)');
  str = str.replace(/\b(?:cot\s+of|cot|cotangent\s+of|cotangent|court\s+of|court|caught\s+of|caught)(?:\s*of\s+|\s+)(pi|e)\b/gi, 'cot($1)');

  // 7. Secant homophones: "sec 60", "sec60", "second 60"
  str = str.replace(/\b(?:sec\s+of|sec|secant\s+of|secant|second\s+of|second)(?:\s*(?:degrees?|deg)\s*|\s*)([0-9]+(?:\.[0-9]+)?)\b/gi, 'sec($1)');
  str = str.replace(/\b(?:sec\s+of|sec|secant\s+of|secant|second\s+of|second)(?:\s*of\s+|\s+)(pi|e)\b/gi, 'sec($1)');

  // 8. Square root homophones: "root144", "route 144", "root 144"
  str = str.replace(/\b(?:root|route|rout)\s*(?:of|over)?\s*(-?[0-9]+(?:\.[0-9]+)?|pi|e)\b/gi, 'sqrt($1)');

  // 9. Natural Logarithm (MUST be before base-10 log to avoid replacing "log" in "natural log"!)
  str = str.replace(/\b(?:natural\s+log|natural\s+logarithm|ln)\s*(?:of)?\s*(-?[0-9]+(?:\.[0-9]+)?|pi|e)\b/gi, 'ln($1)');

  // 10. Base-10 Log homophones: "log100", "lock 100" (only when NOT preceded by "natural")
  str = str.replace(/(?<!natural\s+)\b(?:log|lock)\s*(?:of|base\s+10\s+of|base\s+10)?\s*(-?[0-9]+(?:\.[0-9]+)?|pi|e)\b/gi, 'log($1)');

  return str;
}

/**
 * Convert spoken phrase into mathematical expression
 * Returns: { expression: string, autoCalculate: boolean, originalTranscript: string, isAmbiguous?: boolean, clarification?: object, isHindi: boolean }
 */
export function parseSpeechToMath(transcript, context = {}) {
  if (!transcript || typeof transcript !== 'string') {
    return { expression: '', autoCalculate: false, originalTranscript: '', isAmbiguous: false, isHindi: false };
  }

  const originalTranscript = transcript.trim();
  const isHindiDetected = isHindiSpeech(originalTranscript) || context.language === 'hi';
  let text = originalTranscript.toLowerCase();

  // Strip trailing punctuation like periods or question marks from speech recognition
  text = text.replace(/[?!.]+$/g, '');

  // 1. Process Hindi grammar, numerals, and math terms first
  text = convertHindiToMath(text);

  // 2. Conversational prefixes to ignore in English
  text = text.replace(/^(what is(?: the)?|what's(?: the)?|calculate|how much is|can you solve|tell me|solve|compute|find(?: the)?|find the sum of|find the value of)\s+/i, '');

  // Check if ending with "= " or "equals" or "equal to" or "बराबर"
  let autoCalculate = false;
  if (/(?:equals|equal to|is equal to|\bequal\b|बराबर)\s*$/i.test(text)) {
    autoCalculate = true;
    text = text.replace(/(?:equals|equal to|is equal to|\bequal\b|बराबर)\s*$/i, '');
  }

  // 3. NORMALIZE TRIGONOMETRIC & MATHEMATICAL PHONETICS
  // (Prevents "10 45" or "ten forty five" from triggering ambiguity errors or 55)
  text = normalizeMathPhonetics(text);

  // 4. Convert English number words to digits
  text = convertWordNumbersToDigits(text);

  // Handle common spoken decimals: "three point one four" -> "3.14", "dot 5" -> "0.5"
  text = text.replace(/(\d+)\s+(?:point|dot)\s+(\d+)/gi, '$1.$2');
  text = text.replace(/(?:point|dot)\s+(\d+)/gi, '0.$1');

  // 5. CHECK FOR AMBIGUITY BEFORE PROCEEDING
  const ambiguity = detectAmbiguity(text, { ...context, isHindi: isHindiDetected });
  if (ambiguity) {
    return {
      expression: '',
      autoCalculate: false,
      originalTranscript,
      isAmbiguous: true,
      clarification: ambiguity,
      isHindi: isHindiDetected
    };
  }

  // ----------------------------------------------------
  // NATURAL LANGUAGE MATH PHRASE TRANSFORMATIONS
  // ----------------------------------------------------

  // Trigonometry (Inverse trig first, then standard trig)
  text = text.replace(/\b(?:inverse\s+sine\s+of|inverse\s+sine|inverse\s+sin|arcsine|arcsin|sin\s+inverse\s+of|sin\s+inverse)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'asin($1)');
  text = text.replace(/\b(?:inverse\s+cosine\s+of|inverse\s+cosine|inverse\s+cos|arccosine|arccos|cos\s+inverse\s+of|cos\s+inverse)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'acos($1)');
  text = text.replace(/\b(?:inverse\s+tangent\s+of|inverse\s+tangent|inverse\s+tan|arctangent|arctan|tan\s+inverse\s+of|tan\s+inverse)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'atan($1)');

  // Trig with fractional pi: "sin of pi over 2" -> sin(pi / 2)
  text = text.replace(/\b(?:sine\s+of|sine|sin\s+of|sin)\s+(?:pi\s*(?:\/|over|divided by)\s*(\d+(?:\.\d+)?))/gi, 'sin(pi / $1)');
  text = text.replace(/\b(?:cosine\s+of|cosine|cos\s+of|cos)\s+(?:pi\s*(?:\/|over|divided by)\s*(\d+(?:\.\d+)?))/gi, 'cos(pi / $1)');
  text = text.replace(/\b(?:tangent\s+of|tangent|tan\s+of|tan)\s+(?:pi\s*(?:\/|over|divided by)\s*(\d+(?:\.\d+)?))/gi, 'tan(pi / $1)');

  // Standard Trigonometry
  text = text.replace(/\b(?:sine\s+of|sine|sin\s+of|sin)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'sin($1)');
  text = text.replace(/\b(?:cosine\s+of|cosine|cos\s+of|cos)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'cos($1)');
  text = text.replace(/\b(?:tangent\s+of|tangent|tan\s+of|tan)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'tan($1)');
  text = text.replace(/\b(?:degrees?|deg)\b/gi, '');

  // Logarithms (natural log before base 10 log)
  text = text.replace(/\b(?:natural\s+log\s+of|natural\s+logarithm\s+of|natural\s+log|natural\s+logarithm|ln\s+of|ln)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'ln($1)');
  text = text.replace(/\b(?:log\s+base\s+10\s+of|log\s+base\s+10|log\s+of|logarithm\s+of|logarithm|log)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'log($1)');

  // Constants
  text = text.replace(/\b(?:value\s+of\s+pi|number\s+pi)\b/gi, 'pi');
  text = text.replace(/\b(?:value\s+of\s+e|euler's\s+number|euler\s+number|constant\s+e)\b/gi, 'e');
  // Implicit multiplication for constants: "2 pi" -> "2 * pi", "pi times 2" -> "pi * 2"
  text = text.replace(/(\d+(?:\.\d+)?)\s*(?:times|\*|x)?\s*pi\b/gi, '$1 * pi');
  text = text.replace(/(\d+(?:\.\d+)?)\s*(?:times|\*|x)?\s*e\b/gi, '$1 * e');
  text = text.replace(/\bpi\s*(?:times|\*|x)\s*(\d+(?:\.\d+)?)\b/gi, 'pi * $1');
  text = text.replace(/\be\s*(?:times|\*|x)\s*(\d+(?:\.\d+)?)\b/gi, 'e * $1');

  // 1. Percentage phrases: "15 percent of 240", "15% of 240"
  text = text.replace(/(\d+(?:\.\d+)?)\s*(?:percent|percentage|%)\s+of\s+(\d+(?:\.\d+)?)/gi, '($1 / 100) * $2');

  // 2. Roots: Cube Root first, then Square Root ("root 144", "square root of 144")
  text = text.replace(/\b(?:cube\s+root\s+of|cube\s+root|cbrt\s+of|cbrt)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'cbrt($1)');
  text = text.replace(/\b(?:square\s+root\s+of|square\s+root|root\s+over|root\s+of|sqrt\s+of|sqrt|root)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, 'sqrt($1)');

  // 3. Prepositional Addition: "add 25 to 75", "add 25 and 75"
  text = text.replace(/\b(?:add|sum of)\s+(\d+(?:\.\d+)?)\s+(?:to|with|and)\s+(\d+(?:\.\d+)?)/gi, '$1 + $2');

  // 4. Prepositional Subtraction: "subtract 25 from 75", "take away 25 from 75"
  text = text.replace(/\b(?:subtract|take away|deduct)\s+(\d+(?:\.\d+)?)\s+from\s+(\d+(?:\.\d+)?)/gi, '$2 - $1');

  // 5. Prepositional Multiplication: "multiply 25 by 4", "multiply 25 and 4"
  text = text.replace(/\b(?:multiply|product of)\s+(\d+(?:\.\d+)?)\s+(?:by|with|and)\s+(\d+(?:\.\d+)?)/gi, '$1 * $2');

  // 6. Prepositional Division: "divide 100 by 4", "divide 4 into 100"
  text = text.replace(/\b(?:divide)\s+(\d+(?:\.\d+)?)\s+(?:by)\s+(\d+(?:\.\d+)?)/gi, '$1 / $2');
  text = text.replace(/\b(?:divide)\s+(\d+(?:\.\d+)?)\s+(?:into)\s+(\d+(?:\.\d+)?)/gi, '$2 / $1');

  // ----------------------------------------------------
  // STANDARD OPERATOR & SYMBOL REPLACEMENTS
  // ----------------------------------------------------

  // Parentheses and brackets:
  text = text.replace(/\b(?:open|start|left)\s+(?:parenthesis|parentheses|paren|bracket|brackets)\b/gi, ' ( ');
  text = text.replace(/\b(?:close|end|right)\s+(?:parenthesis|parentheses|paren|bracket|brackets)\b/gi, ' ) ');
  text = text.replace(/\bopen\b(?=\s*[\d(])/gi, ' ( ');
  text = text.replace(/(?<=[\d)])\s*\bclose\b/gi, ' ) ');

  // Power / exponentiation ("2 to the power of 3", "2 power 3", "5 squared", "2 cubed", "e squared", "pi squared"):
  text = text.replace(/\b(?:to\s+the\s+power\s+of|raised\s+to\s+the\s+power\s+of|to\s+the\s+power|raised\s+to\s+power|raised\s+to|power\s+of|power)\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, '^$1');
  text = text.replace(/(\d+(?:\.\d+)?|pi|e)\s+(?:squared|square)\b/gi, '$1^2');
  text = text.replace(/(\d+(?:\.\d+)?|pi|e)\s+(?:cubed|cube)\b/gi, '$1^3');
  text = text.replace(/\bsquare\s+of\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, '$1^2');
  text = text.replace(/\bcube\s+of\s+(-?\d+(?:\.\d+)?|pi|e)\b/gi, '$1^3');

  // Standalone percentage: "50 percent" -> "50%"
  text = text.replace(/(\d+)\s*(?:percent|percentage)\b/gi, '$1%');

  // Division
  text = text.replace(/\b(?:divided by|divide by|divided into|split by|over)\b/gi, ' / ');
  text = text.replace(/\bdivide\b/gi, ' / ');

  // Multiplication
  text = text.replace(/\b(?:multiplied by|multiply by|times|into)\b/gi, ' * ');
  text = text.replace(/\bmultiply\b/gi, ' * ');
  text = text.replace(/(?<=\d|\))\s*[xX×]\s*(?=\d|\(|pi|e|sqrt|cbrt|sin|cos|tan|log|ln)/g, ' * ');
  text = text.replace(/(?<=\s)[xX×](?=\s)/g, ' * ');

  // Addition
  text = text.replace(/\b(?:plus|add|added to|sum of|and then add)\b/gi, ' + ');

  // Subtraction
  text = text.replace(/\b(?:minus|subtract|subtracted by|take away|less|deducted by)\b/gi, ' - ');
  text = text.replace(/\bnegative\s+(\d+)/gi, ' -$1');

  // Negative sign at start: "minus 5" -> "-5"
  text = text.replace(/^\s*-\s*/, '-');

  // Clean up excessive whitespaces and sanitize expression
  text = text.replace(/[^0-9+\-*/%^().a-z\s]/g, ' ');

  // Normalize spaces
  const cleanedExpression = text
    .split(/\s+/)
    .filter(Boolean)
    .join(' ')
    .replace(/\s*([()+\-*/%^])\s*/g, '$1')
    .replace(/([+\-*/%^])/g, ' $1 ')
    .replace(/\(\s*/g, '(')
    .replace(/\s*\)/g, ')')
    .trim();

  // Determine autoCalculate
  const hasScientificCall = /\b(?:sin|cos|tan|cot|sec|csc|asin|acos|atan|log|ln|sqrt|cbrt|abs)\s*\([^)]*\)/.test(cleanedExpression);
  const hasOperator = /[+\-*/%^]/.test(cleanedExpression);
  const hasConstant = /\b(?:pi|e)\b/.test(cleanedExpression);
  const hasNumbers = /\d/.test(cleanedExpression);

  const shouldAutoCalc =
    autoCalculate ||
    hasScientificCall ||
    (hasOperator && (hasNumbers || hasConstant)) ||
    (hasConstant && (hasNumbers || cleanedExpression === 'pi' || cleanedExpression === 'e'));

  return {
    expression: cleanedExpression,
    autoCalculate: shouldAutoCalc,
    originalTranscript,
    isAmbiguous: false,
    isHindi: isHindiDetected
  };
}
