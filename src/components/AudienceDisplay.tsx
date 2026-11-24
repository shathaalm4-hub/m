import React, { useEffect } from 'react';
import { GameState } from '../types';
import { THEME_PRESETS } from '../data/themes';
import { Trophy, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from './Logo';

interface AudienceDisplayProps {
  gameState: GameState;
  onRestartGame?: () => void;
}

export const AudienceDisplay: React.FC<AudienceDisplayProps> = ({ gameState }) => {
  const currentList = gameState.currentList;
  const settings = gameState.settings;
  const team1 = settings.team1;
  const team2 = settings.team2;
  const activeTeamId = gameState.activeTeamId;
  const revealedIds = gameState.revealedAnswerIds;

  const themeId = settings.themeId || 'playful_chic';
  const currentTheme = THEME_PRESETS[themeId] || settings.customTheme || THEME_PRESETS['playful_chic'];

  useEffect(() => {
    if (gameState.status === 'game_over') {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.4 }
      });
    }
  }, [gameState.status]);

  if (!currentList) {
    return (
      <div className="min-h-screen bg-[#34202B] flex flex-col items-center justify-center text-center p-8 text-[#FFFFFF]">
        <div className="w-24 h-24 rounded-[2rem] bg-[#922D50]/20 border border-[#922D50]/40 flex items-center justify-center mb-6 shadow-2xl animate-pulse">
          <Trophy className="w-12 h-12 text-[#D99AAA]" />
        </div>
        <Logo size="lg" gameTitle={settings.gameTitle} theme={currentTheme} />
        <p className="text-[#F5DDE2]/70 text-lg mt-6">بانتظار بدء المقدم للمسابقة...</p>
      </div>
    );
  }

  const activeTeam = activeTeamId === 'team1' ? team1 : team2;
  const winner = team1.score > team2.score ? team1 : team2.score > team1.score ? team2 : null;

  // Get all answers that have been revealed by the host so far
  const revealedAnswers = currentList.answers.filter(ans => revealedIds.includes(ans.id));

  // Create up to 8 interactive display slots for revealed answers
  const displaySlots = Array.from({ length: Math.max(8, revealedAnswers.length) }, (_, index) => {
    return revealedAnswers[index] || null;
  });

  return (
    <div className="min-h-screen bg-[#34202B] text-[#FFFFFF] p-6 md:p-10 flex flex-col justify-between overflow-x-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#922D50]/15 blur-[140px] pointer-events-none rounded-full"></div>

      {/* Top TV Studio Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-[#922D50]/30 pb-6 mb-6 relative z-10">
        <Logo size="md" gameTitle={settings.gameTitle} theme={currentTheme} />

        {settings.roundDurationSeconds > 0 && (
          <div className="bg-[#34202B] backdrop-blur-xl border-2 border-[#922D50]/50 px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <span className="text-xs font-bold text-[#F5DDE2]/70">الوقت المتبقي:</span>
            <span className={`text-3xl font-black ${gameState.timerSecondsLeft <= 10 ? 'text-[#D99AAA] animate-ping' : 'text-[#FFFFFF]'}`}>
              {Math.floor(gameState.timerSecondsLeft / 60)}:{(gameState.timerSecondsLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Teams Scoreboards & Question Banner */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center my-6 relative z-10">
        {/* Team 1 Scoreboard */}
        <div 
          className={`rounded-[2.5rem] p-8 border-2 transition-all duration-500 flex items-center justify-between shadow-2xl ${
            activeTeamId === 'team1' 
              ? 'bg-[#34202B] border-[#922D50] shadow-2xl shadow-[#922D50]/40 scale-105' 
              : 'bg-[#34202B]/60 backdrop-blur-xl border-[#922D50]/30 opacity-80'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl p-3 rounded-2xl bg-[#34202B] border border-[#922D50]/40">{team1.avatar}</span>
            <div>
              <span className="text-xs font-bold text-[#F5DDE2]/70 uppercase tracking-widest">الفريق الأول</span>
              <h3 className="text-2xl font-black text-[#FFFFFF]">{team1.name}</h3>
              {activeTeamId === 'team1' && (
                <span className="inline-block mt-2 text-[11px] font-black bg-[#922D50] text-[#FFFFFF] px-3 py-1 rounded-full animate-bounce shadow-lg shadow-[#922D50]/40">
                  الدور الحالي 🎯
                </span>
              )}
            </div>
          </div>
          <div className="text-left">
            <span className="text-4xl md:text-5xl font-black text-[#D99AAA]">
              {team1.score}
            </span>
            <span className="block text-xs text-[#F5DDE2]/70 font-bold">نقطة</span>
          </div>
        </div>

        {/* Central Question Banner */}
        <div className="bg-[#34202B] rounded-[2.5rem] border-2 border-[#922D50] p-8 shadow-2xl shadow-[#922D50]/20 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(146,45,80,0.2),transparent_70%)]"></div>
          <div className="relative z-10 space-y-3">
            <span className="text-xs font-black px-4 py-1.5 rounded-full bg-[#922D50]/30 text-[#F5DDE2] border border-[#922D50]/50">
              السؤال الرئيسي - الجولة {settings.currentRoundIndex + 1}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#FFFFFF] leading-snug tracking-tight">
              {currentList.title}
            </h2>
            <p className="text-sm text-[#F5DDE2]/80 font-medium">{currentList.description}</p>
          </div>
        </div>

        {/* Team 2 Scoreboard */}
        <div 
          className={`rounded-[2.5rem] p-8 border-2 transition-all duration-500 flex items-center justify-between shadow-2xl ${
            activeTeamId === 'team2' 
              ? 'bg-[#34202B] border-[#922D50] shadow-2xl shadow-[#922D50]/40 scale-105' 
              : 'bg-[#34202B]/60 backdrop-blur-xl border-[#922D50]/30 opacity-80'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl p-3 rounded-2xl bg-[#34202B] border border-[#922D50]/40">{team2.avatar}</span>
            <div>
              <span className="text-xs font-bold text-[#F5DDE2]/70 uppercase tracking-widest">الفريق الثاني</span>
              <h3 className="text-2xl font-black text-[#FFFFFF]">{team2.name}</h3>
              {activeTeamId === 'team2' && (
                <span className="inline-block mt-2 text-[11px] font-black bg-[#922D50] text-[#FFFFFF] px-3 py-1 rounded-full animate-bounce shadow-lg shadow-[#922D50]/40">
                  الدور الحالي 🎯
                </span>
              )}
            </div>
          </div>
          <div className="text-left">
            <span className="text-4xl md:text-5xl font-black text-[#D99AAA]">
              {team2.score}
            </span>
            <span className="block text-xs text-[#F5DDE2]/70 font-bold">نقطة</span>
          </div>
        </div>
      </div>

      {/* Main Family Feud Style Dynamic Answer Board */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5 my-6 relative z-10">
        {displaySlots.map((ans, idx) => {
          const isRevealed = !!ans;
          return (
            <div
              key={ans ? ans.id : `empty-${idx}`}
              className={`relative h-24 rounded-[2rem] border-2 flex items-center justify-between px-8 transition-all duration-500 overflow-hidden shadow-2xl ${
                isRevealed
                  ? 'bg-[#922D50] border-[#D99AAA] shadow-2xl shadow-[#922D50]/50 scale-102 animate-fadeIn'
                  : 'bg-[#34202B] border-[#922D50]/40 shadow-inner'
              }`}
            >
              {/* Rank Number Badge */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                isRevealed ? 'bg-[#FFFFFF] text-[#922D50]' : 'bg-[#34202B] border border-[#922D50]/50 text-[#D99AAA]'
              }`}>
                {isRevealed ? `#${ans.rank}` : `${idx + 1}`}
              </div>

              {/* Answer Text / Hidden Slot */}
              <div className="flex-1 mx-6 text-center">
                {isRevealed ? (
                  <span className="text-2xl md:text-3xl font-black text-[#FFFFFF] tracking-wide animate-fadeIn">
                    {ans.text}
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-2 opacity-30">
                    <span className="text-3xl font-black text-[#F5DDE2] tracking-widest">••••••••••••</span>
                  </div>
                )}
              </div>

              {/* Points Badge */}
              <div className={`px-5 py-2.5 rounded-2xl font-black text-xl ${
                isRevealed ? 'bg-[#34202B] text-[#FFFFFF] shadow-xl border border-[#D99AAA]/40' : 'bg-[#34202B] border border-[#922D50]/40 text-[#F5DDE2]/40'
              }`}>
                {isRevealed ? `${ans.points}ن` : '??'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Strikes / X Markers Bar */}
      <div className="max-w-3xl mx-auto w-full bg-[#34202B] backdrop-blur-xl border-2 border-[#922D50]/50 rounded-[2rem] p-5 flex items-center justify-center gap-8 shadow-2xl mb-4 relative z-10">
        <span className="text-xs font-black text-[#F5DDE2] flex items-center gap-2 uppercase tracking-wider">
          <ShieldAlert className="w-6 h-6 text-[#D99AAA]" />
          <span>الأخطاء والضربات:</span>
        </span>
        <div className="flex items-center gap-4">
          {Array.from({ length: settings.maxStrikes }).map((_, i) => (
            <span
              key={i}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-all ${
                i < gameState.currentStrikes
                  ? 'bg-[#922D50] border-[#D99AAA] text-[#FFFFFF] shadow-2xl shadow-[#922D50]/60 scale-110'
                  : 'bg-[#34202B] border-[#922D50]/40 text-[#F5DDE2]/40'
              }`}
            >
              {i < gameState.currentStrikes ? '❌' : '•'}
            </span>
          ))}
        </div>
      </div>

      {/* Game Over / Winner Modal */}
      {gameState.status === 'game_over' && (
        <div className="fixed inset-0 bg-[#34202B]/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#34202B] border-2 border-[#922D50] rounded-[3rem] p-10 md:p-14 max-w-xl w-full text-center space-y-8 shadow-2xl shadow-[#922D50]/40 relative overflow-hidden">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#922D50] via-[#D99AAA] to-[#922D50] flex items-center justify-center mx-auto shadow-2xl shadow-[#922D50]/60 animate-bounce">
              <Trophy className="w-14 h-14 text-[#FFFFFF] font-black" />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl md:text-6xl font-black text-[#FFFFFF]">نهاية المسابقة!</h2>
              <p className="text-[#D99AAA] font-black text-xl">
                {winner ? `الفريق الفائز: ${winner.name} 🏆` : 'تعادل الفريقان بنجاح!'}
              </p>
              <p className="text-xs text-[#F5DDE2]/70 font-bold">تحدي الـ100 مع شذى</p>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-y border-[#922D50]/30">
              <div className="bg-[#34202B]/80 p-5 rounded-2xl border border-[#922D50]/40 shadow-inner">
                <span className="text-xs text-[#F5DDE2]/70 font-bold block">{team1.name}</span>
                <span className="text-3xl font-black text-[#D99AAA]">{team1.score} نقطة</span>
              </div>
              <div className="bg-[#34202B]/80 p-5 rounded-2xl border border-[#922D50]/40 shadow-inner">
                <span className="text-xs text-[#F5DDE2]/70 font-bold block">{team2.name}</span>
                <span className="text-3xl font-black text-[#D99AAA]">{team2.score} نقطة</span>
              </div>
            </div>

            <p className="text-xs text-[#F5DDE2]/70 font-bold">شكراً لمشاركتكم في تحدي الـ100 مع شذى!</p>
          </div>
        </div>
      )}
    </div>
  );
};
