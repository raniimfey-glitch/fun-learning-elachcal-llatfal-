import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface CelebrationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  formulaHighlight?: {
    label: string;
    formula: string;
    details?: string;
  };
  starsEarned: number;
  onNextLevel?: () => void;
  onReplay?: () => void;
  onBackToMap: () => void;
  hasNextLevel?: boolean;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  title,
  message,
  formulaHighlight,
  starsEarned,
  onNextLevel,
  onReplay,
  onBackToMap,
  hasNextLevel = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playSuccess();
      soundManager.speakArabic(title + '، ' + message);

      // Trigger colorful kid-friendly confetti bursts
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen, title, message]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-sky-100 relative overflow-hidden"
        >
          {/* Background decorative shine */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-100/50 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none"></div>

          {/* Celebration Icon Header */}
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-4xl shadow-lg border-2 border-white">
              🎉
            </div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-950 p-1.5 rounded-full shadow-md text-xs font-bold"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 mb-1.5 font-['Cairo']">
            {title}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base mb-4 leading-relaxed font-bold">
            {message}
          </p>

          {/* Stars display */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {[1, 2, 3].map((starIndex) => (
              <motion.div
                key={starIndex}
                initial={{ scale: 0 }}
                animate={{ scale: starIndex <= starsEarned ? 1 : 0.8 }}
                transition={{ delay: 0.15 * starIndex, type: 'spring' }}
                className={`text-3xl sm:text-4xl ${
                  starIndex <= starsEarned ? 'text-amber-400 drop-shadow-md' : 'text-slate-200 opacity-40'
                }`}
              >
                ★
              </motion.div>
            ))}
          </div>

          {/* Formula discovery card (if applicable) */}
          {formulaHighlight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-right text-slate-800"
            >
              <div className="flex items-center gap-1.5 text-amber-800 font-black text-xs mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>قانون اكتشفته بنفسك!</span>
              </div>
              <div className="font-black text-amber-950 text-base sm:text-lg font-['Cairo']">
                {formulaHighlight.label}:
              </div>
              <div className="text-indigo-600 font-black text-lg sm:text-xl font-mono mt-0.5" dir="ltr">
                {formulaHighlight.formula}
              </div>
              {formulaHighlight.details && (
                <div className="text-slate-600 text-xs mt-1 font-bold">
                  {formulaHighlight.details}
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-2">
            {hasNextLevel && onNextLevel && (
              <button
                id="btn-celebration-next"
                onClick={() => {
                  soundManager.playPop();
                  onNextLevel();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
              >
                <span>المستوى التالي</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {onReplay && (
              <button
                id="btn-celebration-replay"
                onClick={() => {
                  soundManager.playPop();
                  onReplay();
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="إعادة التجربة"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة</span>
              </button>
            )}

            <button
              id="btn-celebration-map"
              onClick={() => {
                soundManager.playPop();
                onBackToMap();
              }}
              className="px-4 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-indigo-900 border border-sky-100 font-bold text-sm transition-all active:scale-95 cursor-pointer"
            >
              خريطة المراحل
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
