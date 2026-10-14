import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/audio.js';

const HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UnblockHub - HTML5 Offline Arcade</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <a href="#" class="brand">UnblockHub</a>
    <nav class="nav-links">
      <a href="#games" class="active">Arcade</a>
      <a href="#stealth">Cloaker</a>
      <a href="#about">About</a>
    </nav>
    <button class="panic-btn" onclick="togglePanic()">Panic (Esc)</button>
  </header>

  <main class="container">
    <div class="hero">
      <h1>Offline Unblocked Games</h1>
      <p>100% Client-side HTML, CSS & JavaScript — runs in any browser with zero network blocks.</p>
    </div>

    <div class="tabs">
      <button id="tab-snake" class="tab-btn active" onclick="switchGame('snake')">Retro Snake</button>
      <button id="tab-breakout" class="tab-btn" onclick="switchGame('breakout')">Brick Breaker</button>
    </div>

    <div class="game-area">
      <div class="game-hud">
        <div class="hud-item">
          <span class="hud-label">Score</span>
          <span id="scoreDisplay" class="hud-value">0</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Best</span>
          <span id="bestDisplay" class="hud-value">0</span>
        </div>
      </div>

      <canvas id="gameCanvas" width="400" height="400"></canvas>
      <div id="controlsHint" class="controls-hint">
        Use Arrow Keys or WASD to slither. Eat red apples!
      </div>
    </div>

    <section id="stealth" class="stealth-panel">
      <h2>Tab Cloaking & Stealth Tools</h2>
      <p>Quickly change this browser tab's title to avoid detection on school or work networks:</p>
      <div class="cloak-buttons">
        <button class="cloak-btn" onclick="setTabCloak('docs', 'Untitled document - Google Docs')">Google Docs</button>
        <button class="cloak-btn" onclick="setTabCloak('drive', 'My Drive - Google Drive')">Google Drive</button>
        <button class="cloak-btn" onclick="setTabCloak('canvas', 'Dashboard | Canvas LMS')">Canvas LMS</button>
        <button class="cloak-btn" onclick="setTabCloak('classroom', 'Classes - Google Classroom')">Google Classroom</button>
        <button class="cloak-btn" onclick="setTabCloak('default', 'UnblockHub - HTML5 Offline Arcade')">Reset Title</button>
      </div>
    </section>
  </main>

  <div id="decoyOverlay" class="decoy-overlay">
    <button class="decoy-close" onclick="togglePanic()">Exit Decoy</button>
    <div class="decoy-content">
      <h2>History Research Essay</h2>
      <p>The Industrial Revolution marked a fundamental shift from agrarian economies to machine manufacturing...</p>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`;

const CSS_CODE = `/* Pure Vanilla CSS for Standalone Unblocked Website */
:root {
  --bg-primary: #0a0f1d;
  --bg-secondary: #131b2e;
  --bg-card: #1c2640;
  --border-color: #273554;
  --text-primary: #f8fafc;
  --text-muted: #94a3b8;
  --accent-emerald: #10b981;
  --accent-cyan: #06b6d4;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-emerald);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
}

.panic-btn {
  background-color: var(--accent-rose);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  flex: 1;
}

.game-area {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

canvas {
  background-color: #060913;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.decoy-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: white;
  z-index: 99999;
  padding: 2rem;
}

.decoy-overlay.active {
  display: block;
}`;

const JS_CODE = `/**
 * Standalone Unblocked Website Script
 * Pure Vanilla JavaScript - No dependencies, runs 100% offline
 */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type = 'sine', duration = 0.08) {
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

let currentGame = 'snake';
let gameInterval = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreDisplay');
const bestEl = document.getElementById('bestDisplay');

const GRID = 20;
let snake = [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}];
let dir = {x: 0, y: -1};
let nextDir = {x: 0, y: -1};
let food = {x: 5, y: 5};
let snakeScore = 0;
let snakeBest = parseInt(localStorage.getItem('standalone_snake_best') || '0', 10);
bestEl.innerText = snakeBest;

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID)
  };
}

function updateSnake() {
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
    playTone(150, 'sawtooth', 0.2);
    resetSnake();
    return;
  }

  for (let s of snake) {
    if (s.x === head.x && s.y === head.y) {
      playTone(150, 'sawtooth', 0.2);
      resetSnake();
      return;
    }
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    playTone(600, 'triangle', 0.08);
    snakeScore += 10;
    scoreEl.innerText = snakeScore;
    if (snakeScore > snakeBest) {
      snakeBest = snakeScore;
      bestEl.innerText = snakeBest;
      localStorage.setItem('standalone_snake_best', snakeBest.toString());
    }
    spawnFood();
  } else {
    snake.pop();
  }

  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cell = canvas.width / GRID;

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#10b981' : '#059669';
    ctx.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
  });
}

