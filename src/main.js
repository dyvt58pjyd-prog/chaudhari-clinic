import './style.css';
import { authService } from './data/authService.js';
import { AuthBar } from './components/authBar.js';
import { LoginPortal } from './components/loginPortal.js';
import { ReceptionPortal } from './components/receptionPortal.js';
import { DoctorPortal } from './components/doctorPortal.js';
import { BillingPortal } from './components/billingPortal.js';
import { RecordsPortal } from './components/recordsPortal.js';
import { AdminPortal } from './components/adminPortal.js';

function initApplication() {
  const headerMount = document.querySelector('#app-header-mount');
  const bottomNavMount = document.querySelector('#app-bottom-nav');
  const viewport = document.querySelector('#app-viewport');

  let activeView = authService.isAuthenticated() ? (authService.getCurrentUser()?.role || 'login') : 'login';
  let activeDoctorId = authService.getCurrentUser()?.doctorId || null;

  let receptionPortal = null;
  let doctorPortal = null;
  let billingPortal = null;
  let recordsPortal = null;
  let adminPortal = null;

  const navigateTo = (view, patientId = null) => {
    // If not authenticated, force login view
    if (!authService.isAuthenticated()) {
      activeView = 'login';
      authBar.setActiveView('login');
      renderCurrentView();
      return;
    }

    activeView = view;
    authBar.setActiveView(view);
    renderCurrentView(patientId);
  };

  // Expose globally for notification clicks and cross-module deep-linking
  window.hmsNavigate = (view, patientId = null) => {
    navigateTo(view, patientId);
  };

  const handleLogout = () => {
    activeView = 'login';
    activeDoctorId = null;
    authBar.setActiveView('login');
    renderCurrentView();
  };

  const authBar = new AuthBar(
    headerMount,
    bottomNavMount,
    (targetView) => navigateTo(targetView),
    () => handleLogout()
  );

  function renderCurrentView(patientId = null, doctorId = null) {
    if (!viewport) return;
    viewport.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'portal-view-container animate-fade-in';
    viewport.appendChild(container);

    const currentUser = authService.getCurrentUser();

    // 1. Unauthenticated State -> Hospital Staff Login Page
    if (!currentUser || activeView === 'login') {
      authBar.setActiveView('login');
      new LoginPortal(container, (loggedInUser) => {
        activeDoctorId = loggedInUser.doctorId;
        activeView = loggedInUser.role;
        authBar.setActiveView(activeView);
        renderCurrentView(null, activeDoctorId);
      });
      return;
    }

    // 2. Authenticated States
    authBar.setActiveView(activeView);

    try {
      if (activeView === 'reception') {
        receptionPortal = new ReceptionPortal(container, (targetView, pid) => {
          navigateTo(targetView, pid);
        });
        if (patientId) {
          receptionPortal.setTab('registry');
        }
      } else if (activeView === 'doctor') {
        doctorPortal = new DoctorPortal(container, (targetView, pid) => {
          navigateTo(targetView, pid);
        });
        const docToSet = doctorId || activeDoctorId || currentUser.doctorId;
        if (docToSet) {
          doctorPortal.setDoctor(docToSet);
        }
        if (patientId) {
          doctorPortal.setPatient(patientId);
        }
      } else if (activeView === 'billing') {
        billingPortal = new BillingPortal(container, (targetView, pid) => {
          navigateTo(targetView, pid);
        });
        if (patientId) {
          billingPortal.setPatient(patientId);
        }
      } else if (activeView === 'records') {
        recordsPortal = new RecordsPortal(container, (targetView, pid) => {
          navigateTo(targetView, pid);
        });
      } else if (activeView === 'admin') {
        adminPortal = new AdminPortal(container, (targetView, pid) => {
          navigateTo(targetView, pid);
        });
      }
    } catch (renderError) {
      console.error('Portal Rendering Error:', renderError);
      container.innerHTML = `
        <div style="max-width: 500px; margin: 40px auto; padding: 24px; background: #ffffff; border: 1px solid #fca5a5; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🏥</div>
          <h3 style="color: #991b1b; font-weight: 800; font-size: 1.2rem; margin: 0 0 8px 0;">Chaudhari Clinic HMS Recovery</h3>
          <p style="color: #64748b; font-size: 0.88rem; margin: 0 0 20px 0; line-height: 1.4;">The portal encountered a minor interface state notice while updating.</p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button type="button" onclick="window.location.reload()" style="background: #0f766e; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">🔄 Refresh Portal</button>
            <button type="button" onclick="localStorage.removeItem('CSD_AUTHENTICATED_STAFF_V2'); window.location.reload();" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">🔐 Re-Login</button>
          </div>
        </div>
      `;
    }
  }

  // Initial render
  renderCurrentView();

  // Service Worker Registration for PWA & APK
  if ('serviceWorker' in navigator) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Clean up dev server cache in local environment
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (let reg of regs) reg.unregister();
      });
    } else {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          reg.update();
        }).catch((err) => {
          console.warn('Service worker registration note:', err);
        });
      });
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}


