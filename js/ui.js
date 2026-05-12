/**
 * js/ui.js — GRC Command Center
 *
 * UI utilities:
 *   - Page navigation
 *   - Modal open/close
 *   - Table search & filter helpers
 *   - Pie chart renderer
 *   - Dashboard refresh
 *
 * Depends on: state.js
 */

// ── Navigation ───────────────────────────────────────────
function navigate(el) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('page-' + el.dataset.page).classList.add('active');

  // Reset linked-control picker state when entering the Risk page
  if (el.dataset.page === 'risks') {
    selectedControlIds.clear();
    refreshRiskControlSelect();
  }
  // Re-trigger dashboard chart animations when entering Dashboard
  if (el.dataset.page === 'dashboard') {
    refreshDashboard();
  }
}

// ── Modals ───────────────────────────────────────────────
function openModal(id) {
  if (id === 'risk-modal') {
    selectedControlIds.clear();
    const srch = document.getElementById('r-ctrl-search');
    if (srch) srch.value = '';
    refreshRiskControlSelect();
  }
  if (id === 'control-modal') setDatePickerMin();
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close any modal when clicking its backdrop
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => {
    if (e.target === o) o.classList.remove('open');
  });
});

// ── Date picker: enforce today as minimum ────────────────
function setDatePickerMin() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('c-validation-date').min = today;
}

// ── Table search & filter helpers ────────────────────────

