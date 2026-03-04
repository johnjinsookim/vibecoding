// Default board size and initial movement direction.
export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = 'RIGHT';

// Direction vectors used to compute the next head position.
const DIR_VECTORS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Reverse-direction lookup used to block illegal 180-degree turns.
const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export function createInitialState(gridSize = GRID_SIZE) {
  const center = Math.floor(gridSize / 2);
  // Start as a 2-cell snake pointing right from the center.
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
  ];

  return {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: placeFood(snake, gridSize),
    score: 0,
    isGameOver: false,
  };
}

export function setDirection(state, direction) {
  if (!DIR_VECTORS[direction]) return state;
  // Prevent 180-degree turns that would instantly collide with the neck.
  if (OPPOSITE[state.direction] === direction) return state;
  return { ...state, nextDirection: direction };
}

export function advance(state) {
  if (state.isGameOver) return state;

  // Apply the queued direction for this tick.
  const direction = state.nextDirection;
  const vector = DIR_VECTORS[direction];
  const head = state.snake[0];
  const newHead = { x: head.x + vector.x, y: head.y + vector.y };

  // End the game if the next head position is outside bounds or in the body.
  if (hitsWall(newHead, state.gridSize) || hitsSnake(newHead, state.snake)) {
    return { ...state, direction, isGameOver: true };
  }

  // Grow when food is eaten; otherwise move forward by removing the tail.
  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;
  const grownSnake = [newHead, ...state.snake];
  // If no food was eaten, drop the tail so overall length stays constant.
  const snake = ateFood ? grownSnake : grownSnake.slice(0, -1);

  return {
    ...state,
    snake,
    direction,
    food: ateFood ? placeFood(snake, state.gridSize) : state.food,
    score: ateFood ? state.score + 1 : state.score,
  };
}

export function placeFood(snake, gridSize, random = Math.random) {
  // Build a list of currently empty cells.
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const free = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) free.push({ x, y });
    }
  }

  if (free.length === 0) {
    // No open cells means the board is full; return a valid fallback point.
    return snake[0];
  }

  // Select a random empty cell for the new food location.
  const index = Math.floor(random() * free.length);
  return free[index];
}

// Boundary collision helper.
export function hitsWall(point, gridSize) {
  return point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;
}

// Self-collision helper.
export function hitsSnake(point, snake) {
  return snake.some((segment) => segment.x === point.x && segment.y === point.y);
}
