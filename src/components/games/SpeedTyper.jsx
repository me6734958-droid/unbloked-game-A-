import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../utils/audio.js';
import { RotateCcw, Timer, Zap, CheckCircle2 } from 'lucide-react';

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog near the quiet riverbank.",
  "Computer science is no more about computers than astronomy is about telescopes.",
  "Offline web applications provide privacy and reliability without depending on cloud servers.",
  "Practice makes permanent when learning touch typing techniques across all keys.",
  "Modern frontend development with JavaScript and Canvas allows building blazing fast games.",
  "Success is not final failure is not fatal it is the courage to continue that counts.",
  "Simple things should be simple complex things should be possible through clean modular code.",
  "Creativity is intelligence having fun while solving challenging engineering puzzles."
];

export default function SpeedTyper() {
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [targetText, setTargetText] = useState(() => SENTENCES[0]);
  const [userInput, setUserInput] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const inputRef = useRef(null);

  const resetTest = useCallback((newDuration = duration) => {
    const randomSentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    setTargetText(randomSentence);
    setUserInput('');
    setMistakes(0);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(newDuration);
    sounds.playClick();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [duration]);

  useEffect(() => {
    if (!isActive || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          setIsActive(false);
          sounds.playClear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isFinished]);

  const handleInputChange = (e) => {
    if (isFinished) return;
    const value = e.target.value;

    if (!isActive && value.length === 1) {
      setIsActive(true);
    }

    const lastCharIndex = value.length - 1;
    if (value[lastCharIndex] !== targetText[lastCharIndex]) {
      setMistakes(prev => prev + 1);
      sounds.playBeep(240, 'sine', 0.04, 0.1);
    } else {
      sounds.playBeep(520, 'sine', 0.02, 0.04);
    }

    setUserInput(value);

    if (value.length >= targetText.length) {
      sounds.playEat();
      const nextSentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
      setTargetText(prev => prev + ' ' + nextSentence);
    }
  };

  const elapsedSeconds = duration - timeLeft;
  const wordsTyped = userInput.trim().length / 5;
  const minutes = Math.max(0.01, elapsedSeconds / 60);
  const rawWpm = Math.round(wordsTyped / minutes);
  const totalTyped = userInput.length;
  const accuracy = totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - mistakes) / totalTyped) * 100)) : 100;

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto select-none">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> WPM
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {isActive || isFinished ? rawWpm : 0}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accuracy
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{accuracy}%</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-cyan-400" /> Time
            </span>
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{timeLeft}s</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
            {[15, 30, 60].map(s => (
              <button
                key={s}
                onClick={() => {
                  setDuration(s);
                  resetTest(s);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  duration === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>

          <button
            onClick={() => resetTest()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-4 shadow-xl cursor-text relative min-h-[140px]"
      >
        <p className="text-lg leading-relaxed font-mono tracking-wide">
          {targetText.split('').map((char, idx) => {
            let color = 'text-slate-500';
            let isCurrent = idx === userInput.length;

            if (idx < userInput.length) {
              color = userInput[idx] === char ? 'text-emerald-400' : 'text-red-400 bg-red-950/60 rounded-xs';
            }

            return (
              <span
                key={idx}
                className={`${color} ${isCurrent ? 'border-b-2 border-amber-400 animate-pulse text-white' : ''}`}
              >
                {char}
              </span>
            );
          })}
        </p>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={isFinished}
          className="opacity-0 absolute inset-0 cursor-default"
          autoFocus
        />
      </div>

      {isFinished && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-2xl mb-4">
          <h3 className="text-xl font-bold text-white mb-1">Typing Sprint Completed!</h3>
          <p className="text-xs text-slate-400 mb-4">Great focus session. Here are your final metrics:</p>
          <div className="grid grid-cols-3 gap-3 mb-5 max-w-sm mx-auto">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Speed</span>
              <span className="text-xl font-bold font-mono text-amber-400">{rawWpm} WPM</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{accuracy}%</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mistakes</span>
              <span className="text-xl font-bold font-mono text-red-400">{mistakes}</span>
            </div>
          </div>
          <button
            onClick={() => resetTest()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 fill-slate-950" /> Try Again
          </button>
        </div>
      )}

      <div className="text-xs text-slate-500 flex items-center gap-3">
        <span>Click text area and start typing</span>
        <span aria-hidden="true">·</span>
        <span>Green = Correct</span>
        <span aria-hidden="true">·</span>
        <span>Red = Miss</span>
      </div>
    </div>
  );
}
