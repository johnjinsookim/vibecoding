# Prompt-5 Prototype: Pricing Reliability Workspace

This prototype now includes three working sections in one app shell:
- `Dashboards`
- `Monitors`
- `Evals & Tasks`

## What was fixed
The previous build had a broken `index.html`/`app.js` mismatch. HTML rendered the monitor layout, while JS expected different evaluator-builder IDs, causing runtime failures and non-working sections.

This was fixed by rebuilding the prototype as a consistent multi-view app with shared data and navigation.

## Run locally
```bash
./prototype/prompt-5/launch.sh 8000
```
Or:
```bash
python3 -m http.server 8000
```

Open:
- `http://localhost:8000/prototype/prompt-5/`
