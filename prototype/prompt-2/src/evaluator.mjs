import path from "node:path";
import { loadJson } from "./io.mjs";
import { detectRegression, scoreCase } from "./scoring.mjs";

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function runEvaluation({
  provider,
  dataDir,
  baselineVersion = "baseline",
  candidateVersion = "candidate",
  thresholds = { caseDelta: 0.08, meanDelta: 0.03, minFormatScore: 0.66 },
  weights
}) {
  const [testCases, promptVersions] = await Promise.all([
    loadJson(path.join(dataDir, "eval-cases.json")),
    loadJson(path.join(dataDir, "prompt-versions.json"))
  ]);

  const rows = [];

  for (const testCase of testCases) {
    const [baselineResponse, candidateResponse] = await Promise.all([
      provider.getResponse(baselineVersion, testCase),
      provider.getResponse(candidateVersion, testCase)
    ]);

    const baseline = scoreCase(testCase, baselineResponse, weights);
    const candidate = scoreCase(testCase, candidateResponse, weights);
    const delta = round(candidate.totalScore - baseline.totalScore);

    const regression = detectRegression({ baseline, candidate, thresholds });

    rows.push({
      caseId: testCase.id,
      title: testCase.title,
      input: testCase.input,
      baselineResponse,
      candidateResponse,
      baseline,
      candidate,
      delta,
      isRegression: regression.isRegression,
      reasons: regression.reasons
    });
  }

  const baselineScores = rows.map((row) => row.baseline.totalScore);
  const candidateScores = rows.map((row) => row.candidate.totalScore);

  const meanBaseline = round(average(baselineScores));
  const meanCandidate = round(average(candidateScores));
  const meanDelta = round(meanCandidate - meanBaseline);
  const regressions = rows.filter((row) => row.isRegression);

  const blockedByMeanDelta = meanDelta < -thresholds.meanDelta;
  const status = regressions.length > 0 || blockedByMeanDelta ? "fail" : "pass";

  return {
    generatedAt: new Date().toISOString(),
    provider: provider.name,
    versions: {
      baseline: promptVersions[baselineVersion],
      candidate: promptVersions[candidateVersion]
    },
    config: {
      thresholds,
      weights: weights || { coverage: 0.6, format: 0.25, safety: 0.15 }
    },
    summary: {
      status,
      totalCases: rows.length,
      regressionCount: regressions.length,
      blockedByMeanDelta,
      meanBaseline,
      meanCandidate,
      meanDelta
    },
    rows
  };
}
