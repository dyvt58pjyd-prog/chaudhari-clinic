import './style.css';
import { authService } from './data/authService.js';
import { AuthBar } from './components/authBar.js';
import { LoginPortal } from './components/loginPortal.js';
import { ReceptionPortal } from './components/receptionPortal.js';
import { DoctorPortal } from './components/doctorPortal.js';
import { BillingPortal } from './components/billingPortal.js';
import { RecordsPortal } from './components/recordsPortal.js';
import { AdminPortal } from './components/adminPortal.js';

document.addEventListener('DOMContentLoaded', () => {
  const headerMount = document.querySelector('#app-header-mount');
  const bottomNavMount = document.querySelector('#app-bottom-nav');
  const viewport = document.querySelector('#app-viewport');

  let activeView = authService.isAuthenticated() ? authService.getCurrentUser().role : 'login';
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
});

