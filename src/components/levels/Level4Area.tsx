import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Volume2, Mic, HelpCircle, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Level4Props {
  onComplete: (stars: number) => void;
  onRequestHint: () => void;
  hintLevel: number;
  onNextLevel?: () => void;
}

// Arabic text normalizer
const normalizeArabicVoice = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[^\u0621-\u064A0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
};

export const Level4Area: React.FC<Level4Props> = ({
  onComplete,
  onRequestHint,
  onNextLevel,
}) => {
  const TOTAL_CELLS = 50;
  const [filledCount, setFilledCount] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  const promptSpeech =
    'مِسَاحَةُ المُسْتَطِيلِ هِيَ عَدَدُ المُرَبَّعَاتِ دَاخِلَ الشَّكْلِ (الطُّولُ ضَرْبُ العَرْضِ: 10 × 5). تَأَمَّلِ الشَّبَكَةَ، احْسُبِ المِسَاحَةَ ثُمَّ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلِ الحَلَّ!';

  useEffect(() => {
    soundManager.speakArabic(promptSpeech);
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handlePlayVoice = () => {
    soundManager.playPop();
    soundManager.speakArabic(promptSpeech);
  };

  const handleCellClick = (index: number) => {
    if (filledCount < TOTAL_CELLS) {
      soundManager.playPop();
      setFilledCount((prev) => Math.min(TOTAL_CELLS, Math.max(prev + 1, index + 1)));
    }
  };

  const handleFillRow = () => {
    soundManager.playSnap();
    setFilledCount((prev) => Math.min(TOTAL_CELLS, prev + 10));
  };

  const handleFillAll = () => {
    soundManager.playSuccess();
    setFilledCount(TOTAL_CELLS);
  };

  const handleProcessAnswer = (val: number, rawSpoken: string) => {
    setAttempts((prev) => prev + 1);

    if (val === 50) {
      setIsCalculated(true);
      setFilledCount(TOTAL_CELLS);
      setFeedback('أَحْسَنْتَ صَوْتِيّاً! مِسَاحَةُ المُسْتَطِيلِ = 50 سَنْتِيمِتْراً مُرَبَّعاً.');
      setVoiceStatus('✅ إِجَابَةٌ صَحِيحَةٌ: 50 سَنْتِيمِتْراً مُرَبَّعاً 🎉');
      soundManager.playSuccess();

      const praise = 'مُمْتَازٌ! مِسَاحَةُ المُسْتَطِيلِ تُسَاوِي خَمْسِينَ سَنْتِيمِتْراً مُرَبَّعاً.';
      soundManager.speakArabic(praise);
      const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      setTimeout(() => {
        onComplete(stars);
      }, 1600);
    } else {
      setIsCalculated(false);
      setFeedback(`سَمِعْتُ: "${rawSpoken}". فَكِّرْ: اضْرِبْ عَدَدَ الأَعْمِدَةِ فِي عَدَدِ الصُّفُوفِ لِمَعْرِفَةِ المِسَاحَةِ.`);
      setVoiceStatus(`⚠️ سَمِعْتُ: "${rawSpoken}" — حَاوِلْ مَرَّةً أُخْرَى!`);
      soundManager.playGentleEncourage();
      soundManager.speakArabic('اقْتَرَبْتَ! اضْرِبْ عَدَدَ الأَعْمِدَةِ فِي عَدَدِ الصُّفُوفِ.');
    }
  };

  // Voice handler
  const processVoice = (raw: string) => {
    const norm = normalizeArabicVoice(raw);
    if (
      norm.includes('50') ||
      norm.includes('خمسون') ||
      norm.includes('خمسين') ||
      norm.includes('fifty')
    ) {
      handleProcessAnswer(50, raw);
    } else if (norm.includes('25') || norm.includes('خمسه وعشرون')) {
      handleProcessAnswer(25, raw);
    } else if (norm.includes('30') || norm.includes('ثلاثون') || norm.includes('ثلاثين')) {
      handleProcessAnswer(30, raw);
    } else if (norm.includes('40') || norm.includes('اربعون')) {
      handleProcessAnswer(40, raw);
    } else {
      setVoiceStatus(`سَمِعْتُ: "${raw}" — اضْغَطْ وَانْطِقِ المِسَاحَةَ 🎙️`);
      soundManager.speakArabic('تَحَدَّثْ بِمِسَاحَةِ المُسْتَطِيلِ بِالسَّنْتِيمِتْرِ المُرَبَّعِ.');
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
      setVoiceStatus('المَايكْرُوفُونُ غَيْرُ مَدْعُومٍ فِي هَذَا المُتَصَفِّحِ.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('🎙️ جَارِي الاسْتِمَاعُ... تَحَدَّثْ بِإِجَابَتِكَ الآنَ');
        soundManager.playChime(1);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        processVoice(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus('اضْغَطْ عَلَى المَايكْرُوفُونِ وَتَحَدَّثْ بِصَوْتٍ وَاضِحٍ.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatus('تَعَذَّرَ فَتْحُ المَايكْرُوفُونِ، حَاوِلْ مَرَّةً أُخْرَى.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3.5 sm:p-6 md:p-8 bg-white/95 rounded-2xl sm:rounded-[2.5rem] border border-sky-100 shadow-xl">
      {/* Level Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-950 text-xs font-bold mb-2 shadow-2xs">
          <span>المُسْتَوَى 04: حِسَابُ المِسَاحَةِ</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-indigo-950 font-['Cairo']">
          شَبَكَةُ المُرَبَّعَاتِ وَقَانُونُ المِسَاحَةِ 🟩
        </h2>
        <p className="text-xs sm:text-base font-semibold text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
          المِسَاحَةُ = <strong className="text-purple-600 font-bold">عَدَدُ المُرَبَّعَاتِ دَاخِلَ الشَّكْلِ</strong> (الطُّولُ × العَرْضُ).
        </p>
      </div>

      {/* QUESTION & MICROPHONE DIRECT ANSWERING */}
      <div className="mb-4 sm:mb-5 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-950 text-white shadow-xl border-2 border-purple-400/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-right flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-sm">
                السُّؤَالُ الرَّئِيسِيُّ ❓
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-black text-white font-['Cairo'] leading-relaxed">
              احْسُبْ مِسَاحَةَ هَذَا المُسْتَطِيلِ بِالسَّنْتِيمِتْرِ المُرَبَّعِ (سم²)؟
            </h3>
            <p className="text-xs sm:text-sm text-purple-100/90 font-bold mt-1 leading-relaxed">
              تَأَمَّلِ الشَّبَكَةَ (10 أَعْمِدَةٍ × 5 صُفُوفٍ)، ثُمَّ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلْ قِيمَةَ المِسَاحَةِ.
            </p>
          </div>

          {/* Big Mic Button */}
          <div className="flex flex-col items-center shrink-0">
            <motion.button
              id="btn-level4-top-mic"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleListening}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 shadow-rose-500/60 ring-8 ring-rose-400/50 animate-pulse'
                  : 'bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-purple-500/40 ring-4 ring-white/40 hover:shadow-2xl'
              }`}
              title={isListening ? 'اضغط لإيقاف الاستماع' : 'اضغط للتحدث بإجابتك'}
            >
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-1" />
              <span className="text-[11px] font-black tracking-tight">
                {isListening ? 'أَسْتَمِعُ...' : 'تَحَدَّثْ 🎤'}
              </span>

              {isListening && (
                <span className="absolute -inset-2 rounded-full border-2 border-rose-300 animate-ping pointer-events-none" />
              )}
            </motion.button>
          </div>
        </div>

        {voiceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3.5 p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-black text-white text-center shadow-inner"
          >
            {voiceStatus}
          </motion.div>
        )}
      </div>

      {/* Guide Header & Speaker */}
      <div className="mb-4 rounded-2xl bg-purple-50/60 border border-purple-100 p-3 sm:p-3.5 text-right transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-600 text-white shadow-2xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h4 className="font-black text-xs sm:text-sm text-purple-950 font-['Cairo']">
              تَوْجِيهٌ صَوْتِيٌّ
            </h4>
          </div>

          <button
            id="btn-level4-voice-guide"
            onClick={handlePlayVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100/70 text-purple-700 border border-purple-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="استمع إلى التوجيهات الصوتية"
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-600" />
            <span>اسْتَمِعْ لِلسُّؤَالِ 🔊</span>
          </button>
        </div>
      </div>

      {/* Clear, Accurate Mathematical 10x5 Grid Stage */}
      <div className="relative w-full bg-gradient-to-b from-sky-50/70 to-purple-50/40 rounded-2xl sm:rounded-[2.5rem] border-2 border-purple-200 p-3 sm:p-6 flex flex-col items-center justify-center select-none">
        {/* Top Width Label (10 columns) */}
        <div className="mb-2 text-[11px] sm:text-xs font-extrabold text-indigo-900 bg-white/90 px-3 py-1 rounded-full border border-purple-100 shadow-2xs">
          الطُّولُ = 10 أَعْمِدَةٍ (10 سم)
        </div>

        <div className="flex items-center gap-2 sm:gap-3 max-w-full overflow-x-auto p-1">
          {/* Height Label (5 rows) */}
          <div className="text-[10px] sm:text-xs font-extrabold text-pink-900 bg-white/90 px-1.5 sm:px-2 py-2 sm:py-3 rounded-xl border border-purple-100 shadow-2xs" style={{ writingMode: 'vertical-rl' }}>
            العَرْضُ = 5 صُفُوفٍ (5 سم)
          </div>

          {/* Precise 10x5 Grid */}
          <div className="inline-grid grid-cols-10 gap-0.5 sm:gap-1 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-100">
            {Array.from({ length: TOTAL_CELLS }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-xs sm:rounded-md transition-all duration-150 cursor-pointer ${
                  idx < filledCount
                    ? 'bg-gradient-to-tr from-indigo-600 to-pink-500 shadow-xs scale-95'
                    : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                }`}
                title={`مربع ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Counter and fill helpers */}
        <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-sm mt-3 sm:mt-4 px-1 sm:px-2">
          <span className="text-[11px] sm:text-xs font-black text-slate-700 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-sky-100 shadow-2xs">
            المُرَبَّعَاتُ المُغَطَّاةُ: <strong className="text-purple-600 font-extrabold">{filledCount}</strong> / 50
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="btn-fill-row"
              onClick={handleFillRow}
              className="text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-indigo-100 cursor-pointer shadow-2xs"
            >
              + صَفٌّ (10)
            </button>
            <button
              id="btn-fill-all"
              onClick={handleFillAll}
              className="text-[10px] sm:text-[11px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-pink-100 cursor-pointer shadow-2xs"
            >
              مَلْءُ الكُلِّ ✨
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification & Next Action */}
      <AnimatePresence>
        {isCalculated && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
              <h3 className="text-lg sm:text-xl font-black font-['Cairo']">
                إِجَابَةٌ صَوْتِيَّةٌ عَبْقَرِيَّةٌ! 🎉
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-100 mb-4 leading-relaxed">
              مِسَاحَةُ المُسْتَطِيلِ = 10 × 5 = 50 سَنْتِيمِتْراً مُرَبَّعاً (سم²).
            </p>
            <button
              id="btn-level4-direct-next"
              type="button"
              onClick={() => {
                soundManager.playPop();
                if (onNextLevel) {
                  onNextLevel();
                } else {
                  onComplete(3);
                }
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-emerald-950 font-black text-base shadow-lg hover:bg-emerald-50 transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>انْتَقِلْ لِلْمَرْحَلَةِ التَّالِيَةِ (المُسْتَوَى 5)</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback text */}
      {feedback && !isCalculated && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs sm:text-sm font-bold p-3.5 rounded-2xl border bg-amber-50 text-amber-950 border-amber-200 text-right leading-relaxed"
        >
          💡 {feedback}
        </motion.div>
      )}

      {/* Hint trigger */}
      <div className="flex items-center justify-start mt-5 pt-4 border-t border-slate-100">
        <button
          id="btn-level4-hint"
          onClick={onRequestHint}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-indigo-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>تَلْمِيحٌ مُسَاعِدٌ 💡</span>
        </button>
      </div>
    </div>
  );
};
