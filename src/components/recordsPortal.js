// Comprehensive Medical Records Storage & Historical Archive (MRD)
// Multi-Criteria Search: Date, Time/Shift, Patient Name, Mobile Number, UHID, Doctor & Clinical Diagnosis
// Includes 1-Page A4 Prescription Printing, Invoice Printing, CSV/JSON Export & Data Restore

import { hospitalDb, DOCTORS_ROSTER, formatDateYMD } from '../data/hospitalDb.js';
import { printPrescription, printInvoice, printOpdSlip } from './printManager.js';
import { playClinicChime } from '../utils/audio.js';
import { notificationEngine } from '../utils/notificationEngine.js';

export class RecordsPortal {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate || (() => {});
    
    // Filter State
    this.searchQuery = '';
    this.selectedDate = ''; // 'YYYY-MM-DD' or '' for all
    this.quickDate = 'all'; // 'all', 'today', 'yesterday', 'week', 'month'
    this.selectedShift = 'all'; // 'all', 'Morning OPD', 'Evening OPD'
    this.selectedDoctor = 'all';
    this.selectedStatus = 'all';
    this.viewMode = 'table'; // 'table' or 'cards'
    
    // Selected record for Full Case Sheet Modal
    this.modalPatientId = null;

    this.render();
  }

  setFilters(filters = {}) {
    Object.assign(this, filters);
    this.render();
  }

  getFilteredPatients() {
    let dateToFilter = this.selectedDate;

    // Handle quick date buttons
    const todayStr = formatDateYMD(new Date());
    if (this.quickDate === 'today') {
      dateToFilter = todayStr;
    } else if (this.quickDate === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      dateToFilter = formatDateYMD(y);
    }

    return hospitalDb.searchMedicalRecords({
      query: this.searchQuery,
      date: dateToFilter,
      shift: this.selectedShift,
      doctorId: this.selectedDoctor,
      status: this.selectedStatus
    });
  }

  render() {
    const stats = hospitalDb.getStorageStats();
    const config = hospitalDb.getConfig();
    const filtered = this.getFilteredPatients();
    const modalPatient = this.modalPatientId ? hospitalDb.getPatientById(this.modalPatientId) : null;
    const todayStr = formatDateYMD(new Date());

    this.container.innerHTML = `
      <div class="records-portal-layout">
        <!-- Portal Header -->
        <div class="portal-header-row">
          <div>
            <div class="section-tag-pill teal">Medical Records Storage (MRD) & Historical Archives</div>
            <h2 class="portal-title">Patient Medical Records & Case History Vault</h2>
            <p class="portal-subtitle">Exact Date & Time Records • Real-Time Multi-Filter • 1-Page A4 Printout • CSV & JSON Export</p>
          </div>

          <!-- Vault Actions -->
          <div class="header-action-group">
            <button type="button" class="btn btn-outline btn-sm" id="btn-export-records-csv" title="Download spreadsheet of all records">
              📥 Export CSV (Excel)
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-export-records-json" title="Download complete JSON database backup">
              💾 Backup JSON
            </button>
            <label class="btn btn-outline btn-sm cursor-pointer" title="Restore patient records from a JSON file">
              📤 Restore File
              <input type="file" id="input-restore-records" accept=".json" style="display: none;" />
            </label>
          </div>
        </div>

        <!-- Storage Metrics Ribbon -->
        <div class="records-stats-strip">
          <div class="rec-stat-card">
            <span class="rec-stat-num">${stats.totalRecords}</span>
            <span class="rec-stat-label">Total Stored Records</span>
          </div>
          <div class="rec-stat-card">
            <span class="rec-stat-num">${filtered.length}</span>
            <span class="rec-stat-label">Records Matching Search</span>
          </div>
          <div class="rec-stat-card">
            <span class="rec-stat-num">${stats.oldestDate.slice(5) || 'All'} to ${stats.newestDate.slice(5) || 'Today'}</span>
            <span class="rec-stat-label">Archive Date Span</span>
          </div>
          <div class="rec-stat-card">
            <span class="rec-stat-num ${stats.neonConnected ? 'text-teal' : 'text-blue'}">${stats.neonConnected ? '✓ Neon Synced' : '● Local + Ready'}</span>
            <span class="rec-stat-label">Vault Storage Integrity</span>
          </div>
        </div>

        <!-- Comprehensive Date & Time Search Controls -->
        <div class="records-filter-card">
          <div class="rec-filter-grid">
            <!-- 1. Text Search Input -->
            <div class="rec-filter-col-wide">
              <label class="rec-filter-label">Search Patient Records</label>
              <div class="doc-queue-search-wrap">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  id="records-search-input" 
                  class="form-input form-input-sm" 
                  placeholder="Search by Name, 10-Digit Mobile, UHID (e.g. CSD-P1001), Diagnosis, or RVG..." 
                  value="${this.searchQuery}" 
                  autocomplete="off"
                />
                ${this.searchQuery ? `<button type="button" class="search-clear-btn" id="btn-clear-record-search">✕</button>` : ''}
              </div>
            </div>

            <!-- 2. Exact Calendar Date Picker -->
            <div class="rec-filter-col">
              <label class="rec-filter-label">Select Specific Date</label>
              <input 
                type="date" 
                id="records-date-picker" 
                class="form-input form-input-sm" 
                value="${this.selectedDate}"
              />
            </div>

            <!-- 3. OPD Time / Shift -->
            <div class="rec-filter-col">
              <label class="rec-filter-label">OPD Time / Shift</label>
              <select id="records-shift-select" class="form-select form-input-sm">
                <option value="all" ${this.selectedShift === 'all' ? 'selected' : ''}>All Hours / Shifts</option>
                <option value="Morning OPD" ${this.selectedShift === 'Morning OPD' ? 'selected' : ''}>Morning OPD (09:00 - 13:30)</option>
                <option value="Evening OPD" ${this.selectedShift === 'Evening OPD' ? 'selected' : ''}>Evening OPD (17:00 - 21:30)</option>
              </select>
            </div>

            <!-- 4. Consulting Doctor -->
            <div class="rec-filter-col">
              <label class="rec-filter-label">Consulting Doctor</label>
              <select id="records-doctor-select" class="form-select form-input-sm">
                <option value="all" ${this.selectedDoctor === 'all' ? 'selected' : ''}>All Doctors & Specialists</option>
                ${DOCTORS_ROSTER.map(d => `
                  <option value="${d.id}" ${this.selectedDoctor === d.id ? 'selected' : ''}>${d.name.split(' ')[1]} (${d.department.split('&')[0]})</option>
                `).join('')}
              </select>
            </div>

            <!-- 5. Status -->
            <div class="rec-filter-col">
              <label class="rec-filter-label">Case Status</label>
              <select id="records-status-select" class="form-select form-input-sm">
                <option value="all" ${this.selectedStatus === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="Billing Completed" ${this.selectedStatus === 'Billing Completed' ? 'selected' : ''}>Billing Completed / Done</option>
                <option value="Prescription Ready" ${this.selectedStatus === 'Prescription Ready' ? 'selected' : ''}>Prescription Ready</option>
                <option value="Waiting for Doctor" ${this.selectedStatus === 'Waiting for Doctor' ? 'selected' : ''}>Waiting for Doctor</option>
              </select>
            </div>
          </div>

          <!-- Quick Date Pills Strip -->
          <div class="records-quick-pills mt-2">
            <span class="text-xs font-semibold text-muted mr-1">Quick Date:</span>
            <button type="button" class="q-filter-pill ${this.quickDate === 'all' && !this.selectedDate ? 'active' : ''}" data-qdate="all">
              All Dates (${stats.totalRecords})
            </button>
            <button type="button" class="q-filter-pill ${this.quickDate === 'today' ? 'active' : ''}" data-qdate="today">
              Today (${todayStr})
            </button>
            <button type="button" class="q-filter-pill ${this.quickDate === 'yesterday' ? 'active' : ''}" data-qdate="yesterday">
              Yesterday
            </button>
            ${(this.selectedDate || this.searchQuery || this.selectedShift !== 'all' || this.selectedDoctor !== 'all' || this.selectedStatus !== 'all') ? `
              <button type="button" class="btn btn-xs btn-outline ml-auto" id="btn-reset-all-filters">
                ✕ Reset All Filters
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Records Table & Cards Section -->
        <div class="table-card mt-3">
          <div class="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 class="card-title text-base">Archived Case Sheets & Medical Records</h3>
              <p class="text-xs text-muted">Showing <strong>${filtered.length}</strong> records matching criteria</p>
            </div>
            <div class="records-view-toggle">
              <button type="button" class="btn btn-xs ${this.viewMode === 'table' ? 'btn-teal' : 'btn-outline'}" id="btn-view-table">
                ☰ Table View
              </button>
              <button type="button" class="btn btn-xs ${this.viewMode === 'cards' ? 'btn-teal' : 'btn-outline'}" id="btn-view-cards">
                ▦ Case Cards
              </button>
            </div>
          </div>

          ${filtered.length === 0 ? `
            <div class="empty-queue-box my-6">
              <span>🔍</span>
              <p>No patient records found matching the specified date, time, doctor, or keyword.</p>
              <button type="button" class="btn btn-sm btn-teal mt-2" id="btn-empty-reset">View All Records</button>
            </div>
          ` : this.viewMode === 'table' ? `
            <div class="table-responsive mt-3">
              <table class="hospital-table">
                <thead>
                  <tr>
                    <th style="width: 13%;">UHID / Token</th>
                    <th style="width: 15%;">Date & Time</th>
                    <th style="width: 18%;">Patient Profile</th>
                    <th style="width: 14%;">Doctor & Dept</th>
                    <th style="width: 22%;">Clinical Diagnosis & Findings</th>
                    <th style="width: 8%;">Billing</th>
                    <th style="width: 10%; text-align: right;">Medical Docs</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(p => {
                    const doc = DOCTORS_ROSTER.find(d => d.id === p.assignedDoctorId);
                    const docName = doc ? doc.name.split(' ')[1] : 'OPD';
                    return `
                      <tr>
                        <td>
                          <span class="patient-id-tag">${p.patientId}</span>
                          <div class="token-sub font-bold text-teal">Token #${p.tokenNo}</div>
                          ${p.isEmergency ? `<span class="cqr-badge-red text-xs">EMERGENCY</span>` : ''}
                        </td>
                        <td>
                          <div class="font-bold text-xs text-slate-800">📅 ${p.registeredDate || p.registeredAt?.split(' ')[0]}</div>
                          <div class="text-xs text-muted">⏰ ${p.registeredTime || p.registeredAt?.split(' ').slice(1).join(' ')}</div>
                          <div class="rec-shift-badge">${p.registeredShift || 'Morning OPD'}</div>
                        </td>
                        <td>
                          <strong class="text-sm text-slate-900">${p.name}</strong>
                          <div class="text-xs text-slate-600">${p.age}y • ${p.gender}</div>
                          <div class="font-mono text-xs font-semibold text-teal-dark">📞 ${p.phone}</div>
                          <div class="text-xs text-muted truncate" style="max-width: 180px;" title="${p.address}">${p.address}</div>
                        </td>
                        <td>
                          <span class="cqr-doc-chip ${p.assignedDoctorId}">${docName}</span>
                          <div class="text-xs text-muted mt-1">${doc ? doc.department.split('&')[0] : ''}</div>
                        </td>
                        <td>
                          <div class="text-xs font-bold text-slate-900">${p.clinicalNotes?.diagnosis || '<span class="text-muted italic">Awaiting consultation</span>'}</div>
                          ${p.clinicalNotes?.treatmentDone ? `<div class="text-xs text-slate-600 mt-1">🩺 ${p.clinicalNotes.treatmentDone}</div>` : ''}
                          ${p.externalRvgId ? `<div class="rvg-tag-inline mt-1">RVG ID: ${p.externalRvgId}</div>` : ''}
                          ${p.prescription?.medicines && p.prescription.medicines.length > 0 ? `
                            <div class="rec-med-pills mt-1">
                              ${p.prescription.medicines.slice(0, 2).map(m => `<span class="rec-med-chip">℞ ${m.name.split(' ')[0]}</span>`).join('')}
                              ${p.prescription.medicines.length > 2 ? `<span class="rec-med-chip">+${p.prescription.medicines.length - 2} more</span>` : ''}
                            </div>
                          ` : ''}
                        </td>
                        <td>
                          <span class="status-pill ${p.billing && p.billing.paymentStatus === 'Paid' ? 'status-paid' : p.billing && p.billing.paymentStatus === 'Partial' ? 'status-partial' : 'status-waiting'}">
                            ${p.billing ? `${p.billing.paymentStatus}` : 'Unbilled'}
                          </span>
                          ${p.billing ? `<div class="text-xs font-bold mt-1">₹${p.billing.totalAmount}</div>` : ''}
                        </td>
                        <td style="text-align: right;">
                          <div class="action-btn-group justify-end">
                            <button type="button" class="btn-icon-xs btn-open-casesheet" data-id="${p.patientId}" title="View Full Clinical Case Sheet">
                              👁️
                            </button>
                            <button type="button" class="btn-icon-xs btn-record-goto-doc" data-id="${p.patientId}" title="Open Consultation in Doctor EMR">
                              🩺
                            </button>
                            <button type="button" class="btn-icon-xs btn-record-goto-bill" data-id="${p.patientId}" title="Open Invoice in Billing Desk">
                              💳
                            </button>
                            ${p.prescription ? `
                              <button type="button" class="btn-icon-xs btn-print-record-rx" data-id="${p.patientId}" title="Print 1-Page A4 Prescription">
                                🖨️
                              </button>
                            ` : ''}
                            ${p.billing ? `
                              <button type="button" class="btn-icon-xs btn-print-record-inv" data-id="${p.patientId}" title="Print Invoice Receipt">
                                🧾
                              </button>
                            ` : ''}
                            <button type="button" class="btn-icon-xs btn-print-record-opd" data-id="${p.patientId}" title="Print OPD Slip">
                              📄
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <!-- Case Cards Grid View -->
            <div class="records-card-grid mt-3">
              ${filtered.map(p => {
                const doc = DOCTORS_ROSTER.find(d => d.id === p.assignedDoctorId);
                return `
                  <div class="record-case-card animate-fade-in ${p.isEmergency ? 'emergency-card' : ''}">
                    <div class="rcc-head">
                      <div>
                        <span class="patient-id-tag">${p.patientId}</span>
                        <strong class="ml-1 text-teal">Token #${p.tokenNo}</strong>
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-xs">📅 ${p.registeredDate}</div>
                        <div class="text-xs text-muted">⏰ ${p.registeredTime} (${p.registeredShift || 'Morning'})</div>
                      </div>
                    </div>

                    <div class="rcc-body">
                      <h4 class="rcc-name">${p.name}</h4>
                      <div class="text-xs text-slate-600 mb-2">
                        ${p.age}y / ${p.gender} • 📞 <span class="font-mono font-semibold">${p.phone}</span> • ${p.address}
                      </div>

                      <div class="rcc-doc-strip">
                        <span class="cqr-doc-chip ${p.assignedDoctorId}">${doc ? doc.name : p.assignedDoctorId}</span>
                        <span class="status-tag-sm ${p.status === 'Billing Completed' ? 'teal' : 'amber'}">${p.status}</span>
                      </div>

                      <div class="rcc-clinical-box">
                        <div class="text-xs font-bold text-slate-900">Diagnosis:</div>
                        <p class="text-xs text-slate-800 m-0 font-medium">${p.clinicalNotes?.diagnosis || 'Pending doctor examination'}</p>
                        ${p.clinicalNotes?.treatmentDone ? `<p class="text-xs text-slate-600 mt-1 m-0"><strong>Procedure:</strong> ${p.clinicalNotes.treatmentDone}</p>` : ''}
                        ${p.externalRvgId ? `<div class="rvg-tag-inline mt-1">RVG ID: ${p.externalRvgId}</div>` : ''}
                      </div>

                      ${p.prescription?.medicines && p.prescription.medicines.length > 0 ? `
                        <div class="rcc-rx-strip">
                          <span class="text-xs font-bold text-teal">℞ Rx (${p.prescription.medicines.length} drugs):</span>
                          <div class="rec-med-pills">
                            ${p.prescription.medicines.map(m => `<span class="rec-med-chip">${m.name} (${m.duration})</span>`).join('')}
                          </div>
                        </div>
                      ` : ''}

                      ${p.billing ? `
                        <div class="rcc-billing-strip">
                          <span>Total: <strong>₹${p.billing.totalAmount}</strong></span>
                          <span>Paid: <strong class="text-teal">₹${p.billing.paidAmount !== undefined ? p.billing.paidAmount : p.billing.totalAmount}</strong> (${p.billing.paymentMethod || 'UPI'})</span>
                          ${p.billing.upiTxnRef ? `<span class="font-mono text-xs">Ref: ${p.billing.upiTxnRef}</span>` : ''}
                        </div>
                      ` : ''}
                    </div>

                    <div class="rcc-footer">
                      <button type="button" class="btn btn-xs btn-teal btn-open-casesheet" data-id="${p.patientId}">
                        👁️ View Case Sheet
                      </button>
                      <div class="flex gap-1">
                        ${p.prescription ? `
                          <button type="button" class="btn btn-xs btn-outline btn-print-record-rx" data-id="${p.patientId}" title="Print 1-Page A4 Rx">
                            🖨️ Rx
                          </button>
                        ` : ''}
                        ${p.billing ? `
                          <button type="button" class="btn btn-xs btn-outline btn-print-record-inv" data-id="${p.patientId}" title="Print Receipt">
                            🧾 Bill
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- ========================================================
             FULL CLINICAL CASE SHEET & MEDICAL AUDIT MODAL
             ======================================================== -->
        ${modalPatient ? `
          <div class="casesheet-modal-overlay animate-fade-in" id="modal-overlay">
            <div class="casesheet-modal-card">
              <div class="casesheet-modal-head">
                <div>
                  <div class="section-tag-pill teal">Official Medical Record & Case Sheet</div>
                  <h3 class="modal-title">${modalPatient.name} (${modalPatient.patientId})</h3>
                  <p class="text-xs text-muted">Token #${modalPatient.tokenNo} • Registered on ${modalPatient.registeredAt} • ${modalPatient.registeredShift || 'Morning OPD'}</p>
                </div>
                <button type="button" class="modal-close-btn" id="btn-close-modal">✕</button>
              </div>

              <div class="casesheet-modal-body">
                <!-- Patient Demographics Summary -->
                <div class="cs-demographics-grid">
                  <div><strong>Age / Gender:</strong> ${modalPatient.age} Years • ${modalPatient.gender}</div>
                  <div><strong>Mobile Phone:</strong> <span class="font-mono font-bold">+91 ${modalPatient.phone}</span></div>
                  <div><strong>Address / Locality:</strong> ${modalPatient.address}</div>
                  <div><strong>Consulting Doctor:</strong> ${DOCTORS_ROSTER.find(d => d.id === modalPatient.assignedDoctorId)?.name || modalPatient.assignedDoctorId}</div>
                  ${modalPatient.criticalAlerts && modalPatient.criticalAlerts.length > 0 ? `
                    <div class="col-span-2 text-red font-bold">⚠️ Critical Alerts: ${modalPatient.criticalAlerts.join(', ')}</div>
                  ` : ''}
                </div>

                <!-- Timeline Audit Trail -->
                <div class="cs-timeline-box mt-3">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-muted mb-2">Chronological Care Timeline</h4>
                  <div class="timeline-steps">
                    <div class="t-step active">
                      <span class="t-dot">1</span>
                      <div>
                        <strong>OPD Registration</strong>
                        <span class="text-xs block text-muted">${modalPatient.registeredAt} (${modalPatient.registeredShift || 'OPD'})</span>
                      </div>
                    </div>
                    <div class="t-step ${modalPatient.clinicalNotes ? 'active' : ''}">
                      <span class="t-dot">2</span>
                      <div>
                        <strong>Doctor Examination</strong>
                        <span class="text-xs block text-muted">${modalPatient.clinicalNotes?.checkupDate || 'Awaiting'}</span>
                      </div>
                    </div>
                    <div class="t-step ${modalPatient.prescription ? 'active' : ''}">
                      <span class="t-dot">3</span>
                      <div>
                        <strong>Prescription Issued</strong>
                        <span class="text-xs block text-muted">${modalPatient.prescription?.prescribedAt || 'Awaiting'}</span>
                      </div>
                    </div>
                    <div class="t-step ${modalPatient.billing?.paymentStatus === 'Paid' ? 'active' : ''}">
                      <span class="t-dot">4</span>
                      <div>
                        <strong>Billing & Payment</strong>
                        <span class="text-xs block text-muted">${modalPatient.billing?.billedAt ? `${modalPatient.billing.billedAt} (${modalPatient.billing.paymentMethod})` : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Clinical Diagnosis & Findings -->
                <div class="cs-section mt-3">
                  <h4 class="cs-sec-title">Clinical Findings & Diagnosis</h4>
                  <div class="cs-sec-content">
                    <p><strong>Chief Complaints:</strong> ${modalPatient.clinicalNotes?.chiefComplaints || modalPatient.reason || 'None logged'}</p>
                    <p><strong>Clinical Findings:</strong> ${modalPatient.clinicalNotes?.clinicalFindings || 'Routine consultation'}</p>
                    <p><strong>Definitive Diagnosis:</strong> <span class="font-bold text-teal">${modalPatient.clinicalNotes?.diagnosis || 'Awaiting checkup'}</span></p>
                    ${modalPatient.clinicalNotes?.treatmentDone ? `<p><strong>Clinical Treatment Done:</strong> ${modalPatient.clinicalNotes.treatmentDone}</p>` : ''}
                    ${modalPatient.externalRvgId ? `<p><strong>External X-Ray / RVG ID:</strong> ${modalPatient.externalRvgId}</p>` : ''}
                  </div>
                </div>

                <!-- ℞ Prescribed Medications Table -->
                <div class="cs-section mt-3">
                  <h4 class="cs-sec-title">℞ Prescribed Medicines</h4>
                  ${modalPatient.prescription?.medicines && modalPatient.prescription.medicines.length > 0 ? `
                    <table class="cs-med-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Medicine & Form</th>
                          <th>Dosage Frequency</th>
                          <th>Duration</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${modalPatient.prescription.medicines.map((m, idx) => `
                          <tr>
                            <td>${idx + 1}</td>
                            <td><strong>${m.name}</strong> <span class="text-xs text-muted">(${m.type || 'Tablet'})</span></td>
                            <td><span class="freq-tag">${m.frequency}</span></td>
                            <td>${m.duration}</td>
                            <td>${m.instructions}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  ` : `
                    <p class="text-xs text-muted">No medicines prescribed for this consultation.</p>
                  `}
                  ${modalPatient.prescription?.specialAdvice ? `
                    <div class="mt-2 text-xs p-2 bg-slate-50 rounded border">
                      <strong>Doctor Advice:</strong> ${modalPatient.prescription.specialAdvice}
                      ${modalPatient.prescription.followUpDate ? ` • <strong>Next Follow-up Date:</strong> ${modalPatient.prescription.followUpDate}` : ''}
                    </div>
                  ` : ''}
                </div>

                <!-- Billing & Payment Statement -->
                ${modalPatient.billing ? `
                  <div class="cs-section mt-3">
                    <h4 class="cs-sec-title">Financial & Invoice Statement (${modalPatient.billing.invoiceId})</h4>
                    <div class="cs-sec-content grid grid-cols-2 gap-2 text-xs">
                      <div>Consultation Fee: <strong>₹ ${modalPatient.billing.consultationFee}</strong></div>
                      <div>Procedure Fee: <strong>₹ ${modalPatient.billing.procedureFee}</strong></div>
                      <div>Consumables Fee: <strong>₹ ${modalPatient.billing.medicineFee}</strong></div>
                      <div>Total Bill Amount: <strong>₹ ${modalPatient.billing.totalAmount}</strong></div>
                      <div>Amount Paid: <strong class="text-teal">₹ ${modalPatient.billing.paidAmount !== undefined ? modalPatient.billing.paidAmount : modalPatient.billing.totalAmount}</strong></div>
                      <div>Payment Mode: <strong>${modalPatient.billing.paymentMethod || 'Pending'}</strong></div>
                      ${modalPatient.billing.upiTxnRef ? `<div class="col-span-2 font-mono">UPI Ref: ${modalPatient.billing.upiTxnRef}</div>` : ''}
                    </div>
                  </div>
                ` : ''}

                <!-- Historical Past Visits Log (if returning patient) -->
                ${modalPatient.visitHistory && modalPatient.visitHistory.length > 1 ? `
                  <div class="cs-section mt-3">
                    <h4 class="cs-sec-title">Previous Consultations History (${modalPatient.visitHistory.length} Visits)</h4>
                    <div class="cs-sec-content">
                      ${modalPatient.visitHistory.map((v, i) => `
                        <div class="p-2 border-b text-xs flex justify-between">
                          <div>
                            <strong>Visit #${i + 1} • ${v.date} ${v.time} (${v.shift})</strong>
                            <div class="text-slate-700">${v.diagnosis || 'General Consultation'} • ${v.doctorName}</div>
                          </div>
                          <span class="text-teal font-bold">${v.treatmentDone || 'Prescribed'}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- Modal Action Bar -->
              <div class="casesheet-modal-footer">
                <button type="button" class="btn btn-outline btn-sm" id="btn-modal-close-bottom">
                  Close Case Sheet
                </button>
                <div class="flex gap-2 flex-wrap">
                  <button type="button" class="btn btn-outline btn-sm" id="btn-modal-goto-doc" data-id="${modalPatient.patientId}">
                    🩺 Doctor EMR
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-modal-goto-bill" data-id="${modalPatient.patientId}">
                    💳 Billing Desk
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-modal-print-opd" data-id="${modalPatient.patientId}">
                    📄 Print OPD Slip
                  </button>
                  ${modalPatient.billing ? `
                    <button type="button" class="btn btn-outline btn-sm" id="btn-modal-print-inv" data-id="${modalPatient.patientId}">
                      🧾 Print Invoice
                    </button>
                  ` : ''}
                  ${modalPatient.prescription ? `
                    <button type="button" class="btn btn-teal btn-sm" id="btn-modal-print-rx" data-id="${modalPatient.patientId}">
                      🖨️ Print 1-Page A4 Rx
                    </button>
                  ` : ''}
                  <button type="button" class="btn btn-outline btn-sm" id="btn-modal-wa" data-id="${modalPatient.patientId}">
                    💬 WhatsApp Case Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents(config);
  }

  bindEvents(config) {
    // 1. Live text search
    const searchInput = this.container.querySelector('#records-search-input');
    const btnClearSearch = this.container.querySelector('#btn-clear-record-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const reInput = this.container.querySelector('#records-search-input');
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(reInput.value.length, reInput.value.length);
        }
      });
    }
    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        this.render();
      });
    }

    // 2. Exact Calendar Date Picker
    const datePicker = this.container.querySelector('#records-date-picker');
    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.quickDate = ''; // custom date overrides quick date
        this.render();
      });
    }

    // 3. Quick Date Pills
    this.container.querySelectorAll('.q-filter-pill[data-qdate]').forEach(pill => {
      pill.addEventListener('click', () => {
        this.quickDate = pill.getAttribute('data-qdate');
        this.selectedDate = '';
        this.render();
      });
    });

    // 4. Shift selector
    const shiftSelect = this.container.querySelector('#records-shift-select');
    if (shiftSelect) {
      shiftSelect.addEventListener('change', (e) => {
        this.selectedShift = e.target.value;
        this.render();
      });
    }

    // 5. Doctor selector
    const docSelect = this.container.querySelector('#records-doctor-select');
    if (docSelect) {
      docSelect.addEventListener('change', (e) => {
        this.selectedDoctor = e.target.value;
        this.render();
      });
    }

    // 6. Status selector
    const statusSelect = this.container.querySelector('#records-status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.selectedStatus = e.target.value;
        this.render();
      });
    }

    // 7. Reset filters
    const btnReset = this.container.querySelector('#btn-reset-all-filters');
    const btnEmptyReset = this.container.querySelector('#btn-empty-reset');
    [btnReset, btnEmptyReset].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedDate = '';
          this.quickDate = 'all';
          this.selectedShift = 'all';
          this.selectedDoctor = 'all';
          this.selectedStatus = 'all';
          this.render();
        });
      }
    });

    // 8. View Mode toggle
    const btnTbl = this.container.querySelector('#btn-view-table');
    const btnCrd = this.container.querySelector('#btn-view-cards');
    if (btnTbl) {
      btnTbl.addEventListener('click', () => {
        this.viewMode = 'table';
        this.render();
      });
    }
    if (btnCrd) {
      btnCrd.addEventListener('click', () => {
        this.viewMode = 'cards';
        this.render();
      });
    }

    // 9. Open Case Sheet Modal
    this.container.querySelectorAll('.btn-open-casesheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.modalPatientId = btn.getAttribute('data-id');
        playClinicChime('click');
        this.render();
      });
    });

    // 10. Close Modal
    const btnCloseModal = this.container.querySelector('#btn-close-modal');
    const btnCloseModalBtm = this.container.querySelector('#btn-modal-close-bottom');
    const overlay = this.container.querySelector('#modal-overlay');
    [btnCloseModal, btnCloseModalBtm].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.modalPatientId = null;
          this.render();
        });
      }
    });
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.modalPatientId = null;
          this.render();
        }
      });
    }

    // 11. Print Actions
    this.container.querySelectorAll('.btn-print-record-rx, #btn-modal-print-rx').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) {
          playClinicChime('click');
          printPrescription(p, 'en', hospitalDb.getConfig());
        }
      });
    });

    this.container.querySelectorAll('.btn-print-record-inv, #btn-modal-print-inv').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) {
          playClinicChime('click');
          printInvoice(p, hospitalDb.getConfig());
        }
      });
    });

    this.container.querySelectorAll('.btn-print-record-opd, #btn-modal-print-opd').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (p) {
          playClinicChime('click');
          printOpdSlip(p, hospitalDb.getConfig());
        }
      });
    });

    // Cross-Portal Navigation from Records
    this.container.querySelectorAll('.btn-record-goto-doc, #btn-modal-goto-doc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-id');
        if (this.modalPatientId) {
          this.modalPatientId = null;
        }
        playClinicChime('click');
        this.onNavigate('doctor', pid);
      });
    });

    this.container.querySelectorAll('.btn-record-goto-bill, #btn-modal-goto-bill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-id');
        if (this.modalPatientId) {
          this.modalPatientId = null;
        }
        playClinicChime('click');
        this.onNavigate('billing', pid);
      });
    });

    // 12. WhatsApp Case Summary
    const btnModalWa = this.container.querySelector('#btn-modal-wa');
    if (btnModalWa) {
      btnModalWa.addEventListener('click', () => {
        const pid = btnModalWa.getAttribute('data-id');
        const p = hospitalDb.getPatientById(pid);
        if (!p) return;

        const doc = DOCTORS_ROSTER.find(d => d.id === p.assignedDoctorId);
        const msg = encodeURIComponent(
          `*Official Medical Summary - ${config.hospitalName}*\n` +
          `Shriram Chowk, Farshi Road, Khamgaon\n\n` +
          `Patient: ${p.name} (${p.patientId})\n` +
          `Visit Date: ${p.registeredDate} ${p.registeredTime} (${p.registeredShift || 'Morning OPD'})\n` +
          `Consulting Doctor: ${doc ? doc.name : 'Specialist'}\n` +
          `Diagnosis: ${p.clinicalNotes?.diagnosis || 'OPD Consultation'}\n` +
          `${p.clinicalNotes?.treatmentDone ? `Procedure Done: ${p.clinicalNotes.treatmentDone}\n` : ''}` +
          `${p.externalRvgId ? `External RVG ID: ${p.externalRvgId}\n` : ''}` +
          `-------------------------------\n` +
          `Prescribed Medicines: ${p.prescription?.medicines ? p.prescription.medicines.map(m => `\n- ${m.name} (${m.frequency}, ${m.duration})`).join('') : 'None'}\n` +
          `${p.prescription?.specialAdvice ? `\nDoctor Advice: ${p.prescription.specialAdvice}\n` : ''}` +
          `${p.prescription?.followUpDate ? `Next Follow-Up Date: ${p.prescription.followUpDate}\n` : ''}` +
          `-------------------------------\n` +
          `Hospital Helpline: +91 90498 83983\n` +
          `Official UPI VPA: ${config.upiId}`
        );
        window.open(`https://wa.me/91${p.phone}?text=${msg}`, '_blank');
      });
    }

    // 13. CSV Export
    const btnExportCsv = this.container.querySelector('#btn-export-records-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        playClinicChime('success');
        const csvContent = hospitalDb.exportRecordsAsCsv();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chaudhari_Clinic_Medical_Records_${formatDateYMD(new Date())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        notificationEngine.notify({
          type: 'INFO',
          title: '📥 CSV Export Successful',
          message: 'Downloaded complete medical records spreadsheet.',
          icon: '📥'
        });
      });
    }

    // 14. JSON Backup
    const btnExportJson = this.container.querySelector('#btn-export-records-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        playClinicChime('success');
        const jsonContent = hospitalDb.exportRecordsAsJson();
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chaudhari_Clinic_Database_Backup_${formatDateYMD(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(url);
        notificationEngine.notify({
          type: 'INFO',
          title: '💾 Database Backup Downloaded',
          message: 'Saved complete JSON medical archive backup.',
          icon: '💾'
        });
      });
    }

    // 15. Restore Records from JSON
    const inputRestore = this.container.querySelector('#input-restore-records');
    if (inputRestore) {
      inputRestore.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = hospitalDb.importRecordsFromJson(event.target.result);
          if (res.success) {
            playClinicChime('success');
            notificationEngine.notify({
              type: 'INFO',
              title: '📤 Records Restored Successfully',
              message: `Restored ${res.count} patient medical records from file.`,
              icon: '📤'
            });
            this.render();
          } else {
            alert('Restore failed: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }
  }
}
