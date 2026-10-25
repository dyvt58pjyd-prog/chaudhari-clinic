import { DOCTORS, getDoctorById } from '../data/doctors.js';
import { TREATMENTS } from '../data/treatments.js';
import { playClinicChime } from '../utils/audio.js';
import confetti from 'canvas-confetti';

export class BookingModal {
  constructor(options = {}) {
    this.onBookingConfirmed = options.onBookingConfirmed || (() => {});
    this.currentStep = 1;
    this.selectedDept = 'skin'; // 'skin' or 'dental'
    this.selectedDoctorId = 'dr-rajnikant';
    this.selectedTreatmentId = 'acne-scar-treatment';
    this.consultType = 'in-clinic'; // 'in-clinic' or 'video'
    this.selectedDate = this.getFormattedDate(0);
    this.selectedSlot = '10:30 AM';
    this.isEmergency = false;
    this.uploadedPhoto = null;

    this.formData = {
      fullName: '',
      age: '',
      gender: 'Female',
      phone: '',
      email: '',
      notes: ''
    };

    this.confirmedBooking = null;
    this.createDom();
  }

  getFormattedDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      iso: d.toISOString().split('T')[0],
      dayName: days[d.getDay()],
      dayNum: d.getDate(),
      month: months[d.getMonth()],
      year: d.getFullYear(),
      display: `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
    };
  }

  createDom() {
    const container = document.createElement('div');
    container.id = 'booking-modal-backdrop';
    container.className = 'modal-backdrop hidden';
    container.innerHTML = `
      <div class="modal-card booking-modal-card" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
        <header class="modal-header">
          <div class="modal-header-brand">
            <span class="brand-crest">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9" stroke-width="1.5"/></svg>
            </span>
            <div>
              <h3 id="booking-modal-title" class="modal-title">Smart Appointment Booking</h3>
              <p class="modal-subtitle">Direct Doctor Auto-Routing & Instant Confirmation • Khamgaon</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-booking" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </header>

        <!-- Stepper Indicator -->
        <div class="booking-stepper" id="booking-stepper">
          <div class="step-node active" data-step="1">
            <span class="step-circle">1</span>
            <span class="step-label">Department & Doctor</span>
          </div>
          <div class="step-line"></div>
          <div class="step-node" data-step="2">
            <span class="step-circle">2</span>
            <span class="step-label">Date & Time Slot</span>
          </div>
          <div class="step-line"></div>
          <div class="step-node" data-step="3">
            <span class="step-circle">3</span>
            <span class="step-label">Patient Details</span>
          </div>
        </div>

        <!-- Dynamic Body -->
        <div class="modal-body" id="booking-step-content">
          <!-- Injected via renderStep() -->
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.el = container;
    this.contentEl = container.querySelector('#booking-step-content');
    this.stepperEl = container.querySelector('#booking-stepper');

