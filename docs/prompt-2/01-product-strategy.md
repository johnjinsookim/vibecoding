# Product Strategy: Evaluation Pipeline and Azure AI Foundry UI for Prompt Regressions

## 1. Executive Summary
The mission is to make prompt iteration safe and fast for enterprise AI teams. The current gap is that prompt edits are often shipped without objective regression checks, causing production incidents and rollback churn. Our strategy is to build a pre-release evaluation pipeline and a clear Azure AI Foundry-style UI that highlights regressions before deployment. By solving unreliable manual QA for prompt engineers and AI product owners, we unlock faster release velocity and lower operational risk through automated offline evaluations, gating, and explainable result dashboards.

**North Star Metric:** `Regression Escape Rate`, defined as `% of prompt releases with user-visible quality regression not detected pre-release`, with a 12-month target of `<2%`.

## 2. Clarifying Questions
1. Key terms: A prompt regression means a meaningful drop in task quality, safety, or policy compliance versus baseline on a fixed eval set.
2. Constraints: 8-12 week MVP, no net-new ML infra, runs in CI, supports Azure-hosted model endpoints, and follows internal data rules.
3. Target users: In scope are prompt engineers, AI PMs, and responsible AI reviewers. Out of scope are end-user analytics and model fine-tuning workflows.
4. Business objective: Reduce failed releases and post-release rollback incidents while improving safe prompt release frequency.
5. Geography/channel: Launch first to internal US-based product teams through Azure AI Foundry project workspaces and existing CI/CD workflows.

## 3. The Why
### Current State
- Prompt changes are validated with ad hoc spot checks and inconsistent evaluator criteria.
- Teams lack a single place to compare baseline vs candidate behavior with pass/fail gates.
- Release decisions are slow, subjective, and prone to late-stage surprises.

### Gap
- Manual checks miss edge cases (safety, formatting, factuality), leading to production regressions.
- Root cause analysis is expensive because evidence is fragmented across notebooks, logs, and spreadsheets.
- Typical impact: delayed launches, engineering fire drills, and reputational risk.

### Future Vision
- Every prompt change runs through a standard evaluation suite with objective score deltas and policy checks.
- Foundry UI presents regression risk, case-level diffs, and release recommendation in one workflow.
- Why now: enterprise AI adoption is accelerating, and prompt iteration volume is now high enough that manual QA no longer scales.

## 4. The Who
### Stakeholders (MECE) and Prioritization
| Stakeholder | Entry Barrier | Right-to-Win | Market Size | Priority | Rationale |
|---|---|---|---|---|---|
| Prompt Engineering Team | L | H | H | 1 | Owns prompt lifecycle and directly benefits from faster, safer iteration. |
| AI Product Managers | M | H | H | 1 | Needs release confidence and clear go/no-go signal. |
| Responsible AI / Risk Team | M | M | M | 2 | Requires evidence of policy compliance and auditability. |

### Ecosystem Archetypes (within prioritized stakeholder)
| Ecosystem Archetype | Entry Barrier | Right-to-Win | Market Size | Priority | Rationale |
|---|---|---|---|---|---|
| Internal Copilot Teams | L | H | H | 1 | Frequent prompt updates and clear regression pain today. |
| External-Facing Support Bots | M | H | H | 1 | Customer impact is direct; regression cost is high. |
| RAG Knowledge Assistants | M | M | M | 2 | Needs domain-specific evals; follows after core workflow is proven. |

### User Personas (served by archetypes)
| User Persona | Entry Barrier | Right-to-Win | Market Size | Priority | Rationale |
|---|---|---|---|---|---|
| Prompt Engineer | L | H | H | 1 | Daily user of eval pipeline and first-line owner of regressions. |
| AI Product Manager | L | H | H | 1 | Consumes release gates and trend dashboards for planning. |
| RAI Reviewer | M | M | M | 2 | Uses safety and compliance evidence for sign-off. |

## 5. The What
### User Journey and Pain Points
| Journey Step | User Goal | Current Experience | Pain Point | Evidence |
|---|---|---|---|---|
| Edit prompt | Improve response quality | Local trial-and-error | Quality changes are subjective and non-repeatable | Teams keep private test prompts/spreadsheets |
| Run validation | Detect regressions early | Manual sample checks | Incomplete coverage and hidden failures | Regressions found after deployment |
| Review results | Decide release readiness | Scattered logs/notes | No clear baseline comparison or gate outcome | Long decision meetings |
| Ship or rollback | Release safely | Reactive monitoring | Costly post-release rollback | Incident tickets tied to prompt edits |

