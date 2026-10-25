import { INITIAL_DOCTOR_QUEUES } from '../data/mockData.js';
import { playClinicChime } from '../utils/audio.js';

export class AdminDashboard {
  constructor(containerEl) {
    this.container = containerEl;
    this.queues = JSON.parse(JSON.stringify(INITIAL_DOCTOR_QUEUES));
    this.activeFilter = 'all'; // 'all', 'dr-snehal', 'dr-rohan', 'dr-amit'
    this.isAddModalOpen = false;
    this.render();
  }

  callNextPatient(docId) {
    const q = this.queues[docId];
    if (!q) return;

    // Find first patient waiting or in lounge
    const nextIdx = q.patients.findIndex(p => p.status === 'Waiting in Lounge' || p.priority.includes('EMERGENCY'));
    if (nextIdx !== -1) {
      // Set previous "In Room" to Completed
      q.patients.forEach(p => {
        if (p.status === 'In Room') p.status = 'Completed';
      });

      const nextP = q.patients[nextIdx];
      nextP.status = 'In Room';
      q.currentPatient = `${nextP.name} (${nextP.token}) — ${nextP.treatment}`;

      // Play reception chime!
      playClinicChime('queue-call');

      this.showToast(`📢 Calling ${nextP.name} (${nextP.token}) to ${q.room}!`);
      this.render();
    } else {
      this.showToast(`All waiting patients for ${q.doctorName} have been called.`);
    }
  }

  completePatient(docId, patientId) {
    const q = this.queues[docId];
    if (!q) return;
    const p = q.patients.find(item => item.id === patientId);
    if (p) {
      p.status = 'Completed';
      playClinicChime('success');
      this.showToast(`Consultation for ${p.name} marked as completed.`);
      this.render();
    }
  }

  addWalkIn(docId, name, age, treatment, priority = 'Normal') {
    const q = this.queues[docId];
    if (!q) return;

    const tokenNum = `#${(q.patients.length + 1).toString().padStart(2, '0')}`;
    const newP = {
      id: `Q-${Date.now().toString().slice(-3)}`,
      token: tokenNum,
      name,
      age: parseInt(age, 10) || 28,
      treatment,
      status: 'Waiting in Lounge',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority
    };

    if (priority.includes('EMERGENCY')) {
      q.patients.unshift(newP);
      playClinicChime('alert');
      this.showToast(`🚨 Priority Emergency Patient ${name} added to ${q.doctorName}'s queue!`);
    } else {
      q.patients.push(newP);
      playClinicChime('success');
      this.showToast(`Walk-In Patient ${name} (${tokenNum}) added to ${q.doctorName}'s queue.`);
    }

    this.render();
  }

