/**
 * js/risks.js -- GRC Command Center
 *
 * Everything related to the Risk Register:
 *   - Linked-control picker (search, select, tag display)
 *   - Save new risk (modal form)
 *   - Render the risks table
 *   - Risk detail drawer (open, close, inline edits, delete)
 *
 * Depends on: state.js, ui.js
 */

// ── Active drawer state ───────────────────────────────────
let activeRiskId = null;

// ── Linked Controls Picker state ──────────────────────────
let selectedControlIds = new Set();

function refreshRiskControlSelect() {
  selectedControlIds.clear();
  renderCtrlPicker();
}

function renderCtrlPicker() {
  const list = document.getElementById('r-ctrl-list');
  const q    = (document.getElementById('r-ctrl-search')?.value || '').toLowerCase();

  if (!controls.length) {
    list.innerHTML = '<div class="ctrl-picker-empty">No controls added yet</div>';
    updateCtrlPickerTags();
    return;
  }

  list.innerHTML = controls.map(c => {
    const selected = selectedControlIds.has(c.id);
    const text     = (c.id + ' ' + c.name).toLowerCase();
    const hidden   = q && !text.includes(q) ? ' hidden' : '';
    return `
      <div class="ctrl-picker-item${selected ? ' selected' : ''}${hidden}"
           data-id="${c.id}" onclick="toggleCtrlPickerItem('${c.id}')">
        <div class="ctrl-picker-check"></div>
        <span class="ctrl-picker-item-id">${c.id}</span>
        <span>${c.name}</span>
      </div>`;
  }).join('');

  updateCtrlPickerTags();
}

function toggleCtrlPickerItem(id) {
  if (selectedControlIds.has(id)) {
    selectedControlIds.delete(id);
  } else {
    selectedControlIds.add(id);
  }
  renderCtrlPicker();
}

function removeCtrlPickerTag(id) {
  selectedControlIds.delete(id);
  renderCtrlPicker();
}

function updateCtrlPickerTags() {
  const wrap   = document.getElementById('r-ctrl-selected-wrap');
  const tagsEl = document.getElementById('r-ctrl-tags');

  if (!selectedControlIds.size) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  tagsEl.innerHTML = Array.from(selectedControlIds).map(id => `
    <span class="ctrl-picker-tag">
      ${id}
      <button type="button" onclick="removeCtrlPickerTag('${id}')" title="Remove">x</button>
    </span>`).join('');
}

function filterCtrlPicker() {
  renderCtrlPicker();
}

// ── Save Risk ─────────────────────────────────────────────
function saveRisk() {
  const title = document.getElementById('r-title').value.trim();
  const cat   = document.getElementById('r-cat').value;

  if (!title || !cat) {
    alert('Please fill in required fields (Title, Category).');
    return;
  }

  const impact     = document.getElementById('r-impact').value;
  const likelihood = document.getElementById('r-likelihood').value;
  const id         = 'RSK-' + String(riskSeq++).padStart(3, '0');

  risks.push({
    id,
    title,
    category:    cat,
    impact,
    likelihood,
    level:       deriveLevel(impact, likelihood),
    owner:       document.getElementById('r-owner').value.trim() || '--',
    treatment:   document.getElementById('r-treatment').value,
    controls:    Array.from(selectedControlIds),
    description: document.getElementById('r-desc').value.trim(),
    actionPlan:  document.getElementById('r-action').value.trim(),
    dueDate:     document.getElementById('r-due-date').value || '',
  });

  ['r-title','r-owner','r-desc','r-action','r-due-date'].forEach(f => {
    document.getElementById(f).value = '';
  });
  document.getElementById('r-cat').selectedIndex = 0;

  closeModal('risk-modal');
  renderRisks();
  refreshDashboard();
}

// ── Render Risks Table ────────────────────────────────────
function renderRisks() {
  const tbody = document.getElementById('risk-body');
  tbody.innerHTML = risks.map(r => {
    const ctrlTags = r.controls.length
      ? r.controls.map(cid => `<span class="tag">${cid}</span>`).join(' ')
      : '<span style="color:var(--text-muted);font-size:12px;">--</span>';

    return `
      <tr data-id="${r.id}" data-level="${r.level}" data-category="${r.category}"
          onclick="openRiskDrawer('${r.id}')" style="cursor:pointer;">
        <td><span class="id-code">${r.id}</span></td>
        <td>${r.title}</td>
        <td><span class="tag">${r.category}</span></td>
        <td>${r.impact}</td>
        <td>${r.likelihood}</td>
        <td>${riskPill[r.level] || r.level}</td>
        <td>${r.owner}</td>
        <td>${r.treatment}</td>
        <td><div class="tag-list">${ctrlTags}</div></td>
      </tr>`;
  }).join('');

  document.getElementById('risk-empty').style.display = risks.length ? 'none' : 'block';
}

// ── Risk Detail Drawer ────────────────────────────────────

