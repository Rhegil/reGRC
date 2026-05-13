let notifications = [1, 2, 3];

function toggleNotif() {
  const panel = document.getElementById('notifPanel');
  panel.classList.toggle('open');

  if (panel.classList.contains('open')) {
    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 0);
  }
}

function closeOnOutsideClick(e) {
  const wrapper = document.getElementById('notifWrapper');
  if (!wrapper.contains(e.target)) {
    document.getElementById('notifPanel').classList.remove('open');
    document.removeEventListener('click', closeOnOutsideClick);
  }
}

function dismissNotif(id) {
  const item = document.querySelector(`.notif-item[data-id="${id}"]`);
  if (item) {
    item.style.transition = 'opacity 0.2s, max-height 0.3s';
    item.style.opacity = '0';
    item.style.maxHeight = '0';
    item.style.overflow = 'hidden';
    item.style.padding = '0';
    setTimeout(() => item.remove(), 300);
  }
  notifications = notifications.filter(n => n !== id);
  updateBadge();
}

function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(el => {
    el.classList.remove('unread');
  });
  notifications = [];
  updateBadge();
}

function updateBadge() {
  const badge = document.getElementById('notifBadge');
  if (notifications.length === 0) {
    badge.classList.add('hidden');
  } else {
    badge.classList.remove('hidden');
    badge.textContent = notifications.length;
  }
}