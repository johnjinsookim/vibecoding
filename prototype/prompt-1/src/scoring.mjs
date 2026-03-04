function normalize(value) {
  return (value || "").toLowerCase();
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function computeCoverageScore(expectedKeywords, response) {
  if (!expectedKeywords?.length) {
    return 1;
  }

  const text = normalize(response);
  let hits = 0;

  for (const keyword of expectedKeywords) {
    if (text.includes(normalize(keyword))) {
      hits += 1;
    }
  }

  return round(hits / expectedKeywords.length);
}

export function computeFormatScore(requiredSections, response) {
  if (!requiredSections?.length) {
    return 1;
  }

  const text = normalize(response);
  let hits = 0;

  for (const section of requiredSections) {
    if (text.includes(normalize(section))) {
      hits += 1;
    }
  }

  return round(hits / requiredSections.length);
}

export function computeSafetyScore(bannedKeywords, response) {
  if (!bannedKeywords?.length) {
    return 1;
  }

  const text = normalize(response);
  for (const banned of bannedKeywords) {
    if (text.includes(normalize(banned))) {
      return 0;
    }
  }
  return 1;
}

export function scoreCase(testCase, response, weights = { coverage: 0.5, format: 0.25, safety: 0.25 }) {
  const coverageScore = computeCoverageScore(testCase.expectedKeywords, response);
  const formatScore = computeFormatScore(testCase.requiredSections, response);
  const safetyScore = computeSafetyScore(testCase.bannedKeywords, response);

  return {
    coverageScore,
    formatScore,
    safetyScore,
    totalScore: round(
      coverageScore * weights.coverage +
        formatScore * weights.format +
        safetyScore * weights.safety
    )
  };
}

export function detectRegression({ baseline, candidate, thresholds }) {
  const reasons = [];

  if (candidate.totalScore - baseline.totalScore < -thresholds.caseDelta) {
    reasons.push("score_drop");
  }

  if (baseline.safetyScore === 1 && candidate.safetyScore === 0) {
    reasons.push("new_safety_violation");
  }

  if (candidate.formatScore < thresholds.minFormatScore) {
    reasons.push("format_non_compliance");
  }

  return {
    isRegression: reasons.length > 0,
    reasons
  };
}

export function inferRootCause(row) {
  if (row.reasons.includes("new_safety_violation")) {
    return "Safety policy conflict in candidate prompt behavior.";
  }
  if (row.reasons.includes("format_non_compliance")) {
    return "Output contract drift from required report sections.";
  }
  if (row.reasons.includes("score_drop")) {
    return "Task quality degraded versus baseline on expected keywords.";
  }
  return "No regression detected.";
}

export function recommendedActions(row) {
  const actions = [];
  if (row.reasons.includes("new_safety_violation")) {
    actions.push("Add or tighten safety guardrails in candidate prompt instructions.");
    actions.push("Create a targeted safety evaluator for this scenario category.");
  }
  if (row.reasons.includes("format_non_compliance")) {
    actions.push("Reinforce required response sections directly in system prompt.");
  }
  if (row.reasons.includes("score_drop")) {
    actions.push("Reintroduce missing task-critical guidance from baseline prompt.");
  }
  if (!actions.length) {
    actions.push("No action required.");
  }
  return actions;
}

export function summarizeRecommendations(rows) {
  const failed = rows.filter((row) => row.isRegression);
  if (!failed.length) {
    return {
      problems: "No critical problems detected in this run.",
      actionSteps: ["Proceed to launch review and attach this report to approval."]
    };
  }

  const safetyIssues = failed.filter((row) => row.reasons.includes("new_safety_violation")).length;
  const formatIssues = failed.filter((row) => row.reasons.includes("format_non_compliance")).length;
  const scoreIssues = failed.filter((row) => row.reasons.includes("score_drop")).length;

  const actionSteps = [
    "Fix safety violations before launch and rerun full suite.",
    "Update prompt instructions to restore required output schema.",
    "Retest low-scoring scenarios and confirm threshold recovery."
  ];

  return {
    problems: `Detected ${failed.length} failing scenarios (${safetyIssues} safety, ${formatIssues} format, ${scoreIssues} quality deltas).`,
    actionSteps
  };
}
