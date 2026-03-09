const STORAGE_KEYS = {
  customizedEvals: "interview-customized-evals",
  deploymentRows: "interview-deployment-eval-dashboard"
};

const AGENT_ROWS = [
  { id: "agent-support-dev", agent: "Customer-Support-Agent-1", environment: "development" },
  { id: "agent-support-prod", agent: "Customer-Support-Agent-2", environment: "production" },
  { id: "agent-triage-dev", agent: "Document-Triage-Agent-1", environment: "development" },
  { id: "agent-triage-prod", agent: "Document-Triage-Agent-2", environment: "production" }
];

const state = {
  evalRows: [],
  evalTypeFilter: "all",
  agentFilter: "all",
  envFilter: "all",
  statusFilter: "all",
  healthFilter: "all",
  selectedAgentRowId: null
};

const els = {
  sideRail: document.getElementById("sideRail"),
  createAgentNav: document.getElementById("createAgentNav"),
  deploymentCenterNav: document.getElementById("deploymentCenterNav"),
  evalTypeFilter: document.getElementById("evalTypeFilter"),
  agentFilter: document.getElementById("agentFilter"),
  envFilter: document.getElementById("envFilter"),
  statusFilter: document.getElementById("statusFilter"),
  healthFilter: document.getElementById("healthFilter"),
  healthRows: document.getElementById("healthRows"),
  agentDetailsPanel: document.getElementById("agentDetailsPanel"),
  closeAgentDetailsBtn: document.getElementById("closeAgentDetailsBtn"),
  agentJsonOutput: document.getElementById("agentJsonOutput")
};

init();

function init() {
  bindRail();
  bindFilters();
  bindPanelClose();
  hydrateEvalRows();
  populateAgentFilter();
  renderHealthTable();
  openFirstVisibleAgent();
}

function bindRail() {
  if (els.createAgentNav && els.sideRail) {
    els.createAgentNav.addEventListener("mouseenter", () => {
      els.sideRail.classList.add("expanded");
    });
    els.createAgentNav.addEventListener("focus", () => {
      els.sideRail.classList.add("expanded");
    });
  }

  if (els.sideRail) {
    els.sideRail.addEventListener("mouseleave", () => {
      els.sideRail.classList.remove("expanded");
    });
  }

  if (els.createAgentNav) {
    els.createAgentNav.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
  }

  if (els.deploymentCenterNav) {
    els.deploymentCenterNav.addEventListener("click", () => {
      window.location.href = "./deployment-center.html";
    });
  }
}

function bindFilters() {
  if (els.evalTypeFilter) {
    els.evalTypeFilter.addEventListener("change", (event) => {
      state.evalTypeFilter = event.target.value;
      renderHealthTable();
      openFirstVisibleAgent();
    });
  }

  if (els.agentFilter) {
    els.agentFilter.addEventListener("change", (event) => {
      state.agentFilter = event.target.value;
      renderHealthTable();
      openFirstVisibleAgent();
    });
  }

  if (els.envFilter) {
    els.envFilter.addEventListener("change", (event) => {
      state.envFilter = event.target.value;
      renderHealthTable();
      openFirstVisibleAgent();
    });
  }

  if (els.statusFilter) {
    els.statusFilter.addEventListener("change", (event) => {
      state.statusFilter = event.target.value;
      renderHealthTable();
      openFirstVisibleAgent();
    });
  }

  if (els.healthFilter) {
    els.healthFilter.addEventListener("change", (event) => {
      state.healthFilter = event.target.value;
      renderHealthTable();
      openFirstVisibleAgent();
    });
  }
}

function bindPanelClose() {
  if (!els.closeAgentDetailsBtn) {
    return;
  }

  els.closeAgentDetailsBtn.addEventListener("click", () => {
    state.selectedAgentRowId = null;
    closeAgentPanel();
    renderHealthTable();
    renderEmptyJsonState();
  });
}

