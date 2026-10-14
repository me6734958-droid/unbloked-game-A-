import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sounds } from '../../utils/audio.js';
import { RotateCcw, Undo2, Trophy } from 'lucide-react';

const SIZE = 4;

function getEmptyBoard() {
  return Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
}

function spawnRandom(board) {
  const emptyCoords = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) emptyCoords.push([r, c]);
    }
  }
  if (emptyCoords.length === 0) return board;

  const [row, col] = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const val = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = val;
  return newBoard;
}

function canMove(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
    }
  }
  return false;
}

export default function Game2048() {
  const [board, setBoard] = useState(() => {
    let b = getEmptyBoard();
    b = spawnRandom(b);
    b = spawnRandom(b);
    return b;
  });
  const [prevBoard, setPrevBoard] = useState(null);
  const [prevScore, setPrevScore] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('2048_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [hasWon, setHasWon] = useState(false);
  const [dismissWin, setDismissWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const touchStartRef = useRef(null);

  const initGame = useCallback(() => {
    let b = getEmptyBoard();
    b = spawnRandom(b);
    b = spawnRandom(b);
    setBoard(b);
    setPrevBoard(null);
    setScore(0);
    setHasWon(false);
    setDismissWin(false);
    setIsGameOver(false);
    sounds.playClick();
  }, []);

  const handleUndo = () => {
    if (prevBoard) {
      setBoard(prevBoard);
      setScore(prevScore);
      setPrevBoard(null);
      setIsGameOver(false);
      sounds.playClick();
    }
  };

  const slideAndMerge = useCallback((row) => {
    const filtered = row.filter(val => val !== 0);
    const newRow = [];
    let addedScore = 0;
    let i = 0;

    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        newRow.push(mergedVal);
        addedScore += mergedVal;
        if (mergedVal === 2048 && !hasWon && !dismissWin) {
          setHasWon(true);
        }
        i += 2;
      } else {
        newRow.push(filtered[i]);
        i += 1;
      }
    }

    while (newRow.length < SIZE) {
      newRow.push(0);
    }

    return { newRow, addedScore };
  }, [hasWon, dismissWin]);

  const move = useCallback((direction) => {
    if (isGameOver) return;

    let moved = false;
    let gainedScore = 0;
    const currentBoard = board.map(r => [...r]);
    let nextBoard = getEmptyBoard();

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < SIZE; r++) {
        const row = direction === 'LEFT' ? [...currentBoard[r]] : [...currentBoard[r]].reverse();
        const { newRow, addedScore } = slideAndMerge(row);
        gainedScore += addedScore;
        nextBoard[r] = direction === 'LEFT' ? newRow : newRow.reverse();
      }
    } else {
      for (let c = 0; c < SIZE; c++) {
        const col = [];
        for (let r = 0; r < SIZE; r++) col.push(currentBoard[r][c]);
        const prepared = direction === 'UP' ? col : col.reverse();
        const { newRow, addedScore } = slideAndMerge(prepared);
        gainedScore += addedScore;
        const finalCol = direction === 'UP' ? newRow : newRow.reverse();
        for (let r = 0; r < SIZE; r++) {
          nextBoard[r][c] = finalCol[r];
        }
      }
    }

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (nextBoard[r][c] !== currentBoard[r][c]) {
          moved = true;
          break;
        }
      }
    }

    if (moved) {
      setPrevBoard(currentBoard);
      setPrevScore(score);

      const boardWithSpawn = spawnRandom(nextBoard);
      const newScore = score + gainedScore;
      setBoard(boardWithSpawn);
      setScore(newScore);

      if (gainedScore > 0) {
        sounds.playEat();
      } else {
        sounds.playClick();
      }

      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('2048_high_score', newScore.toString());
        } catch {}
      }

      if (!canMove(boardWithSpawn)) {
        setIsGameOver(true);
        sounds.playGameOver();
      }
    }
  }, [board, isGameOver, score, highScore, slideAndMerge]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') move('LEFT');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') move('RIGHT');
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') move('UP');
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') move('DOWN');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 25) {
      if (absDx > absDy) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  const getTileStyles = (val) => {
    switch (val) {
      case 2:
        return 'bg-slate-800 text-slate-100 border border-slate-700/80';
      case 4:
        return 'bg-slate-700 text-slate-100 border border-slate-600/80';
      case 8:
        return 'bg-amber-600 text-white font-bold shadow-sm';
      case 16:
        return 'bg-amber-500 text-white font-bold shadow-sm';
      case 32:
        return 'bg-orange-500 text-white font-bold shadow-md';
      case 64:
        return 'bg-red-500 text-white font-bold shadow-md';
      case 128:
        return 'bg-emerald-500 text-white font-bold text-xl shadow-lg';
      case 256:
        return 'bg-emerald-600 text-white font-bold text-xl shadow-lg';
      case 512:
        return 'bg-teal-500 text-white font-bold text-xl shadow-lg';
      case 1024:
        return 'bg-cyan-500 text-white font-bold text-lg shadow-lg';
      case 2048:
        return 'bg-yellow-400 text-slate-950 font-extrabold text-lg shadow-xl ring-2 ring-yellow-300';
      default:
        return val > 2048
          ? 'bg-purple-600 text-white font-extrabold text-base'
          : 'bg-slate-900/60 text-transparent border border-slate-800/40';
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto select-none">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Score</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{score}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best
            </span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{highScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prevBoard && (
            <button
              onClick={handleUndo}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              title="Undo Move"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={initGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl touch-none"
      >
        <div className="grid grid-cols-4 gap-2.5 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center rounded-xl font-mono text-2xl transition-all duration-150 ${getTileStyles(
                  val
                )}`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {hasWon && !dismissWin && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-bold text-amber-400 mb-2">You Made 2048!</h3>
            <p className="text-xs text-slate-300 mb-4">You reached the legendary 2048 tile.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDismissWin(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg"
              >
                Keep Going
              </button>
              <button
                onClick={initGame}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">No Moves Left</h3>
            <p className="text-xs text-slate-400 mb-4">
              Final Score: <span className="text-emerald-400 font-mono font-bold">{score}</span>
            </p>
            <button
              onClick={initGame}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 mt-4 flex items-center gap-3">
        <span>Use Arrow Keys or Swipe</span>
        <span aria-hidden="true">·</span>
        <span>Join matching numbers to reach 2048</span>
      </div>
    </div>
  );
}
