# Prompt
Design and implement an MVP product that enables users to get started out of the box observability when creating a new agent.

# Clarifying questions
1. Frontend prototype
2. User experience within Foundry
3. Users - developers at large enterprises
4. Product needs to be enterprise-grade
5. Out of the box - ready-set-go, no customization
6. Agent - language model + tool calling + memory

# WHY
- Mission: Empower organizations to understand, evaluate, and improve AI systems as scale
- Strategy: One-stop-shop, open
- Differentiation: interacts possibly with other parts of Foundry?

# WHO
- User persona: enterprise developers
- User journey: observability
1. Prototyping agent
2. Define offline evals 
3. Pass the offline evals
4. Productionize the agent
5. Monitor the agent

- User journey: evals
1. Spec-driven
- You give the agent full context on what you're trying to build
- Copilot to give feedback on what evals you should consider creating
- Agent that is able to translate the feedback into evals within Foundry

2. Codebase-driven
- Upload your repo
- Copilot to give feedback on what evals you should consider creating
- Agent that is able to translate the feedback into evals within Foundry

# WHAT
- What pain points do we want to prioritize in addressing
1. When do issues happen, and what is the issue? I want to be alerted as fast as possible.
2. How do we mitigate the issue? I want to be able to fix the issue quickly.
3. How do we save time? Auto-mitigate issues and guardrails.

Prioritize #1 considering the prompt.

# HOW
- Basic brainstorming of feature ideas

Feature #1: out-of-the-box evals
- Developer can log-in to GitHub and specify repo to connect
- Copilot reads repo to suggest which evals to create
- Developer confirms which evals to create
- Agent create the evals

Feature #2: agent deployment control
- Homebase for managing agent deployments
- Which agents you want to deploy
- The status of agent (development, production)
- The health of agent (development - offline evals; production - observability metrics as healthy, at risk, unhealthy)

Feature #3: dashboard
- Log-in and see a web view of core functional metrics (task completion rate, content safety), non-functional metrics (cost, latency, performance)
- You want to toggle and see the metrics of a period of time
- Set of templatized metrics
- Evals that you measured offline

Feature #4: logging & tracing
- More details logs within a given time period
- Traces that give information as to what went right or when wrong

Feature #5: anomaly detection + alerting
- Based on set of templatized metrics and evals, a out of the box anomaly detection and paging service
- Users can toggle on and off so that noisiness is reduced
