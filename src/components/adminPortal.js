// Admin Portal Component
// Hospital Analytics, Cash vs UPI Collection Breakdown, Doctor-Wise Revenue Split,
// Petty Cash Expense Accounting & Net Balance, Master Patient Database Vault & Config

import { hospitalDb } from '../data/hospitalDb.js';
import { apiService } from '../data/apiService.js';
import { printOpdSlip, printPrescription, printInvoice, printConsentForm, printFitnessCertificate } from './printManager.js';
import { playClinicChime } from '../utils/audio.js';


export class AdminPortal {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate || (() => {});
    this.adminTab = 'analytics'; // 'analytics', 'database', 'expenses', 'settings'
    this.searchQuery = '';
    this.render();
  }

  setTab(tab) {
    this.adminTab = tab;
    this.render();
  }

  render() {
    const metrics = hospitalDb.getMetrics();
    const config = hospitalDb.getConfig();
    const patients = hospitalDb.getAllPatients();
    const expenses = hospitalDb.getPettyExpenses();

    const filteredPatients = patients.filter(p => {
      return !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.patientId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.phone.includes(this.searchQuery) ||
        p.address.toLowerCase().includes(this.searchQuery.toLowerCase());
    });

    this.container.innerHTML = `
      <div class="admin-portal-layout">
        <!-- Admin Title Bar & Navigation -->
        <div class="portal-header-row">
          <div>
            <div class="section-tag-pill amber">Hospital Administration & Audit</div>
            <h2 class="portal-title">Hospital Operations, Closing & Revenue Dashboard</h2>
            <p class="portal-subtitle">Doctor-Wise Splits • Cash vs UPI • Petty Cash Expenses • Master Patient Vault</p>
          </div>

          <div class="admin-tab-nav">
            <button type="button" class="tab-pill ${this.adminTab === 'analytics' ? 'active' : ''}" id="btn-admin-analytics">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span>Revenue & Doctor Splits</span>
            </button>
            <button type="button" class="tab-pill ${this.adminTab === 'database' ? 'active' : ''}" id="btn-admin-database">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>Master Patient Vault (${patients.length})</span>
            </button>
            <button type="button" class="tab-pill ${this.adminTab === 'expenses' ? 'active' : ''}" id="btn-admin-expenses">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <span>Petty Cash Expenses</span>
            </button>
            <button type="button" class="tab-pill ${this.adminTab === 'settings' ? 'active' : ''}" id="btn-admin-settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>UPI & Fees Config</span>
            </button>
          </div>
        </div>

        ${this.adminTab === 'analytics' ? this.renderAnalyticsPane(metrics) : 
          this.adminTab === 'database' ? this.renderDatabasePane(filteredPatients, config) : 
          this.adminTab === 'expenses' ? this.renderExpensesPane(expenses, metrics) :
          this.renderSettingsPane(config)}
      </div>
    `;

    this.bindEvents(config);
  }

  renderAnalyticsPane(metrics) {
    const cashPercent = metrics.totalRevenue > 0 ? Math.round((metrics.cashRevenue / metrics.totalRevenue) * 100) : 0;
    const upiPercent = metrics.totalRevenue > 0 ? Math.round((metrics.upiRevenue / metrics.totalRevenue) * 100) : 0;

    const docCols = metrics.doctorCollections || {};
    const drR = docCols["dr-rajnikant"] || { count: 0, amount: 0, name: "Dr. Rajnikant Chaudhari (Dermatology)" };
    const drP = docCols["dr-priyanka"] || { count: 0, amount: 0, name: "Dr. Priyanka Chaudhari (Anokar) (Dental Surgery)" };
    const drT = docCols["dr-rutika"] || { count: 0, amount: 0, name: "Dr. Shrutika Tulaskar (Pediatric Smile)" };

    return `
      <div class="admin-analytics-view animate-fade-in">
        <!-- 4 Top Highlight Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card bg-emerald-light">
            <div class="m-top">
              <span class="m-title">Gross Revenue Collected</span>
              <span class="m-icon">💰</span>
            </div>
            <div class="m-number text-emerald">₹ ${metrics.totalRevenue.toLocaleString()}</div>
            <div class="m-sub">${metrics.completedBills} Paid Invoices • ₹${metrics.totalPendingBalance} Pending</div>
          </div>

          <div class="metric-card bg-sky-light">
            <div class="m-top">
              <span class="m-title">UPI QR Collections</span>
              <span class="m-icon">📱</span>
            </div>
            <div class="m-number text-blue">₹ ${metrics.upiRevenue.toLocaleString()}</div>
            <div class="m-sub">${upiPercent}% of Total Revenue (9049883983@ybl)</div>
          </div>

          <div class="metric-card bg-amber-light">
            <div class="m-top">
              <span class="m-title">Cash Counter Collections</span>
              <span class="m-icon">💵</span>
            </div>
            <div class="m-number text-amber">₹ ${metrics.cashRevenue.toLocaleString()}</div>
            <div class="m-sub">${cashPercent}% in Cash Desk</div>
          </div>

          <div class="metric-card bg-purple-light">
            <div class="m-top">
              <span class="m-title">Net Hospital Closing Balance</span>
              <span class="m-icon">🏦</span>
            </div>
            <div class="m-number text-purple">₹ ${metrics.netHospitalBalance.toLocaleString()}</div>
            <div class="m-sub">Gross ₹${metrics.totalRevenue.toLocaleString()} - Expenses ₹${metrics.totalPettyExpenses.toLocaleString()}</div>
          </div>
        </div>

        <!-- End-of-Day Doctor-Wise Collection Summary -->
        <div class="analytics-card mt-4">
          <div class="card-header-flex">
            <div>
              <h3 class="card-title">👨‍⚕️ End-of-Day Doctor-Wise Collection Breakdown</h3>
              <p class="text-xs text-muted">Audited consultation and clinical procedure fees attributed to each consultant</p>
            </div>
            <span class="badge-audit-date">Closing Date: ${new Date().toLocaleDateString('en-GB')}</span>
          </div>

          <div class="doc-revenue-grid mt-3">
            <!-- Dr. Rajnikant -->
            <div class="doc-rev-card skin-border">
              <div class="doc-rev-top">
                <span class="doc-rev-avatar">🌸</span>
                <div>
                  <strong>Dr. Rajnikant Arvind Chaudhari</strong>
                  <div class="text-xs text-muted">Dermatology, Trichology & Lasers</div>
                </div>
              </div>
              <div class="doc-rev-figures">
                <div class="doc-rev-amt">₹ ${drR.amount.toLocaleString()}</div>
                <div class="doc-rev-count">${drR.count} Consultations</div>
              </div>
              <div class="doc-rev-share">
                ${metrics.totalRevenue > 0 ? Math.round((drR.amount / metrics.totalRevenue) * 100) : 0}% of Clinic Volume
              </div>
            </div>

            <!-- Dr. Priyanka -->
            <div class="doc-rev-card dental-border">
              <div class="doc-rev-top">
                <span class="doc-rev-avatar">🦷</span>
                <div>
                  <strong>Dr. Priyanka Chaudhari (Anokar)</strong>
                  <div class="text-xs text-muted">Dental Surgery & Single-Sitting RCT</div>
                </div>
              </div>
              <div class="doc-rev-figures">
                <div class="doc-rev-amt">₹ ${drP.amount.toLocaleString()}</div>
                <div class="doc-rev-count">${drP.count} Procedures</div>
              </div>
              <div class="doc-rev-share">
                ${metrics.totalRevenue > 0 ? Math.round((drP.amount / metrics.totalRevenue) * 100) : 0}% of Clinic Volume
              </div>
            </div>

            <!-- Dr. Shrutika -->
            <div class="doc-rev-card pediatric-border">
              <div class="doc-rev-top">
                <span class="doc-rev-avatar">🧸</span>
                <div>
                  <strong>Dr. Shrutika Tulaskar</strong>
                  <div class="text-xs text-muted">Pediatric Dentistry & Smile Design</div>
                </div>
              </div>
              <div class="doc-rev-figures">
                <div class="doc-rev-amt">₹ ${drT.amount.toLocaleString()}</div>
                <div class="doc-rev-count">${drT.count} Consultations</div>
              </div>
              <div class="doc-rev-share">
                ${metrics.totalRevenue > 0 ? Math.round((drT.amount / metrics.totalRevenue) * 100) : 0}% of Clinic Volume
              </div>
            </div>
          </div>
        </div>

        <!-- Cash vs UPI Comparison Visual Bar -->
        <div class="analytics-card mt-4">
          <h3 class="card-title">Payment Mode Proportions (Cash vs Dynamic UPI QR)</h3>
          <div class="payment-split-bar-wrap">
            <div class="split-bar">
              <div class="split-portion upi" style="width: ${upiPercent}%;" title="UPI: ${upiPercent}%"></div>
              <div class="split-portion cash" style="width: ${cashPercent}%;" title="Cash: ${cashPercent}%"></div>
            </div>
            <div class="split-legend">
              <div class="legend-item">
                <span class="dot upi"></span>
                <span>UPI Payments: <strong>₹ ${metrics.upiRevenue.toLocaleString()} (${upiPercent}%)</strong></span>
              </div>
              <div class="legend-item">
                <span class="dot cash"></span>
                <span>Cash Payments: <strong>₹ ${metrics.cashRevenue.toLocaleString()} (${cashPercent}%)</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderDatabasePane(filteredPatients, config) {
    return `
      <div class="admin-database-view animate-fade-in">
        <div class="registry-filters-bar">
          <div class="search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="admin-search-input" class="search-input" placeholder="Search master vault by Patient ID, Name, Phone, Address/Locality..." value="${this.searchQuery}" />
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table class="hospital-table">
              <thead>
                <tr>
                  <th style="width: 12%;">Patient ID</th>
                  <th style="width: 22%;">Name & Address</th>
                  <th style="width: 12%;">Mobile</th>
                  <th style="width: 14%;">Doctor</th>
                  <th style="width: 16%;">Diagnosis / RVG ID</th>
                  <th style="width: 10%;">Billing</th>
                  <th style="width: 14%; text-align: right;">Medical Docs Re-Print</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPatients.map(p => `
                  <tr>
                    <td>
                      <span class="patient-id-tag">${p.patientId}</span>
                      <div class="token-sub">${p.registeredAt}</div>
                    </td>
                    <td>
                      <strong>${p.name}</strong> (${p.age}y / ${p.gender})
                      <div class="text-xs text-muted" title="${p.address}">${p.address}</div>
                      ${p.isEmergency ? '<span class="emergency-tag-inline">🚨 Emergency</span>' : ''}
                    </td>
                    <td class="font-mono text-sm">+91 ${p.phone}</td>
                    <td>
                      <span class="text-xs font-semibold">${p.assignedDoctorId === 'dr-rajnikant' ? 'Dr. Rajnikant (Skin)' : p.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka (Anokar)' : 'Dr. Shrutika (Pediatric)'}</span>
                    </td>
                    <td>
                      <div class="text-xs font-semibold text-teal-dark">${p.clinicalNotes ? p.clinicalNotes.diagnosis : '<span class="text-muted">Awaiting checkup</span>'}</div>
                      ${p.externalRvgId ? `<div class="rvg-tag-inline">RVG: ${p.externalRvgId}</div>` : ''}
                    </td>
                    <td>
                      <span class="status-pill ${p.billing && (p.billing.paymentStatus === 'Paid' || p.billing.paymentStatus === 'Partial') ? 'status-paid' : 'status-waiting'}">
                        ${p.billing ? `${p.billing.paymentStatus} (₹${p.billing.paidAmount !== undefined ? p.billing.paidAmount : p.billing.totalAmount})` : 'Unbilled'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div class="action-btn-group">
                        <button type="button" class="btn-icon-xs btn-admin-print-opd" data-id="${p.patientId}" title="Print OPD Registration Slip">
                          📄
                        </button>
                        ${p.prescription ? `
                          <button type="button" class="btn-icon-xs btn-admin-print-rx" data-id="${p.patientId}" title="Print Multilingual Doctor Prescription">
                            💊
                          </button>
                        ` : ''}
                        ${p.billing ? `
                          <button type="button" class="btn-icon-xs btn-admin-print-inv" data-id="${p.patientId}" title="Print Cash/UPI Invoice">
                            🧾
                          </button>
                        ` : ''}
                        <button type="button" class="btn-icon-xs btn-admin-print-consent" data-id="${p.patientId}" title="Print Informed Consent Form">
                          📝
                        </button>
                        <button type="button" class="btn-icon-xs btn-admin-print-cert" data-id="${p.patientId}" title="Print Medical Fitness Certificate">
                          📋
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderExpensesPane(expenses, metrics) {
    return `
      <div class="admin-expenses-view animate-fade-in">
        <div class="expenses-header-row">
          <div>
            <h3 class="card-title">Clinic Petty Cash Expenses & Disposables</h3>
            <p class="text-xs text-muted">Daily operational expenses deducted from gross hospital collections for clean net closing</p>
          </div>
          <div class="expense-summary-pill">
            Total Expenses: <strong>₹ ${metrics.totalPettyExpenses.toLocaleString()}</strong>
          </div>
        </div>

        <!-- Add Expense Form -->
        <div class="add-expense-card mt-3">
          <h4 class="card-subtitle mb-2">Record New Petty Expense</h4>
          <form id="form-add-expense" class="petty-form-row">
            <div class="form-field flex-2">
              <label for="exp-category">Expense Category / Item <span class="req">*</span></label>
              <input type="text" id="exp-category" class="form-input" placeholder="e.g. Autoclave Pouches, Clinic Sanitization, Tea/Hospitality" required />
            </div>
            <div class="form-field flex-1">
              <label for="exp-amount">Amount (₹) <span class="req">*</span></label>
              <input type="number" id="exp-amount" class="form-input" min="1" placeholder="350" required />
            </div>
            <div class="form-field flex-2">
              <label for="exp-note">Vendor / Bill Note</label>
              <input type="text" id="exp-note" class="form-input" placeholder="Receipt / Medical vendor name" />
            </div>
            <div class="form-field flex-end">
              <button type="submit" class="btn btn-primary" id="btn-submit-expense">
                + Add Expense
              </button>
            </div>
          </form>
        </div>

        <!-- Expenses List Table -->
        <div class="table-card mt-4">
          <table class="hospital-table petty-expenses-table">
            <thead>
              <tr>
                <th style="width: 20%;">Date</th>
                <th style="width: 40%;">Category / Purpose</th>
                <th style="width: 25%;">Note / Vendor</th>
                <th style="width: 15%; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.length === 0 ? `
                <tr>
                  <td colspan="4" class="text-center text-muted py-4">No petty cash expenses recorded today.</td>
                </tr>
              ` : expenses.map(e => `
                <tr>
                  <td>${e.date}</td>
                  <td><strong>${e.category}</strong></td>
                  <td class="text-xs text-muted">${e.note || '-'}</td>
                  <td style="text-align: right;" class="font-bold text-red">- ₹ ${e.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderSettingsPane(config) {
    return `
      <div class="admin-settings-view animate-fade-in">
        <div class="settings-grid">
          <!-- Hospital & UPI Settings Card -->
          <div class="settings-card">
            <h3 class="card-title">Hospital & UPI Payment Configuration</h3>
            <p class="text-xs text-muted mb-4">Changes to Hospital UPI ID update dynamic QR codes in Billing immediately.</p>

            <form id="admin-config-form">
              <div class="form-field mb-3">
                <label for="cfg-hospital-name">Hospital English Name</label>
                <input type="text" id="cfg-hospital-name" class="form-input font-bold" value="${config.hospitalName}" required />
              </div>

              <div class="form-field mb-3">
                <label for="cfg-hospital-marathi">Hospital Marathi Name</label>
                <input type="text" id="cfg-hospital-marathi" class="form-input" value="${config.hospitalNameMarathi}" required />
              </div>

              <!-- Crucial User Requirement: Hospital UPI ID -->
              <div class="form-field mb-3">
                <label for="cfg-upi-id">Hospital Official UPI ID (Beneficiary VPA) <span class="req">*</span></label>
                <div class="input-icon-wrap">
                  <span class="country-prefix">UPI</span>
                  <input type="text" id="cfg-upi-id" class="form-input with-prefix font-mono font-bold text-teal" value="${config.upiId}" placeholder="e.g. 9049883983@ybl" required />
                </div>
                <small class="text-muted">Dynamic QR codes generated at the reception billing counter will route money to this exact UPI ID.</small>
              </div>

              <div class="form-field mb-3">
                <label for="cfg-payee-name">UPI Payee Display Name</label>
                <input type="text" id="cfg-payee-name" class="form-input" value="${config.upiPayeeName}" required />
              </div>

              <div class="form-field mb-3">
                <label for="cfg-phone">Hospital Reception Phone / WhatsApp</label>
                <input type="text" id="cfg-phone" class="form-input" value="${config.phone}" required />
              </div>

              <div class="form-field mb-3">
                <label for="cfg-address">Hospital Physical Address</label>
                <textarea id="cfg-address" class="form-textarea" rows="2" required>${config.address}</textarea>
              </div>

              <button type="submit" class="btn btn-primary" id="btn-save-config">
                Save Hospital & UPI Settings
              </button>
            </form>
          </div>

          <!-- Doctor Default Fee Configuration Card -->
          <div class="settings-card">
            <h3 class="card-title">Default Doctor Consultation Fees</h3>
            <p class="text-xs text-muted mb-4">Set default consultation fees auto-populated on new OPD receipts.</p>

            <div class="fee-config-rows">
              <div class="fee-config-row">
                <div>
                  <strong>Dr. Rajnikant Arvind Chaudhari</strong>
                  <div class="text-xs text-muted">Dermatology, Trichology & Lasers</div>
                </div>
                <div class="fee-input-wrap">
                  <span class="currency-prefix">₹</span>
                  <input type="number" id="fee-dr-rajnikant" class="form-input fee-input" value="400" min="0" />
                </div>
              </div>

              <div class="fee-config-row mt-3">
                <div>
                  <strong>Dr. Priyanka Chaudhari (Anokar)</strong>
                  <div class="text-xs text-muted">Dental Surgery & Single-Sitting RCT</div>
                </div>
                <div class="fee-input-wrap">
                  <span class="currency-prefix">₹</span>
                  <input type="number" id="fee-dr-priyanka" class="form-input fee-input" value="350" min="0" />
                </div>
              </div>

              <div class="fee-config-row mt-3">
                <div>
                  <strong>Dr. Shrutika Tulaskar</strong>
                  <div class="text-xs text-muted">Pediatric Dentistry & Smile Design</div>
                </div>
                <div class="fee-input-wrap">
                  <span class="currency-prefix">₹</span>
                  <input type="number" id="fee-dr-rutika" class="form-input fee-input" value="300" min="0" />
                </div>
              </div>
            </div>

            <!-- Database Backup & Restore -->
            <div class="mt-6 pt-4 border-top">
              <h4 class="card-subtitle mb-2">Master Database Backup & Recovery</h4>
              <p class="text-xs text-muted mb-3">Export all patient records, prescriptions, and invoices to an encrypted JSON backup.</p>

              <button type="button" class="btn btn-outline w-full mb-3" id="btn-export-database">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export JSON Database Backup
              </button>

              <div class="import-box mt-2">
                <label class="text-xs font-bold text-muted block mb-1">Restore Database from JSON Backup:</label>
                <input type="file" id="input-import-database" accept=".json" class="form-input" />
              </div>

              <div class="mt-4 pt-3 border-top">
                <button type="button" class="btn btn-outline text-red w-full" id="btn-reset-database">
                  Reset Database to Initial Hospital Seed
                </button>
              </div>
            </div>
          </div>

          <!-- Neon Serverless PostgreSQL & Vercel Sync Card -->
          <div class="settings-card col-span-full">
            <div class="card-header-flex">
              <div>
                <h3 class="card-title">🐘 Neon Serverless PostgreSQL & Vercel Cloud Sync</h3>
                <p class="text-xs text-muted">Cloud database integration for Chaudhari Clinic Khamgaon. Automatically migrates tables and synchronizes patients, prescriptions, and billing.</p>
              </div>
              <div class="neon-db-status-badge ${apiService.isNeonConnected ? 'connected' : 'local'}">
                <span class="neon-indicator-dot ${apiService.isNeonConnected ? 'online' : 'offline'}"></span>
                <span>${apiService.isNeonConnected ? '🟢 Connected to Neon DB' : '💾 Local Resilient Cache'}</span>
              </div>
            </div>

            <div class="neon-actions-grid mt-4">
              <button type="button" class="btn btn-primary" id="btn-admin-neon-sync">
                ☁️ Push All Current Records to Neon Cloud
              </button>
              <button type="button" class="btn btn-outline" id="btn-admin-neon-pull">
                📥 Pull Latest Cloud Records from Neon
              </button>
              <button type="button" class="btn btn-outline" id="btn-admin-neon-health">
                🩺 Test Neon Database Connection
              </button>
            </div>

            <div class="neon-help-box mt-3">
              <strong>Vercel Deployment Setting:</strong>
              <code>DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require</code>
              <p class="text-xs text-muted mt-1">Configure this in your Vercel Project Settings → Environment Variables. When set, tables and initial seed patients are created automatically!</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(config) {
    // Tab switching
    const btnAnalytics = this.container.querySelector('#btn-admin-analytics');
    const btnDatabase = this.container.querySelector('#btn-admin-database');
    const btnExpenses = this.container.querySelector('#btn-admin-expenses');
    const btnSettings = this.container.querySelector('#btn-admin-settings');

    if (btnAnalytics) btnAnalytics.addEventListener('click', () => this.setTab('analytics'));
    if (btnDatabase) btnDatabase.addEventListener('click', () => this.setTab('database'));
    if (btnExpenses) btnExpenses.addEventListener('click', () => this.setTab('expenses'));
    if (btnSettings) btnSettings.addEventListener('click', () => this.setTab('settings'));

    // Search in database tab
    const searchInput = this.container.querySelector('#admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const reInput = this.container.querySelector('#admin-search-input');
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(reInput.value.length, reInput.value.length);
        }
      });
    }

    // Document print actions in database table
    this.container.querySelectorAll('.btn-admin-print-opd').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) printOpdSlip(p, config);
      });
    });

    this.container.querySelectorAll('.btn-admin-print-rx').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) printPrescription(p, config, 'mr');
      });
    });

    this.container.querySelectorAll('.btn-admin-print-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) printInvoice(p, config);
      });
    });

    this.container.querySelectorAll('.btn-admin-print-consent').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) printConsentForm(p, config, 'mr');
      });
    });

    this.container.querySelectorAll('.btn-admin-print-cert').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) printFitnessCertificate(p, config);
      });
    });

    // Add Petty Expense
    const expenseForm = this.container.querySelector('#form-add-expense');
    if (expenseForm) {
      expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = this.container.querySelector('#exp-category').value.trim();
        const amount = parseFloat(this.container.querySelector('#exp-amount').value) || 0;
        const note = this.container.querySelector('#exp-note').value.trim();

        if (category && amount > 0) {
          hospitalDb.addPettyExpense({ category, amount, note });
          playClinicChime('success');
          this.render();
        }
      });
    }

    // Save Hospital & UPI Configuration
    const configForm = this.container.querySelector('#admin-config-form');
    if (configForm) {
      configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const upiId = this.container.querySelector('#cfg-upi-id').value.trim();
        const upiPayeeName = this.container.querySelector('#cfg-payee-name').value.trim();
        const hospitalName = this.container.querySelector('#cfg-hospital-name').value.trim();
        const hospitalNameMarathi = this.container.querySelector('#cfg-hospital-marathi').value.trim();
        const phone = this.container.querySelector('#cfg-phone').value.trim();
        const address = this.container.querySelector('#cfg-address').value.trim();

        hospitalDb.updateConfig({
          upiId,
          upiPayeeName,
          hospitalName,
          hospitalNameMarathi,
          phone,
          address
        });

        playClinicChime('success');
        alert('Hospital and UPI Configuration successfully updated! All new billing QR codes will use this UPI ID.');
        this.render();
      });
    }

    // Export Database
    const btnExport = this.container.querySelector('#btn-export-database');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = hospitalDb.exportJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chaudhari_hospital_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Import Database
    const inputImport = this.container.querySelector('#input-import-database');
    if (inputImport) {
      inputImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const success = hospitalDb.importJson(ev.target.result);
            if (success) {
              alert('Database backup successfully restored!');
              this.render();
            } else {
              alert('Failed to import database. File must be valid JSON.');
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // Reset Database
    const btnReset = this.container.querySelector('#btn-reset-database');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all records to initial hospital seed data?')) {
          hospitalDb.resetToDefault();
          alert('Database reset to defaults.');
          this.render();
        }
      });
    }

    // Neon Database Cloud Sync
    const btnNeonSync = this.container.querySelector('#btn-admin-neon-sync');
    if (btnNeonSync) {
      btnNeonSync.addEventListener('click', async () => {
        btnNeonSync.textContent = '⏳ Pushing to Neon Cloud...';
        playClinicChime('click');
        try {
          const res = await hospitalDb.syncWithNeon();
          if (res && res.success) {
            playClinicChime('success');
            alert(`✅ Successfully synced ${res.syncedPatients || 'all'} patient records & expenses to Neon Cloud PostgreSQL!`);
          } else {
            alert('ℹ️ Data saved in resilient local cache. To sync with Neon cloud, configure DATABASE_URL in Vercel project environment variables.');
          }
        } catch (e) {
          alert('Note: Operating in local cache mode. Set DATABASE_URL to enable cloud synchronization.');
        }
        btnNeonSync.textContent = '☁️ Push All Current Records to Neon Cloud';
        this.render();
      });
    }

    // Neon Database Cloud Pull
    const btnNeonPull = this.container.querySelector('#btn-admin-neon-pull');
    if (btnNeonPull) {
      btnNeonPull.addEventListener('click', async () => {
        btnNeonPull.textContent = '⏳ Pulling from Neon Cloud...';
        playClinicChime('click');
        try {
          await hospitalDb.pullFromNeon();
          playClinicChime('success');
          alert('✅ Fresh patient records, clinical notes, and receipts successfully pulled from Neon Cloud!');
        } catch (e) {
          alert('Note: Could not reach Neon server. Operating with local records.');
        }
        btnNeonPull.textContent = '📥 Pull Latest Cloud Records from Neon';
        this.render();
      });
    }

    // Neon Connection Healthcheck
    const btnNeonHealth = this.container.querySelector('#btn-admin-neon-health');
    if (btnNeonHealth) {
      btnNeonHealth.addEventListener('click', async () => {
        btnNeonHealth.textContent = '🩺 Checking...';
        const health = await apiService.checkHealth();
        if (health && health.neonConnected) {
          playClinicChime('success');
          alert(`🟢 Neon PostgreSQL is ONLINE & HEALTHY!\n\nDatabase: ${health.database}\nLatency: ${health.latencyMs}ms\nPatients in Cloud: ${health.tableCounts.patients}\nPetty Expenses: ${health.tableCounts.pettyExpenses}`);
        } else {
          alert('ℹ️ Neon Database is not connected yet.\n\nTo activate: Add your DATABASE_URL to your Vercel Project Settings -> Environment Variables, or in a local .env file.');
        }
        btnNeonHealth.textContent = '🩺 Test Neon Database Connection';
      });
    }
  }
}

