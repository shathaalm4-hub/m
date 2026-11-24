import React, { useState } from 'react';
import { GameState, QuestionList, GameMode } from '../types';
import { Play, Sparkles, Shield, Award, CheckCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { Logo } from './Logo';

interface SetupScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  lists: QuestionList[];
  onStartGame: () => void;
}

const AVATARS = ['🦅', '🐅', '🐎', '🐪', '🦁', '⭐', '🛡️', '⚔️', '🏆', '💎'];
const COLORS = [
  { name: 'خمري فخم', value: '#922D50' },
  { name: 'وردي ناعم', value: '#D99AAA' },
  { name: 'زهري فاتح', value: '#F5DDE2' },
  { name: 'أبيض نقي', value: '#FFFFFF' },
  { name: 'بنفسجي داكن', value: '#34202B' },
  { name: 'توتي', value: '#701a35' }
];

export const SetupScreen: React.FC<SetupScreenProps> = ({ gameState, setGameState, lists, onStartGame }) => {
  const [team1Name, setTeam1Name] = useState(gameState.settings.team1.name || 'صقور السعودية');
  const [team1Color, setTeam1Color] = useState(gameState.settings.team1.color || COLORS[0].value);
  const [team1Avatar, setTeam1Avatar] = useState(gameState.settings.team1.avatar || '🦅');

  const [team2Name, setTeam2Name] = useState(gameState.settings.team2.name || 'فرسان نجد');
  const [team2Color, setTeam2Color] = useState(gameState.settings.team2.color || COLORS[1].value);
  const [team2Avatar, setTeam2Avatar] = useState(gameState.settings.team2.avatar || '⭐');

  const [totalRounds, setTotalRounds] = useState(gameState.settings.totalRounds || 3);
  const [maxStrikes, setMaxStrikes] = useState(gameState.settings.maxStrikes || 3);
  const [roundDuration, setRoundDuration] = useState(gameState.settings.roundDurationSeconds || 60);
  const [gameMode, setGameMode] = useState<GameMode>(gameState.settings.gameMode || 'normal');
  const [selectedListIds, setSelectedListIds] = useState<string[]>(
    gameState.settings.selectedListIds.length > 0 ? gameState.settings.selectedListIds : [lists[0]?.id || 'list-1']
  );

  const toggleListSelection = (id: string) => {
    soundManager.playClick(gameState.settings.soundEnabled);
    if (selectedListIds.includes(id)) {
      if (selectedListIds.length === 1) return;
      setSelectedListIds(selectedListIds.filter(item => item !== id));
    } else {
      setSelectedListIds([...selectedListIds, id]);
    }
  };

  const handleLaunchGame = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick(gameState.settings.soundEnabled);

    const firstListId = selectedListIds[0] || lists[0]?.id;
    const initialList = lists.find(l => l.id === firstListId) || lists[0];

    setGameState(prev => ({
      ...prev,
      status: 'playing',
      settings: {
        ...prev.settings,
        team1: { ...prev.settings.team1, name: team1Name, color: team1Color, avatar: team1Avatar, score: 0, strikes: 0 },
        team2: { ...prev.settings.team2, name: team2Name, color: team2Color, avatar: team2Avatar, score: 0, strikes: 0 },
        totalRounds,
        currentRoundIndex: 0,
        maxStrikes,
        roundDurationSeconds: roundDuration,
        gameMode,
        selectedListIds
      },
      currentList: initialList,
      activeTeamId: 'team1',
      revealedAnswerIds: [],
      currentStrikes: 0,
      timerSecondsLeft: roundDuration,
      isTimerRunning: false,
      logs: [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString('ar-SA'),
          roundNumber: 1,
          action: 'بدء المسابقة',
          detail: `بدأت المسابقة بين ${team1Name} و ${team2Name}`
        }
      ]
    }));

    onStartGame();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 pb-24">
      {/* Cinematic Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#34202B] border-2 border-[#922D50]/50 p-10 shadow-2xl text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(146,45,80,0.2),transparent_70%)]"></div>
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <Logo size="lg" />
          <p className="text-[#F5DDE2] max-w-2xl mx-auto text-base font-medium pt-2">
            جهز فريقك، اختر القوائم الثقافية السعودية المتميزة، وانطلق في تجربة مسابقات تلفزيونية استثنائية!
          </p>
        </div>
      </div>

      <form onSubmit={handleLaunchGame} className="space-y-10">
        {/* Teams Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team 1 */}
          <div className="bg-[#34202B] backdrop-blur-xl rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#922D50]"></div>
            <div className="flex items-center justify-between border-b border-[#922D50]/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 rounded-2xl bg-[#34202B]/80 border border-[#922D50]/40">{team1Avatar}</span>
                <div>
                  <h3 className="text-lg font-black text-[#FFFFFF]">الفريق الأول</h3>
                  <span className="text-xs text-[#D99AAA] font-bold">المتنافس الأول</span>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#922D50]/20 text-[#F5DDE2] font-black border border-[#922D50]/40">الفريق أ</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#F5DDE2] mb-2">اسم الفريق</label>
                <input
                  type="text"
                  value={team1Name}
                  onChange={e => setTeam1Name(e.target.value)}
                  className="w-full bg-[#34202B]/60 border border-[#922D50]/40 rounded-2xl px-5 py-3.5 text-[#FFFFFF] font-bold focus:outline-none focus:border-[#D99AAA] shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5DDE2] mb-2">أيقونة الفريق</label>
                <div className="flex gap-2.5 flex-wrap">
                  {AVATARS.slice(0, 5).map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setTeam1Avatar(av)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                        team1Avatar === av ? 'bg-[#922D50] text-[#FFFFFF] scale-110 shadow-xl shadow-[#922D50]/30' : 'bg-[#34202B] hover:bg-[#922D50]/30 border border-[#922D50]/30'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5DDE2] mb-2">لون الفريق المميز</label>
                <div className="flex gap-3.5 flex-wrap">
                  {COLORS.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setTeam1Color(col.value)}
                      className={`w-9 h-9 rounded-2xl transition-all ${
                        team1Color === col.value ? 'ring-4 ring-[#FFFFFF] scale-110 shadow-xl' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-[#34202B] backdrop-blur-xl rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#D99AAA]"></div>
            <div className="flex items-center justify-between border-b border-[#922D50]/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 rounded-2xl bg-[#34202B]/80 border border-[#922D50]/40">{team2Avatar}</span>
                <div>
                  <h3 className="text-lg font-black text-[#FFFFFF]">الفريق الثاني</h3>
                  <span className="text-xs text-[#D99AAA] font-bold">المتنافس الثاني</span>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#922D50]/20 text-[#F5DDE2] font-black border border-[#922D50]/40">الفريق ب</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#F5DDE2] mb-2">اسم الفريق</label>
                <input
                  type="text"
                  value={team2Name}
                  onChange={e => setTeam2Name(e.target.value)}
                  className="w-full bg-[#34202B]/60 border border-[#922D50]/40 rounded-2xl px-5 py-3.5 text-[#FFFFFF] font-bold focus:outline-none focus:border-[#D99AAA] shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5DDE2] mb-2">أيقونة الفريق</label>
                <div className="flex gap-2.5 flex-wrap">
                  {AVATARS.slice(5, 10).map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setTeam2Avatar(av)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                        team2Avatar === av ? 'bg-[#922D50] text-[#FFFFFF] scale-110 shadow-xl shadow-[#922D50]/30' : 'bg-[#34202B] hover:bg-[#922D50]/30 border border-[#922D50]/30'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5DDE2] mb-2">لون الفريق المميز</label>
                <div className="flex gap-3.5 flex-wrap">
                  {COLORS.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setTeam2Color(col.value)}
                      className={`w-9 h-9 rounded-2xl transition-all ${
                        team2Color === col.value ? 'ring-4 ring-[#FFFFFF] scale-110 shadow-xl' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules & Settings */}
        <div className="bg-[#34202B] backdrop-blur-xl rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl space-y-6">
          <h3 className="text-xl font-black text-[#FFFFFF] border-b border-[#922D50]/30 pb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#D99AAA]" />
            <span>قواعد وضوابط المسابقة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#F5DDE2] mb-2">عدد الجولات</label>
              <select
                value={totalRounds}
                onChange={e => setTotalRounds(Number(e.target.value))}
                className="w-full bg-[#34202B]/60 border border-[#922D50]/40 rounded-2xl px-5 py-3.5 text-[#FFFFFF] font-bold focus:outline-none focus:border-[#D99AAA]"
              >
                <option value={1}>جولة واحدة</option>
                <option value={3}>3 جولات (موصى به)</option>
                <option value={5}>5 جولات</option>
                <option value={10}>10 جولات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5DDE2] mb-2">الأخطاء المسموح بها لكل جولة</label>
              <select
                value={maxStrikes}
                onChange={e => setMaxStrikes(Number(e.target.value))}
                className="w-full bg-[#34202B]/60 border border-[#922D50]/40 rounded-2xl px-5 py-3.5 text-[#FFFFFF] font-bold focus:outline-none focus:border-[#D99AAA]"
              >
                <option value={1}>خطأ واحد (صعب)</option>
                <option value={3}>3 أخطاء (نظام البرنامج التقليدي)</option>
                <option value={5}>5 أخطاء (مريح)</option>
                <option value={100}>بدون تحديد أخطاء</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5DDE2] mb-2">مدة الجولة (بالثواني)</label>
              <select
                value={roundDuration}
                onChange={e => setRoundDuration(Number(e.target.value))}
                className="w-full bg-[#34202B]/60 border border-[#922D50]/40 rounded-2xl px-5 py-3.5 text-[#FFFFFF] font-bold focus:outline-none focus:border-[#D99AAA]"
              >
                <option value={30}>30 ثانية</option>
                <option value={60}>60 ثانية (دقيقة)</option>
                <option value={120}>120 ثانية (دقيقتان)</option>
                <option value={0}>بدون مؤقت</option>
              </select>
            </div>
          </div>
        </div>

        {/* List Selection */}
        <div className="bg-[#34202B] backdrop-blur-xl rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#922D50]/30 pb-4">
            <h3 className="text-xl font-black text-[#FFFFFF] flex items-center gap-3">
              <Award className="w-6 h-6 text-[#D99AAA]" />
              <span>اختر قوائم التحدي (سعودية 100%)</span>
            </h3>
            <span className="text-xs text-[#F5DDE2] font-bold bg-[#922D50]/30 px-4 py-1.5 rounded-full border border-[#922D50]/50">
              تم اختيار {selectedListIds.length} قوائم
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lists.map(lst => {
              const isSelected = selectedListIds.includes(lst.id);
              return (
                <div
                  key={lst.id}
                  onClick={() => toggleListSelection(lst.id)}
                  className={`cursor-pointer rounded-[1.75rem] p-6 border-2 transition-all duration-300 relative flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#922D50]/30 via-[#34202B] to-[#34202B] border-[#922D50] shadow-2xl shadow-[#922D50]/20 scale-102'
                      : 'bg-[#34202B]/60 border-[#922D50]/20 hover:border-[#922D50]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-black text-[#F5DDE2] bg-[#922D50]/40 px-3 py-1 rounded-lg border border-[#922D50]/50">
                        {lst.category}
                      </span>
                      <h4 className="text-[#FFFFFF] font-black text-lg mt-3">{lst.title}</h4>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'bg-[#922D50] border-[#922D50] text-[#FFFFFF] shadow-lg' : 'border-[#922D50]/40 bg-[#34202B] text-transparent'
                    }`}>
                      <CheckCircle className="w-4 h-4 font-black" />
                    </div>
                  </div>

                  <p className="text-xs text-[#F5DDE2]/80 leading-relaxed">{lst.description}</p>

                  <div className="text-[11px] text-[#F5DDE2]/60 pt-3 border-t border-[#922D50]/20 flex justify-between items-center font-bold">
                    <span>{lst.answers.length} إجابة مرتبة</span>
                    <span className="text-[#D99AAA]">{lst.criteria}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="px-14 py-5 rounded-[2rem] bg-gradient-to-r from-[#922D50] via-[#D99AAA] to-[#922D50] text-[#FFFFFF] font-black text-2xl shadow-2xl shadow-[#922D50]/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-4 cursor-pointer border border-[#F5DDE2]/30"
          >
            <Play className="w-7 h-7 fill-[#FFFFFF]" />
            <span>بدء المسابقة الآن</span>
          </button>
        </div>
      </form>
    </div>
  );
};