function hydrateEvalRows() {
  const customized = loadCustomizedEvals();
  const existingRows = loadDeploymentRows();
  const existingById = new Map(existingRows.map((row) => [row.id, row]));

  state.evalRows = customized.map((entry) => {
    const existing = existingById.get(entry.id);
    if (existing) {
      return {
        ...existing,
        title: entry.title,
        definition: entry.definition
      };
    }

    const seed = `${entry.id}:seed`;
    return {
      id: entry.id,
      title: entry.title,
      definition: entry.definition,
      createdAt: entry.createdAt || new Date().toISOString(),
      exactMatchEval: round(seededRange(`${seed}:exact`, 0.64, 0.81), 2),
      judgeEval: round(seededRange(`${seed}:judge`, 0.66, 0.85), 2),
      runCount: 20,
      latencySeconds: round(seededRange(`${seed}:latency`, 0.62, 0.98), 2),
      deploymentState: "draft"
    };
  });

  saveDeploymentRows(state.evalRows);
}

function populateAgentFilter() {
  if (!els.agentFilter) {
    return;
  }

  const agents = [...new Set(AGENT_ROWS.map((row) => row.agent))];
  els.agentFilter.innerHTML = ["<option value=\"all\">All agents</option>"]
    .concat(agents.map((agent) => `<option value="${escapeHtml(agent)}">${escapeHtml(agent)}</option>`))
    .join("");
}

function renderHealthTable() {
  if (!els.healthRows) {
    return;
  }

  const rows = getFilteredAgentRows();
  if (!rows.length) {
    els.healthRows.innerHTML = "<tr><td colspan=\"6\">No agents match current filters.</td></tr>";
    closeAgentPanel();
    renderEmptyJsonState();
    return;
  }

  els.healthRows.innerHTML = rows
    .map((row) => {
      const metrics = metricsForEnvironment(row.environment);
      const status = statusForEnvironment(row.environment);
      const health = healthFrom(metrics);
      const active = state.selectedAgentRowId === row.id ? "row-active" : "";
      return `
        <tr class="${active}" data-row-id="${row.id}">
          <td>
            <div class="agent-name-cell">
              <span>${escapeHtml(row.agent)}</span>
            </div>
          </td>
          <td><span class="status-chip">${escapeHtml(row.environment)}</span></td>
          <td>${escapeHtml(status)}</td>
          <td><span class="health-chip health-${health.replace(" ", "-")}">${escapeHtml(health)}</span></td>
          <td>${metrics.avgEval === null ? "--" : metrics.avgEval.toFixed(2)}</td>
          <td>${metrics.p95Latency === null ? "--" : `${metrics.p95Latency.toFixed(2)}s`}</td>
        </tr>
      `;
    })
    .join("");

  els.healthRows.querySelectorAll("tr[data-row-id]").forEach((rowNode) => {
    rowNode.addEventListener("click", () => {
      openAgentById(rowNode.dataset.rowId);
    });
  });

  const selectedVisible = rows.some((row) => row.id === state.selectedAgentRowId);
  if (!selectedVisible) {
    state.selectedAgentRowId = null;
    closeAgentPanel();
    renderEmptyJsonState();
  }
}

function openAgentById(agentRowId) {
  const selected = AGENT_ROWS.find((item) => item.id === agentRowId);
  if (!selected) {
    return;
  }

  state.selectedAgentRowId = agentRowId;
  renderHealthTable();
  renderAgentJson(selected);
  openAgentPanel();
}

function openAgentPanel() {
  if (!els.agentDetailsPanel) {
    return;
  }
  els.agentDetailsPanel.classList.add("is-open");
  els.agentDetailsPanel.setAttribute("aria-hidden", "false");
}

function closeAgentPanel() {
  if (!els.agentDetailsPanel) {
    return;
  }
  els.agentDetailsPanel.classList.remove("is-open");
  els.agentDetailsPanel.setAttribute("aria-hidden", "true");
}

function renderAgentJson(agentRow) {
  if (!els.agentJsonOutput) {
    return;
  }
  const payload = buildAgentPayload(agentRow);
  els.agentJsonOutput.textContent = JSON.stringify(payload, null, 2);
}

function renderEmptyJsonState() {
  if (!els.agentJsonOutput) {
    return;
  }
  els.agentJsonOutput.textContent = JSON.stringify(
    {
      message: "Select an agent row to view details."
    },
    null,
    2
  );
}

