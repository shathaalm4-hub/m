import React, { useState, useEffect, useRef } from 'react';
import { GameState, QuestionList } from './types';
import { INITIAL_SAUDI_LISTS } from './data/saudiLists';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { HostDashboard } from './components/HostDashboard';
import { AudienceDisplay } from './components/AudienceDisplay';
import { ListManager } from './components/ListManager';
import { ResultsScreen } from './components/ResultsScreen';

const BROADCAST_CHANNEL_NAME = 'saudi_100_game_sync_channel';

export default function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'host' | 'display' | 'manager' | 'results'>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'display') {
      return 'display';
    }
    return 'setup';
  });

  const [lists, setLists] = useState<QuestionList[]>(() => {
    const saved = localStorage.getItem('saudi_100_lists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* fallback */ }
    }
    return INITIAL_SAUDI_LISTS;
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('saudi_100_gamestate');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.settings && parsed.currentList) return parsed;
      } catch { /* fallback */ }
    }
    return {
      status: 'setup',
      settings: {
        team1: { id: 'team1', name: 'صقور السعودية', color: '#922D50', avatar: '🦅', score: 0, strikes: 0 },
        team2: { id: 'team2', name: 'فرسان نجد', color: '#D99AAA', avatar: '⭐', score: 0, strikes: 0 },
        totalRounds: 3,
        currentRoundIndex: 0,
        maxStrikes: 3,
        roundDurationSeconds: 60,
        gameMode: 'normal',
        soundEnabled: true,
        selectedListIds: [INITIAL_SAUDI_LISTS[0].id]
      },
      currentList: INITIAL_SAUDI_LISTS[0],
      activeTeamId: 'team1',
      revealedAnswerIds: [],
      currentStrikes: 0,
      timerSecondsLeft: 60,
      isTimerRunning: false,
      logs: [],
      historyRounds: []
    };
  });

  const channelRef = useRef<BroadcastChannel | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Sync hash changes with currentView
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'display') {
        setCurrentView('display');
      } else if (currentView === 'display') {
        setCurrentView('setup');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const changeView = (view: 'setup' | 'host' | 'display' | 'manager' | 'results') => {
    setCurrentView(view);
    if (view === 'display') {
      window.location.hash = '#display';
    } else {
      window.location.hash = '';
    }
  };

  // Initialize Server-Sent Events (SSE), BroadcastChannel, and Polling for 0ms real-time synchronization
  useEffect(() => {
    if (window.BroadcastChannel) {
      channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        if (event.data && event.data.type === 'GAME_STATE_UPDATE') {
          if (event.data.state) {
            setGameState(event.data.state);
          }
        }
      };
    }

    // Connect to SSE stream for instant push updates
    try {
      const es = new EventSource('/api/events');
      eventSourceRef.current = es;
      es.onmessage = (event) => {
        if (event.data) {
          try {
            const parsedState = JSON.parse(event.data);
            if (parsedState && parsedState.settings) {
              setGameState(parsedState);
            }
          } catch {
            // ignore
          }
        }
      };
    } catch {
      // fallback
    }

    // Polling fallback every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const remoteState = await res.json();
          if (remoteState && remoteState.settings) {
            setGameState(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(remoteState)) {
                return remoteState;
              }
              return prev;
            });
          }
        }
      } catch {
        // ignore
      }
    }, 2000);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      clearInterval(pollInterval);
    };
  }, []);

  const updateGameState = (updater: GameState | ((prev: GameState) => GameState)) => {
    setGameState(prev => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      
      try {
        localStorage.setItem('saudi_100_gamestate', JSON.stringify(nextState));
      } catch {
        // ignore
      }

      if (channelRef.current) {
        try {
          channelRef.current.postMessage({
            type: 'GAME_STATE_UPDATE',
            state: nextState
          });
        } catch {
          // ignore
        }
      }

      // Push to server state API (triggers SSE broadcast to all connected devices instantly)
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState)
      }).catch(() => {});

      return nextState;
    });
  };

  useEffect(() => {
    if (gameState.status === 'game_over') {
      changeView('results');
    }
  }, [gameState.status]);

  useEffect(() => {
    try {
      localStorage.setItem('saudi_100_lists', JSON.stringify(lists));
    } catch {
      // ignore
    }
  }, [lists]);

  return (
    <div className="min-h-screen bg-[#34202B] text-[#FFFFFF] font-sans selection:bg-[#922D50] selection:text-[#FFFFFF]">
      {currentView !== 'display' && (
        <Header
          currentView={currentView}
          setCurrentView={changeView}
          gameState={gameState}
          setGameState={updateGameState}
        />
      )}

      <main>
        {currentView === 'setup' && (
          <SetupScreen
            gameState={gameState}
            setGameState={updateGameState}
            lists={lists}
            onStartGame={() => changeView('host')}
          />
        )}

        {currentView === 'host' && (
          <HostDashboard
            gameState={gameState}
            setGameState={updateGameState}
            lists={lists}
          />
        )}

        {currentView === 'display' && (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => changeView('host')}
                className="px-4 py-2 rounded-xl bg-[#34202B]/80 backdrop-blur-md border border-[#922D50]/50 text-[#F5DDE2] font-bold text-xs shadow-lg hover:bg-[#922D50] transition-all cursor-pointer"
              >
                ← العودة لوحة المقدم
              </button>
            </div>
            <AudienceDisplay gameState={gameState} />
          </div>
        )}

        {currentView === 'manager' && (
          <ListManager
            lists={lists}
            setLists={setLists}
            soundEnabled={gameState.settings.soundEnabled}
          />
        )}

        {currentView === 'results' && (
          <ResultsScreen
            gameState={gameState}
            setGameState={updateGameState}
            onResetToSetup={() => {
              changeView('setup');
              updateGameState(prev => ({ ...prev, status: 'setup' }));
            }}
          />
        )}
      </main>
    </div>
  );
}
