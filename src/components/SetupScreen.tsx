import React, { useState } from 'react';
import { GameState, QuestionList, GameMode, ThemeConfig } from '../types';
import { THEME_PRESETS } from '../data/themes';
import { Play, Sparkles, Shield, Award, CheckCircle, Palette, ToggleLeft, ToggleRight, Type } from 'lucide-react';
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

  // New customization states
  const [gameTitle, setGameTitle] = useState(gameState.settings.gameTitle || 'تحدي الـ100 مع شذى');
  const [autoSwitchTeam, setAutoSwitchTeam] = useState(gameState.settings.autoSwitchTeam ?? true);
  const [themeId, setThemeId] = useState(gameState.settings.themeId || 'playful_chic');
  const [customTheme, setCustomTheme] = useState<ThemeConfig>(
    gameState.settings.customTheme || THEME_PRESETS['playful_chic']
  );

  const currentTheme = THEME_PRESETS[themeId] || customTheme;

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
        selectedListIds,
        gameTitle,
        autoSwitchTeam,
        themeId,
        customTheme
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
    <div 
      className="min-h-screen p-6 md:p-10 space-y-10 pb-24 transition-colors duration-500"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
    >
      {/* Cinematic Hero */}
      <div 
        className="relative overflow-hidden rounded-[2.5rem] border-2 p-10 shadow-2xl text-center"
        style={{ backgroundColor: currentTheme.cardBg, borderColor: `${currentTheme.primary}80` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(146,45,80,0.2),transparent_70%)]"></div>
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <Logo size="lg" gameTitle={gameTitle} theme={currentTheme} />
          <p className="max-w-2xl mx-auto text-base font-medium pt-2" style={{ color: currentTheme.subText }}>
            جهز فريقك، اختر القوائم الثقافية السعودية المتميزة، وانطلق في تجربة مسابقات تلفزيونية استثنائية!
          </p>
        </div>
      </div>

      <form onSubmit={handleLaunchGame} className="space-y-10">
        {/* Game Name & Identity Customization */}
        <div 
          className="backdrop-blur-xl rounded-[2rem] border p-8 shadow-2xl space-y-6"
          style={{ backgroundColor: currentTheme.cardBg, borderColor: `${currentTheme.primary}40` }}
        >
          <h3 className="text-xl font-black border-b pb-4 flex items-center gap-3" style={{ borderColor: `${currentTheme.primary}30` }}>
            <Palette className="w-6 h-6" style={{ color: currentTheme.accent }} />
            <span>تخصيص اسم اللعبة والهوية البصرية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>اسم اللعبة الرسمي</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gameTitle}
                  onChange={e => setGameTitle(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none shadow-inner"
                  style={{ backgroundColor: `${currentTheme.bg}`, border: `1px solid ${currentTheme.primary}60`, color: currentTheme.text }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setGameTitle('تحدي الـ100 مع شذى')}
                  className="px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0"
                  style={{ backgroundColor: `${currentTheme.primary}30`, borderColor: currentTheme.primary, color: currentTheme.text }}
                >
                  استعادة الافتراضي
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>التبديل التلقائي بين الفرق بعد كل إجابة</label>
              <button
                type="button"
                onClick={() => setAutoSwitchTeam(!autoSwitchTeam)}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border font-bold transition-all cursor-pointer"
                style={{ backgroundColor: `${currentTheme.bg}`, borderColor: `${currentTheme.primary}60`, color: currentTheme.text }}
              >
                <span>{autoSwitchTeam ? 'مفعل (يتبدل الدور تلقائياً بعد كل إجابة)' : 'معطل (تحكم يدوي كامل)'}</span>
                {autoSwitchTeam ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-3" style={{ color: currentTheme.subText }}>اختر الهوية البصرية الجاهزة</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(THEME_PRESETS).map(([id, preset]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setThemeId(id);
                    setCustomTheme(preset);
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    themeId === id ? 'scale-105 shadow-xl' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: preset.cardBg,
                    borderColor: themeId === id ? preset.accent : `${preset.primary}50`,
                    color: preset.text
                  }}
                >
                  <div className="w-8 h-8 rounded-full border border-white/20 shadow" style={{ backgroundColor: preset.primary }}></div>
                  <span className="text-xs font-black">{preset.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teams Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team 1 */}
          <div 
            className="backdrop-blur-xl rounded-[2rem] border p-8 shadow-2xl space-y-6 relative overflow-hidden"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: `${currentTheme.primary}40` }}
          >
            <div className="absolute top-0 right-0 left-0 h-1.5" style={{ backgroundColor: currentTheme.primary }}></div>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${currentTheme.primary}30` }}>
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 rounded-2xl border" style={{ backgroundColor: currentTheme.bg, borderColor: `${currentTheme.primary}40` }}>{team1Avatar}</span>
                <div>
                  <h3 className="text-lg font-black">الفريق الأول</h3>
                  <span className="text-xs font-bold" style={{ color: currentTheme.accent }}>المتنافس الأول</span>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-black border" style={{ backgroundColor: `${currentTheme.primary}20`, borderColor: `${currentTheme.primary}40`, color: currentTheme.subText }}>الفريق أ</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>اسم الفريق</label>
                <input
                  type="text"
                  value={team1Name}
                  onChange={e => setTeam1Name(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none shadow-inner"
                  style={{ backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.primary}40`, color: currentTheme.text }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>أيقونة الفريق</label>
                <div className="flex gap-2.5 flex-wrap">
                  {AVATARS.slice(0, 5).map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setTeam1Avatar(av)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                        team1Avatar === av ? 'scale-110 shadow-xl' : 'border'
                      }`}
                      style={{
                        backgroundColor: team1Avatar === av ? currentTheme.primary : currentTheme.bg,
                        borderColor: `${currentTheme.primary}40`,
                        color: currentTheme.text
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>لون الفريق المميز</label>
                <div className="flex gap-3.5 flex-wrap">
                  {COLORS.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setTeam1Color(col.value)}
                      className={`w-9 h-9 rounded-2xl transition-all ${
                        team1Color === col.value ? 'ring-4 ring-white scale-110 shadow-xl' : 'opacity-70 hover:opacity-100'
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
          <div 
            className="backdrop-blur-xl rounded-[2rem] border p-8 shadow-2xl space-y-6 relative overflow-hidden"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: `${currentTheme.primary}40` }}
          >
            <div className="absolute top-0 right-0 left-0 h-1.5" style={{ backgroundColor: currentTheme.accent }}></div>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${currentTheme.primary}30` }}>
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 rounded-2xl border" style={{ backgroundColor: currentTheme.bg, borderColor: `${currentTheme.primary}40` }}>{team2Avatar}</span>
                <div>
                  <h3 className="text-lg font-black">الفريق الثاني</h3>
                  <span className="text-xs font-bold" style={{ color: currentTheme.accent }}>المتنافس الثاني</span>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-black border" style={{ backgroundColor: `${currentTheme.primary}20`, borderColor: `${currentTheme.primary}40`, color: currentTheme.subText }}>الفريق ب</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>اسم الفريق</label>
                <input
                  type="text"
                  value={team2Name}
                  onChange={e => setTeam2Name(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none shadow-inner"
                  style={{ backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.primary}40`, color: currentTheme.text }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>أيقونة الفريق</label>
                <div className="flex gap-2.5 flex-wrap">
                  {AVATARS.slice(5, 10).map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setTeam2Avatar(av)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                        team2Avatar === av ? 'scale-110 shadow-xl' : 'border'
                      }`}
                      style={{
                        backgroundColor: team2Avatar === av ? currentTheme.primary : currentTheme.bg,
                        borderColor: `${currentTheme.primary}40`,
                        color: currentTheme.text
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>لون الفريق المميز</label>
                <div className="flex gap-3.5 flex-wrap">
                  {COLORS.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setTeam2Color(col.value)}
                      className={`w-9 h-9 rounded-2xl transition-all ${
                        team2Color === col.value ? 'ring-4 ring-white scale-110 shadow-xl' : 'opacity-70 hover:opacity-100'
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
        <div 
          className="backdrop-blur-xl rounded-[2rem] border p-8 shadow-2xl space-y-6"
          style={{ backgroundColor: currentTheme.cardBg, borderColor: `${currentTheme.primary}40` }}
        >
          <h3 className="text-xl font-black border-b pb-4 flex items-center gap-3" style={{ borderColor: `${currentTheme.primary}30` }}>
            <Shield className="w-6 h-6" style={{ color: currentTheme.accent }} />
            <span>قواعد وضوابط المسابقة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>عدد الجولات</label>
              <select
                value={totalRounds}
                onChange={e => setTotalRounds(Number(e.target.value))}
                className="w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none"
                style={{ backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.primary}40`, color: currentTheme.text }}
              >
                <option value={1}>جولة واحدة</option>
                <option value={3}>3 جولات (موصى به)</option>
                <option value={5}>5 جولات</option>
                <option value={10}>10 جولات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>الأخطاء المسموح بها لكل جولة</label>
              <select
                value={maxStrikes}
                onChange={e => setMaxStrikes(Number(e.target.value))}
                className="w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none"
                style={{ backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.primary}40`, color: currentTheme.text }}
              >
                <option value={1}>خطأ واحد (صعب)</option>
                <option value={3}>3 أخطاء (نظام البرنامج التقليدي)</option>
                <option value={5}>5 أخطاء (مريح)</option>
                <option value={100}>بدون تحديد أخطاء</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: currentTheme.subText }}>مدة الجولة (بالثواني)</label>
              <select
                value={roundDuration}
                onChange={e => setRoundDuration(Number(e.target.value))}
                className="w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none"
                style={{ backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.primary}40`, color: currentTheme.text }}
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
        <div 
          className="backdrop-blur-xl rounded-[2rem] border p-8 shadow-2xl space-y-6"
          style={{ backgroundColor: currentTheme.cardBg, borderColor: `${currentTheme.primary}40` }}
        >
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${currentTheme.primary}30` }}>
            <h3 className="text-xl font-black flex items-center gap-3">
              <Award className="w-6 h-6" style={{ color: currentTheme.accent }} />
              <span>اختر قوائم التحدي (سعودية 100%)</span>
            </h3>
            <span className="text-xs font-bold px-4 py-1.5 rounded-full border" style={{ backgroundColor: `${currentTheme.primary}30`, borderColor: `${currentTheme.primary}50`, color: currentTheme.subText }}>
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
                    isSelected ? 'scale-102 shadow-2xl' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${currentTheme.primary}25` : `${currentTheme.bg}`,
                    borderColor: isSelected ? currentTheme.primary : `${currentTheme.primary}30`
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-black px-3 py-1 rounded-lg border" style={{ backgroundColor: `${currentTheme.primary}40`, borderColor: `${currentTheme.primary}50`, color: currentTheme.subText }}>
                        {lst.category}
                      </span>
                      <h4 className="font-black text-lg mt-3">{lst.title}</h4>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'shadow-lg' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? currentTheme.primary : currentTheme.bg,
                      borderColor: currentTheme.primary,
                      color: isSelected ? '#FFFFFF' : 'transparent'
                    }}
                    >
                      <CheckCircle className="w-4 h-4 font-black" />
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: `${currentTheme.subText}CC` }}>{lst.description}</p>

                  <div className="text-[11px] pt-3 border-t flex justify-between items-center font-bold" style={{ borderColor: `${currentTheme.primary}30`, color: currentTheme.subText }}>
                    <span>{lst.answers.length} إجابة مرتبة</span>
                    <span style={{ color: currentTheme.accent }}>{lst.criteria}</span>
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
            className="px-14 py-5 rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-4 cursor-pointer border"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent}, ${currentTheme.primary})`,
              color: '#FFFFFF',
              borderColor: `${currentTheme.accent}50`
            }}
          >
            <Play className="w-7 h-7 fill-white" />
            <span>بدء المسابقة الآن</span>
          </button>
        </div>
      </form>
    </div>
  );
};
