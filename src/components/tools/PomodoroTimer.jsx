import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../../utils/audio.js';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const getDuration = (m) => {
    switch (m) {
      case 'work': return 25 * 60;
      case 'shortBreak': return 5 * 60;
      case 'longBreak': return 15 * 60;
      default: return 25 * 60;
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getDuration(newMode));
    sounds.playClick();
  };

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
    sounds.playClick();
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          sounds.playClear();
          if (mode === 'work') {
            setSessionsCompleted(c => c + 1);
            setMode('shortBreak');
            return 5 * 60;
          } else {
            setMode('work');
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center select-none">
      {/* Mode Tabs */}
      <div className="bg-slate-950 p-1 rounded-xl border border-slate-800/80 inline-flex mb-8">
        <button
          onClick={() => handleModeChange('work')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            mode === 'work' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pomodoro (25m)
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            mode === 'shortBreak' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Short Break (5m)
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            mode === 'longBreak' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Long Break (15m)
        </button>
      </div>

      {/* Progress Ring & Countdown Display */}
      <div className="relative w-56 h-56 mx-auto mb-8 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="96"
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="112"
            cy="112"
            r="96"
            stroke={mode === 'work' ? '#10b981' : mode === 'shortBreak' ? '#06b6d4' : '#a855f7'}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 96}
            strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold font-mono text-white tracking-wider tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
            {mode === 'work' ? 'Focus Session' : 'Rest Break'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            setIsRunning(r => !r);
            sounds.playClick();
          }}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Start Focus'}
        </button>
        <button
          onClick={resetTimer}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1">
          <Bell className="w-3 h-3 text-slate-400" /> Audio Chime on Completion
        </span>
        <span aria-hidden="true">·</span>
        <span>Sessions Done: <strong className="text-white font-mono">{sessionsCompleted}</strong></span>
      </div>
    </div>
  );
}