function buildAgentPayload(agentRow) {
  const metrics = metricsForEnvironment(agentRow.environment);
  const status = statusForEnvironment(agentRow.environment);
  const health = healthFrom(metrics);
  const offlineEvaluations = relevantEvalsForEnvironment(agentRow.environment).map((evalRow) => ({
    name: evalRow.title,
    description: evalRow.definition,
    created_at: formatTimestamp(evalRow.createdAt),
    score: round((evalRow.exactMatchEval + evalRow.judgeEval) / 2, 2),
    latency: `${evalRow.latencySeconds.toFixed(2)}s`,
    metadata: metadataFor(evalRow)
  }));

  return {
    agent_name: agentRow.agent,
    environment: agentRow.environment,
    status,
    health,
    avg_eval: metrics.avgEval === null ? null : round(metrics.avgEval, 2),
    p95_latency: metrics.p95Latency === null ? null : `${metrics.p95Latency.toFixed(2)}s`,
    offline_evaluations: offlineEvaluations
  };
}

function getFilteredAgentRows() {
  return AGENT_ROWS.filter((row) => {
    const agentMatch = state.agentFilter === "all" || row.agent === state.agentFilter;
    const envMatch = state.envFilter === "all" || row.environment === state.envFilter;
    if (!agentMatch || !envMatch) {
      return false;
    }

    const metrics = metricsForEnvironment(row.environment, state.evalTypeFilter);
    const status = statusForEnvironment(row.environment);
    const health = healthFrom(metrics);
    const statusMatch = state.statusFilter === "all" || status === state.statusFilter;
    const healthMatch = state.healthFilter === "all" || health === state.healthFilter;

    return statusMatch && healthMatch;
  });
}

function relevantEvalsForEnvironment(environment) {
  return relevantEvalsForFilter(state.evalTypeFilter, environment);
}

function relevantEvalsForFilter(evalTypeFilter, environment) {
  void environment;
  return state.evalRows.filter((row) => {
    if (evalTypeFilter === "all") {
      return true;
    }
    return evaluationTypeForRow(row) === evalTypeFilter;
  });
}

function metricsForEnvironment(environment, evalTypeFilter) {
  const relevantRows = relevantEvalsForFilter(evalTypeFilter || state.evalTypeFilter, environment);
  if (!relevantRows.length) {
    return { avgEval: null, p95Latency: null };
  }

  return {
    avgEval: average(relevantRows.map((row) => (row.exactMatchEval + row.judgeEval) / 2)),
    p95Latency: average(relevantRows.map((row) => row.latencySeconds))
  };
}

function openFirstVisibleAgent() {
  const rows = getFilteredAgentRows();
  if (!rows.length) {
    closeAgentPanel();
    renderEmptyJsonState();
    return;
  }

  const preferred = rows.find((row) => row.id === state.selectedAgentRowId) || rows[0];
  if (!preferred) {
    return;
  }

  state.selectedAgentRowId = preferred.id;
  renderHealthTable();
  renderAgentJson(preferred);
  openAgentPanel();
}

function statusForEnvironment(environment) {
  void environment;
  if (!state.evalRows.length) {
    return "not configured";
  }
  return "active";
}

function healthFrom(metrics) {
  if (metrics.avgEval === null) {
    return "at risk";
  }
  if (metrics.avgEval >= 0.86 && metrics.p95Latency <= 0.95) {
    return "healthy";
  }
  if (metrics.avgEval >= 0.74 && metrics.p95Latency <= 1.2) {
    return "at risk";
  }
  return "unhealthy";
}

function metadataFor(evalRow) {
  return {
    source: "customized",
    deployment_state: evalRow.deploymentState,
    evaluation_type: evaluationTypeForRow(evalRow)
  };
}

function evaluationTypeForRow(evalRow) {
  const title = (evalRow.title || "").toLowerCase();
  if (title.includes("policy")) {
    return "policy";
  }
  if (title.includes("replay")) {
    return "replay";
  }
  if (title.includes("quality")) {
    return "quality";
  }
  return "regression";
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

function loadDeploymentRows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.deploymentRows);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDeploymentRows(rows) {
  try {
    localStorage.setItem(STORAGE_KEYS.deploymentRows, JSON.stringify(rows));
  } catch {
    // no-op for prototype mode
  }
}

function seededRange(seed, min, max) {
  const ratio = hash(seed) / 4294967295;
  return min + ratio * (max - min);
}

function hash(value) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output * 31 + value.charCodeAt(index)) >>> 0;
  }
  return output;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function formatTimestamp(timestamp) {
  const dateValue = new Date(timestamp);
  if (Number.isNaN(dateValue.getTime())) {
    return "--";
  }
  return dateValue.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
