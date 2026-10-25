// Unified Real-Time Live Notification & Synchronization Engine
// Uses BroadcastChannel, Web Notifications, Web Audio API Chimes, and Android Vibration

const CHANNEL_NAME = 'chaudhari_hms_sync';
const NOTIFICATIONS_STORAGE_KEY = 'CSD_NOTIFICATIONS_HISTORY_V1';

class NotificationEngine {
  constructor() {
    this.channel = null;
    this.listeners = [];
    this.notifications = this.loadNotifications();
    this.audioCtx = null;
    this.initChannel();
  }

  initChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.handleIncomingEvent(event.data, false);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported, falling back to storage events:', e);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'CSD_LIVE_EVENT_TRIGGER' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.handleIncomingEvent(data, false);
          } catch (err) {}
        }
      });
    }
  }

  loadNotifications() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {}
    return [];
  }

  saveNotifications() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications.slice(0, 30)));
      }
    } catch (e) {}
  }

  // Two-Tone Hospital Chime via Web Audio API
  playHospitalChime(type = 'success') {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'emergency') {
        // Urgent alert
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(600, now + 0.15);
        osc.frequency.setValueAtTime(800, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        return;
      }

      // Pleasant Two-Tone Hospital Chime (D5 -> A5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.18); // A5
      gain2.gain.setValueAtTime(0.22, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }

  // Android Haptic Vibration
  vibrate(pattern = [200, 100, 200]) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  // Request Native OS Push Notification Permission
  async requestPushPermission() {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) {}
  }

  // Send Native Push Notification
  sendNativeNotification(title, body) {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg'
        });
      }
    } catch (e) {}
  }

  // WhatsApp / Swiggy Style Floating Dropdown Toast Banner
  showFloatingToast(notification) {
    if (typeof document === 'undefined') return;

    // Remove existing toast if any
    const existing = document.querySelector('.hospital-floating-toast-banner');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `hospital-floating-toast-banner animate-slide-down ${notification.isEmergency ? 'emergency-toast' : ''}`;
    toast.innerHTML = `
      <div class="toast-content-row">
        <div class="toast-icon-circle ${notification.isEmergency ? 'pulse-fast' : ''}">
          ${notification.icon || '🔔'}
        </div>
        <div class="toast-text-wrap">
          <div class="toast-headline-row">
            <strong class="toast-title">${notification.title}</strong>
            <span class="toast-time">Just now</span>
          </div>
          <p class="toast-message">${notification.message}</p>
        </div>
        ${notification.actionText ? `
          <button type="button" class="btn-toast-action" id="btn-toast-action-click">
            ${notification.actionText}
          </button>
        ` : ''}
        <button type="button" class="btn-toast-close" id="btn-toast-close-click" aria-label="Dismiss">✕</button>
      </div>
      <div class="toast-progress-bar"></div>
    `;

    document.body.appendChild(toast);

    const btnAction = toast.querySelector('#btn-toast-action-click');
    if (btnAction && notification.onAction) {
      btnAction.addEventListener('click', () => {
        notification.onAction();
        toast.remove();
      });
    }

    const btnClose = toast.querySelector('#btn-toast-close-click');
    if (btnClose) {
      btnClose.addEventListener('click', () => toast.remove());
    }

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, 6000);
  }

  // Broadcast and handle event
  notify(eventData) {
    const enriched = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      ...eventData
    };

    // 1. Save and handle locally
    this.handleIncomingEvent(enriched, true);

    // 2. Broadcast to other tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage(enriched);
      } catch (e) {}
    }

    // 3. Storage fallback
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('CSD_LIVE_EVENT_TRIGGER', JSON.stringify({ ...enriched, _ts: Date.now() }));
      }
    } catch (e) {}
  }

  handleIncomingEvent(eventData, isLocal = false) {
    // Add to history
    this.notifications.unshift(eventData);
    this.saveNotifications();

    // Sound & Haptics
    this.playHospitalChime(eventData.isEmergency ? 'emergency' : 'success');
    this.vibrate(eventData.isEmergency ? [300, 100, 300, 100, 300] : [200, 100, 200]);

    // Native OS push notification
    this.sendNativeNotification(eventData.title, eventData.message);

    // Visual drop-down toast banner
    this.showFloatingToast(eventData);

    // Notify registered component listeners (e.g. Header Bell badge)
    this.listeners.forEach(cb => {
      try { cb(eventData, this.notifications); } catch (e) {}
    });
  }

  onNotification(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.listeners.forEach(cb => {
      try { cb(null, this.notifications); } catch (e) {}
    });
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.listeners.forEach(cb => {
      try { cb(null, this.notifications); } catch (e) {}
    });
  }

  // Quick Test Method for staff testing
  testLiveNotification(role = 'all') {
    this.requestPushPermission();
    this.notify({
      type: 'TEST_ALERT',
      title: '🔔 Live Hospital System Notification Test',
      message: 'Sound, haptic vibration, and real-time Android push are operating at 100% efficiency!',
      icon: '🩺',
      actionText: '✓ Confirmed'
    });
  }
}

export const notificationEngine = new NotificationEngine();
