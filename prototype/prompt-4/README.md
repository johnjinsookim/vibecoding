# Prompt-4 Analytics Dashboard Prototype

Dark dashboard inspired by the provided screenshot.

## Layout

- Top row: three separate 24H charts by category (`Security`, `Governance`, `Harmful`).
- Beneath charts: `Production Logs` summary dashboard with KPI cards and table.
- Drill-down: click a Production Log row to open event investigation.

## Interactions

- Hover a bar to dim other bars in that chart.
- Click a bar to filter the summary dashboard by `category + hour`.
- Search filters Production Logs by name.
- Click a Production Log row to open event-level investigation.
- In investigation view, hover events to preview and click to render root-cause graph + fixes.

## Files

- `index.html`: dashboard + investigation screens.
- `styles.css`: shared dark design system components.
- `app.js`: chart rendering, filtering, summary aggregation, and investigation flow.

## Run locally

```bash
python3 -m http.server 8000
```

Open:

- `http://localhost:8000/prototype/prompt-4/`
