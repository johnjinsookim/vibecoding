let report = null;
let showOnlyRegressions = false;

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

function renderSummary() {
  const statusBadge = document.getElementById("statusBadge");
  const versionLine = document.getElementById("versionLine");
  const metricsNode = document.getElementById("metrics");

  statusBadge.textContent = report.summary.status.toUpperCase();
  statusBadge.classList.add(report.summary.status === "pass" ? "status-pass" : "status-fail");

  versionLine.textContent = `Baseline: ${report.versions.baseline.id} (${report.versions.baseline.name}) | Candidate: ${report.versions.candidate.id} (${report.versions.candidate.name})`;

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

function renderRows() {
  const tbody = document.getElementById("resultsBody");
  const rows = showOnlyRegressions ? report.rows.filter((row) => row.isRegression) : report.rows;

  tbody.innerHTML = rows
    .map((row, index) => {
      const deltaClass = row.delta < 0 ? "delta-negative" : "delta-positive";
      const regressionPill = row.isRegression
        ? '<span class="pill pill-fail">REGRESSION</span>'
        : '<span class="pill pill-pass">PASS</span>';
      const reasons = row.reasons.length ? row.reasons.join(", ") : "-";
      const rowClass = row.isRegression ? "regression" : "";

      return `
        <tr data-index="${index}" class="${rowClass}">
          <td>${row.title}</td>
          <td>${row.baseline.totalScore.toFixed(4)}</td>
          <td>${row.candidate.totalScore.toFixed(4)}</td>
          <td class="${deltaClass}">${formatSigned(row.delta)}</td>
          <td>${regressionPill}</td>
          <td>${reasons}</td>
        </tr>
      `;
    })
    .join("");

  const sourceRows = showOnlyRegressions ? report.rows.filter((row) => row.isRegression) : report.rows;
  Array.from(tbody.querySelectorAll("tr")).forEach((tr) => {
    tr.addEventListener("click", () => {
      const index = Number(tr.getAttribute("data-index"));
      renderDetails(sourceRows[index]);
    });
  });

  renderDetails(sourceRows[0]);
}

function renderDetails(row) {
  const details = document.getElementById("detailsContent");

  if (!row) {
    details.innerHTML = "<p class='muted'>No rows to display.</p>";
    return;
  }

  details.innerHTML = `
    <article class="detail-card">
      <h3>Input</h3>
      <pre>${row.input}</pre>
    </article>
    <article class="detail-card">
      <h3>Regression Reasons</h3>
      <pre>${row.reasons.length ? row.reasons.join(", ") : "None"}</pre>
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
  const showAllBtn = document.getElementById("showAllBtn");
  const showRegressionsBtn = document.getElementById("showRegressionsBtn");

  showAllBtn.addEventListener("click", () => {
    showOnlyRegressions = false;
    showAllBtn.classList.add("active");
    showRegressionsBtn.classList.remove("active");
    renderRows();
  });

  showRegressionsBtn.addEventListener("click", () => {
    showOnlyRegressions = true;
    showRegressionsBtn.classList.add("active");
    showAllBtn.classList.remove("active");
    renderRows();
  });
}

async function start() {
  try {
    report = await loadReport();
    renderSummary();
    wireControls();
    renderRows();
  } catch (error) {
    document.body.innerHTML = `
      <div class="page">
        <section class="panel">
          <h1>Unable to load report</h1>
          <p class="muted">Run <code>node src/run-evaluation.mjs</code> from <code>prototype/prompt-regression</code>, then refresh.</p>
          <pre>${error.message}</pre>
        </section>
      </div>
    `;
  }
}

start();
