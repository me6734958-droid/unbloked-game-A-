import React from 'react';
import { EyeOff, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/audio.js';

export default function Navbar({
  activeSection,
  onSelectSection,
  onTriggerPanic,
  onOpenCloakModal,
  isMuted,
  onToggleMute,
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => {
            onSelectSection('games');
            sounds.playClick();
          }}
          className="text-lg font-extrabold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Unblock<span className="text-emerald-400">Hub</span>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              onSelectSection('games');
              sounds.playClick();
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeSection === 'games' ? 'text-white font-semibold' : ''
            }`}
          >
            Arcade Games
          </button>
          <button
            onClick={() => {
              onSelectSection('json');
              sounds.playClick();
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeSection === 'json' ? 'text-white font-semibold' : ''
            }`}
          >
            games.json
          </button>
          <button
            onClick={() => {
              onSelectSection('tools');
              sounds.playClick();
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeSection === 'tools' ? 'text-white font-semibold' : ''
            }`}
          >
            Study Tools
          </button>
          <button
            onClick={() => {
              onSelectSection('files');
              sounds.playClick();
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeSection === 'files' ? 'text-white font-semibold' : ''
            }`}
          >
            HTML Files
          </button>
          <button
            onClick={() => {
              onOpenCloakModal();
              sounds.playClick();
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer"
          >
            Tab Cloak
          </button>
        </nav>

        {/* Zone 3: 1 primary action & discreet mute */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMute}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onTriggerPanic}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            title="Instant Google Docs decoy (Esc)"
          >
            <EyeOff className="w-3.5 h-3.5" /> Panic Key (Esc)
          </button>
        </div>
      </div>
    </header>
  );
}
