// Core deterministic game rules.
import {
  GRID_SIZE,
  advance,
  createInitialState,
  setDirection,
} from './gameLogic.js';

// Fixed tick rate for the game loop.
const TICK_MS = 140;

// DOM references.
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const restartEl = document.getElementById('restart');
const pauseEl = document.getElementById('pause');
const controlButtons = document.querySelectorAll('[data-dir]');

// Mutable runtime state for UI + loop management.
let state = createInitialState(GRID_SIZE);
let timer = null;
let isPaused = false;

function draw() {
  // Redraw the whole board each tick; grid is small enough for this approach.
  boardEl.innerHTML = '';

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      if (state.food.x === x && state.food.y === y) {
        cell.classList.add('food');
      }

      if (state.snake.some((p) => p.x === x && p.y === y)) {
        cell.classList.add('snake');
      }

      if (state.snake[0].x === x && state.snake[0].y === y) {
        cell.classList.add('head');
      }

      boardEl.appendChild(cell);
    }
  }

  scoreEl.textContent = String(state.score);
  if (state.isGameOver) {
    statusEl.textContent = 'Game Over';
  } else if (isPaused) {
    statusEl.textContent = 'Paused';
  } else {
    statusEl.textContent = 'Running';
  }
}

function tick() {
  // Keep the timer alive while paused; just skip state advancement.
  if (isPaused) return;
  state = advance(state);
  draw();

  if (state.isGameOver && timer) {
    clearInterval(timer);
    timer = null;
  }
}

function start() {
  // Start the loop only once.
  if (!timer) {
    timer = setInterval(tick, TICK_MS);
  }
}

function restart() {
  // Full reset to initial game state and running timer.
  state = createInitialState(GRID_SIZE);
  isPaused = false;
  pauseEl.textContent = 'Pause';
  draw();
  if (timer) clearInterval(timer);
  timer = null;
  start();
}

function togglePause() {
  // Ignore pause input after game over.
  if (state.isGameOver) return;
  isPaused = !isPaused;
  pauseEl.textContent = isPaused ? 'Resume' : 'Pause';
  draw();
}

function toDirection(key) {
  // Map keyboard input to internal direction values.
  const map = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    w: 'UP',
    W: 'UP',
    s: 'DOWN',
    S: 'DOWN',
    a: 'LEFT',
    A: 'LEFT',
    d: 'RIGHT',
    D: 'RIGHT',
  };
  return map[key] || null;
}

document.addEventListener('keydown', (event) => {
  // Space toggles pause; direction keys only update intent for next tick.
  if (event.key === ' ') {
    event.preventDefault();
    togglePause();
    return;
  }
  const direction = toDirection(event.key);
  if (!direction) return;
  event.preventDefault();
  state = setDirection(state, direction);
});

// Button handlers for restart/pause.
restartEl.addEventListener('click', restart);
pauseEl.addEventListener('click', togglePause);

// On-screen directional controls for touch/mobile usage.
controlButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const direction = btn.dataset.dir;
    state = setDirection(state, direction);
  });
});

// Initial render and loop start.
draw();
start();
