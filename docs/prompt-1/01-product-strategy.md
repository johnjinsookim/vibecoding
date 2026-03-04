# Agentic System Observability
Product that evaluates our AI systems before deployment. Evaluate and detect issues in production. Enables compliance-grade reporting.

## Executive Summary


## Clarifying Questions
### Key Terminology
1. Pre-production: automated evals, whether custom or automated
2. Post-production = evaluate issues in performance, potential issues, quality
3. Compliance-grade reporting = help compliance understand what went wrong based on traces

### Constraints
- Stick to frontend prototyping
- Web, not mobile
- MVP prototype
- Focus on pre-production for now; expand if time

### Users
- Non-technical users are out-of-scope
- More technical users (engineers, product managers)


## Why
Mission of system observability is to help organizations reach positive ROI on their agentic implementation. 

Current state - manual methods for pre-prod evaluation, production monitoring, or compliance reporting.

Gap - at scale, manual methods are not scalable.

Future - how do we help product reliable agentic systems with robust observability at scale


## Who
### Ecosystem
- Big Tech (Vertex, Sagemaker, Foundry)
- Data + AI Platform (Palantirs, Scale AI, Databricks)
- Point solutions (Arize, Galileo)

Strategy for Azure AI Foundry = one-stop-shop --> "you don't need multiple tools to develop, launch, and monitor agents; you just need Foundry."


### User Personas
1. Product managers
2. ML engineers
3. System engineers

### Prioritized personas
ML engineer


## What
### User journey
1. Use Azure AI Foundry to get model
2. Plug in knowledge and app connectors to model
3. Create custom workflow
4. Create evals
5. Test and see if agentic workflow is accurate
6. If pass eval test, proceed to launch; if not, fix
7. Once launch to prod, observe for errors
8. If error, root cause & fix

### Pain points
1. I am unsure if I should launch this agent into prod because I don't know if my tests are passing
2. I am unsure when an issue occurs
3. I am unsure what to do if an issue occurs

### Prioritized pain point
1. I am unsure if I should launch this agent into prod because I don't know if my tests are passing

## How
### Potential solutions
1. Custom evaluator
2. Generated evaluator
3. Template evaluator
4. Hybrid evaluator

### Prioritized solution
Hybrid evaluator

### Trade-off's
How much work vs. how much customization

### Metrics
#### North Star
Number of Healthy Deployments