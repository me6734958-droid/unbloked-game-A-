import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../../utils/audio.js';
import { RotateCcw, Play, Pause, Trophy, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

const TETROMINOES = [
  { shape: [[1, 1, 1, 1]], color: '#06b6d4' },
  { shape: [[1, 1], [1, 1]], color: '#eab308' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
];

function createEmptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

export default function TetroBlocks() {
  const [grid, setGrid] = useState(createEmptyGrid);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(() => {
    return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('tetro_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const checkCollision = useCallback((shape, x, y, currentGrid) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && currentGrid[newY][newX] !== null) return true;
        }
      }
    }
    return false;
  }, []);

  const spawnPiece = useCallback(() => {
    const piece = nextPiece;
    const newNext = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    setNextPiece(newNext);

    const startX = Math.floor((COLS - piece.shape[0].length) / 2);
    const startY = 0;

    if (checkCollision(piece.shape, startX, startY, grid)) {
      setIsGameOver(true);
      sounds.playGameOver();
      return null;
    }

    return {
      shape: piece.shape,
      color: piece.color,
      x: startX,
      y: startY,
    };
  }, [nextPiece, grid, checkCollision]);

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    const first = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    const startX = Math.floor((COLS - first.shape[0].length) / 2);
    setCurrentPiece({
      shape: first.shape,
      color: first.color,
      x: startX,
      y: 0,
    });
    setNextPiece(TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]);
    sounds.playClick();
  }, []);

  useEffect(() => {
    if (!currentPiece && !isGameOver) {
      const p = spawnPiece();
      if (p) setCurrentPiece(p);
    }
  }, [currentPiece, isGameOver, spawnPiece]);

  const rotateShape = (shape) => {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = [];
    for (let c = 0; c < cols; c++) {
      const newRow = [];
      for (let r = rows - 1; r >= 0; r--) {
        newRow.push(shape[r][c]);
      }
      rotated.push(newRow);
    }
    return rotated;
  };

  const lockPiece = useCallback((piece) => {
    const newGrid = grid.map(row => [...row]);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const gy = piece.y + r;
          const gx = piece.x + c;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            newGrid[gy][gx] = piece.color;
          }
        }
      }
    }

    let clearedCount = 0;
    const clearedGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) clearedCount++;
      return !isFull;
    });

    while (clearedGrid.length < ROWS) {
      clearedGrid.unshift(Array(COLS).fill(null));
    }

    if (clearedCount > 0) {
      sounds.playClear();
      const points = [0, 100, 300, 500, 800][clearedCount] * level;
      setScore(prev => {
        const nextScore = prev + points;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          try {
            localStorage.setItem('tetro_high_score', nextScore.toString());
          } catch {}
        }
        return nextScore;
      });
      setLines(prev => {
        const nextLines = prev + clearedCount;
        setLevel(Math.floor(nextLines / 10) + 1);
        return nextLines;
      });
    } else {
      sounds.playHit();
    }

    setGrid(clearedGrid);

    const p = spawnPiece();
    setCurrentPiece(p);
  }, [grid, level, highScore, spawnPiece]);

  const moveHorizontal = useCallback((dir) => {
    if (!currentPiece || isPaused || isGameOver) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x + dir, currentPiece.y, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dir } : null);
      sounds.playClick();
    }
  }, [currentPiece, isPaused, isGameOver, checkCollision, grid]);

  const dropOne = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      lockPiece(currentPiece);
    }
  }, [currentPiece, isPaused, isGameOver, checkCollision, grid, lockPiece]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;
    let targetY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, targetY + 1, grid)) {
      targetY++;
    }
    const finalPiece = { ...currentPiece, y: targetY };
    lockPiece(finalPiece);
  }, [currentPiece, isPaused, isGameOver, checkCollision, grid, lockPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;
    const rotated = rotateShape(currentPiece.shape);
    let kick = 0;
    if (checkCollision(rotated, currentPiece.x, currentPiece.y, grid)) {
      if (!checkCollision(rotated, currentPiece.x - 1, currentPiece.y, grid)) kick = -1;
      else if (!checkCollision(rotated, currentPiece.x + 1, currentPiece.y, grid)) kick = 1;
      else return;
    }
    setCurrentPiece(prev => prev ? { ...prev, shape: rotated, x: prev.x + kick } : null);
    sounds.playBeep(480, 'sine', 0.05, 0.1);
  }, [currentPiece, isPaused, isGameOver, checkCollision, grid]);

  useEffect(() => {
    if (isPaused || isGameOver || !currentPiece) return;

    const speedMs = Math.max(120, 800 - (level - 1) * 70);
    const interval = setInterval(() => {
      dropOne();
    }, speedMs);

    return () => clearInterval(interval);
  }, [isPaused, isGameOver, currentPiece, level, dropOne]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
        return;
      }

      if (isGameOver) {
        if (e.key === 'Enter') resetGame();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveHorizontal(-1);
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveHorizontal(1);
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') rotate();
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dropOne();
      else if (e.key === ' ') hardDrop();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, rotate, dropOne, hardDrop, isGameOver, resetGame]);

  const ghostY = React.useMemo(() => {
    if (!currentPiece) return 0;
    let y = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, y + 1, grid)) {
      y++;
    }
    return y;
  }, [currentPiece, checkCollision, grid]);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto select-none">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-5">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Score</span>
            <span className="text-2xl font-bold font-mono text-purple-400 tabular-nums">{score}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Lines</span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{lines}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best
            </span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{highScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="relative bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-2xl">
          <div
            className="grid grid-cols-10 gap-0.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800"
            style={{ width: '220px', height: '440px' }}
          >
            {Array.from({ length: ROWS }).map((_, r) =>
              Array.from({ length: COLS }).map((_, c) => {
                let cellColor = grid[r][c];
                let isGhost = false;

                if (currentPiece) {
                  const pr = r - currentPiece.y;
                  const pc = c - currentPiece.x;
                  if (
                    pr >= 0 &&
                    pr < currentPiece.shape.length &&
                    pc >= 0 &&
                    pc < currentPiece.shape[0].length &&
                    currentPiece.shape[pr][pc] !== 0
                  ) {
                    cellColor = currentPiece.color;
                  } else {
                    const gr = r - ghostY;
                    if (
                      gr >= 0 &&
                      gr < currentPiece.shape.length &&
                      pc >= 0 &&
                      pc < currentPiece.shape[0].length &&
                      currentPiece.shape[gr][pc] !== 0 &&
                      cellColor === null
                    ) {
                      isGhost = true;
                    }
                  }
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-full h-full rounded-xs transition-colors duration-75"
                    style={{
                      backgroundColor: cellColor
                        ? cellColor
                        : isGhost
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(15, 23, 42, 0.4)',
                      border: isGhost ? '1px dashed rgba(255, 255, 255, 0.25)' : undefined,
                    }}
                  />
                );
              })
            )}
          </div>

          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <h3 className="text-xl font-bold text-white mb-1">Game Over</h3>
              <p className="text-xs text-slate-400 mb-3">
                Score: <span className="text-purple-400 font-mono font-bold">{score}</span>
              </p>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Play Again
              </button>
            </div>
          )}

          {isPaused && !isGameOver && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4">
              <h3 className="text-lg font-bold text-slate-200 mb-2">Paused</h3>
              <button
                onClick={() => setIsPaused(false)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg"
              >
                Resume
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 w-28">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-2">
              Next Piece
            </span>
            <div className="grid grid-cols-4 gap-1 w-16 h-16 items-center justify-center mx-auto">
              {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 4 }).map((_, c) => {
                  const hasBlock =
                    nextPiece.shape[r] && nextPiece.shape[r][c] && nextPiece.shape[r][c] !== 0;
                  return (
                    <div
                      key={`next-${r}-${c}`}
                      className="w-3.5 h-3.5 rounded-xs"
                      style={{
                        backgroundColor: hasBlock ? nextPiece.color : 'transparent',
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
              Level
            </span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">{level}</span>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={rotate}
              className="py-2 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center gap-1"
            >
              <ArrowUp className="w-3.5 h-3.5" /> Rotate
            </button>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => moveHorizontal(-1)}
                className="py-2 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveHorizontal(1)}
                className="py-2 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={dropOne}
              className="py-2 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center gap-1"
            >
              <ArrowDown className="w-3.5 h-3.5" /> Soft Drop
            </button>
            <button
              onClick={hardDrop}
              className="py-2 bg-purple-700 hover:bg-purple-600 active:bg-purple-500 rounded-lg text-xs font-medium text-white shadow-sm"
            >
              Hard Drop
            </button>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500 mt-4 flex items-center gap-3">
        <span>Arrow Keys to Move/Rotate</span>
        <span aria-hidden="true">·</span>
        <span>Space to Hard Drop</span>
      </div>
    </div>
  );
}
