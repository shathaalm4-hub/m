import React from 'react';
import { Tv, LayoutDashboard, Settings, ListPlus, Volume2, VolumeX } from 'lucide-react';
import { GameState } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  currentView: 'setup' | 'host' | 'display' | 'manager' | 'results';
  setCurrentView: (view: 'setup' | 'host' | 'display' | 'manager' | 'results') => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, gameState, setGameState }) => {
  const toggleSound = () => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: !prev.settings.soundEnabled
      }
    }));
  };

  return (
    <header className="bg-[#34202B]/90 backdrop-blur-2xl border-b border-[#922D50]/40 text-[#FFFFFF] sticky top-0 z-50 px-6 py-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <Logo size="sm" onClick={() => setCurrentView('setup')} />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#34202B] p-1.5 rounded-2xl border border-[#922D50]/30 shadow-inner">
          <button
            onClick={() => setCurrentView('setup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
              currentView === 'setup'
                ? 'bg-[#922D50] text-[#FFFFFF] shadow-lg shadow-[#922D50]/40 scale-102'
                : 'text-[#F5DDE2]/70 hover:text-[#FFFFFF] hover:bg-[#922D50]/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعداد المسابقة</span>
          </button>

          <button
            onClick={() => setCurrentView('host')}
            disabled={gameState.status === 'setup' && !gameState.currentList}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
              currentView === 'host'
                ? 'bg-[#922D50] text-[#FFFFFF] shadow-lg shadow-[#922D50]/40 scale-102'
                : 'text-[#F5DDE2]/70 hover:text-[#FFFFFF] hover:bg-[#922D50]/20'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة المقدم</span>
          </button>

          <button
            onClick={() => setCurrentView('display')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
              currentView === 'display'
                ? 'bg-[#922D50] text-[#FFFFFF] shadow-lg shadow-[#922D50]/40 scale-102'
                : 'text-[#F5DDE2]/70 hover:text-[#FFFFFF] hover:bg-[#922D50]/20'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>شاشة العرض (الجمهور)</span>
          </button>

          <button
            onClick={() => setCurrentView('manager')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
              currentView === 'manager'
                ? 'bg-[#922D50] text-[#FFFFFF] shadow-lg shadow-[#922D50]/40 scale-102'
                : 'text-[#F5DDE2]/70 hover:text-[#FFFFFF] hover:bg-[#922D50]/20'
            }`}
          >
            <ListPlus className="w-4 h-4" />
            <span>إدارة القوائم</span>
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            title={gameState.settings.soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${
              gameState.settings.soundEnabled
                ? 'bg-[#922D50]/30 border-[#922D50] text-[#F5DDE2] shadow-md'
                : 'bg-[#34202B] border-[#922D50]/30 text-[#F5DDE2]/50 hover:text-[#FFFFFF]'
            }`}
          >
            {gameState.settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
