// Node built-in test/assert modules (no external dependencies).
import test from 'node:test';
import assert from 'node:assert/strict';
// Game logic functions under test.
import {
  advance,
  createInitialState,
  hitsSnake,
  hitsWall,
  placeFood,
  setDirection,
} from './gameLogic.js';

// Verifies a standard movement tick without scoring.
test('moves one step in current direction', () => {
  const state = createInitialState(10);
  const next = advance(state);
  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
  assert.equal(next.score, 0);
});

// Verifies opposite direction input is rejected.
test('ignores immediate reverse direction', () => {
  const state = createInitialState(10);
  const reversed = setDirection(state, 'LEFT');
  assert.equal(reversed.nextDirection, 'RIGHT');
});

// Verifies growth, score update, and food respawn after eating.
test('grows and increments score after eating food', () => {
  const state = {
    ...createInitialState(10),
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: { x: 4, y: 3 },
  };

  const next = advance(state);
  assert.equal(next.snake.length, 3);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, state.food);
});

// Verifies game-over condition when moving out of bounds.
test('detects wall collision and game over', () => {
  const state = {
    ...createInitialState(5),
    snake: [{ x: 4, y: 2 }],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
  };

  const next = advance(state);
  assert.equal(next.isGameOver, true);
});

// Verifies food placement always chooses an unoccupied cell.
test('food placement never overlaps snake', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = placeFood(snake, 4, () => 0);
  assert.equal(hitsSnake(food, snake), false);
});

// Verifies low-level boundary helper behavior.
test('wall hit helper works', () => {
  assert.equal(hitsWall({ x: -1, y: 0 }, 8), true);
  assert.equal(hitsWall({ x: 0, y: 0 }, 8), false);
});
