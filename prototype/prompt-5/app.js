const ISSUE_LABELS = {
  none: "Referenced price with no source",
  inaccurate: "Referenced price inaccurately",
  "user-reported": "User denoted inaccurate"
};

const SERVICES = ["rufus-prod", "buying-assistant-v2", "compare-engine-prod", "checkout-guide-prod"];

const EVALUATORS = [
  { id: "hallucination", name: "Hallucination Judge", threshold: 0.72 },
  { id: "accuracy", name: "Price Accuracy Judge", threshold: 0.82 },
  { id: "coverage", name: "Coverage Judge", threshold: 0.7 }
];

const state = {
  view: "dashboard",
  dashboard: { window: 24, service: "all", source: "all", severity: "all" },
  monitorSearch: "",
  monitorStatus: "all",
  monitorType: "all",
  selectedMonitorId: null,
  evalSearch: "",
  traffic: generateTraffic(1800),
  monitors: [],
  evalRecords: []
};

const els = {
  navItems: Array.from(document.querySelectorAll(".nav-item[data-view]")),
  views: {
    dashboard: document.getElementById("view-dashboard"),
    monitors: document.getElementById("view-monitors"),
    evals: document.getElementById("view-evals")
  },
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  refreshBtn: document.getElementById("refreshBtn"),
  dashWindow: document.getElementById("dashWindow"),
  dashService: document.getElementById("dashService"),
  dashSource: document.getElementById("dashSource"),
  dashSeverity: document.getElementById("dashSeverity"),
  kpiResponses: document.getElementById("kpiResponses"),
  kpiIssues: document.getElementById("kpiIssues"),
  kpiIssueRate: document.getElementById("kpiIssueRate"),
  kpiCoverage: document.getElementById("kpiCoverage"),
  trendMeta: document.getElementById("trendMeta"),
  dashboardTrend: document.getElementById("dashboardTrend"),
  dashBreakdown: document.getElementById("dashBreakdown"),
  dashEventsBody: document.getElementById("dashEventsBody"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  typeFilter: document.getElementById("typeFilter"),
  simulateSpikeBtn: document.getElementById("simulateSpikeBtn"),
  monitorTableBody: document.getElementById("monitorTableBody"),
  selectedName: document.getElementById("selectedName"),
  selectedMeta: document.getElementById("selectedMeta"),
  selectedInvestigation: document.getElementById("selectedInvestigation"),
  selectedStatusPill: document.getElementById("selectedStatusPill"),
  metricChart: document.getElementById("metricChart"),
  chartLegend: document.getElementById("chartLegend"),
  alertFeed: document.getElementById("alertFeed"),
  createMonitorForm: document.getElementById("createMonitorForm"),
  monitorService: document.getElementById("monitorService"),
  monitorName: document.getElementById("monitorName"),
  monitorType: document.getElementById("monitorType"),
  monitorThreshold: document.getElementById("monitorThreshold"),
  monitorInvestigationLink: document.getElementById("monitorInvestigationLink"),
  resetFormBtn: document.getElementById("resetFormBtn"),
  formMessage: document.getElementById("formMessage"),
  evalSearch: document.getElementById("evalSearch"),
  simulateEvalBtn: document.getElementById("simulateEvalBtn"),
  evalList: document.getElementById("evalList"),
  evalRecordsBody: document.getElementById("evalRecordsBody")
};

init();

function init() {
  populateServiceOptions();
  seedMonitors();
  seedEvalRecords();
  bindEvents();
  render();
}

function populateServiceOptions() {
  SERVICES.forEach((service) => {
    const optionA = document.createElement("option");
    optionA.value = service;
    optionA.textContent = service;
    els.dashService.append(optionA);

    const optionB = document.createElement("option");
    optionB.value = service;
    optionB.textContent = service;
    els.monitorService.append(optionB);
  });
}

function seedMonitors() {
  state.monitors = [
    baseMonitor("m1", "Issue Rate Monitor", "rufus-prod", "threshold", 8),
    baseMonitor("m2", "User Frustration Monitor", "buying-assistant-v2", "anomaly", 14),
    baseMonitor("m3", "No-Source-Price Monitor", "compare-engine-prod", "threshold", 6)
  ];
  state.selectedMonitorId = state.monitors[0].id;
}

function seedEvalRecords() {
  for (let i = 0; i < 22; i += 1) {
    state.evalRecords.push(generateEvalRecord());
  }
}

function bindEvents() {
  els.navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      setView(item.dataset.view);
    });
  });

  els.refreshBtn.addEventListener("click", () => {
    state.traffic = generateTraffic(1800);
    state.monitors.forEach((monitor) => {
      monitor.series = generateSeries();
      monitor.current = monitor.series[monitor.series.length - 1];
      monitor.status = monitor.current > monitor.threshold ? "triggered" : "healthy";
    });
    render();
  });

  els.dashWindow.addEventListener("change", (event) => {
    state.dashboard.window = Number(event.target.value);
    renderDashboard();
  });
  els.dashService.addEventListener("change", (event) => {
    state.dashboard.service = event.target.value;
    renderDashboard();
  });
  els.dashSource.addEventListener("change", (event) => {
    state.dashboard.source = event.target.value;
    renderDashboard();
  });
  els.dashSeverity.addEventListener("change", (event) => {
    state.dashboard.severity = event.target.value;
    renderDashboard();
  });

  els.searchInput.addEventListener("input", (event) => {
    state.monitorSearch = event.target.value.toLowerCase().trim();
    renderMonitors();
  });
  els.statusFilter.addEventListener("change", (event) => {
    state.monitorStatus = event.target.value;
    renderMonitors();
  });
  els.typeFilter.addEventListener("change", (event) => {
    state.monitorType = event.target.value;
    renderMonitors();
  });

  els.simulateSpikeBtn.addEventListener("click", () => {
    const monitor = selectedMonitor();
    if (!monitor) return;
    monitor.series[monitor.series.length - 1] = monitor.threshold + 4.5;
    monitor.current = monitor.series[monitor.series.length - 1];
    monitor.status = "triggered";
    monitor.alerts.unshift(`${new Date().toLocaleTimeString()} spike detected for ${monitor.service}`);
    renderMonitors();
  });

  els.createMonitorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const monitor = {
      id: `m-${Math.random().toString(16).slice(2, 7)}`,
      name: els.monitorName.value.trim(),
      service: els.monitorService.value,
      type: els.monitorType.value,
      threshold: Number(els.monitorThreshold.value),
      current: 0,
      status: "healthy",
      series: generateSeries(),
      link: els.monitorInvestigationLink.value,
      alerts: []
    };

    monitor.current = monitor.series[monitor.series.length - 1];
    monitor.status = monitor.current > monitor.threshold ? "triggered" : "healthy";

    state.monitors.unshift(monitor);
    state.selectedMonitorId = monitor.id;
    els.formMessage.textContent = `Created monitor ${monitor.name}.`;
    els.createMonitorForm.reset();
    els.monitorThreshold.value = "8";
    els.monitorInvestigationLink.value = "https://observability.internal/traces";
    renderMonitors();
  });

  els.resetFormBtn.addEventListener("click", () => {
    els.createMonitorForm.reset();
    els.monitorThreshold.value = "8";
    els.monitorInvestigationLink.value = "https://observability.internal/traces";
    els.formMessage.textContent = "";
  });

  els.evalSearch.addEventListener("input", (event) => {
    state.evalSearch = event.target.value.toLowerCase().trim();
    renderEvals();
  });

  els.simulateEvalBtn.addEventListener("click", () => {
    state.evalRecords.unshift(generateEvalRecord());
    state.evalRecords = state.evalRecords.slice(0, 50);
    renderEvals();
  });
}