function resetSnake() {
  snake = [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}];
  dir = {x: 0, y: -1};
  nextDir = {x: 0, y: -1};
  snakeScore = 0;
  scoreEl.innerText = '0';
  spawnFood();
}

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
  if (e.key === 'Escape') togglePanic();
  if ((e.key === 'ArrowUp' || e.key === 'w') && dir.y === 0) nextDir = {x: 0, y: -1};
  if ((e.key === 'ArrowDown' || e.key === 's') && dir.y === 0) nextDir = {x: 0, y: 1};
  if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.x === 0) nextDir = {x: -1, y: 0};
  if ((e.key === 'ArrowRight' || e.key === 'd') && dir.x === 0) nextDir = {x: 1, y: 0};
});

window.togglePanic = function() {
  document.getElementById('decoyOverlay').classList.toggle('active');
};

resetSnake();
gameInterval = setInterval(updateSnake, 100);`;

export default function CodeExporter() {
  const [activeTab, setActiveTab] = useState('html');
  const [copied, setCopied] = useState(false);

  const getActiveCode = () => {
    if (activeTab === 'html') return HTML_CODE;
    if (activeTab === 'css') return CSS_CODE;
    return JS_CODE;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    sounds.playEat();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const filename = activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'script.js';
    const mime = activeTab === 'html' ? 'text/html' : activeTab === 'css' ? 'text/css' : 'application/javascript';
    const blob = new Blob([getActiveCode()], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playClick();
  };

  const handleDownloadSelfContained = () => {
    const bundle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UnblockHub - Portable Single-File Arcade</title>
  <style>
${CSS_CODE}
  </style>
</head>
<body>
  <header>
    <a href="#" class="brand">UnblockHub (Offline Single-File)</a>
    <button class="panic-btn" onclick="togglePanic()">Panic Key (Esc)</button>
  </header>

  <main class="container">
    <div class="hero">
      <h1>Offline Unblocked Games</h1>
      <p>Single standalone .html file: Double-click to play anywhere, even with zero internet!</p>
    </div>

    <div class="game-area">
      <div class="game-hud">
        <div class="hud-item">
          <span class="hud-label">Score</span>
          <span id="scoreDisplay" class="hud-value">0</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Best</span>
          <span id="bestDisplay" class="hud-value">0</span>
        </div>
      </div>
      <canvas id="gameCanvas" width="400" height="400"></canvas>
      <div id="controlsHint" class="controls-hint">
        Use Arrow Keys or WASD to slither. Press Esc for instant decoy screen!
      </div>
    </div>
  </main>

  <div id="decoyOverlay" class="decoy-overlay">
    <button class="decoy-close" onclick="togglePanic()">Exit Decoy</button>
    <div class="decoy-content">
      <h2>History Research Essay</h2>
      <p>The Industrial Revolution marked a fundamental shift from agrarian economies to machine manufacturing...</p>
    </div>
  </div>

  <script>
${JS_CODE}
  </script>
</body>
</html>`;

    const blob = new Blob([bundle], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unblockhub_standalone.html';
    a.click();
    URL.revokeObjectURL(url);
    sounds.playClear();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">HTML, CSS & JavaScript Source Files</h2>
          <p className="text-xs text-slate-400">
            Download or copy pure vanilla files that run completely offline without servers or blocked networks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/standalone/index.html"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Launch Pure Mode
          </a>
          <button
            onClick={handleDownloadSelfContained}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Single-File .html
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Tab Strip */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('html'); sounds.playClick(); }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'html' ? 'bg-slate-800 text-orange-400 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-orange-400" /> index.html
            </button>
            <button
              onClick={() => { setActiveTab('css'); sounds.playClick(); }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'css' ? 'bg-slate-800 text-sky-400 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" /> style.css
            </button>
            <button
              onClick={() => { setActiveTab('js'); sounds.playClick(); }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'js' ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-yellow-400" /> script.js
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-md flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownloadSingle}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 max-h-[500px] overflow-auto bg-[#080c16]">
          <pre className="text-xs font-mono text-slate-300 leading-relaxed">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
