import { ThemeConfig } from '../types';

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  'playful_chic': {
    name: 'Playful Chic (الافتراضي)',
    bg: '#34202B',
    cardBg: '#34202B',
    primary: '#922D50',
    accent: '#D99AAA',
    text: '#FFFFFF',
    subText: '#F5DDE2',
    border: '#922D50'
  },
  'game_show': {
    name: 'Game Show (تلفزيوني كلاسيكي)',
    bg: '#09090b',
    cardBg: '#18181b',
    primary: '#dc2626',
    accent: '#f59e0b',
    text: '#ffffff',
    subText: '#a1a1aa',
    border: '#dc2626'
  },
  'digital_arena': {
    name: 'Digital Arena (أزرق رقمي)',
    bg: '#0f172a',
    cardBg: '#1e293b',
    primary: '#2563eb',
    accent: '#06b6d4',
    text: '#ffffff',
    subText: '#94a3b8',
    border: '#2563eb'
  },
  'pop_neon': {
    name: 'Pop & Neon (نيون صاخب)',
    bg: '#180e2b',
    cardBg: '#24143f',
    primary: '#9333ea',
    accent: '#ec4899',
    text: '#ffffff',
    subText: '#d8b4fe',
    border: '#9333ea'
  },
  'royal_night': {
    name: 'Royal Night (ليلة ملكية)',
    bg: '#1e1b4b',
    cardBg: '#312e81',
    primary: '#7c3aed',
    accent: '#eab308',
    text: '#ffffff',
    subText: '#fde047',
    border: '#eab308'
  },
  'minimal': {
    name: 'Minimal (مينيمل أبيض وأسود)',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    primary: '#0f172a',
    accent: '#64748b',
    text: '#0f172a',
    subText: '#475569',
    border: '#cbd5e1'
  }
};
