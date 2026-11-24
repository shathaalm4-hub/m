import React, { useState, useEffect } from 'react';
import { GameState, QuestionList, AnswerItem } from '../types';
import { checkAnswerMatch } from '../utils/fuzzy';
import { soundManager } from '../utils/sound';
import { 
  Search, Check, X, Eye, RotateCcw, Play, Pause, 
  Award, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ListOrdered,
  PlusCircle, MinusCircle, FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HostDashboardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  lists: QuestionList[];
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ gameState, setGameState, lists }) => {
  const [guessInput, setGuessInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    matched: boolean;
    answer?: AnswerItem;
    message: string;
  } | null>(null);

  const [searchFilter, setSearchFilter] = useState('');

  const currentList = gameState.currentList;
  const soundEnabled = gameState.settings.soundEnabled;

  useEffect(() => {
    let interval: any = null;
    if (gameState.isTimerRunning && gameState.timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setGameState(prev => {
          if (prev.timerSecondsLeft <= 1) {
            soundManager.playWrong(soundEnabled);
            return { ...prev, isTimerRunning: false, timerSecondsLeft: 0, status: 'round_paused' };
          }
          return { ...prev, timerSecondsLeft: prev.timerSecondsLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isTimerRunning, gameState.timerSecondsLeft, soundEnabled, setGameState]);

  if (!currentList) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-[#34202B] rounded-3xl border border-[#922D50]/40 my-16 shadow-2xl">
        <h2 className="text-3xl font-black text-[#FFFFFF] mb-4">لا توجد قائمة مفعلة حالياً</h2>
        <p className="text-[#F5DDE2]/70 text-lg mb-6">يرجى الانتقال لصفحة الإعداد وبدء المسابقة.</p>
      </div>
    );
  }

  const handleVerifyGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    soundManager.playClick(soundEnabled);

    const found = currentList.answers.find(ans => 
      checkAnswerMatch(guessInput, ans.text, ans.synonyms)
    );

    if (found) {
      if (gameState.revealedAnswerIds.includes(found.id)) {
        setVerificationResult({
          matched: true,
          answer: found,
          message: `الإجابة موجودة برقم ${found.rank}، ولكنها مكتشفة مسبقاً!`
        });
      } else {
        setVerificationResult({
          matched: true,
          answer: found,
          message: `إجابة صحيحة مطابقة! الترتيب #${found.rank} (${found.points} نقطة)`
        });
      }
    } else {
      setVerificationResult({
        matched: false,
        message: `الإجابة غير مطابقة لأي من عناصر القائمة الـ100.`
      });
    }
  };

  const acceptGuess = (answer: AnswerItem) => {
    if (gameState.revealedAnswerIds.includes(answer.id)) return;

    soundManager.playCorrect(soundEnabled);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });

    const activeTeamId = gameState.activeTeamId;
    const isTeam1 = activeTeamId === 'team1';
    const points = answer.points;

    setGameState(prev => {
      const newTeam1Score = isTeam1 ? prev.settings.team1.score + points : prev.settings.team1.score;
      const newTeam2Score = !isTeam1 ? prev.settings.team2.score + points : prev.settings.team2.score;
      const newRevealed = [...prev.revealedAnswerIds, answer.id];
      const shouldAutoSwitch = prev.settings.autoSwitchTeam ?? true;
      const nextActiveTeamId = shouldAutoSwitch ? (prev.activeTeamId === 'team1' ? 'team2' : 'team1') : prev.activeTeamId;

      const logEntry = {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        roundNumber: prev.settings.currentRoundIndex + 1,
        teamId: activeTeamId,
        action: 'إجابة صحيحة معتمدة',
        detail: `كشف #${answer.rank}: ${answer.text} (+${points} نقطة)`,
        points
      };

      return {
        ...prev,
        activeTeamId: nextActiveTeamId,
        revealedAnswerIds: newRevealed,
        settings: {
          ...prev.settings,
          team1: { ...prev.settings.team1, score: newTeam1Score },
          team2: { ...prev.settings.team2, score: newTeam2Score }
        },
        logs: [logEntry, ...prev.logs]
      };
    });

    setGuessInput('');
    setVerificationResult(null);
  };

  const recordWrongGuess = () => {
    soundManager.playWrong(soundEnabled);

    setGameState(prev => {
      const newStrikes = prev.currentStrikes + 1;
      const activeTeam = prev.activeTeamId === 'team1' ? prev.settings.team1.name : prev.settings.team2.name;
      const shouldAutoSwitch = prev.settings.autoSwitchTeam ?? true;
      const nextActiveTeamId = shouldAutoSwitch ? (prev.activeTeamId === 'team1' ? 'team2' : 'team1') : prev.activeTeamId;

      const logEntry = {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        roundNumber: prev.settings.currentRoundIndex + 1,
        teamId: prev.activeTeamId,
        action: 'إجابة خاطئة (ضربة)',
        detail: `تسجيل خطأ على فريق ${activeTeam} (${newStrikes}/${prev.settings.maxStrikes})`
      };

      const isRoundOver = newStrikes >= prev.settings.maxStrikes;

      return {
        ...prev,
        activeTeamId: nextActiveTeamId,
        currentStrikes: newStrikes,
        status: isRoundOver ? 'round_ended' : prev.status,
        logs: [logEntry, ...prev.logs]
      };
    });
    setGuessInput('');
    setVerificationResult(null);
  };

  const revealAnswerDirectly = (ans: AnswerItem) => {
    if (gameState.revealedAnswerIds.includes(ans.id)) return;
    soundManager.playCorrect(soundEnabled);

    setGameState(prev => ({
      ...prev,
      revealedAnswerIds: [...prev.revealedAnswerIds, ans.id],
      logs: [{
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        roundNumber: prev.settings.currentRoundIndex + 1,
        action: 'كشف مباشر من المقدم',
        detail: `كشف الإجابة #${ans.rank}: ${ans.text}`
      }, ...prev.logs]
    }));
  };

  const switchActiveTeam = () => {
    soundManager.playClick(soundEnabled);
    setGameState(prev => ({
      ...prev,
      activeTeamId: prev.activeTeamId === 'team1' ? 'team2' : 'team1'
    }));
  };

  const toggleTimer = () => {
    soundManager.playClick(soundEnabled);
    setGameState(prev => ({ ...prev, isTimerRunning: !prev.isTimerRunning }));
  };

  const resetTimer = () => {
    soundManager.playClick(soundEnabled);
    setGameState(prev => ({
      ...prev,
      isTimerRunning: false,
      timerSecondsLeft: prev.settings.roundDurationSeconds
    }));
  };

  const revealAllAnswers = () => {
    soundManager.playCorrect(soundEnabled);
    const allIds = currentList.answers.map(a => a.id);
    setGameState(prev => ({
      ...prev,
      revealedAnswerIds: allIds,
      status: 'round_ended',
      logs: [{
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        roundNumber: prev.settings.currentRoundIndex + 1,
        action: 'كشف جميع الإجابات',
        detail: 'تم كشف جميع إجابات الجولة'
      }, ...prev.logs]
    }));
  };

  const nextRound = () => {
    soundManager.playClick(soundEnabled);
    const nextIndex = gameState.settings.currentRoundIndex + 1;
    if (nextIndex >= gameState.settings.totalRounds || nextIndex >= lists.length) {
      setGameState(prev => ({ ...prev, status: 'game_over' }));
      return;
    }

    const nextList = lists[nextIndex] || lists[0];
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      currentList: nextList,
      revealedAnswerIds: [],
      currentStrikes: 0,
      timerSecondsLeft: prev.settings.roundDurationSeconds,
      isTimerRunning: false,
      settings: {
        ...prev.settings,
        currentRoundIndex: nextIndex
      },
      logs: [{
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        roundNumber: nextIndex + 1,
        action: 'بدء جولة جديدة',
        detail: `انتقال للجولة ${nextIndex + 1}: ${nextList.title}`
      }, ...prev.logs]
    }));
  };

  const manualAdjustScore = (teamKey: 'team1' | 'team2', amount: number) => {
    soundManager.playClick(soundEnabled);
    setGameState(prev => {
      const team = prev.settings[teamKey];
      const newScore = Math.max(0, team.score + amount);
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [teamKey]: { ...team, score: newScore }
        },
        logs: [{
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString('ar-SA'),
          roundNumber: prev.settings.currentRoundIndex + 1,
          action: 'تعديل يدوي للنقاط',
          detail: `تعديل نقاط ${team.name} بمقدار ${amount > 0 ? `+${amount}` : amount}`
        }, ...prev.logs]
      };
    });
  };

  const filteredAnswers = currentList.answers.filter(a =>
    a.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.rank.toString().includes(searchFilter)
  );

  const revealedCount = gameState.revealedAnswerIds.length;
  const activeTeam = gameState.activeTeamId === 'team1' ? gameState.settings.team1 : gameState.settings.team2;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 pb-24">
      {/* Top Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Round & List Info */}
        <div className="bg-[#34202B] backdrop-blur-2xl rounded-[2rem] border border-[#922D50]/40 p-6 shadow-2xl lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#922D50]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black px-4 py-1.5 rounded-full bg-[#922D50]/30 text-[#F5DDE2] border border-[#922D50]/50">
                الجولة {gameState.settings.currentRoundIndex + 1} من {gameState.settings.totalRounds}
              </span>
              <span className="text-xs text-[#F5DDE2]/70 font-bold">
                المكتشف: <strong className="text-[#D99AAA] text-sm">{revealedCount}</strong> / 100
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#FFFFFF]">{currentList.title}</h2>
            <p className="text-xs text-[#F5DDE2]/80 mt-1 leading-relaxed">{currentList.description}</p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#922D50]/30 flex items-center justify-between text-xs font-bold text-[#F5DDE2]/80">
            <span>المعيار: <strong className="text-[#FFFFFF]">{currentList.criteria}</strong></span>
            <span className="text-[#D99AAA]">النقاط = ترتيب الإجابة</span>
          </div>
        </div>

        {/* Active Team Card */}
        <div 
          className="bg-[#34202B] backdrop-blur-2xl rounded-[2rem] border-2 p-6 shadow-2xl flex flex-col justify-between transition-all"
          style={{ borderColor: activeTeam.color || '#922D50' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5DDE2]/70">الدور الحالي</span>
            <button
              onClick={switchActiveTeam}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-[#922D50]/30 hover:bg-[#922D50] text-[#FFFFFF] font-bold border border-[#922D50]/50 transition-all cursor-pointer shadow"
            >
              تبديل الدور 🔄
            </button>
          </div>
          <div className="flex items-center gap-4 my-3">
            <span className="text-4xl p-2 rounded-2xl bg-[#34202B] border border-[#922D50]/40">{activeTeam.avatar}</span>
            <div>
              <h3 className="text-[#FFFFFF] font-black text-lg">{activeTeam.name}</h3>
              <p className="text-2xl font-black text-[#D99AAA]" style={{ color: activeTeam.color }}>{activeTeam.score} نقطة</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5DDE2] bg-[#922D50]/20 px-3.5 py-1.5 rounded-xl border border-[#922D50]/40">
            <ShieldAlert className="w-4 h-4 text-[#D99AAA]" />
            <span>الأخطاء (الضربات): {gameState.currentStrikes} / {gameState.settings.maxStrikes}</span>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="bg-[#34202B] backdrop-blur-2xl rounded-[2rem] border border-[#922D50]/40 p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5DDE2]/70">المؤقت الزمني</span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`p-2 rounded-xl border text-xs font-bold shadow ${
                  gameState.isTimerRunning ? 'bg-[#922D50] text-[#FFFFFF] border-[#922D50]' : 'bg-[#34202B] text-[#F5DDE2] border-[#922D50]/40'
                }`}
              >
                {gameState.isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-2 rounded-xl bg-[#34202B] text-[#F5DDE2] border border-[#922D50]/40 hover:text-[#FFFFFF]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-center my-3">
            <span className={`text-4xl font-black ${gameState.timerSecondsLeft <= 10 ? 'text-[#D99AAA] animate-pulse' : 'text-[#FFFFFF]'}`}>
              {Math.floor(gameState.timerSecondsLeft / 60)}:{(gameState.timerSecondsLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={revealAllAnswers}
              className="flex-1 py-2 rounded-xl bg-[#922D50]/20 hover:bg-[#922D50]/40 text-[#F5DDE2] text-xs font-black border border-[#922D50]/40 transition-all shadow"
            >
              كشف الكل
            </button>
            <button
              onClick={nextRound}
              className="flex-1 py-2 rounded-xl bg-[#922D50] hover:bg-[#922D50]/90 text-[#FFFFFF] text-xs font-black transition-all shadow-lg shadow-[#922D50]/30"
            >
              التالية ⏩
            </button>
          </div>
        </div>
      </div>

      {/* Verification & Guess Input Panel */}
      <div className="bg-[#34202B] backdrop-blur-2xl rounded-[2rem] border-2 border-[#922D50]/50 p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[#922D50]/30 pb-4">
          <Sparkles className="w-6 h-6 text-[#D99AAA]" />
          <h3 className="text-lg font-black text-[#FFFFFF]">لوحة التحقق واعتماد الإجابات (المقدم)</h3>
        </div>

        <form onSubmit={handleVerifyGuess} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-4 w-5 h-5 text-[#F5DDE2]/60" />
            <input
              type="text"
              value={guessInput}
              onChange={e => setGuessInput(e.target.value)}
              placeholder="اكتب إجابة الفريق هنا للبحث والتحقق الفوري..."
              className="w-full bg-[#34202B]/60 border border-[#922D50]/40 rounded-2xl pr-13 pl-5 py-4 text-[#FFFFFF] font-bold text-base focus:outline-none focus:border-[#D99AAA] shadow-inner"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl bg-[#922D50] hover:bg-[#922D50]/90 text-[#FFFFFF] font-black text-base shadow-xl shadow-[#922D50]/30 transition-all cursor-pointer"
            >
              تحقق من الإجابة
            </button>
            <button
              type="button"
              onClick={recordWrongGuess}
              className="px-8 py-4 rounded-2xl bg-[#922D50]/20 hover:bg-[#922D50] text-[#F5DDE2] hover:text-[#FFFFFF] font-black text-base border border-[#922D50]/50 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <X className="w-5 h-5" />
              <span>خطأ (ضربة)</span>
            </button>
          </div>
        </form>

        {verificationResult && (
          <div className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn ${
            verificationResult.matched 
              ? 'bg-[#922D50]/30 border-[#922D50] text-[#FFFFFF] shadow-xl'
              : 'bg-[#34202B] border-[#922D50]/40 text-[#F5DDE2] shadow-xl'
          }`}>
            <div className="flex items-center gap-4">
              {verificationResult.matched ? <CheckCircle2 className="w-7 h-7 text-[#D99AAA] shrink-0" /> : <AlertTriangle className="w-7 h-7 text-[#922D50] shrink-0" />}
              <div>
                <p className="font-black text-base">{verificationResult.message}</p>
                {verificationResult.answer && (
                  <p className="text-xs opacity-90 mt-1 font-medium text-[#F5DDE2]">
                    النص الرسمي: <strong className="text-[#FFFFFF]">{verificationResult.answer.text}</strong> (الترتيب: #{verificationResult.answer.rank})
                  </p>
                )}
              </div>
            </div>

            {verificationResult.matched && verificationResult.answer && (
              <div>
                {gameState.revealedAnswerIds.includes(verificationResult.answer.id) ? (
                  <span className="text-xs font-black bg-[#922D50]/40 text-[#F5DDE2] px-4 py-2 rounded-xl border border-[#922D50]/60">
                    تم كشفها مسبقاً
                  </span>
                ) : (
                  <button
                    onClick={() => acceptGuess(verificationResult.answer!)}
                    className="px-6 py-3 rounded-xl bg-[#922D50] hover:bg-[#922D50]/90 text-[#FFFFFF] font-black text-sm shadow-xl shadow-[#922D50]/40 transition-all flex items-center gap-2 cursor-pointer border border-[#D99AAA]/40"
                  >
                    <Check className="w-5 h-5" />
                    <span>اعتماد واحتساب ({verificationResult.answer.points} نقطة)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Host Full 100 Answers Grid */}
      <div className="bg-[#34202B] backdrop-blur-2xl rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#922D50]/30 pb-6">
          <div className="flex items-center gap-3">
            <ListOrdered className="w-6 h-6 text-[#D99AAA]" />
            <h3 className="text-lg font-black text-[#FFFFFF]">جميع الإجابات الـ100 (لوحة المقدم السرية)</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="ابحث في إجابات القائمة..."
              className="bg-[#34202B]/60 border border-[#922D50]/40 rounded-xl px-4 py-2.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#D99AAA] shadow-inner"
            />
            <span className="text-xs text-[#F5DDE2]/70 font-bold">إجمالي: {filteredAnswers.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[500px] overflow-y-auto p-1">
          {filteredAnswers.map(ans => {
            const isRevealed = gameState.revealedAnswerIds.includes(ans.id);
            return (
              <div
                key={ans.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                  isRevealed
                    ? 'bg-[#922D50]/30 border-[#922D50] text-[#FFFFFF] shadow-lg'
                    : 'bg-[#34202B]/60 border-[#922D50]/30 hover:border-[#922D50]/60 text-[#F5DDE2]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${isRevealed ? 'bg-[#922D50] text-[#FFFFFF]' : 'bg-[#34202B] border border-[#922D50]/40 text-[#D99AAA]'}`}>
                    #{ans.rank}
                  </span>
                  <span className="text-xs font-bold truncate text-[#FFFFFF]" title={ans.text}>{ans.text}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-[#D99AAA]">{ans.points}ن</span>
                  {isRevealed ? (
                    <span className="text-[10px] bg-[#922D50]/40 text-[#F5DDE2] px-2.5 py-1 rounded-lg font-black">مكشوفة</span>
                  ) : (
                    <button
                      onClick={() => revealAnswerDirectly(ans)}
                      title="كشف مباشر"
                      className="p-1.5 rounded-xl bg-[#34202B] hover:bg-[#922D50] hover:text-[#FFFFFF] text-[#F5DDE2] transition-all shadow border border-[#922D50]/30"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Score Adjustments & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Score Adjustments */}
        <div className="bg-[#34202B] backdrop-blur-2xl rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-black text-[#FFFFFF] border-b border-[#922D50]/30 pb-4">تعديل النقاط اليدوي</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#34202B]/60 p-5 rounded-2xl border border-[#922D50]/30 shadow-inner">
              <div className="flex items-center gap-4">
                <span className="text-3xl p-2 rounded-2xl bg-[#34202B] border border-[#922D50]/40">{gameState.settings.team1.avatar}</span>
                <div>
                  <h4 className="text-[#FFFFFF] font-black text-sm">{gameState.settings.team1.name}</h4>
                  <p className="text-[#D99AAA] font-black text-lg">{gameState.settings.team1.score} نقطة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => manualAdjustScore('team1', -10)} className="p-2.5 rounded-xl bg-[#922D50]/20 text-[#F5DDE2] hover:bg-[#922D50] hover:text-[#FFFFFF] transition-all shadow border border-[#922D50]/40"><MinusCircle className="w-5 h-5" /></button>
                <button onClick={() => manualAdjustScore('team1', 10)} className="p-2.5 rounded-xl bg-[#922D50]/40 text-[#FFFFFF] hover:bg-[#922D50] transition-all shadow border border-[#922D50]/60"><PlusCircle className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#34202B]/60 p-5 rounded-2xl border border-[#922D50]/30 shadow-inner">
              <div className="flex items-center gap-4">
                <span className="text-3xl p-2 rounded-2xl bg-[#34202B] border border-[#922D50]/40">{gameState.settings.team2.avatar}</span>
                <div>
                  <h4 className="text-[#FFFFFF] font-black text-sm">{gameState.settings.team2.name}</h4>
                  <p className="text-[#D99AAA] font-black text-lg">{gameState.settings.team2.score} نقطة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => manualAdjustScore('team2', -10)} className="p-2.5 rounded-xl bg-[#922D50]/20 text-[#F5DDE2] hover:bg-[#922D50] hover:text-[#FFFFFF] transition-all shadow border border-[#922D50]/40"><MinusCircle className="w-5 h-5" /></button>
                <button onClick={() => manualAdjustScore('team2', 10)} className="p-2.5 rounded-xl bg-[#922D50]/40 text-[#FFFFFF] hover:bg-[#922D50] transition-all shadow border border-[#922D50]/60"><PlusCircle className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-[#34202B] backdrop-blur-2xl rounded-[2rem] border border-[#922D50]/40 p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-black text-[#FFFFFF] border-b border-[#922D50]/30 pb-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#D99AAA]" />
            <span>سجل القرارات والعمليات</span>
          </h3>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {gameState.logs.map(log => (
              <div key={log.id} className="bg-[#34202B]/60 p-3.5 rounded-2xl border border-[#922D50]/30 text-xs space-y-1 shadow-inner">
                <div className="flex items-center justify-between text-[#F5DDE2]/70">
                  <span className="font-bold text-[#D99AAA]">{log.action}</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-[#FFFFFF] font-bold">{log.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
