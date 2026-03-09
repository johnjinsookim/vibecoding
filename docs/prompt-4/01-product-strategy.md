# Prompt
Design a capability in Azure AI Foundry for detecting when a clinical recommendation is incorrect and unsafe? Ideally, before the clinician reads the recommendation

## Clarifying questions
1. What is Azure AI Foundry?
- Enterprise grade agent factory
- Evals and observability
- Two types of evals: offline and online
- Online evaluations, gating, mitigation

2. What type of clinical recommendation? (AI tool was for clinical note taking)
- What did we discuss?
- Proper translation from dictation to what is recorded at a specific date

3. Success should be defined by preventing, rather than mitigating?

4. What do we mean by unsafe?
- Not compliant information being shared (security - PII not being hashed, sensitive information that is not health related)
- Information is being shared outside of people who can access the information (governance)
- Type of content being generated (safety - sexual, bad language, harmful)

5. Scope?
- Focus only on the frontend


## Mission
Azure AI Foundry empowers organizations ot understand, evaluate, and improve AI systems at scale. 


## Strategy
Enterprise-ready, one-stop-shop for creating agents. Differentiated from other organizations that only offer parts of the agentic stack, or are limited in model capabilities. 


## User personas
1. End users - clinicians
2. Systems & reliability engineers
3. ML engineers
4. Technical product managers

Non-technical personas are out of scope


## Pain points
End users don't know if they are looking at content that has hallucinations. Technical users are trying to prevent hallucinations from happening.

How might we proactively detect and mitigate hallucinations so that end users have a reliable experience?

## Solutions
1. Detect online issues in production
2. Mitigate issue by preventing generation and logging issue - agent re-runs prompt
3. Issue is flagged to technical team for debugging
4. Look at traces to understand what went wrong
5. Monitor eval metrics (performance, safety, reliability)
6. Offer recommendations on what went wrong and what to fix

## Success
North Star
- Number of Weekly Active Services
- (Count of agent services running in production using observability within Azure AI Foundry)