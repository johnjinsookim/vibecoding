# Interview Prototype - Feature 1

## What changed
This prototype now uses the landing design pattern from your provided code sample while keeping the current color system.

Applied changes:
- Side navigation now contains only the **Deployment Center** icon and description.
- All other nav actions were removed.
- Landing page uses tabbed context input (`GitHub repo` / `Agent specification`) and a full-width `Generate` action.
- Generate flow includes loading text then routes to Copilot recommendations.

## Pages
- `index.html`: Feature 1 landing page.
- `copilot.html`: Copilot chat + recommendation selection + create evals action.

## Scripts
- `app.js`: landing page interactions and navigation.
- `copilot.js`: recommendation generation + chat rendering + eval creation persistence.

## Run locally
From repo root:

```bash
python3 -m http.server 8010 --directory /Users/jinsoo/vibecoding
```

Open landing page:

`http://localhost:8010/prototype/interview/`

## Verification checklist
- [ ] Side nav only shows the Deployment Center icon + description.
- [ ] Landing tabs switch input placeholder and helper copy.
- [ ] Generate button is disabled until input exists.
- [ ] Clicking Generate shows loading state and routes to `copilot.html`.
- [ ] Copilot allows selecting recommendations and clicking `Create selected evals`.
