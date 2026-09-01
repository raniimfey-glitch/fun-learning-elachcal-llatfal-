export type LevelId = 1 | 2 | 3 | 4 | 5 | 6;

export interface LevelInfo {
  id: LevelId;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  themeColor: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
}

export interface ProgressState {
  unlockedLevels: number[]; // e.g. [1, 2]
  levelStars: Record<number, number>; // levelId -> stars (1-3)
  levelScores: Record<number, number>; // levelId -> score
  completedPuzzles: string[]; // puzzle ids
  geniusPuzzlesCompleted: number[]; // bonus puzzle indices completed
  achievements: string[]; // unlocked achievement IDs
  soundEnabled: boolean;
  voiceEnabled: boolean;
  totalAttempts: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (progress: ProgressState) => boolean;
}

export interface GeniusPuzzle {
  id: number;
  title: string;
  story: string;
  type: 'split' | 'nested' | 'garden_perimeter' | 'double_length' | 'grid_possibilities' | 'same_area_diff_peri' | 'garden_pathway' | 'equal_areas';
  question: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
  }[];
  hints: string[];
  explanation: string;
  dimensions?: {
    width?: number;
    height?: number;
    side?: number;
    unit?: string;
  };
  visualType: string;
}
