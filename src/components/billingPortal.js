// Billing Portal with Dynamic Amount-Based UPI QR Code Generator
// Supports Partial Payment / Multi-Sitting Packages, Cash Desk Calculator & Trigger 3 Live Notification

import QRCode from 'qrcode';
import { hospitalDb } from '../data/hospitalDb.js';
import { notificationEngine } from '../utils/notificationEngine.js';
import { playClinicChime } from '../utils/audio.js';
import { printInvoice } from './printManager.js';
import confetti from 'canvas-confetti';

export class BillingPortal {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate || (() => {});
    this.selectedPatientId = null;
    this.paymentMethod = 'UPI'; // 'UPI' or 'Cash'
    this.paidToday = null; // Custom partial payment amount
    this.cashTendered = '';
    this.upiTxnRef = '';
    this.generatedQrDataUrl = null;
    this.searchQuery = '';
    this.staffName = 'Reception Desk - Sunita';
    this.render();
  }

  setPatient(patientId) {
    this.selectedPatientId = patientId;
    this.paymentMethod = 'UPI';
    this.paidToday = null;
    this.cashTendered = '';
    this.upiTxnRef = '';
    this.generatedQrDataUrl = null;
    this.render();
  }

  async generateUpiQr(patient, payableAmount) {
    const config = hospitalDb.getConfig();
    const upiId = config.upiId || '9049883983@ybl';
    const payeeName = config.upiPayeeName || 'Chaudhari Clinic Khamgaon';
    const invoiceId = patient.billing ? patient.billing.invoiceId : `CSD-INV-${Date.now().toString().slice(-4)}`;
    
    // Strict NPCI UPI Intent URI formatted with exact payable amount!
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill_' + invoiceId + '_' + patient.patientId)}`;

    try {
      this.generatedQrDataUrl = await QRCode.toDataURL(upiUri, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Failed to generate UPI QR code:', err);
      this.generatedQrDataUrl = null;
    }
  }

  async render() {
    const patients = hospitalDb.getAllPatients();
    const config = hospitalDb.getConfig();

    // Real-time search filter by Name or Mobile
    const q = (this.searchQuery || '').trim().toLowerCase();
    const filterFn = (p) => {
      if (!q) return true;
      const nameMatch = p.name && p.name.toLowerCase().includes(q);
      const phoneMatch = p.phone && p.phone.includes(q);
      const idMatch = p.patientId && p.patientId.toLowerCase().includes(q);
      const tokenMatch = p.tokenNo && String(p.tokenNo).includes(q);
      return nameMatch || phoneMatch || idMatch || tokenMatch;
    };

    // Find billable and paid patients
    const billablePatients = patients.filter(p => p.billing && (p.billing.paymentStatus === 'Pending' || p.billing.paymentStatus === 'Partial')).filter(filterFn);
    const completedPatients = patients.filter(p => p.billing && p.billing.paymentStatus === 'Paid').filter(filterFn);

    if (!this.selectedPatientId && billablePatients.length > 0) {
      this.selectedPatientId = billablePatients[0].patientId;
    }

    const patient = patients.find(p => p.patientId === this.selectedPatientId) || billablePatients[0] || null;

    let currentTotal = 400;
    if (patient && patient.billing) {
      currentTotal = patient.billing.totalAmount || 400;
    }

    const payableAmount = this.paidToday !== null ? this.paidToday : currentTotal;

    if (patient && patient.billing && this.paymentMethod === 'UPI') {
      await this.generateUpiQr(patient, payableAmount);
    }

    const pendingBalance = Math.max(0, currentTotal - payableAmount);

    this.container.innerHTML = `
      <div class="billing-portal-layout">
        <!-- Top Title Bar -->
        <div class="portal-header-row">
          <div>
            <div class="section-tag-pill">Hospital Billing & Cash/UPI Desk</div>
            <h2 class="portal-title">Patient Fee Collection & Dynamic UPI QR</h2>
            <p class="portal-subtitle">Linked with Doctor Clinical Examination & Consultation Fees</p>
          </div>
          <div class="header-action-group">
            <span class="upi-id-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Hospital UPI: <strong>${config.upiId}</strong>
            </span>
          </div>
        </div>

        <div class="billing-grid-container">
          <!-- Left Column: Patient Selector & Pending Bills -->
          <div class="billing-sidebar-card">
            <div class="sidebar-header">
              <h3 class="card-title">Pending Billing Queue (${billablePatients.length})</h3>
            </div>

            <!-- Search by Patient Name or Mobile Number -->
            <div class="doc-queue-search-wrap mb-2">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                id="billing-search-input" 
                class="form-input form-input-sm" 
                placeholder="Search Name or Mobile..." 
                value="${this.searchQuery}" 
                autocomplete="off"
              />
              ${this.searchQuery ? `<button type="button" class="search-clear-btn" id="btn-clear-billing-search">✕</button>` : ''}
            </div>

            <div class="pending-bills-list">
              ${billablePatients.length === 0 ? `
                <div class="empty-bills-msg">
                  <span class="empty-icon">✓</span>
                  <p>${this.searchQuery ? `No billing records found matching "${this.searchQuery}"` : 'All patient bills are clear! No pending payments.'}</p>
                </div>
              ` : billablePatients.map(p => `
                <div class="bill-patient-chip ${p.patientId === this.selectedPatientId ? 'selected' : ''}" data-id="${p.patientId}">
                  <div class="chip-top">
                    <span class="chip-id">${p.patientId} • #${p.tokenNo}</span>
                    <span class="chip-amount">₹ ${p.billing.totalAmount}</span>
                  </div>
                  <strong class="chip-name">${p.name}</strong>
                  <div class="chip-doctor">${p.clinicalNotes ? p.clinicalNotes.doctorName.split(' ')[1] : 'OPD'} • 📞 ${p.phone}</div>
                </div>
              `).join('')}
            </div>

            <!-- Recent Paid Invoices -->
            <div class="recent-paid-strip">
              <h4 class="card-subtitle">Recent Paid Invoices (${completedPatients.length})</h4>
              <div class="recent-paid-scroller">
                ${completedPatients.slice(0, 6).map(cp => `
                  <div class="recent-paid-item">
                    <div>
                      <div class="font-bold text-xs">${cp.name} (${cp.patientId})</div>
                      <div class="text-xs text-muted">${cp.billing.invoiceId} • Paid via ${cp.billing.paymentMethod} • 📞 ${cp.phone}</div>
                    </div>
                    <button type="button" class="btn-icon-xs btn-reprint-inv" data-id="${cp.patientId}" title="Print Invoice">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column: Active Patient Billing Workspace -->
          <div class="billing-main-card">
            ${!patient ? `
              <div class="no-selection-box">
                <p>Select a patient from the queue or register a new patient to collect fees.</p>
              </div>
            ` : patient.billing && patient.billing.paymentStatus === 'Paid' ? `
              <!-- Invoice Completed Receipt Screen -->
              <div class="invoice-paid-card animate-scale-up">
                <div class="paid-success-banner">
                  <div class="success-check-ring">✓</div>
                  <h3>Payment Successfully Recorded</h3>
                  <p>Invoice <strong>${patient.billing.invoiceId}</strong> paid via <strong>${patient.billing.paymentMethod}</strong> on ${patient.billing.billedAt}</p>
                </div>

                <div class="invoice-summary-table">
                  <div class="inv-row">
                    <span>Unique Patient ID</span>
                    <strong>${patient.patientId}</strong>
                  </div>
                  <div class="inv-row">
                    <span>Patient Name</span>
                    <strong>${patient.name} (${patient.age}y / ${patient.gender})</strong>
                  </div>
                  <div class="inv-row">
                    <span>Mobile & Address</span>
                    <strong>+91 ${patient.phone} • ${patient.address}</strong>
                  </div>
                  <div class="inv-row">
                    <span>Attending Doctor</span>
                    <strong>${patient.assignedDoctorId === 'dr-rajnikant' ? 'Dr. Rajnikant Chaudhari' : patient.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka Chaudhari' : 'Dr. Rutika Tulaskar'}</strong>
                  </div>
                  <div class="inv-divider"></div>
                  <div class="inv-row">
                    <span>Consultation Fee</span>
                    <span>₹ ${patient.billing.consultationFee.toFixed(2)}</span>
                  </div>
                  ${patient.billing.procedureFee > 0 ? `
                    <div class="inv-row">
                      <span>Procedure Charges</span>
                      <span>₹ ${patient.billing.procedureFee.toFixed(2)}</span>
                    </div>
                  ` : ''}
                  <div class="inv-row total-highlight">
                    <span>Total Amount Paid</span>
                    <span class="inv-total-val">₹ ${(patient.billing.paidAmount !== undefined ? patient.billing.paidAmount : patient.billing.totalAmount).toFixed(2)}</span>
                  </div>
                  ${patient.billing.pendingBalance > 0 ? `
                    <div class="inv-row text-red">
                      <span>Pending Balance for Next Sitting</span>
                      <strong>₹ ${patient.billing.pendingBalance.toFixed(2)}</strong>
                    </div>
                  ` : ''}
                  ${patient.billing.paymentMethod === 'UPI' && patient.billing.upiTxnRef ? `
                    <div class="inv-row text-xs text-muted">
                      <span>UPI Transaction Ref</span>
                      <span class="font-mono">${patient.billing.upiTxnRef}</span>
                    </div>
                  ` : ''}
                </div>

                <div class="paid-action-buttons">
                  <button type="button" class="btn btn-primary" id="btn-print-active-invoice">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print Official Invoice
                  </button>
                  <button type="button" class="btn btn-whatsapp" id="btn-whatsapp-invoice">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.778.978-.954 1.178-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.787-1.676-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.3.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.587-.493-.507-.678-.517l-.578-.01c-.201 0-.527.075-.803.377s-1.055 1.03-1.055 2.511c0 1.481 1.08 2.911 1.231 3.112.151.201 2.125 3.245 5.148 4.552.719.311 1.281.497 1.719.636.723.23 1.381.197 1.901.12.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.431-.076-.126-.277-.201-.578-.351zM12.004 2C6.484 2 2.01 6.474 2.01 12c0 1.91.537 3.696 1.468 5.222L2 22l4.945-1.435C8.414 21.433 10.154 22 12.004 22c5.521 0 9.996-4.475 9.996-10 0-5.526-4.475-10-9.996-10z"/></svg>
                    Send Invoice on WhatsApp
                  </button>
                  <button type="button" class="btn btn-outline" id="btn-next-pending-bill">
                    Bill Next Patient →
                  </button>
                </div>
              </div>
            ` : `
              <!-- Active Payment Form -->
              <div class="active-billing-workspace">
                <!-- Patient Info Header -->
                <div class="billing-patient-header">
                  <div class="patient-id-badge">${patient.patientId}</div>
                  <div>
                    <h3 class="bp-name">${patient.name}</h3>
                    <p class="bp-meta">${patient.age}y • ${patient.gender} • Mobile: +91 ${patient.phone} • Token #${patient.tokenNo}</p>
                    <p class="bp-address text-xs text-muted">Address: ${patient.address}</p>
                  </div>
                  <div class="bp-doctor-box">
                    <span class="bp-doc-lbl">Attending Doctor</span>
                    <strong>${patient.clinicalNotes ? patient.clinicalNotes.doctorName : (patient.assignedDoctorId === 'dr-rajnikant' ? 'Dr. Rajnikant Chaudhari' : 'Dr. Priyanka Chaudhari')}</strong>
                  </div>
                </div>

                ${patient.clinicalNotes && patient.clinicalNotes.diagnosis ? `
                  <div class="bp-diagnosis-strip">
                    <strong>Diagnosis:</strong> ${patient.clinicalNotes.diagnosis}
                  </div>
                ` : ''}

                <!-- Charge Items Editor / Preview -->
                <div class="fee-breakdown-card">
                  <h4 class="card-subtitle">Hospital Invoice Breakdown</h4>
                  <div class="fee-inputs-grid">
                    <div class="form-field">
                      <label>Consultation Fee (₹)</label>
                      <input type="number" id="input-consultation-fee" class="form-input" value="${patient.billing ? patient.billing.consultationFee : 400}" min="0" />
                    </div>
                    <div class="form-field">
                      <label>Procedure / Treatment Charges (₹)</label>
                      <input type="number" id="input-procedure-fee" class="form-input" value="${patient.billing ? patient.billing.procedureFee : 0}" min="0" placeholder="0" />
                    </div>
                  </div>

                  <div class="total-payable-bar">
                    <div class="tp-col">
                      <span class="t-lbl">Total Charges:</span>
                      <span class="t-amount" id="display-total-amount">₹ ${currentTotal.toFixed(2)}</span>
                    </div>

                    <!-- Partial Payment / Paid Today Input -->
                    <div class="tp-col partial-pay-col">
                      <label class="t-lbl text-teal" for="input-paid-today">Amount Paying Today (₹):</label>
                      <div class="paid-input-wrap">
                        <input type="number" id="input-paid-today" class="form-input paid-today-input font-bold" value="${payableAmount}" min="1" max="${currentTotal}" />
                        <button type="button" class="btn btn-xs btn-outline" id="btn-full-pay">Pay Full</button>
                      </div>
                    </div>

                    <div class="tp-col pending-balance-box">
                      <span class="t-lbl">Pending Balance:</span>
                      <span class="t-pending ${pendingBalance > 0 ? 'text-red font-bold' : 'text-emerald'}" id="display-pending-balance">
                        ₹ ${pendingBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Payment Method Toggle: Cash vs UPI -->
                <div class="payment-method-section">
                  <label class="form-label-bold">Select Payment Mode</label>
                  <div class="method-toggle-grid">
                    <button type="button" class="method-btn ${this.paymentMethod === 'UPI' ? 'active' : ''}" id="btn-method-upi">
                      <div class="m-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      </div>
                      <div class="m-text">
                        <strong>UPI (Dynamic QR Code)</strong>
                        <span>GPay, PhonePe, Paytm, BHIM</span>
                      </div>
                      <span class="recommended-badge">Amount-Based</span>
                    </button>

                    <button type="button" class="method-btn ${this.paymentMethod === 'Cash' ? 'active' : ''}" id="btn-method-cash">
                      <div class="m-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                      </div>
                      <div class="m-text">
                        <strong>Cash Payment</strong>
                        <span>Cash Desk Counter & Change</span>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Dynamic Payment Method Content Area -->
                <div class="payment-details-pane">
                  ${this.paymentMethod === 'UPI' ? `
                    <!-- Dynamic Amount-Based UPI QR Code Card -->
                    <div class="upi-qr-display-card animate-fade-in">
                      <div class="qr-presentation-col">
                        ${this.generatedQrDataUrl ? `
                          <div class="qr-frame">
                            <img src="${this.generatedQrDataUrl}" alt="UPI QR Code for ${patient.name}" class="upi-generated-qr-image" />
                            <div class="qr-scan-badge">
                              <span class="pulse-dot"></span> Scan to Pay Exact ₹<span id="qr-badge-amt">${payableAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        ` : `
                          <div class="qr-loading-box">Generating UPI QR...</div>
                        `}
                      </div>

                      <div class="upi-instructions-col">
                        <div class="upi-meta-box">
                          <span class="label">Beneficiary Clinic UPI ID</span>
                          <div class="upi-id-copy-row">
                            <span class="upi-id-text">${config.upiId}</span>
                            <span class="upi-verified-tick">✓ Verified Hospital Desk</span>
                          </div>
                          <div class="text-xs text-muted mt-1">Payee Name: ${config.upiPayeeName}</div>
                        </div>

                        <div class="upi-amount-callout">
                          <span class="text-xs text-muted uppercase">Fixed Payable Amount:</span>
                          <h3 class="amount-large text-teal">₹ <span id="callout-amt">${payableAmount.toFixed(2)}</span></h3>
                          <p class="text-xs text-muted">When scanned via GPay, PhonePe, or Paytm, the exact amount is pre-filled automatically.</p>
                        </div>

                        <div class="form-field mt-3">
                          <label for="upi-ref-input">UPI Transaction Ref / UTR (Optional)</label>
                          <input type="text" id="upi-ref-input" class="form-input font-mono" placeholder="e.g. 429810459821 or leave blank for auto-generate" value="${this.upiTxnRef}" />
                        </div>

                        <button type="button" class="btn btn-primary btn-lg w-full mt-3 glow-teal" id="btn-confirm-upi-payment">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Confirm UPI Payment & Save Invoice
                        </button>
                      </div>
                    </div>
                  ` : `
                    <!-- Cash Payment Calculator -->
                    <div class="cash-calc-card animate-fade-in">
                      <div class="form-row-grid">
                        <div class="form-field">
                          <label for="input-cash-tendered">Cash Tendered by Patient (₹)</label>
                          <input type="number" id="input-cash-tendered" class="form-input font-bold" placeholder="e.g. 500, 2000" value="${this.cashTendered}" min="0" />
                        </div>

                        <div class="form-field">
                          <label>Change to Return to Patient (₹)</label>
                          <div class="change-return-box" id="display-cash-change">₹ 0.00</div>
                        </div>
                      </div>

                      <div class="quick-cash-chips">
                        <span class="text-xs text-muted">Quick Amount Chips:</span>
                        <button type="button" class="cash-chip" data-amt="${payableAmount}">Exact (₹${payableAmount})</button>
                        <button type="button" class="cash-chip" data-amt="500">₹ 500</button>
                        <button type="button" class="cash-chip" data-amt="1000">₹ 1000</button>
                        <button type="button" class="cash-chip" data-amt="2000">₹ 2000</button>
                      </div>

                      <button type="button" class="btn btn-primary btn-lg w-full mt-4" id="btn-confirm-cash-payment">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Confirm Cash Payment & Print Receipt
                      </button>
                    </div>
                  `}
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(patient);
  }

  bindEvents(patient) {
    // Search input listener with focus retention
    const searchInput = this.container.querySelector('#billing-search-input');
    const btnClearSearch = this.container.querySelector('#btn-clear-billing-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const reSearch = this.container.querySelector('#billing-search-input');
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(reSearch.value.length, reSearch.value.length);
        }
      });
    }
    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        this.render();
      });
    }

    // Select patient chips
    this.container.querySelectorAll('.bill-patient-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const pid = chip.getAttribute('data-id');
        this.setPatient(pid);
      });
    });

    // Reprint buttons
    this.container.querySelectorAll('.btn-reprint-inv').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) printInvoice(p, hospitalDb.getConfig());
      });
    });

    if (!patient) return;

    // Print active invoice
    const btnPrint = this.container.querySelector('#btn-print-active-invoice');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        printInvoice(patient, hospitalDb.getConfig());
      });
    }

    // WhatsApp invoice
    const btnWa = this.container.querySelector('#btn-whatsapp-invoice');
    if (btnWa) {
      btnWa.addEventListener('click', () => {
        const config = hospitalDb.getConfig();
        const bill = patient.billing;
        const paid = bill.paidAmount !== undefined ? bill.paidAmount : bill.totalAmount;
        const pending = bill.pendingBalance || 0;

        const msg = encodeURIComponent(
          `*Official Invoice - ${config.hospitalName}*\n` +
          `Shriram Chowk, Farshi Road, Khamgaon\n\n` +
          `Patient: ${patient.name} (${patient.patientId})\n` +
          `Invoice ID: ${bill.invoiceId}\n` +
          `Date: ${bill.billedAt}\n` +
          `Doctor: ${patient.assignedDoctorId === 'dr-rajnikant' ? 'Dr. Rajnikant Chaudhari' : patient.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka Chaudhari' : 'Dr. Rutika Tulaskar'}\n` +
          `-------------------------------\n` +
          `Consultation Fee: ₹ ${bill.consultationFee.toFixed(2)}\n` +
          `${bill.procedureFee > 0 ? `Procedure Fee: ₹ ${bill.procedureFee.toFixed(2)}\n` : ''}` +
          `${bill.medicineFee > 0 ? `Clinical Consumables: ₹ ${bill.medicineFee.toFixed(2)}\n` : ''}` +
          `Total Charges: ₹ ${bill.totalAmount.toFixed(2)}\n` +
          `*Amount Paid: ₹ ${paid.toFixed(2)} (${bill.paymentMethod})*\n` +
          `${pending > 0 ? `*Pending Balance: ₹ ${pending.toFixed(2)}*\n` : ''}` +
          `${bill.upiTxnRef ? `UPI Ref: ${bill.upiTxnRef}\n` : ''}` +
          `-------------------------------\n` +
          `Hospital Helpline & WhatsApp: +91 90498 83983\n` +
          `Official UPI VPA: ${config.upiId}`
        );
        window.open(`https://wa.me/91${patient.phone}?text=${msg}`, '_blank');
      });
    }

    // Next pending bill
    const btnNext = this.container.querySelector('#btn-next-pending-bill');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const pending = hospitalDb.getAllPatients().find(p => p.billing && (p.billing.paymentStatus === 'Pending' || p.billing.paymentStatus === 'Partial'));
        this.setPatient(pending ? pending.patientId : null);
      });
    }

    // Fee breakdown calculation
    const inputConsult = this.container.querySelector('#input-consultation-fee');
    const inputProcedure = this.container.querySelector('#input-procedure-fee');
    const inputMed = this.container.querySelector('#input-medicine-fee');
    const displayTotal = this.container.querySelector('#display-total-amount');
    const inputPaidToday = this.container.querySelector('#input-paid-today');
    const displayPending = this.container.querySelector('#display-pending-balance');
    const btnFullPay = this.container.querySelector('#btn-full-pay');

    const recalculateAll = async () => {
      const c = parseFloat(inputConsult ? inputConsult.value : 0) || 0;
      const p = parseFloat(inputProcedure ? inputProcedure.value : 0) || 0;
      const m = parseFloat(inputMed ? inputMed.value : 0) || 0;
      const total = c + p + m;

      if (displayTotal) displayTotal.textContent = `₹ ${total.toFixed(2)}`;

      let payable = total;
      if (inputPaidToday) {
        const val = parseFloat(inputPaidToday.value);
        if (!isNaN(val) && val > 0) {
          payable = val;
        } else {
          payable = total;
        }
      }
      this.paidToday = payable;

      const pending = Math.max(0, total - payable);
      if (displayPending) {
        displayPending.textContent = `₹ ${pending.toFixed(2)}`;
        displayPending.className = `t-pending ${pending > 0 ? 'text-red font-bold' : 'text-emerald'}`;
      }

      const badgeAmt = this.container.querySelector('#qr-badge-amt');
      const calloutAmt = this.container.querySelector('#callout-amt');
      if (badgeAmt) badgeAmt.textContent = payable.toFixed(2);
      if (calloutAmt) calloutAmt.textContent = payable.toFixed(2);

      // Re-generate UPI QR code for the exact amount paying today!
      if (this.paymentMethod === 'UPI') {
        await this.generateUpiQr(patient, payable);
        const qrImg = this.container.querySelector('.upi-generated-qr-image');
        if (qrImg && this.generatedQrDataUrl) {
          qrImg.src = this.generatedQrDataUrl;
        }
      }

      this.updateCashChange(payable);
    };

    if (inputConsult) inputConsult.addEventListener('input', recalculateAll);
    if (inputProcedure) inputProcedure.addEventListener('input', recalculateAll);
    if (inputMed) inputMed.addEventListener('input', recalculateAll);
    if (inputPaidToday) inputPaidToday.addEventListener('input', recalculateAll);

    if (btnFullPay) {
      btnFullPay.addEventListener('click', () => {
        const c = parseFloat(inputConsult ? inputConsult.value : 0) || 0;
        const p = parseFloat(inputProcedure ? inputProcedure.value : 0) || 0;
        const m = parseFloat(inputMed ? inputMed.value : 0) || 0;
        const total = c + p + m;
        if (inputPaidToday) inputPaidToday.value = total;
        recalculateAll();
      });
    }

    // Payment method buttons
    const btnUpi = this.container.querySelector('#btn-method-upi');
    const btnCash = this.container.querySelector('#btn-method-cash');

    if (btnUpi) {
      btnUpi.addEventListener('click', () => {
        this.paymentMethod = 'UPI';
        this.render();
      });
    }

    if (btnCash) {
      btnCash.addEventListener('click', () => {
        this.paymentMethod = 'Cash';
        this.render();
      });
    }

    // Cash Tendered calculation
    const inputTendered = this.container.querySelector('#input-cash-tendered');
    if (inputTendered) {
      inputTendered.addEventListener('input', (e) => {
        this.cashTendered = e.target.value;
        const payable = this.paidToday !== null ? this.paidToday : (patient.billing ? patient.billing.totalAmount : 400);
        this.updateCashChange(payable);
      });
    }

    // Cash chips
    this.container.querySelectorAll('.cash-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const amt = chip.getAttribute('data-amt');
        if (inputTendered) {
          inputTendered.value = amt;
          this.cashTendered = amt;
          const payable = this.paidToday !== null ? this.paidToday : (patient.billing ? patient.billing.totalAmount : 400);
          this.updateCashChange(payable);
        }
      });
    });

    // Confirm UPI Payment
    const btnConfirmUpi = this.container.querySelector('#btn-confirm-upi-payment');
    if (btnConfirmUpi) {
      btnConfirmUpi.addEventListener('click', () => {
        const c = parseFloat(inputConsult ? inputConsult.value : 0) || 0;
        const p = parseFloat(inputProcedure ? inputProcedure.value : 0) || 0;
        const m = parseFloat(inputMed ? inputMed.value : 0) || 0;
        const total = c + p + m;
        const payable = this.paidToday !== null ? this.paidToday : total;

        const upiRef = this.container.querySelector('#upi-ref-input') ? this.container.querySelector('#upi-ref-input').value.trim() : '';

        // Save billing breakdown
        if (!patient.billing) {
          patient.billing = {};
        }
        patient.billing.consultationFee = c;
        patient.billing.procedureFee = p;
        patient.billing.medicineFee = m;
        patient.billing.totalAmount = total;

        hospitalDb.completeBilling(patient.patientId, {
          paymentMethod: 'UPI',
          paidToday: payable,
          upiTxnRef: upiRef,
          billedBy: this.staffName
        });

        // Trigger 3: Live Notification (Billing -> Admin/Doctor Feeds)
        notificationEngine.notify({
          type: 'PAYMENT_RECEIVED',
          title: '💳 Payment Received via UPI',
          message: `₹${payable.toFixed(0)} received from ${patient.name} (${patient.patientId}) • Beneficiary: 9049883983@ybl`,
          icon: '📱',
          patientId: patient.patientId,
          targetView: 'billing',
          actionText: 'View Receipt',
          onAction: () => {
            if (window.hmsNavigate) window.hmsNavigate('billing', patient.patientId);
          }
        });

        playClinicChime('success');
        try {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        } catch (e) {}

        this.render();
      });
    }

    // Confirm Cash Payment
    const btnConfirmCash = this.container.querySelector('#btn-confirm-cash-payment');
    if (btnConfirmCash) {
      btnConfirmCash.addEventListener('click', () => {
        const c = parseFloat(inputConsult ? inputConsult.value : 0) || 0;
        const p = parseFloat(inputProcedure ? inputProcedure.value : 0) || 0;
        const m = parseFloat(inputMed ? inputMed.value : 0) || 0;
        const total = c + p + m;
        const payable = this.paidToday !== null ? this.paidToday : total;

        const tendered = parseFloat(this.cashTendered) || payable;
        const change = Math.max(0, tendered - payable);

        if (!patient.billing) {
          patient.billing = {};
        }
        patient.billing.consultationFee = c;
        patient.billing.procedureFee = p;
        patient.billing.medicineFee = m;
        patient.billing.totalAmount = total;

        hospitalDb.completeBilling(patient.patientId, {
          paymentMethod: 'Cash',
          paidToday: payable,
          cashTendered: tendered,
          cashChange: change,
          billedBy: this.staffName
        });

        // Trigger 3: Live Notification (Billing -> Admin/Doctor Feeds)
        notificationEngine.notify({
          type: 'PAYMENT_RECEIVED',
          title: '💵 Cash Payment Received',
          message: `₹${payable.toFixed(0)} received at Cash Desk from ${patient.name} (${patient.patientId})`,
          icon: '💵',
          patientId: patient.patientId,
          targetView: 'billing',
          actionText: 'View Receipt',
          onAction: () => {
            if (window.hmsNavigate) window.hmsNavigate('billing', patient.patientId);
          }
        });

        playClinicChime('success');
        try {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        } catch (e) {}

        this.render();
      });
    }
  }

  updateCashChange(payable) {
    const box = this.container.querySelector('#display-cash-change');
    if (!box) return;
    const tendered = parseFloat(this.cashTendered) || 0;
    const change = Math.max(0, tendered - payable);
    box.textContent = `₹ ${change.toFixed(2)}`;
    if (tendered < payable && tendered > 0) {
      box.style.color = '#ef4444';
      box.textContent = `Short by ₹ ${(payable - tendered).toFixed(2)}`;
    } else {
      box.style.color = '#10b981';
    }
  }
}
