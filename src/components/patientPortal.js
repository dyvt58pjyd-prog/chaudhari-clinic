import { CURRENT_PATIENT, INITIAL_PATIENT_APPOINTMENTS, MULTI_SESSION_TRACKERS, DIGITAL_PRESCRIPTIONS } from '../data/mockData.js';

export class PatientPortal {
  constructor(containerEl, onBookNewClick) {
    this.container = containerEl;
    this.onBookNewClick = onBookNewClick || (() => {});
    this.patient = CURRENT_PATIENT;
    this.appointments = [...INITIAL_PATIENT_APPOINTMENTS];
    this.trackers = [...MULTI_SESSION_TRACKERS];
    this.prescriptions = [...DIGITAL_PRESCRIPTIONS];
    this.activeTab = 'appointments'; // 'appointments', 'journeys', 'prescriptions', 'records'
    this.render();
  }

  addAppointment(booking) {
    const newApt = {
      id: booking.appointmentId,
      doctorId: booking.doctor.id,
      doctorName: booking.doctor.name,
      doctorRole: booking.doctor.shortRole,
      doctorDept: booking.doctor.deptLabel,
      doctorImage: booking.doctor.image,
      treatment: booking.treatment.title,
      date: `${booking.date.display}`,
      time: booking.slot,
      status: 'Confirmed',
      room: booking.doctor.room,
      type: booking.consultType === 'in-clinic' ? 'In-Clinic Visit' : 'Video Tele-Consult',
      token: booking.tokenNum
    };
    this.appointments.unshift(newApt);
    this.render();
  }

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="patient-portal-wrapper">
        <!-- Patient Profile Header -->
        <div class="portal-profile-bar">
          <div class="profile-info-left">
            <div class="patient-avatar-circle">
              <span>RS</span>
            </div>
            <div>
              <div class="profile-name-row">
                <h3>${this.patient.name}</h3>
                <span class="patient-id-badge">ID: ${this.patient.id}</span>
                <span class="patient-verified-badge">✓ Verified Patient</span>
              </div>
              <p class="profile-sub-meta">
                ${this.patient.age} Yrs • ${this.patient.gender} • Blood Group: <span class="text-teal font-semibold">${this.patient.bloodGroup}</span> • Member Since ${this.patient.memberSince}
              </p>
            </div>
          </div>

          <div class="portal-quick-actions">
            <button type="button" class="btn btn-primary btn-sm" id="btn-portal-book-new">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Book New Appointment
            </button>
          </div>
        </div>

        <!-- Portal Navigation Tabs -->
        <div class="portal-tabs-nav" role="tablist">
          <button type="button" class="portal-tab-btn ${this.activeTab === 'appointments' ? 'active' : ''}" data-tab="appointments">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            My Appointments (${this.appointments.length})
          </button>

          <button type="button" class="portal-tab-btn ${this.activeTab === 'journeys' ? 'active' : ''}" data-tab="journeys">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Multi-Session Treatment Tracker
            <span class="portal-badge-count">${this.trackers.length} Active</span>
          </button>

          <button type="button" class="portal-tab-btn ${this.activeTab === 'prescriptions' ? 'active' : ''}" data-tab="prescriptions">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Digital Rx & Care Cards (${this.prescriptions.length})
          </button>

          <button type="button" class="portal-tab-btn ${this.activeTab === 'records' ? 'active' : ''}" data-tab="records">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Radiology & Scan Vault
          </button>
        </div>

