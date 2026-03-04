import path from "node:path";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { runEvaluation } from "./evaluator.mjs";
import { saveJson } from "./io.mjs";
import { createMockProvider } from "./providers/mockProvider.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function main() {
  const dataDir = path.join(projectRoot, "data");
  const outputFile = path.join(projectRoot, "reports", "latest-report.json");

  const provider = await createMockProvider(dataDir);
  const report = await runEvaluation({ provider, dataDir });

  await mkdir(path.dirname(outputFile), { recursive: true });
  await saveJson(outputFile, report);

  console.log(`Run ID: ${report.runId}`);
  console.log(`Status: ${report.summary.status.toUpperCase()}`);
  console.log(`Regressions: ${report.summary.regressionCount}/${report.summary.totalCases}`);
  console.log(`Report: ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