  showToast(message) {
    const existing = document.querySelector('.admin-toast-alert');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'admin-toast-alert animate-slide-up';
    toast.innerHTML = `
      <span class="toast-bell">🔔</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.render();
  }

  render() {
    const doctorKeys = Object.keys(this.queues);
    const visibleDocs = this.activeFilter === 'all' 
      ? doctorKeys 
      : doctorKeys.filter(k => k === this.activeFilter);

    // Calculate aggregate metrics
    let totalPatients = 0;
    let waitingCount = 0;
    let inRoomCount = 0;
    let emergencyCount = 0;

    doctorKeys.forEach(k => {
      this.queues[k].patients.forEach(p => {
        totalPatients++;
        if (p.status === 'Waiting in Lounge') waitingCount++;
        if (p.status === 'In Room') inRoomCount++;
        if (p.priority.includes('EMERGENCY') && p.status !== 'Completed') emergencyCount++;
      });
    });

    this.container.innerHTML = `
      <div class="admin-dashboard-wrapper">
        <!-- Top Reception Header -->
        <div class="admin-header-bar">
          <div class="admin-brand-left">
            <div class="admin-shield">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <div>
              <h3>Reception & 3-Doctor Live Queue Command</h3>
              <p>Simultaneous Parallel Multi-Queue Management • Live Sync Active</p>
            </div>
          </div>

          <div class="admin-top-controls">
            <button type="button" class="btn btn-emergency btn-sm" id="btn-admin-add-emergency">
              🚨 Add Emergency Walk-In
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-admin-add-walkin">
              + Add Regular Walk-In
            </button>
          </div>
        </div>

        <!-- Live Queue Metrics Cards -->
        <div class="admin-metrics-row">
          <div class="metric-card">
            <span class="metric-lbl">Total Appointments Today</span>
            <strong class="metric-val">${totalPatients + 12}</strong>
            <span class="metric-sub text-teal">Across 3 Specialists</span>
          </div>

          <div class="metric-card">
            <span class="metric-lbl">Waiting in Reception Lounge</span>
            <strong class="metric-val text-amber">${waitingCount}</strong>
            <span class="metric-sub">Average Wait: ~9 mins</span>
          </div>

          <div class="metric-card">
            <span class="metric-lbl">Currently in Consultation</span>
            <strong class="metric-val text-primary">${inRoomCount}</strong>
            <span class="metric-sub">Active in 3 Clinical Suites</span>
          </div>

          <div class="metric-card highlight-red">
            <span class="metric-lbl">Active Emergency Cases</span>
            <strong class="metric-val text-red">${emergencyCount}</strong>
            <span class="metric-sub text-red font-semibold">Priority Triage Active</span>
          </div>
        </div>

        <!-- 3-Column Toggle Controls -->
        <div class="admin-filter-bar">
          <span class="filter-lbl">Queue Filter:</span>
          <div class="admin-filter-pills">
            <button type="button" class="filter-pill ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
              ⚡ All 3 Parallel Queues (Simultaneous)
            </button>
            <button type="button" class="filter-pill ${this.activeFilter === 'dr-snehal' ? 'active' : ''}" data-filter="dr-snehal">
              Dr. Snehal (Dermatology Suite)
            </button>
            <button type="button" class="filter-pill ${this.activeFilter === 'dr-rohan' ? 'active' : ''}" data-filter="dr-rohan">
              Dr. Rohan (Dental Operatory 1 - Surgery)
            </button>
            <button type="button" class="filter-pill ${this.activeFilter === 'dr-amit' ? 'active' : ''}" data-filter="dr-amit">
              Dr. Amit (Dental Operatory 2 - Aesthetic)
            </button>
          </div>
        </div>

        <!-- 3-Column Queue Board -->
        <div class="admin-queues-grid cols-${visibleDocs.length}">
          ${visibleDocs.map(docId => {
            const q = this.queues[docId];
            return `
              <div class="doctor-queue-column">
                <!-- Column Header -->
                <div class="queue-col-header">
                  <div class="queue-doc-row">
                    <img src="${q.avatar}" alt="${q.doctorName}" class="queue-doc-avatar" />
                    <div>
                      <h4 class="queue-doc-title">${q.doctorName}</h4>
                      <p class="queue-room-lbl text-xs">${q.room}</p>
                    </div>
                  </div>
                  <div class="current-consult-pill">
                    <span class="pulse-dot"></span>
                    <span>${q.statusText}</span>
                  </div>
                </div>

                <!-- Call Next Patient Bar -->
                <div class="queue-call-bar">
                  <button type="button" class="btn btn-primary btn-call-next" data-doc-id="${docId}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    Call Next Patient (Ding-Dong)
                  </button>
                </div>

                <!-- Patients List -->
                <div class="queue-patients-list">
                  ${q.patients.map(p => `
                    <div class="queue-patient-card status-${p.status.toLowerCase().replace(/\s+/g, '-')} ${p.priority.includes('EMERGENCY') ? 'priority-emergency' : ''}">
                      <div class="p-card-top">
                        <span class="p-token-pill">${p.token}</span>
                        <span class="p-status-pill">${p.status}</span>
                      </div>

                      <div class="p-info">
                        <h5 class="p-name">${p.name}</h5>
                        <p class="p-sub">${p.age}y • Time: <strong>${p.time}</strong></p>
                        <p class="p-treatment font-medium">${p.treatment}</p>
                      </div>

                      ${p.priority.includes('EMERGENCY') ? `
                        <div class="p-emergency-flag">
                          <span>🚨 ${p.priority}</span>
                        </div>
                      ` : ''}

                      <div class="p-actions">
                        ${p.status === 'In Room' ? `
                          <button type="button" class="btn btn-outline btn-xs text-emerald" data-action="complete" data-doc-id="${docId}" data-p-id="${p.id}">
                            ✓ Complete Consultation
                          </button>
                        ` : p.status === 'Waiting in Lounge' ? `
                          <button type="button" class="btn btn-outline btn-xs" data-action="call-direct" data-doc-id="${docId}" data-p-id="${p.id}">
                            Call In Directly
                          </button>
                        ` : `
                          <span class="text-xs text-muted">Completed</span>
                        `}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Add Walk-In Patient Modal -->
        ${this.isAddModalOpen ? `
          <div class="modal-backdrop" id="add-walkin-backdrop">
            <div class="modal-card modal-sm">
              <header class="modal-header">
                <h3>Add Walk-In / Emergency Patient</h3>
                <button type="button" class="btn-close-modal" id="btn-close-walkin">✕</button>
              </header>
              <form class="modal-body" id="form-walkin-add">
                <div class="form-field">
                  <label>Assign to Specialist</label>
                  <select id="walkin-doc" class="form-select">
                    <option value="dr-rohan">Dr. Rohan Chaudhari (Dental Surgery & Implants)</option>
                    <option value="dr-amit">Dr. Amit Chaudhari (Cosmetic Dentistry & Smile)</option>
                    <option value="dr-snehal">Dr. Snehal Chaudhari (Dermatology & Lasers)</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Patient Full Name</label>
                  <input type="text" id="walkin-name" required placeholder="e.g. Ramesh Kulkarni" class="form-input" />
                </div>
                <div class="form-field">
                  <label>Age</label>
                  <input type="number" id="walkin-age" required min="1" max="100" value="32" class="form-input" />
                </div>
                <div class="form-field">
                  <label>Treatment / Reason</label>
                  <input type="text" id="walkin-treatment" required placeholder="e.g. Broken tooth emergency / Skin allergy" class="form-input" />
                </div>
                <div class="form-field">
                  <label>Priority</label>
                  <select id="walkin-priority" class="form-select">
                    <option value="Normal">Normal Queue</option>
                    <option value="EMERGENCY PAIN" ${this.isEmergencyWalkIn ? 'selected' : ''}>🚨 EMERGENCY ACUTE PAIN (Top Priority)</option>
                  </select>
                </div>
                <footer class="step-footer">
                  <button type="button" class="btn btn-outline" id="btn-cancel-walkin">Cancel</button>
                  <button type="submit" class="btn btn-primary">Add to Queue</button>
                </footer>
              </form>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Filter pills
    this.container.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        this.setFilter(filter);
      });
    });

    // Call next buttons
    this.container.querySelectorAll('.btn-call-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        this.callNextPatient(docId);
      });
    });

    // Card action buttons
    this.container.querySelectorAll('[data-action="complete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        const pId = btn.getAttribute('data-p-id');
        this.completePatient(docId, pId);
      });
    });

    this.container.querySelectorAll('[data-action="call-direct"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        const pId = btn.getAttribute('data-p-id');
        const q = this.queues[docId];
        const p = q.patients.find(item => item.id === pId);
        if (p) {
          q.patients.forEach(item => {
            if (item.status === 'In Room') item.status = 'Completed';
          });
          p.status = 'In Room';
          q.currentPatient = `${p.name} (${p.token}) — ${p.treatment}`;
          playClinicChime('queue-call');
          this.showToast(`📢 Directly calling ${p.name} to ${q.room}!`);
          this.render();
        }
      });
    });

    // Add Walk-In Modals
    const btnEmergency = this.container.querySelector('#btn-admin-add-emergency');
    if (btnEmergency) {
      btnEmergency.addEventListener('click', () => {
        this.isAddModalOpen = true;
        this.isEmergencyWalkIn = true;
        this.render();
      });
    }

    const btnWalkin = this.container.querySelector('#btn-admin-add-walkin');
    if (btnWalkin) {
      btnWalkin.addEventListener('click', () => {
        this.isAddModalOpen = true;
        this.isEmergencyWalkIn = false;
        this.render();
      });
    }

    const closeWalkin = this.container.querySelector('#btn-close-walkin');
    const cancelWalkin = this.container.querySelector('#btn-cancel-walkin');
    if (closeWalkin) closeWalkin.addEventListener('click', () => {
      this.isAddModalOpen = false;
      this.render();
    });
    if (cancelWalkin) cancelWalkin.addEventListener('click', () => {
      this.isAddModalOpen = false;
      this.render();
    });

    const formWalkin = this.container.querySelector('#form-walkin-add');
    if (formWalkin) {
      formWalkin.addEventListener('submit', (e) => {
        e.preventDefault();
        const docId = this.container.querySelector('#walkin-doc').value;
        const name = this.container.querySelector('#walkin-name').value;
        const age = this.container.querySelector('#walkin-age').value;
        const treatment = this.container.querySelector('#walkin-treatment').value;
        const priority = this.container.querySelector('#walkin-priority').value;

        this.addWalkIn(docId, name, age, treatment, priority);
        this.isAddModalOpen = false;
        this.render();
      });
    }
  }
}
