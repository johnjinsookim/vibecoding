# Product Requirements Document

> Goal: Convert strategy into a clear, structured, interview-ready PRD.
> Source: `docs/prompt-4/01-product-strategy.md`

---

# 1. Executive Summary

**What are we building?**  
A production capability in Azure AI Foundry that identifies incorrect and unsafe clinical recommendations and intervenes before clinicians can read them. The capability combines online evaluation, policy gating, and automated mitigation actions, then records evidence for debugging and governance.

**Who is it for?**  
Primary users: Systems & reliability engineers, ML engineers, and technical product managers responsible for operating clinical note-taking agents.  
Protected end users: Clinicians.

**What problem are we solving?**  
Clinical recommendations can contain hallucinations or unsafe content (security, governance, or harmful output). Current processes are reactive and inconsistent, so risky output may reach clinicians.

**Why now?**  
Azure AI Foundry already provides eval and observability foundations. Expanding into online pre-display detection and mitigation is the fastest path to safer enterprise clinical AI at scale.

**Expected impact:**  
North Star Metric: **Number of Weekly Active Services**.  
This is defined as the count of production agent services that use this observability and safety capability in Azure AI Foundry at least once every 7 days. This metric was selected because strategy prioritizes broad enterprise adoption of safe, operational AI workflows.

---

# 2. Problem Statement

## Target User
- **Systems & reliability engineers:** keep production traffic safe and stable.
- **ML engineers:** design and tune evaluators, thresholds, and mitigation behavior.
- **Technical product managers:** define release quality bars and operational SLAs.
- **Shared job-to-be-done:** prevent unsafe recommendations from being shown, while preserving speed and reliability.

## Current Pain
- Hallucinations and incorrect dictation-to-record translations are not consistently caught before display.
- Safety checks for compliance, governance, and harmful content are fragmented.
- Teams spend too long diagnosing failures due to disconnected logs and tooling.
- Mitigation is often post-hoc, not preventative.

---

# 3. Goals & Non-Goals

## Goals
- Detect incorrect and unsafe recommendations **in online flow before clinician exposure**.
- Support unsafe classes defined in strategy:
  - Security/compliance issues (e.g., unmasked PII or irrelevant sensitive data).
  - Governance issues (improper information access/sharing context).
  - Harmful content issues (sexual, abusive, or otherwise unsafe output).
- Apply deterministic mitigation actions when risk is detected.
- Provide traces, eval outcomes, and remediation recommendations to technical teams.

## Non-Goals
- Building non-technical clinician-facing product surfaces in MVP.
- Replacing complete clinical decision support or EHR workflows.
- Solving model training/fine-tuning lifecycle in this capability.

---

# 4. Success Metrics

## Primary Metric (North Star)
- **Number of Weekly Active Services**
- **Formula:** Count of distinct production agent services with at least one run using this capability in the trailing 7 days.

## Health Metrics
This product should maximize preventative safety while staying operationally usable.

| Metric | Definition | Target |
|---|---|---|
| Pre-Display Unsafe Detection Recall | `% of known unsafe recommendations detected before display` | `>=95%` |
| Unsafe Exposure Rate | `% of clinician-visible recommendations later classified unsafe` | `<0.5%` |
| Mitigation Effectiveness | `% of flagged events resolved by block/reroute/regenerate without incident` | `>=90%` |
| Mean Time to Diagnosis | Time from alert to root-cause identification using traces/evals | `-40%` vs current |

## Countermetrics
Controls should not harm throughput or overwhelm teams.

| Countermetric | What It Protects Against | Guardrail |
|---|---|---|
| False Positive Block Rate | Over-blocking safe recommendations | `<8%` |
| Added P95 Latency | Degraded clinician experience | `<800ms` |
| Retry Loop Rate | Excessive regenerate cycles | `<3%` |
| Alert Noise Rate | Non-actionable incident volume | downward trend with weekly tuning |

---

# 5. User Experience

## Before vs After
- **Before:** Unsafe/incorrect output is often found after clinicians see it.
- **After:** Unsafe/incorrect output is detected and mitigated before exposure, with clear technical evidence for remediation.

## Core User Flow
1. Clinical note agent generates recommendation from dictation and context.
2. Azure AI Foundry runs online evaluators and policy checks before display.
3. System assigns risk severity and policy decision.
4. If safe, recommendation is shown; if unsafe, mitigation runs (block/regenerate/fallback).
5. Event is logged with trace, failed checks, mitigation action, and outcome.
6. Technical users inspect dashboards and recommendations to fix recurring issues.


---

# 6. Solution Overview

## What Are We Building?
A Foundry-native runtime safety layer for clinical recommendation systems with:
- online evaluator execution // de-scoped: backend
- pre-display gating // de-scoped: backend
- mitigation orchestration // de-scoped: backend
- observability and root-cause tooling.

## Key Features (MVP)
### Debugging Console
- User story: As a technical PM or engineer, I want to understand what went wrong and how to fix

#### Feature 1: Analytics dashboard
- Acceptance criteria:
  - Overal chart trends: safety, content hallucination

#### Feature 2: Evaluators
- Acceptance criteria:
  - Log events, evaluator (and info on how evaluation is calculated), pass/fail, explanation, recommendation for mitigation

#### Feature 3: Traces
- Acceptance criteria
  - Click into chart trends shows traces and logs for a specific event
  - Graph that shows the flow of the traces and colors the event that went wrong in red
  - For the event that went wrong, a summary and recommendation of what went wrong and how to fix
