// Dedicated Hospital Staff Login Portal
// Strictly requires Username and Password authentication for Reception, Doctors & Admin

import { authService, HOSPITAL_STAFF_ACCOUNTS } from '../data/authService.js';
import { playClinicChime } from '../utils/audio.js';

export class LoginPortal {
  constructor(containerEl, onLoginSuccess) {
    this.container = containerEl;
    this.onLoginSuccess = onLoginSuccess || (() => {});
    this.errorMessage = '';
    this.showPassword = false;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="hospital-login-page animate-fade-in">
        <div class="login-wrapper-card">
          <!-- Hospital Header Crest & Identity -->
          <div class="login-brand-header">
            <div class="login-crest-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 2v20M2 12h20"/>
                <circle cx="12" cy="12" r="9" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="login-brand-text">
              <span class="login-auth-tag">🏥 Restricted Staff Gateway</span>
              <h1 class="login-hospital-name">Chaudhari Skin & Dental Care</h1>
              <p class="login-hospital-marathi">चौधरी स्किन अँड डेंटल केअर मल्टीस्पेशालिटी क्लिनिक व मेडिकेअर फार्मसी</p>
              <p class="login-hospital-sub">Multispeciality Clinic, Trichology, Rotary Endodontics & Medicare Pharmacy</p>
              <div class="login-location-chip">
                📍 Shriram Chowk, Farshi Road, Near Dr. Chande Clinic, Khamgaon – 444303
              </div>
            </div>
          </div>

          <!-- Main Login Form -->
          <div class="login-card-content">
            <div class="login-form-heading">
              <h2>Staff Authorization Login</h2>
              <p>Enter your designated hospital username and password to access the clinical management system.</p>
            </div>

            ${this.errorMessage ? `
              <div class="login-error-alert animate-fade-in" id="login-error-alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>${this.errorMessage}</span>
              </div>
            ` : ''}

            <form id="hospital-login-form" class="login-form">
              <div class="form-group-field">
                <label for="login-username" class="form-label-bold">
                  Username <span class="req">*</span>
                </label>
                <div class="login-input-wrapper">
                  <span class="login-input-icon">👤</span>
                  <input 
                    type="text" 
                    id="login-username" 
                    class="form-input login-input" 
                    placeholder="Enter staff username (e.g. reception, dr.priyanka, admin)" 
                    autocomplete="username" 
                    required 
                    autofocus
                  />
                </div>
              </div>

              <div class="form-group-field mt-3">
                <label for="login-password" class="form-label-bold">
                  Password <span class="req">*</span>
                </label>
                <div class="login-input-wrapper">
                  <span class="login-input-icon">🔒</span>
                  <input 
                    type="${this.showPassword ? 'text' : 'password'}" 
                    id="login-password" 
                    class="form-input login-input" 
                    placeholder="Enter staff password" 
                    autocomplete="current-password" 
                    required 
                  />
                  <button type="button" class="btn-toggle-password" id="btn-toggle-password" title="Toggle password visibility">
                    ${this.showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div class="login-actions mt-4">
                <button type="submit" class="btn btn-primary btn-lg btn-block glow-teal" id="btn-login-submit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Login to Hospital System
                </button>
              </div>
            </form>

            <!-- Employee Credentials Directory Reference -->
            <div class="staff-credentials-section mt-5">
              <div class="credentials-section-header">
                <div class="cs-title">
                  <span class="cs-badge">🔐 Authorized Staff Accounts</span>
                  <strong>Hospital Staff Credentials Directory</strong>
                </div>
                <span class="text-xs text-muted">Click "⚡ Fill" to quickly insert credentials</span>
              </div>

              <div class="credentials-accounts-grid">
                ${HOSPITAL_STAFF_ACCOUNTS.map(acc => `
                  <div class="credential-account-card">
                    <div class="cac-header">
                      <span class="cac-avatar">${acc.avatar}</span>
                      <div class="cac-meta">
                        <strong>${acc.name}</strong>
                        <span class="cac-dept text-xs text-muted">${acc.department}</span>
                      </div>
                      <button type="button" class="btn-quick-fill" data-user="${acc.username}" data-pass="${acc.password}" title="Quick-fill username and password">
                        ⚡ Fill
                      </button>
                    </div>
                    <div class="cac-keys">
                      <div class="key-pill">
                        <span class="key-label">User:</span> <code>${acc.username}</code>
                      </div>
                      <div class="key-pill">
                        <span class="key-label">Pass:</span> <code>${acc.password}</code>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Footer Compliance Info -->
            <div class="login-security-footer mt-4">
              <p>🛡️ Internal Hospital Network • Patient Data Protected under Clinical Confidentiality Act</p>
              <p class="text-xs text-muted">Chaudhari Skin & Dental Care • Direct Doctor Helpline: +91 90498 83983</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = this.container.querySelector('#hospital-login-form');
    const userInput = this.container.querySelector('#login-username');
    const passInput = this.container.querySelector('#login-password');
    const togglePassBtn = this.container.querySelector('#btn-toggle-password');

    // Toggle Password Visibility
    if (togglePassBtn) {
      togglePassBtn.addEventListener('click', () => {
        this.showPassword = !this.showPassword;
        if (passInput) {
          passInput.type = this.showPassword ? 'text' : 'password';
          togglePassBtn.textContent = this.showPassword ? '👁️' : '👁️‍🗨️';
        }
      });
    }

    // Quick Fill Buttons from Credentials Directory
    this.container.querySelectorAll('.btn-quick-fill').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = btn.getAttribute('data-user');
        const p = btn.getAttribute('data-pass');
        if (userInput) userInput.value = u;
        if (passInput) passInput.value = p;
        this.errorMessage = '';
        const alertEl = this.container.querySelector('#login-error-alert');
        if (alertEl) alertEl.remove();
        if (passInput) passInput.focus();
        playClinicChime('click');
      });
    });

    // Form Submit Authentication
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = userInput.value.trim();
        const password = passInput.value.trim();

        const result = authService.login(username, password);
        if (result.success) {
          playClinicChime('success');
          this.errorMessage = '';
          this.onLoginSuccess(result.user);
        } else {
          playClinicChime('error');
          this.errorMessage = result.message || 'Invalid username or password.';
          this.render();
        }
      });
    }
  }
}
