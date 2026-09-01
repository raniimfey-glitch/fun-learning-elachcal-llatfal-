import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Sparkles, X, ChevronDown, Volume2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HintModalProps {
  isOpen: boolean;
  hints: string[];
  currentHintLevel: number; // 0, 1, 2...
  onRevealNextHint: () => void;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  hints,
  currentHintLevel,
  onRevealNextHint,
  onClose,
}) => {
  // Ensure at least 1 hint is revealed whenever modal opens
  const effectiveHintLevel = Math.max(currentHintLevel, 1);

  // Auto-speak the latest revealed hint when opened
  useEffect(() => {
    if (isOpen && hints.length > 0) {
      const activeIdx = Math.min(effectiveHintLevel - 1, hints.length - 1);
      const textToSpeak = hints[activeIdx] || hints[0];
      if (textToSpeak) {
        soundManager.speakArabic(textToSpeak);
      }
    }
  }, [isOpen, effectiveHintLevel]);

  if (!isOpen) return null;

  const handleSpeakHint = (hintText: string) => {
    soundManager.playPop();
    soundManager.speakArabic(hintText);
  };

  const handleRevealNext = () => {
    soundManager.playSuccess();
    onRevealNextHint();
    const nextIdx = Math.min(effectiveHintLevel, hints.length - 1);
    if (hints[nextIdx]) {
      setTimeout(() => {
        soundManager.speakArabic(hints[nextIdx]);
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[2.5rem] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-sky-100 relative text-right"
        >
          {/* Close button */}
          <button
            id="btn-close-hint-modal"
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-indigo-950 font-['Cairo']">
                تَلْمِيحَاتٌ مُسَاعِدَةٌ 💡
              </h3>
              <p className="text-xs font-bold text-slate-500">
                فَكِّرْ خُطْوَةً بِخُطْوَةٍ لِلْوُصُولِ إِلَى الإِجَابَةِ الصَّحِيحَةِ
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {hints.map((hint, idx) => {
              const isRevealed = idx < effectiveHintLevel;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isRevealed
                      ? 'bg-amber-50/80 border-amber-200 text-slate-800 shadow-2xs'
                      : 'bg-sky-50/40 border-dashed border-sky-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-900">
                        تَلْمِيحٌ {idx + 1} {idx === 0 ? '(أَسَاسِيٌّ)' : '(مُفَصَّلٌ)'}
                      </span>
                      {isRevealed && (
                        <button
                          type="button"
                          onClick={() => handleSpeakHint(hint)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/60 hover:bg-amber-200 text-amber-950 text-[11px] font-bold transition-all cursor-pointer"
                          title="استمع للتلميح"
                        >
                          <Volume2 className="w-3 h-3 text-amber-800" />
                          <span>اسْتَمِعْ 🔊</span>
                        </button>
                      )}
                    </div>

                    {isRevealed ? (
                      <span className="text-emerald-700 text-xs font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        مَفْتُوحٌ ✨
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-bold">مُغْلَقٌ 🔒</span>
                    )}
                  </div>
                  <p className="text-sm font-bold leading-relaxed">
                    {isRevealed ? hint : 'اضْغَطْ عَلَى زِرِّ كَشْفِ التَّلْمِيحِ أَدْنَاهُ لِمُسَاعَدَتِكَ.'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2.5">
            {effectiveHintLevel < hints.length && (
              <button
                id="btn-reveal-more-hint"
                onClick={handleRevealNext}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>إِظْهَارُ التَّلْمِيحِ الأَكْثَرِ تَفْصِيلاً</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-dismiss-hint"
              onClick={() => {
                soundManager.playPop();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
            >
              فَهِمْتُ، سَأُحَاوِلُ الآنَ! 👍
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
