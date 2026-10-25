/**
 * Speech Synthesis Helper for Vocalc
 *
 * Speaks calculation results using the Web Speech Synthesis API.
 * Supports bilingual voice output in English and Hindi (हिन्दी) with
 * authentic native Hindi spoken number words (e.g. "उत्तर है बयालीस").
 */

const HINDI_0_TO_99 = [
  'शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
  'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
  'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस', 'तीस',
  'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस', 'चालीस',
  'इकतालीस', 'बयालीस', 'तैंतालीस', 'चौवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास', 'पचास',
  'इक्यावन', 'बावन', 'तिरपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ', 'साठ',
  'इकसठ', 'बासठ', 'तिरसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सरसठ', 'अड़सठ', 'उनहत्तर', 'सत्तर',
  'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उन्यासी', 'अस्सी',
  'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी', 'नब्बे',
  'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'
];

/**
 * Converts any numeric calculation result into authentic spoken Hindi words
 * E.g., 42 -> "बयालीस", 240 -> "दो सौ चालीस", 3.14 -> "तीन दशमलव एक चार", -8 -> "माइनस आठ"
 */
export function numberToHindiWords(num, maxDecimals = 4) {
  if (num === null || num === undefined) return '';
  const n = typeof num === 'number' ? num : parseFloat(num.toString().replace(/,/g, ''));
  if (isNaN(n)) return num.toString();
  if (!isFinite(n)) return 'अनंत';

  if (n < 0) {
    return 'माइनस ' + numberToHindiWords(Math.abs(n), maxDecimals);
  }

  const str = n.toString();
  if (str.includes('.')) {
    const [intPart, rawDecPart] = str.split('.');
    let decPart = rawDecPart;
    // If decimal is longer than maxDecimals (e.g. from scientific constants or trig), round nicely for speech
    if (decPart.length > maxDecimals) {
      const rounded = Number(n).toFixed(maxDecimals);
      const roundedParts = rounded.split('.');
      if (roundedParts[1]) {
        decPart = roundedParts[1].replace(/0+$/, '') || '0';
      }
    }
    const intWords = numberToHindiWords(parseInt(intPart, 10), maxDecimals);
    const decWords = decPart.split('').map(d => HINDI_0_TO_99[parseInt(d, 10)] || d).join(' ');
    return `${intWords} दशमलव ${decWords}`;
  }

  const intNum = Math.floor(n);
  if (intNum < 100) {
    return HINDI_0_TO_99[intNum] || intNum.toString();
  }

  if (intNum < 1000) {
    const hundreds = Math.floor(intNum / 100);
    const remainder = intNum % 100;
    const hText = `${HINDI_0_TO_99[hundreds]} सौ`;
    return remainder > 0 ? `${hText} ${numberToHindiWords(remainder)}` : hText;
  }

  if (intNum < 100000) {
    const thousands = Math.floor(intNum / 1000);
    const remainder = intNum % 1000;
    const tText = `${numberToHindiWords(thousands)} हज़ार`;
    return remainder > 0 ? `${tText} ${numberToHindiWords(remainder)}` : tText;
  }

  if (intNum < 10000000) {
    const lakhs = Math.floor(intNum / 100000);
    const remainder = intNum % 100000;
    const lText = `${numberToHindiWords(lakhs)} लाख`;
    return remainder > 0 ? `${lText} ${numberToHindiWords(remainder)}` : lText;
  }

  if (intNum < 1000000000) {
    const crores = Math.floor(intNum / 10000000);
    const remainder = intNum % 10000000;
    const cText = `${numberToHindiWords(crores)} करोड़`;
    return remainder > 0 ? `${cText} ${numberToHindiWords(remainder)}` : cText;
  }

  return intNum.toString();
}

const HINDI_TRANSLATIONS = {
  cannotDivideByZero: 'शून्य से विभाजित नहीं किया जा सकता',
  negativeSqrt: 'ऋणात्मक संख्या का वर्गमूल संभव नहीं है',
  invalidExpression: 'अमान्य अभिव्यक्ति',
  cleared: 'साफ़ किया गया',
  tanUndefined: '90 डिग्री का टैन अपरिभाषित है',
  logInvalid: 'शून्य या ऋणात्मक संख्या का लॉग संभव नहीं है',
  answerIs: (val) => `उत्तर है ${val}`,
  equals: (val) => `बराबर ${val}`
};

class SpeechSpeaker {
  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.isMuted = false;
    this.language = 'en'; // 'en' or 'hi'
    this.currentUtterance = null;
    this.voices = [];
    this.selectedVoiceEn = null;
    this.selectedVoiceHi = null;

