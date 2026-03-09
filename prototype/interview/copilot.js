const STORAGE_KEYS = {
  customizedEvals: "interview-customized-evals"
};

const REPO_SNIPPETS = {
  evaluatorLoop: {
    path: "prototype/prompt-2/src/evaluator.mjs",
    code: `for (const testCase of testCases) {
  const [baselineResponse, candidateResponse] = await Promise.all([
    provider.getResponse(baselineVersion, testCase),
    provider.getResponse(candidateVersion, testCase)
  ]);

  const baseline = scoreCase(testCase, baselineResponse, weights);
  const candidate = scoreCase(testCase, candidateResponse, weights);
}`
  },
  scoringWeights: {
    path: "prototype/prompt-2/src/scoring.mjs",
    code: `export function scoreCase(testCase, response, weights = { coverage: 0.6, format: 0.25, safety: 0.15 }) {
  const coverageScore = computeCoverageScore(testCase.expectedKeywords, response);
  const formatScore = computeFormatScore(testCase.requiredSections, response);
  const safetyScore = computeSafetyScore(testCase.bannedKeywords, response);

  const total =
    coverageScore * weights.coverage +
    formatScore * weights.format +
    safetyScore * weights.safety;
}`
  },
  regressionRules: {
    path: "prototype/prompt-2/src/scoring.mjs",
    code: `if (candidate.totalScore - baseline.totalScore < -thresholds.caseDelta) {
  reasons.push("score_drop");
}

if (baseline.safetyScore === 1 && candidate.safetyScore === 0) {
  reasons.push("new_safety_violation");
}

if (candidate.formatScore < thresholds.minFormatScore) {
  reasons.push("format_non_compliance");
}`
  },
  providerPolicy: {
    path: "prototype/prompt-2/src/providers/azureOpenAIProvider.mjs",
    code: `messages: [
  {
    role: "system",
    content:
      "You are an enterprise customer-support assistant. Always respond with sections: Action:, Why:, Confidence:."
  },
  {
    role: "system",
    content: promptHint
  }
]`
  }
};

const state = {
  recommendations: [],
  selectedRecommendationIds: []
};

const els = {
  chatThread: document.getElementById("chatThread"),
  chatSubhead: document.getElementById("chatSubhead"),
  recommendationChecklist: document.getElementById("recommendationChecklist"),
  createSelectedBtn: document.getElementById("createSelectedBtn"),
  customizeStatus: document.getElementById("customizeStatus")
};

init();

function init() {
  const params = new URLSearchParams(window.location.search);
  const contextType = params.get("contextType") || "repo";
  const context = params.get("context") || "";

  renderChat(contextType, context);
  renderChecklist();
  bindCreation();
}

function renderChat(contextType, context) {
  const safeContext = context || "(no context provided)";
  const contextLabel = contextType === "spec" ? "agent specification" : "GitHub repo";
  if (els.chatSubhead) {
    els.chatSubhead.textContent = `Generated from ${contextLabel}: ${safeContext}`;
  }

  const recommendations = getEvalRecommendations(context.toLowerCase());
  state.recommendations = recommendations;
  state.selectedRecommendationIds = recommendations.map((entry) => entry.id);

  const bubbles = [];
  bubbles.push(renderUserBubble(`Create evals from ${contextLabel}: ${safeContext}`));
  bubbles.push(renderAssistantIntro(contextLabel));

  recommendations.forEach((rec) => {
    bubbles.push(renderRecommendation(rec));
  });

  bubbles.push(renderAssistantOutro());
  if (els.chatThread) {
    els.chatThread.innerHTML = bubbles.join("");
  }
}

function renderChecklist() {
  if (!els.recommendationChecklist) {
    return;
  }

  els.recommendationChecklist.innerHTML = state.recommendations
    .map((recommendation) => {
      const checked = state.selectedRecommendationIds.includes(recommendation.id) ? "checked" : "";
      return `
        <li class="check-item">
          <label>
            <input type="checkbox" data-id="${recommendation.id}" ${checked} />
            <span>${escapeHtml(recommendation.title)}</span>
          </label>
        </li>
      `;
    })
    .join("");

  els.recommendationChecklist.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const id = checkbox.dataset.id;
      if (checkbox.checked) {
        if (!state.selectedRecommendationIds.includes(id)) {
          state.selectedRecommendationIds.push(id);
        }
      } else {
        state.selectedRecommendationIds = state.selectedRecommendationIds.filter((itemId) => itemId !== id);
      }
    });
  });
}

