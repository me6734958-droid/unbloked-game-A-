import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../utils/audio.js';
import { RotateCcw, Play, Trophy } from 'lucide-react';

export default function SkyHopper() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('skyhopper_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [gameState, setGameState] = useState('READY');

  const stateRef = useRef({
    birdY: 180,
    velocity: 0,
    pipes: [],
    pipeSpawnTimer: 0,
  });

  const jump = useCallback(() => {
    if (gameState === 'READY') {
      setGameState('PLAYING');
      stateRef.current.velocity = -6.5;
      sounds.playJump();
    } else if (gameState === 'PLAYING') {
      stateRef.current.velocity = -6.5;
      sounds.playJump();
    } else if (gameState === 'OVER') {
      resetGame();
    }
  }, [gameState]);

  const resetGame = useCallback(() => {
    stateRef.current.birdY = 180;
    stateRef.current.velocity = 0;
    stateRef.current.pipes = [];
    stateRef.current.pipeSpawnTimer = 0;
    setScore(0);
    setGameState('READY');
    sounds.playClick();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    let animationId;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const s = stateRef.current;
      const gravity = 0.32;
      const pipeWidth = 48;
      const pipeGap = 110;
      const pipeSpeed = 2.4;
      const birdRadius = 12;

      if (gameState === 'PLAYING') {
        s.velocity += gravity;
        s.birdY += s.velocity;

        s.pipeSpawnTimer++;
        if (s.pipeSpawnTimer > 85) {
          s.pipeSpawnTimer = 0;
          const minPipeH = 50;
          const maxPipeH = height - pipeGap - minPipeH - 20;
          const topH = Math.floor(Math.random() * (maxPipeH - minPipeH)) + minPipeH;
          const bottomH = height - topH - pipeGap;

          s.pipes.push({
            x: width,
            topHeight: topH,
            bottomHeight: bottomH,
            passed: false,
          });
        }

        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i];
          p.x -= pipeSpeed;

          if (!p.passed && p.x + pipeWidth < 70) {
            p.passed = true;
            sounds.playEat();
            setScore(prev => {
              const newScore = prev + 1;
              if (newScore > highScore) {
                setHighScore(newScore);
                try {
                  localStorage.setItem('skyhopper_high_score', newScore.toString());
                } catch {}
              }
              return newScore;
            });
          }

          const birdX = 70;
          if (birdX + birdRadius > p.x && birdX - birdRadius < p.x + pipeWidth) {
            if (s.birdY - birdRadius < p.topHeight || s.birdY + birdRadius > height - p.bottomHeight) {
              setGameState('OVER');
              sounds.playGameOver();
            }
          }

          if (p.x + pipeWidth < -10) {
            s.pipes.splice(i, 1);
          }
        }

        if (s.birdY + birdRadius >= height - 10) {
          s.birdY = height - 10 - birdRadius;
          setGameState('OVER');
          sounds.playGameOver();
        } else if (s.birdY - birdRadius <= 0) {
          s.birdY = birdRadius;
          s.velocity = 0;
        }
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0c1b33');
      skyGrad.addColorStop(1, '#091322');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let star = 0; star < 15; star++) {
        const sx = (star * 47) % width;
        const sy = (star * 31) % (height / 2);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      s.pipes.forEach(p => {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(p.x, 0, pipeWidth, p.topHeight, [0, 0, 4, 4]);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.fillRect(p.x - 3, p.topHeight - 12, pipeWidth + 6, 12);

        const bottomY = height - p.bottomHeight;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(p.x, bottomY, pipeWidth, p.bottomHeight, [4, 4, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.fillRect(p.x - 3, bottomY, pipeWidth + 6, 12);
      });

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, height - 12, width, 12);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, height - 12, width, 2);

      const birdX = 70;
      ctx.save();
      ctx.translate(birdX, s.birdY);
      const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (s.velocity * 4 * Math.PI) / 180));
      ctx.rotate(angle);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, birdRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(-3, 2, 7, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(5.5, -4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(8, -1);
      ctx.lineTo(15, 2);
      ctx.lineTo(8, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, highScore]);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto select-none">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Score</span>
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{score}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best
            </span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{highScore}</span>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div
        onClick={jump}
        className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={460}
          className="w-[300px] h-[380px] sm:w-[360px] sm:h-[460px] block"
        />

        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Sky Hopper</h3>
            <p className="text-xs text-slate-300 mb-4">Tap screen or press Spacebar to flap wings</p>
            <div className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-lg flex items-center gap-2">
              <Play className="w-4 h-4 fill-slate-950" /> Tap to Flap
            </div>
          </div>
        )}

        {gameState === 'OVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">Crashed!</h3>
            <p className="text-xs text-slate-400 mb-4">
              Final Score: <span className="text-amber-400 font-mono font-bold text-base">{score}</span>
            </p>
            <button
              onClick={e => {
                e.stopPropagation();
                resetGame();
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 mt-4 flex items-center gap-3">
        <span>Click / Tap anywhere or Press Space</span>
        <span aria-hidden="true">·</span>
        <span>Dodge green pipes</span>
      </div>
    </div>
  );
}
