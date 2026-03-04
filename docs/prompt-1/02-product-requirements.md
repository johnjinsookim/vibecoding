# Product Requirements Document

> Goal: Convert strategy into a clear, structured, interview-ready PRD.
> Source: `docs/prompt-1/01-product-strategy.md`

---

# 1. Executive Summary

**What are we building?**
A web-based MVP for pre-production observability of agentic systems. The product helps technical teams evaluate agent workflows before launch.

**Who is it for?**
Primary user: ML engineers.

**What problem are we solving?**
Teams are not confident about whether an agent is safe and reliable enough to launch because evaluation is inconsistent, manual, and hard to interpret.

**Why now?**
Agent complexity is increasing, and manual pre-production checks no longer scale. Without a standardized evaluation workflow, launch risk and rework continue to grow.

**Expected impact:**
North Star Metric: **Number of Healthy Deployments**.
A healthy deployment is a deployment that passes pre-production evaluation gates and has no Sev1 quality/safety incident in the first 7 days. Result is that the deployment is not rolled back.

---

# 2. Problem Statement

## Target User
- **Primary:** ML engineer responsible for evaluation and launch quality.
- **Jobs-to-be-done:**
  - Build or configure evaluators for agent workflows.
  - Run pre-launch validation and interpret results quickly.
  - Decide launch readiness with auditable evidence.

## Current Pain
- Evaluation is fragmented across ad hoc tests and manual review.
- Teams cannot consistently answer: "Are tests passing at launch quality bar?"

---

# 3. Goals & Non-Goals

## Goals (Must Be Measurable)
- Increase pre-production evaluation coverage
- Reduce release decision time after test completion
- Improve healthy deployments

## Non-Goals
- Full production monitoring and incident response orchestration (post-production focus is out of MVP).
- Non-technical end-user interfaces.
- Deep model retraining/fine-tuning workflows.

---

# 4. Success Metrics

## Primary Metric (North Star)
- **Number of Healthy Deployments** per sprint.
- **Formula:** Count of deployments where:
  1. Required pre-production gates are passed.
  2. No Sev1 quality/safety incident is reported within 7 days post-launch.

---

# 5. User Experience

## Core User Flow
1. User selects an agent workflow and baseline version.
2. User configures a hybrid evaluator set (template + generated + custom rules).
3. User runs pre-production evaluation and receives pass/fail gate output.
4. User inspects failed scenarios, traces, and root-cause hints.
5. User is recommended a summary of root cause analysis and recommendations for each failed scenario
6. User is given a summary of all problems and recommended action steps

## Before vs After
- **Before:** Manual test scripts, unclear readiness criteria, weak auditability.
- **After:** Structured pre-production gate with explainable results and recommended actions.

---

# 6. Solution Overview

## What Are We Building?
A frontend-first MVP that provides a guided pre-production evaluation workflow, hybrid evaluator composition, and root cause analysis summarizer.

## Key Features (MVP)

### Feature 1: Hybrid Evaluator Builder
- Combine template evaluators, generated evaluators, and custom evaluator rules.
- User story: As an ML engineer, I want flexible evaluator composition so I can match my workflow risk profile.
- Acceptance criteria:
  - User is able to define eval rules and give examples
  - User is able to read the definition for template evalutors
  - User can select at least one evaluator from each mode (template/generated/custom).
  - User can save evaluator configuration as reusable profile.
  - System validates evaluator config before run.

### Feature 2: Pre-Production Evaluation Gate
- Execute evaluations and produce pass/fail with score breakdown.
- User story: As an ML engineer, I want a clear gate result so I can make launch decisions confidently.
- Acceptance criteria:
  - Run returns deterministic summary: overall score, gate status, failed checks.
  - Failed checks are mapped to specific test cases.
  - Gate thresholds are visible and configurable within allowed bounds.

### Feature 3: Root cause analysis summarizer
- Provide potential root cause analysis with evidence as to source (traces, code)
- User story: As an ML engineer, I want to understand why a test failed or passed, and how to fix failed tests
- Acceptance criteria:
  - Explanation for why test passed, rationale, and sources
  - Explanation for why test failed, rationale, and sources
  - For failed tests, explain what can be done to fix
  - Summarize all issues and what can be done to fix at the top

---

# 7. Scope

## In Scope (MVP)
- Web UI prototype for evaluator setup, run review, and report export.
- Pre-production evaluation flow only.
- Hybrid evaluator configuration and gate logic.
- Deterministic scoring and summary outputs for interview prototype use.

## Out of Scope
- Real-time production telemetry ingestion.
- Automated remediation or incident routing.
- Enterprise auth/RBAC and multi-tenant controls.

---

# 8. Risks & Tradeoffs

## Key Risks
- **Adoption risk:** Engineers may keep manual workflows if setup feels heavy.
- **Technical risk:** Generated evaluators may be noisy without calibration.
- **Business risk:** False gate outcomes can either delay releases or allow regressions.

## Tradeoffs
- Hybrid evaluators were chosen over single-mode evaluators to balance speed and control.
- Frontend-first MVP prioritizes decision workflow clarity over deep backend integration.

---

# Interview Quality Checklist

- [x] Clear user
- [x] Clear problem
- [x] Measurable goals
- [x] Defined North Star
- [x] Explicit scope
- [x] Risks acknowledged
- [x] No vague language
