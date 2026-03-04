let report = null;
let showOnlyRegressions = false;
const PROFILE_KEY = "prompt1-evaluator-profile";

async function loadReport() {
  const response = await fetch("./reports/latest-report.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load report (${response.status})`);
  }
  return response.json();
}

function formatSigned(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(4)}`;
}

function collectProfileFromUi() {
  const selected = { template: [], generated: [], custom: [] };
  document.querySelectorAll("input[type='checkbox'][data-mode]").forEach((input) => {
    if (input.checked) {
      selected[input.getAttribute("data-mode")].push(input.value);
    }
  });
  return selected;
}

function validateProfile(profile) {
  const missing = ["template", "generated", "custom"].filter((mode) => !profile[mode].length);
  return {
    isValid: missing.length === 0,
    missing
  };
}

function applySavedProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    return;
  }

  try {
    const profile = JSON.parse(raw);
    document.querySelectorAll("input[type='checkbox'][data-mode]").forEach((input) => {
      const mode = input.getAttribute("data-mode");
      input.checked = profile[mode]?.includes(input.value) || false;
    });
  } catch {
    localStorage.removeItem(PROFILE_KEY);
  }
}

function setProfileMessage(message, isError = false) {
  const node = document.getElementById("profileMessage");
  node.textContent = message;
  node.style.color = isError ? "#c03636" : "#5a647a";
}

function renderSummary() {
  const statusBadge = document.getElementById("statusBadge");
  const versionLine = document.getElementById("versionLine");
  const metricsNode = document.getElementById("metrics");

  statusBadge.textContent = report.summary.status.toUpperCase();
  statusBadge.classList.add(report.summary.status === "pass" ? "status-pass" : "status-fail");

  versionLine.textContent = `Run ${report.runId} | Baseline: ${report.versions.baseline.id} | Candidate: ${report.versions.candidate.id}`;

  const metrics = [
    { label: "Total Cases", value: `${report.summary.totalCases}` },
    { label: "Regressions", value: `${report.summary.regressionCount}` },
    { label: "Mean Baseline", value: `${report.summary.meanBaseline.toFixed(4)}` },
    { label: "Mean Candidate", value: `${report.summary.meanCandidate.toFixed(4)}` },
    { label: "Mean Delta", value: formatSigned(report.summary.meanDelta) }
  ];

  metricsNode.innerHTML = metrics
    .map(
      (metric) => `
      <article class="metric-card">
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">${metric.value}</div>
      </article>
    `
    )
    .join("");
}

function renderRunSummary() {
  document.getElementById("problemSummary").textContent = report.runSummary.problems;
  document.getElementById("actionSteps").innerHTML = report.runSummary.actionSteps
    .map((step) => `<li>${step}</li>`)
    .join("");
}

function renderRows() {
  const sourceRows = showOnlyRegressions ? report.rows.filter((row) => row.isRegression) : report.rows;

  const tbody = document.getElementById("resultsBody");
  tbody.innerHTML = sourceRows
    .map((row, index) => {
      const deltaClass = row.delta < 0 ? "delta-negative" : "delta-positive";
      const pill = row.isRegression
        ? '<span class="pill pill-fail">REGRESSION</span>'
        : '<span class="pill pill-pass">PASS</span>';

      return `
        <tr data-index="${index}" class="${row.isRegression ? "regression" : ""}">
          <td>${row.title}</td>
          <td>${row.baseline.totalScore.toFixed(4)}</td>
          <td>${row.candidate.totalScore.toFixed(4)}</td>
          <td class="${deltaClass}">${formatSigned(row.delta)}</td>
          <td>${pill}</td>
          <td>${row.reasons.length ? row.reasons.join(", ") : "-"}</td>
        </tr>
      `;
    })
    .join("");

  Array.from(tbody.querySelectorAll("tr")).forEach((tr) => {
    tr.addEventListener("click", () => {
      const row = sourceRows[Number(tr.getAttribute("data-index"))];
      renderDetails(row);
    });
  });

  renderDetails(sourceRows[0]);
}

function renderDetails(row) {
  const details = document.getElementById("detailsContent");
  if (!row) {
    details.innerHTML = "<p class='muted'>No row selected.</p>";
    return;
  }

  details.innerHTML = `
    <article class="detail-card">
      <h3>Input</h3>
      <pre>${row.input}</pre>
    </article>
    <article class="detail-card">
      <h3>Root Cause</h3>
      <pre>${row.rootCause}</pre>
    </article>
    <article class="detail-card">
      <h3>Recommendations</h3>
      <pre>${row.recommendations.join("\n")}</pre>
    </article>
    <article class="detail-card">
      <h3>Baseline Response</h3>
      <pre>${row.baselineResponse}</pre>
    </article>
    <article class="detail-card">
      <h3>Candidate Response</h3>
      <pre>${row.candidateResponse}</pre>
    </article>
  `;
}

function wireControls() {
  document.getElementById("showAllBtn").addEventListener("click", () => {
    showOnlyRegressions = false;
    document.getElementById("showAllBtn").classList.add("active");
    document.getElementById("showRegressionsBtn").classList.remove("active");
    renderRows();
  });

  document.getElementById("showRegressionsBtn").addEventListener("click", () => {
    showOnlyRegressions = true;
    document.getElementById("showRegressionsBtn").classList.add("active");
    document.getElementById("showAllBtn").classList.remove("active");
    renderRows();
  });

  document.getElementById("validateProfileBtn").addEventListener("click", () => {
    const profile = collectProfileFromUi();
    const validation = validateProfile(profile);
    if (validation.isValid) {
      setProfileMessage("Profile is valid for hybrid evaluator mode.");
    } else {
      setProfileMessage(`Missing evaluator mode(s): ${validation.missing.join(", ")}`, true);
    }
  });

  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    const profile = collectProfileFromUi();
    const validation = validateProfile(profile);
    if (!validation.isValid) {
      setProfileMessage(`Cannot save invalid profile. Missing: ${validation.missing.join(", ")}`, true);
      return;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setProfileMessage("Reusable profile saved locally.");
  });

  document.getElementById("downloadReportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.runId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  });
}

async function start() {
  try {
    applySavedProfile();
    report = await loadReport();
    renderSummary();
    renderRunSummary();
    renderRows();
    wireControls();
    setProfileMessage("Loaded report and evaluator profile.");
  } catch (error) {
    document.body.innerHTML = `
      <div class="page">
        <section class="panel">
          <h1>Unable to load report</h1>
          <p class="muted">Run <code>node src/run-evaluation.mjs</code> in <code>prototype/prompt-1</code>, then refresh.</p>
          <pre>${error.message}</pre>
        </section>
      </div>
    `;
  }
}

start();
