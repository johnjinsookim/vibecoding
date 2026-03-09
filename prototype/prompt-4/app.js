const categories = ["security", "governance", "harmful"];
const actions = ["allow", "block", "regenerate", "fallback"];

const state = {
  screen: "dashboard",
  selectedCategory: null,
  selectedHour: null,
  search: "",
  selectedLog: null,
  selectedEventId: null,
  events: generateEvents(220)
};

const els = {
  screenDashboard: document.getElementById("screen-dashboard"),
  screenInvestigation: document.getElementById("screen-investigation"),
  chartSecurity: document.getElementById("chart-security"),
  chartGovernance: document.getElementById("chart-governance"),
  chartHarmful: document.getElementById("chart-harmful"),
  searchInput: document.getElementById("searchInput"),
  clearFilterBtn: document.getElementById("clearFilterBtn"),
  activeFilterPill: document.getElementById("activeFilterPill"),
  rowCountPill: document.getElementById("rowCountPill"),
  metricTotal: document.getElementById("metric-total"),
  metricBlocked: document.getElementById("metric-blocked"),
  metricRegenerated: document.getElementById("metric-regenerated"),
  metricP50: document.getElementById("metric-p50"),
  summaryTableBody: document.getElementById("summaryTableBody"),
  backBtn: document.getElementById("backBtn"),
  investigationMeta: document.getElementById("investigationMeta"),
  eventList: document.getElementById("eventList"),
  eventTitle: document.getElementById("eventTitle"),
  eventGraph: document.getElementById("eventGraph"),
  fixPanel: document.getElementById("fixPanel")
};

init();

function init() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderDashboard();
  });

  els.clearFilterBtn.addEventListener("click", () => {
    state.selectedCategory = null;
    state.selectedHour = null;
    state.search = "";
    els.searchInput.value = "";
    renderDashboard();
  });

  els.backBtn.addEventListener("click", () => {
    state.screen = "dashboard";
    renderShell();
    renderDashboard();
  });

  renderShell();
  renderDashboard();
}

function renderShell() {
  const inDashboard = state.screen === "dashboard";
  els.screenDashboard.classList.toggle("hidden", !inDashboard);
  els.screenInvestigation.classList.toggle("hidden", inDashboard);
}

function last24Hours() {
  const now = new Date();
  const hours = [];
  for (let i = 23; i >= 0; i -= 1) {
    const point = new Date(now.getTime() - i * 60 * 60 * 1000);
    hours.push(point.getHours());
  }
  return hours;
}

function countsByHour(category) {
  const hours = last24Hours();
  return hours.map((hour) => {
    const count = state.events.filter((event) => {
      const eventHour = new Date(event.timestamp).getHours();
      return eventHour === hour && event.category === category;
    }).length;

    return { hour, count };
  });
}

function renderCategoryChart(category, mount) {
  const points = countsByHour(category);
  const max = Math.max(...points.map((point) => point.count), 1);

  mount.innerHTML = points
    .map((point) => {
      const height = Math.max(6, Math.round((point.count / max) * 160));
      const active = state.selectedCategory === category && state.selectedHour === point.hour ? "active" : "";
      return `
        <div class="chart-col">
          <button class="bar ${category} ${active}" data-category="${category}" data-hour="${point.hour}" style="height:${height}px" title="${String(point.hour).padStart(2, "0")}:00 | ${point.count} incidents"></button>
        </div>
      `;
    })
    .join("");

  const bars = [...mount.querySelectorAll(".bar")];

  bars.forEach((bar) => {
    bar.addEventListener("mouseenter", () => {
      bars.forEach((other) => {
        if (other !== bar) {
          other.classList.add("dimmed");
        }
      });
    });

    bar.addEventListener("mouseleave", () => {
      bars.forEach((other) => other.classList.remove("dimmed"));
    });

    bar.addEventListener("click", () => {
      state.selectedCategory = bar.dataset.category;
      state.selectedHour = Number(bar.dataset.hour);
      renderDashboard();
    });
  });
}

function activeEvents() {
  let output = [...state.events];

  if (state.selectedCategory !== null && state.selectedHour !== null) {
    output = output.filter((event) => {
      const eventHour = new Date(event.timestamp).getHours();
      return event.category === state.selectedCategory && eventHour === state.selectedHour;
    });
  }

  if (state.search) {
    output = output.filter((event) => event.logName.toLowerCase().includes(state.search));
  }

  return output;
}

