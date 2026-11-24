export interface AnswerItem {
  id: number;
  rank: number; // 1 to 100
  text: string;
  points: number; // usually equal to rank or custom
  synonyms?: string[];
  isRevealed?: boolean;
}

export interface QuestionList {
  id: string;
  title: string;
  category: string;
  description: string;
  criteria: string; // e.g. "مرتبة حسب الشهرة في السعودية"
  source?: string;
  updatedAt?: string;
  answers: AnswerItem[];
}

export interface Team {
  id: string;
  name: string;
  color: string;
  avatar: string; // emoji or icon name
  score: number;
  strikes: number; // 0 to maxStrikes
}

export type GameMode = 'normal' | 'showdown' | 'speed' | 'high_scorer' | 'random';

export interface ThemeConfig {
  name: string;
  bg: string;
  cardBg: string;
  primary: string;
  accent: string;
  text: string;
  subText: string;
  border: string;
}

export interface GameSettings {
  team1: Team;
  team2: Team;
  totalRounds: number;
  currentRoundIndex: number;
  maxStrikes: number;
  roundDurationSeconds: number; // 0 for unlimited
  gameMode: GameMode;
  soundEnabled: boolean;
  selectedListIds: string[];
  gameTitle: string; // Custom game title
  autoSwitchTeam: boolean; // Automatic team switching after answer
  themeId: string; // Selected theme preset ID
  customTheme?: ThemeConfig; // Manual custom theme colors
}

export interface GameLog {
  id: string;
  timestamp: string;
  roundNumber: number;
  teamId?: string;
  action: string;
  detail: string;
  points?: number;
}

export interface GameState {
  status: 'setup' | 'playing' | 'round_paused' | 'round_ended' | 'game_over';
  settings: GameSettings;
  currentList: QuestionList | null;
  activeTeamId: string; // team1 or team2
  revealedAnswerIds: number[]; // ids of revealed answers
  currentStrikes: number;
  timerSecondsLeft: number;
  isTimerRunning: boolean;
  logs: GameLog[];
  historyRounds: {
    roundNumber: number;
    listTitle: string;
    team1ScoreBefore: number;
    team1ScoreAfter: number;
    team2ScoreBefore: number;
    team2ScoreAfter: number;
    revealedCount: number;
  }[];
}
