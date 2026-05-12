/**
 * js/risks.js -- ReGRC
 *
 * Risk Register:
 *   - Linked-control picker
 *   - Save new risk (modal form)
 *   - Render the risks table (ID, Title, Category, Risk Level, Status, Owner, Treatment, Linked Controls)
 *   - Risk detail drawer (open, close, edit-mode for Owner+Status, delete)
 *
 * Depends on: state.js, ui.js
 */

let activeRiskId        = null;
let _riskEditMode       = false;
let selectedControlIds  = new Set();

// ── Linked Controls Picker ────────────────────────────────
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
  if (selectedControlIds.has(id)) selectedControlIds.delete(id);
  else                            selectedControlIds.add(id);
  renderCtrlPicker();
}

function removeCtrlPickerTag(id) {
  selectedControlIds.delete(id);
  renderCtrlPicker();
}

function updateCtrlPickerTags() {
  const wrap   = document.getElementById('r-ctrl-selected-wrap');
  const tagsEl = document.getElementById('r-ctrl-tags');
  if (!selectedControlIds.size) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  tagsEl.innerHTML = Array.from(selectedControlIds).map(id => `
    <span class="ctrl-picker-tag">
      ${id}
      <button type="button" onclick="removeCtrlPickerTag('${id}')" title="Remove">×</button>
    </span>`).join('');
}

function filterCtrlPicker() { renderCtrlPicker(); }

// ── Save Risk (modal form) ────────────────────────────────
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
    id, title,
    category:    cat,
    impact, likelihood,
    level:       deriveLevel(impact, likelihood),
    owner:       document.getElementById('r-owner').value.trim() || '—',
    treatment:   document.getElementById('r-treatment').value,
    riskStatus:  document.getElementById('r-status').value || 'Open',
    controls:    Array.from(selectedControlIds),
    description: document.getElementById('r-desc').value.trim(),
    actionPlan:  document.getElementById('r-action').value.trim(),
    dueDate:     document.getElementById('r-due-date').value || '',
  });

  ['r-title','r-owner','r-desc','r-action','r-due-date'].forEach(f => {
    document.getElementById(f).value = '';
  });
  document.getElementById('r-cat').selectedIndex = 0;
  document.getElementById('r-status').value = 'Open';

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
      : '<span style="color:var(--text-muted);font-size:12px;">—</span>';

    return `
      <tr data-id="${r.id}" data-level="${r.level}" data-category="${r.category}" data-status="${r.riskStatus}"
          onclick="openRiskDrawer('${r.id}')" style="cursor:pointer;">
        <td><span class="id-code">${r.id}</span></td>
        <td>${r.title}</td>
        <td><span class="tag">${r.category}</span></td>
        <td>${r.owner}</td>
        <td>${r.treatment}</td>
        <td>${riskLevelText[r.level] || r.level}</td>
        <td>${riskStatusText[r.riskStatus] || r.riskStatus || '—'}</td>
      </tr>`;
  }).join('');

  document.getElementById('risk-empty').style.display = risks.length ? 'none' : 'block';
}

// ── Risk Detail Drawer ────────────────────────────────────

function openRiskDrawer(id) {
  const r = risks.find(x => x.id === id);
  if (!r) return;
  activeRiskId = id;
  _riskEditMode = false;

  document.getElementById('rdw-delete-bar').classList.remove('show');
  _renderRiskDrawerContent(r);
  _toggleRiskEditMode(false);

  document.getElementById('risk-drawer-overlay').classList.add('open');
}

function handleRiskOverlayClick(e) {
  if (e.target === document.getElementById('risk-drawer-overlay')) closeRiskDrawer();
}

function _renderRiskDrawerContent(r) {
  document.getElementById('rdw-id').textContent          = r.id;
  document.getElementById('rdw-title').textContent       = r.title;
  document.getElementById('rdw-category').textContent    = r.category   || '—';
  document.getElementById('rdw-impact').textContent      = r.impact     || '—';
  document.getElementById('rdw-likelihood').textContent  = r.likelihood || '—';
  document.getElementById('rdw-owner').textContent       = r.owner      || '—';
  document.getElementById('rdw-treatment').textContent   = r.treatment  || '—';
  document.getElementById('rdw-due').textContent         = formatDate(r.dueDate);
  document.getElementById('rdw-level').innerHTML         = riskPill[r.level] || r.level;
  document.getElementById('rdw-status').innerHTML        = riskStatusPill[r.riskStatus] || (r.riskStatus || '—');

  const ctrlEl = document.getElementById('rdw-controls');
  ctrlEl.innerHTML = r.controls.length
    ? r.controls.map(cid => {
        const c = controls.find(x => x.id === cid);
        let extraStyle = '';
        if (c) {
          if      (c.status === 'Overdue')            extraStyle = 'border-color:#c03020;color:#c03020;background:rgba(192,48,32,.10);';
          else if (c.status === 'Approaching Overdue') extraStyle = 'border-color:#c09010;color:#c09010;background:rgba(192,144,16,.10);';
          else if (c.status === 'Compliant')           extraStyle = 'border-color:#5a7a30;color:#5a7a30;background:rgba(90,122,48,.10);';
          else if (c.status === 'Not Assessed')        extraStyle = 'border-color:#8a8a8a;color:#8a8a8a;background:rgba(138,138,138,.10);';
        }
        return `<span class="tag ctrl-link-tag" style="cursor:pointer;${extraStyle}" onclick="showCtrlInfoPopup('${cid}', event)">${cid}</span>`;
      }).join(' ')
    : '<span style="color:var(--text-muted);font-size:12.5px;">No linked controls</span>';

  const descEl = document.getElementById('rdw-desc');
  if (r.description && r.description.trim()) {
    descEl.textContent = r.description; descEl.classList.remove('empty');
  } else {
    descEl.textContent = 'No description provided.'; descEl.classList.add('empty');
  }

  const actionEl = document.getElementById('rdw-action');
  if (r.actionPlan && r.actionPlan.trim()) {
    actionEl.textContent = r.actionPlan; actionEl.classList.remove('empty');
  } else {
    actionEl.textContent = 'No action plan defined.'; actionEl.classList.add('empty');
  }
}

