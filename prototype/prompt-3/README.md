# Prompt-3 Agent Eval Prototype

This prototype is a four-screen UI that maps to the FigJam mood board flow and keeps one connected workflow across screens.

## Screen mapping

1. `Select evaluator` (FigJam node `22:267`) -> Screen 1: select evaluator and experiment.
2. `Define custom evaluator` (FigJam node `22:268`) -> Screen 2: define or edit custom evaluator.
3. `See results of evaluation by experiment` (FigJam node `22:269`) -> Screen 3: review evaluation results by experiment.
4. `Deep-dive into experimental results` (FigJam node `22:270`) -> Screen 4: deep dive into case-level outputs and trace.

FigJam board: [Eval Mood Board](https://www.figma.com/board/XQxFddvpqaINJUHoJfA443/Eval-Mood-Board?node-id=0-1&t=1qrht0zX72loIKcs-1)

## Core capabilities

- Select evaluator from prebuilt and custom evaluators.
- Define custom evaluator (name, category, model, threshold, rubric).
- View results by experiment under the active evaluator.
- Analyze experiment details by case with evaluator reasoning and trace steps.

## Files

- `index.html`: multi-screen structure and shared navigation.
- `styles.css`: unified light visual system across all screens.
- `app.js`: state, screen routing, evaluator CRUD, and rendering logic.
- `reports/latest-report.json`: mock report data used by all screens.

## Run locally

From repository root:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/prototype/prompt-3/`

Optional direct screen URLs:

- `http://localhost:8000/prototype/prompt-3/#select`
- `http://localhost:8000/prototype/prompt-3/#define`
- `http://localhost:8000/prototype/prompt-3/#results`
- `http://localhost:8000/prototype/prompt-3/#analyze`

## Manual verification checklist

- Selecting an evaluator updates scores on Select, Results, and Analyze screens.
- Creating a custom evaluator saves it and sets it as active.
- Selecting an experiment persists into Analyze screen.
- Selecting a case updates detail reasoning and trace waterfall.
- Layout remains usable on desktop and mobile widths.
