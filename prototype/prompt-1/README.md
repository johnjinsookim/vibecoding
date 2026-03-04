# Prompt-1 Prototype

## Executive Summary
This prototype implements a pre-production observability workflow for agentic systems based on `docs/prompt-1/02-product-requirements.md`.
It provides:
- Hybrid evaluator builder validation and reusable profile save.
- Deterministic pre-production pass/fail gate against baseline vs candidate prompts.
- Case-level root cause and recommendation outputs.
- Exportable JSON compliance report.

## Run Evaluation Report
From repo root:

```bash
node prototype/prompt-1/src/run-evaluation.mjs
```

This generates:
- `prototype/prompt-1/reports/latest-report.json`

## Run Tests

```bash
node --test prototype/prompt-1/src/*.test.mjs
```

## Review the UI

```bash
python3 -m http.server 8000
```

Open:
- `http://localhost:8000/prototype/prompt-1/`

## Manual Verification
- Validate profile requires template + generated + custom modes.
- Save profile and refresh to confirm local profile persistence.
- Confirm summary status, total regressions, and mean delta render.
- Toggle regressions-only filter and inspect case detail panel.
- Confirm root-cause and recommendations are present per failing case.
- Download JSON report and verify run metadata exists.
