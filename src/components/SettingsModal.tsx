import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Volume2, VolumeX, Mic, MicOff, RotateCcw, X } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onToggleSound: () => void;
  onToggleVoice: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  soundEnabled,
  voiceEnabled,
  onToggleSound,
  onToggleVoice,
  onResetProgress,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[2.5rem] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-sky-100 relative text-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-indigo-700">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-indigo-950 font-['Cairo']">
                  إعدادات التطبيق ⚙️
                </h3>
                <span className="text-xs text-slate-400 font-bold">
                  تحكم بالصوت والإرشادات الصوتية
                </span>
              </div>
            </div>

            <button
              id="btn-close-settings"
              onClick={() => {
                soundManager.playPop();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 mb-6">
            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${soundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-black text-sm text-indigo-950">المؤثرات الصوتية</div>
                  <div className="text-xs text-slate-500 font-semibold">أصوات النقر والنجاح والتركيب</div>
                </div>
              </div>

              <button
                id="btn-toggle-sound-settings"
                onClick={onToggleSound}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    soundEnabled ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Arabic Voice Narration Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${voiceEnabled ? 'bg-sky-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                  {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-black text-sm text-indigo-950">الراوي الصوتي العربي</div>
                  <div className="text-xs text-slate-500 font-semibold">قراءة التوجيهات بالصوت للأطفال</div>
                </div>
              </div>

              <button
                id="btn-toggle-voice-settings"
                onClick={onToggleVoice}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  voiceEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    voiceEnabled ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Pedagogical info */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs leading-relaxed text-amber-950 font-bold">
              ✨ <span className="font-black">منهجية التطبيق:</span> «اكتشف، جرّب، فكّر، ثم احسب!» يعتمد على التعلم الاستكشافي الممتع الموجه لتلاميذ المرحلة الابتدائية.
            </div>

            {/* Reset Progress Button */}
            <button
              id="btn-reset-progress"
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط وحذف تقدمك والبدء من جديد؟')) {
                  soundManager.playPop();
                  onResetProgress();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs border border-rose-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط التقدم بالكامل</span>
            </button>
          </div>

          <button
            id="btn-close-settings-bottom"
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-indigo-100"
          >
            حفظ وإغلاق
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