function setView(view) {
  state.view = view;
  Object.entries(els.views).forEach(([name, element]) => {
    element.classList.toggle("hidden", name !== view);
  });
  els.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  if (view === "dashboard") {
    els.pageTitle.innerHTML = 'Dashboards <span id="pageSubtitle">Pricing hallucination observability</span>';
  } else if (view === "monitors") {
    els.pageTitle.innerHTML = 'Monitors <span id="pageSubtitle">Automatically detect issues</span>';
  } else {
    els.pageTitle.innerHTML = 'Evals &amp; Tasks <span id="pageSubtitle">Evaluate pricing quality signals</span>';
  }
}

function render() {
  setView(state.view);
  renderDashboard();
  renderMonitors();
  renderEvals();
}

function dashboardRows() {
  let rows = state.traffic.filter((row) => withinHours(row.timestamp, state.dashboard.window));
  if (state.dashboard.service !== "all") rows = rows.filter((row) => row.service === state.dashboard.service);
  if (state.dashboard.source !== "all") rows = rows.filter((row) => row.source === state.dashboard.source);
  if (state.dashboard.severity !== "all") rows = rows.filter((row) => row.severity === state.dashboard.severity);
  return rows;
}

function renderDashboard() {
  const rows = dashboardRows();
  const issues = rows.filter((row) => row.issueDetected);
  const systemIssues = issues.filter((row) => row.source === "system").length;
  const userIssues = issues.filter((row) => row.source === "user").length;

  els.kpiResponses.textContent = String(rows.length);
  els.kpiIssues.textContent = String(issues.length);
  els.kpiIssueRate.textContent = `${percent(issues.length, rows.length)}%`;
  els.kpiCoverage.textContent = `${percent(systemIssues, systemIssues + userIssues)}%`;

  const bins = buildBins(state.dashboard.window, 2);
  const points = bins.map((bin) => {
    const inBin = rows.filter((row) => {
      const ts = new Date(row.timestamp).getTime();
      return ts >= bin.start && ts < bin.end;
    });
    return {
      label: bin.label,
      system: inBin.filter((row) => row.issueDetected && row.source === "system").length,
      user: inBin.filter((row) => row.issueDetected && row.source === "user").length
    };
  });

  els.trendMeta.textContent = `${points.length} bins`;
  els.dashboardTrend.innerHTML = lineChart(points, 900, 240);

  const classes = ["none", "inaccurate", "user-reported"];
  els.dashBreakdown.innerHTML = classes
    .map((klass) => {
      const count = issues.filter((row) => row.issueClass === klass).length;
      return `<div class="alert-card"><p class="alert-title">${ISSUE_LABELS[klass]}</p><p class="alert-meta">${count} events</p></div>`;
    })
    .join("");

  els.dashEventsBody.innerHTML = issues
    .slice(0, 20)
    .map(
      (row) => `
      <tr>
        <td>${new Date(row.timestamp).toLocaleString()}</td>
        <td>${row.service}</td>
        <td>${ISSUE_LABELS[row.issueClass]}</td>
        <td>${row.source}</td>
        <td>${row.severity}</td>
      </tr>
    `
    )
    .join("");

  if (!issues.length) {
    els.dashEventsBody.innerHTML = '<tr><td colspan="5">No issue events for current filter selection.</td></tr>';
  }
}

