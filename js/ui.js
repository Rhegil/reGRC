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
  const cx = 65, cy = 65, r = 52, strokeW = 26;
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
    }, 30);
  });

  // ── Arc hover + mouse-tracking events ────────────────
  svg.querySelectorAll('.pie-arc').forEach(arc => {
    arc.addEventListener('mouseenter', e => {
      _showPieFloatTip(e, arc);
      svg.querySelectorAll('.pie-arc').forEach(a => {
        a.style.opacity = (a === arc) ? '1' : '0.3';
      });
    });
    arc.addEventListener('mousemove', e => _movePieFloatTip(e));
    arc.addEventListener('mouseleave', () => {
      _hidePieFloatTip();
      svg.querySelectorAll('.pie-arc').forEach(a => { a.style.opacity = '1'; });
    });
  });

  svg.addEventListener('mouseleave', () => {
    _hidePieFloatTip();
    svg.querySelectorAll('.pie-arc').forEach(a => { a.style.opacity = '1'; });
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
  // Control Status pie
  const ctrlStatusLabels = ['Compliant', 'In Review', 'Non-Compliant', 'Not Assessed', 'Out of Scope'];
  const ctrlColors = {
    'Compliant':     '#3fb950',
    'In Review':     '#d29922',
    'Non-Compliant': '#f85149',
    'Not Assessed':  '#484f58',
    'Out of Scope':  '#bc8cff',
  };
  const ctrlSegs = ctrlStatusLabels.map(lbl => ({
    label: lbl,
    color: ctrlColors[lbl],
    value: controls.filter(c => c.status === lbl).length,
  }));
  drawPie('ctrl-pie', 'ctrl-pie-legend', ctrlSegs, ctrlStatusLabels);

  // Risk Likelihood x Impact heat matrix
  drawRiskMatrix();
}

// ── Risk Likelihood x Impact Heat Matrix ─────────────────

function drawRiskMatrix() {
  const wrap = document.getElementById('risk-matrix-wrap');
  if (!wrap) return;

  const likelihoods = ['Very Low','Low','Medium','High','Very High'];
  const impacts     = ['Very High','High','Medium','Low','Very Low']; // top row = highest impact
  const abbr        = {'Very High':'VH','High':'H','Medium':'M','Low':'L','Very Low':'VL'};
  const scoreMap    = {'Very Low':1,'Low':2,'Medium':3,'High':4,'Very High':5};

  // Count risks per cell
  const matrix = {};
  risks.forEach(r => {
    const key = r.impact + '|' + r.likelihood;
    matrix[key] = (matrix[key] || 0) + 1;
  });

  const _isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  function cellMeta(imp, lik) {
    const s = scoreMap[imp] * scoreMap[lik];
    const dk = _isDark();
    if (s >= 16) return { level:'Critical', color: dk?'#f85149':'#8f1e10', bg: dk?'rgba(248,81,73,.22)':'rgba(192,48,32,.14)',  border: dk?'rgba(248,81,73,.5)':'rgba(192,48,32,.35)',  glow: dk?'#f85149':'rgba(192,48,32,.4)' };
    if (s >= 9)  return { level:'High',     color: dk?'#ff7b72':'#a03010', bg: dk?'rgba(255,123,114,.17)':'rgba(192,80,32,.1)',  border: dk?'rgba(255,123,114,.42)':'rgba(192,80,32,.28)', glow: dk?'#ff7b72':'rgba(192,80,32,.35)' };
    if (s >= 4)  return { level:'Medium',   color: dk?'#d29922':'#7a5000', bg: dk?'rgba(210,153,34,.17)':'rgba(184,120,8,.12)',  border: dk?'rgba(210,153,34,.4)':'rgba(184,120,8,.3)',   glow: dk?'#d29922':'rgba(184,120,8,.4)' };
    return              { level:'Low',      color: dk?'#58a6ff':'#5a2e0a', bg: dk?'rgba(88,166,255,.13)':'rgba(122,69,32,.1)',   border: dk?'rgba(88,166,255,.32)':'rgba(122,69,32,.28)',  glow: dk?'#58a6ff':'rgba(122,69,32,.35)' };
  }

  let html = '<div class="rm-outer">';

  // Likelihood axis title + header labels
  html += '<div class="rm-top-row">';
  html += '<div class="rm-v-axis-spacer"></div>';
  html += '<div class="rm-corner"></div>';
  likelihoods.forEach(l => {
    html += '<div class="rm-h-label">' + abbr[l] + '</div>';
  });
  html += '</div>';

  html += '<div class="rm-h-axis-title"><span></span><span class="rm-h-title-text">LIKELIHOOD \u2192</span></div>';

  // Matrix rows
  html += '<div class="rm-rows-wrap">';
  html += '<div class="rm-v-axis-title"><span>\u2191 IMPACT</span></div>';
  html += '<div class="rm-rows">';

  impacts.forEach((imp, ri) => {
    html += '<div class="rm-row">';
    html += '<div class="rm-v-label">' + abbr[imp] + '</div>';
    likelihoods.forEach((lik, ci) => {
      const count = matrix[imp + '|' + lik] || 0;
      const m     = cellMeta(imp, lik);
      const delay = (ri * 5 + ci) * 18;
      const bg     = count > 0 ? m.bg     : 'rgba(200,170,136,.15)';
      const border = count > 0 ? m.border : 'rgba(200,170,136,.35)';
      html += '<div class="rm-cell' + (count > 0 ? ' rm-live' : '') + '"'
            + ' style="background:' + bg + ';border-color:' + border + ';--rm-glow:' + m.glow + ';animation-delay:' + delay + 'ms"'
            + ' data-impact="' + imp + '" data-likelihood="' + lik + '"'
            + ' data-count="' + count + '" data-level="' + m.level + '" data-color="' + m.color + '"'
            + (count > 0 ? ' onmouseenter="showMatrixTip(event,this)" onmousemove="_movePieFloatTip(event)" onmouseleave="_hidePieFloatTip()"' : '')
            + '>'
            + (count > 0
                ? '<span class="rm-num" style="color:' + m.color + '">' + count + '</span>'
                : '<span class="rm-empty-pip"></span>')
            + '</div>';
    });
    html += '</div>';
  });

  html += '</div></div>'; // rm-rows, rm-rows-wrap

  // Legend
  html += '<div class="rm-legend">'
        + '<span class="rm-leg"><i style="background:rgba(122,69,32,.45)"></i>Low</span>'
        + '<span class="rm-leg"><i style="background:rgba(184,120,8,.65)"></i>Medium</span>'
        + '<span class="rm-leg"><i style="background:rgba(192,80,32,.65)"></i>High</span>'
        + '<span class="rm-leg"><i style="background:rgba(192,48,32,.85)"></i>Critical</span>'
        + '</div>';

  html += '</div>'; // rm-outer
  wrap.innerHTML = html;
}

function showMatrixTip(e, el) {
  const count      = parseInt(el.dataset.count);
  const level      = el.dataset.level;
  const impact     = el.dataset.impact;
  const likelihood = el.dataset.likelihood;
  const color      = el.dataset.color;
  const tip        = _getPieFloatTip();

  tip.style.borderLeftColor = count > 0 ? color : 'var(--border)';
  tip.innerHTML = '<div class="pie-ft-label">' + level + ' Risk Zone</div>'
    + '<div class="pie-ft-row">'
    + '<span class="pie-ft-count" style="color:' + (count > 0 ? color : 'var(--text-muted)') + '">' + count + '</span>'
    + '<span class="pie-ft-pct">risk' + (count !== 1 ? 's' : '') + '</span>'
    + '</div>'
    + '<div class="rm-tip-meta">'
    + 'Impact &nbsp;&nbsp;&nbsp;<span>' + impact + '</span><br>'
    + 'Likelihood <span>' + likelihood + '</span>'
    + '</div>'
    + (count > 0 ? '<div class="pie-ft-bar" style="background:' + color + ';width:100%"></div>' : '');

  tip.classList.add('visible');
  _movePieFloatTip(e);
}