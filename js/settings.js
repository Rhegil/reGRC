/**
 * js/settings.js -- ReGRC
 *
 * App-wide settings: theme, display preferences, defaults, data tools.
 * Persisted to localStorage so they survive page refresh.
 */

const appSettings = {
  darkMode:          false,
  compactView:       false,
  animateCharts:     true,
  autoFlagOverdue:   true,
  defaultCtrlStatus: 'Not Assessed',
  defaultTreatment:  'Mitigate',
  exportFormat:      'CSV',
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('regrc-settings') || '{}');
    Object.assign(appSettings, saved);
  } catch(e) {}
}

function saveSettings() {
  try {
    localStorage.setItem('regrc-settings', JSON.stringify(appSettings));
  } catch(e) {}
}

function applySetting(key, value) {
  appSettings[key] = value;
  saveSettings();
  switch (key) {
    case 'darkMode':
      _applyTheme(value);
      refreshDashboard();
      break;
    case 'compactView':
      document.body.classList.toggle('compact-view', value);
      break;
    case 'autoFlagOverdue':
      renderControls();
      refreshDashboard();
      break;
    case 'defaultCtrlStatus': {
      const el = document.getElementById('c-status');
      if (el) el.value = value;
      break;
    }
    case 'defaultTreatment': {
      const el = document.getElementById('r-treatment');
      if (el) el.value = value;
      break;
    }
  }
}

function _applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

function applyAllSettings() {
  loadSettings();
  _applyTheme(appSettings.darkMode);
  document.body.classList.toggle('compact-view', appSettings.compactView);
  const cStatus = document.getElementById('c-status');
  if (cStatus) cStatus.value = appSettings.defaultCtrlStatus;
  const rTreat = document.getElementById('r-treatment');
  if (rTreat) rTreat.value = appSettings.defaultTreatment;
}

function renderSettingsPage() {
  const ids = {
    'setting-darkMode':          'darkMode',
    'setting-compactView':       'compactView',
    'setting-animateCharts':     'animateCharts',
    'setting-autoFlagOverdue':   'autoFlagOverdue',
    'setting-defaultCtrlStatus': 'defaultCtrlStatus',
    'setting-defaultTreatment':  'defaultTreatment',
    'setting-exportFormat':      'exportFormat',
  };
  Object.entries(ids).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!appSettings[key];
    else el.value = appSettings[key];
  });
}

function resetAllData() {
  if (!confirm('This will permanently delete all controls and risks.\nThis cannot be undone. Continue?')) return;
  controls = [];
  risks    = [];
  riskSeq  = 43;
  Object.keys(domainSeq).forEach(k => { domainSeq[k] = 0; });
  renderControls();
  renderRisks();
  refreshDashboard();
  const btn = document.getElementById('reset-data-btn');
  if (btn) {
    btn.textContent = 'Data cleared';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Reset All Data'; btn.disabled = false; }, 2500);
  }
}