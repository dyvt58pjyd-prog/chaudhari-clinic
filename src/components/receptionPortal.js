// Reception Portal Component
// Patient Admissions, Returning Patient Auto-Fill, 1-Click Voice Token Caller,
// Khamgaon Locality Chips, Emergency Priority & Live Notification Engine integration

import { hospitalDb, DOCTORS_ROSTER } from '../data/hospitalDb.js';
import { notificationEngine } from '../utils/notificationEngine.js';
import { playClinicChime } from '../utils/audio.js';
import { printOpdSlip } from './printManager.js';
import confetti from 'canvas-confetti';

export class ReceptionPortal {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate || (() => {});
    this.currentTab = 'registration'; // 'registration' or 'registry'
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.dateFilter = 'all'; // 'all', 'today', 'yesterday', or YYYY-MM-DD
    this.shiftFilter = 'all'; // 'all', 'Morning OPD', 'Evening OPD'
    this.lastRegisteredPatient = null;
    this.recognizedReturningPatient = null;
    this.isEmergencyActive = false;
    this.render();
  }

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  // Voice Token Caller using window.speechSynthesis
  callPatientVoice(tokenNo, patientName, doctorName) {
    playClinicChime('queue-call');
    notificationEngine.vibrate([100, 50, 100]);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending utterance
      const text = `Token number ${tokenNo}, ${patientName}, please proceed to ${doctorName}'s cabin.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.05;
      utterance.lang = 'en-IN'; // Indian English accent
      window.speechSynthesis.speak(utterance);
    }
  }

  render() {
    const patients = hospitalDb.getAllPatients();
    const config = hospitalDb.getConfig();

    const todayYMD = hospitalDb.formatDateYMD(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayYMD = hospitalDb.formatDateYMD(yesterdayDate);

    const filteredPatients = patients.filter(p => {
      let matchesDate = true;
      if (this.dateFilter === 'today') {
        matchesDate = p.registeredDate === todayYMD;
      } else if (this.dateFilter === 'yesterday') {
        matchesDate = p.registeredDate === yesterdayYMD;
      } else if (this.dateFilter && this.dateFilter !== 'all') {
        matchesDate = p.registeredDate === this.dateFilter;
      }

      let matchesShift = true;
      if (this.shiftFilter && this.shiftFilter !== 'all') {
        matchesShift = p.registeredShift === this.shiftFilter;
      }

      const matchesSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.patientId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.phone.includes(this.searchQuery) ||
        p.address.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || p.status === this.statusFilter;
      return matchesDate && matchesShift && matchesSearch && matchesStatus;
    });

    const waitingCount = patients.filter(p => p.status === 'Waiting for Doctor').length;
    const readyBillingCount = patients.filter(p => p.status === 'Prescription Ready').length;

    this.container.innerHTML = `
      <div class="reception-portal-layout">
        <!-- Reception Header & Tab Switcher -->
        <div class="portal-header-row">
          <div>
            <div class="section-tag-pill teal">Front Desk & Admissions</div>
            <h2 class="portal-title">Patient Admissions & OPD Registry</h2>
            <p class="portal-subtitle">Auto-assign Unique Patient ID • Voice Caller • Route to 3 Specialists • UPI & Cash Billing Desk</p>
          </div>

          <div class="reception-nav-pills">
            <button type="button" class="tab-pill ${this.currentTab === 'registration' ? 'active' : ''}" id="btn-tab-reg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              <span>+ New Patient Registration</span>
            </button>
            <button type="button" class="tab-pill ${this.currentTab === 'registry' ? 'active' : ''}" id="btn-tab-registry">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>Patient Registry & Live Queue (${patients.length})</span>
              ${readyBillingCount > 0 ? `<span class="pill-counter-alert">${readyBillingCount} to bill</span>` : ''}
            </button>
          </div>
        </div>

        <!-- Dynamic Body Content -->
        ${this.currentTab === 'registration' ? this.renderRegistrationPane(config) : this.renderRegistryPane(filteredPatients, patients, waitingCount, readyBillingCount)}
      </div>
    `;

    this.bindEvents(config);
  }

  renderRegistrationPane(config) {
    return `
      <div class="registration-grid-view animate-fade-in">
        <!-- Registration Form Card -->
        <div class="reg-form-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Enter Patient Details</h3>
              <span class="required-notice">* All patient profile fields will be permanently stored in hospital database</span>
            </div>

            <!-- Emergency Priority Toggle -->
            <button type="button" class="btn-emergency-toggle ${this.isEmergencyActive ? 'active' : ''}" id="btn-toggle-emergency">
              <span>🚨</span>
              <strong>${this.isEmergencyActive ? 'Emergency Priority ON' : 'Emergency / Acute Pain'}</strong>
            </button>
          </div>

          <!-- Returning Patient Notification Chip -->
          <div id="returning-patient-alert-container">
            ${this.recognizedReturningPatient ? `
              <div class="returning-patient-banner animate-fade-in">
                <span>✓ Returning Patient Recognized: <strong>${this.recognizedReturningPatient.name}</strong> (ID: <strong>${this.recognizedReturningPatient.patientId}</strong>)</span>
                <small>Permanent profile auto-filled. Today's fresh token will be assigned.</small>
              </div>
            ` : ''}
          </div>

          <form id="patient-registration-form" class="hospital-form">
            <div class="form-row-grid">
              <!-- Mobile Phone (Lookup First) -->
              <div class="form-field">
                <label for="reg-patient-phone">Mobile Number (10 Digits) <span class="req">*</span></label>
                <div class="input-icon-wrap">
                  <span class="country-prefix">+91</span>
                  <input 
                    type="tel" 
                    id="reg-patient-phone" 
                    class="form-input with-prefix font-bold" 
                    placeholder="9822100000" 
                    maxlength="10" 
                    pattern="[0-9]{10}" 
                    autocomplete="tel"
                    required 
                  />
                </div>
                <span class="text-xs text-muted">Auto-identifies returning patients as you type</span>
              </div>

              <!-- Name -->
              <div class="form-field">
                <label for="reg-patient-name">Patient Full Name <span class="req">*</span></label>
                <div class="input-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" id="reg-patient-name" class="form-input" placeholder="e.g. Pooja Santosh Wankhede" required />
                </div>
              </div>

              <!-- Age & Gender -->
              <div class="form-field">
                <label for="reg-patient-age">Age (in Years) <span class="req">*</span></label>
                <input type="number" id="reg-patient-age" class="form-input" placeholder="e.g. 24" min="1" max="115" required />
              </div>

              <div class="form-field">
                <label for="reg-patient-gender">Gender</label>
                <select id="reg-patient-gender" class="form-select">
                  <option value="Female">Female</option>
                  <option value="Male" selected>Male</option>
                  <option value="Other">Other / Child</option>
                </select>
              </div>

              <!-- Address with Khamgaon Locality Chips -->
              <div class="form-field full-width">
                <label for="reg-patient-address">Residential Address / Village / Locality <span class="req">*</span></label>
                <div class="input-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input type="text" id="reg-patient-address" class="form-input" placeholder="e.g. Farshi Road, Khamgaon" required />
                </div>

                <!-- 1-Tap Khamgaon Locality Chips -->
                <div class="khamgaon-chips-row mt-2">
                  <span class="text-xs text-muted">1-Tap Locality:</span>
                  <button type="button" class="btn-locality-chip" data-loc="Farshi Road, Khamgaon">Farshi Road, Khamgaon</button>
                  <button type="button" class="btn-locality-chip" data-loc="Shivalay Vihar, Khamgaon">Shivalay Vihar</button>
                  <button type="button" class="btn-locality-chip" data-loc="Jalamb, Nandura Road">Jalamb</button>
                  <button type="button" class="btn-locality-chip" data-loc="Shegaon, Buldhana">Shegaon</button>
                  <button type="button" class="btn-locality-chip" data-loc="Nandura, Buldhana">Nandura</button>
                </div>
              </div>

              <!-- Assigned Doctor -->
              <div class="form-field full-width">
                <label>Assign to Specialist Doctor & OPD Suite <span class="req">*</span></label>
                <div class="doctor-select-radios">
                  ${DOCTORS_ROSTER.map((doc, idx) => `
                    <label class="doc-radio-card ${idx === 0 ? 'checked' : ''}">
                      <input type="radio" name="assignedDoctor" value="${doc.id}" ${idx === 0 ? 'checked' : ''} />
                      <div class="doc-radio-content">
                        <strong class="doc-name">${doc.name}</strong>
                        <span class="doc-dept text-teal font-semibold">${doc.department}</span>
                        <span class="doc-creds text-xs text-muted">${doc.qualifications} • ${doc.room}</span>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Chief Complaints / Reason -->
              <div class="form-field full-width">
                <label for="reg-patient-reason">Chief Complaint / Reason for Hospital Visit</label>
                <textarea id="reg-patient-reason" class="form-textarea" rows="2" placeholder="e.g. Severe toothache, facial acne flare-up, bleeding gums..."></textarea>
              </div>
            </div>

            <div class="form-submit-row">
              <button type="submit" class="btn btn-primary btn-lg glow-teal" id="btn-submit-registration">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Register Patient & Assign Token
              </button>
            </div>
          </form>
        </div>

        <!-- Registration Success / Preview Column -->
        <div class="reg-preview-card">
          ${this.lastRegisteredPatient ? `
            <div class="registered-success-pass animate-scale-up">
              <div class="pass-head ${this.lastRegisteredPatient.isEmergency ? 'emergency-pass' : ''}">
                <span class="pass-badge">✓ REGISTERED & TOKEN ASSIGNED</span>
                <h4 class="pass-title">${this.lastRegisteredPatient.patientId}</h4>
                <div class="token-display">TOKEN #${this.lastRegisteredPatient.tokenNo}</div>
                ${this.lastRegisteredPatient.isEmergency ? `<span class="emergency-tag-big">🚨 EMERGENCY CASE</span>` : ''}
              </div>

              <div class="pass-details-list">
                <div class="p-detail">
                  <span class="lbl">Patient Name:</span>
                  <strong class="val">${this.lastRegisteredPatient.name}</strong>
                </div>
                <div class="p-detail">
                  <span class="lbl">Age & Gender:</span>
                  <span class="val">${this.lastRegisteredPatient.age} Yrs • ${this.lastRegisteredPatient.gender}</span>
                </div>
                <div class="p-detail">
                  <span class="lbl">Mobile Number:</span>
                  <span class="val">+91 ${this.lastRegisteredPatient.phone}</span>
                </div>
                <div class="p-detail">
                  <span class="lbl">Address:</span>
                  <span class="val">${this.lastRegisteredPatient.address}</span>
                </div>
                <div class="p-detail">
                  <span class="lbl">Assigned Doctor:</span>
                  <span class="val text-teal font-bold">${this.lastRegisteredPatient.assignedDoctorId === 'dr-rajnikant' ? 'Dr. Rajnikant Chaudhari (Derm)' : this.lastRegisteredPatient.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka Chaudhari (Anokar) (Dental)' : 'Dr. Shrutika Tulaskar (Pediatric)'}</span>
                </div>
              </div>

              <div class="pass-actions-row">
                <button type="button" class="btn btn-primary btn-sm" id="btn-print-last-opd">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print OPD Slip
                </button>

                <button type="button" class="btn btn-outline btn-sm btn-voice-caller" id="btn-voice-call-last">
                  📢 Announce Voice Token
                </button>

                <button type="button" class="btn btn-outline btn-sm" id="btn-go-to-doctor-checkup">
                  Go to Doctor EMR →
                </button>
              </div>
            </div>
          ` : `
            <div class="reg-instructions-box">
              <div class="instruction-icon">🏥</div>
              <h4>Patient Entry Protocol</h4>
              <ul>
                <li><strong>Returning Patient Recognition:</strong> Enter mobile number to instantly populate existing medical profile.</li>
                <li><strong>Unique ID Creation:</strong> Each patient receives an unalterable hospital ID (e.g. <code>CSD-P1002</code>) linked to their records forever.</li>
                <li><strong>Voice Token Caller:</strong> 1-click announces patient token and doctor cabin over waiting room speakers.</li>
                <li><strong>Direct Reception Billing:</strong> Prescriptions synchronize directly with front desk for UPI/Cash receipt.</li>
              </ul>
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderRegistryPane(filteredPatients, allPatients, waitingCount, readyBillingCount) {
    return `
      <div class="registry-view animate-fade-in">
        <!-- Quick Metric Strip -->
        <div class="registry-stats-row">
          <div class="r-stat-box">
            <span class="s-label">Total Patients Registered</span>
            <span class="s-val">${allPatients.length}</span>
          </div>
          <div class="r-stat-box text-amber">
            <span class="s-label">Waiting for Doctor Checkup</span>
            <span class="s-val">${waitingCount}</span>
          </div>
          <div class="r-stat-box text-purple">
            <span class="s-label">Prescription Ready (Pending Bill)</span>
            <span class="s-val">${readyBillingCount}</span>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="registry-filters-bar flex flex-col gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <div class="search-input-wrap flex-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="registry-search-input" class="search-input" placeholder="🔍 Search by Patient Name or 10-digit Mobile Number (e.g. Suresh, 9822145670)..." value="${this.searchQuery}" />
            </div>

            <div class="flex items-center gap-1 flex-wrap">
              <button type="button" class="rec-date-pill ${this.dateFilter === 'all' ? 'active' : ''}" data-date="all">All Dates</button>
              <button type="button" class="rec-date-pill ${this.dateFilter === 'today' ? 'active' : ''}" data-date="today">Today</button>
              <button type="button" class="rec-date-pill ${this.dateFilter === 'yesterday' ? 'active' : ''}" data-date="yesterday">Yesterday</button>
              <input type="date" id="registry-date-picker" class="form-input form-input-xs" style="width: 130px; font-size: 0.75rem; padding: 3px 5px;" value="${this.dateFilter !== 'all' && this.dateFilter !== 'today' && this.dateFilter !== 'yesterday' ? this.dateFilter : ''}" title="Filter by specific date" />
              <select id="registry-shift-select" class="form-select form-select-xs" style="font-size: 0.75rem; padding: 4px 6px;">
                <option value="all" ${this.shiftFilter === 'all' ? 'selected' : ''}>All Shifts</option>
                <option value="Morning OPD" ${this.shiftFilter === 'Morning OPD' ? 'selected' : ''}>🌅 Morning OPD</option>
                <option value="Evening OPD" ${this.shiftFilter === 'Evening OPD' ? 'selected' : ''}>🌆 Evening OPD</option>
              </select>
            </div>
          </div>

          <div class="status-filter-pills">
            <button type="button" class="filter-pill ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">All (${allPatients.length})</button>
            <button type="button" class="filter-pill ${this.statusFilter === 'Waiting for Doctor' ? 'active' : ''}" data-status="Waiting for Doctor">Waiting (${waitingCount})</button>
            <button type="button" class="filter-pill ${this.statusFilter === 'Prescription Ready' ? 'active' : ''}" data-status="Prescription Ready">Ready to Bill (${readyBillingCount})</button>
            <button type="button" class="filter-pill ${this.statusFilter === 'Billing Completed' ? 'active' : ''}" data-status="Billing Completed">Billed</button>
          </div>
        </div>

        <!-- Patient Records Table -->
        <div class="table-card">
          <div class="table-responsive">
            <table class="hospital-table">
              <thead>
                <tr>
                  <th style="width: 13%;">Patient ID & Token</th>
                  <th style="width: 18%;">Patient Name & Age</th>
                  <th style="width: 15%;">Registered Time & Shift</th>
                  <th style="width: 12%;">Mobile Number</th>
                  <th style="width: 16%;">Address</th>
                  <th style="width: 14%;">Assigned Doctor</th>
                  <th style="width: 8%;">Status</th>
                  <th style="width: 8%; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPatients.length === 0 ? `
                  <tr>
                    <td colspan="8" class="text-center py-6 text-muted">No patient records found matching your date, shift, or search query.</td>
                  </tr>
                ` : filteredPatients.map(p => `
                  <tr class="${p.isEmergency ? 'emergency-row' : ''}">
                    <td>
                      <div class="flex items-center gap-1">
                        <span class="patient-id-tag">${p.patientId}</span>
                        ${p.isEmergency ? `<span class="emergency-badge-pulse" title="Emergency Priority">🚨</span>` : ''}
                      </div>
                      <span class="token-sub font-bold text-teal">Token #${p.tokenNo}</span>
                      ${p.visitHistory && p.visitHistory.length > 0 ? `<div class="text-xs text-muted">🔁 ${p.visitHistory.length + 1} Visits</div>` : ''}
                    </td>
                    <td>
                      <strong>${p.name}</strong>
                      <div class="text-xs text-muted">${p.age} Yrs • ${p.gender}</div>
                    </td>
                    <td>
                      <div class="text-xs font-mono font-bold">📅 ${p.registeredDate || ''}</div>
                      <div class="text-xs text-muted font-mono">🕒 ${p.registeredTime || ''}</div>
                      <span class="rec-shift-badge ${p.registeredShift === 'Morning OPD' ? 'shift-morning' : 'shift-evening'}" style="font-size: 0.68rem; padding: 1px 6px;">
                        ${p.registeredShift || 'OPD'}
                      </span>
                    </td>
                    <td class="font-mono text-sm">+91 ${p.phone}</td>
                    <td class="text-xs text-muted" title="${p.address}">${p.address.length > 28 ? p.address.slice(0, 28) + '...' : p.address}</td>
                    <td>
                      <span class="doc-badge-chip ${p.assignedDoctorId === 'dr-rajnikant' ? 'teal' : p.assignedDoctorId === 'dr-priyanka' ? 'blue' : 'emerald'}">
                        ${p.assignedDoctorId === 'dr-rajnikant' ? 'Dr. Rajnikant (Derm)' : p.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka (Anokar)' : 'Dr. Shrutika (Pediatric)'}
                      </span>
                    </td>
                    <td>
                      <span class="status-pill ${p.status === 'Billing Completed' ? 'status-paid' : p.status === 'Prescription Ready' ? 'status-ready' : 'status-waiting'}">
                        ${p.status}
                      </span>
                      ${p.billing && p.billing.pendingBalance > 0 ? `
                        <div class="text-xs text-red font-bold">Due: ₹${p.billing.pendingBalance}</div>
                      ` : ''}
                    </td>
                    <td style="text-align: right;">
                      <div class="action-btn-group">
                        <button type="button" class="btn-voice-caller-sm" data-token="${p.tokenNo}" data-name="${p.name}" data-doc="${p.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka' : p.assignedDoctorId === 'dr-rutika' ? 'Dr. Shrutika' : 'Dr. Rajnikant'}" title="Call Voice Token">
                          📢
                        </button>
                        ${p.status === 'Prescription Ready' ? `
                          <button type="button" class="btn btn-xs btn-primary btn-direct-bill" data-id="${p.patientId}" title="Collect Fees & UPI QR">
                            Bill
                          </button>
                        ` : ''}
                        ${p.status === 'Waiting for Doctor' ? `
                          <button type="button" class="btn btn-xs btn-outline btn-direct-doctor" data-id="${p.patientId}" title="Start Checkup">
                            Attend
                          </button>
                        ` : ''}
                        <button type="button" class="btn-icon-xs btn-print-opd-row" data-id="${p.patientId}" title="Print OPD Slip">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
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

  bindEvents(config) {
    // Tab toggles
    const btnReg = this.container.querySelector('#btn-tab-reg');
    const btnRegistry = this.container.querySelector('#btn-tab-registry');
    if (btnReg) btnReg.addEventListener('click', () => this.setTab('registration'));
    if (btnRegistry) btnRegistry.addEventListener('click', () => this.setTab('registry'));

    // Emergency Toggle
    const btnEmergency = this.container.querySelector('#btn-toggle-emergency');
    if (btnEmergency) {
      btnEmergency.addEventListener('click', () => {
        this.isEmergencyActive = !this.isEmergencyActive;
        btnEmergency.className = `btn-emergency-toggle ${this.isEmergencyActive ? 'active' : ''}`;
        btnEmergency.querySelector('strong').textContent = this.isEmergencyActive ? 'Emergency Priority ON' : 'Emergency / Acute Pain';
        if (this.isEmergencyActive) {
          notificationEngine.vibrate([100, 50, 100]);
        }
      });
    }

    // Locality Chips
    this.container.querySelectorAll('.btn-locality-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const addrInput = this.container.querySelector('#reg-patient-address');
        if (addrInput) {
          addrInput.value = chip.getAttribute('data-loc');
          addrInput.focus();
        }
      });
    });

    // Returning Patient Mobile Auto-Lookup
    const phoneInput = this.container.querySelector('#reg-patient-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().replace(/\D/g, '');
        if (val.length === 10) {
          const match = hospitalDb.findPatientByPhone(val);
          const alertBox = this.container.querySelector('#returning-patient-alert-container');
          if (match) {
            this.recognizedReturningPatient = match;
            const nameIn = this.container.querySelector('#reg-patient-name');
            const ageIn = this.container.querySelector('#reg-patient-age');
            const genIn = this.container.querySelector('#reg-patient-gender');
            const addrIn = this.container.querySelector('#reg-patient-address');

            if (nameIn) nameIn.value = match.name;
            if (ageIn) ageIn.value = match.age;
            if (genIn) genIn.value = match.gender;
            if (addrIn) addrIn.value = match.address;

            if (alertBox) {
              alertBox.innerHTML = `
                <div class="returning-patient-banner animate-fade-in">
                  <span>✓ Returning Patient Recognized: <strong>${match.name}</strong> (ID: <strong>${match.patientId}</strong>)</span>
                  <small>Permanent profile auto-filled. Fresh OPD token for today will be assigned.</small>
                </div>
              `;
            }
            playClinicChime('success');
          } else {
            this.recognizedReturningPatient = null;
            if (alertBox) alertBox.innerHTML = '';
          }
        }
      });
    }

    // Voice Token Caller on Row
    this.container.querySelectorAll('.btn-voice-caller-sm').forEach(btn => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        const name = btn.getAttribute('data-name');
        const doc = btn.getAttribute('data-doc');
        this.callPatientVoice(token, name, doc);
      });
    });

    // Voice Token Caller on Preview Card
    const btnCallLast = this.container.querySelector('#btn-voice-call-last');
    if (btnCallLast && this.lastRegisteredPatient) {
      btnCallLast.addEventListener('click', () => {
        const p = this.lastRegisteredPatient;
        const doc = DOCTORS_ROSTER.find(d => d.id === p.assignedDoctorId) || DOCTORS_ROSTER[0];
        this.callPatientVoice(p.tokenNo, p.name, doc.name);
      });
    }

    // Registration Form Submit
    const form = this.container.querySelector('#patient-registration-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = this.container.querySelector('#reg-patient-name').value;
        const phone = this.container.querySelector('#reg-patient-phone').value;
        const age = this.container.querySelector('#reg-patient-age').value;
        const gender = this.container.querySelector('#reg-patient-gender').value;
        const address = this.container.querySelector('#reg-patient-address').value;
        const reason = this.container.querySelector('#reg-patient-reason').value;
        const doctorRadio = this.container.querySelector('input[name="assignedDoctor"]:checked');
        const assignedDoctorId = doctorRadio ? doctorRadio.value : 'dr-rajnikant';
        const docObj = DOCTORS_ROSTER.find(d => d.id === assignedDoctorId) || DOCTORS_ROSTER[0];

        if (!name.trim() || !phone.trim() || !address.trim()) {
          alert('Please enter Name, Mobile Number, Age, and Residential Address.');
          return;
        }

        const newPatient = hospitalDb.registerPatient({
          name,
          phone,
          age,
          gender,
          address,
          assignedDoctorId,
          reason,
          isEmergency: this.isEmergencyActive,
          existingPatientId: this.recognizedReturningPatient ? this.recognizedReturningPatient.patientId : null
        });

        this.lastRegisteredPatient = newPatient;
        this.recognizedReturningPatient = null;
        this.isEmergencyActive = false;

        playClinicChime('queue-call');
        try {
          confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        } catch (err) {}

        // Broadcast real-time live notification to Doctor & Pharmacy!
        notificationEngine.notify({
          type: 'PATIENT_REGISTERED',
          title: newPatient.isEmergency ? '🚨 EMERGENCY Patient in Queue!' : '🏥 New Patient in Waiting Queue',
          message: `Token #${newPatient.tokenNo} - ${newPatient.name} assigned to ${docObj.name}`,
          icon: newPatient.isEmergency ? '🚨' : '🏥',
          isEmergency: newPatient.isEmergency,
          actionText: 'Attend Patient',
          onAction: () => {
            this.onNavigate('doctor', newPatient.patientId);
          }
        });

        this.render();
      });
    }

    // Doctor Radio Card Styles
    this.container.querySelectorAll('.doc-radio-card input').forEach(radio => {
      radio.addEventListener('change', () => {
        this.container.querySelectorAll('.doc-radio-card').forEach(c => c.classList.remove('checked'));
        radio.closest('.doc-radio-card').classList.add('checked');
      });
    });

    // Last registered slip print
    const btnPrintLast = this.container.querySelector('#btn-print-last-opd');
    if (btnPrintLast && this.lastRegisteredPatient) {
      btnPrintLast.addEventListener('click', () => {
        printOpdSlip(this.lastRegisteredPatient, config);
      });
    }

    // Go to doctor checkup
    const btnGoCheckup = this.container.querySelector('#btn-go-to-doctor-checkup');
    if (btnGoCheckup && this.lastRegisteredPatient) {
      btnGoCheckup.addEventListener('click', () => {
        this.onNavigate('doctor', this.lastRegisteredPatient.patientId);
      });
    }

    // Search input
    const searchInput = this.container.querySelector('#registry-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const reInput = this.container.querySelector('#registry-search-input');
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(reInput.value.length, reInput.value.length);
        }
      });
    }

    // Status filter pills
    this.container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.statusFilter = pill.getAttribute('data-status');
        this.render();
      });
    });

    // Date filter pills
    this.container.querySelectorAll('.rec-date-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.dateFilter = pill.getAttribute('data-date');
        this.render();
      });
    });

    const regDatePicker = this.container.querySelector('#registry-date-picker');
    if (regDatePicker) {
      regDatePicker.addEventListener('change', (e) => {
        this.dateFilter = e.target.value || 'all';
        this.render();
      });
    }

    const regShiftSelect = this.container.querySelector('#registry-shift-select');
    if (regShiftSelect) {
      regShiftSelect.addEventListener('change', (e) => {
        this.shiftFilter = e.target.value;
        this.render();
      });
    }

    // Direct actions on table rows
    this.container.querySelectorAll('.btn-direct-bill').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        this.onNavigate('billing', pid);
      });
    });

    this.container.querySelectorAll('.btn-direct-doctor').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        this.onNavigate('doctor', pid);
      });
    });

    this.container.querySelectorAll('.btn-print-opd-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) printOpdSlip(p, config);
      });
    });
  }
}
