/**
 * Standalone Unblocked Website Script
 * Pure Vanilla JavaScript - No dependencies, works 100% offline
 */

// Audio synth using Web Audio API
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

// State
let currentGame = 'snake';
let gameInterval = null;

// ==========================================
// 1. SNAKE GAME
// ==========================================
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

function resetSnake() {
  snake = [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}];
  dir = {x: 0, y: -1};
  nextDir = {x: 0, y: -1};
  snakeScore = 0;
  scoreEl.innerText = '0';
  spawnFood();
}

function updateSnake() {
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  // Wall collision
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
    playTone(150, 'sawtooth', 0.2);
    resetSnake();
    return;
  }

  // Self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      playTone(150, 'sawtooth', 0.2);
      resetSnake();
      return;
    }
  }

  snake.unshift(head);

  // Food collision
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

  // Draw
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cell = canvas.width / GRID;

  // Draw Food
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw Snake
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#10b981' : '#059669';
    ctx.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
  });
}

function startSnake() {
  if (gameInterval) clearInterval(gameInterval);
  resetSnake();
  gameInterval = setInterval(updateSnake, 100);
}

// ==========================================
// 2. BREAKOUT GAME
// ==========================================
let paddleX = 160;
let paddleW = 80;
let ballX = 200;
let ballY = 320;
let ballDX = 3;
let ballDY = -3;
let breakoutBricks = [];
let breakoutScore = 0;

function initBreakout() {
  paddleX = 160;
  ballX = 200;
  ballY = 320;
  ballDX = 3;
  ballDY = -3;
  breakoutScore = 0;
  scoreEl.innerText = '0';
  breakoutBricks = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      breakoutBricks.push({
        x: 15 + c * 52,
        y: 40 + r * 20,
        w: 46,
        h: 14,
        intact: true,
        color: ['#ef4444', '#f97316', '#eab308', '#10b981'][r]
      });
    }
  }
}

function updateBreakout() {
  ballX += ballDX;
  ballY += ballDY;

  // Wall bounce
  if (ballX + 6 > canvas.width || ballX - 6 < 0) {
    ballDX = -ballDX;
    playTone(280, 'sine', 0.04);
  }
  if (ballY - 6 < 0) {
    ballDY = -ballDY;
    playTone(280, 'sine', 0.04);
  }

  // Paddle bounce
  if (ballY + 6 >= canvas.height - 25 && ballY - 6 <= canvas.height - 15 && ballX >= paddleX && ballX <= paddleX + paddleW) {
    ballDY = -Math.abs(ballDY);
    playTone(480, 'sine', 0.06);
  }

  // Bottom death
  if (ballY > canvas.height) {
    playTone(140, 'sawtooth', 0.2);
    initBreakout();
    return;
  }

  // Brick hit
  for (let b of breakoutBricks) {
    if (b.intact && ballX >= b.x && ballX <= b.x + b.w && ballY >= b.y && ballY <= b.y + b.h) {
      b.intact = false;
      ballDY = -ballDY;
      breakoutScore += 20;
      scoreEl.innerText = breakoutScore;
      playTone(550, 'triangle', 0.06);
      break;
    }
  }

  // Draw
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bricks
  breakoutBricks.forEach(b => {
    if (b.intact) {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  });

  // Paddle
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(paddleX, canvas.height - 25, paddleW, 10);

  // Ball
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
  ctx.fill();
}

function startBreakout() {
  if (gameInterval) clearInterval(gameInterval);
  initBreakout();
  gameInterval = setInterval(updateBreakout, 16);
}

// Mouse move paddle for breakout
canvas.addEventListener('mousemove', (e) => {
  if (currentGame === 'breakout') {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddleX = Math.max(0, Math.min(canvas.width - paddleW, mouseX - paddleW / 2));
  }
});

// Switch game
window.switchGame = function(name) {
  currentGame = name;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');

  const hintEl = document.getElementById('controlsHint');
  if (name === 'snake') {
    hintEl.innerText = 'Use Arrow Keys or WASD to slither. Eat red apples!';
    startSnake();
  } else if (name === 'breakout') {
    hintEl.innerText = 'Move mouse to slide paddle. Clear all colored blocks!';
    startBreakout();
  }
};

// Keyboard handler
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }

  // Panic button shortcut
  if (e.key === 'Escape' || e.key === '`') {
    window.togglePanic();
    return;
  }

  if (currentGame === 'snake') {
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dir.y === 0) nextDir = {x: 0, y: -1};
    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dir.y === 0) nextDir = {x: 0, y: 1};
    if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dir.x === 0) nextDir = {x: -1, y: 0};
    if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dir.x === 0) nextDir = {x: 1, y: 0};
  } else if (currentGame === 'breakout') {
    if (e.key === 'ArrowLeft') paddleX = Math.max(0, paddleX - 25);
    if (e.key === 'ArrowRight') paddleX = Math.min(canvas.width - paddleW, paddleX + 25);
  }
});

// Tab Cloak function
window.setTabCloak = function(name, title) {
  document.title = title;
  alert(`Tab disguised as: "${title}"`);
};

// Panic Overlay toggle
window.togglePanic = function() {
  const overlay = document.getElementById('decoyOverlay');
  overlay.classList.toggle('active');
};

// Start default
startSnake();
