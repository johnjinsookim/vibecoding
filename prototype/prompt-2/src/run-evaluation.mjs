import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { runEvaluation } from "./evaluator.mjs";
import { saveJson } from "./io.mjs";
import { createMockProvider } from "./providers/mockProvider.mjs";
import { createAzureOpenAIProvider } from "./providers/azureOpenAIProvider.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const config = {
    provider: "mock",
    dataDir: path.join(projectRoot, "data"),
    outFile: path.join(projectRoot, "reports", "latest-report.json"),
    baselineVersion: "baseline",
    candidateVersion: "candidate"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--provider" && next) {
      config.provider = next;
      index += 1;
    } else if (token === "--data-dir" && next) {
      config.dataDir = path.resolve(next);
      index += 1;
    } else if (token === "--out" && next) {
      config.outFile = path.resolve(next);
      index += 1;
    } else if (token === "--baseline" && next) {
      config.baselineVersion = next;
      index += 1;
    } else if (token === "--candidate" && next) {
      config.candidateVersion = next;
      index += 1;
    }
  }

  return config;
}

async function buildProvider(providerName, dataDir) {
  if (providerName === "mock") {
    return createMockProvider(dataDir);
  }

  if (providerName === "azure") {
    return createAzureOpenAIProvider();
  }

  throw new Error(`Unsupported provider: ${providerName}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const provider = await buildProvider(args.provider, args.dataDir);

  const report = await runEvaluation({
    provider,
    dataDir: args.dataDir,
    baselineVersion: args.baselineVersion,
    candidateVersion: args.candidateVersion
  });

  await mkdir(path.dirname(args.outFile), { recursive: true });
  await saveJson(args.outFile, report);

  console.log("Evaluation complete");
  console.log(`Status: ${report.summary.status.toUpperCase()}`);
  console.log(`Regressions: ${report.summary.regressionCount}/${report.summary.totalCases}`);
  console.log(`Mean delta: ${report.summary.meanDelta}`);
  console.log(`Report: ${args.outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
