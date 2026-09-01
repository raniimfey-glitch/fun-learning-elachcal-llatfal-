import React from 'react';
import { Volume2, VolumeX, ArrowRight, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface NavbarProps {
  currentLevelNumber?: number;
  levelTitle?: string;
  totalStars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onBackToMap?: () => void;
  onOpenHint?: () => void;
  hasHint?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLevelNumber,
  levelTitle,
  totalStars,
  soundEnabled,
  onToggleSound,
  onOpenAchievements,
  onOpenSettings,
  onBackToMap,
  onOpenHint,
  hasHint = false,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs px-2.5 sm:px-6 py-2 sm:py-2.5">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Right side (in RTL): Navigation or Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onBackToMap ? (
            <button
              id="btn-back-to-map"
              type="button"
              onClick={() => {
                try {
                  soundManager.playPop();
                } catch {}
                onBackToMap();
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer border border-sky-100 shadow-2xs touch-manipulation select-none"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" />
              <span className="pointer-events-none">المراحل</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-base sm:text-lg shadow-md shrink-0">
                🧩
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-lg text-indigo-950 leading-tight">
                  مغامرات الأشكال
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold text-sky-500 block uppercase tracking-widest -mt-0.5">
                  Fun Learning
                </span>
              </div>
            </div>
          )}

          {currentLevelNumber && (
            <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>المرحلة 0{currentLevelNumber}: {levelTitle}</span>
            </div>
          )}
        </div>

        {/* Left side (in RTL): Stats, Hint, Sound, Achievements, Settings */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Hint button if in active puzzle */}
          {hasHint && onOpenHint && (
            <button
              id="btn-open-hint"
              type="button"
              onClick={() => {
                try {
                  soundManager.playPop();
                } catch {}
                onOpenHint();
              }}
              className="px-2.5 sm:px-3.5 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/80 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer touch-manipulation select-none"
              title="تلميح"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 pointer-events-none" />
              <span className="hidden xs:inline pointer-events-none">💡 تلميح</span>
              <span className="xs:hidden pointer-events-none">💡</span>
            </button>
          )}

          {/* Stars Counter */}
          <div
            id="stars-badge"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 font-extrabold text-xs sm:text-sm shadow-2xs select-none"
          >
            <span className="text-amber-500 text-xs sm:text-sm pointer-events-none">⭐</span>
            <span className="font-mono text-xs sm:text-sm font-black pointer-events-none">{totalStars}</span>
          </div>

          {/* Achievements button */}
          <button
            id="btn-nav-achievements"
            type="button"
            onClick={() => {
              try {
                soundManager.playPop();
              } catch {}
              onOpenAchievements();
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-sky-50 text-sky-700 rounded-2xl hover:bg-sky-100 transition-colors active:scale-95 cursor-pointer border border-sky-100 shadow-2xs touch-manipulation select-none"
            title="إنجازاتي"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 pointer-events-none" />
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={() => {
              try {
                onToggleSound();
              } catch {}
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl transition-colors active:scale-95 cursor-pointer border border-sky-100 shadow-2xs touch-manipulation select-none ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" />}
          </button>

          {/* Settings Button */}
          <button
            id="btn-nav-settings"
            type="button"
            onClick={() => {
              try {
                soundManager.playPop();
              } catch {}
              onOpenSettings();
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-sky-50 text-slate-600 rounded-2xl hover:bg-sky-100 transition-colors active:scale-95 cursor-pointer border border-sky-100 shadow-2xs touch-manipulation select-none"
            title="الإعدادات"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 pointer-events-none" />
          </button>
        </div>
      </div>
    </header>
  );
};
