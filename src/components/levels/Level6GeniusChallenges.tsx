import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Volume2,
  Mic,
  Send,
} from 'lucide-react';
import { GENIUS_PUZZLES } from '../../data/geniusPuzzles';
import { GeniusPuzzle } from '../../types';
import { soundManager } from '../../utils/sound';

interface Level6Props {
  onCompleteAll: (stars: number) => void;
  onUpdateCompletedPuzzles: (puzzleIndex: number) => void;
  completedPuzzleIndices: number[];
  onRequestHint: () => void;
  hintLevel: number;
  onPuzzleChange?: (puzzleIndex: number) => void;
}

// Arabic normalizer for voice and text matching
const normalizeArabicText = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // strip diacritics
    .replace(/[^\u0621-\u064A0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
};

export const Level6GeniusChallenges: React.FC<Level6Props> = ({
  onCompleteAll,
  onUpdateCompletedPuzzles,
  completedPuzzleIndices,
  onRequestHint,
  onPuzzleChange,
}) => {
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState<number>(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [attempts, setAttempts] = useState<Record<number, number>>({});

  // Microphone states
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  const currentPuzzle: GeniusPuzzle = GENIUS_PUZZLES[currentPuzzleIdx];
  const isLastPuzzle = currentPuzzleIdx === GENIUS_PUZZLES.length - 1;

  useEffect(() => {
    soundManager.speakArabic(currentPuzzle.story + ' ' + currentPuzzle.question);
    setIsAnswerCorrect(null);
    setFeedbackText('');
    setVoiceStatus('');
    setManualInput('');
    onPuzzleChange?.(currentPuzzleIdx);

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [currentPuzzleIdx, onPuzzleChange]);

  const handlePlayVoice = () => {
    soundManager.playPop();
    soundManager.speakArabic(currentPuzzle.story + ' ' + currentPuzzle.question);
  };

  // Evaluate candidate answer based on puzzle criteria
  const evaluateAnswer = (rawAnswer: string, isVoice: boolean = false) => {
    const norm = normalizeArabicText(rawAnswer);
    if (!norm) return;

    const currentAttempts = (attempts[currentPuzzle.id] || 0) + 1;
    setAttempts((prev) => ({ ...prev, [currentPuzzle.id]: currentAttempts }));

    let isCorrect = false;

    // Per-puzzle intelligent matching logic based on deduction
    switch (currentPuzzle.id) {
      case 1:
        // Expected: 24 or 4×6
        isCorrect =
          norm.includes('24') ||
          norm.includes('اربع') && norm.includes('عشر') ||
          norm.includes('اربعة وعشرون') ||
          norm.includes('اربعة وعشرين');
        break;

      case 2:
        // Expected: 32 (96 - 64)
        isCorrect =
          norm.includes('32') ||
          norm.includes('اثنان وثلاثون') ||
          norm.includes('اثنين وثلاثين') ||
          norm.includes('ثلاثين') && norm.includes('اثنين');
        break;

      case 3:
        // Expected: side 6 m, area 36 m²
        isCorrect =
          norm.includes('6') ||
          norm.includes('36') ||
          norm.includes('سته') ||
          norm.includes('ستة') ||
          norm.includes('ستة وثلاثون') ||
          norm.includes('ستة وثلاثين');
        break;

      case 4:
        // Expected: تتضاعف (double / 48)
        isCorrect =
          norm.includes('تتضاعف') ||
          norm.includes('تضاعف') ||
          norm.includes('ضعف') ||
          norm.includes('48') ||
          norm.includes('ثمانية واربعون') ||
          norm.includes('ثمانية واربعين') ||
          norm.includes('مرتين');
        break;

      case 5:
        // Expected: 3 مستطيلات (3 possibilities)
        isCorrect =
          norm.includes('3') ||
          norm.includes('ثلاث') ||
          norm.includes('ثلاثه') ||
          norm.includes('ثلاثة') ||
          norm.includes('12x1') ||
          norm.includes('6x2') ||
          norm.includes('4x3');
        break;

      case 6:
        // Expected: الشريط الطويل 8x1 أو 18
        isCorrect =
          norm.includes('8x1') ||
          norm.includes('شريط') ||
          norm.includes('طويل') ||
          norm.includes('18') ||
          norm.includes('ثمانية عشر') ||
          norm.includes('ثمانية عشر سم') ||
          norm.includes('اول') ||
          norm.includes('الاول');
        break;

      case 7:
        // Expected: 80 m² (100 - 20)
        isCorrect =
          norm.includes('80') ||
          norm.includes('ثمانون') ||
          norm.includes('ثمانين');
        break;

      case 8:
        // Expected: نعم متساويتان (both are 32 cm²)
        isCorrect =
          norm.includes('نعم') ||
          norm.includes('متساوي') ||
          norm.includes('متساويتان') ||
          norm.includes('متساويه') ||
          norm.includes('32') ||
          norm.includes('نفس المساحه');
        break;

      default:
        isCorrect = false;
    }

    if (isCorrect) {
      setIsAnswerCorrect(true);
      setFeedbackText(currentPuzzle.explanation);
      setVoiceStatus(`✅ إِجَابَةٌ صَحِيحَةٌ: "${rawAnswer}" 🎉`);
      soundManager.playSuccess();
      const praise = isVoice
        ? 'عَبْقَرِيٌّ! سَمِعْتُ إِجَابَتَكَ الصَّوْتِيَّةَ الصَّحِيحَةَ!'
        : 'أَحْسَنْتَ! إِجَابَةٌ صَحِيحَةٌ وَذَكِيَّةٌ جِدّاً!';
      soundManager.speakArabic(praise);
      onUpdateCompletedPuzzles(currentPuzzleIdx);
    } else {
      setIsAnswerCorrect(false);
      setFeedbackText(`سَمِعْتُ: "${rawAnswer}". تَأَمَّلِ الشَّكْلَ الهَنْدَسِيَّ جَيِّداً ثُمَّ حَاوِلْ مَرَّةً أُخْرَى!`);
      setVoiceStatus(`⚠️ سَمِعْتُ: "${rawAnswer}" — حَاوِلْ مَرَّةً أُخْرَى!`);
      soundManager.playGentleEncourage();
      soundManager.speakArabic('اقْتَرَبْتَ! فَكِّرْ جَيِّداً فِي الشَّكْلِ وَحَاوِلْ مَرَّةً أُخْرَى.');
    }
  };

  const handleToggleListening = () => {
    soundManager.playPop();
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus('المَايكْرُوفُونُ غَيْرُ مَدْعُومٍ فِي هَذَا المُتَصَفِّحِ، يُمْكِنُكَ كِتَابَةُ الإِجَابَةِ أَدْنَاهُ.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('🎙️ جَارِي الاسْتِمَاعُ... قُلْ إِجَابَتَكَ الآنَ');
        soundManager.playChime(1);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        evaluateAnswer(transcript, true);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus('اضْغَطْ عَلَى المَايكْرُوفُونِ وَتَحَدَّثْ بِصَوْتٍ وَاضِحٍ 🎙️');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      evaluateAnswer(manualInput, false);
    }
  };

  const handleNextPuzzle = () => {
    soundManager.playPop();
    if (currentPuzzleIdx < GENIUS_PUZZLES.length - 1) {
      setCurrentPuzzleIdx((prev) => prev + 1);
    } else {
      soundManager.playSuccess();
      onCompleteAll(3);
    }
  };

  const handlePrevPuzzle = () => {
    soundManager.playPop();
    if (currentPuzzleIdx > 0) {
      setCurrentPuzzleIdx((prev) => prev - 1);
    }
  };

  // Render precise, clean geometric vector diagrams without equation formulas
  const renderPuzzleDiagram = (puzzle: GeniusPuzzle) => {
    switch (puzzle.visualType) {
      case 'split_rect':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <svg viewBox="0 0 300 140" className="w-full max-w-sm h-36">
              {/* Total Container Outline */}
              <rect x="20" y="25" width="260" height="90" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4" rx="10" />
              
              {/* Square Cutout 6x6 */}
              <rect x="20" y="25" width="150" height="90" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" rx="8" />
              <text x="95" y="75" fill="#0369A1" fontSize="13" fontWeight="900" textAnchor="middle">
                مُرَبَّعٌ (6 سم × 6 سم)
              </text>

              {/* Remaining Rectangle */}
              <rect x="170" y="25" width="110" height="90" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" rx="8" />
              <text x="225" y="70" fill="#92400E" fontSize="12" fontWeight="900" textAnchor="middle">
                المُسْتَطِيلُ المُتَبَقِّي
              </text>
              <text x="225" y="90" fill="#B45309" fontSize="13" fontWeight="900" textAnchor="middle">
                المِسَاحَةُ = ؟
              </text>

              {/* Dimension Labels */}
              <text x="150" y="18" fill="#1E293B" fontSize="12" fontWeight="bold" textAnchor="middle">
                الطُّولُ الكُلِّيُّ لِلْمُسْتَطِيلِ = 10 سم
              </text>
            </svg>
          </div>
        );

      case 'nested_cut':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <svg viewBox="0 0 300 140" className="w-full max-w-sm h-36">
              {/* Outer Rectangle 12x8 */}
              <rect x="25" y="15" width="250" height="110" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="3" rx="10" />
              <text x="190" y="40" fill="#3730A3" fontSize="12" fontWeight="bold" textAnchor="middle">
                مُسْتَطِيلٌ (12 سم × 8 سم)
              </text>

              {/* Cutout Square 8x8 */}
              <rect x="25" y="15" width="110" height="110" fill="#FFE4E6" stroke="#E11D48" strokeDasharray="5" strokeWidth="2.5" rx="8" />
              <text x="80" y="75" fill="#9F1239" fontSize="12" fontWeight="900" textAnchor="middle">
                مُرَبَّعٌ (8 سم × 8 سم)
              </text>

              {/* Remaining Section */}
              <text x="205" y="80" fill="#4338CA" fontSize="13" fontWeight="900" textAnchor="middle">
                المِسَاحَةُ المُتَبَقِّيَةُ = ؟
              </text>
            </svg>
          </div>
        );

      case 'square_garden':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <svg viewBox="0 0 240 140" className="w-48 sm:w-56 h-36">
              <rect x="40" y="15" width="160" height="110" fill="#DCFCE7" stroke="#16A34A" strokeWidth="4" rx="12" />
              <text x="120" y="55" fill="#166534" fontSize="13" fontWeight="900" textAnchor="middle">
                حَدِيقَةٌ مُرَبَّعَةٌ
              </text>
              <text x="120" y="80" fill="#15803D" fontSize="12" fontWeight="bold" textAnchor="middle">
                طُولُ السِّيَاجِ (المُحِيطُ) = 24 مِتْراً
              </text>
              <text x="120" y="105" fill="#14532D" fontSize="12" fontWeight="900" textAnchor="middle">
                طُولُ الضِّلْعِ = ؟ | المِسَاحَةُ = ؟
              </text>
            </svg>
          </div>
        );

      case 'double_rect':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <svg viewBox="0 0 300 130" className="w-full max-w-sm h-32">
              {/* Original Rect 6x4 */}
              <rect x="20" y="25" width="100" height="85" fill="#FCE7F3" stroke="#DB2777" strokeWidth="3" rx="8" />
              <text x="70" y="60" fill="#9D174D" fontSize="11" fontWeight="bold" textAnchor="middle">
                مُسْتَطِيلٌ أَصْلِيٌّ
              </text>
              <text x="70" y="80" fill="#BE185D" fontSize="11" fontWeight="900" textAnchor="middle">
                6 سم × 4 سم
              </text>

              {/* Doubled Length Rect 12x4 */}
              <rect x="140" y="25" width="145" height="85" fill="#F3E8FF" stroke="#9333EA" strokeWidth="3" rx="8" />
              <text x="212" y="60" fill="#6B21A8" fontSize="11" fontWeight="bold" textAnchor="middle">
                مُضَاعَفَةُ الطُّولِ (12 سم)
              </text>
              <text x="212" y="80" fill="#7E22CE" fontSize="12" fontWeight="900" textAnchor="middle">
                المِسَاحَةُ الجَدِيدَةُ = ؟
              </text>
            </svg>
          </div>
        );

      case 'tile_arrangements':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <div className="text-xs font-black text-indigo-900 mb-2">
              12 مُرَبَّعاً صَغِيراً (1 سم² لِكُلِّ مُرَبَّعٍ)
            </div>
            <div className="grid grid-cols-4 gap-1.5 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-bold text-[10px] flex items-center justify-center shadow-xs"
                >
                  1
                </div>
              ))}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-2">
              كَمْ مُسْتَطِيلاً مُخْتَلِفَ الأَبْعَادِ يُمْكِنُ تَكْوِينُهُ؟
            </div>
          </div>
        );

      case 'compare_two':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <svg viewBox="0 0 300 130" className="w-full max-w-sm h-32">
              {/* Rectangle 4x2 */}
              <rect x="25" y="30" width="100" height="70" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="3" rx="8" />
              <text x="75" y="65" fill="#854D0E" fontSize="12" fontWeight="bold" textAnchor="middle">
                مُسْتَطِيلٌ (4 سم × 2 سم)
              </text>
              <text x="75" y="85" fill="#A16207" fontSize="11" fontWeight="bold" textAnchor="middle">
                المِسَاحَةُ = 8 سم²
              </text>

              {/* Strip 8x1 */}
              <rect x="145" y="45" width="140" height="38" fill="#CFFAFE" stroke="#0891B2" strokeWidth="3" rx="8" />
              <text x="215" y="65" fill="#155E75" fontSize="12" fontWeight="bold" textAnchor="middle">
                شَرِيطٌ (8 سم × 1 سم)
              </text>
              <text x="215" y="78" fill="#0E7490" fontSize="11" fontWeight="bold" textAnchor="middle">
                المِسَاحَةُ = 8 سم²
              </text>
            </svg>
          </div>
        );

      case 'garden_path':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <svg viewBox="0 0 240 140" className="w-48 sm:w-56 h-36">
              {/* Outer Square Garden 10x10 */}
              <rect x="40" y="10" width="160" height="120" fill="#DCFCE7" stroke="#15803D" strokeWidth="3" rx="8" />
              
              {/* Middle Pathway 10x2 */}
              <rect x="40" y="55" width="160" height="30" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeDasharray="3" />
              <text x="120" y="74" fill="#334155" fontSize="11" fontWeight="900" textAnchor="middle">
                مَمَرُّ المُشَاةِ (عَرْضُ 2 م)
              </text>

              <text x="120" y="38" fill="#166534" fontSize="11" fontWeight="bold" textAnchor="middle">
                حَدِيقَةٌ (10 م × 10 م)
              </text>
              <text x="120" y="110" fill="#14532D" fontSize="11" fontWeight="900" textAnchor="middle">
                المِسَاحَةُ الخَضْرَاءُ المُتَبَقِّيَةُ = ؟
              </text>
            </svg>
          </div>
        );

      case 'equal_areas':
        return (
          <div className="flex flex-col items-center justify-center p-3">
            <svg viewBox="0 0 300 130" className="w-full max-w-sm h-32">
              {/* Rect A 8x4 */}
              <rect x="20" y="25" width="110" height="80" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3" rx="8" />
              <text x="75" y="65" fill="#1E40AF" fontSize="12" fontWeight="bold" textAnchor="middle">
                أَزْرَقُ (8 سم × 4 سم)
              </text>

              {/* Rect B 16x2 */}
              <rect x="145" y="45" width="140" height="40" fill="#FFEDD5" stroke="#EA580C" strokeWidth="3" rx="8" />
              <text x="215" y="70" fill="#C2410C" fontSize="12" fontWeight="bold" textAnchor="middle">
                بُرْتُقَالِيٌّ (16 سم × 2 سم)
              </text>
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3.5 sm:p-6 md:p-8 bg-white/95 rounded-2xl sm:rounded-[2.5rem] border border-sky-100 shadow-xl">
      {/* Top Level Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-950 text-[11px] sm:text-xs font-black shadow-2xs">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>تَحَدِّيَاتُ العَبَاقِرَةِ: اللُّغْزُ {currentPuzzleIdx + 1} مِنْ {GENIUS_PUZZLES.length}</span>
        </div>

        <button
          onClick={handlePlayVoice}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
          title="استمع إلى السؤال"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>اسْتَمِعْ 🔊</span>
        </button>
      </div>

      {/* Puzzle Title & Story */}
      <div className="text-right mb-3 sm:mb-4">
        <h2 className="text-base sm:text-xl font-black text-indigo-950 font-['Cairo']">
          {currentPuzzle.title}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 leading-relaxed">
          {currentPuzzle.story}
        </p>
      </div>

      {/* Visual Accurate Geometric Diagram */}
      <div className="w-full bg-gradient-to-b from-sky-50/50 to-indigo-50/30 rounded-2xl sm:rounded-3xl border border-sky-100 mb-3 sm:mb-4 overflow-hidden shadow-2xs p-1">
        {renderPuzzleDiagram(currentPuzzle)}
      </div>

      {/* Question Prompt */}
      <div className="text-right mb-3 sm:mb-4">
        <div className="font-black text-xs sm:text-base text-indigo-950 flex items-center gap-2 font-['Cairo'] bg-indigo-50/70 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-indigo-100">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{currentPuzzle.question}</span>
        </div>
      </div>

      {/* Prominent Voice / Microphone Answer Banner */}
      <div className="mb-4 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-amber-400/30">
        <div className="flex items-center justify-between gap-3">
          <div className="text-right flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
                إِجَابَةٌ صَوْتِيَّةٌ مُبَاشَرَةٌ 🎙️
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white font-['Cairo']">
              اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلِ الحَلَّ الَّذِي اسْتَنْتَجْتَهُ!
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amber-100/90 font-bold mt-0.5">
              تَأَمَّلِ الشَّكْلَ الهَنْدَسِيَّ ثُمَّ انْطِقْ إِجَابَتَكَ بِصَوْتٍ وَاضِحٍ.
            </p>
          </div>

          {/* Big Interactive Mic Button */}
          <motion.button
            id="btn-level6-mic"
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggleListening}
            className={`relative w-14 h-14 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center text-white font-black shadow-xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 shadow-rose-500/50 ring-6 ring-rose-400/40 animate-pulse'
                : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 shadow-amber-500/30 ring-4 ring-white/30 hover:shadow-2xl'
            }`}
            title={isListening ? 'اضغط لإيقاف الاستماع' : 'اضغط للتحدث بالإجابة'}
          >
            <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white mb-0.5" />
            <span className="text-[9px] sm:text-[10px] font-black tracking-tight">
              {isListening ? 'أَسْتَمِعُ...' : 'تَحَدَّثْ 🎤'}
            </span>
          </motion.button>
        </div>

        {voiceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-100 text-center"
          >
            {voiceStatus}
          </motion.div>
        )}

        {/* Optional Manual Deduction Input fallback */}
        <form onSubmit={handleManualSubmit} className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="أَوْ اكْتُبْ إِجَابَتَكَ هُنَا (مِثَال: 24)..."
            className="flex-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 text-white placeholder-slate-300 text-xs font-bold border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-right"
          />
          <button
            type="submit"
            className="px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>إِرْسَالٌ</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Feedback Banner on Solution */}
      <AnimatePresence>
        {feedbackText && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-3xl border text-xs sm:text-sm font-black text-right mb-4 leading-relaxed ${
              isAnswerCorrect
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-md'
                : 'bg-amber-50 text-amber-950 border-amber-300 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isAnswerCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-black text-emerald-800 font-['Cairo']">اسْتِنْتَاجٌ صَحِيحٌ وَرَائِعٌ! 🎉</span>
                </>
              ) : (
                <span className="font-black text-amber-800 font-['Cairo']">💡 إِرْشَادٌ:</span>
              )}
            </div>
            <p>{feedbackText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          id="btn-prev-genius"
          onClick={handlePrevPuzzle}
          disabled={currentPuzzleIdx === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السَّابِقُ</span>
        </button>

        <button
          id="btn-level6-hint"
          onClick={onRequestHint}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-indigo-100"
        >
          <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
          <span>تَلْمِيحٌ 💡</span>
        </button>

        <button
          id="btn-next-genius"
          onClick={handleNextPuzzle}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            isAnswerCorrect
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 animate-bounce'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <span>{isLastPuzzle ? 'إِنْهَاءُ التَّحَدِّي 🏆' : 'اللُّغْزُ التَّالِي'}</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
