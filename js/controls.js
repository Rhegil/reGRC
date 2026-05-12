/**
 * js/controls.js -- ReGRC
 *
 * Control Library:
 *   - Save new control (modal form)
 *   - Render the controls table
 *   - Control detail drawer (open, close, edit-mode for Owner+Status)
 *   - Validate control (mark Compliant + set today's date)
 *   - Delete control
 *   - File attachments (upload, drag-drop, remove)
 *
 * Depends on: state.js, ui.js
 */

let activeControlId = null;
let _ctrlEditMode   = false;

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
  if (validationDate && validationDate < todayISO()) {
    alert('Validation Date must be today or a future date.');
    return;
  }

  const id = nextCtrlId(domain);
  controls.push({
    id, name, domain,
    validationDate: validationDate || '',
    frequency:          document.getElementById('c-frequency').value || '—',
    owner:              document.getElementById('c-owner').value.trim() || '—',
    status,
    description:        document.getElementById('c-desc').value.trim(),
    testProcedure:      document.getElementById('c-test-procedure').value.trim(),
    attachmentRequired: document.getElementById('c-attach-required').value || 'No',
    attachments:        [],
  });

  // Reset form
  ['c-name','c-owner','c-desc','c-validation-date','c-test-procedure'].forEach(f => document.getElementById(f).value = '');
  ['c-domain','c-frequency','c-attach-required'].forEach(f => {
    const el = document.getElementById(f); if (el) el.selectedIndex = 0;
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
      <td>${ctrlStatusText[c.status] || c.status}</td>
    </tr>
  `).join('');

  document.getElementById('ctrl-empty').style.display = controls.length ? 'none' : 'block';
}

// ── Control Detail Drawer ─────────────────────────────────

function openControlDrawer(id) {
  const c = controls.find(x => x.id === id);
  if (!c) return;
  activeControlId = id;
  _ctrlEditMode   = false;

  document.getElementById('dw-delete-bar').classList.remove('show');
  document.getElementById('dw-validate-bar').classList.remove('show');
  _renderControlDrawerContent(c);
  _toggleControlEditMode(false);

  document.getElementById('ctrl-drawer-overlay').classList.add('open');
}

function handleCtrlOverlayClick(e) {
  if (e.target === document.getElementById('ctrl-drawer-overlay')) closeDrawer();
}

function _renderControlDrawerContent(c) {
  document.getElementById('dw-id').textContent              = c.id;
  document.getElementById('dw-name').textContent            = c.name;
  document.getElementById('dw-domain').textContent          = c.domain || '—';
  document.getElementById('dw-owner').textContent           = c.owner || '—';
  document.getElementById('dw-frequency').textContent       = c.frequency || '—';
  document.getElementById('dw-validation-date').textContent = formatDate(c.validationDate);
  document.getElementById('dw-status').innerHTML            = ctrlPill[c.status] || c.status;
  document.getElementById('dw-attach-required').textContent = c.attachmentRequired || 'No';
  // Show/hide attachment required notice in col 3
  const noticeEl = document.getElementById('dw-attach-notice');
  if (noticeEl) noticeEl.style.display = (c.attachmentRequired === 'Yes') ? 'flex' : 'none';

  const descEl = document.getElementById('dw-desc');
  if (c.description && c.description.trim()) {
    descEl.textContent = c.description;
    descEl.classList.remove('empty');
  } else {
    descEl.textContent = 'No description provided.';
    descEl.classList.add('empty');
  }

  const testEl = document.getElementById('dw-test-procedure');
  if (c.testProcedure && c.testProcedure.trim()) {
    testEl.textContent = c.testProcedure;
    testEl.classList.remove('empty');
  } else {
    testEl.textContent = 'No test procedure defined.';
    testEl.classList.add('empty');
  }

  renderAttachments(c);
}

function closeDrawer() {
  document.getElementById('ctrl-drawer-overlay').classList.remove('open');
  const deleteBar  = document.getElementById('dw-delete-bar');
  const validateBar = document.getElementById('dw-validate-bar');
  if (deleteBar)   deleteBar.classList.remove('show');
  if (validateBar) validateBar.classList.remove('show');
  _toggleControlEditMode(false);
  _pendingFiles = [];
  const pendingWrap = document.getElementById('dw-pending-uploads');
  if (pendingWrap) pendingWrap.style.display = 'none';
  activeControlId = null;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();
});

// ── Edit Mode (Owner + Status only) — pencil toggles ──────

function _toggleControlEditMode(on) {
  _ctrlEditMode = !!on;
  const editBtn = document.getElementById('dw-edit-btn');
  editBtn.classList.toggle('editing', on);
  editBtn.title = on ? 'Save changes' : 'Edit';

  // Show/hide the entire Attachment Required field block
  const attachField = document.getElementById('dw-attach-required-field');
  if (attachField) attachField.style.display = on ? '' : 'none';

  // Inside the attach field: swap read/edit elements
  const attachVal   = document.getElementById('dw-attach-required');
  const attachInput = document.getElementById('dw-attach-required-input');
  if (attachVal)   attachVal.style.display   = on ? 'none' : '';
  if (attachInput) attachInput.style.display = on ? ''     : 'none';

  const toggle = (readId, editId) => {
    const r = document.getElementById(readId);
    const e = document.getElementById(editId);
    if (r) r.style.display = on ? 'none' : '';
    if (e) e.style.display = on ? ''     : 'none';
  };

  toggle('dw-status',          'dw-status-input');
  toggle('dw-owner',           'dw-owner-input');
  toggle('dw-domain',          'dw-domain-input');
  toggle('dw-frequency',       'dw-frequency-input');
  toggle('dw-validation-date', 'dw-validation-date-input');
  toggle('dw-desc',            'dw-desc-input');
  toggle('dw-test-procedure',  'dw-test-procedure-input');
}

function toggleControlEditMode() {
  if (!_ctrlEditMode) {
    // Enter edit mode
    const c = controls.find(x => x.id === activeControlId);
    if (!c) return;
    document.getElementById('dw-status-input').value          = c.status;
    document.getElementById('dw-owner-input').value           = c.owner === '—' ? '' : c.owner;
    document.getElementById('dw-domain-input').value          = c.domain || '';
    document.getElementById('dw-frequency-input').value       = c.frequency === '—' ? '' : c.frequency;
    document.getElementById('dw-validation-date-input').value = c.validationDate || '';
    document.getElementById('dw-attach-required-input').value = c.attachmentRequired || 'No';
    document.getElementById('dw-desc-input').value            = c.description || '';
    document.getElementById('dw-test-procedure-input').value  = c.testProcedure || '';
    _toggleControlEditMode(true);
  } else {
    // Save and exit
    saveControlEditMode();
  }
}

function enterControlEditMode() { toggleControlEditMode(); }
function cancelControlEditMode() { _toggleControlEditMode(false); }

function saveControlEditMode() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  c.status            = document.getElementById('dw-status-input').value;
  c.owner             = document.getElementById('dw-owner-input').value.trim() || '—';
  c.domain            = document.getElementById('dw-domain-input').value;
  c.frequency         = document.getElementById('dw-frequency-input').value || '—';
  c.validationDate    = document.getElementById('dw-validation-date-input').value || '';
  c.attachmentRequired = document.getElementById('dw-attach-required-input').value || 'No';
  c.description       = document.getElementById('dw-desc-input').value.trim();
  c.testProcedure     = document.getElementById('dw-test-procedure-input').value.trim();
  _renderControlDrawerContent(c);
  _toggleControlEditMode(false);
  renderControls();
  refreshDashboard();
}

// ── Validate Control ──────────────────────────────────────

function promptValidateControl() {
  document.getElementById('dw-delete-bar').classList.remove('show');
  document.getElementById('dw-validate-bar').classList.add('show');

}

function cancelValidate() {
  document.getElementById('dw-validate-bar').classList.remove('show');
}

function confirmValidateControl() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;

  c.status         = 'Compliant';
  c.validationDate = todayISO();

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

}

function cancelDelete() {
  document.getElementById('dw-delete-bar').classList.remove('show');
}

function confirmDeleteControl() {
  controls = controls.filter(c => c.id !== activeControlId);
  risks.forEach(r => {
    r.controls = r.controls.filter(cid => cid !== activeControlId);
  });
  closeDrawer();
  renderControls();
  renderRisks();
  refreshDashboard();
}

// ── Attachments ───────────────────────────────────────────

function fileTypeStyle(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map = {
    pdf:  { bg:'rgba(248,81,73,.15)',   color:'#f85149', label:'PDF' },
    doc:  { bg:'rgba(88,166,255,.15)',  color:'#58a6ff', label:'DOC' },
    docx: { bg:'rgba(88,166,255,.15)',  color:'#58a6ff', label:'DOC' },
    xls:  { bg:'rgba(63,185,80,.15)',   color:'#3fb950', label:'XLS' },
    xlsx: { bg:'rgba(63,185,80,.15)',   color:'#3fb950', label:'XLS' },
    ppt:  { bg:'rgba(210,153,34,.15)',  color:'#d29922', label:'PPT' },
    pptx: { bg:'rgba(210,153,34,.15)',  color:'#d29922', label:'PPT' },
    png:  { bg:'rgba(188,140,255,.15)', color:'#bc8cff', label:'IMG' },
    jpg:  { bg:'rgba(188,140,255,.15)', color:'#bc8cff', label:'IMG' },
    jpeg: { bg:'rgba(188,140,255,.15)', color:'#bc8cff', label:'IMG' },
    gif:  { bg:'rgba(188,140,255,.15)', color:'#bc8cff', label:'IMG' },
    zip:  { bg:'rgba(139,148,158,.15)', color:'#8b949e', label:'ZIP' },
    csv:  { bg:'rgba(63,185,80,.15)',   color:'#3fb950', label:'CSV' },
    txt:  { bg:'rgba(139,148,158,.15)', color:'#8b949e', label:'TXT' },
  };
  return map[ext] || { bg:'rgba(88,166,255,.1)', color:'#58a6ff', label: ext.toUpperCase().slice(0,3) || 'FILE' };
}

function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function renderAttachments(c) {
  const list  = document.getElementById('dw-attach-list');
  const count = document.getElementById('dw-attach-count');
  const attachments = c.attachments || [];

  if (count) count.textContent = attachments.length + (attachments.length === 1 ? ' file' : ' files');

  if (!attachments.length) { list.innerHTML = ''; return; }

  list.innerHTML = attachments.map((a, i) => {
    const ts = fileTypeStyle(a.name);
    return `
      <div class="attach-item">
        <div class="attach-icon" style="background:${ts.bg};color:${ts.color}">${ts.label}</div>
        <div class="attach-info">
          <div class="attach-name" title="${a.name}">${a.name}</div>
          <div class="attach-meta">${formatBytes(a.size)} · Added ${a.added}</div>
          ${a.comment ? `<div class="attach-comment">${a.comment}</div>` : ''}
        </div>
        <button class="attach-remove" title="Remove attachment" onclick="removeAttachment('${c.id}', ${i})">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
        </button>
      </div>`;
  }).join('');
}

// Pending uploads staging area
let _pendingFiles = [];

function _renderPendingList() {
  const wrap = document.getElementById('dw-pending-uploads');
  const list = document.getElementById('dw-pending-list');
  if (!_pendingFiles.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  list.innerHTML = _pendingFiles.map((f, i) => {
    const ts = fileTypeStyle(f.name);
    return `
      <div class="attach-item" style="margin-bottom:4px;">
        <div class="attach-icon" style="background:${ts.bg};color:${ts.color}">${ts.label}</div>
        <div class="attach-info">
          <div class="attach-name">${f.name}</div>
          <div class="attach-meta">${formatBytes(f.size)}</div>
        </div>
        <button class="attach-remove" title="Remove" onclick="_pendingFiles.splice(${i},1);_renderPendingList();">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>
        </button>
      </div>`;
  }).join('');
}

function handleFileSelect(event) {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  Array.from(event.target.files).forEach(f => {
    if (f.size > 50 * 1024 * 1024) {
      alert(`"${f.name}" exceeds the 50 MB limit and was not added.`);
      return;
    }
    _pendingFiles.push(f);
  });
  event.target.value = '';
  _renderPendingList();
}

function savePendingUploads() {
  const c = controls.find(x => x.id === activeControlId);
  if (!c) return;
  if (!c.attachments) c.attachments = [];
  const comment = (document.getElementById('dw-attach-comment').value || '').trim();
  const today = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  _pendingFiles.forEach(f => {
    c.attachments.push({ name: f.name, size: f.size, added: today, comment });
  });
  _pendingFiles = [];
  document.getElementById('dw-attach-comment').value = '';
  _renderPendingList();
  renderAttachments(c);
}

function cancelPendingUploads() {
  _pendingFiles = [];
  document.getElementById('dw-attach-comment').value = '';
  _renderPendingList();
}

function removeAttachment(controlId, index) {
  const c = controls.find(x => x.id === controlId);
  if (!c || !c.attachments) return;
  c.attachments.splice(index, 1);
  renderAttachments(c);
}

// ── Drag-and-drop ─────────────────────────────────────────
const dropZone = document.getElementById('dw-drop-zone');
if (dropZone) {
  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop',      e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const c = controls.find(x => x.id === activeControlId);
    if (!c) return;
    Array.from(e.dataTransfer.files).forEach(f => {
      if (f.size > 50 * 1024 * 1024) { alert(`"${f.name}" exceeds 50 MB.`); return; }
      _pendingFiles.push(f);
    });
    _renderPendingList();
  });
}