function aggregateLogs(events) {
  const map = new Map();

  events.forEach((event) => {
    if (!map.has(event.logName)) {
      map.set(event.logName, {
        logName: event.logName,
        security: 0,
        governance: 0,
        harmful: 0,
        blocked: 0,
        regenerated: 0,
        latencies: [],
        events: []
      });
    }

    const row = map.get(event.logName);
    row[event.category] += 1;
    if (event.action === "block") row.blocked += 1;
    if (event.action === "regenerate") row.regenerated += 1;
    row.latencies.push(event.latencyMs);
    row.events.push(event);
  });

  return [...map.values()]
    .map((row) => ({
      ...row,
      p50Latency: p50(row.latencies),
      total: row.security + row.governance + row.harmful,
      status: statusFor(row)
    }))
    .sort((a, b) => b.total - a.total);
}

function statusFor(row) {
  if (row.blocked > 8 || row.harmful > 6) return "risky";
  if (row.blocked > 3 || row.harmful > 2) return "warning";
  return "healthy";
}

function renderSummary(rows) {
  const allEvents = rows.flatMap((row) => row.events);
  const total = allEvents.length;
  const blocked = allEvents.filter((event) => event.action === "block").length;
  const regenerated = allEvents.filter((event) => event.action === "regenerate").length;
  const p50Latency = p50(allEvents.map((event) => event.latencyMs));

  els.metricTotal.textContent = String(total);
  els.metricBlocked.textContent = String(blocked);
  els.metricRegenerated.textContent = String(regenerated);
  els.metricP50.textContent = `${p50Latency}ms`;
  els.rowCountPill.textContent = `${rows.length} logs`;

  if (!rows.length) {
    els.summaryTableBody.innerHTML = "<tr><td colspan=\"6\">No Production Logs match current filter.</td></tr>";
    return;
  }

  els.summaryTableBody.innerHTML = rows
    .map(
      (row) => `
      <tr data-log-name="${row.logName}">
        <td>${row.logName}</td>
        <td>${row.security}</td>
        <td>${row.governance}</td>
        <td>${row.harmful}</td>
        <td>${row.p50Latency}ms</td>
        <td><span class="status ${row.status}">${row.status}</span></td>
      </tr>
    `
    )
    .join("");

  els.summaryTableBody.querySelectorAll("tr[data-log-name]").forEach((rowEl) => {
    rowEl.addEventListener("click", () => {
      state.selectedLog = rowEl.dataset.logName;
      state.selectedEventId = null;
      state.screen = "investigation";
      renderShell();
      renderInvestigation();
    });
  });
}

function renderDashboard() {
  renderCategoryChart("security", els.chartSecurity);
  renderCategoryChart("governance", els.chartGovernance);
  renderCategoryChart("harmful", els.chartHarmful);

  if (state.selectedCategory !== null && state.selectedHour !== null) {
    els.activeFilterPill.textContent = `Filter: ${state.selectedCategory} @ ${String(state.selectedHour).padStart(2, "0")}:00`;
  } else {
    els.activeFilterPill.textContent = "Filter: none";
  }

  const rows = aggregateLogs(activeEvents());
  renderSummary(rows);
}

function renderInvestigation() {
  const logEvents = state.events
    .filter((event) => event.logName === state.selectedLog)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  els.investigationMeta.textContent = state.selectedLog || "No event selected";

  els.eventList.innerHTML = logEvents
    .map(
      (event) => `
      <li class="event-item ${state.selectedEventId === event.id ? "active" : ""}" data-id="${event.id}">
        <strong>${event.category}</strong> - ${event.action}
        <p class="event-meta">${formatTime(event.timestamp)} | ${event.evaluator} | ${event.severity}</p>
      </li>
    `
    )
    .join("");

  els.eventList.querySelectorAll(".event-item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const event = logEvents.find((entry) => entry.id === item.dataset.id);
      if (event && state.selectedEventId === null) {
        previewEvent(event);
      }
    });

    item.addEventListener("click", () => {
      state.selectedEventId = item.dataset.id;
      const event = logEvents.find((entry) => entry.id === state.selectedEventId);
      if (event) {
        renderEventDetail(event);
      }
      renderInvestigation();
    });
  });

  if (state.selectedEventId) {
    const selected = logEvents.find((event) => event.id === state.selectedEventId);
    if (selected) {
      renderEventDetail(selected);
      return;
    }
  }

  els.eventTitle.textContent = "Event Investigation";
  els.eventGraph.classList.add("empty");
  els.eventGraph.textContent = "Select an event to render the flow.";
  els.fixPanel.innerHTML = "";
}

