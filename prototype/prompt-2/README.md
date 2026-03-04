# Prompt Regression Evaluation Prototype

This prototype implements an interview-scale MVP for:

- Deterministic prompt regression evaluation pipeline
- Azure AI Foundry-style review UI
- Release gate decision (`pass` / `fail`) from baseline vs candidate prompt comparison

## What it does

1. Runs evaluation cases against baseline and candidate prompt versions.
2. Scores each response on coverage, format compliance, and safety.
3. Flags regressions with reasons (`score_drop`, `new_safety_violation`, `format_non_compliance`).
4. Writes report JSON to `reports/latest-report.json`.
5. Displays report in `index.html`.

## Run the evaluation

From repo root:

```bash
node prototype/prompt-regression/src/run-evaluation.mjs
```

Optional flags:

```bash
node prototype/prompt-regression/src/run-evaluation.mjs \
  --provider mock \
  --baseline baseline \
  --candidate candidate \
  --out prototype/prompt-regression/reports/latest-report.json
```

Azure provider (optional):

```bash
export AZURE_OPENAI_ENDPOINT="https://<resource>.openai.azure.com"
export AZURE_OPENAI_API_KEY="<key>"
export AZURE_OPENAI_DEPLOYMENT="<deployment-name>"
node prototype/prompt-regression/src/run-evaluation.mjs --provider azure
```

## Open the UI

Serve the repo and open the prototype page:

```bash
python3 -m http.server 8000
```

Then visit:

- `http://localhost:8000/prototype/prompt-regression/`

## Run tests

```bash
node --test prototype/prompt-regression/src/*.test.mjs
```
