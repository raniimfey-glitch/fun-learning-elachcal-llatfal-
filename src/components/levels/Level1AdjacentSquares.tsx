import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Move,
  RotateCcw,
  Volume2,
  HelpCircle,
  Mic,
  ArrowLeft,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Level1Props {
  onComplete: (stars: number) => void;
  onRequestHint: () => void;
  hintLevel: number;
  onNextLevel?: () => void;
}

// Arabic text normalizer for accurate voice matching
const normalizeArabicVoice = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove diacritics
    .replace(/[^\u0621-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ');
};

export const Level1AdjacentSquares: React.FC<Level1Props> = ({
  onComplete,
  onRequestHint,
  onNextLevel,
}) => {
  // Game states
  const [isSnapped, setIsSnapped] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [wrongMessage, setWrongMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Position for square 2 (interactive draggable)
  const [sq2Pos, setSq2Pos] = useState({ x: 120, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Microphone / Voice Recognition States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const introSpeech =
    'لَدَى أَمِينٍ مُرَبَّعَانِ مُتَطَابِقَانِ، طُولُ ضِلْعِ كُلِّ مُرَبَّعٍ خَمْسَةُ سَنْتِيمِتْرَاتٍ. تَأَمَّلِ الشَّكْلَ جَيِّداً، ثُمَّ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلْ: مَا هُوَ الشَّكْلُ الهَنْدَسِيُّ النَّاتِجُ عِنْدَ مُجَاوَرَتِهِمَا؟';

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

  const handlePlayInstructionsVoice = () => {
    soundManager.playPop();
    soundManager.speakArabic(introSpeech);
  };

  // Snap check logic
  const checkSnap = (currentX: number, currentY: number) => {
    const distance = Math.hypot(currentX, currentY);
    if (distance < 50) {
      triggerSnap(false);
    }
  };

  const triggerSnap = (silent: boolean = false) => {
    setSq2Pos({ x: 0, y: 0 });
    setIsSnapped(true);
    if (!silent) {
      soundManager.playSnap();
      soundManager.playSuccess();
      soundManager.speakArabic(
        'تَمَّ تَرْكِيبُ الشَّكْلِ! اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلْ مَا هُوَ هَذَا الشَّكْلُ النَّاتِجُ.'
      );
    }
  };

  // Touch and mouse drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSnapped) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: sq2Pos.x,
      posY: sq2Pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isSnapped) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newX = dragStartRef.current.posX + dx;
    const newY = dragStartRef.current.posY + dy;
    setSq2Pos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || isSnapped) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    checkSnap(sq2Pos.x, sq2Pos.y);
  };

  // Answer Submission Handler via Voice
  const handleVoiceAnswer = (transcript: string) => {
    const norm = normalizeArabicVoice(transcript);
    setAttempts((prev) => prev + 1);

    if (
      norm.includes('مستطيل') ||
      norm.includes('مستطيلان') ||
      norm.includes('مستطيلات') ||
      norm.includes('مستطيلا') ||
      norm.includes('المستطيل') ||
      norm.includes('rectangle')
    ) {
      // Correct!
      setIsAnswerCorrect(true);
      setWrongMessage('');
      setVoiceStatusMessage('✅ إِجَابَةٌ صَحِيحَةٌ: "مُسْتَطِيلٌ" 🎉');

      // Snap the squares visually
      setSq2Pos({ x: 0, y: 0 });
      setIsSnapped(true);

      soundManager.playSnap();
      soundManager.playSuccess();

      const successVoice =
        'أَحْسَنْتَ يَا بَطَلُ! الشَّكْلُ الهَنْدَسِيُّ النَّاتِجُ هُوَ مُسْتَطِيلٌ (طُولُهُ 10 سم وَعَرْضُهُ 5 سم).';
      soundManager.speakArabic(successVoice);

      const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      onComplete(stars);
      return;
    }

    if (
      norm.includes('مربع') ||
      norm.includes('مربعان') ||
      norm.includes('مربعين') ||
      norm.includes('المربع') ||
      norm.includes('square')
    ) {
      setVoiceStatusMessage('⚠️ سَمِعْتُ: "مُرَبَّعٌ" — المُرَبَّعُ لَهُ 4 أَضْلَاعٍ مُتَسَاوِيَةٍ.');
      const msg =
        'اقْتَرَبْتَ! المُرَبَّعُ أَضْلَاعُهُ مُتَسَاوِيَةٌ، أَمَّا الشَّكْلُ النَّاتِجُ فَطُولُهُ (10 سم) أَكْبَرُ مِنْ عَرْضِهِ (5 سم). مَا هُوَ؟';
      setWrongMessage(msg);
      soundManager.playGentleEncourage();
      soundManager.speakArabic(msg);
      return;
    }

    if (
      norm.includes('مثلث') ||
      norm.includes('مثلثان') ||
      norm.includes('مثلثين') ||
      norm.includes('المثلث') ||
      norm.includes('triangle')
    ) {
      setVoiceStatusMessage('⚠️ سَمِعْتُ: "مُثَلَّثٌ" — المُثَلَّثُ لَهُ 3 أَضْلَاعٍ فَقَطْ.');
      const msg = 'فَكِّرْ جَيِّداً! الشَّكْلُ النَّاتِجُ رُبَاعِيُّ الأَضْلَاعِ وَلَهُ طُولٌ وَعَرْضٌ.';
      setWrongMessage(msg);
      soundManager.playGentleEncourage();
      soundManager.speakArabic(msg);
      return;
    }

    if (
      norm.includes('الصق') ||
      norm.includes('التحام') ||
      norm.includes('ركب') ||
      norm.includes('جمع') ||
      norm.includes('لاصق')
    ) {
      setVoiceStatusMessage('✨ أَمْرٌ صَوْتِيٌّ: إِلْصَاقُ المُرَبَّعَيْنِ');
      triggerSnap();
      return;
    }

    // Unrecognized word
    setVoiceStatusMessage(`سَمِعْتُ: "${transcript}" — فَكِّرْ فِي اسْمِ الشَّكْلِ الرُّبَاعِيِّ النَّاتِجِ 🎙️`);
    soundManager.speakArabic('لَمْ أَسْتَوْعِبِ الإِجَابَةَ، اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلِ اسْمَ الشَّكْلِ الهَنْدَسِيِّ.');
  };

  // Toggle Microphone Recognition
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
      setVoiceStatusMessage('المَايكْرُوفُونُ غَيْرُ مَدْعُومٍ فِي هَذَا المُتَصَفِّحِ.');
      soundManager.speakArabic('المَايكْرُوفُونُ غَيْرُ مَدْعُومٍ فِي هَذَا المُتَصَفِّحِ.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusMessage('🎙️ جَارِي الاسْتِمَاعُ... تَحَدَّثْ بِإِجَابَتِكَ الآنَ');
        soundManager.playChime(1);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceAnswer(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceStatusMessage('⚠️ يَرْجَى السَّمَاحُ لِلْمُتَصَفِّحِ بِاسْتِخْدَامِ المَايكْرُوفُونِ.');
        } else if (event.error === 'no-speech') {
          setVoiceStatusMessage('لَمْ أَسْمَعْ صَوْتاً، اضْغَطْ عَلَى المَايكْرُوفُونِ وَتَحَدَّثْ بِصَوْتٍ وَاضِحٍ.');
        } else {
          setVoiceStatusMessage('اضْغَطْ عَلَى المَايكْرُوفُونِ وَتَحَدَّثْ بِصَوْتٍ وَاضِحٍ.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatusMessage('تَعَذَّرَ فَتْحُ المَايكْرُوفُونِ، حَاوِلْ مَرَّةً أُخْرَى.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3.5 sm:p-6 md:p-8 bg-white/95 rounded-2xl sm:rounded-[2.5rem] border border-sky-100 shadow-xl">
      {/* Level Header Info */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-950 text-xs font-bold mb-2 shadow-2xs">
          <span>المُسْتَوَى 01: اسْتِنْتَاجُ الشَّكْلِ الهَنْدَسِيِّ</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-indigo-950 font-['Cairo']">
          لُغْزُ المُرَبَّعَيْنِ المُتَجَاوِرَيْنِ 🧩
        </h2>
        <p className="text-xs sm:text-base font-semibold text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
          لَدَى أَمِينٍ <strong className="text-indigo-600 font-bold">مُرَبَّعَانِ مُتَطَابِقَانِ</strong>، طُولُ ضِلْعِ كُلِّ وَاحِدٍ مِنْهُمَا <strong className="text-pink-600 font-bold">5 سم</strong>.
        </p>
      </div>

      {/* QUESTION & MICROPHONE ANWERING SECTION */}
      <div className="mb-4 sm:mb-5 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 text-white shadow-xl border-2 border-indigo-400/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-right flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-sm">
                السُّؤَالُ الرَّئِيسِيُّ ❓
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-black text-white font-['Cairo'] leading-relaxed">
              مَا هُوَ الشَّكْلُ الهَنْدَسِيُّ النَّاتِجُ عِنْدَ مُجَاوَرَةِ المُرَبَّعَيْنِ؟
            </h3>
            <p className="text-xs sm:text-sm text-sky-100/90 font-bold mt-1 leading-relaxed">
              تَأَمَّلِ الشَّكْلَيْنِ أَدْنَاهُ، ثُمَّ اضْغَطْ عَلَى المَايكْرُوفُونِ وَقُلِ اسْمَ الشَّكْلِ النَّاتِجِ.
            </p>
          </div>

          {/* Big Interactive Microphone Button */}
          <div className="flex flex-col items-center shrink-0">
            <motion.button
              id="btn-level1-mic-answer"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleListening}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 shadow-rose-500/60 ring-8 ring-rose-400/50 animate-pulse'
                  : 'bg-gradient-to-tr from-rose-500 via-amber-500 to-pink-500 shadow-rose-500/40 ring-4 ring-white/40 hover:shadow-rose-500/60'
              }`}
              title={isListening ? 'اضغط لإيقاف الاستماع' : 'اضغط للتحدث بإجابتك'}
            >
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-1" />
              <span className="text-[11px] font-black tracking-tight">
                {isListening ? 'أَسْتَمِعُ...' : 'تَحَدَّثْ 🎤'}
              </span>

              {isListening && (
                <>
                  <span className="absolute -inset-2 rounded-full border-2 border-rose-300 animate-ping pointer-events-none" />
                  <span className="absolute -inset-4 rounded-full border border-rose-200 animate-pulse pointer-events-none" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Audio Status */}
        {voiceStatusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3.5 p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-black text-white text-center shadow-inner"
          >
            {voiceStatusMessage}
          </motion.div>
        )}
      </div>

      {/* Guide Header & Speaker */}
      <div className="mb-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 p-3 sm:p-3.5 text-right transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h4 className="font-black text-xs sm:text-sm text-indigo-950 font-['Cairo']">
              تَوْجِيهٌ صَوْتِيٌّ
            </h4>
          </div>

          <button
            id="btn-level1-voice-guide"
            onClick={handlePlayInstructionsVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100/70 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="استمع إلى التوجيهات الصوتية"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>اسْتَمِعْ لِلسُّؤَالِ 🔊</span>
          </button>
        </div>
      </div>

      {/* Precise & Clear Geometric Visual Stage */}
      <div
        ref={containerRef}
        className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-sky-50/70 to-indigo-50/40 rounded-2xl sm:rounded-[2.5rem] border-2 border-sky-200 p-3 sm:p-4 flex flex-col items-center justify-center overflow-hidden select-none"
      >
        {/* Instruction Badge inside canvas */}
        {!isSnapped && (
          <div className="absolute top-2.5 sm:top-3 text-center text-[11px] sm:text-xs font-bold text-indigo-950 bg-white/95 border border-sky-200 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 shadow-xs z-30">
            <Move className="w-3.5 h-3.5 text-indigo-600" />
            <span>اسْحَبِ المُرَبَّعَ لِمُجَاوَرَةِ أَخِيهِ 👈</span>
          </div>
        )}

        {/* Clear Mathematical SVG Container */}
        <div className="relative flex items-center justify-center">
          {/* Target Snap Outline */}
          {!isSnapped && (
            <div className="absolute flex items-center gap-0 pointer-events-none opacity-40">
              <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-slate-400 rounded-2xl"></div>
              <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-indigo-500 bg-indigo-100/40 rounded-2xl"></div>
            </div>
          )}

          {/* Square 1 (Stationary Indigo) */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-indigo-600 border-2 sm:border-4 border-white shadow-xl flex flex-col items-center justify-center text-white font-extrabold z-10 transition-all rounded-r-none rounded-l-2xl">
            <span className="text-[9px] sm:text-[10px] bg-indigo-900/70 px-2 sm:px-2.5 py-0.5 rounded-md mb-1 sm:mb-1.5 shadow-2xs font-bold">
              مُرَبَّعٌ (أ)
            </span>
            <span className="text-[11px] sm:text-sm font-mono text-white font-black">5 سم × 5 سم</span>
            {/* Right-angle indicator */}
            <div className="absolute top-1 left-1 w-2.5 sm:w-3 h-2.5 sm:h-3 border-t-2 border-l-2 border-indigo-300 pointer-events-none" />
          </div>

          {/* Square 2 (Draggable Pink) */}
          <motion.div
            id="draggable-square-2"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              x: sq2Pos.x,
              y: sq2Pos.y,
              touchAction: 'none',
            }}
            animate={
              isSnapped
                ? { x: 0, y: 0, scale: [1, 1.05, 1] }
                : undefined
            }
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`w-24 h-24 sm:w-32 sm:h-32 bg-pink-500 border-2 sm:border-4 border-white shadow-xl flex flex-col items-center justify-center text-white font-extrabold cursor-grab active:cursor-grabbing transition-shadow ${
              isSnapped
                ? 'rounded-l-none rounded-r-2xl border-l-2 border-l-white/40 ring-4 ring-indigo-200 z-10'
                : 'rounded-2xl z-20 hover:scale-105 active:scale-100 ring-4 ring-pink-200/70'
            }`}
          >
            <span className="text-[9px] sm:text-[10px] bg-pink-900/70 px-2 sm:px-2.5 py-0.5 rounded-md mb-1 sm:mb-1.5 shadow-2xs font-bold">
              مُرَبَّعٌ (ب)
            </span>
            <span className="text-[11px] sm:text-sm font-mono text-white font-black">5 سم × 5 سم</span>

            {!isSnapped && (
              <div className="absolute -bottom-5 sm:-bottom-6 bg-slate-900 text-white text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-0.5 rounded-full whitespace-nowrap shadow-xs font-bold">
                اسْحَبْنِي ✋
              </div>
            )}
          </motion.div>
        </div>

        {/* Snapped Dimensions Overlay */}
        {isSnapped && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-2.5 sm:bottom-3 bg-emerald-600 text-white font-black text-[11px] sm:text-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>تَمَّتِ المُجَاوَرَةُ: الطُّولُ = 10 سم | العَرْضُ = 5 سم</span>
          </motion.div>
        )}
      </div>

      {/* Auto-Snap Shortcut Button */}
      {!isSnapped && (
        <div className="flex justify-center mt-2.5">
          <button
            id="btn-auto-snap-sq"
            onClick={() => triggerSnap(false)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 cursor-pointer"
          >
            <span>💡 اضْغَطْ هُنَا لِمُجَاوَرَةِ المُرَبَّعَيْنِ مَعاً تِلْقَائِيّاً</span>
          </button>
        </div>
      )}

      {/* Success / Next Level Section */}
      <AnimatePresence>
        {isAnswerCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
              <h3 className="text-lg sm:text-xl font-black font-['Cairo']">
                أَحْسَنْتَ صَوْتِيّاً يَا بَطَلُ! 🎉
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-100 mb-4 leading-relaxed">
              اسْتَنْتَجْتَ بِنَجَاحٍ أَنَّ الشَّكْلَ النَّاتِجَ هُوَ مُسْتَطِيلٌ (10 سم × 5 سم).
            </p>

            <button
              id="btn-level1-direct-next"
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
              <span>انْتَقِلْ لِلْمَرْحَلَةِ التَّالِيَةِ (المُسْتَوَى 2)</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong Feedback Message */}
      {wrongMessage && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs sm:text-sm font-bold text-amber-950 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 leading-relaxed text-right"
        >
          💡 {wrongMessage}
        </motion.div>
      )}

      {/* Footer controls: Hint & Reset */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <button
          id="btn-level1-hint"
          onClick={() => {
            soundManager.playPop();
            onRequestHint();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-indigo-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>تَلْمِيحٌ مُسَاعِدٌ 💡</span>
        </button>

        {isSnapped && (
          <button
            id="btn-level1-reset"
            onClick={() => {
              soundManager.playPop();
              setIsSnapped(false);
              setSq2Pos({ x: 120, y: 20 });
              setIsAnswerCorrect(false);
              setWrongMessage('');
              setVoiceStatusMessage('');
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إِعَادَةُ التَّجْرِبَةِ</span>
          </button>
        )}
      </div>
    </div>
  );
};
