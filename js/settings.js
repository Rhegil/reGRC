/**
 * js/settings.js -- ReGRC
 * Minimal settings module: just dark-mode toggle, persisted to localStorage.
 */

const appSettings = { darkMode: false };

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('regrc-settings') || '{}');
    if ('darkMode' in saved) appSettings.darkMode = !!saved.darkMode;
  } catch(e) {}
}

function saveSettings() {
  try { localStorage.setItem('regrc-settings', JSON.stringify(appSettings)); } catch(e) {}
}

function _applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

function onSettingToggle(key, value) {
  if (key !== 'darkMode') return;
  appSettings.darkMode = !!value;
  saveSettings();
  _applyTheme(appSettings.darkMode);
  refreshDashboard();
}

function applyAllSettings() {
  loadSettings();
  _applyTheme(appSettings.darkMode);
}

function renderSettingsPage() {
  const el = document.getElementById('s-dark-mode');
  if (el) el.checked = !!appSettings.darkMode;
}