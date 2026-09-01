import { ProgressState, Achievement } from '../types';

const STORAGE_KEY = 'fun_learning_shapes_progress_v1';

export const INITIAL_PROGRESS: ProgressState = {
  unlockedLevels: [1],
  levelStars: {},
  levelScores: {},
  completedPuzzles: [],
  geniusPuzzlesCompleted: [],
  achievements: [],
  soundEnabled: true,
  voiceEnabled: true,
  totalAttempts: 0,
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_step',
    title: 'المستكشف الصغير',
    description: 'أكملت المستوى الأول واكتشفت كيف يتكون المستطيل!',
    icon: '🧩',
    condition: (p) => (p.levelStars[1] ?? 0) > 0,
  },
  {
    id: 'dimensions_master',
    title: 'خبير الأبعاد',
    description: 'حددت أبعاد المستطيل الطول والعرض بدقة فائقة!',
    icon: '📏',
    condition: (p) => (p.levelStars[2] ?? 0) > 0,
  },
  {
    id: 'perimeter_champion',
    title: 'بطل المحيط',
    description: 'لمست كل الأضلاع واكتشفت قانون المحيط بنفسك!',
    icon: '🔄',
    condition: (p) => (p.levelStars[3] ?? 0) > 0,
  },
  {
    id: 'area_genius',
    title: 'عبقري المساحة',
    description: 'عددت وحدات المربعات واكتشفت قانون المساحة!',
    icon: '🟩',
    condition: (p) => (p.levelStars[4] ?? 0) > 0,
  },
  {
    id: 'shape_architect',
    title: 'مهندس التركيب',
    description: 'أعدت ترتيب 8 مربعات واكتشفت سر المساحة والمحيط!',
    icon: '📐',
    condition: (p) => (p.levelStars[5] ?? 0) > 0,
  },
  {
    id: 'genius_master',
    title: 'وسام العباقرة الخارق',
    description: 'أنجزت جميع تحديات العباقرة في الهندسة!',
    icon: '👑',
    condition: (p) => (p.geniusPuzzlesCompleted?.length ?? 0) >= 8,
  },
  {
    id: 'star_collector',
    title: 'جامع النجوم',
    description: 'جمعت 15 نجمة أو أكثر في مغامرات الأشكال!',
    icon: '⭐',
    condition: (p) => {
      const stars = (Object.values(p.levelStars) as number[]).reduce((a, b) => a + b, 0);
      return stars >= 15;
    },
  },
];

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_PROGRESS;
    const parsed = JSON.parse(saved);
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      unlockedLevels: parsed.unlockedLevels || [1],
      levelStars: parsed.levelStars || {},
      completedPuzzles: parsed.completedPuzzles || [],
      geniusPuzzlesCompleted: parsed.geniusPuzzlesCompleted || [],
      achievements: parsed.achievements || [],
    };
  } catch {
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(state: ProgressState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function checkNewAchievements(progress: ProgressState): {
  updatedProgress: ProgressState;
  newlyUnlocked: Achievement[];
} {
  const currentUnlocked = new Set(progress.achievements || []);
  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS_LIST.forEach((ach) => {
    if (!currentUnlocked.has(ach.id) && ach.condition(progress)) {
      currentUnlocked.add(ach.id);
      newlyUnlocked.push(ach);
    }
  });

  const updatedProgress = {
    ...progress,
    achievements: Array.from(currentUnlocked),
  };

  saveProgress(updatedProgress);
  return { updatedProgress, newlyUnlocked };
}