function filteredMonitors() {
  return state.monitors.filter((monitor) => {
    if (state.monitorSearch && !`${monitor.name} ${monitor.service}`.toLowerCase().includes(state.monitorSearch)) return false;
    if (state.monitorStatus !== "all" && monitor.status !== state.monitorStatus) return false;
    if (state.monitorType !== "all" && monitor.type !== state.monitorType) return false;
    return true;
  });
}

function renderMonitors() {
  const monitors = filteredMonitors();

  els.monitorTableBody.innerHTML = monitors
    .map(
      (monitor) => `
      <tr data-id="${monitor.id}">
        <td><span class="status-dot ${monitor.status}"></span>${monitor.status}</td>
        <td>${monitor.name}</td>
        <td>${monitor.service}</td>
        <td><span class="type-pill">${monitor.type}</span></td>
        <td>${monitor.threshold.toFixed(1)}%</td>
        <td>${monitor.current.toFixed(1)}%</td>
        <td><button class="btn btn-small" data-id="${monitor.id}">Open</button></td>
      </tr>
    `
    )
    .join("");

  Array.from(els.monitorTableBody.querySelectorAll("button[data-id]")).forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedMonitorId = btn.dataset.id;
      renderSelectedMonitor();
    });
  });

  if (!monitors.length) {
    els.monitorTableBody.innerHTML = '<tr><td colspan="7">No monitors match current filter.</td></tr>';
  }

  renderSelectedMonitor();
}

function renderSelectedMonitor() {
  const monitor = selectedMonitor();
  if (!monitor) return;

  els.selectedName.textContent = monitor.name;
  els.selectedMeta.textContent = `${monitor.type} | ${monitor.service}`;
  els.selectedInvestigation.href = monitor.link;
  els.selectedStatusPill.textContent = monitor.status;
  els.selectedStatusPill.className = `pill ${monitor.status === "triggered" ? "triggered" : "healthy"}`;
  els.chartLegend.textContent = `Threshold: ${monitor.threshold.toFixed(1)}% | Current: ${monitor.current.toFixed(1)}%`;
  els.metricChart.innerHTML = monitorChart(monitor.series, monitor.threshold);

  els.alertFeed.innerHTML = monitor.alerts.length
    ? monitor.alerts
        .slice(0, 4)
        .map((alert) => `<div class="alert-card high"><p class="alert-title">Alert</p><p class="alert-meta">${alert}</p></div>`)
        .join("")
    : '<div class="alert-card"><p class="alert-title">No recent alerts</p><p class="alert-meta">Monitor is within expected range.</p></div>';
}

