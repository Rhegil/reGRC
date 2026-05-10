/**
 * js/controls.js — GRC Command Center
 *
 * Everything related to the Control Library:
 *   - Save new control (modal form)
 *   - Render the controls table
 *   - Control detail drawer (open, close, inline edits)
 *   - Validate control (mark Compliant + set today's date)
 *   - Delete control
 *   - File attachments (upload, drag-drop, remove)
 *
 * Depends on: state.js, ui.js
 */

// ── Active drawer state ───────────────────────────────────
let activeControlId = null;

// ── Save Control (modal form) ─────────────────────────────
function saveControl() {
  const name   = document.getElementById('c-name').value.trim();
  const domain = document.getElementById('c-domain').value;
  const status = document.getElementById('c-status').value;

  if (!name || !domain) {
    alert('Please fill in required fields (Name, Domain).');
    return;
  }

  const validationDate = document.getElementById('c-validation-date').value;
  if (validationDate) {
    if (validationDate < todayISO()) {
      alert('Validation Date must be today or a future date.');
      return;
    }
  }

  const id = nextCtrlId(domain);
  controls.push({
    id,
    name,
    domain,
    validationDate: validationDate || '',
    frequency:      document.getElementById('c-frequency').value || '—',
    owner:          document.getElementById('c-owner').value.trim() || '—',
    status,
    description:    document.getElementById('c-desc').value.trim(),
    attachments:    [],
  });

  // Reset form fields
  ['c-name', 'c-owner', 'c-desc', 'c-validation-date'].forEach(f => {
    document.getElementById(f).value = '';
  });
  ['c-domain', 'c-frequency'].forEach(f => {
    document.getElementById(f).selectedIndex = 0;
  });
  document.getElementById('c-status').value = 'Not Assessed';

  closeModal('control-modal');
  renderControls();
  refreshDashboard();
}

// ── Render Controls Table ─────────────────────────────────
function renderControls() {
  applyOverdueStatuses();
  const tbody = document.getElementById('ctrl-body');
  tbody.innerHTML = controls.map(c => `
    <tr data-id="${c.id}" data-status="${c.status}" data-domain="${c.domain}"
        onclick="openControlDrawer('${c.id}')">
      <td><span class="id-code">${c.id}</span></td>
      <td>${c.name}</td>
      <td><span class="tag">${c.domain}</span></td>
      <td><span class="id-code" style="color:var(--accent-blue)">${formatDate(c.validationDate)}</span></td>
      <td>${c.frequency}</td>
      <td>${c.owner}</td>
      <td>${ctrlPill[c.status] || c.status}</td>
    </tr>
  `).join('');

  document.getElementById('ctrl-empty').style.display = controls.length ? 'none' : 'block';
}

// ── Control Detail Drawer ─────────────────────────────────

function openControlDrawer(id) {
  const c = controls.find(x => x.id === id);
  if (!c) return;
  activeControlId = id;

  // Reset confirmation bars and any open inline editors
  document.getElementById('dw-delete-bar').classList.remove('show');
  document.getElementById('dw-validate-bar').classList.remove('show');
  cancelEditStatus();
  cancelEditOwner();

  // Populate header
  document.getElementById('dw-id').textContent   = c.id;
  document.getElementById('dw-name').textContent  = c.name;

  // Populate detail fields
  document.getElementById('dw-domain').textContent          = c.domain || '—';
  document.getElementById('dw-owner').textContent           = c.owner || '—';
  document.getElementById('dw-frequency').textContent       = c.frequency || '—';
  document.getElementById('dw-validation-date').textContent = formatDate(c.validationDate);
  document.getElementById('dw-status').innerHTML            = ctrlPill[c.status] || c.status;

  // Description
  const descEl = document.getElementById('dw-desc');
  if (c.description && c.description.trim()) {
    descEl.textContent = c.description;
    descEl.classList.remove('empty');
  } else {
    descEl.textContent = 'No description provided.';
    descEl.classList.add('empty');
  }

  // Attachments
  renderAttachments(c);

  // Slide open
  document.getElementById('ctrl-drawer-overlay').classList.add('open');
  document.getElementById('ctrl-drawer').classList.add('open');
}

