import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../utils/audio.js';
import { RotateCcw, Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

const GRID_SIZE = 20;

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState('UP');
  const [nextDirection, setNextDirection] = useState('UP');
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [goldenFood, setGoldenFood] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('snake_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(90);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(p => p.x === newFood.x && p.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    setNextDirection('UP');
    setFood(generateFood(initialSnake));
    setGoldenFood(null);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    sounds.playClick();
  }, [generateFood]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isGameOver) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && direction !== 'DOWN') {
        setNextDirection('UP');
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && direction !== 'UP') {
        setNextDirection('DOWN');
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && direction !== 'RIGHT') {
        setNextDirection('LEFT');
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && direction !== 'LEFT') {
        setNextDirection('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameOver, resetGame]);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const timer = setInterval(() => {
      setSnake(prevSnake => {
        setDirection(nextDirection);
        const head = { ...prevSnake[0] };

        if (nextDirection === 'UP') head.y -= 1;
        else if (nextDirection === 'DOWN') head.y += 1;
        else if (nextDirection === 'LEFT') head.x -= 1;
        else if (nextDirection === 'RIGHT') head.x += 1;

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          sounds.playGameOver();
          return prevSnake;
        }

        if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          setIsGameOver(true);
          sounds.playGameOver();
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        if (head.x === food.x && head.y === food.y) {
          sounds.playEat();
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            try {
              localStorage.setItem('snake_high_score', newScore.toString());
            } catch {}
          }
          setFood(generateFood(newSnake));

          if (Math.random() < 0.25 && !goldenFood) {
            setGoldenFood(generateFood(newSnake));
          }
        } else if (goldenFood && head.x === goldenFood.x && head.y === goldenFood.y) {
          sounds.playClear();
          const newScore = score + 50;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            try {
              localStorage.setItem('snake_high_score', newScore.toString());
            } catch {}
          }
          setGoldenFood(null);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [nextDirection, isGameOver, isPaused, food, goldenFood, score, highScore, speed, generateFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cellSize = size / GRID_SIZE;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (goldenFood) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(
        goldenFood.x * cellSize + cellSize / 2,
        goldenFood.y * cellSize + cellSize / 2,
        cellSize / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    snake.forEach((seg, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#10b981' : '#059669';
      
      const pad = 1.5;
      const x = seg.x * cellSize + pad;
      const y = seg.y * cellSize + pad;
      const w = cellSize - pad * 2;
      const h = cellSize - pad * 2;
      const radius = isHead ? 6 : 3;

      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.fill();

      if (isHead) {
        ctx.fillStyle = '#ffffff';
        const eyeRadius = 2;
        let eye1X = x + 4;
        let eye1Y = y + 4;
        let eye2X = x + w - 4;
        let eye2Y = y + 4;

        if (direction === 'DOWN') {
          eye1Y = y + h - 4;
          eye2Y = y + h - 4;
        } else if (direction === 'LEFT') {
          eye1X = x + 4;
          eye2X = x + 4;
          eye1Y = y + 4;
          eye2Y = y + h - 4;
        } else if (direction === 'RIGHT') {
          eye1X = x + w - 4;
          eye2X = x + w - 4;
          eye1Y = y + 4;
          eye2Y = y + h - 4;
        }

        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [snake, food, goldenFood, direction]);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
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
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
            <button
              onClick={() => setSpeed(120)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${speed === 120 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Easy
            </button>
            <button
              onClick={() => setSpeed(90)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${speed === 90 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setSpeed(60)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${speed === 60 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Fast
            </button>
          </div>

          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
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

      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] block"
        />

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">Game Over</h3>
            <p className="text-sm text-slate-400 mb-4">
              Final Score: <span className="text-emerald-400 font-mono font-bold">{score}</span>
            </p>
            <button
              onClick={resetGame}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}

        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6">
            <h3 className="text-xl font-bold text-slate-200 mb-2">Game Paused</h3>
            <button
              onClick={() => setIsPaused(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Resume
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 sm:hidden flex flex-col items-center gap-1.5">
        <button
          onClick={() => direction !== 'DOWN' && setNextDirection('UP')}
          className="w-12 h-12 bg-slate-800 active:bg-emerald-600 rounded-lg flex items-center justify-center text-white"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <div className="flex gap-6">
          <button
            onClick={() => direction !== 'RIGHT' && setNextDirection('LEFT')}
            className="w-12 h-12 bg-slate-800 active:bg-emerald-600 rounded-lg flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => direction !== 'UP' && setNextDirection('DOWN')}
            className="w-12 h-12 bg-slate-800 active:bg-emerald-600 rounded-lg flex items-center justify-center text-white"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <button
            onClick={() => direction !== 'LEFT' && setNextDirection('RIGHT')}
            className="w-12 h-12 bg-slate-800 active:bg-emerald-600 rounded-lg flex items-center justify-center text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-500 mt-4 flex items-center gap-3">
        <span>Use Arrow Keys or WASD</span>
        <span aria-hidden="true">·</span>
        <span>Space to Pause</span>
        <span aria-hidden="true">·</span>
        <span>Golden Apples = +50 pts</span>
      </div>
    </div>
  );
}
