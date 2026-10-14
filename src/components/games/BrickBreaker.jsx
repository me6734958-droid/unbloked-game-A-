import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../utils/audio.js';
import { RotateCcw, Play, Pause, Heart, Trophy } from 'lucide-react';

export default function BrickBreaker() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('breaker_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const stateRef = useRef({
    paddleX: 160,
    paddleWidth: 80,
    ballX: 200,
    ballY: 350,
    ballRadius: 6,
    ballSpeedX: 3.5,
    ballSpeedY: -3.5,
    bricks: [],
    leftPressed: false,
    rightPressed: false,
  });

  const createBricks = useCallback(() => {
    const bricks = [];
    const rows = 5;
    const cols = 8;
    const brickW = 42;
    const brickH = 16;
    const pad = 6;
    const offsetTop = 40;
    const offsetLeft = 10;

    const rowColors = [
      { color: '#ef4444', points: 50 },
      { color: '#f97316', points: 40 },
      { color: '#eab308', points: 30 },
      { color: '#10b981', points: 20 },
      { color: '#3b82f6', points: 10 },
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetLeft + c * (brickW + pad),
          y: offsetTop + r * (brickH + pad),
          w: brickW,
          h: brickH,
          color: rowColors[r].color,
          points: rowColors[r].points,
          intact: true,
        });
      }
    }
    return bricks;
  }, []);

  const resetGame = useCallback(() => {
    stateRef.current.paddleX = 160;
    stateRef.current.ballX = 200;
    stateRef.current.ballY = 340;
    stateRef.current.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 3.5;
    stateRef.current.ballSpeedY = -3.5;
    stateRef.current.bricks = createBricks();

    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setHasWon(false);
    setIsPlaying(true);
    sounds.playClick();
  }, [createBricks]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.leftPressed = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.rightPressed = true;
      }
      if (e.key === ' ') {
        if (!isPlaying && !isGameOver && !hasWon) {
          setIsPlaying(true);
        } else if (isGameOver || hasWon) {
          resetGame();
        } else {
          setIsPlaying(p => !p);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.leftPressed = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.rightPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver, hasWon, resetGame]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) * (canvas.width / rect.width);
    stateRef.current.paddleX = Math.max(0, Math.min(canvas.width - stateRef.current.paddleWidth, relativeX - stateRef.current.paddleWidth / 2));
  };

  const handleTouchMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    stateRef.current.paddleX = Math.max(0, Math.min(canvas.width - stateRef.current.paddleWidth, relativeX - stateRef.current.paddleWidth / 2));
  };

  useEffect(() => {
    if (stateRef.current.bricks.length === 0) {
      stateRef.current.bricks = createBricks();
    }

    let animationId;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      if (isPlaying && !isGameOver && !hasWon) {
        const paddleSpeed = 6;
        if (s.leftPressed) {
          s.paddleX = Math.max(0, s.paddleX - paddleSpeed);
        }
        if (s.rightPressed) {
          s.paddleX = Math.min(width - s.paddleWidth, s.paddleX + paddleSpeed);
        }

        s.ballX += s.ballSpeedX;
        s.ballY += s.ballSpeedY;

        if (s.ballX + s.ballRadius > width) {
          s.ballX = width - s.ballRadius;
          s.ballSpeedX = -Math.abs(s.ballSpeedX);
          sounds.playHit();
        } else if (s.ballX - s.ballRadius < 0) {
          s.ballX = s.ballRadius;
          s.ballSpeedX = Math.abs(s.ballSpeedX);
          sounds.playHit();
        }

        if (s.ballY - s.ballRadius < 0) {
          s.ballY = s.ballRadius;
          s.ballSpeedY = Math.abs(s.ballSpeedY);
          sounds.playHit();
        }

        const paddleY = height - 25;
        const paddleH = 12;

        if (
          s.ballY + s.ballRadius >= paddleY &&
          s.ballY - s.ballRadius <= paddleY + paddleH &&
          s.ballX >= s.paddleX &&
          s.ballX <= s.paddleX + s.paddleWidth
        ) {
          const hitOffset = (s.ballX - (s.paddleX + s.paddleWidth / 2)) / (s.paddleWidth / 2);
          const maxAngle = Math.PI / 3;
          const bounceAngle = hitOffset * maxAngle;
          const currentSpeed = Math.sqrt(s.ballSpeedX * s.ballSpeedX + s.ballSpeedY * s.ballSpeedY);

          s.ballSpeedX = currentSpeed * Math.sin(bounceAngle);
          s.ballSpeedY = -Math.abs(currentSpeed * Math.cos(bounceAngle));
          s.ballY = paddleY - s.ballRadius;
          sounds.playJump();
        }

        for (const b of s.bricks) {
          if (!b.intact) continue;

          if (
            s.ballX + s.ballRadius >= b.x &&
            s.ballX - s.ballRadius <= b.x + b.w &&
            s.ballY + s.ballRadius >= b.y &&
            s.ballY - s.ballRadius <= b.y + b.h
          ) {
            b.intact = false;
            s.ballSpeedY = -s.ballSpeedY;
            sounds.playEat();

            setScore(prev => {
              const newS = prev + b.points;
              if (newS > highScore) {
                setHighScore(newS);
                try {
                  localStorage.setItem('breaker_high_score', newS.toString());
                } catch {}
              }
              return newS;
            });

            const remaining = s.bricks.filter(brick => brick.intact).length;
            if (remaining === 0) {
              setHasWon(true);
              setIsPlaying(false);
              sounds.playClear();
            }
            break;
          }
        }

        if (s.ballY - s.ballRadius > height) {
          sounds.playGameOver();
          setLives(prev => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              setIsGameOver(true);
              setIsPlaying(false);
            } else {
              s.ballX = s.paddleX + s.paddleWidth / 2;
              s.ballY = height - 40;
              s.ballSpeedY = -3.5;
              s.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 3;
            }
            return nextLives;
          });
        }
      }

      // DRAW
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      s.bricks.forEach(b => {
        if (!b.intact) return;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 3);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(b.x, b.y, b.w, 3);
      });

      const paddleY = height - 25;
      const paddleH = 12;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(s.paddleX, paddleY, s.paddleWidth, paddleH, 6);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(s.paddleX + 4, paddleY + 2, s.paddleWidth - 8, 3);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballRadius + 3, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, isGameOver, hasWon, createBricks, highScore]);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto select-none">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Score</span>
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{score}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best
            </span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{highScore}</span>
          </div>
          <div className="flex items-center gap-1.5 pt-2">
            {[1, 2, 3].map(i => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i <= lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={400}
          height={450}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="w-[320px] h-[360px] sm:w-[400px] sm:h-[450px] block cursor-none"
        />

        {!isPlaying && !isGameOver && !hasWon && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Brick Breaker</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              Destroy all colored bricks. Move the paddle with your mouse or arrow keys.
            </p>
            <button
              onClick={() => setIsPlaying(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" /> Start Breakout
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">Game Over</h3>
            <p className="text-xs text-slate-400 mb-4">
              Final Score: <span className="text-cyan-400 font-mono font-bold">{score}</span>
            </p>
            <button
              onClick={resetGame}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-cyan-950/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {hasWon && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-bold text-emerald-400 mb-1">Stage Cleared!</h3>
            <p className="text-xs text-slate-300 mb-4">
              You cleared all bricks! Score: <span className="font-mono font-bold text-white">{score}</span>
            </p>
            <button
              onClick={resetGame}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 mt-4 flex items-center gap-3">
        <span>Mouse / Touch or Left / Right Arrows</span>
        <span aria-hidden="true">·</span>
        <span>Space to Pause/Start</span>
      </div>
    </div>
  );
}
