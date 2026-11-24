import React from 'react';
import { GameState } from '../types';
import { THEME_PRESETS } from '../data/themes';
import { Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from './Logo';

interface ResultsScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onResetToSetup: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ gameState, onResetToSetup }) => {
  const { team1, team2 } = gameState.settings;
  const winner = team1.score > team2.score ? team1 : team2.score > team1.score ? team2 : null;

  const themeId = gameState.settings.themeId || 'playful_chic';
  const currentTheme = THEME_PRESETS[themeId] || gameState.settings.customTheme || THEME_PRESETS['playful_chic'];

  React.useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-24 animate-fadeIn">
      {/* Hero Podium */}
      <div className="bg-[#34202B] border-2 border-[#922D50] rounded-[3rem] p-8 md:p-14 text-center space-y-8 shadow-2xl shadow-[#922D50]/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(146,45,80,0.25),transparent_60%)]"></div>
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#922D50] via-[#D99AAA] to-[#922D50] flex items-center justify-center mx-auto shadow-2xl shadow-[#922D50]/60 animate-bounce">
            <Trophy className="w-14 h-14 text-[#FFFFFF] font-black" />
          </div>
          
          <Logo size="lg" gameTitle={gameState.settings.gameTitle} theme={currentTheme} />

          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-[#FFFFFF]">
              {winner ? `الفريق الفائز: ${winner.name} 🏆` : 'تعادل الفريقان بنجاح!'}
            </h2>
            <p className="text-[#F5DDE2]/80 text-sm max-w-lg mx-auto font-medium">
              مواجهة حماسية رائعة ضمن منافسات المسابقات التلفزيونية الاحترافية. إليكم النتائج النهائية والإحصائيات.
            </p>
          </div>
        </div>

        {/* Teams Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 relative z-10">
          <div className={`p-6 rounded-[2rem] border-2 flex items-center justify-between shadow-xl ${
            team1.score >= team2.score ? 'bg-[#922D50]/30 border-[#922D50]' : 'bg-[#34202B]/60 border-[#922D50]/30 opacity-80'
          }`}>
            <div className="flex items-center gap-4">
              <span className="text-4xl p-2 rounded-2xl bg-[#34202B] border border-[#922D50]/40">{team1.avatar}</span>
              <div className="text-right">
                <h3 className="text-lg font-black text-[#FFFFFF]">{team1.name}</h3>
                <span className="text-xs text-[#F5DDE2]/70 font-bold">الفريق الأول</span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-3xl font-black text-[#D99AAA]">{team1.score}</span>
              <span className="block text-[10px] text-[#F5DDE2]/70 font-bold">نقطة</span>
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] border-2 flex items-center justify-between shadow-xl ${
            team2.score >= team1.score ? 'bg-[#922D50]/30 border-[#922D50]' : 'bg-[#34202B]/60 border-[#922D50]/30 opacity-80'
          }`}>
            <div className="flex items-center gap-4">
              <span className="text-4xl p-2 rounded-2xl bg-[#34202B] border border-[#922D50]/40">{team2.avatar}</span>
              <div className="text-right">
                <h3 className="text-lg font-black text-[#FFFFFF]">{team2.name}</h3>
                <span className="text-xs text-[#F5DDE2]/70 font-bold">الفريق الثاني</span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-3xl font-black text-[#D99AAA]">{team2.score}</span>
              <span className="block text-[10px] text-[#F5DDE2]/70 font-bold">نقطة</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-6 relative z-10">
          <button
            onClick={onResetToSetup}
            className="px-10 py-4 rounded-[2rem] bg-gradient-to-r from-[#922D50] via-[#D99AAA] to-[#922D50] text-[#FFFFFF] font-black text-lg shadow-2xl shadow-[#922D50]/50 hover:scale-105 transition-all flex items-center gap-3 cursor-pointer border border-[#F5DDE2]/30"
          >
            <RotateCcw className="w-5 h-5" />
            <span>مسابقة جديدة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