function renderEvals() {
  const evalList = EVALUATORS.filter((item) => item.name.toLowerCase().includes(state.evalSearch));
  const records = state.evalRecords.filter((item) => `${item.evaluator} ${item.service}`.toLowerCase().includes(state.evalSearch));

  els.evalList.innerHTML = evalList
    .map(
      (item) => `<div class="alert-card"><p class="alert-title">${item.name}</p><p class="alert-meta">threshold ${item.threshold}</p></div>`
    )
    .join("");

  els.evalRecordsBody.innerHTML = records
    .slice(0, 25)
    .map(
      (record) => `
      <tr>
        <td>${new Date(record.timestamp).toLocaleString()}</td>
        <td>${record.evaluator}</td>
        <td>${record.service}</td>
        <td>${record.outcome}</td>
        <td>${ISSUE_LABELS[record.issueClass]}</td>
      </tr>
    `
    )
    .join("");

  if (!records.length) {
    els.evalRecordsBody.innerHTML = '<tr><td colspan="5">No eval records match current search.</td></tr>';
  }
}

function selectedMonitor() {
  return state.monitors.find((monitor) => monitor.id === state.selectedMonitorId) || state.monitors[0];
}

function baseMonitor(id, name, service, type, threshold) {
  const series = generateSeries();
  const current = series[series.length - 1];
  return {
    id,
    name,
    service,
    type,
    threshold,
    current,
    status: current > threshold ? "triggered" : "healthy",
    series,
    link: "https://observability.internal/traces",
    alerts: []
  };
}

function generateTraffic(count) {
  const out = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const issueDetected = Math.random() < 0.17;
    const issueClass = issueDetected ? pick(["none", "inaccurate", "user-reported"]) : null;

    out.push({
      timestamp: new Date(now - Math.floor(Math.random() * 7 * 24 * 60) * 60 * 1000).toISOString(),
      service: pick(SERVICES),
      severity: pick(["low", "medium", "high"]),
      source: issueDetected ? (issueClass === "user-reported" ? "user" : pick(["system", "user", "system"])) : null,
      issueDetected,
      issueClass
    });
  }

  return out.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateSeries() {
  return Array.from({ length: 24 }, () => Number((Math.random() * 12).toFixed(1)));
}

function generateEvalRecord() {
  const issueClass = pick(["none", "inaccurate", "user-reported"]);
  return {
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 48 * 60) * 60 * 1000).toISOString(),
    evaluator: pick(EVALUATORS).name,
    service: pick(SERVICES),
    outcome: Math.random() > 0.35 ? "PASS" : "FAIL",
    issueClass
  };
}

function lineChart(points, width, height) {
  const left = 42;
  const right = 18;
  const top = 12;
  const bottom = 24;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const maxY = Math.max(...points.map((point) => Math.max(point.system, point.user)), 1);

  const system = path(points, "system", left, top, plotW, plotH, maxY);
  const user = path(points, "user", left, top, plotW, plotH, maxY);

  return `
    <path d="${system}" fill="none" stroke="#30b27a" stroke-width="3"></path>
    <path d="${user}" fill="none" stroke="#f5a524" stroke-width="3"></path>
  `;
}

function monitorChart(series, threshold) {
  const width = 800;
  const height = 240;
  const left = 40;
  const right = 18;
  const top = 12;
  const bottom = 22;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const maxY = Math.max(Math.max(...series), threshold, 1);

  const line = series
    .map((value, index) => {
      const x = left + (index / Math.max(series.length - 1, 1)) * plotW;
      const y = top + plotH - (value / maxY) * plotH;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const y = top + plotH - (threshold / maxY) * plotH;

  return `
    <line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#f5a524" stroke-dasharray="6 4" stroke-width="1.5"></line>
    <path d="${line}" fill="none" stroke="#58a6ff" stroke-width="3"></path>
  `;
}

function buildBins(hours, stepHours) {
  const bins = [];
  const now = Date.now();
  const startTime = now - hours * 60 * 60 * 1000;

  for (let start = startTime; start < now; start += stepHours * 60 * 60 * 1000) {
    bins.push({
      start,
      end: Math.min(now, start + stepHours * 60 * 60 * 1000),
      label: new Date(start).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" })
    });
  }
  return bins;
}

function withinHours(iso, hours) {
  return Date.now() - new Date(iso).getTime() <= hours * 60 * 60 * 1000;
}

function path(points, key, left, top, plotW, plotH, maxY) {
  return points
    .map((point, index) => {
      const x = left + (index / Math.max(points.length - 1, 1)) * plotW;
      const y = top + plotH - (point[key] / maxY) * plotH;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function percent(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}
