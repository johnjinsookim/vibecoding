# vibecoding

Classic Snake prototype is available at:

- `prototype/snake/index.html`

Run options:

- Local server: from repo root run `python3 -m http.server 8000`, then visit `http://localhost:8000/prototype/snake/`.

Tests:

- `node --test prototype/snake/gameLogic.test.mjs`

Manual verification checklist:

- Arrow keys and WASD move the snake.
- On-screen arrow buttons move the snake.
- Pause/Resume works with `Space` and the Pause button.
- Eating food increases score and snake length by 1.
- Hitting wall or self ends game and shows "Game Over".
- Restart button resets score/state and starts a new run.