/** Full-text search across all cells of a table body. */
function filterTable(searchId, bodyId) {
  const q = document.getElementById(searchId).value.toLowerCase();
  document.querySelectorAll(`#${bodyId} tr`).forEach(tr => {
    tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
}

/** Filter rows by the data-status attribute. */
function filterByStatus(bodyId, val) {
  document.querySelectorAll(`#${bodyId} tr`).forEach(tr => {
    tr.style.display = (!val || tr.dataset.status === val) ? '' : 'none';
  });
}

/** Filter rows by the data-domain attribute. */
function filterByDomain(bodyId, val) {
  document.querySelectorAll(`#${bodyId} tr`).forEach(tr => {
    tr.style.display = (!val || tr.dataset.domain === val) ? '' : 'none';
  });
}

/** Filter rows by the data-level attribute. */
function filterByLevel(bodyId, val) {
  document.querySelectorAll(`#${bodyId} tr`).forEach(tr => {
    tr.style.display = (!val || tr.dataset.level === val) ? '' : 'none';
  });
}


/** Filter rows by the data-status attribute (risk register). */
function filterByRiskStatus(bodyId, val) {
  document.querySelectorAll(`#${bodyId} tr`).forEach(tr => {
    tr.style.display = (!val || tr.dataset.status === val) ? '' : 'none';
  });
}

/** Filter rows by the data-category attribute. */
function filterByCategory(bodyId, val) {
  document.querySelectorAll(`#${bodyId} tr`).forEach(tr => {
    tr.style.display = (!val || tr.dataset.category === val) ? '' : 'none';
  });
}

// ── Floating pie tooltip (shared across both charts) ─────
let _pieFloatTip = null;

function _getPieFloatTip() {
  if (!_pieFloatTip) {
    _pieFloatTip = document.createElement('div');
    _pieFloatTip.id = 'pie-float-tooltip';
    document.body.appendChild(_pieFloatTip);
  }
  return _pieFloatTip;
}

function _showPieFloatTip(e, arc) {
  const tip = _getPieFloatTip();
  const pct = arc.dataset.pct;
  tip.style.borderLeftColor = arc.dataset.color;
  tip.innerHTML = `
    <div class="pie-ft-label">${arc.dataset.label}</div>
    <div class="pie-ft-row">
      <span class="pie-ft-count" style="color:${arc.dataset.color}">${arc.dataset.value}</span>
      <span class="pie-ft-pct">${pct}%</span>
    </div>
    <div class="pie-ft-bar" style="background:${arc.dataset.color};width:${Math.max(4, pct)}%"></div>`;
  tip.classList.add('visible');
  _movePieFloatTip(e);
}

function _movePieFloatTip(e) {
  const tip = _getPieFloatTip();
  const gap = 16;
  let x = e.clientX + gap;
  let y = e.clientY + gap;
  const tw = tip.offsetWidth  || 160;
  const th = tip.offsetHeight || 80;
  if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - gap;
  if (y + th > window.innerHeight - 8) y = e.clientY - th - gap;
  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}

function _hidePieFloatTip() {
  _getPieFloatTip().classList.remove('visible');
}

// ── Pie chart renderer ───────────────────────────────────

/**
 * Draw a donut pie chart into an SVG element and update the
 * accompanying legend counts and percentages.
 *
 * @param {string}   svgId        - id of the <svg> element
 * @param {string}   legendId     - id of the legend container
 * @param {Array}    segments     - [{ label, color, value }, …]
 * @param {string[]} legendLabels - ordered labels matching legend rows
 */
function drawPie(svgId, legendId, segments, legendLabels) {
  const svg    = document.getElementById(svgId);
  const legend = document.getElementById(legendId);
  const total  = segments.reduce((s, seg) => s + seg.value, 0);

  // ── Empty state ──────────────────────────────────────
  if (total === 0) {
    svg.innerHTML = `
      <circle cx="65" cy="65" r="52" fill="none" style="stroke:var(--bg-raised)" stroke-width="26"/>
      <text x="65" y="69" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" style="fill:var(--text-muted)">No data</text>`;
    legend.querySelectorAll('.pie-legend-count').forEach(el => el.textContent = '—');
    legend.querySelectorAll('.pie-legend-pct').forEach(el => el.textContent = '');
    return;
  }

  // ── Build arcs ───────────────────────────────────────
  const cx = 65, cy = 65, r = 48, strokeW = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  let paths = `<g transform="rotate(-90 65 65)">`;

  segments.forEach(seg => {
    if (seg.value === 0) return;
    const frac = seg.value / total;
    const dash = frac * circ;
    const gap  = circ - dash;
    const pct  = Math.round(frac * 100);
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${seg.color}" stroke-width="${strokeW}"
      stroke-dasharray="${dash.toFixed(3)} ${gap.toFixed(3)}"
      stroke-dashoffset="${(-offset * circ).toFixed(3)}"
      data-label="${seg.label}" data-value="${seg.value}" data-pct="${pct}" data-color="${seg.color}"
      style="transition:stroke-dasharray .4s ease;cursor:pointer;"
      class="pie-arc"/>`;
    offset += frac;
  });
  paths += `</g>`;
  // Center: total count + label
  paths += `<text x="65" y="62" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="20" font-weight="700" fill="var(--text-primary)">${total}</text>`;
  paths += `<text x="65" y="76" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-size="9" letter-spacing="1" fill="var(--text-muted)">TOTAL</text>`;
  svg.innerHTML = paths;

  // ── Staggered draw animation ──────────────────────────
  let arcIdx = 0;
  svg.querySelectorAll('.pie-arc').forEach(arc => {
    const targetDA = arc.getAttribute('stroke-dasharray');
    arc.style.strokeDasharray = `0 ${circ.toFixed(3)}`;
    arc.style.opacity = '0';
    arc.style.transition = 'none';
    const delay = arcIdx * 110;
    arcIdx++;
    setTimeout(() => {
      arc.style.transition = `stroke-dasharray .65s cubic-bezier(.4,0,.2,1) ${delay}ms, opacity .2s ease ${delay}ms`;
      arc.style.strokeDasharray = targetDA;
      arc.style.opacity = '1';
      // After entrance animation finishes, keep only opacity transition for smooth hover
      setTimeout(() => {
        arc.style.transition = 'opacity .18s ease';
      }, delay + 750);
    }, 30);
  });

  // ── Arc hover + mouse-tracking events ────────────────
  svg.querySelectorAll('.pie-arc').forEach(arc => {
    arc.addEventListener('mouseenter', e => {
      _showPieFloatTip(e, arc);
      svg.querySelectorAll('.pie-arc').forEach(a => {
        a.style.transition = 'opacity .18s ease';
        a.style.opacity = (a === arc) ? '1' : '0.25';
      });
    });
    arc.addEventListener('mousemove', e => _movePieFloatTip(e));
    arc.addEventListener('mouseleave', () => {
      _hidePieFloatTip();
      svg.querySelectorAll('.pie-arc').forEach(a => {
        a.style.transition = 'opacity .18s ease';
        a.style.opacity = '1';
      });
    });
  });

  svg.addEventListener('mouseleave', () => {
    _hidePieFloatTip();
    svg.querySelectorAll('.pie-arc').forEach(a => {
      a.style.transition = 'opacity .18s ease';
      a.style.opacity = '1';
    });
  });

  // ── Update legend counts + percentages ───────────────
  const rows = legend.querySelectorAll('.pie-legend-count');
  const pctBase = legendId.replace('pie-legend', 'pct'); // e.g. "ctrl-pct" or "risk-pct"

  legendLabels.forEach((lbl, i) => {
    const seg = segments.find(s => s.label === lbl);
    if (rows[i]) rows[i].textContent = seg ? seg.value : '—';

    const pctSpan = document.getElementById(`${pctBase}-${i}`);
    if (pctSpan && seg) {
      const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
      pctSpan.textContent = seg.value > 0 ? `${pct}%` : '';
    }
  });
}

// ── Dashboard refresh ─────────────────────────────────────
/**
 * Redraws the control pie and risk matrix using current data.
 * Call this after any mutation to controls or risks arrays.
 */
function refreshDashboard() {
  // Theme-aware "Not Assessed" colour: black on light, white on dark
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // ── KPI Cards ──────────────────────────────────────────
  const totalControls = controls.length;
  const totalRisks    = risks.length;
  const compliantCount = controls.filter(c => c.status === 'Compliant').length;
  const openRisks = risks.filter(r => r.riskStatus === 'Open').length;
  const complianceRate = totalControls > 0 ? Math.round((compliantCount / totalControls) * 100) : 0;

  const kpiTC = document.getElementById('kpi-total-controls');
  if (kpiTC) kpiTC.textContent = totalControls;
  const kpiTR = document.getElementById('kpi-total-risks');
  if (kpiTR) kpiTR.textContent = totalRisks;
  const kpiCR = document.getElementById('kpi-compliance-rate');
  if (kpiCR) kpiCR.textContent = complianceRate + '%';
  const kpiOR = document.getElementById('kpi-open-risks');
  if (kpiOR) kpiOR.textContent = openRisks;
  const kpiCSub = document.getElementById('kpi-controls-sub');
  if (kpiCSub) kpiCSub.textContent = `${compliantCount} compliant · ${totalControls - compliantCount} others`;
  const kpiRSub = document.getElementById('kpi-risks-sub');
  if (kpiRSub) kpiRSub.textContent = `Across ${[...new Set(risks.map(r=>r.category))].length} categories`;

  // Control Status pie — Compliant | Approaching Overdue | Overdue | Out of Scope | Not Assessed
  const ctrlStatusLabels = ['Compliant', 'Approaching Overdue', 'Overdue', 'Out of Scope', 'Not Assessed'];
  const ctrlColors = {
    'Compliant':          '#3fb950',
    'Approaching Overdue':'#d29922',
    'Overdue':            '#f85149',
    'Out of Scope':       '#8b949e',
    'Not Assessed':       isDark ? '#e6edf3' : '#1c0d04',
  };
  const ctrlSegs = ctrlStatusLabels.map(lbl => ({
    label: lbl,
    color: ctrlColors[lbl],
    value: controls.filter(c => c.status === lbl).length,
  }));
  drawPie('ctrl-pie', 'ctrl-pie-legend', ctrlSegs, ctrlStatusLabels);

  // Risk Status pie
  const riskStatusLabels = ['Open', 'Pending Approval', 'Action Plan In Progress', 'Accepted', 'Closed'];
  const riskStatusColors = {
    'Open':                    '#f85149',
    'Pending Approval':        '#d29922',
    'Action Plan In Progress': '#58a6ff',
    'Accepted':                '#bc8cff',
    'Closed':                  '#3fb950',
  };
  const riskSegs = riskStatusLabels.map(lbl => ({
    label: lbl,
    color: riskStatusColors[lbl],
    value: risks.filter(r => r.riskStatus === lbl).length,
  }));
  drawPie('risk-pie', 'risk-pie-legend', riskSegs, riskStatusLabels);

  // ── Risk Heat Matrix ────────────────────────────────────
  drawRiskMatrix();
  renderOverdueSection();
}

// ── Overdue + Approaching Overdue section renderer ────────
function renderOverdueSection() {
  const todayStr = todayISO();
  const today    = new Date(todayStr);

  // Ensure statuses are current before rendering
  applyOverdueStatuses();

  const overdueList     = document.getElementById('overdue-list');
  const approachingList = document.getElementById('approaching-list');
  const overdueCount    = document.getElementById('overdue-count');
  const approachCount   = document.getElementById('approaching-count');

  const overdue     = controls.filter(c => c.status === 'Overdue');
  const approaching = controls.filter(c => c.status === 'Approaching Overdue');

  if (overdueCount)  overdueCount.textContent  = overdue.length;
  if (approachCount) approachCount.textContent = approaching.length;

  function daysOverdue(c) {
    if (!c.validationDate) return 0;
    return Math.abs(Math.ceil((new Date(c.validationDate) - today) / 86400000));
  }
  function daysLeft(c) {
    if (!c.validationDate) return 0;
    return Math.ceil((new Date(c.validationDate) - today) / 86400000);
  }

  function itemHTML(c, isOverdue) {
    const days = isOverdue ? daysOverdue(c) : daysLeft(c);
    const daysLabel = isOverdue ? days + 'd overdue' : days + 'd left';
    const daysClass = isOverdue ? 'overdue-days overdue' : 'overdue-days approaching';
    return `<div class="overdue-item dg-overdue-list" onclick="openControlDrawer('${c.id}')">
      <div class="overdue-item-left">
        <span class="overdue-item-id">${c.id}</span>
        <span class="overdue-item-name">${c.name}</span>
      </div>
      <div class="overdue-item-right">
        <span class="${daysClass}">${daysLabel}</span>
        <span class="overdue-owner">${c.owner}</span>
      </div>
    </div>`;
  }

  if (overdueList) {
    overdueList.innerHTML = overdue.length
      ? overdue.map(c => itemHTML(c, true)).join('')
      : '<div class="overdue-empty">No overdue controls</div>';
  }

  if (approachingList) {
    approachingList.innerHTML = approaching.length
      ? approaching.map(c => itemHTML(c, false)).join('')
      : '<div class="overdue-empty">No controls approaching overdue</div>';
  }
}

// ── Risk Heat Matrix renderer ─────────────────────────────
function drawRiskMatrix() {
  const outer = document.getElementById('risk-matrix-outer');
  if (!outer) return;

  const levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const abbr   = ['VL', 'L', 'M', 'H', 'VH'];

  // Build a count map: likelihood (col) × impact (row) → risks[]
  const map = {};
  risks.forEach(r => {
    const key = r.likelihood + '|' + r.impact;
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });

  // Cell colour by product score
  function cellStyle(imp, lik) {
    const score = { 'Very Low':1,'Low':2,'Medium':3,'High':4,'Very High':5 };
    const s = score[imp] * score[lik];
    if (s >= 16) return { bg:'rgba(248,81,73,.22)', border:'rgba(248,81,73,.4)', color:'#f85149', glow:'rgba(248,81,73,.5)' };
    if (s >= 9)  return { bg:'rgba(210,153,34,.22)', border:'rgba(210,153,34,.4)', color:'#d29922', glow:'rgba(210,153,34,.5)' };
    if (s >= 4)  return { bg:'rgba(88,166,255,.18)', border:'rgba(88,166,255,.35)', color:'#58a6ff', glow:'rgba(88,166,255,.4)' };
    return        { bg:'rgba(63,185,80,.15)',  border:'rgba(63,185,80,.3)',  color:'#3fb950', glow:'rgba(63,185,80,.4)' };
  }

  // Build tooltip for a cell
  function cellTitle(imp, lik, items) {
    if (!items.length) return `${lik} likelihood / ${imp} impact`;
    return items.map(r => `${r.id}: ${r.title}`).join('\n');
  }

  const hdr = `
    <div class="rm-h-axis-title">
      <div class="rm-h-title-text">LIKELIHOOD →</div>
    </div>
    <div class="rm-top-row">
      <div class="rm-v-axis-spacer"></div>
      <div class="rm-corner"></div>
      ${abbr.map(a => `<div class="rm-h-label">${a}</div>`).join('')}
    </div>`;

  // Rows go from Very High impact at top to Very Low at bottom
  const rows = [...levels].reverse().map((imp, ri) => {
    const cells = levels.map((lik, ci) => {
      const key   = lik + '|' + imp;
      const items = map[key] || [];
      const st    = cellStyle(imp, lik);
      const delay = (ri * 5 + ci) * 35;
      const isLive = items.length > 0;
      return `<div class="rm-cell${isLive ? ' rm-live' : ''}"
        style="background:${isLive ? st.bg : ''};border-color:${isLive ? st.border : 'var(--border-light)'};--rm-glow:${st.glow};animation-delay:${delay}ms"
        title="${cellTitle(imp, lik, items)}"
        onclick="rmCellClick('${lik}','${imp}')">
        ${isLive
          ? `<span class="rm-num" style="color:${st.color}">${items.length}</span>`
          : `<div class="rm-empty-pip"></div>`}
      </div>`;
    }).join('');
    return `<div class="rm-row"><div class="rm-v-label">${abbr[[...levels].indexOf(imp)]}</div>${cells}</div>`;
  }).join('');

  const legend = `
    <div class="rm-legend">
      <div class="rm-leg"><i style="background:rgba(63,185,80,.4)"></i>Low</div>
      <div class="rm-leg"><i style="background:rgba(88,166,255,.5)"></i>Medium</div>
      <div class="rm-leg"><i style="background:rgba(210,153,34,.5)"></i>High</div>
      <div class="rm-leg"><i style="background:rgba(248,81,73,.5)"></i>Critical</div>
    </div>`;

  outer.innerHTML = `
    ${hdr}
    <div class="rm-rows-wrap">
      <div class="rm-v-axis-title"><span>IMPACT ↑</span></div>
      <div class="rm-rows">${rows}</div>
    </div>
    ${legend}`;
}

function rmCellClick(lik, imp) {
  // Navigate to risk register page and filter — basic highlight
  const navItem = document.querySelector('[data-page="risks"]');
  if (navItem) navigate(navItem);
}
// ── Sidebar collapse (thumbtack / pin button) ─────────────
function toggleSidebar() {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  // Persist preference
  try { localStorage.setItem('regrc-sidebar-collapsed', collapsed ? '1' : '0'); } catch(e) {}
  // Update tooltip
  const btn = document.getElementById('sidebar-pin-btn');
  if (btn) btn.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
}

// Restore sidebar state on load
(function restoreSidebar() {
  try {
    if (localStorage.getItem('regrc-sidebar-collapsed') === '1') {
      document.body.classList.add('sidebar-collapsed');
      const btn = document.getElementById('sidebar-pin-btn');
      if (btn) btn.title = 'Expand sidebar';
    }
  } catch(e) {}
})();