### Pain Point Prioritization
| Pain Point | Severity | Frequency | Willingness to Pay | Market Size | Existing Alternatives | Priority |
|---|---|---|---|---|---|---|
| No automated regression gating | H | H | H | H | Weak | 1 |
| No explainable baseline vs candidate diff | H | H | H | H | Moderate | 1 |
| Safety checks not integrated in release flow | H | M | H | M | Moderate | 2 |

## 6. The How
### Solution Options for the Top Prioritized Pain Point
| Solution | Detailed Description | Hypothesis (Why it should work) | Impact | Effort | Risks/Trade-offs |
|---|---|---|---|---|---|
| CI score threshold only | Compute aggregate score and block if below threshold | Fastest to adopt in engineering pipelines | M | L | Opaque failure reasons; low trust from PM/RAI |
| Full evaluation pipeline + Foundry UI | Case-level scoring, regression reasons, release gate summary in UI | Combines objective quality + explainability for faster decisions | H | M | Requires UI and data model design |
| Human review queue only | Route all prompt changes to manual reviewers | Improves safety with human oversight | L | H | Slow, expensive, not scalable |
| Real-time online shadow eval | Evaluate prompts against live traffic samples | Best realism for regressions | H | H | Infra complexity, privacy and latency concerns |
| Third-party eval SaaS integration | Buy external evaluator and dashboard | Reduces build time | M | M | Data governance and vendor lock-in risk |

### Prioritized Solution
- **Chosen solution:** Full evaluation pipeline + Foundry UI.
- **Reason for prioritization:** Best balance of trust, speed, and scalability; clear evidence for cross-functional go/no-go decisions.
- **Validation plan:** Pilot on 2 internal copilot teams; run in parallel with current manual QA for 4 weeks; compare escaped regressions and release lead time.
- **Scalability path:** Add task-specific evaluators, multilingual suites, and continuous monitoring after stable MVP adoption.

### Metrics Framework
#### North Star Metric (up to 3)
| Priority | Metric | Definition | What It Captures Well | What It Misses | Reason for Prioritization |
|---|---|---|---|---|---|
| p0 | Regression Escape Rate | `(# prompt releases with post-release regression) / (total prompt releases)` | True business risk outcome | Slow feedback loop | Core metric for release safety |
| p1 | Pre-release Regression Catch Rate | `(# regressions detected pre-release) / (# total regressions discovered pre + post)` | Pipeline detection effectiveness | Depends on complete incident tagging | Measures evaluator quality |
| p2 | Prompt Release Cycle Time | Median time from prompt PR open to deploy | Developer productivity impact | Not quality-specific by itself | Ensures process does not slow teams down |

#### Health Metrics
| User Journey Stage | Metric | Why It Matters |
|---|---|---|
| Edit prompt | Number of evaluated prompt iterations/week | Adoption and habitual use |
| Run validation | Evaluation completion rate in CI | Operational reliability |
| Review results | Mean time to decision after eval run | Decision clarity |
| Ship | % releases blocked due to true positive regressions | Gate effectiveness |

#### Counter-metrics
| Metric | What It Detects | Why It Matters |
|---|---|---|
| False Positive Block Rate | Overly strict gates | Prevents unnecessary delivery slowdowns |
| False Negative Rate | Missed regressions | Prevents hidden production risk |
| Evaluation Cost per Run | Token/runtime cost drift | Controls unit economics |

#### Safety & Quality Metrics
| Metric | Risk/Quality Dimension | Acceptable Range | Escalation Rule | Owner |
|---|---|---|---|---|
| Safety Violation Rate | Harmful/policy-breaking outputs | `<0.5%` of eval cases | Any run >1.0% triggers mandatory RAI review | RAI reviewer |
| Format Compliance Rate | Output contract validity | `>=98%` | Drop below 95% blocks release | Prompt engineer |
| Groundedness / Factuality Score | Hallucination risk | No regression >2 pts vs baseline | Any critical domain regression blocks release | AI PM |
