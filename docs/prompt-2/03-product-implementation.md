# Product Implementation: Evaluation Pipeline + Azure AI Foundry UI

## Gate 1 - PRD Interpretation Summary
**Core problem:** Prompt updates are being released without consistent regression checks, causing quality and safety regressions in production.

**MVP in-scope features:**
- Offline evaluation runner for baseline vs candidate prompt versions.
- Deterministic scoring and regression detection with configurable thresholds.
- JSON report output with case-level evidence.
- Azure AI Foundry-style UI to inspect pass/fail summary and regression rows.
- Unit tests for core logic.

**Out of scope:**
- Real-time production traffic evaluation.
- Multi-tenant auth and enterprise RBAC.
- Full Azure AI Foundry extension APIs.

**Primary success metric:** Regression Escape Rate (<2% long-term target).

**Constraints and risks:**
- No new dependencies.
- Keep logic deterministic.
- Keep UI simple and decision-oriented.
- Guard against false positives and weak eval coverage.

## Gate 2 - Repo Inspection
- Repo has no app framework dependency requirement for this feature.
- Existing prototype pattern supports static HTML/CSS/JS + lightweight script logic.
- Existing test style can use built-in `node --test`.

**Chosen location:** `prototype/prompt-regression/`

**Why:** Keeps interview prototype isolated from existing `snake` sample and allows direct local execution without adding package managers or frameworks.

## Gate 3 - Implementation Plan
- `data/`: eval cases, prompt metadata, mock responses.
- `src/scoring.mjs`: pure scoring and regression rules.
- `src/evaluator.mjs`: orchestrates case execution and aggregates summary.
- `src/providers/`: mock provider and optional Azure OpenAI provider.
- `src/run-evaluation.mjs`: CLI entrypoint for local/CI report generation.
- `reports/latest-report.json`: generated (or sample) report for UI.
- `index.html`, `styles.css`, `app.js`: Foundry-style review UI.
- `src/*.test.mjs`: core logic unit tests.

## Gate 4 - Self-Critique
- Avoided overbuilding: no backend service, no database, no framework migration.
- Stayed in PRD scope: offline evaluator + decision UI only.
- Minimized abstraction: simple modules and direct data flow.
- Maintained deterministic behavior through mock provider and pure scoring functions.

## Gate 5 - Verification Checklist
- MVP-only scope implemented: yes.
- New dependencies added: none.
- UI kept minimal and functional: yes.
- Deterministic and testable logic: yes.
- Out-of-scope features implemented: none.

## Delivered Artifacts
- Strategy doc: [docs/01-product-strategy.md](/Users/jinsoo/vibecoding/docs/01-product-strategy.md)
- PRD doc: [docs/02-product-requirements.md](/Users/jinsoo/vibecoding/docs/02-product-requirements.md)
- Prototype README: [prototype/prompt-regression/README.md](/Users/jinsoo/vibecoding/prototype/prompt-regression/README.md)
- Evaluation runner: [prototype/prompt-regression/src/run-evaluation.mjs](/Users/jinsoo/vibecoding/prototype/prompt-regression/src/run-evaluation.mjs)
- Scoring logic: [prototype/prompt-regression/src/scoring.mjs](/Users/jinsoo/vibecoding/prototype/prompt-regression/src/scoring.mjs)
- Evaluator: [prototype/prompt-regression/src/evaluator.mjs](/Users/jinsoo/vibecoding/prototype/prompt-regression/src/evaluator.mjs)
- UI entry: [prototype/prompt-regression/index.html](/Users/jinsoo/vibecoding/prototype/prompt-regression/index.html)
- Sample report: [prototype/prompt-regression/reports/latest-report.json](/Users/jinsoo/vibecoding/prototype/prompt-regression/reports/latest-report.json)

## Run Instructions
From repo root:

```bash
node prototype/prompt-regression/src/run-evaluation.mjs
```

Open UI:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/prototype/prompt-regression/`.

Run tests:

```bash
node --test prototype/prompt-regression/src/*.test.mjs
```

## Manual Verification Checklist
- [ ] Report JSON is generated at `prototype/prompt-regression/reports/latest-report.json`.
- [ ] Summary status, regression count, and mean delta are visible in UI.
- [ ] Regressions-only filter shows only flagged rows.
- [ ] Clicking a row shows input + baseline/candidate response details.
- [ ] Cases with safety violations show `new_safety_violation` reason.
- [ ] No console errors while rendering UI.

## Notes
- `node` runtime is unavailable in this execution environment, so tests and script execution could not be run here.
- A deterministic sample report is included so the UI remains reviewable immediately.
