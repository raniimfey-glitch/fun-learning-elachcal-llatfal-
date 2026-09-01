import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Lightbulb, CheckCircle2, Volume2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Level5Props {
  onComplete: (stars: number) => void;
  onRequestHint: () => void;
  hintLevel: number;
}

export const Level5Recompose: React.FC<Level5Props> = ({
  onComplete,
  onRequestHint,
}) => {
  // Current arrangement mode:
  // '4x2' (width 4, height 2) -> Area = 8 cm², Perimeter = 2*(4+2) = 12 cm
  // '8x1' (width 8, height 1) -> Area = 8 cm², Perimeter = 2*(8+1) = 18 cm
  // '2x4' (width 2, height 4) -> Area = 8 cm², Perimeter = 2*(2+4) = 12 cm
  const [currentLayout, setCurrentLayout] = useState<'4x2' | '8x1' | '2x4'>('4x2');
  const [testedLayouts, setTestedLayouts] = useState<string[]>(['4x2']);
  const [isDiscoveryRevealed, setIsDiscoveryRevealed] = useState(false);

  const introSpeech = 'اسْتَعْمِلِ المُرَبَّعَاتِ الثَّمَانِيَةَ لِتَكْوِينِ مُسْتَطِيلَاتٍ مُخْتَلِفَةٍ، وَاكْتَشِفْ مَاذَا يَحْدُثُ لِلْمِسَاحَةِ وَالمُحِيطِ!';

  useEffect(() => {
    soundManager.speakArabic(introSpeech);
  }, []);

  const handlePlayVoice = () => {
    soundManager.playPop();
    soundManager.speakArabic(introSpeech);
  };

  const handleSwitchLayout = (layout: '4x2' | '8x1' | '2x4') => {
    soundManager.playSnap();
    setCurrentLayout(layout);
    if (!testedLayouts.includes(layout)) {
      const newTested = [...testedLayouts, layout];
      setTestedLayouts(newTested);

      if (newTested.length >= 2 && !isDiscoveryRevealed) {
        setIsDiscoveryRevealed(true);
        soundManager.playSuccess();
        soundManager.speakArabic(
          'اكْتَشَفْتَ شَيْئاً مُهِمّاً: يُمْكِنُ أَنْ تَتَسَاوَى المِسَاحَاتُ رَغْمَ اخْتِلَافِ المُحِيطِ!'
        );
      }
    }
  };

  const layoutInfo = {
    '4x2': {
      width: 4,
      height: 2,
      area: 8,
      perimeter: 12,
      formula: '2 × (4 + 2) = 12 سم',
      title: 'مُسْتَطِيلٌ (4 × 2)',
    },
    '8x1': {
      width: 8,
      height: 1,
      area: 8,
      perimeter: 18,
      formula: '2 × (8 + 1) = 18 سم',
      title: 'شَرِيطٌ مُمْتَدٌّ (8 × 1)',
    },
    '2x4': {
      width: 2,
      height: 4,
      area: 8,
      perimeter: 12,
      formula: '2 × (2 + 4) = 12 سم',
      title: 'مُسْتَطِيلٌ عَمُودِيٌّ (2 × 4)',
    },
  }[currentLayout];

  const handleFinishLevel = () => {
    soundManager.playSuccess();
    onComplete(3);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3.5 sm:p-6 md:p-8 bg-white/95 rounded-2xl sm:rounded-[2.5rem] border border-sky-100 shadow-xl">
      {/* Level Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-950 text-xs font-bold mb-2 shadow-2xs">
          <span>المُسْتَوَى 05: لُغْزُ إِعَادَةِ التَّرْكِيبِ</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-indigo-950 font-['Cairo']">
          8 مُرَبَّعَاتٍ وَمُقَارَنَةُ المِسَاحَةِ وَالمُحِيطِ
        </h2>
        <p className="text-xs sm:text-base font-semibold text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
          رَتِّبْ 8 مُرَبَّعَاتٍ مُتَطَابِقَةٍ (1 سم² لِكُلِّ مُرَبَّعٍ) بِطُرُقٍ مُخْتَلِفَةٍ، وَلَاحِظْ مَاذَا يَحْدُثُ لِلْمِسَاحَةِ وَالمُحِيطِ عِنْدَ تَغْيِيرِ الشَّكْلِ!
        </p>

        <div className="flex justify-center mt-2">
          <button
            onClick={handlePlayVoice}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>اسْتَمِعْ لِلتَّوْجِيهِ 🔊</span>
          </button>
        </div>
      </div>

      {/* Arrangement Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-4 sm:mb-5">
        <button
          id="btn-layout-4x2"
          onClick={() => handleSwitchLayout('4x2')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer ${
            currentLayout === '4x2'
              ? 'bg-indigo-600 border-2 border-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 sm:ring-4 ring-indigo-50'
              : 'bg-white text-slate-700 border-2 border-slate-100 shadow-2xs hover:bg-indigo-50'
          }`}
        >
          مُسْتَطِيلٌ (4 × 2)
        </button>

        <button
          id="btn-layout-8x1"
          onClick={() => handleSwitchLayout('8x1')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer ${
            currentLayout === '8x1'
              ? 'bg-indigo-600 border-2 border-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 sm:ring-4 ring-indigo-50'
              : 'bg-white text-slate-700 border-2 border-slate-100 shadow-2xs hover:bg-indigo-50'
          }`}
        >
          شَرِيطٌ طَوِيلٌ (8 × 1)
        </button>

        <button
          id="btn-layout-2x4"
          onClick={() => handleSwitchLayout('2x4')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer ${
            currentLayout === '2x4'
              ? 'bg-indigo-600 border-2 border-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 sm:ring-4 ring-indigo-50'
              : 'bg-white text-slate-700 border-2 border-slate-100 shadow-2xs hover:bg-indigo-50'
          }`}
        >
          مُسْتَطِيلٌ عَمُودِيٌّ (2 × 4)
        </button>
      </div>

      {/* Interactive Display Stage */}
      <div className="relative w-full min-h-[180px] sm:min-h-[220px] bg-sky-50/50 rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-4 border-dashed border-sky-200 p-4 sm:p-6 flex flex-col items-center justify-center select-none overflow-hidden">
        {/* Render 8 squares dynamically according to layout */}
        <div
          className={`grid gap-1.5 sm:gap-2 p-2 sm:p-3 bg-white rounded-2xl border-2 sm:border-4 border-white shadow-xl transition-all duration-300 ${
            currentLayout === '4x2'
              ? 'grid-cols-4 w-48 sm:w-72'
              : currentLayout === '8x1'
              ? 'grid-cols-8 w-full max-w-md overflow-x-auto'
              : 'grid-cols-2 w-28 sm:w-40'
          }`}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="aspect-square bg-gradient-to-tr from-pink-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-extrabold text-[11px] sm:text-xs shadow-2xs"
            >
              {idx + 1}
            </motion.div>
          ))}
        </div>

        {/* Live Calculation Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md mt-4 sm:mt-6">
          <div className="bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-sky-100 text-center shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block">عَدَدُ المُرَبَّعَاتِ</span>
            <span className="text-sm sm:text-lg font-black text-slate-800 font-mono">8</span>
          </div>

          <div className="bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-sky-100 text-center shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 block">المِسَاحَةُ</span>
            <span className="text-sm sm:text-lg font-black text-emerald-900 font-mono">
              {layoutInfo.area} سم²
            </span>
          </div>

          <div className="bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-sky-100 text-center shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 block">المُحِيطُ</span>
            <span className="text-sm sm:text-lg font-black text-indigo-900 font-mono">
              {layoutInfo.perimeter} سم
            </span>
          </div>
        </div>
      </div>

      {/* Dynamically Tracked Comparison of tested arrangements */}
      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-100 text-right">
        <h4 className="font-black text-xs sm:text-sm text-indigo-950 mb-2 font-['Cairo']">
          سِجِلُّ تَجَارِبِكَ الهَنْدَسِيَّةِ 📝
        </h4>
        <div className="space-y-2 text-xs font-bold text-slate-700">
          {testedLayouts.map((layoutKey) => {
            const info = {
              '4x2': { title: 'مُسْتَطِيلٌ (4 × 2 سم)', area: 8, peri: 12 },
              '8x1': { title: 'شَرِيطٌ (8 × 1 سم)', area: 8, peri: 18 },
              '2x4': { title: 'مُسْتَطِيلٌ (2 × 4 سم)', area: 8, peri: 12 },
            }[layoutKey as '4x2' | '8x1' | '2x4'];
            return (
              <div key={layoutKey} className="flex justify-between items-center py-1.5 border-b border-sky-100">
                <span>• {info.title}:</span>
                <span className="font-mono text-slate-800">
                  المِسَاحَةُ = {info.area} سم² | المُحِيطُ = {info.peri} سم
                </span>
              </div>
            );
          })}
          {testedLayouts.length < 2 && (
            <p className="text-slate-400 text-xs italic">
              جَرِّبْ تَرْتِيباً آخَرَ بِالنَّقْرِ عَلَى الأَزْرَارِ فِي الأَعْلَى لِمُقَارَنَةِ المُحِيطِ!
            </p>
          )}
        </div>
      </div>

      {/* Golden Discovery Card */}
      {isDiscoveryRevealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-5 sm:p-6 rounded-[2rem] bg-amber-50 border-2 border-amber-200 text-right text-slate-800 shadow-md"
        >
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm sm:text-base mb-1.5">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span>💡 اكْتِشَافٌ هَنْدَسِيٌّ عَظِيمٌ:</span>
          </div>
          <p className="text-base sm:text-lg font-black text-amber-950 leading-relaxed font-['Cairo']">
            «يُمْكِنُ أَنْ تَتَسَاوَى المِسَاحَاتُ لِلأَشْكَالِ المُخْتَلِفَةِ رَغْمَ اخْتِلَافِ المُحِيطِ!»
          </p>
          <p className="text-xs text-amber-900/90 font-bold mt-1 leading-relaxed">
            الشَّكْلُ الأَكْثَرُ نَحَافَةً وَامْتِدَاداً (8 × 1) يَمْتَلِكُ مُحِيطاً أَكْبَرَ بِكَثِيرٍ (18 سم) مِنَ الشَّكْلِ المُتَمَاسِكِ (12 سم)، رَغْمَ أَنَّ كِلَيْهِمَا يُغَطِّي 8 سم² تَمَاماً!
          </p>

          <button
            id="btn-complete-level5"
            onClick={handleFinishLevel}
            className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-100 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>رَائِعٌ! لَقَدْ أَتْقَنْتَ هَذَا الِاكْتِشَافَ!</span>
          </button>
        </motion.div>
      )}

      {/* Hint trigger */}
      <div className="flex items-center justify-start mt-6 pt-4 border-t border-slate-100">
        <button
          id="btn-level5-hint"
          onClick={onRequestHint}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-indigo-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>تَلْمِيحٌ مُسَاعِدٌ</span>
        </button>
      </div>
    </div>
  );
};

