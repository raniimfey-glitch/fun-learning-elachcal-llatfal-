import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { LevelMapScreen } from './components/LevelMapScreen';
import { Level1AdjacentSquares } from './components/levels/Level1AdjacentSquares';
import { Level2Dimensions } from './components/levels/Level2Dimensions';
import { Level3Perimeter } from './components/levels/Level3Perimeter';
import { Level4Area } from './components/levels/Level4Area';
import { Level5Recompose } from './components/levels/Level5Recompose';
import { Level6GeniusChallenges } from './components/levels/Level6GeniusChallenges';
import { CelebrationModal } from './components/CelebrationModal';
import { HintModal } from './components/HintModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { LEVELS_DATA } from './data/levels';
import { GENIUS_PUZZLES } from './data/geniusPuzzles';
import { LevelId, ProgressState } from './types';
import { loadProgress, saveProgress, checkNewAchievements, INITIAL_PROGRESS } from './utils/storage';
import { soundManager } from './utils/sound';

export default function App() {
  // Navigation screen: 'home' | 'map' | 'level'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'map' | 'level'>('home');
  const [activeLevelId, setActiveLevelId] = useState<LevelId | null>(null);

  // Progress state loaded from localStorage
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  // Modals state
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [celebrationData, setCelebrationData] = useState<{
    title: string;
    message: string;
    formulaHighlight?: {
      label: string;
      formula: string;
      details?: string;
    };
    starsEarned: number;
  }>({
    title: 'أحسنت!',
    message: '',
    starsEarned: 3,
  });

  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(1);
  const [level6PuzzleIndex, setLevel6PuzzleIndex] = useState<number>(0);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync sound settings with soundManager
  useEffect(() => {
    soundManager.setSoundEnabled(progress.soundEnabled);
    soundManager.setVoiceEnabled(progress.voiceEnabled);
  }, [progress.soundEnabled, progress.voiceEnabled]);

  const totalStars = (Object.values(progress.levelStars) as number[]).reduce((a, b) => a + b, 0);

  // Helper to handle level start
  const handleStartLevel = (levelId: LevelId) => {
    setActiveLevelId(levelId);
    setCurrentScreen('level');
    setCurrentHintLevel(1);
  };

  const handleOpenHintModal = () => {
    setCurrentHintLevel((prev) => Math.max(prev, 1));
    setIsHintModalOpen(true);
  };

  // Helper to handle level completion
  const handleLevelCompleted = (
    levelId: LevelId,
    starsEarned: number,
    title: string,
    message: string,
    formulaHighlight?: { label: string; formula: string; details?: string }
  ) => {
    // Unlock next level if available
    const nextLevelId = (levelId < 6 ? ((levelId + 1) as LevelId) : null) as number | null;
    const currentUnlocked = new Set(progress.unlockedLevels);
    if (nextLevelId && !currentUnlocked.has(nextLevelId)) {
      currentUnlocked.add(nextLevelId);
    }

    const previousStars = progress.levelStars[levelId] || 0;
    const bestStars = Math.max(previousStars, starsEarned);

    const updated: ProgressState = {
      ...progress,
      unlockedLevels: Array.from(currentUnlocked),
      levelStars: {
        ...progress.levelStars,
        [levelId]: bestStars,
      },
    };

    const { updatedProgress } = checkNewAchievements(updated);
    setProgress(updatedProgress);
    saveProgress(updatedProgress);

    setCelebrationData({
      title,
      message,
      formulaHighlight,
      starsEarned,
    });
    setIsCelebrationOpen(true);
  };

  const handleNextLevelFromCelebration = () => {
    setIsCelebrationOpen(false);
    if (activeLevelId && activeLevelId < 6) {
      const next = (activeLevelId + 1) as LevelId;
      handleStartLevel(next);
    } else {
      setCurrentScreen('map');
      setActiveLevelId(null);
    }
  };

  // Sound toggles
  const handleToggleSound = () => {
    const nextVal = !progress.soundEnabled;
    const updated = { ...progress, soundEnabled: nextVal };
    setProgress(updated);
    saveProgress(updated);
    soundManager.setSoundEnabled(nextVal);
    if (nextVal) soundManager.playPop();
  };

  const handleToggleVoice = () => {
    const nextVal = !progress.voiceEnabled;
    const updated = { ...progress, voiceEnabled: nextVal };
    setProgress(updated);
    saveProgress(updated);
    soundManager.setVoiceEnabled(nextVal);
    if (nextVal) soundManager.speakArabic('تم تفعيل الراوي الصوتي');
  };

  const handleResetProgress = () => {
    setProgress(INITIAL_PROGRESS);
    saveProgress(INITIAL_PROGRESS);
    setCurrentScreen('home');
    setActiveLevelId(null);
  };

  // Get active hints based on current level
  const getActiveLevelHints = (): string[] => {
    if (!activeLevelId) return [];
    switch (activeLevelId) {
      case 1:
        return [
          'اسْحَبِ المُرَبَّعَ البُرْتُقَالِيَّ وَضَعْهُ مُلَاصِقاً لِلْمُرَبَّعِ الأَزْرَقِ جَنْباً إِلَى جَنْبٍ دُونَ تَرْكِ أَيِّ فَرَاغٍ.',
          'عِنْدَمَا يَتَلَاصَقُ المُرَبَّعَانِ يَتَكَوَّنُ شَكْلٌ هَنْدَسِيٌّ لَهُ أَرْبَعَةُ أَضْلَاعٍ وَكُلُّ ضِلْعَيْنِ مُتَقَابِلَيْنِ مُتَسَاوِيَانِ.',
        ];
      case 2:
        return [
          'طُولُ ضِلْعِ المُرَبَّعِ الأَوَّلِ 5 سَنْتِيمِتْرَاتٍ، وَطُولُ ضِلْعِ المُرَبَّعِ الثَّانِي 5 سَنْتِيمِتْرَاتٍ.',
          'اجْمَعْ طُولَ الضِّلْعَيْنِ المُتَجَاوِرَيْنِ لِمَعْرِفَةِ الطُّولِ الإِجْمَالِيِّ لِلشَّكْلِ النَّاتِجِ.',
        ];
      case 3:
        return [
          'المُحِيطُ هُوَ مَجْمُوعُ أَطْوَالِ الأَضْلَاعِ الأَرْبَعَةِ الَّتِي تُحِيطُ بِالمُسْتَطِيلِ مِنَ الخَارِجِ.',
          'قُمْ بِجَمْعِ أَطْوَالِ الأَضْلَاعِ الأَرْبَعَةِ كُلِّهَا لِمَعْرِفَةِ المُحِيطِ الإِجْمَالِيِّ.',
        ];
      case 4:
        return [
          'لَدَيْنَا شَبَكَةٌ مِنَ الأَعْمِدَةِ وَالصُّفُوفِ تَضُمُّ مُرَبَّعَاتٍ صَغِيرَةً.',
          'لِحِسَابِ المِسَاحَةِ الإِجْمَالِيَّةِ، اضْرِبْ عَدَدَ الأَعْمِدَةِ فِي عَدَدِ الصُّفُوفِ.',
        ];
      case 5:
        return [
          'جَرِّبِ التَّرْتِيبَاتِ المُخْتَلِفَةَ لِلْمُرَبَّعَاتِ وَلَاحِظْ كَيْفَ يَتَأَثَّرُ طُولُ الإِطَارِ الخَارِجِيِّ.',
          'الشَّكْلُ الأَكْثَرُ امْتِدَاداً وَنَحَافَةً يَحْتَاجُ دَائِماً إِلَى إِطَارٍ خَارِجِيٍّ أَطْوَلَ لِلإِحَاطَةِ بِهِ.',
        ];
      case 6:
        return GENIUS_PUZZLES[level6PuzzleIndex]?.hints || [
          'اقْرَأِ المَسْأَلَةَ بِهُدُوءٍ وَتَأَمَّلِ الأَبْعَادَ وَالشَّكْلَ الهَنْدَسِيَّ.',
          'اسْتَخْدِمِ المَفَاهِيمَ الهَنْدَسِيَّةَ الَّتِي تَعَلَّمْتَهَا لِحِسَابِ المَطْلُوبِ بِنَفْسِكَ.',
        ];
      default:
        return [];
    }
  };

  const activeLevelData = LEVELS_DATA.find((l) => l.id === activeLevelId);

  return (
    <div className="w-full min-h-screen bg-sky-50 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:28px_28px] text-slate-800 flex flex-col font-['Tajawal',sans-serif] relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Decorative Geometric Shapes */}
      <div className="fixed top-20 left-10 pointer-events-none opacity-20 hidden md:block -z-10">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="text-indigo-500">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
          <rect x="30" y="30" width="40" height="40" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div className="fixed bottom-12 right-12 pointer-events-none opacity-15 hidden md:block -z-10">
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none" className="text-sky-500">
          <polygon points="50,15 90,85 10,85" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
        </svg>
      </div>

      {/* Top Navigation */}
      <Navbar
        currentLevelNumber={activeLevelId || undefined}
        levelTitle={activeLevelData?.title}
        totalStars={totalStars}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onBackToMap={currentScreen === 'level' ? () => setCurrentScreen('map') : undefined}
        onOpenHint={currentScreen === 'level' ? handleOpenHintModal : undefined}
        hasHint={currentScreen === 'level'}
      />

      {/* Main View Router - Fluid and Fully Responsive */}
      <main className="flex-1 w-full max-w-4xl lg:max-w-5xl mx-auto px-2.5 sm:px-5 md:px-6 py-3 sm:py-5 flex flex-col items-center justify-start">
        {currentScreen === 'home' && (
          <HomeScreen
            totalStars={totalStars}
            unlockedLevelsCount={progress.unlockedLevels.length}
            onStartAdventure={() => {
              // Open highest unlocked level or level 1
              const maxUnlocked = Math.max(...progress.unlockedLevels, 1) as LevelId;
              handleStartLevel(maxUnlocked);
            }}
            onOpenMap={() => setCurrentScreen('map')}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentScreen === 'map' && (
          <LevelMapScreen
            progress={progress}
            onSelectLevel={(lvlId) => handleStartLevel(lvlId)}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'level' && activeLevelId === 1 && (
          <Level1AdjacentSquares
            onComplete={(stars) =>
              handleLevelCompleted(
                1,
                stars,
                'أَحْسَنْتَ يَا بَطَلُ! 🎉',
                'لَقَدْ كَوَّنْتَ مُسْتَطِيلاً جَمِيلاً بِوَضْعِ المُرَبَّعَيْنِ جَنْباً إِلَى جَنْبٍ!',
                {
                  label: 'اكْتِشَافُ المُسْتَوَى 1',
                  formula: 'مُرَبَّعٌ + مُرَبَّعٌ = مُسْتَطِيلٌ',
                  details: 'شَكْلٌ هَنْدَسِيٌّ رُبَاعِيٌّ فِيهِ كُلُّ ضِلْعَيْنِ مُتَقَابِلَيْنِ مُتَطَابِقَانِ.',
                }
              )
            }
            onNextLevel={() => handleStartLevel(2)}
            onRequestHint={handleOpenHintModal}
            hintLevel={currentHintLevel}
          />
        )}

        {currentScreen === 'level' && activeLevelId === 2 && (
          <Level2Dimensions
            onComplete={(stars) =>
              handleLevelCompleted(
                2,
                stars,
                'مُمْتَازٌ! أَبْعَادٌ دَقِيقَةٌ 📏',
                'لَقَدْ اكْتَشَفْتَ أَنَّ طُولَ المُسْتَطِيلِ هُوَ مَجْمُوعُ ضِلْعَيِ المُرَبَّعَيْنِ: 5 + 5 = 10 سم!',
                {
                  label: 'أَبْعَادُ المُسْتَطِيلِ',
                  formula: 'الطُّولُ = 10 سم ، العَرْضُ = 5 سم',
                  details: 'الطُّولُ = 5 سم + 5 سم = 10 سم.',
                }
              )
            }
            onRequestHint={handleOpenHintModal}
            hintLevel={currentHintLevel}
          />
        )}

        {currentScreen === 'level' && activeLevelId === 3 && (
          <Level3Perimeter
            onComplete={(stars) =>
              handleLevelCompleted(
                3,
                stars,
                'عَبْقَرِيُّ المُحِيطِ! 🔄',
                'جَمَعْتَ أَضْلَاعَ المُسْتَطِيلِ الأَرْبَعَةَ 10 + 5 + 10 + 5 وَاكْتَشَفْتَ أَنَّ المُحِيطَ = 30 سم!',
                {
                  label: 'قَانُونُ مُحِيطِ المُسْتَطِيلِ',
                  formula: 'مُحِيطُ المُسْتَطِيلِ = 2 × (الطُّولُ + العَرْضُ)',
                  details: '2 × (10 + 5) = 2 × 15 = 30 سم.',
                }
              )
            }
            onRequestHint={handleOpenHintModal}
            hintLevel={currentHintLevel}
          />
        )}

        {currentScreen === 'level' && activeLevelId === 4 && (
          <Level4Area
            onComplete={(stars) =>
              handleLevelCompleted(
                4,
                stars,
                'نَجْمُ المِسَاحَةِ اللَّامِعُ! 🟩',
                'عَدَدْتَ شَبَكَةَ المُرَبَّعَاتِ وَاكْتَشَفْتَ أَنَّ 10 أَعْمِدَةٍ × 5 صُفُوفٍ = 50 سم²!',
                {
                  label: 'قَانُونُ مِسَاحَةِ المُسْتَطِيلِ',
                  formula: 'مِسَاحَةُ المُسْتَطِيلِ = الطُّولُ × العَرْضُ',
                  details: '10 × 5 = 50 سم².',
                }
              )
            }
            onRequestHint={handleOpenHintModal}
            hintLevel={currentHintLevel}
          />
        )}

        {currentScreen === 'level' && activeLevelId === 5 && (
          <Level5Recompose
            onComplete={(stars) =>
              handleLevelCompleted(
                5,
                stars,
                'مُهَنْدِسُ الأَشْكَالِ العَبْقَرِيُّ! 📐',
                'اكْتَشَفْتَ سِرَّ الهَنْدَسَةِ العَظِيمَ: يُمْكِنُ أَنْ تَتَسَاوَى المِسَاحَاتُ رَغْمَ اخْتِلَافِ المُحِيطِ!',
                {
                  label: 'القَاعِدَةُ الذَّهَبِيَّةُ',
                  formula: 'نَفْسُ المِسَاحَةِ (8 سم²) ≠ نَفْسُ المُحِيطِ (12 سم مُقَابِلَ 18 سم)',
                  details: 'الشَّكْلُ النَّحِيفُ وَالمُمْتَدُّ لَهُ مُحِيطٌ أَكْبَرُ دَائِماً.',
                }
              )
            }
            onRequestHint={handleOpenHintModal}
            hintLevel={currentHintLevel}
          />
        )}

        {currentScreen === 'level' && activeLevelId === 6 && (
          <Level6GeniusChallenges
            onCompleteAll={(stars) =>
              handleLevelCompleted(
                6,
                stars,
                'وِسَامُ العَبَاقِرَةِ الخَارِقُ! 👑',
                'تَهَانِينَا الحَارَّةُ! لَقَدْ أَنْهَيْتَ جَمِيعَ أَلْغَازِ وَتَحَدِّيَاتِ العَبَاقِرَةِ فِي الهَنْدَسَةِ بِنَجَاحٍ بَاهِرٍ!',
                {
                  label: 'إِنْجَازٌ شَامِلٌ',
                  formula: 'أَتْقَنْتَ المُحِيطَ وَالمِسَاحَةَ وَالأَبْعَادَ وَالأَشْكَالَ الهَنْدَسِيَّةَ',
                  details: 'أَنْتَ جَاهِزٌ لِلِامْتِيَازِ فِي مَادَّةِ الرِّيَاضِيَّاتِ!',
                }
              )
            }
            onUpdateCompletedPuzzles={(idx) => {
              const current = new Set(progress.geniusPuzzlesCompleted || []);
              current.add(idx);
              const updated = {
                ...progress,
                geniusPuzzlesCompleted: Array.from(current),
              };
              const { updatedProgress } = checkNewAchievements(updated);
              setProgress(updatedProgress);
              saveProgress(updatedProgress);
            }}
            completedPuzzleIndices={progress.geniusPuzzlesCompleted || []}
            onRequestHint={handleOpenHintModal}
            hintLevel={currentHintLevel}
            onPuzzleChange={(idx) => setLevel6PuzzleIndex(idx)}
          />
        )}
      </main>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={isCelebrationOpen}
        title={celebrationData.title}
        message={celebrationData.message}
        formulaHighlight={celebrationData.formulaHighlight}
        starsEarned={celebrationData.starsEarned}
        onNextLevel={handleNextLevelFromCelebration}
        onReplay={() => {
          setIsCelebrationOpen(false);
        }}
        onBackToMap={() => {
          setIsCelebrationOpen(false);
          setCurrentScreen('map');
        }}
        hasNextLevel={Boolean(activeLevelId && activeLevelId < 6)}
      />

      {/* Hint Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        hints={getActiveLevelHints()}
        currentHintLevel={currentHintLevel}
        onRevealNextHint={() => {
          setCurrentHintLevel((prev) => prev + 1);
        }}
        onClose={() => setIsHintModalOpen(false)}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        progress={progress}
        onClose={() => setIsAchievementsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        soundEnabled={progress.soundEnabled}
        voiceEnabled={progress.voiceEnabled}
        onToggleSound={handleToggleSound}
        onToggleVoice={handleToggleVoice}
        onResetProgress={handleResetProgress}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
