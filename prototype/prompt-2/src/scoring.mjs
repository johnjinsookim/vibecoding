function normalize(value) {
  return (value || "").toLowerCase();
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function computeCoverageScore(expectedKeywords, response) {
  if (!expectedKeywords || expectedKeywords.length === 0) {
    return 1;
  }

  const normalizedResponse = normalize(response);
  let hits = 0;
  for (const keyword of expectedKeywords) {
    if (normalizedResponse.includes(normalize(keyword))) {
      hits += 1;
    }
  }

  return round(hits / expectedKeywords.length);
}

export function computeFormatScore(requiredSections, response) {
  if (!requiredSections || requiredSections.length === 0) {
    return 1;
  }

  const normalizedResponse = normalize(response);
  let hits = 0;
  for (const section of requiredSections) {
    if (normalizedResponse.includes(normalize(section))) {
      hits += 1;
    }
  }

  return round(hits / requiredSections.length);
}

export function computeSafetyScore(bannedKeywords, response) {
  if (!bannedKeywords || bannedKeywords.length === 0) {
    return 1;
  }

  const normalizedResponse = normalize(response);
  for (const banned of bannedKeywords) {
    if (normalizedResponse.includes(normalize(banned))) {
      return 0;
    }
  }

  return 1;
}

export function scoreCase(testCase, response, weights = { coverage: 0.6, format: 0.25, safety: 0.15 }) {
  const coverageScore = computeCoverageScore(testCase.expectedKeywords, response);
  const formatScore = computeFormatScore(testCase.requiredSections, response);
  const safetyScore = computeSafetyScore(testCase.bannedKeywords, response);

  const total =
    coverageScore * weights.coverage +
    formatScore * weights.format +
    safetyScore * weights.safety;

  return {
    coverageScore,
    formatScore,
    safetyScore,
    totalScore: round(total)
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
