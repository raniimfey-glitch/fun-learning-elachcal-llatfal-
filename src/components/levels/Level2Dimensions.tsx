import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Volume2, Mic, HelpCircle, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Level2Props {
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

export const Level2Dimensions: React.FC<Level2Props> = ({
  onComplete,
  onRequestHint,
  onNextLevel,
}) => {
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Microphone states
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  const promptSpeech =
    'تَأَمَّلِ المُسْتَطِيلَ النَّاتِجَ مِنْ مُجَاوَرَةِ المُرَبَّعَيْنِ؛ طُولُ ضِلْعِ كُلِّ مُرَبَّعٍ 5 سَنْتِيمِتْرَاتٍ وَعَرْضُهُ 5 سَنْتِيمِتْرَاتٍ. كَمْ يَكُونُ طُولُ هَذَا المُسْتَطِيلِ بِالكَاَمِلِ؟ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلِ الحَلَّ!';

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

  const handleProcessAnswer = (val: number, rawSpoken: string) => {
    setAttempts((prev) => prev + 1);

    if (val === 10) {
      setIsCorrect(true);
      setFeedbackMsg('أَحْسَنْتَ صَوْتِيّاً! طُولُ المُسْتَطِيلِ = 10 سَنْتِيمِتْرَاتٍ.');
      setVoiceStatus('✅ إِجَابَةٌ صَحِيحَةٌ: 10 سَنْتِيمِتْرَاتٍ 🎉');
      soundManager.playSuccess();

      const praise = 'عَبْقَرِيٌّ! طُولُ المُسْتَطِيلِ يُسَاوِي عَشَرَةَ سَنْتِيمِتْرَاتٍ.';
      soundManager.speakArabic(praise);
      const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      setTimeout(() => {
        onComplete(stars);
      }, 1600);
    } else {
      setIsCorrect(false);
      let msg = '';
      if (val === 5) {
        msg = '5 سَنْتِيمِتْرَاتٍ هُوَ طُولُ ضِلْعِ مُرَبَّعٍ وَاحِدٍ فَقَطْ، وَلَدَيْكَ مُرَبَّعَانِ مُتَجَاوِرَانِ؛ اجْمَعِ الضِّلْعَيْنِ لِمَعْرِفَةِ الطُّولِ الكُلِّيِّ.';
      } else {
        msg = `سَمِعْتُ: "${rawSpoken}". فَكِّرْ: اجْمَعْ طُولَ ضِلْعَيِ المُرَبَّعَيْنِ المُتَجَاوِرَيْنِ.`;
      }
      setFeedbackMsg(msg);
      setVoiceStatus(`⚠️ سَمِعْتُ: "${rawSpoken}" — حَاوِلْ مَرَّةً أُخْرَى!`);
      soundManager.playGentleEncourage();
      soundManager.speakArabic('اقْتَرَبْتَ! اجْمَعْ طُولَ ضِلْعَيِ المُرَبَّعَيْنِ المُتَجَاوِرَيْنِ.');
    }
  };

  // Voice handler
  const processVoice = (raw: string) => {
    const norm = normalizeArabicVoice(raw);
    if (
      norm.includes('10') ||
      norm.includes('عشره') ||
      norm.includes('عشر') ||
      norm.includes('عشرات') ||
      norm.includes('ten')
    ) {
      handleProcessAnswer(10, raw);
    } else if (norm.includes('5') || norm.includes('خمسه') || norm.includes('خمس')) {
      handleProcessAnswer(5, raw);
    } else if (norm.includes('15') || norm.includes('خمسه عشر')) {
      handleProcessAnswer(15, raw);
    } else if (norm.includes('20') || norm.includes('عشرون') || norm.includes('عشرين')) {
      handleProcessAnswer(20, raw);
    } else {
      setVoiceStatus(`سَمِعْتُ: "${raw}" — اضْغَطْ وَانْطِقِ العَدَدَ 🎙️`);
      soundManager.speakArabic('تَحَدَّثْ بِعَدَدِ السَّنْتِيمِتْرَاتِ لِطُولِ المُسْتَطِيلِ.');
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
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-950 text-xs font-bold mb-2 shadow-2xs">
          <span>المُسْتَوَى 02: اسْتِنْتَاجُ أَبْعَادِ المُسْتَطِيلِ</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-indigo-950 font-['Cairo']">
          حِسَابُ طُولِ المُسْتَطِيلِ 📏
        </h2>
        <p className="text-xs sm:text-base font-semibold text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
          عَرْضُ المُسْتَطِيلِ <strong className="text-emerald-600 font-bold">5 سم</strong>. تَأَمَّلِ الشَّكْلَ وَاسْتَنْتِجْ <strong className="text-indigo-600 font-bold">طُولَهُ الكَامِلَ</strong>.
        </p>
      </div>

      {/* QUESTION & MICROPHONE DIRECT ANSWERING */}
      <div className="mb-4 sm:mb-5 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-800 to-indigo-900 text-white shadow-xl border-2 border-emerald-400/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-right flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-sm">
                السُّؤَالُ الرَّئِيسِيُّ ❓
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-black text-white font-['Cairo'] leading-relaxed">
              مَا هُوَ طُولُ هَذَا المُسْتَطِيلِ بِالسَّنْتِيمِتْرِ؟
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-bold mt-1 leading-relaxed">
              تَأَمَّلِ الأَبْعَادَ فِي الرَّسْمِ أَدْنَاهُ، ثُمَّ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلِ الطُّولَ المُسْتَنْتَجَ.
            </p>
          </div>

          {/* Big Interactive Mic Button */}
          <div className="flex flex-col items-center shrink-0">
            <motion.button
              id="btn-level2-top-mic"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleListening}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 shadow-rose-500/60 ring-8 ring-rose-400/50 animate-pulse'
                  : 'bg-gradient-to-tr from-emerald-500 to-cyan-400 shadow-emerald-500/40 ring-4 ring-white/40 hover:shadow-2xl'
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
      <div className="mb-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3 sm:p-3.5 text-right transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-2xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h4 className="font-black text-xs sm:text-sm text-emerald-950 font-['Cairo']">
              تَوْجِيهٌ صَوْتِيٌّ
            </h4>
          </div>

          <button
            id="btn-level2-voice-guide"
            onClick={handlePlayVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/70 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="استمع إلى التوجيهات الصوتية"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>اسْتَمِعْ لِلسُّؤَالِ 🔊</span>
          </button>
        </div>
      </div>

      {/* Clear, Accurate Mathematical SVG Stage */}
      <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-sky-50/70 to-emerald-50/40 rounded-2xl sm:rounded-[2.5rem] border-2 border-emerald-200 p-3 sm:p-4 flex flex-col items-center justify-center select-none overflow-hidden">
        {/* Dimension Callout Top (Total Length) */}
        <div className="relative mb-3 sm:mb-4 flex items-center justify-center w-56 sm:w-80">
          <div className="w-full border-t-2 border-dashed border-indigo-600 relative flex items-center justify-center">
            <div className="absolute -top-1.5 right-0 w-3 h-3 border-r-2 border-t-2 border-indigo-600 rotate-45"></div>
            <div className="absolute -top-1.5 left-0 w-3 h-3 border-l-2 border-b-2 border-indigo-600 rotate-45"></div>

            <div
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md transition-all duration-300 ${
                isCorrect
                  ? 'bg-emerald-600 text-white scale-105 sm:scale-110 shadow-lg shadow-emerald-200'
                  : 'bg-white border-2 border-indigo-300 text-indigo-950'
              }`}
            >
              {isCorrect ? 'الطُّولُ = 10 سم (5 + 5) ✅' : 'طُولُ المُسْتَطِيلِ = ؟ سم'}
            </div>
          </div>
        </div>

        {/* The Precise 2-Square Combined Rectangle */}
        <div className="flex items-center">
          <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border-2 sm:border-4 border-white">
            {/* Half 1 */}
            <div className="w-24 h-24 sm:w-40 sm:h-32 bg-indigo-600 flex flex-col items-center justify-center border-l-2 border-dashed border-white/60 text-white">
              <span className="text-[9px] sm:text-[10px] bg-indigo-900/70 px-2 sm:px-2.5 py-0.5 rounded-md font-bold mb-1 shadow-2xs">
                المُرَبَّعُ الأَوَّلُ
              </span>
              <span className="text-sm sm:text-lg font-black font-mono">5 سم</span>
            </div>

            {/* Half 2 */}
            <div className="w-24 h-24 sm:w-40 sm:h-32 bg-pink-500 flex flex-col items-center justify-center text-white">
              <span className="text-[9px] sm:text-[10px] bg-pink-900/70 px-2 sm:px-2.5 py-0.5 rounded-md font-bold mb-1 shadow-2xs">
                المُرَبَّعُ الثَّانِي
              </span>
              <span className="text-sm sm:text-lg font-black font-mono">5 سم</span>
            </div>
          </div>

          {/* Width Dimension Indicator */}
          <div className="mr-2.5 sm:mr-3.5 flex items-center gap-1.5 sm:gap-2 h-24 sm:h-32">
            <div className="h-full border-r-2 border-dashed border-emerald-600 relative flex items-center">
              <div className="absolute -right-1.5 top-0 w-3 h-3 border-r-2 border-t-2 border-emerald-600 -rotate-45"></div>
              <div className="absolute -right-1.5 bottom-0 w-3 h-3 border-r-2 border-b-2 border-emerald-600 rotate-45"></div>
            </div>
            <div className="bg-white border-2 border-emerald-600 text-emerald-950 text-[11px] sm:text-sm font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-md whitespace-nowrap">
              العَرْضُ = 5 سم
            </div>
          </div>
        </div>

        {/* Visual Addition Callout when correct */}
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-emerald-600 text-white font-black text-xs sm:text-sm px-5 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>الحِسَابُ: 5 سم + 5 سم = 10 سَنْتِيمِتْرَاتٍ 🎉</span>
          </motion.div>
        )}
      </div>

      {/* Success Notification & Next Action */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
              <h3 className="text-lg sm:text-xl font-black font-['Cairo']">
                إِجَابَةٌ صَوْتِيَّةٌ مُمْتَازَةٌ! 🎉
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-100 mb-4 leading-relaxed">
              طُولُ المُسْتَطِيلِ هُوَ 10 سم، وَالعَرْضُ هُوَ 5 سم.
            </p>
            <button
              id="btn-level2-direct-next"
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
              <span>انْتَقِلْ لِلْمَرْحَلَةِ التَّالِيَةِ (المُسْتَوَى 3)</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback text */}
      {feedbackMsg && !isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs sm:text-sm font-bold p-3.5 rounded-2xl border bg-amber-50 text-amber-950 border-amber-200 text-right leading-relaxed"
        >
          💡 {feedbackMsg}
        </motion.div>
      )}

      {/* Hint trigger */}
      <div className="flex items-center justify-start mt-5 pt-4 border-t border-slate-100">
        <button
          id="btn-level2-hint"
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
