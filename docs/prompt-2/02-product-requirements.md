# PRD – Evaluation Pipeline and Azure AI Foundry UI for Prompt Regressions

## 1. Executive Summary
**What are we building?**  
An automated prompt regression evaluation pipeline with an Azure AI Foundry-style review UI. It compares a candidate prompt against a baseline across a fixed evaluation set, computes score deltas and safety checks, and produces a release gate decision (`pass`/`fail`) with case-level explanations.

**Who is it for?**  
Prompt engineers (primary), AI product managers, and responsible AI reviewers.

**What problem are we solving?**  
Prompt updates are currently validated manually, which misses regressions and causes production rollbacks.

**Why now?**  
Prompt iteration volume has grown beyond what manual QA can reliably handle, and teams need consistent governance before broader AI rollout.

**Expected impact:**  
- Reduce prompt-release regressions escaping to production to `<2%` within 12 months.
- Cut release decision time by `30%`.
- Increase evaluated prompt iterations per week by `2x`.

## 2. Problem Statement
## Target User
- Prompt engineers who ship frequent prompt changes and need objective quality checks.
- AI PMs who need a go/no-go signal with evidence.
- RAI reviewers who need auditable safety and compliance artifacts.

## Current Pain
- Validation today: ad hoc prompt sampling and manual review.
- Broken process: no standardized eval set, no objective regression thresholds, no shared dashboard.
- Cost: late discovery of failures, emergency rollback work, slower shipping velocity.

## 3. Goals & Non-Goals
## Goals (Must Be Measurable)
- Detect regressions pre-release with `>=90%` catch rate on known failure classes in eval suites.
- Block release when candidate mean score drops more than configured threshold (`default: -0.03`) or critical safety checks fail.
- Provide case-level explanations for 100% of blocked runs.

## Non-Goals
- Building model fine-tuning workflows.
- Replacing online monitoring in production.
- Creating a generic BI platform beyond regression review use cases.

## 4. Success Metrics
## Primary Metric (North Star)
- `Regression Escape Rate = (# releases with post-release regression) / (total releases)`; target `<2%`.

## Supporting Metrics
- Adoption: % prompt PRs with evaluation run attached (target `>=85%`).
- Decision speed: median time from eval completion to release decision (target `-30%` vs baseline).
- Reliability: pipeline success rate (target `>=99%` successful eval executions).

## Guardrails
- Quality: false positive block rate `<10%`.
- Safety: harmful output rate `<0.5%` on eval suite.
- Performance: end-to-end eval runtime `<10 minutes` for MVP dataset size.
- Cost: per-run token and compute cost within team budget target.

## 5. User Experience
## Core User Flow
1. User selects baseline and candidate prompt versions.
2. User runs evaluation suite (or CI triggers it automatically).
3. System computes case-level and aggregate metrics and flags regressions.
4. Foundry-style UI shows summary, regression rows, and release recommendation.
5. User approves release or revises prompt based on evidence.

## Before vs After
- Before: spreadsheet/manual checks, inconsistent decision criteria.
- After: standardized gate with transparent deltas and clear pass/fail outcome.

## 6. Solution Overview
## What Are We Building?
A service and UI layer that executes evaluation cases, scores baseline vs candidate results, and renders regression outcomes in a decision-focused dashboard.

## Key Features (MVP)
- Deterministic evaluation runner with pluggable providers (`mock`, optional Azure OpenAI).
- Scoring framework (keyword coverage, format compliance, safety keyword checks, weighted total score).
- Regression detection and release gate policy with configurable thresholds.
- Azure AI Foundry-style web UI for summary KPIs, case-level diff review, and filtering by regressions.

## 7. Scope
## In Scope (MVP)
- Offline eval dataset runner for prompt versions.
- JSON report generation with per-case details.
- Browser-based UI for a single report artifact.
- Local/CI usage docs and unit tests for scoring/regression logic.

## Out of Scope
- Real-time traffic shadow evaluation.
- Multi-tenant auth and enterprise access control.
- Full Foundry integration APIs (MVP is UI-compatible workflow, not platform extension).

## 8. Risks & Tradeoffs
## Key Risks
- Adoption risk: teams may bypass pipeline under delivery pressure.
- Technical risk: weak eval dataset may hide true regressions.
- Business risk: false positives may block high-value releases.

## Tradeoffs
- Chosen approach favors explainability and deterministic checks over complex model-based judges for MVP.
- Faster to implement and validate, but may miss nuanced semantic quality issues without future evaluator expansion.

## 9. Rollout Plan
- Phase 1 (Weeks 1-2): Implement local MVP pipeline + UI with synthetic data and policy thresholds.
- Phase 2 (Weeks 3-4): Pilot in one team CI flow; compare against manual QA decisions.
- Phase 3 (Weeks 5-8): Expand eval suite coverage, tune thresholds, onboard second team.
- Success criteria: regression catch rate and decision-time improvements hit target for two consecutive sprints.
- Failure protocol: if false positives exceed threshold, keep pipeline in advisory mode while recalibrating metrics.
