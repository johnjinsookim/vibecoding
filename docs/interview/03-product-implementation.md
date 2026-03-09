# Product Implementation: Feature 1 (Out-of-the-Box Eval Setup)

## Gate 1 - PRD Interpretation Summary
**Core problem:** New agents are launched without immediate observability coverage, causing slow issue detection and manual setup overhead.

**MVP in-scope feature implemented:**
- Feature 1 from [02-product-requirements.md](/Users/jinsoo/vibecoding/docs/interview/02-product-requirements.md): out-of-the-box eval setup for newly created agents.
- Flow includes context connection (GitHub repo or agent specification), default eval recommendation, approval, activation, and post-activation visibility.

**Out-of-scope (kept out):**
- Backend integration with GitHub APIs.
- Multi-agent deployment control screens and full observability dashboards.
- Autonomous remediation workflows.

**Primary success metric represented in prototype:**
- Observable Agent Activation Rate proxy behavior: user can complete setup and activate default evals in one session.

**Key constraints respected:**
- No new dependencies.
- Deterministic recommendation logic.
- Interview prototype scope only.

## Gate 2 - Repo Inspection
- Repo pattern for prototypes is static web assets (`index.html`, `styles.css`, `app.js`, `README.md`) under `prototype/*`.
- No framework/routing dependency is required for interview demos.

**Chosen location:** `prototype/interview/`

**Why:** It isolates the interview implementation while matching existing repo conventions and local launch workflow.

## Gate 3 - Implementation Plan
- `prototype/interview/index.html`
  - Left icon rail (Create agent, Create eval, Deployment center, Observability).
  - Hero/composer section with updated copy.
  - Three-step Feature 1 workflow panels.
- `prototype/interview/styles.css`
  - Design tokens and component styles informed by the provided screenshot.
  - Responsive behavior for desktop/mobile.
- `prototype/interview/app.js`
  - Deterministic state model and recommendation logic.
  - Interaction flow: connect context -> generate suggestions -> activate selected evals.
- `prototype/interview/README.md`
  - Executive summary + run instructions + manual verification.

## Gate 4 - Self-Critique
- Avoided overbuild: no backend, no persistence, no external APIs.
- Stayed in PRD scope by focusing only on Feature 1.
- Kept architecture lean with a single state object and pure recommendation helper.
- UI polish is controlled and functional, with only lightweight motion.

## Gate 5 - Verification
- Only MVP Feature 1 scope implemented: yes.
- New dependencies added: none.
- UI minimal and deterministic: yes.
- Out-of-scope features added: none.

## Screenshot-Informed Design System Components
- **Icon Rail:** compact icon-only nav; on hover of Create agent icon, rail expands and reveals text `Create agent`.
- **Create Evals Hero:** headline and subtext updated to `Create your evals` and `Connect your GitHub repo to get started`.
- **Composer Surface:** rounded prompt-like container to keep parity with the screenshot.
- **Eval Setup Panels:** step-by-step cards for context, suggested evals, and activated eval visibility.
- **Semantic Icons:** labels and visual affordances centered on agent creation, eval setup, deployment center, and observability.

## Deliverables
- Implementation files:
  - [index.html](/Users/jinsoo/vibecoding/prototype/interview/index.html)
  - [styles.css](/Users/jinsoo/vibecoding/prototype/interview/styles.css)
  - [app.js](/Users/jinsoo/vibecoding/prototype/interview/app.js)
  - [README.md](/Users/jinsoo/vibecoding/prototype/interview/README.md)

## Run Instructions
```bash
python3 -m http.server 8000
```

Open:
- `http://localhost:8000/prototype/interview/`

## Manual Verification Checklist
- [ ] Left rail shows icons only by default.
- [ ] Hovering `Create agent` icon expands rail and reveals `Create agent` text.
- [ ] Hero copy reads `Create your evals` with GitHub onboarding subtext.
- [ ] User can switch between GitHub repo and agent specification context input.
- [ ] Generating default evals renders deterministic recommended evals.
- [ ] User can select/approve evals and activate in one action.
- [ ] Activated evals show definition and pass/fail criteria.
- [ ] No console errors during core flow.
