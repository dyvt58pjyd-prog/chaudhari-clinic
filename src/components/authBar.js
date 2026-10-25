import { authService } from '../data/authService.js';
import { notificationEngine } from '../utils/notificationEngine.js';
import { playClinicChime } from '../utils/audio.js';
import { apiService } from '../data/apiService.js';
import { hospitalDb } from '../data/hospitalDb.js';

export class AuthBar {
  constructor(headerEl, mobileNavEl, onNavigate, onLogout) {
    this.headerEl = headerEl;
    this.mobileNavEl = mobileNavEl;
    this.onNavigate = onNavigate || (() => {});
    this.onLogout = onLogout || (() => {});
    this.activeView = 'reception';
    this.isNotifDrawerOpen = false;

    // Listen to real-time notification engine events to update bell badge
    this.unsubscribeNotif = notificationEngine.onNotification(() => {
      this.updateBellBadge();
      if (this.isNotifDrawerOpen) {
        this.renderNotifDrawerContent();
      }
    });

    // Listen to Neon DB cloud sync status
    this.unsubscribeApi = apiService.onStatusChange(() => {
      this.updateNeonBadge();
    });

    this.render();
  }

  updateNeonBadge() {
    const badge = this.headerEl?.querySelector('#btn-sync-neon-status');
    if (!badge) return;
    const dot = badge.querySelector('.neon-indicator-dot');
    const lbl = badge.querySelector('.neon-lbl');
    if (dot && lbl) {
      if (apiService.isNeonConnected) {
        dot.className = 'neon-indicator-dot online';
        lbl.textContent = 'Neon Live';
      } else {
        dot.className = 'neon-indicator-dot offline';
        lbl.textContent = 'Local DB';
      }
    }
  }


  setActiveView(view) {
    this.activeView = view;
    this.render();
  }

