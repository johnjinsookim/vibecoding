# Product Requirements Document: Confide MVP

---

# 1. Executive Summary

**What are we building?**  
A consumer career-coaching MVP with two "do now" products: 
- Quill, an AI resume coach
- Gandalf, a hybrid career coach that analyzes career gaps and combines AI guidance with monthly live coaching.

**Who is it for?**  
Primary users are early-career professionals with fewer than 10 years of experience who are unemployed, underemployed, or trying to make a near-term career transition.

**What problem are we solving?**  
Users do not know why they are being rejected, how to improve their resumes, or what concrete steps to take next to become competitive for better roles.

**Why now?**  
Traditional coaching is expensive, job platforms are noisy, and recent AI advances make personalized, affordable coaching viable for a mass market.

**North Star:**  
**Career Progression Success Rate**  
Definition: `% of active users who achieve a meaningful positive career outcome within 6 months`, including landing a relevant role, switching into a better-fit job, or completing a validated career-development milestone.

---

# 2. Problem Statement

## Target User
- Early-career professionals who need more direction than job boards provide.
- Users who are actively job searching or trying to pivot into a better-fit role.
- Users who cannot afford high-end coaching but still want personalized feedback.

## Current Pain
- Resumes are generic and often weak on quantified impact.
- Users receive rejections with no explanation and do not know what to change.
- Users are unsure whether they are targeting the right roles or whether they have major skill gaps.
- Existing solutions create activity, not clarity: more applications, more alerts, more noise.

---

# 3. Goals & Non-Goals

## Goals
- Help users materially improve their resumes with clear, actionable feedback.
- Help users understand whether they are aiming at the right roles and what gaps to close.
- Deliver affordable, personalized coaching with a credible path to measurable career progress.
- Use Quill as the high-frequency entry point and Gandalf as the higher-support, higher-trust offering.

## Non-Goals
- Building a full job marketplace or ATS.
- Covering networking outreach, interview coaching, or gamification in MVP.
- Guaranteeing job placement in MVP launch, even if Gandalf is designed toward that long-term promise.

---

# 4. User Experience

## Before vs After
**Before:** Users rewrite resumes alone, guess which jobs fit, and bounce between generic advice and expensive services.  
**After:** Users upload their background once, get targeted resume feedback from Quill, and can escalate to Gandalf for a deeper career-gap analysis and action plan with human coaching support.

## Core User Flow
1. User signs up and shares resume, work history, and target role.
2. User starts with Quill to get a resume grade, answer follow-up questions, and revise bullets.
3. User receives a clearer, stronger resume tailored to a target role or role family.
4. User upgrades or graduates to Gandalf for gap analysis, personalized recommendations, and a coaching roadmap.
5. Gandalf tracks whether the user is becoming more competitive and prepares the user for the next milestone.

---

# 5. Solution Overview

## What Are We Building?
Two connected MVP products in a single coaching experience:
- **Quill** solves immediate application-quality problems.
- **Gandalf** solves broader career-direction and gap-closure problems for users who need a more opinionated coaching plan.

## Key Features (MVP)

### Feature 1: Quill - Resume Coach
High-level: An AI coach that grades a user's resume, asks follow-up questions, and suggests better rewrites, especially around missing numbers, outcomes, and specificity.

User stories:
- As a job seeker, I want to know whether my resume is strong enough for the roles I want.
- As a user, I want the system to ask follow-up questions when my resume is vague so it can improve weak bullets.
- As a user, I want rewrite suggestions I can accept or edit instead of generic resume advice.

Acceptance criteria:
- User can upload or paste a resume and select a target role.
- System generates a resume grade with sub-scores for clarity, relevance, impact, and specificity.
- System asks at least 3 targeted follow-up questions when key details are missing, especially quantified results.
- System suggests rewritten bullets with visible rationale tied to the target role.
- User can accept, reject, or edit each suggestion before saving an updated resume version.

### Feature 2: Gandalf - Hybrid Career Coach
High-level: A higher-touch AI + human coaching product that analyzes career gaps, recommends what to do next, and includes monthly live coaching support.

User stories:
- As an underemployed or pivoting user, I want to know whether my target role is realistic right now.
- As a user, I want a personalized assessment of my gaps so I know which actions matter most.
- As a user, I want periodic live coaching to validate that I am on the right track and not just following generic AI advice.

Acceptance criteria:
- User can input current experience, target role, and constraints such as timeline or geography.
- System generates a gap analysis across experience, skills, credentials, and positioning.
- System produces a prioritized recommendation plan with near-term actions and longer-term development actions.
- System surfaces whether the user is "ready now," "close," or "needs significant development" for the selected target role.
- Product supports scheduling or redeeming one live coaching session per month for Gandalf subscribers.

---

# 6. Scope

## In Scope
- Resume ingestion, grading, follow-up questioning, and rewrite suggestions for Quill.
- Career-gap analysis, personalized recommendations, and coaching-plan generation for Gandalf.
- Shared user profile so Gandalf can build on the artifacts and history created in Quill.
- Basic subscription or tier separation between self-serve Quill and premium Gandalf experience.

## Non-Goals
- Job alerts and custom job database functionality.
- Networking outreach generation and person research.
- Interview coaching or pay-per-lead models.
- Money-back guarantee enforcement logic in MVP.

---

# 7. Success Metrics

## Primary Metric (North Star)
- **Career Progression Success Rate**
- **Formula:**  
  `(# active users with a meaningful positive career outcome in <=6 months) / (# active users)`

## Health Metrics

| Metric | Definition | Target |
|---|---|---|
| Quill Activation Rate | % new users who upload resume and receive first grade | `>=75%` |
| Resume Revision Completion Rate | % Quill users who finalize at least one revised resume | `>=60%` |
| Gandalf Plan Completion Rate | % Gandalf users who complete intake and receive a personalized plan | `>=80%` |
| Interview Start Rate | % active users who reach at least one interview within 90 days | `+25%` vs baseline |

## Countermetrics

| Countermetric | Risk | Guardrail |
|---|---|---|
| Generic Advice Complaint Rate | Product feels low-trust or repetitive | `<10%` |
| Resume Suggestion Rejection Rate | Rewrites are low quality or too aggressive | `<35%` |
| Gandalf Churn After First Month | Premium value proposition is weak | `<20%` |

---

# 8. Risks & Tradeoffs

## Key Risks
- **Adoption risk:** Users may not trust AI-generated resume feedback for a high-stakes job search.
- **Technical risk:** Quill may produce advice that sounds polished but is not actually role-relevant.
- **Business risk:** Gandalf may be expensive to deliver if live coaching usage is high relative to subscription price.

## Tradeoffs
- Starting with Quill and Gandalf prioritizes immediate value and differentiated coaching depth over broader platform coverage.
- Quill is easier to scale and validate quickly; Gandalf builds trust and willingness to pay but adds operational complexity.
- We are prioritizing personalized guidance over breadth, so networking, interview prep, and other assistants are intentionally deferred.

