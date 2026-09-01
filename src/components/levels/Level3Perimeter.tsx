import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Volume2, Mic, HelpCircle, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Level3Props {
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

export const Level3Perimeter: React.FC<Level3Props> = ({
  onComplete,
  onRequestHint,
  onNextLevel,
}) => {
  const [touchedSides, setTouchedSides] = useState<{
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  }>({
    top: false,
    right: false,
    bottom: false,
    left: false,
  });

  const [isCalculated, setIsCalculated] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  const introSpeech =
    'المُحِيطُ هُوَ مَجْمُوعُ أَطْوَالِ الإِطَارِ الخَارِجِيِّ لِلْمُسْتَطِيلِ. تَأَمَّلِ الأَضْلَاعَ (10 سم وَ 5 سم)، احْسُبِ المُحِيطَ ثُمَّ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلِ الحَلَّ!';

  useEffect(() => {
    soundManager.speakArabic(introSpeech);
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
    soundManager.speakArabic(introSpeech);
  };

  const handleTouchSide = (side: 'top' | 'right' | 'bottom' | 'left', index: number) => {
    soundManager.playChime(index);
    setTouchedSides((prev) => ({ ...prev, [side]: true }));

    const sideNames = {
      top: 'الضِّلْعُ العُلْوِيُّ 10 سَنْتِيمِتْرَاتٍ',
      right: 'الضِّلْعُ الأَيْمَنُ 5 سَنْتِيمِتْرَاتٍ',
      bottom: 'الضِّلْعُ السُّفْلِيُّ 10 سَنْتِيمِتْرَاتٍ',
      left: 'الضِّلْعُ الأَيْسَرُ 5 سَنْتِيمِتْرَاتٍ',
    };
    soundManager.speakArabic(sideNames[side]);
  };

  const handleProcessAnswer = (sum: number, rawSpoken: string) => {
    setAttempts((prev) => prev + 1);

    if (sum === 30) {
      setIsCalculated(true);
      setTouchedSides({ top: true, right: true, bottom: true, left: true });
      setFeedback('أَحْسَنْتَ صَوْتِيّاً! مُحِيطُ المُسْتَطِيلِ = 30 سَنْتِيمِتْراً.');
      setVoiceStatus('✅ إِجَابَةٌ صَحِيحَةٌ: 30 سَنْتِيمِتْراً 🎉');
      soundManager.playSuccess();

      const praise = 'مُمْتَازٌ! مُحِيطُ المُسْتَطِيلِ يُسَاوِي ثَلَاثِينَ سَنْتِيمِتْراً.';
      soundManager.speakArabic(praise);
      const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      setTimeout(() => {
        onComplete(stars);
      }, 1600);
    } else {
      setIsCalculated(false);
      setFeedback(`سَمِعْتُ: "${rawSpoken}". فَكِّرْ: قُمْ بِجَمْعِ أَطْوَالِ الأَضْلَاعِ الأَرْبَعَةِ لِلْمُسْتَطِيلِ.`);
      setVoiceStatus(`⚠️ سَمِعْتُ: "${rawSpoken}" — حَاوِلْ مَرَّةً أُخْرَى!`);
      soundManager.playGentleEncourage();
      soundManager.speakArabic('اقْتَرَبْتَ! اجْمَعْ أَطْوَالَ جَمِيعِ الأَضْلَاعِ الأَرْبَعَةِ.');
    }
  };

  // Voice processing
  const processVoice = (raw: string) => {
    const norm = normalizeArabicVoice(raw);
    if (
      norm.includes('30') ||
      norm.includes('ثلاثون') ||
      norm.includes('ثلاثين') ||
      norm.includes('thirty')
    ) {
      handleProcessAnswer(30, raw);
    } else if (norm.includes('20') || norm.includes('عشرون') || norm.includes('عشرين')) {
      handleProcessAnswer(20, raw);
    } else if (norm.includes('25') || norm.includes('خمسه وعشرون')) {
      handleProcessAnswer(25, raw);
    } else if (norm.includes('35') || norm.includes('خمسه وثلاثون')) {
      handleProcessAnswer(35, raw);
    } else {
      setVoiceStatus(`سَمِعْتُ: "${raw}" — اضْغَطْ وَانْطِقِ العَدَدَ 🎙️`);
      soundManager.speakArabic('تَحَدَّثْ بِمَجْمُوعِ أَطْوَالِ أَضْلَاعِ المُسْتَطِيلِ.');
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
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-950 text-xs font-bold mb-2 shadow-2xs">
          <span>المُسْتَوَى 03: حِسَابُ المُحِيطِ</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-indigo-950 font-['Cairo']">
          حِسَابُ مُحِيطِ المُسْتَطِيلِ 📐
        </h2>
        <p className="text-xs sm:text-base font-semibold text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
          المُحِيطُ هُوَ <strong className="text-indigo-600 font-bold">مَجْمُوعُ أَطْوَالِ الإِطَارِ الخَارِجِيِّ</strong> (الأَضْلَاعُ الأَرْبَعَةُ).
        </p>
      </div>

      {/* QUESTION & MICROPHONE DIRECT ANSWERING */}
      <div className="mb-4 sm:mb-5 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-sky-900 via-indigo-900 to-indigo-950 text-white shadow-xl border-2 border-sky-400/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-right flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-sm">
                السُّؤَالُ الرَّئِيسِيُّ ❓
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-black text-white font-['Cairo'] leading-relaxed">
              احْسُبْ مُحِيطَ هَذَا المُسْتَطِيلِ بِالسَّنْتِيمِتْرِ؟
            </h3>
            <p className="text-xs sm:text-sm text-sky-100/90 font-bold mt-1 leading-relaxed">
              تَأَمَّلْ أَطْوَالَ الأَضْلَاعِ فِي الشَّكْلِ أَدْنَاهُ، ثُمَّ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلْ قِيمَةَ المُحِيطِ.
            </p>
          </div>

          {/* Big Mic Button */}
          <div className="flex flex-col items-center shrink-0">
            <motion.button
              id="btn-level3-top-mic"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleListening}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 shadow-rose-500/60 ring-8 ring-rose-400/50 animate-pulse'
                  : 'bg-gradient-to-tr from-sky-500 to-indigo-400 shadow-sky-500/40 ring-4 ring-white/40 hover:shadow-2xl'
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
      <div className="mb-4 rounded-2xl bg-sky-50/60 border border-sky-100 p-3 sm:p-3.5 text-right transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-600 text-white shadow-2xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h4 className="font-black text-xs sm:text-sm text-sky-950 font-['Cairo']">
              تَوْجِيهٌ صَوْتِيٌّ
            </h4>
          </div>

          <button
            id="btn-level3-voice-guide"
            onClick={handlePlayVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sky-100/70 text-sky-700 border border-sky-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="استمع إلى التوجيهات الصوتية"
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
            <span>اسْتَمِعْ لِلسُّؤَالِ 🔊</span>
          </button>
        </div>
      </div>

      {/* Clear, Accurate Mathematical SVG Stage */}
      <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-sky-50/70 to-indigo-50/40 rounded-2xl sm:rounded-[2.5rem] border-2 border-sky-200 p-3 sm:p-4 flex flex-col items-center justify-center select-none overflow-hidden">
        <div className="relative w-52 sm:w-80 h-32 sm:h-40 bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-white shadow-2xl flex items-center justify-center">
          <div className="text-center p-2 sm:p-3">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 block mb-1">
              مُسْتَطِيلٌ (10 سم × 5 سم)
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-sky-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-sky-100 shadow-2xs">
              {isCalculated ? 'المُحِيطُ = 30 سم ✅' : 'المُحِيطُ = مَجْمُوعُ الأَضْلَاعِ'}
            </span>
          </div>

          {/* Top Edge */}
          <button
            id="edge-top"
            onClick={() => handleTouchSide('top', 0)}
            className={`absolute -top-3.5 sm:-top-4 inset-x-2 sm:inset-x-4 h-7 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-md ${
              touchedSides.top || isCalculated
                ? 'bg-indigo-600 text-white ring-2 sm:ring-4 ring-indigo-200'
                : 'bg-sky-500 hover:bg-sky-600 text-white'
            }`}
          >
            الطُّولُ = 10 سم
          </button>

          {/* Bottom Edge */}
          <button
            id="edge-bottom"
            onClick={() => handleTouchSide('bottom', 2)}
            className={`absolute -bottom-3.5 sm:-bottom-4 inset-x-2 sm:inset-x-4 h-7 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-md ${
              touchedSides.bottom || isCalculated
                ? 'bg-indigo-600 text-white ring-2 sm:ring-4 ring-indigo-200'
                : 'bg-sky-500 hover:bg-sky-600 text-white'
            }`}
          >
            الطُّولُ = 10 سم
          </button>

          {/* Right Edge */}
          <button
            id="edge-right"
            onClick={() => handleTouchSide('right', 1)}
            className={`absolute -right-3.5 sm:-right-4 inset-y-2 sm:inset-y-3 w-7 sm:w-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-md ${
              touchedSides.right || isCalculated
                ? 'bg-pink-600 text-white ring-2 sm:ring-4 ring-pink-200'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
            style={{ writingMode: 'vertical-rl' }}
          >
            العَرْضُ = 5 سم
          </button>

          {/* Left Edge */}
          <button
            id="edge-left"
            onClick={() => handleTouchSide('left', 3)}
            className={`absolute -left-3.5 sm:-left-4 inset-y-2 sm:inset-y-3 w-7 sm:w-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-md ${
              touchedSides.left || isCalculated
                ? 'bg-pink-600 text-white ring-2 sm:ring-4 ring-pink-200'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
            style={{ writingMode: 'vertical-rl' }}
          >
            العَرْضُ = 5 سم
          </button>
        </div>

        {/* Geometric Perimeter Status Callout */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-slate-700 bg-white/90 px-5 py-2 rounded-2xl border border-sky-100 shadow-sm">
          <span>المُحِيطُ الإِجْمَالِيُّ = </span>
          <span className="text-indigo-600 font-black">
            {isCalculated ? '30 سَنْتِيمِتْراً ✅' : '؟ (احْسُبْهُ صَوْتِيّاً 🎙️)'}
          </span>
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
              مُحِيطُ المُسْتَطِيلِ = 10 + 5 + 10 + 5 = 30 سَنْتِيمِتْراً.
            </p>
            <button
              id="btn-level3-direct-next"
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
              <span>انْتَقِلْ لِلْمَرْحَلَةِ التَّالِيَةِ (المُسْتَوَى 4)</span>
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
          id="btn-level3-hint"
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
