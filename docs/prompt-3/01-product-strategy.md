# Agentic System Observability & Evaluation
Product that evaluates our AI systems before deployment. Evaluate and detect issues in production. Enables compliance-grade reporting.


## Executive Summary
Agentic AI systems are rapidly emerging, but organizations struggle to deploy them safely at scale because evaluating and monitoring agent behavior remains fragmented, manual, and unreliable. Without robust evaluation and observability, teams cannot confidently launch agents into production or continuously improve them.

Azure AI Foundry addresses this gap by providing a unified platform for building, evaluating, monitoring, and governing AI agents across multiple models. By combining comprehensive evaluation frameworks, production observability, and enterprise-grade governance, Foundry enables teams to deploy reliable AI agents faster and operate them safely at scale.

Unlike point solutions that address only parts of the AI lifecycle, Azure AI Foundry offers a full-stack platform integrated with Azure infrastructure, security, and compliance, making it the most trusted environment for enterprise AI systems.

Success will be measured by the growth of Weekly Active Agentic Services using evaluation and observability, reflecting the number of AI systems confidently operating in production on Azure.


## Mission
Empower organizations to understand, evaluate, and continuously improve AI systems at scale

Currently, evaluating and observing agents is a manual, bespoke process, which can stall progress. The future of evaluating and observing agents should be simpler so that organizations can realize value from agents quickly.


## Strategy
Azure AI Foundry is a one-stop-shop that allows organizations to build, deploy, evaluate, monitor, and govern agents with many models. Other competitors either offer parts of the agentic building process, or are limited in model offerings. 


## Users
Observability and Evaluation are tools used primarily by four technical personas.
1. Product managers
2. ML engineers
3. Systems & reliability engineers
4. Security engineers

Non-technical users typically do not use these tools, and have to rely on other technical users to triage and understand issues.


## Pain Points
1. What tests should I implement? 
Agents can be hard to test because there are many edge cases, and use cases are not deterministic. 

2. Will this agent play well with other agents?
Multi-agent systems introduce even more complexity. Tests may pass for a given agent, but then fail when tested with multi-agent systems because there are many interdependencies -- prompts, tool calls, memory.

3. Should I launch this agent into PROD?
Even if agents pass tests in pre-PROD, there is no guarantee that the agents can operate at production scale. Observability -- and the right monitors -- is critical for not flying blind.

4. What should I do if an issue occurs?
De-bugging issues in production can be difficult because of the complex, probabiliistic nature of agents.

5. Are there enterprise compliance, safety, or security issues?
Deploying agents at enterprise scales means more than just technical feasibility. Agents have to comply protocols, generate safe actions, and be protected from security threats.

6. How do I ensure efficient cost spending?
Using language models for either online or offline evaluations will use tokens, which will bill costs. Teams will want to understand how much is being spent, and how to improve spending.


## Solutions
Overall principles is that solutions should be:

1. Comprehensive
Help teams think through edge cases, create thorough evals, and consider multi-agent systems.

2. Proactive
Help teams get a head of performance, compalice, safety, and security issues by root causing and offering recommendations quickly.

3. Efficient
Help teams manage costs of using language models for either online or offline evaluation.


## Metrics
### North Star
Number of Weekly Active Agentic Services (WAAS) using observability and evals, both offline and online

![Alt text: Weekly Active Agentic Services trend chart placeholder](./assets/waas-trend-placeholder.png)