function openRiskDrawer(id) {
  const r = risks.find(x => x.id === id);
  if (!r) return;
  activeRiskId = id;

  document.getElementById('rdw-delete-bar').classList.remove('show');
  cancelEditRiskOwner();
  cancelEditRiskAction();
  cancelEditRiskDue();

  document.getElementById('rdw-id').textContent    = r.id;
  document.getElementById('rdw-title').textContent = r.title;
  document.getElementById('rdw-category').textContent  = r.category || '--';
  document.getElementById('rdw-impact').textContent    = r.impact   || '--';
  document.getElementById('rdw-likelihood').textContent= r.likelihood|| '--';
  document.getElementById('rdw-owner').textContent     = r.owner    || '--';
  document.getElementById('rdw-treatment').textContent = r.treatment || '--';
  document.getElementById('rdw-level').innerHTML       = riskPill[r.level] || r.level;

  // Linked controls
  const ctrlEl = document.getElementById('rdw-controls');
  ctrlEl.innerHTML = r.controls.length
    ? r.controls.map(cid => `<span class="tag">${cid}</span>`).join(' ')
    : '<span style="color:var(--text-muted);font-size:12.5px;">No linked controls</span>';

  // Description
  const descEl = document.getElementById('rdw-desc');
  if (r.description && r.description.trim()) {
    descEl.textContent = r.description;
    descEl.classList.remove('empty');
  } else {
    descEl.textContent = 'No description provided.';
    descEl.classList.add('empty');
  }

  // Action Plan
  const actionEl = document.getElementById('rdw-action');
  if (r.actionPlan && r.actionPlan.trim()) {
    actionEl.textContent = r.actionPlan;
    actionEl.classList.remove('empty');
  } else {
    actionEl.textContent = 'No action plan defined.';
    actionEl.classList.add('empty');
  }

  // Due Date
  document.getElementById('rdw-due').textContent = formatDate(r.dueDate);

  document.getElementById('risk-drawer-overlay').classList.add('open');
  document.getElementById('risk-drawer').classList.add('open');
}

function closeRiskDrawer() {
  document.getElementById('risk-drawer-overlay').classList.remove('open');
  document.getElementById('risk-drawer').classList.remove('open');
  document.getElementById('rdw-delete-bar').classList.remove('show');
  cancelEditRiskOwner();
  cancelEditRiskAction();
  cancelEditRiskDue();
  activeRiskId = null;
}

// ── Inline Edit -- Owner ──────────────────────────────────

function startEditRiskOwner() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  document.getElementById('rdw-owner-input').value = r.owner === '--' ? '' : r.owner;
  document.getElementById('rdw-owner-wrap').style.display = 'none';
  document.getElementById('rdw-owner-edit').classList.add('active');
  document.getElementById('rdw-owner-input').focus();
}
function cancelEditRiskOwner() {
  document.getElementById('rdw-owner-wrap').style.display = 'flex';
  document.getElementById('rdw-owner-edit').classList.remove('active');
}
function saveEditRiskOwner() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  const v = document.getElementById('rdw-owner-input').value.trim() || '--';
  r.owner = v;
  document.getElementById('rdw-owner').textContent = v;
  cancelEditRiskOwner();
  renderRisks();
}

// ── Inline Edit -- Action Plan ────────────────────────────

function startEditRiskAction() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  document.getElementById('rdw-action-input').value = r.actionPlan || '';
  document.getElementById('rdw-action-wrap').style.display = 'none';
  document.getElementById('rdw-action-edit').classList.add('active');
  document.getElementById('rdw-action-input').focus();
}
function cancelEditRiskAction() {
  document.getElementById('rdw-action-wrap').style.display = 'flex';
  document.getElementById('rdw-action-edit').classList.remove('active');
}
function saveEditRiskAction() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  const v = document.getElementById('rdw-action-input').value.trim();
  r.actionPlan = v;
  const el = document.getElementById('rdw-action');
  if (v) {
    el.textContent = v;
    el.classList.remove('empty');
  } else {
    el.textContent = 'No action plan defined.';
    el.classList.add('empty');
  }
  cancelEditRiskAction();
}

// ── Inline Edit -- Due Date ───────────────────────────────

function startEditRiskDue() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  document.getElementById('rdw-due-input').value = r.dueDate || '';
  document.getElementById('rdw-due-wrap').style.display = 'none';
  document.getElementById('rdw-due-edit').classList.add('active');
  document.getElementById('rdw-due-input').focus();
}
function cancelEditRiskDue() {
  document.getElementById('rdw-due-wrap').style.display = 'flex';
  document.getElementById('rdw-due-edit').classList.remove('active');
}
function saveEditRiskDue() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  const v = document.getElementById('rdw-due-input').value;
  r.dueDate = v;
  document.getElementById('rdw-due').textContent = formatDate(v);
  cancelEditRiskDue();
}

// ── Delete Risk ───────────────────────────────────────────

function promptDeleteRisk() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  document.getElementById('rdw-delete-name').textContent = r.title;
  document.getElementById('rdw-delete-bar').classList.add('show');
  document.getElementById('risk-drawer').querySelector('.drawer-body').scrollTop = 0;
}
function cancelDeleteRisk() {
  document.getElementById('rdw-delete-bar').classList.remove('show');
}
function confirmDeleteRisk() {
  risks = risks.filter(r => r.id !== activeRiskId);
  closeRiskDrawer();
  renderRisks();
  refreshDashboard();
}