  updateBellBadge() {
    const badge = this.headerEl?.querySelector('#notif-bell-badge');
    const count = notificationEngine.getUnreadCount();
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  toggleNotifDrawer() {
    this.isNotifDrawerOpen = !this.isNotifDrawerOpen;
    const drawer = this.headerEl?.querySelector('#notif-dropdown-drawer');
    if (drawer) {
      if (this.isNotifDrawerOpen) {
        drawer.classList.remove('hidden');
        this.renderNotifDrawerContent();
        notificationEngine.markAllAsRead();
        this.updateBellBadge();
      } else {
        drawer.classList.add('hidden');
      }
    }
  }

  renderNotifDrawerContent() {
    const listEl = this.headerEl?.querySelector('#notif-drawer-list');
    if (!listEl) return;

    const notifs = notificationEngine.getNotifications();
    if (notifs.length === 0) {
      listEl.innerHTML = `
        <div class="empty-notif-box">
          <span>🔔</span>
          <p>No recent notifications yet.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map(n => `
      <div class="notif-item-row ${n.isEmergency ? 'emergency' : ''}" data-id="${n.id}" data-view="${n.targetView || ''}" data-pid="${n.patientId || ''}">
        <div class="notif-item-icon">${n.icon || '🔔'}</div>
        <div class="notif-item-body">
          <div class="notif-item-title-row">
            <strong>${n.title}</strong>
            <span class="notif-item-time">${n.timestamp || 'Just now'}</span>
          </div>
          <p class="notif-item-msg">${n.message}</p>
          ${n.actionText ? `<span class="text-xs text-teal font-bold mt-1 block">👉 ${n.actionText}</span>` : ''}
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.notif-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        const view = row.getAttribute('data-view');
        const pid = row.getAttribute('data-pid');
        const item = notifs.find(n => n.id === id);

        if (item && item.onAction) {
          item.onAction();
        } else if (view && window.hmsNavigate) {
          window.hmsNavigate(view, pid || null);
        }
        this.toggleNotifDrawer();
      });
    });
  }

  render() {
    const user = authService.getCurrentUser();

    // 1. Unauthenticated state
    if (!user) {
      if (this.headerEl) {
        this.headerEl.innerHTML = `
          <div class="android-app-bar unauthenticated-bar">
            <div class="app-brand-group">
              <div class="app-brand-crest">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v20M2 12h20"/>
                  <circle cx="12" cy="12" r="9" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <div class="app-brand-name">
                  CHAUDHARI CLINIC <span class="app-pharmacy-tag">+ Medicare Pharmacy</span>
                </div>
                <div class="app-brand-sub">Clinical Hospital Information System • Khamgaon</div>
              </div>
            </div>
            <div class="app-auth-group">
              <span class="auth-lock-badge">🔒 Staff Authentication Required</span>
            </div>
          </div>
        `;
      }

      if (this.mobileNavEl) {
        this.mobileNavEl.innerHTML = '';
        this.mobileNavEl.classList.add('hidden');
      }
      return;
    }

    // 2. Authenticated state
    if (this.mobileNavEl) {
      this.mobileNavEl.classList.remove('hidden');
    }

    const unreadCount = notificationEngine.getUnreadCount();

    // Format User Chip
    const roleBadgeHtml = `
      <div class="user-role-chip ${user.role}">
        <span class="user-avatar-chip">${user.avatar || '👤'}</span>
        <div class="user-chip-meta">
          <span class="role-name">${user.name}</span>
          <span class="role-sub">${user.department}</span>
        </div>
      </div>
    `;

    // Center Navigation Buttons by Role
    let navButtonsHtml = '';
    if (user.role === 'reception') {
      navButtonsHtml = `
        <button type="button" class="app-nav-btn ${this.activeView === 'reception' ? 'active' : ''}" id="app-nav-reception">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Reception & Queue
        </button>
        <button type="button" class="app-nav-btn ${this.activeView === 'billing' ? 'active' : ''}" id="app-nav-billing">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Billing (UPI QR / Cash)
        </button>
        <button type="button" class="app-nav-btn ${this.activeView === 'pharmacy' ? 'active' : ''}" id="app-nav-pharmacy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
          Medicare Pharmacy
        </button>
      `;
    } else if (user.role === 'doctor') {
      navButtonsHtml = `
        <button type="button" class="app-nav-btn ${this.activeView === 'doctor' ? 'active' : ''}" id="app-nav-doctor">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Doctor Checkup & Selective Rx
        </button>
        <button type="button" class="app-nav-btn ${this.activeView === 'pharmacy' ? 'active' : ''}" id="app-nav-pharmacy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
          Pharmacy Dispensing
        </button>
      `;
    } else if (user.role === 'pharmacy') {
      navButtonsHtml = `
        <button type="button" class="app-nav-btn ${this.activeView === 'pharmacy' ? 'active' : ''}" id="app-nav-pharmacy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
          Medicare Pharmacy Queue
        </button>
      `;
    } else if (user.role === 'admin') {
      navButtonsHtml = `
        <button type="button" class="app-nav-btn ${this.activeView === 'admin' ? 'active' : ''}" id="app-nav-admin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Admin Dashboard
        </button>
        <button type="button" class="app-nav-btn ${this.activeView === 'reception' ? 'active' : ''}" id="app-nav-reception">
          Reception
        </button>
        <button type="button" class="app-nav-btn ${this.activeView === 'doctor' ? 'active' : ''}" id="app-nav-doctor">
          Doctor EMR
        </button>
        <button type="button" class="app-nav-btn ${this.activeView === 'billing' ? 'active' : ''}" id="app-nav-billing">
          Billing
        </button>
        <button type="button" class="app-nav-btn ${this.activeView === 'pharmacy' ? 'active' : ''}" id="app-nav-pharmacy">
          Pharmacy
        </button>
      `;
    }

    // Top Desktop App Bar
    if (this.headerEl) {
      this.headerEl.innerHTML = `
        <div class="android-app-bar authenticated-bar">
          <div class="app-brand-group">
            <div class="app-brand-crest">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9" stroke-width="1.5"/></svg>
            </div>
            <div>
              <div class="app-brand-name">
                CHAUDHARI CLINIC <span class="app-pharmacy-tag">+ Medicare Pharmacy</span>
              </div>
              <div class="app-brand-sub">Clinical EMR, Selective Rx & UPI/Cash Billing • Khamgaon</div>
            </div>
          </div>

          <!-- Center Navigation -->
          <div class="app-center-nav">
            ${navButtonsHtml}
          </div>

          <!-- Right Action Group -->
          <div class="app-auth-group">
            <!-- Neon Cloud Database Sync Badge -->
            <button type="button" class="btn-neon-badge" id="btn-sync-neon-status" title="Neon Serverless PostgreSQL: Click to Sync Data with Cloud">
              <span class="neon-indicator-dot ${apiService.isNeonConnected ? 'online' : 'offline'}"></span>
              <span class="neon-lbl">${apiService.isNeonConnected ? 'Neon Live' : 'Local DB'}</span>
            </button>

            <!-- Test Live Notification Button -->
            <button type="button" class="btn btn-outline btn-xs btn-test-notif-action" id="btn-test-live-notif" title="Test audio chime, Android vibration, and live notification banner">
              🔔 Test Notification
            </button>

            <!-- Real-Time Notification Bell with Dropdown Drawer -->
            <div class="notif-bell-container">
              <button type="button" class="btn-notif-bell" id="btn-toggle-notif-drawer" title="Real-Time Hospital Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="notif-bell-badge ${unreadCount > 0 ? '' : 'hidden'}" id="notif-bell-badge">
                  ${unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </button>

              <!-- Notification Dropdown Drawer -->
              <div class="notif-dropdown-drawer hidden" id="notif-dropdown-drawer">
                <div class="notif-drawer-header">
                  <strong>Live Hospital Events</strong>
                  <div class="notif-drawer-actions">
                    <button type="button" class="btn-clear-notifs" id="btn-clear-all-notifs">Clear</button>
                    <button type="button" class="btn-close-notif-drawer" id="btn-close-drawer">✕</button>
                  </div>
                </div>
                <div class="notif-drawer-list" id="notif-drawer-list">
                  <!-- Injected via renderNotifDrawerContent() -->
                </div>
              </div>
            </div>

            <!-- User Badge -->
            ${roleBadgeHtml}

            <!-- Dedicated Logout Button -->
            <button type="button" class="btn btn-outline btn-sm btn-logout-action" id="btn-logout" title="Sign out of hospital system">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      `;

      // Event bindings
      const btnSyncNeon = this.headerEl.querySelector('#btn-sync-neon-status');
      const btnRec = this.headerEl.querySelector('#app-nav-reception');
      const btnDoc = this.headerEl.querySelector('#app-nav-doctor');
      const btnBill = this.headerEl.querySelector('#app-nav-billing');
      const btnPharm = this.headerEl.querySelector('#app-nav-pharmacy');
      const btnAdm = this.headerEl.querySelector('#app-nav-admin');
      const btnLogout = this.headerEl.querySelector('#btn-logout');
      const btnTestNotif = this.headerEl.querySelector('#btn-test-live-notif');
      const btnToggleDrawer = this.headerEl.querySelector('#btn-toggle-notif-drawer');
      const btnCloseDrawer = this.headerEl.querySelector('#btn-close-drawer');
      const btnClearAll = this.headerEl.querySelector('#btn-clear-all-notifs');

      if (btnSyncNeon) {
        btnSyncNeon.addEventListener('click', async () => {
          btnSyncNeon.classList.add('syncing');
          playClinicChime('click');
          try {
            await hospitalDb.pullFromNeon();
            notificationEngine.notify({
              type: 'NEON_SYNC',
              title: apiService.isNeonConnected ? '☁️ Neon Database Synced' : '💾 Local Mode Active',
              message: apiService.isNeonConnected 
                ? 'All clinical notes, prescriptions, and billing receipts match Neon Postgres.' 
                : 'Local resilient cache active. To activate Neon cloud database on Vercel, configure DATABASE_URL in Vercel project settings.',
              icon: '☁️'
            });
          } catch (e) {
            console.warn('Sync click error:', e);
          }
          btnSyncNeon.classList.remove('syncing');
          this.updateNeonBadge();
        });
      }

      if (btnRec) btnRec.addEventListener('click', () => this.onNavigate('reception'));
      if (btnDoc) btnDoc.addEventListener('click', () => this.onNavigate('doctor'));
      if (btnBill) btnBill.addEventListener('click', () => this.onNavigate('billing'));
      if (btnPharm) btnPharm.addEventListener('click', () => this.onNavigate('pharmacy'));
      if (btnAdm) btnAdm.addEventListener('click', () => this.onNavigate('admin'));

      if (btnTestNotif) {
        btnTestNotif.addEventListener('click', () => {
          notificationEngine.testLiveNotification();
        });
      }

      if (btnToggleDrawer) {
        btnToggleDrawer.addEventListener('click', () => this.toggleNotifDrawer());
      }
      if (btnCloseDrawer) {
        btnCloseDrawer.addEventListener('click', () => this.toggleNotifDrawer());
      }
      if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
          notificationEngine.clearAll();
          this.renderNotifDrawerContent();
        });
      }

      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          if (confirm('Are you sure you want to log out of the hospital system?')) {
            authService.logout();
            playClinicChime('click');
            this.render();
            this.onLogout();
          }
        });
      }
    }

    // Android Bottom App Bar (Mobile & Tablet)
    if (this.mobileNavEl) {
      let mobileNavButtonsHtml = '';
      if (user.role === 'reception') {
        mobileNavButtonsHtml = `
          <button type="button" class="android-nav-item ${this.activeView === 'reception' ? 'active' : ''}" id="m-nav-reception">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span>Reception</span>
          </button>
          <button type="button" class="android-nav-item ${this.activeView === 'billing' ? 'active' : ''}" id="m-nav-billing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Billing</span>
          </button>
          <button type="button" class="android-nav-item ${this.activeView === 'pharmacy' ? 'active' : ''}" id="m-nav-pharmacy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
            <span>Pharmacy</span>
          </button>
        `;
      } else if (user.role === 'doctor') {
        mobileNavButtonsHtml = `
          <button type="button" class="android-nav-item ${this.activeView === 'doctor' ? 'active' : ''}" id="m-nav-doctor">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span>Doctor EMR</span>
          </button>
          <button type="button" class="android-nav-item ${this.activeView === 'pharmacy' ? 'active' : ''}" id="m-nav-pharmacy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
            <span>Pharmacy</span>
          </button>
        `;
      } else if (user.role === 'pharmacy') {
        mobileNavButtonsHtml = `
          <button type="button" class="android-nav-item ${this.activeView === 'pharmacy' ? 'active' : ''}" id="m-nav-pharmacy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
            <span>Pharmacy Queue</span>
          </button>
        `;
      } else if (user.role === 'admin') {
        mobileNavButtonsHtml = `
          <button type="button" class="android-nav-item ${this.activeView === 'admin' ? 'active' : ''}" id="m-nav-admin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Admin</span>
          </button>
          <button type="button" class="android-nav-item ${this.activeView === 'reception' ? 'active' : ''}" id="m-nav-reception">
            <span>Reception</span>
          </button>
          <button type="button" class="android-nav-item ${this.activeView === 'doctor' ? 'active' : ''}" id="m-nav-doctor">
            <span>Doctor</span>
          </button>
          <button type="button" class="android-nav-item ${this.activeView === 'billing' ? 'active' : ''}" id="m-nav-billing">
            <span>Billing</span>
          </button>
          <button type="button" class="android-nav-item ${this.activeView === 'pharmacy' ? 'active' : ''}" id="m-nav-pharmacy">
            <span>Pharmacy</span>
          </button>
        `;
      }

      this.mobileNavEl.innerHTML = `
        <div class="android-bottom-nav">
          ${mobileNavButtonsHtml}
          <button type="button" class="android-nav-item text-red" id="m-nav-logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Logout</span>
          </button>
        </div>
      `;

      const mRec = this.mobileNavEl.querySelector('#m-nav-reception');
      const mDoc = this.mobileNavEl.querySelector('#m-nav-doctor');
      const mBill = this.mobileNavEl.querySelector('#m-nav-billing');
      const mPharm = this.mobileNavEl.querySelector('#m-nav-pharmacy');
      const mAdm = this.mobileNavEl.querySelector('#m-nav-admin');
      const mLogout = this.mobileNavEl.querySelector('#m-nav-logout');

      if (mRec) mRec.addEventListener('click', () => this.onNavigate('reception'));
      if (mDoc) mDoc.addEventListener('click', () => this.onNavigate('doctor'));
      if (mBill) mBill.addEventListener('click', () => this.onNavigate('billing'));
      if (mPharm) mPharm.addEventListener('click', () => this.onNavigate('pharmacy'));
      if (mAdm) mAdm.addEventListener('click', () => this.onNavigate('admin'));

      if (mLogout) {
        mLogout.addEventListener('click', () => {
          if (confirm('Log out of hospital system?')) {
            authService.logout();
            playClinicChime('click');
            this.render();
            this.onLogout();
          }
        });
      }
    }
  }
}
