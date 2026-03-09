# Product Implementation: Feature 4 (Quality Monitors and Alerts)

## Scope
This implementation covers **Feature 4: Quality Monitors and Alerts** from [02-product-requirements.md](/Users/jinsoo/vibecoding/docs/prompt-5/02-product-requirements.md), focused on pricing hallucination monitoring for shopping AI.

## Figma + MCP status
Wireframe source provided: [Eval Mood Board](https://www.figma.com/board/XQxFddvpqaINJUHoJfA443/Eval-Mood-Board?node-id=44-441&t=1qrht0zX72loIKcs-0), node `44:441`.

What was attempted:
- `get_design_context` first per skill workflow. Result: unsupported for FigJam files.
- `get_screenshot` for visual capture. Result: blocked by Starter plan read limit.
- `whoami` to validate auth/seat context.

Result:
- Prototype implemented from Feature #4 PRD requirements and the user-shared Monitoring/Create Monitor screenshots.
- A future fidelity pass can run when MCP read quota is available again.

## Prototype output
- Implementation: [prototype/prompt-5/index.html](/Users/jinsoo/vibecoding/prototype/prompt-5/index.html)
- Styling: [prototype/prompt-5/styles.css](/Users/jinsoo/vibecoding/prototype/prompt-5/styles.css)
- Behavior/data simulation: [prototype/prompt-5/app.js](/Users/jinsoo/vibecoding/prototype/prompt-5/app.js)
- Run notes: [prototype/prompt-5/README.md](/Users/jinsoo/vibecoding/prototype/prompt-5/README.md)

## UX structure
1. **Monitoring page shell:** dark observability layout with left navigation, top header, and monitor inventory table.
2. **Monitor controls:** search + status/type filters and incident simulation button.
3. **Selected monitor details:** trend chart with threshold/anomaly context and quick trace link.
4. **Create Monitor panel:** step-based workflow for service, metric, monitor type, data window, alerting rules, and notifications.
5. **Triggered alerts feed:** includes service, metric delta, channels, and investigation link.

## Data model (prototype)
Each monitor stores:
- `id`, `name`, `service`, `model`
- `metric` (`issue_rate | high_severity_share | user_flag_rate`)
- `type` (`threshold | anomaly`)
- `threshold` or `sensitivity`
- `windowMin`
- `channels`
- `investigationLink`
- `enabled`, `muted`, `lastTriggeredAt`
- `lastEvaluation { triggered, current, baseline, delta }`

Synthetic metric history is generated at 1-minute granularity for 24h per service.

## Alert evaluation logic
- **Threshold monitor:** triggers when current metric average in window >= configured threshold.
- **Anomaly monitor:** triggers when z-score of current metric window exceeds configured sensitivity.
- **Alert payload:** monitor ID/name, service, metric, baseline/current values, delta, severity, channels, timestamp, investigation link.

## Acceptance criteria mapping (Feature #4)
- Supports threshold- and anomaly-based monitors.
  - Implemented via monitor type selector + distinct evaluation logic.
- Alerts route to configured channels (email/incident tooling).
  - Implemented via channel selector and alert payload routing metadata.
- Alert includes affected service, metric delta, and direct investigation link.
  - Implemented in alert feed cards and selected monitor workflow.

## Known gaps (prototype)
- No backend persistence for monitor configs or alert state (`FR-6` backend not wired).
- No external integrations yet (email/PagerDuty/Slack are simulated routes).
- Alert de-duplication/silencing windows are not implemented.
- MCP visual parity pass is pending read quota reset.

## Next implementation step after prototype
1. Persist monitor definitions and evaluation snapshots to backend storage.
2. Add real notification dispatch adapters (email/PagerDuty/Slack).
3. Implement alert lifecycle states (`open`, `acknowledged`, `resolved`) and dedupe.
4. Connect investigation links to real logs/traces view from Feature 3.
