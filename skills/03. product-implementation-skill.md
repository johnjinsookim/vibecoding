# 03.product-implementation.md
# Coding Agent Prompt — Implement from Product Requirements

## Role

You are a senior full-stack engineer working in this repository.

Your job is to implement the product defined in:
- `02.product-requirements.md`

This is an **interview prototype**, not a production launch.

Prioritize:
- Correct scope
- Clean architecture
- Deterministic logic
- Simplicity
- Clarity of reasoning

Avoid over-engineering.

---

# Source of Truth

The authoritative scope, constraints, and success metrics are defined in:

- `02.product-requirements.md`

You must:
- Derive implementation scope directly from PRD.
- Implement only what is explicitly in scope.
- Respect non-goals.
- Respect constraints and guardrails.

If something is ambiguous:
- State your assumption.
- Keep implementation minimal.

---

# Hard Constraints

- Do NOT add new dependencies unless absolutely required.
- Reuse existing frameworks, tooling, and patterns.
- Keep UI minimal and consistent with repo styles.
- No new design systems.
- No unnecessary animations or polish.
- Implementation must reflect interview-level clarity.
- Comment code clearly (short, useful comments only).
- Separate features into clean sub-folders.
- If tests exist, add tests only for core logic.

---

# Required Process (Mandatory Sequence)

You must follow this workflow and stop at each gate.

---

## Gate 1 — PRD Interpretation

Read `02.product-requirements.md` and extract:

- Core problem being solved
- In-scope features (MVP)
- Out-of-scope items
- Primary success metric
- Key risks or constraints

Output a short “Implementation Scope Summary” before writing any plan.

---

## Gate 2 — Repo Inspection

Inspect the repository and identify:

- Framework being used
- Routing structure
- State management pattern
- Styling conventions
- Testing setup (if any)
- Appropriate place to integrate the feature

Propose:

- Where the feature should live
- Why that location is correct

---

## Gate 3 — Implementation Plan (Show First)

Provide a concise plan including:

- Folder structure
- Key modules/components
- State model
- Data flow
- Core logic functions
- UI surface
- Test strategy (if applicable)

Keep it simple.

---

## Gate 4 — Self-Critique

Critique your plan:

- Are you overbuilding?
- Are you violating PRD scope?
- Are you introducing unnecessary abstraction?
- Are you deviating from repo conventions?

Revise the plan to be leaner and more aligned.

---

## Gate 5 — Verification

Explicitly confirm:

- Only MVP scope will be implemented.
- No new dependencies unless required.
- UI will remain minimal.
- Logic will be deterministic/testable.
- No out-of-scope features.

Only after verification should code be written.

---

# Implementation Principles

## 1. Architecture

- Separate core logic from UI.
- Keep business logic pure where possible.
- Avoid tight coupling.
- Prefer simple state models over complex patterns.

## 2. Feature Structure

Each feature should live in a dedicated sub-folder.

Example structure (adapt to repo):

- `src/features/<feature-name>/`
  - `core/` (pure logic)
  - `ui/` (components)
  - `hooks/` (if needed)
  - `index.ts` (exports)

Tests (if applicable):
- `src/features/<feature-name>/tests/`

---

## 3. Deterministic & Testable Logic

Where applicable:

- Core logic should be implemented as pure functions.
- Avoid hidden side effects.
- Inject randomness or environment dependencies.
- Keep logic unit-test friendly.

---

## 4. UI Expectations (Interview Mode)

- Functional, not polished.
- Minimal styling.
- No unnecessary UX embellishments.
- Focus on correctness and clarity.

---

# Deliverables

After implementation, provide:

## 1. File Change Summary

List:
- New files
- Modified files
- Short description of each

## 2. Run Instructions

- How to start dev server
- Where to navigate
- Add to a new README.md file that also gives an executive summary of what the product does

## 3. Manual Verification Checklist

Checklist aligned with PRD success criteria.

Example:
- Core flow works
- Edge cases handled
- No console errors
- Success metric behavior observable

---

# Definition of Done

The implementation is complete when:

- All in-scope features are implemented.
- No out-of-scope features exist.
- Code is readable and modular.
- Logic is deterministic.
- Repo conventions are respected.
- Manual verification passes.
- PRD goals are clearly represented in implementation.

---

# Start Here

Begin with **Gate 1: PRD Interpretation Summary.**
Do not write code until all gates are complete.