function bindCreation() {
  if (!els.createSelectedBtn) {
    return;
  }

  els.createSelectedBtn.addEventListener("click", () => {
    if (!state.selectedRecommendationIds.length) {
      setStatus("Select at least one recommendation.");
      return;
    }

    const selected = state.recommendations.filter((entry) => state.selectedRecommendationIds.includes(entry.id));
    const existing = loadCustomizedEvals();
    const existingIds = new Set(existing.map((entry) => entry.id));

    const created = selected
      .filter((entry) => !existingIds.has(entry.id))
      .map((entry) => {
        return {
          id: entry.id,
          title: entry.title,
          definition: entry.reason,
          passCriteria: entry.passCriteria,
          createdAt: new Date().toISOString()
        };
      });

    const merged = [...existing, ...created];
    saveCustomizedEvals(merged);

    const createdCount = created.length;
    const selectedCount = selected.length;
    setStatus(`Created ${createdCount} new evals (${selectedCount} selected). Open Deployment Center to view dashboard.`);
  });
}

function getEvalRecommendations(lowerInput) {
  const base = [
    {
      id: "regression_delta",
      title: "Regression Delta Evaluator",
      reason:
        "Your repo already compares baseline vs candidate output. Keep a dedicated eval that fails on score delta, format regression, or new safety violations.",
      passCriteria: "Pass if candidate score delta is greater than -0.03 and no new safety violation is detected.",
      snippet: REPO_SNIPPETS.regressionRules
    },
    {
      id: "weighted_quality",
      title: "Weighted Quality Score Evaluator",
      reason:
        "The scoring module already applies explicit coverage/format/safety weighting. Expose this as a configurable default eval in onboarding.",
      passCriteria: "Pass if weighted quality score is at least 0.80.",
      snippet: REPO_SNIPPETS.scoringWeights
    },
    {
      id: "pairwise_replay",
      title: "Pairwise Baseline-Candidate Replay",
      reason:
        "Your evaluator runs both versions against each test case in parallel. This supports out-of-the-box replay to catch regressions before deployment.",
      passCriteria: "Pass if candidate outperforms baseline on at least 90% of replayed cases.",
      snippet: REPO_SNIPPETS.evaluatorLoop
    }
  ];

  if (lowerInput.includes("policy") || lowerInput.includes("compliance") || lowerInput.includes("safety")) {
    return [
      {
        id: "policy_compliance",
        title: "Prompt Policy Compliance Evaluator",
        reason:
          "The provider prompt enforces response structure and policy-first behavior. Add an eval to verify those required sections are always present.",
        passCriteria: "Pass if Action, Why, and Confidence sections are present in at least 98% of responses.",
        snippet: REPO_SNIPPETS.providerPolicy
      },
      ...base
    ].slice(0, 3);
  }

  if (lowerInput.includes("tool") || lowerInput.includes("function")) {
    return [base[2], base[0], base[1]];
  }

  return base;
}

function renderUserBubble(content) {
  return `
    <article class="bubble user">
      <p class="meta">You</p>
      <p>${escapeHtml(content)}</p>
    </article>
  `;
}

function renderAssistantIntro(contextLabel) {
  return `
    <article class="bubble assistant">
      <p class="meta">Foundry Copilot</p>
      <p>
        I analyzed your ${escapeHtml(contextLabel)} and generated example evals to consider.
        Each suggestion includes why it matters and a snippet from the repo.
      </p>
    </article>
  `;
}

function renderRecommendation(recommendation) {
  return `
    <article class="bubble assistant">
      <p class="meta">Foundry Copilot</p>
      <section class="eval-card">
        <h3>${escapeHtml(recommendation.title)}</h3>
        <p>${escapeHtml(recommendation.reason)}</p>
        <p class="snippet-path">${escapeHtml(recommendation.snippet.path)}</p>
        <pre class="code-snippet"><code>${escapeHtml(recommendation.snippet.code)}</code></pre>
      </section>
    </article>
  `;
}

function renderAssistantOutro() {
  return `
    <article class="bubble assistant">
      <p class="meta">Foundry Copilot</p>
      <p>
        Next step: create selected evals and move to the Agent Deployment Center dashboard.
      </p>
    </article>
  `;
}

function loadCustomizedEvals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customizedEvals);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomizedEvals(evals) {
  try {
    localStorage.setItem(STORAGE_KEYS.customizedEvals, JSON.stringify(evals));
  } catch {
    // no-op for prototype mode
  }
}

function setStatus(message) {
  if (els.customizeStatus) {
    els.customizeStatus.textContent = message;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