    this.bindEvents();
  }

  bindEvents() {
    this.el.querySelector('#btn-close-booking').addEventListener('click', () => this.close());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });
  }

  open(prefill = {}) {
    if (prefill.department) {
      this.selectedDept = prefill.department;
    }
    if (prefill.doctorId) {
      this.selectedDoctorId = prefill.doctorId;
      const doc = getDoctorById(this.selectedDoctorId);
      if (doc) this.selectedDept = doc.department;
    } else if (this.selectedDept === 'skin') {
      this.selectedDoctorId = 'dr-rajnikant';
    } else if (this.selectedDept === 'dental' && !['dr-priyanka', 'dr-rutika'].includes(this.selectedDoctorId)) {
      this.selectedDoctorId = 'dr-priyanka';
    }

    if (prefill.treatmentId) {
      this.selectedTreatmentId = prefill.treatmentId;
      const trt = TREATMENTS.find(t => t.id === prefill.treatmentId);
      if (trt) {
        this.selectedDept = trt.deptId === 'combo' ? 'skin' : trt.deptId;
        this.selectedDoctorId = trt.doctorId;
      }
    }

    if (prefill.isEmergency) {
      this.isEmergency = true;
      this.selectedDept = 'dental';
      this.selectedDoctorId = 'dr-priyanka';
    }

    this.currentStep = 1;
    this.confirmedBooking = null;
    this.render();
    this.el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.el.classList.add('hidden');
    document.body.style.overflow = '';
  }

  setDepartment(dept) {
    this.selectedDept = dept;
    if (dept === 'skin') {
      this.selectedDoctorId = 'dr-rajnikant';
    } else if (dept === 'dental') {
      if (this.selectedDoctorId === 'dr-rajnikant') {
        this.selectedDoctorId = 'dr-priyanka'; // Default to Senior Surgeon / RCT
      }
    }
    // Update default treatment
    const matchingTreatments = TREATMENTS.filter(t => t.deptId === dept || (dept === 'skin' && t.deptId === 'combo'));
    if (matchingTreatments.length > 0 && !matchingTreatments.some(t => t.id === this.selectedTreatmentId)) {
      this.selectedTreatmentId = matchingTreatments[0].id;
    }
    this.renderStep1();
  }

  setDoctor(docId) {
    this.selectedDoctorId = docId;
    const doc = getDoctorById(docId);
    if (doc) {
      this.selectedDept = doc.department;
    }
    this.renderStep1();
  }

  render() {
    this.updateStepper();
    if (this.confirmedBooking) {
      this.renderConfirmationSlip();
    } else if (this.currentStep === 1) {
      this.renderStep1();
    } else if (this.currentStep === 2) {
      this.renderStep2();
    } else if (this.currentStep === 3) {
      this.renderStep3();
    }
  }

  updateStepper() {
    if (this.confirmedBooking) {
      this.stepperEl.style.display = 'none';
      return;
    }
    this.stepperEl.style.display = 'flex';
    const nodes = this.stepperEl.querySelectorAll('.step-node');
    nodes.forEach(node => {
      const step = parseInt(node.getAttribute('data-step'), 10);
      node.classList.remove('active', 'completed');
      if (step === this.currentStep) {
        node.classList.add('active');
      } else if (step < this.currentStep) {
        node.classList.add('completed');
      }
    });
  }

  renderStep1() {
    const isSkin = this.selectedDept === 'skin';
    const availableTreatments = TREATMENTS.filter(t => 
      this.selectedDept === 'skin' ? (t.deptId === 'skin' || t.deptId === 'combo') : (t.deptId === 'dental')
    );
    const selectedDoctor = getDoctorById(this.selectedDoctorId);

    this.contentEl.innerHTML = `
      <div class="step-pane animate-fade-in">
        ${this.isEmergency ? `
          <div class="emergency-alert-callout">
            <span class="emergency-badge">🚨 EMERGENCY TRIAGE</span>
            <p>You selected <strong>Acute Pain / Emergency Care</strong>. You are prioritized for immediate same-day relief with our Senior Dental Surgeons.</p>
          </div>
        ` : ''}

        <div class="form-section">
          <label class="form-section-title">1. Choose Specialty Department</label>
          <div class="dept-selection-grid">
            <button type="button" class="dept-card-btn ${isSkin ? 'selected' : ''}" id="btn-select-skin">
              <div class="dept-icon-wrapper teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>
              </div>
              <div class="dept-card-info">
                <strong>Skin, Hair & Aesthetics</strong>
                <span>Acne, Lasers, Hydrafacial, PRP Hair & Anti-Aging</span>
              </div>
              <span class="dept-auto-tag">Auto-Routes to Dr. Rajnikant</span>
            </button>

            <button type="button" class="dept-card-btn ${!isSkin ? 'selected' : ''}" id="btn-select-dental">
              <div class="dept-icon-wrapper blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <div class="dept-card-info">
                <strong>Dental & Oral Surgery</strong>
                <span>Painless RCT, Implants, Aligners, Veneers & Pediatric</span>
              </div>
              <span class="dept-auto-tag">Choose from 2 Dental Specialists</span>
            </button>
          </div>
        </div>

        <div class="form-section">
          <label class="form-section-title">2. Assigned Specialist Doctor</label>
          ${isSkin ? `
            <div class="doctor-auto-routed-card">
              <img src="/images/dr-snehal-chaudhari.jpg" alt="Dr. Rajnikant Arvind Chaudhari" class="doc-thumb" />
              <div class="doc-meta">
                <div class="doc-meta-top">
                  <span class="doc-badge-pill teal">Dermatology Lead</span>
                  <span class="doc-rating">★ 5.0 (380+ Patients)</span>
                </div>
                <h4 class="doc-name">Dr. Rajnikant Arvind Chaudhari</h4>
                <p class="doc-qualification">M.B.B.S., D.D.V. (Mumbai) • त्वचारोग व केस विकार तज्ञ</p>
                <p class="doc-opd">OPD: Mon–Sat 10:00 AM – 2:00 PM & 5:00 PM – 8:30 PM (Suite 101)</p>
              </div>
              <span class="auto-selected-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </div>
          ` : `
            <div class="doctor-selection-grid">
              <button type="button" class="doc-choice-card ${this.selectedDoctorId === 'dr-priyanka' ? 'selected' : ''}" id="btn-doc-priyanka">
                <div class="doc-choice-header">
                  <img src="/images/dr-rohan-chaudhari.jpg" alt="Dr. Priyanka Chaudhari" class="doc-thumb-sm" />
                  <div>
                    <span class="doc-badge-pill blue">Dental Surgery & RCT Lead</span>
                    <h5>Dr. Priyanka Chaudhari (Anekar)</h5>
                    <p class="doc-creds">B.D.S. (Nashik) | 9+ Yrs Exp</p>
                  </div>
                </div>
                <p class="doc-specialty-highlight">Best for: Painless Single-Sitting RCT, Dental Implants, Wisdom Tooth Surgery</p>
              </button>

              <button type="button" class="doc-choice-card ${this.selectedDoctorId === 'dr-rutika' ? 'selected' : ''}" id="btn-doc-rutika">
                <div class="doc-choice-header">
                  <img src="/images/dr-amit-chaudhari.jpg" alt="Dr. Rutika Tulaskar" class="doc-thumb-sm" />
                  <div>
                    <span class="doc-badge-pill emerald">Pediatric & Oral Lead</span>
                    <h5>Dr. Rutika Tulaskar (Chaudhari)</h5>
                    <p class="doc-creds">B.D.S., M.D.S. (Nashik) | 10+ Yrs Exp</p>
                  </div>
                </div>
                <p class="doc-specialty-highlight">Best for: Pediatric Kids Dentistry, Child Pulpectomy, Oral Diseases, Aligners & Smile Design</p>
              </button>
            </div>
          `}
        </div>

        <div class="form-row-grid">
          <div class="form-field">
            <label for="booking-treatment-select">Select Primary Treatment / Reason</label>
            <select id="booking-treatment-select" class="form-select">
              ${availableTreatments.map(t => `
                <option value="${t.id}" ${t.id === this.selectedTreatmentId ? 'selected' : ''}>
                  ${t.title} (${t.duration})
                </option>
              `).join('')}
              <option value="general-consult" ${this.selectedTreatmentId === 'general-consult' ? 'selected' : ''}>General Specialist Consultation & Assessment</option>
            </select>
          </div>

          <div class="form-field">
            <label>Consultation Mode</label>
            <div class="consult-type-toggle">
              <label class="type-pill ${this.consultType === 'in-clinic' ? 'active' : ''}">
                <input type="radio" name="consult-type" value="in-clinic" ${this.consultType === 'in-clinic' ? 'checked' : ''} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                In-Clinic Visit
              </label>
              <label class="type-pill ${this.consultType === 'video' ? 'active' : ''}">
                <input type="radio" name="consult-type" value="video" ${this.consultType === 'video' ? 'checked' : ''} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                HD Video Consult
              </label>
            </div>
          </div>
        </div>

        <footer class="step-footer">
          <div class="footer-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Assigned doctor: <strong>${selectedDoctor.name}</strong> (${selectedDoctor.deptLabel})
          </div>
          <button type="button" class="btn btn-primary btn-next-step" id="btn-step1-next">
            Continue to Date & Slots
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </footer>
      </div>
    `;

    // Step 1 Events
    this.contentEl.querySelector('#btn-select-skin').addEventListener('click', () => this.setDepartment('skin'));
    this.contentEl.querySelector('#btn-select-dental').addEventListener('click', () => this.setDepartment('dental'));

    const btnPriyanka = this.contentEl.querySelector('#btn-doc-priyanka');
    const btnRutika = this.contentEl.querySelector('#btn-doc-rutika');
    if (btnPriyanka) btnPriyanka.addEventListener('click', () => this.setDoctor('dr-priyanka'));
    if (btnRutika) btnRutika.addEventListener('click', () => this.setDoctor('dr-rutika'));

    const trtSelect = this.contentEl.querySelector('#booking-treatment-select');
    trtSelect.addEventListener('change', (e) => {
      this.selectedTreatmentId = e.target.value;
      const trt = TREATMENTS.find(t => t.id === this.selectedTreatmentId);
      if (trt && trt.doctorId) {
        this.selectedDoctorId = trt.doctorId;
      }
    });

    const consultRadios = this.contentEl.querySelectorAll('input[name="consult-type"]');
    consultRadios.forEach(r => {
      r.addEventListener('change', (e) => {
        this.consultType = e.target.value;
        this.renderStep1();
      });
    });

    this.contentEl.querySelector('#btn-step1-next').addEventListener('click', () => {
      this.currentStep = 2;
      this.render();
    });
  }

  renderStep2() {
    const doctor = getDoctorById(this.selectedDoctorId);
    const dateOptions = [0, 1, 2, 3, 4, 5, 6].map(offset => this.getFormattedDate(offset));

    const morningSlots = doctor.slots.morning || ["10:00 AM", "10:30 AM", "11:15 AM", "12:00 PM"];
    const eveningSlots = doctor.slots.evening || ["05:00 PM", "05:45 PM", "06:30 PM", "07:15 PM"];

    this.contentEl.innerHTML = `
      <div class="step-pane animate-fade-in">
        <div class="slot-doctor-summary">
          <img src="${doctor.image}" alt="${doctor.name}" class="doc-avatar-xs" />
          <div>
            <h4 class="text-sm font-semibold">${doctor.name}</h4>
            <p class="text-xs text-muted">${doctor.opdTimings} • ${doctor.room}</p>
          </div>
          <span class="live-slot-badge"><span class="pulse-dot"></span> Live Sync</span>
        </div>

        <div class="form-section">
          <label class="form-section-title">Select Appointment Date</label>
          <div class="dates-scroller">
            ${dateOptions.map((d, idx) => `
              <button type="button" class="date-chip ${d.iso === this.selectedDate.iso ? 'selected' : ''}" data-iso="${d.iso}" data-idx="${idx}">
                <span class="chip-day">${idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.dayName}</span>
                <span class="chip-num">${d.dayNum}</span>
                <span class="chip-month">${d.month}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-section">
          <div class="slot-group-header">
            <span class="slot-icon morning">☀️</span>
            <h5>Morning OPD Slots</h5>
            <span class="slot-count">${morningSlots.length} Slots Available</span>
          </div>
          <div class="slots-grid">
            ${morningSlots.map(slot => `
              <button type="button" class="time-slot-btn ${slot === this.selectedSlot ? 'selected' : ''}" data-slot="${slot}">
                <span class="slot-time">${slot}</span>
                <span class="slot-status">Available</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-section">
          <div class="slot-group-header">
            <span class="slot-icon evening">🌙</span>
            <h5>Evening OPD Slots</h5>
            <span class="slot-count">${eveningSlots.length} Slots Available</span>
          </div>
          <div class="slots-grid">
            ${eveningSlots.map(slot => `
              <button type="button" class="time-slot-btn ${slot === this.selectedSlot ? 'selected' : ''}" data-slot="${slot}">
                <span class="slot-time">${slot}</span>
                <span class="slot-status">Available</span>
              </button>
            `).join('')}
          </div>
        </div>

        <footer class="step-footer">
          <button type="button" class="btn btn-outline" id="btn-step2-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <button type="button" class="btn btn-primary" id="btn-step2-next">
            Next: Patient Details
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </footer>
      </div>
    `;

    // Date clicks
    this.contentEl.querySelectorAll('.date-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.selectedDate = dateOptions[idx];
        this.renderStep2();
      });
    });

    // Slot clicks
    this.contentEl.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedSlot = btn.getAttribute('data-slot');
        this.contentEl.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    this.contentEl.querySelector('#btn-step2-back').addEventListener('click', () => {
      this.currentStep = 1;
      this.render();
    });

    this.contentEl.querySelector('#btn-step2-next').addEventListener('click', () => {
      this.currentStep = 3;
      this.render();
    });
  }

  renderStep3() {
    const doctor = getDoctorById(this.selectedDoctorId);
    const treatment = TREATMENTS.find(t => t.id === this.selectedTreatmentId) || { title: 'General Specialist Consultation' };

    this.contentEl.innerHTML = `
      <form class="step-pane animate-fade-in" id="booking-patient-form">
        <div class="booking-recap-bar">
          <div class="recap-item">
            <span class="recap-label">Specialist</span>
            <span class="recap-val font-semibold">${doctor.name}</span>
          </div>
          <div class="recap-item">
            <span class="recap-label">Date & Time</span>
            <span class="recap-val text-primary font-semibold">${this.selectedDate.display} at ${this.selectedSlot}</span>
          </div>
          <div class="recap-item">
            <span class="recap-label">Treatment</span>
            <span class="recap-val">${treatment.title}</span>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-field">
            <label for="patient-name">Patient Full Name <span class="required">*</span></label>
            <input type="text" id="patient-name" required placeholder="e.g. Rahul Sharma" value="${this.formData.fullName}" class="form-input" />
          </div>

          <div class="form-field-grid-2">
            <div class="form-field">
              <label for="patient-age">Age <span class="required">*</span></label>
              <input type="number" id="patient-age" required min="1" max="110" placeholder="e.g. 29" value="${this.formData.age}" class="form-input" />
            </div>
            <div class="form-field">
              <label for="patient-gender">Gender</label>
              <select id="patient-gender" class="form-select">
                <option value="Female" ${this.formData.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Male" ${this.formData.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Other" ${this.formData.gender === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-field">
            <label for="patient-phone">10-Digit Mobile Number <span class="required">*</span></label>
            <div class="input-phone-wrapper">
              <span class="phone-prefix">+91</span>
              <input type="tel" id="patient-phone" required pattern="[6-9][0-9]{9}" maxlength="10" placeholder="98230 45678" value="${this.formData.phone}" class="form-input phone-input" />
            </div>
          </div>

          <div class="form-field">
            <label for="patient-email">Email Address (For Confirmation Slip)</label>
            <input type="email" id="patient-email" placeholder="patient@example.com" value="${this.formData.email}" class="form-input" />
          </div>
        </div>

        <!-- Photo / X-Ray Upload -->
        <div class="form-section">
          <label class="form-section-title">
            Optional: Upload Photo of Skin Condition or Dental Radiograph (X-Ray)
            <span class="text-xs text-muted block">Helps Dr. ${doctor.name.split(' ')[1]} review your case prior to arrival.</span>
          </label>
          <div class="upload-dropzone" id="upload-dropzone">
            <input type="file" id="patient-photo-input" accept="image/*" class="sr-only" />
            ${this.uploadedPhoto ? `
              <div class="upload-preview-card">
                <img src="${this.uploadedPhoto}" alt="Uploaded medical preview" class="preview-thumb" />
                <div class="preview-meta">
                  <span class="font-medium text-sm">Image Attached Successfully</span>
                  <span class="text-xs text-muted">Ready for doctor clinical triage</span>
                </div>
                <button type="button" class="btn-remove-photo" id="btn-remove-photo">Remove</button>
              </div>
            ` : `
              <div class="dropzone-content">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p><strong>Click to browse</strong> or drag & drop skin photo or dental X-ray</p>
                <span class="text-xs text-muted">Supports JPG, PNG, WEBP up to 10MB (Strict HIPAA/NABH Privacy Protected)</span>
              </div>
            `}
          </div>
        </div>

        <!-- Emergency Acute Pain Checkbox -->
        <div class="form-field checkbox-field">
          <label class="checkbox-label">
            <input type="checkbox" id="emergency-pain-check" ${this.isEmergency ? 'checked' : ''} />
            <span>
              <strong>Acute Emergency / Severe Toothache:</strong> Request priority fast-track triage upon clinic arrival.
            </span>
          </label>
        </div>

        <div class="form-field">
          <label for="patient-notes">Brief Note on Symptoms / Health History (Optional)</label>
          <textarea id="patient-notes" rows="2" placeholder="e.g. Tooth hurts with cold water for 3 days / Acne flared up after travel..." class="form-textarea">${this.formData.notes}</textarea>
        </div>

        <footer class="step-footer">
          <button type="button" class="btn btn-outline" id="btn-step3-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <button type="submit" class="btn btn-primary btn-confirm-booking" id="btn-submit-booking">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Confirm & Generate Appointment Slip
          </button>
        </footer>
      </form>
    `;

    // Dropzone upload
    const dropzone = this.contentEl.querySelector('#upload-dropzone');
    const fileInput = this.contentEl.querySelector('#patient-photo-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (e.target.id === 'btn-remove-photo') return;
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.uploadedPhoto = ev.target.result;
            this.renderStep3();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const removeBtn = this.contentEl.querySelector('#btn-remove-photo');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.uploadedPhoto = null;
        this.renderStep3();
      });
    }

    this.contentEl.querySelector('#btn-step3-back').addEventListener('click', () => {
      this.currentStep = 2;
      this.render();
    });

    // Form submit
    const form = this.contentEl.querySelector('#booking-patient-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = this.contentEl.querySelector('#patient-name');
      const ageInput = this.contentEl.querySelector('#patient-age');
      const genderInput = this.contentEl.querySelector('#patient-gender');
      const phoneInput = this.contentEl.querySelector('#patient-phone');
      const emailInput = this.contentEl.querySelector('#patient-email');
      const notesInput = this.contentEl.querySelector('#patient-notes');
      const emergencyCheck = this.contentEl.querySelector('#emergency-pain-check');

      if (!nameInput.value.trim() || !phoneInput.value.trim()) {
        alert('Please fill in your name and a valid 10-digit mobile number.');
        return;
      }

      this.formData = {
        fullName: nameInput.value.trim(),
        age: ageInput.value.trim(),
        gender: genderInput.value,
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim() || `${nameInput.value.toLowerCase().replace(/\s+/g, '')}@example.com`,
        notes: notesInput.value.trim()
      };
      this.isEmergency = emergencyCheck ? emergencyCheck.checked : false;

      this.completeBooking();
    });
  }

  completeBooking() {
    const doctor = getDoctorById(this.selectedDoctorId);
    const treatment = TREATMENTS.find(t => t.id === this.selectedTreatmentId) || { title: 'Specialist Clinical Consultation' };
    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const appointmentId = `CSD-2026-${randomIdNum}`;
    const tokenNum = `#${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}`;

    this.confirmedBooking = {
      appointmentId,
      tokenNum,
      doctor,
      treatment,
      date: this.selectedDate,
      slot: this.selectedSlot,
      patient: this.formData,
      consultType: this.consultType,
      isEmergency: this.isEmergency,
      uploadedPhoto: this.uploadedPhoto,
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Trigger celebration chime & confetti!
    playClinicChime('success');
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    this.onBookingConfirmed(this.confirmedBooking);
    this.render();
  }

  renderConfirmationSlip() {
    const b = this.confirmedBooking;

    this.contentEl.innerHTML = `
      <div class="confirmation-pane animate-scale-up" id="printable-slip-area">
        <div class="confirmation-success-banner">
          <div class="success-icon-ring">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4>Appointment Confirmed Successfully!</h4>
          <p class="text-sm">SMS & WhatsApp confirmation voucher dispatched to <strong>+91 ${b.patient.phone}</strong></p>
        </div>

        <div class="appointment-pass-card">
          <div class="pass-card-top">
            <div class="pass-brand">
              <span class="pass-crest">CSD</span>
              <div>
                <h5>Chaudhari Skin & Dental Care</h5>
                <p>Multi-Specialty Clinic & Medicare Pharmacy • Khamgaon (Buldhana)</p>
              </div>
            </div>
            <div class="pass-token-badge">
              <span class="token-lbl">Clinic Token</span>
              <span class="token-val">${b.tokenNum}</span>
            </div>
          </div>

          <div class="pass-divider"></div>

          <div class="pass-doctor-strip">
            <img src="${b.doctor.image}" alt="${b.doctor.name}" class="pass-doc-img" />
            <div class="pass-doc-info">
              <span class="doc-badge-pill ${b.doctor.badgeColor}">${b.doctor.shortRole}</span>
              <h4>${b.doctor.name}</h4>
              <p class="text-xs text-muted">${b.doctor.qualifications}</p>
              <p class="text-xs font-semibold text-primary">OPD Location: ${b.doctor.room}</p>
            </div>
          </div>

          <div class="pass-grid">
            <div class="pass-cell">
              <span class="pass-label">Appointment ID</span>
              <span class="pass-data font-mono font-bold">${b.appointmentId}</span>
            </div>
            <div class="pass-cell">
              <span class="pass-label">Date & Time</span>
              <span class="pass-data font-semibold text-teal-dark">${b.date.display} • ${b.slot}</span>
            </div>
            <div class="pass-cell">
              <span class="pass-label">Patient Name & Age</span>
              <span class="pass-data">${b.patient.fullName} (${b.patient.age}y, ${b.patient.gender})</span>
            </div>
            <div class="pass-cell">
              <span class="pass-label">Treatment Scheduled</span>
              <span class="pass-data">${b.treatment.title}</span>
            </div>
            <div class="pass-cell">
              <span class="pass-label">Consultation Mode</span>
              <span class="pass-data">${b.consultType === 'in-clinic' ? '🏥 In-Clinic Priority Walk-In' : '📹 HD Video Tele-Consult'}</span>
            </div>
            <div class="pass-cell">
              <span class="pass-label">Priority Level</span>
              <span class="pass-data ${b.isEmergency ? 'text-red font-bold' : 'text-emerald'}">${b.isEmergency ? '🚨 ACUTE PAIN EMERGENCY' : 'Standard Confirmed Slot'}</span>
            </div>
          </div>

          <!-- QR Simulation for Contactless Check-In -->
          <div class="pass-qr-row">
            <div class="qr-mockup">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v2h-4v-2zm-2-2h2v2h-2v-2zm0-4h4v2h-4v-2zm-4 4h2v2h-2v-2z"/>
              </svg>
            </div>
            <div class="qr-instruction">
              <p class="font-semibold text-sm">Contactless Reception Check-In QR</p>
              <p class="text-xs text-muted">Scan at the clinic reception kiosk to skip waiting lines and auto-alert Dr. ${b.doctor.name.split(' ')[1]}.</p>
            </div>
          </div>
        </div>

        <div class="slip-actions-grid">
          <button type="button" class="btn btn-outline" id="btn-print-slip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print / Save PDF Slip
          </button>

          <button type="button" class="btn btn-whatsapp" id="btn-share-whatsapp-slip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.778.978-.954 1.178-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.787-1.676-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.3.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.587-.493-.507-.678-.517l-.578-.01c-.201 0-.527.075-.803.377s-1.055 1.03-1.055 2.511c0 1.481 1.08 2.911 1.231 3.112.151.201 2.125 3.245 5.148 4.552.719.311 1.281.497 1.719.636.723.23 1.381.197 1.901.12.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.431-.076-.126-.277-.201-.578-.351zM12.004 2C6.484 2 2.01 6.474 2.01 12c0 1.91.537 3.696 1.468 5.222L2 22l4.945-1.435C8.414 21.433 10.154 22 12.004 22c5.521 0 9.996-4.475 9.996-10 0-5.526-4.475-10-9.996-10z"/></svg>
            Send to My WhatsApp
          </button>

          <button type="button" class="btn btn-outline" id="btn-add-gcal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Add to Calendar
          </button>
        </div>

        <footer class="slip-footer-center">
          <button type="button" class="btn btn-primary" id="btn-done-slip">Done & View Patient Portal</button>
        </footer>
      </div>
    `;

    // Events on confirmation screen
    this.contentEl.querySelector('#btn-print-slip').addEventListener('click', () => {
      window.print();
    });

    this.contentEl.querySelector('#btn-share-whatsapp-slip').addEventListener('click', () => {
      const msg = encodeURIComponent(
        `*Appointment Confirmation - Chaudhari Skin & Dental Care Clinic*\n\n` +
        `Patient: ${b.patient.fullName}\n` +
        `ID: ${b.appointmentId} (Token ${b.tokenNum})\n` +
        `Specialist: ${b.doctor.name}\n` +
        `Date & Time: ${b.date.display} at ${b.slot}\n` +
        `Treatment: ${b.treatment.title}\n` +
        `Clinic Address: Shriram Chowk, Farshi Road, Near Dr. Chande Clinic, Shivalay Vihar, Khamgaon - 444303\n` +
        `Helpline / WhatsApp: +91 90498 83983\n` +
        `Pharmacy: Attached On-Site Medicare Pharmacy`
      );
      window.open(`https://wa.me/91${b.patient.phone}?text=${msg}`, '_blank');
    });

    this.contentEl.querySelector('#btn-add-gcal').addEventListener('click', () => {
      const title = encodeURIComponent(`Chaudhari Clinic: ${b.treatment.title} with ${b.doctor.name}`);
      const details = encodeURIComponent(`Appointment ID: ${b.appointmentId}\nRoom: ${b.doctor.room}\nPhone: +91 90498 83983\nLocation: Shriram Chowk, Farshi Road, Khamgaon`);
      const location = encodeURIComponent('Chaudhari Skin and Dental Care Multispeciality Clinic, Shriram Chowk, Farshi Road, Khamgaon, Buldhana, Maharashtra 444303');
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`, '_blank');
    });

    this.contentEl.querySelector('#btn-done-slip').addEventListener('click', () => {
      this.close();
      // Dispatch custom event to switch to patient portal
      window.dispatchEvent(new CustomEvent('open-patient-portal'));
    });
  }
}