function closeRiskDrawer() {
  document.getElementById('risk-drawer-overlay').classList.remove('open');
  document.getElementById('rdw-delete-bar').classList.remove('show');
  _toggleRiskEditMode(false);
  activeRiskId = null;
  const popup = document.getElementById('ctrl-info-popup');
  if (popup) popup.style.display = 'none';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeRiskDrawer();
});

// ── Edit Mode (Owner + Status + Due Date) — pencil toggles ─

function _toggleRiskEditMode(on) {
  _riskEditMode = !!on;
  const editBtn = document.getElementById('rdw-edit-btn');
  editBtn.classList.toggle('editing', on);
  editBtn.title = on ? 'Save changes' : 'Edit';

  const toggle = (readId, editId) => {
    document.getElementById(readId).style.display = on ? 'none' : '';
    document.getElementById(editId).style.display  = on ? ''     : 'none';
  };

  toggle('rdw-status',    'rdw-status-input');
  toggle('rdw-owner',     'rdw-owner-input');
  toggle('rdw-due',       'rdw-due-input');
  toggle('rdw-category',  'rdw-category-input');
  toggle('rdw-impact',    'rdw-impact-input');
  toggle('rdw-likelihood','rdw-likelihood-input');
  toggle('rdw-treatment', 'rdw-treatment-input');
  toggle('rdw-desc',      'rdw-desc-input');
  toggle('rdw-action',    'rdw-action-input');
}

function toggleRiskEditMode() {
  if (!_riskEditMode) {
    const r = risks.find(x => x.id === activeRiskId);
    if (!r) return;
    document.getElementById('rdw-status-input').value     = r.riskStatus || 'Open';
    document.getElementById('rdw-owner-input').value      = r.owner === '—' ? '' : r.owner;
    document.getElementById('rdw-due-input').value        = r.dueDate || '';
    document.getElementById('rdw-category-input').value   = r.category || '';
    document.getElementById('rdw-impact-input').value     = r.impact || 'Medium';
    document.getElementById('rdw-likelihood-input').value = r.likelihood || 'Medium';
    document.getElementById('rdw-treatment-input').value  = r.treatment || 'Mitigate';
    document.getElementById('rdw-desc-input').value       = r.description || '';
    document.getElementById('rdw-action-input').value     = r.actionPlan || '';
    _toggleRiskEditMode(true);
  } else {
    saveRiskEditMode();
  }
}

function enterRiskEditMode() { toggleRiskEditMode(); }
function cancelRiskEditMode() { _toggleRiskEditMode(false); }

function saveRiskEditMode() {
  const r = risks.find(x => x.id === activeRiskId);
  if (!r) return;
  r.riskStatus  = document.getElementById('rdw-status-input').value;
  r.owner       = document.getElementById('rdw-owner-input').value.trim() || '—';
  r.dueDate     = document.getElementById('rdw-due-input').value || '';
  r.category    = document.getElementById('rdw-category-input').value;
  r.impact      = document.getElementById('rdw-impact-input').value;
  r.likelihood  = document.getElementById('rdw-likelihood-input').value;
  r.treatment   = document.getElementById('rdw-treatment-input').value;
  r.level       = deriveLevel(r.impact, r.likelihood);
  r.description = document.getElementById('rdw-desc-input').value.trim();
  r.actionPlan  = document.getElementById('rdw-action-input').value.trim();
  _renderRiskDrawerContent(r);
  _toggleRiskEditMode(false);
  renderRisks();
  refreshDashboard();
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

// ── Linked Control Info Popup ─────────────────────────────

function showCtrlInfoPopup(cid, event) {
  event.stopPropagation();
  const c = controls.find(x => x.id === cid);
  const popup = document.getElementById('ctrl-info-popup');
  if (!popup) return;

  if (!c) {
    document.getElementById('ctrl-popup-id').textContent   = cid;
    document.getElementById('ctrl-popup-name').textContent = 'Control not found';
    document.getElementById('ctrl-popup-domain').textContent = '';
    document.getElementById('ctrl-popup-desc').textContent  = 'This control may have been deleted.';
  } else {
    document.getElementById('ctrl-popup-id').textContent    = c.id;
    document.getElementById('ctrl-popup-name').textContent  = c.name;
    document.getElementById('ctrl-popup-domain').textContent = c.domain + ' · ' + (c.status || '');
    document.getElementById('ctrl-popup-desc').textContent   = c.description || 'No description available.';
  }

  // Position popup near the tag
  popup.style.display = 'block';
  const rect = event.target.getBoundingClientRect();
  let left = rect.left;
  let top  = rect.bottom + 8;
  // Keep within viewport
  const pw = popup.offsetWidth || 280;
  const ph = popup.offsetHeight || 120;
  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
  if (top + ph > window.innerHeight - 8) top = rect.top - ph - 8;
  popup.style.left = left + 'px';
  popup.style.top  = top + 'px';
}

// Close popup on outside click
document.addEventListener('click', () => {
  const popup = document.getElementById('ctrl-info-popup');
  if (popup) popup.style.display = 'none';
});