function previewEvent(event) {
  els.eventTitle.textContent = `Preview ${event.id}`;
  els.eventGraph.classList.add("empty");
  els.eventGraph.textContent = `${event.category} at ${formatTime(event.timestamp)}. Click to inspect root cause and mitigation.`;
  els.fixPanel.innerHTML = "";
}

function renderEventDetail(event) {
  els.eventTitle.textContent = `Event ${event.id}`;
  els.eventGraph.classList.remove("empty");

  els.eventGraph.innerHTML = `
    <div class="graph-flow">
      <div class="graph-node">
        <strong>What happened</strong>
        <p>Model generated recommendation in ${event.logName}.</p>
        <p>Evaluator: ${event.evaluator}</p>
      </div>
      <div class="graph-arrow">--&gt;</div>
      <div class="graph-node bad">
        <strong>What went wrong</strong>
        <p>${event.problem}</p>
        <p>Reason: ${event.reasonCode}</p>
      </div>
      <div class="graph-node">
        <strong>Mitigation</strong>
        <p>Action: ${event.action}</p>
        <p>Severity: ${event.severity}</p>
      </div>
    </div>
  `;

  els.fixPanel.innerHTML = `
    <strong>Recommended Fixes</strong>
    <p>1. ${event.fix[0]}</p>
    <p>2. ${event.fix[1]}</p>
    <p>3. ${event.fix[2]}</p>
  `;
}

function generateEvents(count) {
  const logs = [
    "prod-log-eli5-golden",
    "prod-log-gpt4-clinical",
    "prod-log-note-agent-a",
    "prod-log-note-agent-b",
    "prod-log-oncall-hotpath",
    "prod-log-ed-pilot"
  ];

  const now = Date.now();
  const output = [];

  for (let i = 0; i < count; i += 1) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const logName = logs[Math.floor(Math.random() * logs.length)];
    const severity = category === "security" || category === "governance"
      ? (Math.random() > 0.35 ? "high" : "medium")
      : (Math.random() > 0.5 ? "medium" : "low");

    const action = decideAction(category, severity);
    const timestamp = new Date(now - Math.floor(Math.random() * 24 * 60) * 60 * 1000).toISOString();

    output.push({
      id: `evt-${String(i + 1).padStart(4, "0")}`,
      logName,
      timestamp,
      category,
      severity,
      action,
      evaluator: `${category}-evaluator`,
      reasonCode: reasonFor(category),
      problem: problemFor(category),
      fix: fixFor(category),
      latencyMs: Math.floor(250 + Math.random() * 650)
    });
  }

  return output.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function decideAction(category, severity) {
  if (category === "security" || category === "governance") {
    return Math.random() > 0.2 ? "block" : "fallback";
  }
  if (severity === "medium") {
    return Math.random() > 0.45 ? "regenerate" : "allow";
  }
  return actions[Math.floor(Math.random() * actions.length)];
}

function reasonFor(category) {
  if (category === "security") return "PII_UNMASKED";
  if (category === "governance") return "GOV_SCOPE_VIOLATION";
  return "SAFE_HARMFUL_CONTENT";
}

function problemFor(category) {
  if (category === "security") return "Sensitive identifiers leaked in generated response.";
  if (category === "governance") return "Response used context outside permitted access boundary.";
  return "Generated response violated harmful content policy.";
}

function fixFor(category) {
  if (category === "security") {
    return [
      "Add stricter PII mask policy before generation.",
      "Lower threshold for high-entropy identifier detection.",
      "Add redaction post-processor in online path."
    ];
  }
  if (category === "governance") {
    return [
      "Constrain retrieval to authorized patient scope.",
      "Add explicit governance evaluator rule for actor context.",
      "Audit principal-to-resource mapping in policy layer."
    ];
  }
  return [
    "Tighten harmful language evaluator rubric.",
    "Increase severity weights for unsafe lexical patterns.",
    "Route medium/high harmful confidence events to fallback response."
  ];
}

function p50(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.5)];
}

function formatTime(iso) {
  return new Date(iso).toLocaleString();
}
