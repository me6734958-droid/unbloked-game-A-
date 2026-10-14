import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../../utils/audio.js';
import { RotateCcw, Bot, User } from 'lucide-react';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(board) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}

function minimax(board, depth, isMaximizing) {
  const { winner } = checkWinner(board);
  if (winner === 'O') return { score: 10 - depth };
  if (winner === 'X') return { score: depth - 10 };
  if (board.every(cell => cell !== null)) return { score: 0 };

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const result = minimax(board, depth + 1, false);
        board[i] = null;
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = i;
        }
      }
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const result = minimax(board, depth + 1, true);
        board[i] = null;
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = i;
        }
      }
    }
    return { score: bestScore, move: bestMove };
  }
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [vsBot, setVsBot] = useState(true);
  const [difficulty, setDifficulty] = useState('unbeatable');
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt_stats');
      return saved ? JSON.parse(saved) : { xWins: 0, oWins: 0, ties: 0 };
    } catch {
      return { xWins: 0, oWins: 0, ties: 0 };
    }
  });

  const { winner, line: winLine } = checkWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    sounds.playClick();
  }, []);

  useEffect(() => {
    if (winner) {
      sounds.playClear();
      setStats(prev => {
        const next = {
          ...prev,
          xWins: winner === 'X' ? prev.xWins + 1 : prev.xWins,
          oWins: winner === 'O' ? prev.oWins + 1 : prev.oWins,
        };
        try {
          localStorage.setItem('ttt_stats', JSON.stringify(next));
        } catch {}
        return next;
      });
    } else if (isDraw) {
      sounds.playGameOver();
      setStats(prev => {
        const next = { ...prev, ties: prev.ties + 1 };
        try {
          localStorage.setItem('ttt_stats', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [winner, isDraw]);

  useEffect(() => {
    if (vsBot && turn === 'O' && !winner && !isDraw) {
      const timer = setTimeout(() => {
        let chosenMove = -1;

        if (difficulty === 'easy' && Math.random() < 0.6) {
          const empty = board.map((val, idx) => (val === null ? idx : null)).filter(v => v !== null);
          if (empty.length > 0) {
            chosenMove = empty[Math.floor(Math.random() * empty.length)];
          }
        } else {
          const clone = [...board];
          const result = minimax(clone, 0, true);
          if (result.move !== undefined && result.move !== -1) {
            chosenMove = result.move;
          }
        }

        if (chosenMove !== -1) {
          setBoard(prev => {
            const next = [...prev];
            next[chosenMove] = 'O';
            return next;
          });
          sounds.playBeep(450, 'triangle', 0.05, 0.15);
          setTurn('X');
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [turn, vsBot, board, winner, isDraw, difficulty]);

  const handleCellClick = (index) => {
    if (board[index] || winner || isDraw) return;
    if (vsBot && turn === 'O') return;

    sounds.playBeep(turn === 'X' ? 620 : 450, 'triangle', 0.05, 0.15);

    const next = [...board];
    next[index] = turn;
    setBoard(next);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto select-none">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Player X</span>
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{stats.xWins}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Ties</span>
            <span className="text-2xl font-bold font-mono text-slate-400 tabular-nums">{stats.ties}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">
              {vsBot ? 'Bot (O)' : 'Player O'}
            </span>
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{stats.oWins}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVsBot(v => !v)}
            className={`p-2 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 ${
              vsBot ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-800/80' : 'bg-slate-800 text-slate-300'
            }`}
            title="Toggle Bot or 2-Player"
          >
            {vsBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            {vsBot ? 'vs Bot' : '2-Player'}
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

      {vsBot && (
        <div className="w-full flex justify-end mb-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
            <button
              onClick={() => setDifficulty('easy')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                difficulty === 'easy' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficulty('unbeatable')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                difficulty === 'unbeatable' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unbeatable AI
            </button>
          </div>
        </div>
      )}

      <div className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-3 gap-2.5 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
          {board.map((cell, idx) => {
            const isWinningCell = winLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || !!winner || isDraw}
                className={`flex items-center justify-center rounded-xl font-mono text-4xl sm:text-5xl font-black transition-all ${
                  isWinningCell
                    ? 'bg-emerald-900/60 border-2 border-emerald-500 text-emerald-300'
                    : cell
                    ? 'bg-slate-800/80 border border-slate-700/80'
                    : 'bg-slate-950/70 border border-slate-800/50 hover:bg-slate-800/50 cursor-pointer'
                }`}
              >
                {cell === 'X' && <span className="text-cyan-400">X</span>}
                {cell === 'O' && <span className="text-rose-400">O</span>}
              </button>
            );
          })}
        </div>

        {(winner || isDraw) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            {winner ? (
              <>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {vsBot && winner === 'O' ? 'Bot Won!' : vsBot && winner === 'X' ? 'You Won!' : `Player ${winner} Won!`}
                </h3>
                <p className="text-xs text-slate-400 mb-4">Well played round.</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-300 mb-1">It's a Draw!</h3>
                <p className="text-xs text-slate-400 mb-4">Evenly matched game.</p>
              </>
            )}
            <button
              onClick={resetGame}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Next Round
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 mt-4 flex items-center gap-3">
        <span>Turn: Player {turn}</span>
        <span aria-hidden="true">·</span>
        <span>{vsBot ? 'Playing against Minimax bot' : '2-Player local game'}</span>
      </div>
    </div>
  );
}
