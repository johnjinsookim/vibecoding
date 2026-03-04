import path from "node:path";
import { loadJson } from "./io.mjs";
import {
  scoreCase,
  detectRegression,
  inferRootCause,
  recommendedActions,
  summarizeRecommendations
} from "./scoring.mjs";

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

function validateHybridEvaluatorSelection(selection) {
  const requiredModes = ["template", "generated", "custom"];
  const missingModes = requiredModes.filter((mode) => !(selection[mode]?.length));
  return {
    isValid: missingModes.length === 0,
    missingModes
  };
}

export async function runEvaluation({
  provider,
  dataDir,
  baselineVersion = "baseline",
  candidateVersion = "candidate",
  thresholds = { caseDelta: 0.08, meanDelta: 0.03, minFormatScore: 0.66 },
  weights = { coverage: 0.5, format: 0.25, safety: 0.25 },
  evaluatorSelection = {
    template: ["policy-template-v1"],
    generated: ["runtime-check-v1"],
    custom: ["enterprise-risk-rule-v1"]
  }
}) {
  const selectionValidation = validateHybridEvaluatorSelection(evaluatorSelection);
  if (!selectionValidation.isValid) {
    throw new Error(`Evaluator selection invalid. Missing modes: ${selectionValidation.missingModes.join(", ")}`);
  }

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

    const row = {
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
    };

    rows.push({
      ...row,
      rootCause: inferRootCause(row),
      recommendations: recommendedActions(row)
    });
  }

  const meanBaseline = round(average(rows.map((row) => row.baseline.totalScore)));
  const meanCandidate = round(average(rows.map((row) => row.candidate.totalScore)));
  const meanDelta = round(meanCandidate - meanBaseline);
  const regressionCount = rows.filter((row) => row.isRegression).length;
  const blockedByMeanDelta = meanDelta < -thresholds.meanDelta;

  return {
    runId: `run-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    provider: provider.name,
    versions: {
      baseline: promptVersions[baselineVersion],
      candidate: promptVersions[candidateVersion]
    },
    evaluatorSelection,
    config: {
      thresholds,
      weights
    },
    summary: {
      status: regressionCount || blockedByMeanDelta ? "fail" : "pass",
      totalCases: rows.length,
      regressionCount,
      blockedByMeanDelta,
      meanBaseline,
      meanCandidate,
      meanDelta
    },
    runSummary: summarizeRecommendations(rows),
    rows
  };
}
