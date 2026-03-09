# Prompt
- Major shopping retailer uses Azure AI Foundry for answering shopping questions, like Rufus
- Design a system for detecting issues and root causes

## Clarifying Questions
- Shopping questions: finding product pricing
- Detecting issues: online evaluation
- Root cause: trace and explain what happened, perhaps even recommend a fix

## Executive Summary
- Mission: empower organizations to understand, evaluate, improve AI systems at enterprise scale
- Strategy: one-stop-shop for creating agents with many model options
- North Star: weekly active agentic services


## User Personas
1. Technical product manager
2. Reliability engineer
3. Machine learning engineers

Non-technical users are out-of-scope
- Non-technical users don't experience too much of a disruption with AI services
- If non-technical users need a report of what went wrong and how to fix, this work would be done through the technical users

User journey:
1. User wants to find the best price for a given item
2. User uses AI chatbot to find or compare prices
3. AI chatbot gives an answer
- Good -- great!
- Bad -- oh no!
4. If bad answer, then system should flag and user is prompted to retry or is told information is not currently available
5. If bad answer and system doesn't flag, then user can flag as bad response

## Pain Points
1. ACCURACY -- How do you ensure that system detects hallucinations for either data that isn't available or for data that is available 
2. SCALABILITY -- How do you ensure that system provides a way for automated detection + user-inputted detection?
3. USABILITY -- How quickly can you root cause and mitigate the issue?

## Product Principles
How might we create a online observability and evaluation service that empowers technical teams to detect issues accurately and resolve scalably? 

## Solutions
1. Analytics dashboard -- to show trends in detected issues, either by LLM-as-a-Judge (automated) or from users (flagged as inaccurate)
2. Configure evals -- to create custom evals to define what constitutes as inaccurate pricing outputs
3. Logs with traces -- to deep dive into what went wrong, with an explanation and suggested fix
4. Monitors -- anomaly detection service with alerting