function closeDrawer() {
  document.getElementById('ctrl-drawer-overlay').classList.remove('open');
  document.getElementById('ctrl-drawer').classList.remove('open');
  document.getElementById('dw-delete-bar').classList.remove('show');
  document.getElementById('dw-validate-bar').classList.remove('show');
  cancelEditStatus();
  cancelEditOwner();
  activeControlId = null;
}

// Close drawer on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();
});

// ── Inline Edit — Status ──────────────────────────────────

function startEditStatus() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  document.getElementById('dw-status-input').value = c.status;
  document.getElementById('dw-status-wrap').style.display = 'none';
  document.getElementById('dw-status-edit').classList.add('active');
  document.getElementById('dw-status-input').focus();
}

function cancelEditStatus() {
  document.getElementById('dw-status-wrap').style.display = 'flex';
  document.getElementById('dw-status-edit').classList.remove('active');
}

function saveEditStatus() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  const newStatus = document.getElementById('dw-status-input').value;
  c.status = newStatus;
  document.getElementById('dw-status').innerHTML = ctrlPill[newStatus] || newStatus;
  cancelEditStatus();
  renderControls();
  refreshDashboard();
}

// ── Inline Edit — Owner ───────────────────────────────────

function startEditOwner() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  document.getElementById('dw-owner-input').value = c.owner === '—' ? '' : c.owner;
  document.getElementById('dw-owner-wrap').style.display = 'none';
  document.getElementById('dw-owner-edit').classList.add('active');
  document.getElementById('dw-owner-input').focus();
}

function cancelEditOwner() {
  document.getElementById('dw-owner-wrap').style.display = 'flex';
  document.getElementById('dw-owner-edit').classList.remove('active');
}

function saveEditOwner() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  const newOwner = document.getElementById('dw-owner-input').value.trim() || '—';
  c.owner = newOwner;
  document.getElementById('dw-owner').textContent = newOwner;
  cancelEditOwner();
  renderControls();
}

// ── Validate Control ──────────────────────────────────────

function promptValidateControl() {
  document.getElementById('dw-delete-bar').classList.remove('show');
  document.getElementById('dw-validate-bar').classList.add('show');
  document.getElementById('ctrl-drawer').querySelector('.drawer-body').scrollTop = 0;
}

function cancelValidate() {
  document.getElementById('dw-validate-bar').classList.remove('show');
}

function confirmValidateControl() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;

  c.status         = 'Compliant';
  c.validationDate = todayISO();

  // Update drawer display immediately (no full re-render needed)
  document.getElementById('dw-status').innerHTML            = ctrlPill['Compliant'];
  document.getElementById('dw-validation-date').textContent = formatDate(c.validationDate);

  document.getElementById('dw-validate-bar').classList.remove('show');
  renderControls();
  refreshDashboard();
}

// ── Delete Control ────────────────────────────────────────

function promptDeleteControl() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  document.getElementById('dw-validate-bar').classList.remove('show');
  document.getElementById('dw-delete-name').textContent = c.name;
  document.getElementById('dw-delete-bar').classList.add('show');
  document.getElementById('ctrl-drawer').querySelector('.drawer-body').scrollTop = 0;
}

function cancelDelete() {
  document.getElementById('dw-delete-bar').classList.remove('show');
}

function confirmDeleteControl() {
  // Remove from controls array
  controls = controls.filter(c => c.id !== activeControlId);

  // Remove from any linked risks
  risks.forEach(r => {
    r.controls = r.controls.filter(cid => cid !== activeControlId);
  });

  closeDrawer();
  renderControls();
  renderRisks();
  refreshDashboard();
}

// ── Attachments ───────────────────────────────────────────

/**
 * Return icon style metadata based on file extension.
 * @param {string} name - filename
 * @returns {{ bg, color, label }}
 */
