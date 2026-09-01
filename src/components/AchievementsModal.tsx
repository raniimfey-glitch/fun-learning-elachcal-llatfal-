import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Star, CheckCircle, Award } from 'lucide-react';
import { ProgressState } from '../types';
import { ACHIEVEMENTS_LIST } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface AchievementsModalProps {
  isOpen: boolean;
  progress: ProgressState;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  progress,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalStars = (Object.values(progress.levelStars) as number[]).reduce((a, b) => a + b, 0);
  const completedLevelsCount = Object.keys(progress.levelStars).length;
  const geniusCompletedCount = progress.geniusPuzzlesCompleted?.length || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[2.5rem] p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-sky-100 relative text-right max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-indigo-950 font-['Cairo']">
                  لوحة إنجازاتي 🏆
                </h3>
                <span className="text-xs text-slate-400 font-bold">
                  سجل رحلتك الرائعة في مغامرات الأشكال
                </span>
              </div>
            </div>

            <button
              id="btn-close-achievements"
              onClick={() => {
                soundManager.playPop();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <div className="flex items-center justify-center text-amber-500 mb-1">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-950 font-mono">{totalStars}</div>
              <div className="text-[11px] font-bold text-amber-800">مجموع النجوم</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="flex items-center justify-center text-emerald-500 mb-1">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-950 font-mono">{completedLevelsCount}/6</div>
              <div className="text-[11px] font-bold text-emerald-800">مراحل مكتملة</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <div className="flex items-center justify-center text-indigo-500 mb-1">
                <Award className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-indigo-950 font-mono">{geniusCompletedCount}/8</div>
              <div className="text-[11px] font-bold text-indigo-800">تحديات العباقرة</div>
            </div>
          </div>

          {/* Achievements Badges List */}
          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {ACHIEVEMENTS_LIST.map((ach) => {
              const isUnlocked = progress.achievements.includes(ach.id) || ach.condition(progress);
              return (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
                    isUnlocked
                      ? 'bg-amber-50/70 border-amber-200 text-slate-800'
                      : 'bg-slate-50 border-slate-200/80 opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-200/80 shadow-xs ring-2 ring-amber-300'
                        : 'bg-slate-200 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-indigo-950 font-['Cairo']">
                        {ach.title}
                      </h4>
                      {isUnlocked && (
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          مكتمل ✔
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-0.5 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer button */}
          <button
            id="btn-close-achievements-bottom"
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="w-full mt-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-indigo-100"
          >
            إغلاق
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
