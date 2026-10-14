import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import PanicDecoy from './components/PanicDecoy.jsx';
import CloakModal from './components/CloakModal.jsx';
import IframePlayer from './components/IframePlayer.jsx';
import JsonGameManager from './components/JsonGameManager.jsx';
import Calculator from './components/tools/Calculator.jsx';
import Scratchpad from './components/tools/Scratchpad.jsx';
import PomodoroTimer from './components/tools/PomodoroTimer.jsx';
import DoodleBoard from './components/tools/DoodleBoard.jsx';
import CodeExporter from './components/CodeExporter.jsx';
import defaultGamesData from './data/games.json';
import { sounds } from './utils/audio.js';
import {
  Code2,
  Play
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('games');
  const [games, setGames] = useState(() => {
    try {
      const saved = localStorage.getItem('unblock_games_json');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultGamesData;
  });

  const [selectedGame, setSelectedGame] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTool, setActiveTool] = useState('calc');
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [isCloakOpen, setIsCloakOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === 'Escape' || e.key === '`') {
        setIsPanicActive(prev => !prev);
        sounds.playClick();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleUpdateGames = (newGames) => {
    setGames(newGames);
    try {
      localStorage.setItem('unblock_games_json', JSON.stringify(newGames));
    } catch {}
  };

  const handleResetDefaults = () => {
    setGames(defaultGamesData);
    try {
      localStorage.removeItem('unblock_games_json');
    } catch {}
    sounds.playClear();
  };

  const handleToggleMute = () => {
    sounds.enabled = !sounds.enabled;
    setIsMuted(!sounds.enabled);
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    sounds.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['All', ...Array.from(new Set(games.map(g => g.category)))];

  const filteredGames = categoryFilter === 'All'
    ? games
    : games.filter(g => g.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Panic Decoy Mode (Google Docs / Wikipedia overlay) */}
      {isPanicActive && (
        <PanicDecoy onDismiss={() => setIsPanicActive(false)} initialType="docs" />
      )}

      {/* Tab Cloaker Modal */}
      <CloakModal isOpen={isCloakOpen} onClose={() => setIsCloakOpen(false)} />

      {/* Top Bar Contract (3 zones) */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={sec => {
          setActiveSection(sec);
          if (sec !== 'games') setSelectedGame(null);
        }}
        onTriggerPanic={() => setIsPanicActive(true)}
        onOpenCloakModal={() => setIsCloakOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* SECTION 1: GAMES */}
        {activeSection === 'games' && (
          <div>
            {selectedGame ? (
              <IframePlayer
                game={selectedGame}
                onBack={() => handleSelectGame(null)}
              />
            ) : (
              <div>
                {/* Hero Header */}
                <div className="text-center max-w-2xl mx-auto mb-8 pt-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
                    <span>JSON-Powered Catalog</span>
                    <span aria-hidden="true">·</span>
                    <span>100% Offline IFRAME Games</span>
                    <span aria-hidden="true">·</span>
                    <span>Pure JavaScript (No AI)</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3" style={{ textWrap: 'balance' }}>
                    HTML5 Unblocked Arcade
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    All games are configured as iframe records inside <code className="text-emerald-400 font-mono">games.json</code>. Play directly in-browser or pop out to an unblockable tab.
                  </p>
                </div>

                {/* Quick Info & Category Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-6">
                  {/* Category Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategoryFilter(cat);
                          sounds.playClick();
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                    <span className="font-mono text-white font-bold">{filteredGames.length}</span>
                    <span>games loaded from JSON</span>
                    <span aria-hidden="true">·</span>
                    <button
                      onClick={() => setActiveSection('json')}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" /> Edit JSON
                    </button>
                  </div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredGames.map(game => (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <div>
                        {/* Unboxed metadata (anti-pill rule) */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <span>{game.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400">{game.tag}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px] text-slate-500">iframe</span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                          {game.title}
                        </h3>

                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {game.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono text-[11px] truncate max-w-[180px]">
                          {game.iframeUrl}
                        </span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Play <Play className="w-3 h-3 fill-emerald-400" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: JSON GAME MANAGER */}
        {activeSection === 'json' && (
          <JsonGameManager
            games={games}
            onUpdateGames={handleUpdateGames}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {/* SECTION 3: TOOLS */}
        {activeSection === 'tools' && (
          <div>
            <div className="text-center max-w-xl mx-auto mb-6">
              <h1 className="text-2xl font-bold text-white mb-1.5">Offline Productivity & Study Tools</h1>
              <p className="text-xs text-slate-400">
                Lightweight tools saved completely in your browser. No accounts or tracking.
              </p>
            </div>

            {/* Sub-navigation tabs */}
            <div className="flex justify-center gap-1.5 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 inline-flex">
                <button
                  onClick={() => { setActiveTool('calc'); sounds.playClick(); }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTool === 'calc' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Calculator
                </button>
                <button
                  onClick={() => { setActiveTool('notes'); sounds.playClick(); }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTool === 'notes' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Notes Scratchpad
                </button>
                <button
                  onClick={() => { setActiveTool('pomodoro'); sounds.playClick(); }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTool === 'pomodoro' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Focus Timer
                </button>
                <button
                  onClick={() => { setActiveTool('doodle'); sounds.playClick(); }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTool === 'doodle' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Doodle Sketchbook
                </button>
              </div>
            </div>

            {/* Tool Render */}
            <div>
              {activeTool === 'calc' && <Calculator />}
              {activeTool === 'notes' && <Scratchpad />}
              {activeTool === 'pomodoro' && <PomodoroTimer />}
              {activeTool === 'doodle' && <DoodleBoard />}
            </div>
          </div>
        )}

        {/* SECTION 4: CODE & FILES */}
        {activeSection === 'files' && (
          <CodeExporter />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">UnblockHub</span>
            <span aria-hidden="true">·</span>
            <span>JSON Iframe Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Pure HTML5, CSS & JavaScript</span>
          </div>
          <div>
            Emergency Panic: Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300">Esc</kbd> anytime
          </div>
        </div>
      </footer>
    </div>
  );
}
