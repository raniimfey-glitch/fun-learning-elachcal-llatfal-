import React from 'react';
import { motion } from 'motion/react';
import { Play, Map, Trophy, Settings, Sparkles, Star } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HomeScreenProps {
  totalStars: number;
  unlockedLevelsCount: number;
  onStartAdventure: () => void;
  onOpenMap: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  totalStars,
  unlockedLevelsCount,
  onStartAdventure,
  onOpenMap,
  onOpenAchievements,
  onOpenSettings,
}) => {
  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Floating Animated Geometric Shapes in Background */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-8 right-4 sm:right-24 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-indigo-200/30 border-2 border-indigo-300/40 -z-10"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-12 right-6 sm:right-32 w-16 h-10 sm:w-28 sm:h-16 rounded-xl bg-sky-200/30 border-2 border-sky-300/40 -z-10"
      />
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-1/4 left-6 sm:left-24 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-200/30 border-2 border-emerald-300/40 -z-10"
      />
      <motion.div
        animate={{ y: [0, 22, 0], rotate: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-16 left-6 sm:left-28 w-12 h-12 sm:w-16 sm:h-16 bg-pink-200/30 border-2 border-pink-300/40 rotate-45 -z-10"
      />

      <div className="w-full max-w-lg md:max-w-xl mx-auto text-center z-10 flex flex-col items-center bg-white/90 backdrop-blur-md p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-sky-100">
        {/* Playful Brand Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 font-extrabold text-xs sm:text-sm mb-4 sm:mb-5 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>مَنَصَّةُ التَّعَلُّمِ التَّفَاعُلِيِّ • FUN LEARNING</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        </motion.div>

        {/* Mascot & Animated Shape Hero */}
        <motion.div
          initial={{ scale: 0.5, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative mb-4 sm:mb-5 cursor-pointer"
          onClick={() => {
            soundManager.playPop();
            soundManager.speakArabic('مَرْحَباً بِكَ فِي مُغَامَرَاتِ الأَشْكَالِ! اكْتَشِفْ، جَرِّبْ، وَفَكِّرْ!');
          }}
          title="اضغط لسماع الترحيب"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-sky-500 shadow-xl border-4 border-white flex items-center justify-center relative overflow-hidden">
            {/* Cute Geometric Face */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex gap-3 sm:gap-4 mb-1.5 sm:mb-2">
                <motion.div
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-full"
                />
                <motion.div
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-full"
                />
              </div>
              <div className="w-5 sm:w-6 h-2.5 sm:h-3 border-b-4 border-white rounded-full"></div>
            </div>

            {/* Rosy cheeks */}
            <div className="absolute left-2.5 sm:left-3 top-12 sm:top-14 w-3 sm:w-3.5 h-1.5 sm:h-2 bg-pink-400/80 rounded-full"></div>
            <div className="absolute right-2.5 sm:right-3 top-12 sm:top-14 w-3 sm:w-3.5 h-1.5 sm:h-2 bg-pink-400/80 rounded-full"></div>
          </div>

          {/* Floating mini badge */}
          <div className="absolute -bottom-2 -right-2 bg-white px-2.5 py-1 rounded-xl shadow-md border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="font-mono font-black">{totalStars}</span>
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-indigo-950 tracking-tight font-['Cairo'] mb-1">
          مُغَامَرَاتُ الأَشْكَالِ
        </h1>
        <div className="text-xs sm:text-base font-bold text-sky-500 mb-3 sm:mb-4 uppercase tracking-widest">
          Fun Learning
        </div>

        {/* Subtitle / Pedagogical Motto */}
        <p className="text-xs sm:text-base font-bold text-slate-600 w-full max-w-md mx-auto mb-5 sm:mb-7 leading-relaxed px-4 sm:px-5 py-2 sm:py-2.5 bg-sky-50/70 rounded-full border border-sky-100 shadow-2xs">
          «اكْتَشِفْ، جَرِّبْ، فَكِّرْ، ثُمَّ احْسُبْ!»
        </p>

        {/* Main Action Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-2.5 sm:gap-3">
          {/* Start Adventure Button */}
          <button
            id="btn-start-adventure"
            type="button"
            onClick={() => {
              try {
                soundManager.playPop();
              } catch {}
              onStartAdventure();
            }}
            className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-100 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer touch-manipulation select-none"
          >
            <Play className="w-5 h-5 fill-white shrink-0 pointer-events-none" />
            <span className="pointer-events-none">ابْدَأِ المُغَامَرَةَ</span>
          </button>

          {/* Level Map Button */}
          <button
            id="btn-home-map"
            type="button"
            onClick={() => {
              try {
                soundManager.playPop();
              } catch {}
              onOpenMap();
            }}
            className="w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-100 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer touch-manipulation select-none"
          >
            <Map className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-200 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">🗺️ خَارِطَةُ المَرَاحِلِ ({unlockedLevelsCount}/6)</span>
          </button>

          {/* Secondary Buttons Row */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-0.5">
            <button
              id="btn-home-achievements"
              type="button"
              onClick={() => {
                try {
                  soundManager.playPop();
                } catch {}
                onOpenAchievements();
              }}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-slate-700 font-extrabold text-xs sm:text-sm shadow-2xs border border-sky-100 flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer touch-manipulation select-none"
            >
              <Trophy className="w-4 h-4 text-amber-500 shrink-0 pointer-events-none" />
              <span className="pointer-events-none">🏆 إِنْجَازَاتِي</span>
            </button>

            <button
              id="btn-home-settings"
              type="button"
              onClick={() => {
                try {
                  soundManager.playPop();
                } catch {}
                onOpenSettings();
              }}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-slate-700 font-extrabold text-xs sm:text-sm shadow-2xs border border-sky-100 flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer touch-manipulation select-none"
            >
              <Settings className="w-4 h-4 text-slate-500 shrink-0 pointer-events-none" />
              <span className="pointer-events-none">⚙️ الإِعْدَادَاتُ</span>
            </button>
          </div>
        </div>

        {/* Grade / Curriculum Notice */}
        <div className="mt-5 sm:mt-7 text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-50 px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-200/80">
          مِنْهَاجُ الرِّيَاضِيَّاتِ التَّفَاعُلِيُّ لِتَلَامِيذِ الِابْتِدَائِيِّ (السَّنَةُ الرَّابِعَةُ)
        </div>
      </div>
    </div>
  );
};