        <!-- Tab Body -->
        <div class="portal-tab-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderTabContent() {
    if (this.activeTab === 'appointments') {
      return `
        <div class="appointments-list-grid animate-fade-in">
          ${this.appointments.map(apt => `
            <div class="portal-apt-card ${apt.status === 'Completed' ? 'completed' : 'active'}">
              <div class="apt-card-header">
                <span class="apt-status-pill ${apt.status.toLowerCase()}">${apt.status}</span>
                <span class="apt-token">${apt.token}</span>
              </div>

              <div class="apt-doctor-row">
                <img src="${apt.doctorImage}" alt="${apt.doctorName}" class="apt-doc-thumb" />
                <div>
                  <h4 class="apt-doc-name">${apt.doctorName}</h4>
                  <p class="apt-doc-role">${apt.doctorRole} • ${apt.doctorDept}</p>
                </div>
              </div>

              <div class="apt-details-box">
                <div class="apt-detail-row">
                  <span class="lbl">Procedure:</span>
                  <strong>${apt.treatment}</strong>
                </div>
                <div class="apt-detail-row">
                  <span class="lbl">Date & Time:</span>
                  <span class="text-teal-dark font-semibold">${apt.date} at ${apt.time}</span>
                </div>
                <div class="apt-detail-row">
                  <span class="lbl">Location:</span>
                  <span>${apt.room} (Chaudhari Clinic)</span>
                </div>
              </div>

              <div class="apt-card-actions">
                ${apt.status !== 'Completed' ? `
                  <button type="button" class="btn btn-outline btn-xs" onclick="alert('Appointment details: ${apt.id}. To reschedule, call reception at +91 98230 45678.')">
                    Reschedule
                  </button>
                  <button type="button" class="btn btn-primary btn-xs" onclick="window.print()">
                    Print Slip
                  </button>
                ` : `
                  <span class="text-xs text-muted">Consultation summary & prescriptions filed in Digital Rx</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'journeys') {
      return `
        <div class="journeys-list-grid animate-fade-in">
          <div class="journeys-intro-alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            <p>Track your ongoing multi-session clinical protocols under Dr. Snehal, Dr. Rohan, and Dr. Amit. Clinical logs update dynamically after each visit.</p>
          </div>

          ${this.trackers.map(tr => `
            <div class="journey-card">
              <div class="journey-header">
                <div>
                  <span class="journey-dept-badge">${tr.dept}</span>
                  <h4 class="journey-title">${tr.treatmentName}</h4>
                  <p class="journey-doctor">Supervising Specialist: <strong>${tr.doctorName}</strong></p>
                </div>
                <div class="journey-badge-status">${tr.status}</div>
              </div>

              <!-- Progress Bar -->
              <div class="journey-progress-wrap">
                <div class="journey-progress-top">
                  <span><strong>Session ${tr.completedSessions} of ${tr.totalSessions}</strong> Completed</span>
                  <span class="font-bold text-teal-dark">${tr.percentComplete}% Complete</span>
                </div>
                <div class="journey-bar-track">
                  <div class="journey-bar-fill" style="width: ${tr.percentComplete}%;"></div>
                </div>
                <div class="journey-next-due">
                  <span>📅 Next Session Due: <strong>${tr.nextSessionDue}</strong></span>
                </div>
              </div>

              <!-- Care Note -->
              <div class="journey-care-card">
                <span class="care-icon">💡</span>
                <p><strong>Doctor's Protocol Note:</strong> ${tr.careNote}</p>
              </div>

              <!-- Session Timeline History -->
              <div class="journey-history">
                <h5 class="history-title">Session History & Clinical Log:</h5>
                <div class="timeline-nodes">
                  ${tr.log.map(item => `
                    <div class="timeline-node">
                      <div class="node-dot">✓</div>
                      <div class="node-body">
                        <div class="node-top">
                          <strong>Session ${item.session}</strong>
                          <span class="text-xs text-muted">${item.date}</span>
                        </div>
                        <p class="node-notes">${item.notes}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'prescriptions') {
      return `
        <div class="prescriptions-grid animate-fade-in">
          ${this.prescriptions.map(rx => `
            <div class="prescription-document-card">
              <div class="rx-header-band">
                <div class="rx-clinic-crest">
                  <span>CSD</span>
                  <div>
                    <h5>Chaudhari Skin & Dental Care</h5>
                    <p class="text-xs text-muted">Reg NABH Accredited Multi-Specialty Clinic</p>
                  </div>
                </div>
                <div class="rx-meta-right">
                  <span class="font-mono text-sm font-bold">${rx.id}</span>
                  <span class="text-xs text-muted">${rx.date}</span>
                </div>
              </div>

              <div class="rx-doc-info">
                <strong>${rx.doctor}</strong> (${rx.degree}) • <span>${rx.dept}</span>
              </div>

              <div class="rx-diagnosis-box">
                <span class="lbl">Diagnosis:</span>
                <strong>${rx.diagnosis}</strong>
              </div>

              <!-- Medicine Table -->
              <table class="rx-table">
                <thead>
                  <tr>
                    <th>Medication / Topical Formulation</th>
                    <th>Dosage & Instructions</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  ${rx.medicines.map(m => `
                    <tr>
                      <td class="font-medium">${m.name}</td>
                      <td>${m.dosage}</td>
                      <td>${m.duration}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="rx-special-instructions">
                <strong>Doctor's Clinical Instructions:</strong>
                <p>${rx.instructions}</p>
              </div>

              <div class="rx-footer-stamp">
                <div class="digital-sign-stamp">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7.5" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                  <span>Digitally Signed: ${rx.signedBy}</span>
                </div>
                <button type="button" class="btn btn-outline btn-xs" onclick="window.print()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print Rx PDF
                </button>
              </div>
            </div>
          `).join('')}

          <!-- Pre & Post-Care Instructions Cards -->
          <div class="care-cards-section">
            <h4 class="section-subheading">Official Pre & Post-Care Downloadable Guides</h4>
            <div class="care-cards-grid">
              <div class="care-card teal-border">
                <div class="care-card-header">
                  <span class="care-tag">Dermatology Care</span>
                  <h5>Post-Hydrafacial & Laser Treatment Guidelines</h5>
                </div>
                <ul class="care-list">
                  <li>Avoid direct strong sunlight for 48 hours; apply broad-spectrum SPF 50+ mineral sunscreen every 3 hours.</li>
                  <li>Do not use scrubs, AHAs/BHAs, or retinol serums for 4 days post-procedure.</li>
                  <li>Keep skin barrier hydrated with thermal water mist and ceramide moisturizer.</li>
                </ul>
                <button type="button" class="btn btn-outline btn-xs" onclick="alert('Post-Hydrafacial PDF Guide downloaded to your device!')">Download PDF Guide</button>
              </div>

              <div class="care-card blue-border">
                <div class="care-card-header">
                  <span class="care-tag">Dental Surgery Care</span>
                  <h5>Post-Root Canal (RCT) & Implant Healing Protocols</h5>
                </div>
                <ul class="care-list">
                  <li>Keep sterile gauze firmly in place for 45 minutes; swallow saliva normally.</li>
                  <li>Avoid drinking with a straw or spitting vigorously to prevent clot dislodgement.</li>
                  <li>Take prescribed analgesic (Zerodol-SP) before local anaesthesia wears off.</li>
                </ul>
                <button type="button" class="btn btn-outline btn-xs" onclick="alert('Post-RCT Dental Protocol PDF downloaded to your device!')">Download PDF Guide</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'records') {
      return `
        <div class="records-grid animate-fade-in">
          <div class="record-vault-item">
            <div class="vault-item-header">
              <div>
                <h5>Mandibular Posterior IOPA Digital Radiograph</h5>
                <p class="text-xs text-muted">Taken by Dr. Rohan Chaudhari • Oct 18, 2026</p>
              </div>
              <span class="badge-tag">Endodontics</span>
            </div>
            <div class="vault-xray-frame">
              <img src="/images/radiographs/iopa_36_rct_check.png" alt="IOPA 36 RCT Check Radiograph" class="xray-img" />
            </div>
            <div class="vault-item-footer">
              <span class="text-xs font-mono">Finding: Complete obturation of mesial & distal root canals on #36.</span>
              <a href="/images/radiographs/iopa_36_rct_check.png" target="_blank" class="text-xs text-primary font-bold">View Full Res</a>
            </div>
          </div>

          <div class="record-vault-item">
            <div class="vault-item-header">
              <div>
                <h5>Bite-Wing Occlusal Cavity Screening Scan</h5>
                <p class="text-xs text-muted">Taken by Dr. Amit Chaudhari • Oct 14, 2026</p>
              </div>
              <span class="badge-tag">Aesthetic Scan</span>
            </div>
            <div class="vault-xray-frame">
              <img src="/images/radiographs/bitewing_posterior.png" alt="Bitewing Radiograph" class="xray-img" />
            </div>
            <div class="vault-item-footer">
              <span class="text-xs font-mono">Finding: Zero interproximal decay detected across premolars.</span>
              <a href="/images/radiographs/bitewing_posterior.png" target="_blank" class="text-xs text-primary font-bold">View Full Res</a>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  bindEvents() {
    this.container.querySelectorAll('.portal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.setTab(tab);
      });
    });

    const bookNew = this.container.querySelector('#btn-portal-book-new');
    if (bookNew) {
      bookNew.addEventListener('click', () => this.onBookNewClick());
    }
  }
}