function fileTypeStyle(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map = {
    pdf:  { bg: 'rgba(248,81,73,.15)',   color: '#f85149', label: 'PDF' },
    doc:  { bg: 'rgba(88,166,255,.15)',  color: '#58a6ff', label: 'DOC' },
    docx: { bg: 'rgba(88,166,255,.15)',  color: '#58a6ff', label: 'DOC' },
    xls:  { bg: 'rgba(63,185,80,.15)',   color: '#3fb950', label: 'XLS' },
    xlsx: { bg: 'rgba(63,185,80,.15)',   color: '#3fb950', label: 'XLS' },
    ppt:  { bg: 'rgba(210,153,34,.15)',  color: '#d29922', label: 'PPT' },
    pptx: { bg: 'rgba(210,153,34,.15)',  color: '#d29922', label: 'PPT' },
    png:  { bg: 'rgba(188,140,255,.15)', color: '#bc8cff', label: 'IMG' },
    jpg:  { bg: 'rgba(188,140,255,.15)', color: '#bc8cff', label: 'IMG' },
    jpeg: { bg: 'rgba(188,140,255,.15)', color: '#bc8cff', label: 'IMG' },
    gif:  { bg: 'rgba(188,140,255,.15)', color: '#bc8cff', label: 'IMG' },
    zip:  { bg: 'rgba(139,148,158,.15)', color: '#8b949e', label: 'ZIP' },
    csv:  { bg: 'rgba(63,185,80,.15)',   color: '#3fb950', label: 'CSV' },
    txt:  { bg: 'rgba(139,148,158,.15)', color: '#8b949e', label: 'TXT' },
  };
  return map[ext] || {
    bg: 'rgba(88,166,255,.1)',
    color: '#58a6ff',
    label: ext.toUpperCase().slice(0, 3) || 'FILE',
  };
}

function formatBytes(bytes) {
  if (bytes < 1024)          return bytes + ' B';
  if (bytes < 1024 * 1024)   return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function renderAttachments(c) {
  const list  = document.getElementById('dw-attach-list');
  const count = document.getElementById('dw-attach-count');
  const attachments = c.attachments || [];

  count.textContent = attachments.length + (attachments.length === 1 ? ' file' : ' files');

  if (!attachments.length) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = attachments.map((a, i) => {
    const ts = fileTypeStyle(a.name);
    return `
      <div class="attach-item">
        <div class="attach-icon" style="background:${ts.bg};color:${ts.color}">${ts.label}</div>
        <div class="attach-info">
          <div class="attach-name" title="${a.name}">${a.name}</div>
          <div class="attach-meta">${formatBytes(a.size)} · Added ${a.added}</div>
        </div>
        <button class="attach-remove" title="Remove attachment"
                onclick="removeAttachment('${c.id}', ${i})">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
        </button>
      </div>`;
  }).join('');
}

function handleFileSelect(event) {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  if (!c.attachments) c.attachments = [];

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  Array.from(event.target.files).forEach(f => {
    if (f.size > 50 * 1024 * 1024) {
      alert(`"${f.name}" exceeds the 50 MB limit and was not added.`);
      return;
    }
    c.attachments.push({ name: f.name, size: f.size, added: today });
  });

  event.target.value = ''; // reset so the same file can be re-added
  renderAttachments(c);
}

function removeAttachment(controlId, index) {
  const c = controls.find(x => x.id === controlId);
  if (!c || !c.attachments) return;
  c.attachments.splice(index, 1);
  renderAttachments(c);
}

// ── Drag-and-drop onto the drop zone ─────────────────────
const dropZone = document.getElementById('dw-drop-zone');

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  if (!c.attachments) c.attachments = [];

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  Array.from(e.dataTransfer.files).forEach(f => {
    if (f.size > 50 * 1024 * 1024) {
      alert(`"${f.name}" exceeds 50 MB.`);
      return;
    }
    c.attachments.push({ name: f.name, size: f.size, added: today });
  });

  renderAttachments(c);
});