    if (this.isSupported) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.isSupported) return;
    try {
      this.voices = window.speechSynthesis.getVoices() || [];
      if (this.voices.length > 0) {
        // Find best English voice
        const preferredEn = this.voices.find(
          v =>
            (v.name.includes('Natural') ||
             v.name.includes('Google') ||
             v.name.includes('Samantha') ||
             v.name.includes('Daniel') ||
             v.name.includes('Jenny')) &&
            v.lang.startsWith('en')
        );
        this.selectedVoiceEn = preferredEn || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];

        // Find best Hindi voice (hi, hi-IN, hi_IN)
        const preferredHi = this.voices.find(
          v =>
            v.lang.startsWith('hi') ||
            v.name.includes('Hindi') ||
            v.name.includes('हिन्दी') ||
            v.name.includes('Kalpana') ||
            v.name.includes('Hemant') ||
            v.name.includes('Lekha')
        );
        // If no native Hindi voice installed on OS, fallback to Indian English or available voice
        this.selectedVoiceHi = preferredHi || this.voices.find(v => v.lang === 'en-IN') || this.selectedVoiceEn;
      }
    } catch (e) {
      console.warn('Could not initialize speech synthesis voices:', e);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.cancel();
    }
  }

  setLanguage(lang) {
    this.language = lang === 'hi' ? 'hi' : 'en';
  }

  cancel() {
    if (this.isSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Speak a calculation result or error message in English or Hindi
   * @param {string|number} result - The result or error message to speak
   * @param {object} options - Optional callbacks & speech options (language, rate, pitch, etc.)
   */
  speakResult(result, options = {}) {
    if (!this.isSupported || this.isMuted) return;

    this.cancel();

    const isHi = (options.language || this.language) === 'hi';
    let textToSpeak = '';

    if (typeof result === 'number' || (!isNaN(Number(result)) && typeof result === 'string')) {
      const numVal = Number(result);
      if (isHi) {
        // Convert to authentic spoken Hindi number words so TTS pronounces naturally
        const hindiWord = numberToHindiWords(numVal, 4);
        textToSpeak = HINDI_TRANSLATIONS.answerIs(hindiWord);
      } else {
        let cleanVal = numVal.toString();
        // For long floating decimal results (e.g. from constants or trig), format up to 4 decimals for conversational speech
        if (cleanVal.includes('.') && cleanVal.split('.')[1].length > 4) {
          cleanVal = parseFloat(numVal.toFixed(4)).toString();
        }
        textToSpeak = `The answer is ${cleanVal}`;
      }
    } else if (typeof result === 'string') {
      const lower = result.toLowerCase();
      if (lower.includes('cannot divide by zero') || lower.includes('divide by zero')) {
        textToSpeak = isHi ? HINDI_TRANSLATIONS.cannotDivideByZero : 'Cannot divide by zero';
      } else if (lower.includes('negative number')) {
        textToSpeak = isHi ? HINDI_TRANSLATIONS.negativeSqrt : result;
      } else if (lower.includes('tan(90') || lower.includes('tangent of 90')) {
        textToSpeak = isHi ? HINDI_TRANSLATIONS.tanUndefined : result;
      } else if (lower.includes('log of zero') || lower.includes('natural log of zero')) {
        textToSpeak = isHi ? HINDI_TRANSLATIONS.logInvalid : result;
      } else if (lower.includes('invalid') || lower.includes('malformed') || lower.includes('mismatched')) {
        textToSpeak = isHi ? HINDI_TRANSLATIONS.invalidExpression : result;
      } else if (lower === 'cleared') {
        textToSpeak = isHi ? HINDI_TRANSLATIONS.cleared : 'Cleared';
      } else {
        // If it's a clarification question or custom phrase
        textToSpeak = result;
      }
    }

    if (!textToSpeak) return;

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = options.rate || (isHi ? 0.9 : 0.95);
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      if (isHi) {
        utterance.lang = 'hi-IN';
        if (this.selectedVoiceHi) {
          utterance.voice = this.selectedVoiceHi;
        }
      } else {
        utterance.lang = 'en-US';
        if (this.selectedVoiceEn) {
          utterance.voice = this.selectedVoiceEn;
        }
      }

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (err) => {
        if (err.error !== 'interrupted' && err.error !== 'canceled') {
          console.warn('Speech synthesis error:', err);
        }
        if (options.onError) options.onError(err);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  }
}

export const speaker = new SpeechSpeaker();
