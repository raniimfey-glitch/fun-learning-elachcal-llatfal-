import React from 'react';
import { motion } from 'motion/react';
import { Lock, Star, ArrowLeft, Award, Sparkles } from 'lucide-react';
import { LEVELS_DATA } from '../data/levels';
import { ProgressState, LevelId } from '../types';
import { soundManager } from '../utils/sound';

interface LevelMapScreenProps {
  progress: ProgressState;
  onSelectLevel: (levelId: LevelId) => void;
  onBackToHome: () => void;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({
  progress,
  onSelectLevel,
  onBackToHome,
}) => {
  const totalStars = (Object.values(progress.levelStars) as number[]).reduce((a, b) => a + b, 0);
  const maxPossibleStars = 6 * 3; // 18 stars
  const progressPercent = Math.min(100, Math.round((totalStars / maxPossibleStars) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto p-2.5 sm:p-5 md:p-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-sky-100 shadow-xl">
        <div>
          <button
            id="btn-map-back-home"
            type="button"
            onClick={() => {
              try {
                soundManager.playPop();
              } catch {}
              onBackToHome();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 mb-2 transition-colors cursor-pointer touch-manipulation select-none"
          >
            <ArrowLeft className="w-4 h-4 rotate-180 pointer-events-none" />
            <span className="pointer-events-none">العودة للرئيسية</span>
          </button>
          <h2 className="text-xl sm:text-3xl font-black text-indigo-950 font-['Cairo']">
            🗺️ خارطة مغامرات الأشكال
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            أكمل كل مستوى لفتح المستوى التالي واكتشاف أسرار الهندسة والمساحة
          </p>
        </div>

        {/* Progress Bar & Stars */}
        <div className="w-full sm:w-64 bg-sky-50/70 p-3.5 sm:p-4 rounded-2xl border border-sky-100 text-right select-none">
          <div className="flex items-center justify-between text-xs font-extrabold text-indigo-950 mb-1.5">
            <span>نسبة إنجاز المراحل</span>
            <span className="font-mono font-black text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-l from-indigo-500 to-emerald-500 rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-2">
            <span className="flex items-center gap-1 text-amber-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{totalStars} من 18 نجمة</span>
            </span>
            <span>{progress.unlockedLevels.length} من 6 مراحل</span>
          </div>
        </div>
      </div>

      {/* 6 Level Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {LEVELS_DATA.map((level) => {
          const isUnlocked = progress.unlockedLevels.includes(level.id);
          const stars = progress.levelStars[level.id] || 0;
          const isCompleted = stars > 0;

          return (
            <button
              key={level.id}
              type="button"
              id={`btn-level-card-${level.id}`}
              onClick={() => {
                if (isUnlocked) {
                  try {
                    soundManager.playPop();
                  } catch {}
                  onSelectLevel(level.id);
                } else {
                  try {
                    soundManager.playGentleEncourage();
                    soundManager.speakArabic('هذه المرحلة مقفلة حالياً. أكمل المرحلة السابقة لفتحها!');
                  } catch {}
                }
              }}
              className={`text-right w-full relative rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border transition-all duration-200 overflow-hidden touch-manipulation select-none active:scale-[0.99] ${
                isUnlocked
                  ? 'bg-white shadow-md hover:shadow-xl border-sky-100 cursor-pointer'
                  : 'bg-slate-50/70 border-slate-200/80 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Level Number Pill & Status */}
              <div className="flex items-center justify-between mb-3 pointer-events-none">
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide bg-indigo-50 text-indigo-900 border border-indigo-100">
                  المستوى 0{level.number}
                </span>

                {isUnlocked ? (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          starIdx <= stars
                            ? 'text-amber-400 fill-amber-400 drop-shadow-2xs'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                    <Lock className="w-3 h-3" />
                    <span>مغلق</span>
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="mb-2 pointer-events-none">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 font-['Cairo'] flex items-center gap-2">
                  <span>{level.title}</span>
                  {isCompleted && (
                    <span className="text-emerald-600 text-sm font-bold">✔</span>
                  )}
                </h3>
                <div className="text-xs font-bold text-indigo-600 mt-0.5">
                  {level.subtitle}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 sm:mb-5 pointer-events-none">
                {level.description}
              </p>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 pointer-events-none">
                {isUnlocked ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {isCompleted ? 'العب مرة أخرى' : 'جاهز للبدء! اضغط للدخول'}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    أكمل المستوى {level.number - 1} لفتح هذا المستوى
                  </span>
                )}

                {isUnlocked && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-2xs border border-sky-100">
                    ←
                  </div>
                )}
              </div>

              {/* Level 6 Special Badge */}
              {level.id === 6 && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-xs pointer-events-none">
                  <Award className="w-3 h-3" />
                  <span>8 ألغاز</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
