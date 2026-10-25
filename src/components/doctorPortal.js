// Doctor Portal Component
// Clinical Patient Notes based on Checkup, Medical Safety Alerts, 1-Line External RVG X-Ray ID,
// 1-Click Rx Combos, Selective Hospital Medicine Box, Multilingual Rx Printing,
// Dental Lab Tracker, Consent Forms & Real-Time Live Notification to Reception & Pharmacy.

import { hospitalDb, DOCTORS_ROSTER } from '../data/hospitalDb.js';
import { medicinesFormulary, MEDICINE_CATEGORIES } from '../data/medicinesFormulary.js';
import { authService } from '../data/authService.js';
import { notificationEngine } from '../utils/notificationEngine.js';
import { playClinicChime } from '../utils/audio.js';
import { printPrescription, printConsentForm, printFitnessCertificate } from './printManager.js';
import confetti from 'canvas-confetti';

const CRITICAL_ALERTS_LIST = [
  '⚠️ Diabetes (मधुमेह)',
  '⚠️ High BP (उच्च रक्तदाब)',
  '⚠️ Drug Allergy (औषधांची ॲलर्जी)',
  '⚠️ Blood Thinners (रक्त पातळ करणारी औषधे)',
  '⚠️ Pregnancy (गर्भावस्थेत)'
];

// 5 Rapid 1-Click Clinical Disease Rx Combos for Khamgaon Specialists
const RX_TEMPLATES = {
  "rct-painless": {
    name: "⚡ Standard RCT Kit",
    doctorId: "dr-priyanka",
    diagnosis: "Acute Irreversible Pulpitis #46 with Apical Periodontitis",
    findings: "Deep carious involvement of pulp chamber, severe lingering pain to thermal stimuli, vertical percussion (++).",
    treatmentDone: "Single-sitting computerized rotary biomechanical preparation, irrigation with 3% NaOCl + EDTA, bioceramic obturation.",
    consultationFee: 350,
    procedureFee: 2500,
    medicines: [
      { name: "Amoxicillin 500mg", type: "Capsule", frequency: "1-1-1 (After Food)", duration: "5 Days", instructions: "Complete full antibiotic course" },
      { name: "Zerodol-SP (Aceclofenac + Serratio)", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "3 Days", instructions: "For acute pain and swelling" },
      { name: "Pantocid 40mg", type: "Tablet", frequency: "1-0-0 (Empty Stomach)", duration: "5 Days", instructions: "30 mins before breakfast" },
      { name: "Hexidine 0.2% Mouthwash", type: "Liquid", frequency: "1-0-1 (After Food)", duration: "7 Days", instructions: "Rinse 10ml for 1 min after brushing, do not swallow" }
    ],
    specialAdvice: "Avoid chewing hard foods on right side. Maintain oral hygiene. Review after 5 days for permanent crown preparation."
  },
  "post-extraction": {
    name: "⚡ Post-Extraction Kit",
    doctorId: "dr-priyanka",
    diagnosis: "Grossly Carious Non-Restorable Root Stumps / Impacted Molar",
    findings: "Mobility grade III, non-vital root stumps with localized alveolar osteitis.",
    treatmentDone: "Atraumatic surgical extraction under 2% Lignocaine with Adrenaline (1:80,000), socket curettage, gauze pack placed.",
    consultationFee: 350,
    procedureFee: 800,
    medicines: [
      { name: "Augmentin 625mg (Amox + Clavulanic)", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "5 Days", instructions: "Take after full meal with water" },
      { name: "Ketorol-DT 10mg (Dispersible)", type: "Tablet", frequency: "SOS (When Needed for Pain)", duration: "3 Days", instructions: "Disperse tablet in 1 spoon drinking water" },
      { name: "Pantocid 40mg", type: "Tablet", frequency: "1-0-0 (Empty Stomach)", duration: "5 Days", instructions: "Take before breakfast" },
      { name: "Betadine 2% Oral Gargle", type: "Liquid", frequency: "1-0-1 (After Food)", duration: "5 Days", instructions: "Dilute with lukewarm water and gargle starting tomorrow" }
    ],
    specialAdvice: "Keep cotton gauze pack bitten firmly for 45 minutes. Do not spit, drink hot liquids, or use a straw today. Eat cold, soft ice-cream."
  },
  "pediatric-decay": {
    name: "⚡ Pediatric Dental Kit",
    doctorId: "dr-rutika",
    diagnosis: "Early Childhood Caries (ECC) with Pulpal Involvement",
    findings: "Extensive carious breakdown of primary molars, nocturnal pain, mild gingival swelling.",
    treatmentDone: "Painless pulpectomy under computerized local anaesthesia, bio-inductive filling, prefabricated zirconia crown placement.",
    consultationFee: 300,
    procedureFee: 1500,
    medicines: [
      { name: "Augmentin Duo Syrup (Amox-Clav 228.5mg/5ml)", type: "Syrup", frequency: "5ml twice daily (After Food)", duration: "5 Days", instructions: "Shake bottle well before giving" },
      { name: "Ibugesic Plus Syrup (Ibuprofen + Paracetamol)", type: "Syrup", frequency: "5ml SOS (After Food)", duration: "3 Days", instructions: "Give only if child complains of pain" },
      { name: "Pediflor / Colgate Kids 500ppm Fluoride Paste", type: "Gel", frequency: "1-0-1 (Morning-Night)", duration: "Daily", instructions: "Parent-supervised brushing with pea-sized amount" }
    ],
    specialAdvice: "Stop night-time bottle feeding with sugar. Encourage rinsing with plain water after every meal. Clean teeth twice daily."
  },
  "acne-severe": {
    name: "⚡ Grade II Acne Kit",
    doctorId: "dr-rajnikant",
    diagnosis: "Acne Vulgaris Grade II/III with Post-Inflammatory Erythema",
    findings: "Multiple inflammatory papules, pustules, and open comedones over cheeks and chin. Oily T-zone.",
    treatmentDone: "Comedone extraction + Salicylic-Mandelic peel trial on active lesions under strict clinical asepsis.",
    consultationFee: 400,
    procedureFee: 800,
    medicines: [
      { name: "Adapalene 0.1% + Clindamycin 1% Gel (Deriva-CMS)", type: "Gel", frequency: "0-0-1 (Bedtime)", duration: "30 Days", instructions: "Apply pea-sized amount at night over acne lesions" },
      { name: "Doxycycline 100mg (Doxy-1 L-DR)", type: "Capsule", frequency: "1-0-0 (After Food)", duration: "15 Days", instructions: "Take with full glass of water, do not lie down immediately" },
      { name: "Cetaphil / Sebamed Gentle Cleanser", type: "Liquid", frequency: "1-0-1 (Morning-Night)", duration: "Daily", instructions: "Wash face gently twice daily with lukewarm water" },
      { name: "Silicone Matte Sunscreen Gel SPF 50+ PA+++", type: "Gel", frequency: "Every 4 Hours", duration: "Daily", instructions: "Apply 20 mins before sun exposure" }
    ],
    specialAdvice: "Strictly avoid touching or squeezing lesions. Drink 3L water daily. Avoid excessive dairy and oily foods. Review after 3 weeks."
  },
  "fungal-tinea": {
    name: "⚡ Fungal Tinea Kit",
    doctorId: "dr-rajnikant",
    diagnosis: "Tinea Corporis & Cruris (Recurrent Dermatophytosis)",
    findings: "Annular erythematous scaly plaques with active raised advancing borders and severe pruritus.",
    treatmentDone: "Skin scrapings examination, clotrimazole barrier counsel, topical antifungal trial.",
    consultationFee: 400,
    procedureFee: 0,
    medicines: [
      { name: "Itraconazole 100mg / 200mg (Candiforce)", type: "Capsule", frequency: "1-0-1 (After Food)", duration: "14 Days", instructions: "Take immediately after a heavy meal" },
      { name: "Luliconazole 1% Cream (Lulifin)", type: "Gel", frequency: "1-0-1 (After Food)", duration: "14 Days", instructions: "Apply 2cm beyond the active red border" },
      { name: "Bilastine 20mg (Bilaxten)", type: "Tablet", frequency: "1-0-0 (Empty Stomach)", duration: "10 Days", instructions: "Take 1 hour before breakfast. Non-drowsy" }
    ],
    specialAdvice: "Wear loose cotton clothes. Wash innerwear in hot water and iron inside out. Do not share towels or soaps."
  }
};

export class DoctorPortal {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate || (() => {});
    this.activeDoctorId = 'dr-rajnikant';
    this.selectedPatientId = null;
    this.medicineRows = [];
    
    // Patient Queue Search & Filter state
    this.searchQuery = '';
    this.queueFilter = 'all'; // 'all' or doctorId
    this.dateFilter = 'all'; // 'all', 'today', 'yesterday', or specific YYYY-MM-DD
    this.shiftFilter = 'all'; // 'all', 'Morning OPD', 'Evening OPD'

    // Selective Medicine Box state
    this.formularySearchQuery = '';
    this.formularyCategory = 'all';
    this.isFormularyBoxOpen = true;
    this.showAddCustomMed = false;

    // Doctor Safety & Prescription Options
    this.prescriptionLang = 'mr'; // Default Marathi print for Khamgaon patients
    this.activeAlerts = [];
    this.dentalLabStatus = 'No Lab Work';
    this.dentalLabName = '';
    this.mobileTab = 'queue';

    this.render();
  }

  setDoctor(docId) {
    this.activeDoctorId = docId;
    this.render();
  }

  setPatient(patientId) {
    this.selectedPatientId = patientId;
    this.mobileTab = 'workspace';
    const p = hospitalDb.getPatientById(patientId);
    if (p) {
      if (p.assignedDoctorId) {
        this.activeDoctorId = p.assignedDoctorId;
      }
      this.activeAlerts = p.criticalAlerts ? [...p.criticalAlerts] : [];
      if (p.dentalLab) {
        this.dentalLabStatus = p.dentalLab.status || 'No Lab Work';
        this.dentalLabName = p.dentalLab.labName || '';
      }

      if (p.prescription && p.prescription.medicines && p.prescription.medicines.length > 0) {
        this.medicineRows = JSON.parse(JSON.stringify(p.prescription.medicines));
      } else {
        this.medicineRows = [
          { name: "", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "5 Days", instructions: "Take with water after meals" }
        ];
      }
    }
    this.render();

    // Auto-scroll to workspace on mobile/tablet for smooth UX
    setTimeout(() => {
      const ws = this.container.querySelector('.doc-workspace-card');
      if (ws) ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  render() {
    const currentUser = authService.getCurrentUser();
    if (!this.activeDoctorId && currentUser && currentUser.doctorId) {
      this.activeDoctorId = currentUser.doctorId;
    }

    const allPatients = hospitalDb.getAllPatients();
    const config = hospitalDb.getConfig();
    const activeDoctor = DOCTORS_ROSTER.find(d => d.id === this.activeDoctorId) || DOCTORS_ROSTER[0];

    // Dates for filtering
    const todayYMD = hospitalDb.formatDateYMD(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayYMD = hospitalDb.formatDateYMD(yesterdayDate);

    // Filter patients by Doctor, Date, Shift, and Real-Time Search Query
    const q = (this.searchQuery || '').trim().toLowerCase();
    const filteredPatients = allPatients.filter(p => {
      const matchesDoc = this.queueFilter === 'all' || p.assignedDoctorId === this.queueFilter;
      
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

      let matchesSearch = true;
      if (q) {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const phoneMatch = p.phone && p.phone.includes(q);
        const idMatch = p.patientId && p.patientId.toLowerCase().includes(q);
        const tokenMatch = p.tokenNo && String(p.tokenNo).includes(q);
        const diagMatch = p.clinicalNotes?.diagnosis && p.clinicalNotes.diagnosis.toLowerCase().includes(q);
        const rvgMatch = p.externalRvgId && p.externalRvgId.toLowerCase().includes(q);
        matchesSearch = nameMatch || phoneMatch || idMatch || tokenMatch || diagMatch || rvgMatch;
      }
      return matchesDoc && matchesDate && matchesShift && matchesSearch;
    });

    const waitingPatients = filteredPatients.filter(p => p.status === 'Waiting for Doctor');
    const completedPatients = filteredPatients.filter(p => p.status === 'Prescription Ready' || p.status === 'Billing Completed');

    // Counts for filter pills
    const allWaitingTotal = allPatients.filter(p => p.status === 'Waiting for Doctor').length;
    const doc1Waiting = allPatients.filter(p => p.assignedDoctorId === 'dr-rajnikant' && p.status === 'Waiting for Doctor').length;
    const doc2Waiting = allPatients.filter(p => p.assignedDoctorId === 'dr-priyanka' && p.status === 'Waiting for Doctor').length;
    const doc3Waiting = allPatients.filter(p => p.assignedDoctorId === 'dr-rutika' && p.status === 'Waiting for Doctor').length;

    const selectedPatient = this.selectedPatientId ? allPatients.find(p => p.patientId === this.selectedPatientId) : null;

    this.container.innerHTML = `
      <div class="doctor-portal-layout">
        <!-- Top Doctor Header -->
        <div class="portal-header-row">
          <div>
            <div class="section-tag-pill teal">Doctor Consultation & Clinical EMR</div>
            <h2 class="portal-title">Clinical Checkup Notes & Digital Prescription</h2>
            <p class="portal-subtitle">Safety Alerts • 1-Line RVG ID • Selective Formulary • Real-Time Reception & Billing Sync</p>
          </div>

          <!-- Doctor Switcher Pills (Always accessible to switch cabins) -->
          <div class="doctor-switcher-pills">
            ${DOCTORS_ROSTER.map(doc => `
              <button type="button" class="doc-tab-pill ${doc.id === this.activeDoctorId ? 'active' : ''}" data-id="${doc.id}">
                <span class="doc-avatar-dot">👨‍⚕️</span>
                <div class="text-left">
                  <strong>${doc.name.split(' ')[1]}</strong>
                  <span class="text-xs block text-muted">${doc.department.split('&')[0]}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Mobile & Tablet Segmented View Tabs -->
        <div class="doc-mobile-view-tabs">
          <button type="button" class="doc-m-tab-btn ${this.mobileTab === 'queue' ? 'active' : ''}" id="btn-doc-tab-queue">
            👥 Patient Queue <span class="doc-m-badge">${waitingPatients.length}</span>
          </button>
          <button type="button" class="doc-m-tab-btn ${this.mobileTab === 'workspace' ? 'active' : ''}" id="btn-doc-tab-workspace">
            🩺 Active Checkup ${selectedPatient ? `• ${selectedPatient.name.split(' ')[0]}` : ''}
          </button>
        </div>

        <div class="doctor-main-grid ${this.mobileTab === 'workspace' ? 'show-workspace-mobile' : 'show-queue-mobile'}">
          <!-- Left Column: Compact Searchable Patient Queue -->
          <div class="doc-queue-card">
            <div class="queue-card-head">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="card-title text-base">OPD Queue & Directory</h3>
                  <p class="text-xs text-muted">Consulting Cabin: <strong>${activeDoctor.name.split(' ')[1]}</strong> (${activeDoctor.room})</p>
                </div>
                <div class="queue-count-badge">
                  <span class="pulse-dot"></span> <strong>${waitingPatients.length}</strong> Waiting
                </div>
              </div>

              <!-- Real-Time Patient Search Bar by Name, Mobile, Diagnosis, RVG ID -->
              <div class="doc-queue-search-wrap mt-2">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  id="doc-queue-search-input" 
                  class="form-input form-input-sm" 
                  placeholder="Search by Name, Mobile, Diagnosis, or RVG ID..." 
                  value="${this.searchQuery}" 
                  autocomplete="off"
                />
                ${this.searchQuery ? `<button type="button" class="search-clear-btn" id="btn-clear-doc-search">✕</button>` : ''}
              </div>

              <!-- Date & Shift Filter Bar -->
              <div class="doc-queue-date-bar mt-2 flex items-center justify-between flex-wrap gap-1">
                <div class="flex items-center gap-1 flex-wrap">
                  <button type="button" class="q-date-pill ${this.dateFilter === 'all' ? 'active' : ''}" data-date="all">All Dates</button>
                  <button type="button" class="q-date-pill ${this.dateFilter === 'today' ? 'active' : ''}" data-date="today">Today</button>
                  <button type="button" class="q-date-pill ${this.dateFilter === 'yesterday' ? 'active' : ''}" data-date="yesterday">Yesterday</button>
                  <input type="date" id="doc-queue-date-picker" class="form-input form-input-xs" style="width: 130px; font-size: 0.75rem; padding: 2px 4px;" value="${this.dateFilter !== 'all' && this.dateFilter !== 'today' && this.dateFilter !== 'yesterday' ? this.dateFilter : ''}" title="Filter by specific date" />
                </div>
                <div class="flex items-center gap-1">
                  <select id="doc-queue-shift-select" class="form-select form-select-xs" style="font-size: 0.75rem; padding: 3px 6px;">
                    <option value="all" ${this.shiftFilter === 'all' ? 'selected' : ''}>All Shifts</option>
                    <option value="Morning OPD" ${this.shiftFilter === 'Morning OPD' ? 'selected' : ''}>🌅 Morning OPD</option>
                    <option value="Evening OPD" ${this.shiftFilter === 'Evening OPD' ? 'selected' : ''}>🌆 Evening OPD</option>
                  </select>
                </div>
              </div>

              <!-- Queue Doctor Filter Pills -->
              <div class="doc-queue-filter-pills mt-2">
                <button type="button" class="q-filter-pill ${this.queueFilter === 'all' ? 'active' : ''}" data-filter="all">
                  All Waiting (${allWaitingTotal})
                </button>
                <button type="button" class="q-filter-pill ${this.queueFilter === 'dr-rajnikant' ? 'active' : ''}" data-filter="dr-rajnikant">
                  Dr. Rajnikant (${doc1Waiting})
                </button>
                <button type="button" class="q-filter-pill ${this.queueFilter === 'dr-priyanka' ? 'active' : ''}" data-filter="dr-priyanka">
                  Dr. Priyanka (${doc2Waiting})
                </button>
                <button type="button" class="q-filter-pill ${this.queueFilter === 'dr-rutika' ? 'active' : ''}" data-filter="dr-rutika">
                  Dr. Rutika (${doc3Waiting})
                </button>
              </div>
            </div>

            <div class="doc-patients-scroller">
              <div class="queue-section-label">Waiting for Checkup (${waitingPatients.length}):</div>
              ${waitingPatients.length === 0 ? `
                <div class="empty-queue-box">
                  <span>✓</span>
                  <p>${this.searchQuery || this.dateFilter !== 'all' || this.shiftFilter !== 'all' ? 'No waiting patient matches selected date, shift, or search.' : 'No waiting patients in this queue right now.'}</p>
                </div>
              ` : waitingPatients.map(p => `
                <div class="compact-queue-row ${p.isEmergency ? 'emergency-row' : ''} ${p.patientId === this.selectedPatientId ? 'selected' : ''}" data-id="${p.patientId}">
                  <div class="cqr-left">
                    <div class="cqr-token-pill ${p.isEmergency ? 'emergency' : ''}">
                      #${p.tokenNo}
                    </div>
                    <div class="cqr-info">
                      <div class="cqr-name-line">
                        <strong class="cqr-name">${p.name}</strong>
                        ${p.isEmergency ? `<span class="cqr-badge-red">🚨 EMERGENCY</span>` : ''}
                      </div>
                      <div class="cqr-sub-line">
                        <span class="cqr-meta">${p.age}y • ${p.gender}</span>
                        <span class="cqr-sep">•</span>
                        <span class="cqr-phone font-mono">📞 ${p.phone}</span>
                        <span class="cqr-sep">•</span>
                        <span class="cqr-doc-chip ${p.assignedDoctorId}">${p.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka' : p.assignedDoctorId === 'dr-rutika' ? 'Dr. Rutika' : 'Dr. Rajnikant'}</span>
                      </div>
                      <div class="cqr-time-line mt-1">
                        <span class="text-xs text-muted font-mono">📅 ${p.registeredDate || ''} • 🕒 ${p.registeredTime || ''}</span>
                        <span class="rec-shift-badge ${p.registeredShift === 'Morning OPD' ? 'shift-morning' : 'shift-evening'} text-xs ml-1" style="font-size: 0.68rem; padding: 1px 6px;">
                          ${p.registeredShift === 'Morning OPD' ? 'Morning OPD' : 'Evening OPD'}
                        </span>
                        ${p.visitHistory && p.visitHistory.length > 0 ? `<span class="badge-uhid ml-1" style="font-size: 0.65rem; padding: 1px 5px;">🔁 ${p.visitHistory.length + 1} Visits</span>` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="cqr-right">
                    <button type="button" class="btn-attend-patient ${p.patientId === this.selectedPatientId ? 'consulting' : ''}" data-id="${p.patientId}">
                      ${p.patientId === this.selectedPatientId ? '✓ Consulting' : 'Attend / Write Rx →'}
                    </button>
                  </div>
                </div>
              `).join('')}

              <div class="queue-section-label mt-3">Consulted (${completedPatients.length}):</div>
              ${completedPatients.slice(0, 8).map(cp => `
                <div class="compact-queue-row completed ${cp.patientId === this.selectedPatientId ? 'selected' : ''}" data-id="${cp.patientId}">
                  <div class="cqr-left">
                    <div class="cqr-token-pill done">✓</div>
                    <div class="cqr-info">
                      <div class="cqr-name-line">
                        <strong class="cqr-name">${cp.name}</strong>
                        <span class="status-tag-sm">${cp.status}</span>
                      </div>
                      <div class="cqr-sub-line">
                        <span class="cqr-meta">${cp.age}y • ${cp.gender}</span>
                        <span class="cqr-sep">•</span>
                        <span class="cqr-phone font-mono">${cp.phone}</span>
                        <span class="cqr-sep">•</span>
                        <span class="text-xs text-muted">${cp.clinicalNotes?.diagnosis || 'Consulted'}</span>
                      </div>
                      <div class="cqr-time-line mt-1">
                        <span class="text-xs text-muted font-mono">📅 ${cp.consultedDate || cp.registeredDate || ''} • 🕒 ${cp.consultedTime || cp.registeredTime || ''}</span>
                        <span class="rec-shift-badge ${cp.consultedShift || cp.registeredShift === 'Morning OPD' ? 'shift-morning' : 'shift-evening'} text-xs ml-1" style="font-size: 0.68rem; padding: 1px 6px;">
                          ${cp.consultedShift || cp.registeredShift || 'OPD'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="cqr-right">
                    <button type="button" class="btn-attend-patient completed-btn" data-id="${cp.patientId}">
                      ${cp.patientId === this.selectedPatientId ? '✓ Open' : 'View Rx →'}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Column: Active Patient Checkup Notes & Prescription Builder -->
          <div class="doc-workspace-card">
            ${!selectedPatient ? `
              <div class="empty-workspace-placeholder">
                <div class="placeholder-icon">🩺</div>
                <h3>Select a Patient to Begin Clinical Examination</h3>
                <p>Click on any waiting patient from the queue on the left to start checkup, take EMR notes, and prepare prescription.</p>
              </div>
            ` : `
              <div class="active-checkup-form-wrap animate-fade-in">
                <!-- Mobile Back Button -->
                <div class="mobile-back-queue-row">
                  <button type="button" class="btn-back-to-queue" id="btn-back-to-queue-mobile">
                    ← Back to Patient Queue (${waitingPatients.length} Waiting)
                  </button>
                </div>

                <!-- Patient Banner -->
                <div class="patient-consult-banner ${selectedPatient.isEmergency ? 'emergency-banner' : ''}">
                  <div>
                    <span class="patient-id-badge">${selectedPatient.patientId}</span>
                    <h3 class="banner-patient-name">${selectedPatient.name}</h3>
                    <p class="banner-patient-meta">${selectedPatient.age} Yrs • ${selectedPatient.gender} • Mobile: +91 ${selectedPatient.phone} • 📅 ${selectedPatient.registeredDate || ''} 🕒 ${selectedPatient.registeredTime || ''} (${selectedPatient.registeredShift || 'OPD'})</p>
                    <p class="banner-patient-addr text-xs text-muted">Address: ${selectedPatient.address}</p>
                  </div>
                  <div class="banner-token-badge">
                    <span>OPD Token</span>
                    <strong>#${selectedPatient.tokenNo}</strong>
                    ${selectedPatient.isEmergency ? `<span class="text-xs text-red font-bold">EMERGENCY</span>` : ''}
                  </div>
                </div>

                <!-- Past Medical Records & Visit History (if returning patient) -->
                ${selectedPatient.visitHistory && selectedPatient.visitHistory.length > 0 ? `
                  <div class="cs-section mt-2" style="border: 1.5px solid #0f766e; background: #f0fdfa;">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">📁</span>
                        <div>
                          <strong class="text-sm text-teal-dark">Past Medical Records & Visit History (${selectedPatient.visitHistory.length} Previous Consultations)</strong>
                          <p class="text-xs text-muted">Archived clinical checkups, historical diagnoses, and previously prescribed medications</p>
                        </div>
                      </div>
                      <button type="button" class="btn btn-secondary btn-xs" id="btn-view-mrd-archive">
                        🗄️ Open Full MRD Archive →
                      </button>
                    </div>
                    <div class="past-visits-list mt-2" style="display: flex; flex-direction: column; gap: 8px;">
                      ${selectedPatient.visitHistory.map((vh, idx) => `
                        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.8rem;">
                          <div class="flex items-center justify-between mb-1">
                            <span class="font-bold text-teal">Visit #${idx + 1} • 📅 ${vh.date} 🕒 ${vh.time || ''}</span>
                            <span class="rec-shift-badge ${vh.shift === 'Morning OPD' ? 'shift-morning' : 'shift-evening'}">${vh.shift || 'OPD'}</span>
                          </div>
                          <div class="font-semibold text-main">Diagnosis: ${vh.diagnosis || 'General Checkup'}</div>
                          ${vh.findings ? `<div class="text-xs text-muted mt-1">Findings: ${vh.findings}</div>` : ''}
                          ${vh.medicines && vh.medicines.length > 0 ? `
                            <div class="rec-med-pills mt-1">
                              ${vh.medicines.map(m => `<span class="rec-med-chip">℞ ${m.name} (${m.frequency})</span>`).join('')}
                            </div>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Section 0: Critical Medical Safety Alerts & External RVG ID Strip -->
                <div class="safety-and-xray-card">
                  <div class="safety-alerts-box">
                    <label class="text-xs font-bold text-red block mb-1">
                      ⚠️ Critical Medical Safety Flags (Click to Toggle Alert):
                    </label>
                    <div class="safety-chips-row">
                      ${CRITICAL_ALERTS_LIST.map(alertText => {
                        const isChecked = this.activeAlerts.includes(alertText);
                        return `
                          <button type="button" class="btn-safety-chip ${isChecked ? 'active' : ''}" data-alert="${alertText}">
                            ${alertText}
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <!-- 1-Line Text Field for External RVG X-Ray ID -->
                  <div class="rvg-input-field mt-2">
                    <label for="doc-rvg-id" class="text-xs font-bold text-blue block mb-1">
                      📷 External Dental X-Ray / RVG Machine Software Ref ID (1-Line Text):
                    </label>
                    <input 
                      type="text" 
                      id="doc-rvg-id" 
                      class="form-input form-input-sm" 
                      placeholder="e.g. RVG-402, OPG-108 (Clinic uses dedicated external X-ray software for images)"
                      value="${selectedPatient.externalRvgId || ''}"
                    />
                  </div>
                </div>

                <!-- Fast 1-Click Rx Combos Strip -->
                <div class="quick-template-strip mt-3">
                  <span class="text-xs font-bold text-muted">⚡ 1-Click Disease Rx Combos:</span>
                  <div class="template-buttons">
                    ${Object.entries(RX_TEMPLATES).map(([key, tpl]) => `
                      <button type="button" class="btn-template-chip" data-key="${key}">
                        ${tpl.name}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <form id="doctor-checkup-prescription-form">
                  <!-- Section 1: Clinical Checkup Notes -->
                  <div class="form-section-card mt-3">
                    <div class="sec-title">
                      <span class="sec-num">1</span>
                      <h4>Clinical Examination & Patient Notes</h4>
                    </div>

                    <div class="form-row-grid">
                      <div class="form-field full-width">
                        <label for="doc-chief-complaints">Chief Complaints & History <span class="req">*</span></label>
                        <input type="text" id="doc-chief-complaints" class="form-input" placeholder="e.g. Severe throbbing toothache since 3 days / persistent cystic acne with dark spots" value="${selectedPatient.clinicalNotes ? selectedPatient.clinicalNotes.chiefComplaints : (selectedPatient.reason || '')}" required />
                      </div>

                      <div class="form-field">
                        <label for="doc-duration">Duration of Symptoms</label>
                        <input type="text" id="doc-duration" class="form-input" placeholder="e.g. 3 Days, 2 Weeks, 6 Months" value="${selectedPatient.clinicalNotes ? selectedPatient.clinicalNotes.duration : '3 Days'}" />
                      </div>

                      <div class="form-field">
                        <label for="doc-diagnosis">Clinical Diagnosis <span class="req">*</span></label>
                        <input type="text" id="doc-diagnosis" class="form-input font-bold text-teal-dark" placeholder="e.g. Acute Irreversible Pulpitis #46 / Acne Vulgaris Grade III" value="${selectedPatient.clinicalNotes ? selectedPatient.clinicalNotes.diagnosis : ''}" required />
                      </div>

                      <div class="form-field full-width">
                        <label for="doc-clinical-findings">Clinical Findings & Examination Observations</label>
                        <textarea id="doc-clinical-findings" class="form-textarea" rows="2" placeholder="e.g. Deep disto-occlusal decay, positive percussion (++), localized edema...">${selectedPatient.clinicalNotes ? selectedPatient.clinicalNotes.clinicalFindings : ''}</textarea>
                      </div>

                      <div class="form-field full-width">
                        <label for="doc-treatment-done">Clinical Remarks & Procedure Performed</label>
                        <textarea id="doc-treatment-done" class="form-textarea" rows="2" placeholder="e.g. Single-sitting rotary biomechanical preparation, bioceramic obturation...">${selectedPatient.clinicalNotes ? selectedPatient.clinicalNotes.treatmentDone : ''}</textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Section 2: Prescription Builder with Selective Medicine Box -->
                  <div class="form-section-card mt-4">
                    <div class="sec-title-between">
                      <div class="sec-title">
                        <span class="sec-num">2</span>
                        <div>
                          <h4>Doctor's Prescription (Rx) & Selective Medicines</h4>
                          <p class="text-xs text-muted">Use the selective medicine box below or type to search and insert</p>
                        </div>
                      </div>
                      <div class="flex-actions-gap">
                        <button type="button" class="btn btn-sm ${this.isFormularyBoxOpen ? 'btn-teal' : 'btn-outline'}" id="btn-toggle-formulary-box">
                          ${this.isFormularyBoxOpen ? '▼ Hide Selective Box' : '💊 Selective Medicine Box'}
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" id="btn-add-medicine-row">
                          + Add Blank Row
                        </button>
                      </div>
                    </div>

                    <!-- SELECTIVE MEDICINE BOX COMPONENT -->
                    <div class="selective-medicine-box ${this.isFormularyBoxOpen ? 'open' : 'collapsed'}" id="selective-medicine-box">
                      <div class="formulary-box-header">
                        <div class="formulary-title-group">
                          <div class="formulary-pill-tag">
                            <span class="live-dot"></span> Selective Hospital Medicine Box
                          </div>
                          <span class="text-xs text-muted">Search 35+ verified clinic formulations across Dental, Skin, Antibiotics, Pain & Pediatrics</span>
                        </div>
                        <div class="formulary-actions-right">
                          <button type="button" class="btn btn-xs btn-outline" id="btn-toggle-custom-med">
                            ${this.showAddCustomMed ? '✕ Close Form' : '+ Add Custom Medicine'}
                          </button>
                        </div>
                      </div>

                      <!-- Collapsible Custom Medicine Adder -->
                      <div id="custom-medicine-adder-panel" class="custom-medicine-adder-panel ${this.showAddCustomMed ? 'active' : 'hidden'}">
                        <div class="custom-adder-title">
                          <strong>Register New Medicine to Clinic Formulary</strong>
                          <span class="text-xs text-muted">Instantly selectable and stored permanently</span>
                        </div>
                        <div class="custom-adder-grid">
                          <div>
                            <label class="text-xs font-semibold">Medicine Brand & Strength *</label>
                            <input type="text" id="cust-med-name" class="form-input form-input-sm" placeholder="e.g. Cefixime 200mg / Clindac A Gel" />
                          </div>
                          <div>
                            <label class="text-xs font-semibold">Form</label>
                            <select id="cust-med-type" class="form-select form-input-sm">
                              <option value="Tablet">Tablet</option>
                              <option value="Capsule">Capsule</option>
                              <option value="Gel">Gel / Cream / Ointment</option>
                              <option value="Syrup">Syrup / Suspension</option>
                              <option value="Liquid">Liquid Mouthwash / Solution</option>
                              <option value="Drops">Drops</option>
                            </select>
                          </div>
                          <div>
                            <label class="text-xs font-semibold">Category</label>
                            <select id="cust-med-cat" class="form-select form-input-sm">
                              <option value="dental">Dental & Oral Care</option>
                              <option value="derm">Dermatology & Skin</option>
                              <option value="antibiotic">Antibiotics</option>
                              <option value="pain">Pain & Swelling</option>
                              <option value="pediatric">Pediatric</option>
                              <option value="antacid">Antacids</option>
                              <option value="rinse">Mouthwashes & Topicals</option>
                            </select>
                          </div>
                          <div>
                            <label class="text-xs font-semibold">Default Dosage Frequency</label>
                            <input type="text" id="cust-med-freq" class="form-input form-input-sm" placeholder="e.g. 1-0-1 (After Food)" value="1-0-1 (After Food)" />
                          </div>
                          <div>
                            <label class="text-xs font-semibold">Duration</label>
                            <input type="text" id="cust-med-dur" class="form-input form-input-sm" placeholder="e.g. 5 Days" value="5 Days" />
                          </div>
                          <div>
                            <label class="text-xs font-semibold">Instructions / Use</label>
                            <input type="text" id="cust-med-inst" class="form-input form-input-sm" placeholder="e.g. Take with water after meal" value="Take with water after food" />
                          </div>
                        </div>
                        <div class="custom-adder-actions">
                          <button type="button" class="btn btn-teal btn-sm" id="btn-save-custom-med">
                            💾 Save to Formulary & Insert into Rx
                          </button>
                        </div>
                      </div>

                      <!-- Search & 8 Category Pills -->
                      <div class="formulary-search-toolbar">
                        <div class="formulary-search-input-wrap">
                          <span class="search-icon">🔍</span>
                          <input type="text" id="formulary-search-input" class="formulary-search-input" placeholder="Type medicine name, generic composition, or disease (e.g. Amox, Ketorol, Acne, Sunscreen, Gel)..." value="${this.formularySearchQuery}" />
                          ${this.formularySearchQuery ? `<button type="button" class="search-clear-btn" id="btn-clear-med-search" title="Clear Search">✕</button>` : ''}
                        </div>

                        <!-- 8 Category Filter Pills -->
                        <div class="formulary-category-pills" id="formulary-category-pills">
                          ${MEDICINE_CATEGORIES.map(cat => `
                            <button type="button" class="med-cat-pill ${this.formularyCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                              <span>${cat.icon}</span> ${cat.label}
                            </button>
                          `).join('')}
                        </div>
                      </div>

                      <!-- Status & Cards -->
                      <div class="formulary-results-status" id="formulary-results-status"></div>
                      <div class="formulary-cards-container" id="formulary-cards-container"></div>
                    </div>

                    <!-- Prescription Items Table -->
                    <div class="table-responsive mt-3">
                      <table class="medicine-builder-table">
                        <thead>
                          <tr>
                            <th style="width: 30%;">Medicine Name & Strength</th>
                            <th style="width: 14%;">Form</th>
                            <th style="width: 20%;">Dosage & Frequency</th>
                            <th style="width: 12%;">Duration</th>
                            <th style="width: 18%;">Instructions</th>
                            <th style="width: 6%; text-align: center;">Delete</th>
                          </tr>
                        </thead>
                        <tbody id="medicine-rows-body"></tbody>
                      </table>
                    </div>

                    <div class="form-row-grid mt-3">
                      <div class="form-field full-width">
                        <label for="doc-special-advice">Special Doctor's Advice & Patient Precautions</label>
                        <input type="text" id="doc-special-advice" class="form-input" placeholder="e.g. Avoid hard food on right side. Warm saline gargles. Return for crown measurement." value="${selectedPatient.prescription ? selectedPatient.prescription.specialAdvice : ''}" />
                      </div>

                      <div class="form-field">
                        <label for="doc-followup-date">Recommended Follow-Up Date</label>
                        <input type="date" id="doc-followup-date" class="form-input" value="${selectedPatient.prescription ? selectedPatient.prescription.followUpDate : ''}" />
                        <!-- Quick Follow-up Days -->
                        <div class="followup-quick-chips mt-1">
                          <span class="text-xs text-muted">Quick:</span>
                          <button type="button" class="btn-follow-chip" data-days="3">+3d</button>
                          <button type="button" class="btn-follow-chip" data-days="5">+5d</button>
                          <button type="button" class="btn-follow-chip" data-days="7">+7d</button>
                          <button type="button" class="btn-follow-chip" data-days="15">+15d</button>
                        </div>
                      </div>

                      <!-- Dental Crown / Lab Work Tracker -->
                      <div class="form-field">
                        <label for="doc-dental-lab-status">Dental Crown & Prosthetic Lab Work Tracker</label>
                        <select id="doc-dental-lab-status" class="form-select">
                          <option value="No Lab Work" ${this.dentalLabStatus === 'No Lab Work' ? 'selected' : ''}>No Lab Work</option>
                          <option value="Sent to Lab" ${this.dentalLabStatus === 'Sent to Lab' ? 'selected' : ''}>Sent to Dental Lab</option>
                          <option value="Crown Received" ${this.dentalLabStatus === 'Crown Received' ? 'selected' : ''}>Crown Received from Lab</option>
                          <option value="Delivered" ${this.dentalLabStatus === 'Delivered' ? 'selected' : ''}>Delivered & Cemented</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Section 3: Billing Fee Setup for Reception -->
                  <div class="form-section-card mt-4">
                    <div class="sec-title">
                      <span class="sec-num">3</span>
                      <h4>Billing Charges Forward to Reception Desk</h4>
                    </div>

                    <div class="form-row-grid">
                      <div class="form-field">
                        <label for="doc-consultation-fee">Consultation Fee (₹)</label>
                        <input type="number" id="doc-consultation-fee" class="form-input" value="${selectedPatient.billing ? selectedPatient.billing.consultationFee : (config.defaultConsultationFees[activeDoctor.id] || activeDoctor.defaultFee || 350)}" min="0" required />
                      </div>

                      <div class="form-field">
                        <label for="doc-procedure-fee">Clinical Procedure / Treatment Fee (₹)</label>
                        <input type="number" id="doc-procedure-fee" class="form-input" value="${selectedPatient.billing ? selectedPatient.billing.procedureFee : 0}" min="0" placeholder="0" />
                      </div>
                    </div>
                  </div>

                  <!-- Submit Bar with Multilingual Rx Print Switch & Certificates -->
                  <div class="checkup-submit-bar mt-4">
                    <button type="submit" class="btn btn-primary btn-lg glow-teal" id="btn-save-checkup">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Save Checkup & Send to Reception Billing
                    </button>

                    <!-- Multilingual Rx Print Switch -->
                    <div class="rx-print-language-group">
                      <span class="text-xs font-bold text-muted">Print Rx Language:</span>
                      <div class="lang-pills">
                        <button type="button" class="btn-lang-pill ${this.prescriptionLang === 'mr' ? 'active' : ''}" data-lang="mr">मराठी</button>
                        <button type="button" class="btn-lang-pill ${this.prescriptionLang === 'hi' ? 'active' : ''}" data-lang="hi">हिंदी</button>
                        <button type="button" class="btn-lang-pill ${this.prescriptionLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
                      </div>
                      ${selectedPatient.prescription ? `
                        <button type="button" class="btn btn-outline btn-sm" id="btn-print-active-rx">
                          🖨️ Print Prescription
                        </button>
                      ` : ''}
                    </div>

                    <!-- 1-Click Clinical Certificates & WhatsApp Post-Care -->
                    <div class="certificates-group mt-2">
                      <button type="button" class="btn btn-outline btn-sm" id="btn-print-consent-form">
                        📝 Print Consent Form
                      </button>
                      <button type="button" class="btn btn-outline btn-sm" id="btn-print-fitness-cert">
                        📄 Print Fitness Certificate
                      </button>
                      <button type="button" class="btn btn-emerald btn-sm" id="btn-whatsapp-postcare">
                        💬 WhatsApp Post-Care (Marathi)
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(selectedPatient, activeDoctor, config);
  }

  // Renders the Selective Medicine Cards inside the Selective Medicine Box
  renderFormularyCards() {
    const container = this.container.querySelector('#formulary-cards-container');
    const statusEl = this.container.querySelector('#formulary-results-status');
    if (!container) return;

    const results = medicinesFormulary.search(this.formularySearchQuery, this.formularyCategory);

    if (statusEl) {
      const activeCatObj = MEDICINE_CATEGORIES.find(c => c.id === this.formularyCategory) || MEDICINE_CATEGORIES[0];
      statusEl.innerHTML = `
        <span>Showing <strong>${results.length}</strong> medicines in <em>"${activeCatObj.label}"</em>${this.formularySearchQuery ? ` matching "<strong>${this.formularySearchQuery}</strong>"` : ''}</span>
        <span class="text-xs text-muted">Click any medicine card to insert directly into prescription</span>
      `;
    }

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-formulary-state">
          <div style="font-size: 2rem;">🔍</div>
          <p>No medicines matched "<strong>${this.formularySearchQuery}</strong>" in this category.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = results.map(m => `
      <div class="formulary-med-card" data-id="${m.id}">
        <div class="fmc-top">
          <div class="fmc-name-wrap">
            <span class="fmc-type-badge ${m.type.toLowerCase()}">${m.type}</span>
            <strong class="fmc-name">${m.name}</strong>
          </div>
          <button type="button" class="btn-insert-rx" data-id="${m.id}" title="Click to insert into prescription">
            <span>+ Insert in Rx</span>
          </button>
        </div>

        <div class="fmc-details">
          <span class="fmc-freq">⏱️ ${m.frequency}</span>
          <span class="fmc-dur">📅 ${m.duration}</span>
        </div>

        ${m.commonFor ? `
          <div class="fmc-common text-xs">
            <span class="indication-label">Common For:</span> ${m.commonFor}
          </div>
        ` : ''}

        ${m.instructions ? `
          <div class="fmc-inst text-xs text-muted">
            <em>Advice:</em> ${m.instructions}
          </div>
        ` : ''}
      </div>
    `).join('');

    // Bind insertion clicks
    container.querySelectorAll('.btn-insert-rx').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const medId = btn.getAttribute('data-id');
        const med = medicinesFormulary.getAllMedicines().find(m => m.id === medId);
        if (med) {
          this.insertMedicineIntoPrescription(med, btn);
        }
      });
    });

    container.querySelectorAll('.formulary-med-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-insert-rx')) return;
        const medId = card.getAttribute('data-id');
        const med = medicinesFormulary.getAllMedicines().find(m => m.id === medId);
        const btn = card.querySelector('.btn-insert-rx');
        if (med) {
          this.insertMedicineIntoPrescription(med, btn);
        }
      });
    });
  }

  insertMedicineIntoPrescription(med, targetBtn = null) {
    const emptyRowIdx = this.medicineRows.findIndex(r => !r.name || r.name.trim() === '');
    const newRowData = {
      name: med.name,
      type: med.type || 'Tablet',
      frequency: med.frequency || '1-0-1 (After Food)',
      duration: med.duration || '5 Days',
      instructions: med.instructions || 'Take with water after meals'
    };

    if (emptyRowIdx !== -1) {
      this.medicineRows[emptyRowIdx] = newRowData;
    } else {
      this.medicineRows.push(newRowData);
    }

    this.renderMedicineRows();
    playClinicChime('success');
    notificationEngine.vibrate(50);

    if (targetBtn) {
      const originalText = targetBtn.innerHTML;
      targetBtn.innerHTML = `<span>✓ Added!</span>`;
      targetBtn.classList.add('added');
      setTimeout(() => {
        targetBtn.innerHTML = originalText;
        targetBtn.classList.remove('added');
      }, 1000);
    }
  }

  renderMedicineRows() {
    const tbody = this.container.querySelector('#medicine-rows-body');
    if (!tbody) return;

    if (this.medicineRows.length === 0) {
      this.medicineRows.push({
        name: "",
        type: "Tablet",
        frequency: "1-0-1 (After Food)",
        duration: "5 Days",
        instructions: "Take with water"
      });
    }

    tbody.innerHTML = this.medicineRows.map((med, idx) => `
      <tr class="med-row" data-idx="${idx}">
        <td class="med-cell-name-wrap">
          <div class="inline-autocomplete-wrapper">
            <input 
              type="text" 
              class="form-input med-name" 
              placeholder="Type to search or select medicine..." 
              value="${med.name || ''}" 
              data-idx="${idx}"
              autocomplete="off"
              required 
            />
            <button type="button" class="btn-inline-browse-box" data-idx="${idx}" title="Open Selective Medicine Box">💊</button>
            <div class="inline-autocomplete-dropdown hidden" id="autocomplete-dropdown-${idx}"></div>
          </div>
        </td>
        <td>
          <select class="form-select med-type">
            <option value="Tablet" ${med.type === 'Tablet' ? 'selected' : ''}>Tablet</option>
            <option value="Capsule" ${med.type === 'Capsule' ? 'selected' : ''}>Capsule</option>
            <option value="Gel" ${med.type === 'Gel' ? 'selected' : ''}>Gel / Cream</option>
            <option value="Syrup" ${med.type === 'Syrup' ? 'selected' : ''}>Syrup</option>
            <option value="Liquid" ${med.type === 'Liquid' ? 'selected' : ''}>Mouthwash / Gargle</option>
            <option value="Drops" ${med.type === 'Drops' ? 'selected' : ''}>Drops</option>
          </select>
        </td>
        <td>
          <select class="form-select med-freq">
            <option value="1-0-1 (After Food)" ${med.frequency === '1-0-1 (After Food)' ? 'selected' : ''}>1-0-1 (Morning-Night, After Food)</option>
            <option value="1-1-1 (After Food)" ${med.frequency === '1-1-1 (After Food)' ? 'selected' : ''}>1-1-1 (Three times daily)</option>
            <option value="1-0-0 (Empty Stomach)" ${med.frequency === '1-0-0 (Empty Stomach)' ? 'selected' : ''}>1-0-0 (Morning Empty Stomach)</option>
            <option value="0-0-1 (Bedtime)" ${med.frequency === '0-0-1 (Bedtime)' ? 'selected' : ''}>0-0-1 (Night Bedtime)</option>
            <option value="SOS (When Needed for Pain)" ${med.frequency === 'SOS (When Needed for Pain)' ? 'selected' : ''}>SOS (When Needed for Pain)</option>
            <option value="Every 4 Hours" ${med.frequency === 'Every 4 Hours' ? 'selected' : ''}>Every 4 Hours</option>
            <option value="5ml twice daily (After Food)" ${med.frequency === '5ml twice daily (After Food)' ? 'selected' : ''}>5ml twice daily</option>
          </select>
        </td>
        <td>
          <input type="text" class="form-input med-duration" placeholder="e.g. 5 Days" value="${med.duration || '5 Days'}" />
        </td>
        <td>
          <input type="text" class="form-input med-instructions" placeholder="e.g. After food with water" value="${med.instructions || 'Take after food'}" />
        </td>
        <td class="text-center">
          <button type="button" class="btn-delete-row" data-idx="${idx}" title="Remove Medicine">✕</button>
        </td>
      </tr>
    `).join('');

    // Bind row deletes
    tbody.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.medicineRows.splice(idx, 1);
        this.renderMedicineRows();
      });
    });

    // Bind row input listeners & Autocomplete
    tbody.querySelectorAll('.med-row').forEach(row => {
      const idx = parseInt(row.getAttribute('data-idx'), 10);
      const nameInput = row.querySelector('.med-name');
      const typeSelect = row.querySelector('.med-type');
      const freqSelect = row.querySelector('.med-freq');
      const durInput = row.querySelector('.med-duration');
      const instInput = row.querySelector('.med-instructions');
      const dropdown = row.querySelector(`#autocomplete-dropdown-${idx}`);
      const btnBrowse = row.querySelector('.btn-inline-browse-box');

      if (typeSelect) {
        typeSelect.addEventListener('change', (e) => { this.medicineRows[idx].type = e.target.value; });
      }
      if (freqSelect) {
        freqSelect.addEventListener('change', (e) => { this.medicineRows[idx].frequency = e.target.value; });
      }
      if (durInput) {
        durInput.addEventListener('input', (e) => { this.medicineRows[idx].duration = e.target.value; });
      }
      if (instInput) {
        instInput.addEventListener('input', (e) => { this.medicineRows[idx].instructions = e.target.value; });
      }

      if (btnBrowse) {
        btnBrowse.addEventListener('click', () => {
          this.isFormularyBoxOpen = true;
          const box = this.container.querySelector('#selective-medicine-box');
          if (box) box.className = 'selective-medicine-box open';
          const searchInput = this.container.querySelector('#formulary-search-input');
          if (searchInput) {
            searchInput.focus();
            box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }

      // Live Autocomplete typing in the Medicine input
      if (nameInput && dropdown) {
        const updateDropdown = () => {
          const val = nameInput.value.trim();
          this.medicineRows[idx].name = nameInput.value;
          const matches = medicinesFormulary.search(val).slice(0, 7);

          if (matches.length === 0) {
            dropdown.classList.add('hidden');
            return;
          }

          dropdown.innerHTML = `
            <div class="autocomplete-head">
              <span>Matching Medicines (${matches.length})</span>
              <span class="text-xs text-muted">Click to pick</span>
            </div>
            ${matches.map(m => `
              <div class="autocomplete-item" data-id="${m.id}">
                <div class="ac-item-row">
                  <span class="ac-badge ${m.type.toLowerCase()}">${m.type}</span>
                  <strong class="ac-name">${m.name}</strong>
                </div>
                <div class="ac-meta text-xs">
                  <span>${m.frequency}</span> • <span>${m.duration}</span>
                </div>
              </div>
            `).join('')}
          `;
          dropdown.classList.remove('hidden');

          dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
              e.preventDefault();
              const medId = item.getAttribute('data-id');
              const selectedMed = medicinesFormulary.getAllMedicines().find(m => m.id === medId);
              if (selectedMed) {
                this.medicineRows[idx] = {
                  name: selectedMed.name,
                  type: selectedMed.type || 'Tablet',
                  frequency: selectedMed.frequency || '1-0-1 (After Food)',
                  duration: selectedMed.duration || '5 Days',
                  instructions: selectedMed.instructions || 'Take with water after meals'
                };
                dropdown.classList.add('hidden');
                this.renderMedicineRows();
                playClinicChime('success');
              }
            });
          });
        };

        nameInput.addEventListener('input', updateDropdown);
        nameInput.addEventListener('focus', updateDropdown);
        nameInput.addEventListener('blur', () => {
          setTimeout(() => dropdown.classList.add('hidden'), 200);
        });
      }
    });
  }

  bindEvents(selectedPatient, activeDoctor, config) {
    // 1. Mobile Segmented Tab Controls
    const btnTabQ = this.container.querySelector('#btn-doc-tab-queue');
    const btnTabW = this.container.querySelector('#btn-doc-tab-workspace');
    if (btnTabQ) {
      btnTabQ.addEventListener('click', () => {
        this.mobileTab = 'queue';
        this.render();
      });
    }
    if (btnTabW) {
      btnTabW.addEventListener('click', () => {
        this.mobileTab = 'workspace';
        this.render();
      });
    }

    const btnBackQ = this.container.querySelector('#btn-back-to-queue-mobile');
    if (btnBackQ) {
      btnBackQ.addEventListener('click', () => {
        this.mobileTab = 'queue';
        this.render();
      });
    }

    // 2. Doctor Switcher Pills
    this.container.querySelectorAll('.doc-tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        this.setDoctor(docId);
      });
    });

    // 3. Queue Real-time Search Input
    const queueSearchInput = this.container.querySelector('#doc-queue-search-input');
    const btnClearSearch = this.container.querySelector('#btn-clear-doc-search');
    if (queueSearchInput) {
      queueSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const reSearch = this.container.querySelector('#doc-queue-search-input');
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

    // 4. Queue Doctor Filter Pills
    this.container.querySelectorAll('.q-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.queueFilter = pill.getAttribute('data-filter');
        this.render();
      });
    });

    // 4b. Queue Date Filter Pills & Picker
    this.container.querySelectorAll('.q-date-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.dateFilter = pill.getAttribute('data-date');
        this.render();
      });
    });

    const datePicker = this.container.querySelector('#doc-queue-date-picker');
    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        this.dateFilter = e.target.value || 'all';
        this.render();
      });
    }

    // 4c. Queue Shift Select
    const shiftSelect = this.container.querySelector('#doc-queue-shift-select');
    if (shiftSelect) {
      shiftSelect.addEventListener('change', (e) => {
        this.shiftFilter = e.target.value;
        this.render();
      });
    }

    // 5. Queue Patient 1-Tap Click Selection (Works on Mobile, Tablet & Desktop)
    this.container.querySelectorAll('.compact-queue-row, .btn-attend-patient').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = el.getAttribute('data-id') || el.closest('[data-id]')?.getAttribute('data-id');
        if (pid) {
          playClinicChime('click');
          notificationEngine.vibrate(50);
          this.setPatient(pid);
        }
      });
    });

    // 5b. Open Full MRD Archive from workspace
    const btnMrdArchive = this.container.querySelector('#btn-view-mrd-archive');
    if (btnMrdArchive) {
      btnMrdArchive.addEventListener('click', () => {
        this.onNavigate('records');
      });
    }

    if (!selectedPatient) return;

    this.renderMedicineRows();
    this.renderFormularyCards();

    // Critical Alert Chips Toggle
    this.container.querySelectorAll('.btn-safety-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const alertName = btn.getAttribute('data-alert');
        if (this.activeAlerts.includes(alertName)) {
          this.activeAlerts = this.activeAlerts.filter(a => a !== alertName);
          btn.classList.remove('active');
        } else {
          this.activeAlerts.push(alertName);
          btn.classList.add('active');
          notificationEngine.vibrate(50);
        }
      });
    });

    // Toggle Selective Medicine Box
    const btnToggleFormulary = this.container.querySelector('#btn-toggle-formulary-box');
    const boxEl = this.container.querySelector('#selective-medicine-box');
    if (btnToggleFormulary && boxEl) {
      btnToggleFormulary.addEventListener('click', () => {
        this.isFormularyBoxOpen = !this.isFormularyBoxOpen;
        boxEl.className = `selective-medicine-box ${this.isFormularyBoxOpen ? 'open' : 'collapsed'}`;
        btnToggleFormulary.textContent = this.isFormularyBoxOpen ? '▼ Hide Selective Box' : '💊 Selective Medicine Box';
      });
    }

    // Toggle Custom Medicine Adder Panel
    const btnToggleCustom = this.container.querySelector('#btn-toggle-custom-med');
    const customPanel = this.container.querySelector('#custom-medicine-adder-panel');
    if (btnToggleCustom && customPanel) {
      btnToggleCustom.addEventListener('click', () => {
        this.showAddCustomMed = !this.showAddCustomMed;
        customPanel.className = `custom-medicine-adder-panel ${this.showAddCustomMed ? 'active' : 'hidden'}`;
        btnToggleCustom.textContent = this.showAddCustomMed ? '✕ Close Form' : '+ Add Custom Medicine';
      });
    }

    // Save Custom Medicine
    const btnSaveCustom = this.container.querySelector('#btn-save-custom-med');
    if (btnSaveCustom) {
      btnSaveCustom.addEventListener('click', () => {
        const name = this.container.querySelector('#cust-med-name').value.trim();
        const type = this.container.querySelector('#cust-med-type').value;
        const category = this.container.querySelector('#cust-med-cat').value;
        const frequency = this.container.querySelector('#cust-med-freq').value.trim();
        const duration = this.container.querySelector('#cust-med-dur').value.trim();
        const instructions = this.container.querySelector('#cust-med-inst').value.trim();

        if (!name) {
          alert('Please enter medicine name and strength.');
          return;
        }

        const newMed = medicinesFormulary.addCustomMedicine({
          name,
          type,
          category,
          frequency: frequency || '1-0-1 (After Food)',
          duration: duration || '5 Days',
          instructions: instructions || 'Take with water after meals'
        });

        this.insertMedicineIntoPrescription(newMed);
        this.showAddCustomMed = false;
        if (customPanel) customPanel.className = 'custom-medicine-adder-panel hidden';
        if (btnToggleCustom) btnToggleCustom.textContent = '+ Add Custom Medicine';
        this.renderFormularyCards();
      });
    }

    // Formulary Live Search
    const searchInput = this.container.querySelector('#formulary-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.formularySearchQuery = e.target.value;
        this.renderFormularyCards();
      });
    }

    // Formulary Category Pills
    this.container.querySelectorAll('.med-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.formularyCategory = pill.getAttribute('data-cat');
        this.container.querySelectorAll('.med-cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.renderFormularyCards();
      });
    });

    // Add Empty Medicine Row
    const btnAddMed = this.container.querySelector('#btn-add-medicine-row');
    if (btnAddMed) {
      btnAddMed.addEventListener('click', () => {
        this.medicineRows.push({
          name: "",
          type: "Tablet",
          frequency: "1-0-1 (After Food)",
          duration: "5 Days",
          instructions: "Take with water"
        });
        this.renderMedicineRows();
      });
    }

    // 1-Click Disease Rx Combos
    this.container.querySelectorAll('.btn-template-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const tpl = RX_TEMPLATES[key];
        if (tpl) {
          const diagInput = this.container.querySelector('#doc-diagnosis');
          const findingsInput = this.container.querySelector('#doc-clinical-findings');
          const treatmentInput = this.container.querySelector('#doc-treatment-done');
          const adviceInput = this.container.querySelector('#doc-special-advice');
          const consultInput = this.container.querySelector('#doc-consultation-fee');
          const procInput = this.container.querySelector('#doc-procedure-fee');

          if (diagInput) diagInput.value = tpl.diagnosis;
          if (findingsInput) findingsInput.value = tpl.findings;
          if (treatmentInput) treatmentInput.value = tpl.treatmentDone;
          if (adviceInput) adviceInput.value = tpl.specialAdvice;
          if (consultInput) consultInput.value = tpl.consultationFee;
          if (procInput) procInput.value = tpl.procedureFee;

          this.medicineRows = JSON.parse(JSON.stringify(tpl.medicines));
          this.renderMedicineRows();
          playClinicChime('success');
          notificationEngine.vibrate(50);
        }
      });
    });

    // Quick Follow-up Day Buttons
    this.container.querySelectorAll('.btn-follow-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.getAttribute('data-days'), 10);
        const targetDate = new Date(Date.now() + days * 86400000);
        const dateInput = this.container.querySelector('#doc-followup-date');
        if (dateInput) {
          dateInput.value = targetDate.toISOString().split('T')[0];
        }
      });
    });

    // Prescription Language Switcher Pills
    this.container.querySelectorAll('.btn-lang-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.prescriptionLang = btn.getAttribute('data-lang');
        this.container.querySelectorAll('.btn-lang-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playClinicChime('click');
      });
    });

    // Print Active Prescription
    const btnPrintRx = this.container.querySelector('#btn-print-active-rx');
    if (btnPrintRx) {
      btnPrintRx.addEventListener('click', () => {
        printPrescription(selectedPatient, config, this.prescriptionLang);
      });
    }

    // Print Consent Form
    const btnConsent = this.container.querySelector('#btn-print-consent-form');
    if (btnConsent) {
      btnConsent.addEventListener('click', () => {
        printConsentForm(selectedPatient, config, this.prescriptionLang === 'en' ? 'en' : 'mr');
      });
    }

    // Print Fitness Certificate
    const btnFitness = this.container.querySelector('#btn-print-fitness-cert');
    if (btnFitness) {
      btnFitness.addEventListener('click', () => {
        printFitnessCertificate(selectedPatient, config);
      });
    }

    // WhatsApp Marathi Post-Care Instructions
    const btnWhatsAppPostcare = this.container.querySelector('#btn-whatsapp-postcare');
    if (btnWhatsAppPostcare) {
      btnWhatsAppPostcare.addEventListener('click', () => {
        const diag = this.container.querySelector('#doc-diagnosis').value || 'उपचार';
        const advice = this.container.querySelector('#doc-special-advice').value || 'औषधे वेळेवर घ्या';
        const msg = encodeURIComponent(
          `*चौधरी स्किन ॲन्ड डेंटल केअर क्लिनिक, खामगाव*\n\n` +
          `नमस्ते ${selectedPatient.name},\n` +
          `तुमची तपासणी पूर्ण झाली आहे.\n` +
          `*निदान:* ${diag}\n` +
          `*महत्त्वाच्या सूचना:* ${advice}\n\n` +
          `औषधे वेळेवर व डॉक्टरांच्या सल्ल्यानुसार नियमितपणे घ्यावीत.\n` +
          `काही त्रास झाल्यास तात्काळ संपर्क करा: +91 90498 83983`
        );
        window.open(`https://wa.me/91${selectedPatient.phone}?text=${msg}`, '_blank');
      });
    }

    // Save Checkup & Send to Reception Billing (Fires Real-Time Notification!)
    const form = this.container.querySelector('#doctor-checkup-prescription-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const chiefComplaints = this.container.querySelector('#doc-chief-complaints').value;
        const duration = this.container.querySelector('#doc-duration').value;
        const diagnosis = this.container.querySelector('#doc-diagnosis').value;
        const clinicalFindings = this.container.querySelector('#doc-clinical-findings').value;
        const treatmentDone = this.container.querySelector('#doc-treatment-done').value;
        const specialAdvice = this.container.querySelector('#doc-special-advice').value;
        const followUpDate = this.container.querySelector('#doc-followup-date').value;
        const externalRvgId = this.container.querySelector('#doc-rvg-id').value.trim();
        const labStatus = this.container.querySelector('#doc-dental-lab-status').value;

        const consultationFee = parseFloat(this.container.querySelector('#doc-consultation-fee').value) || 0;
        const procedureFee = parseFloat(this.container.querySelector('#doc-procedure-fee').value) || 0;
        const medicineFee = 0;
        const totalBill = consultationFee + procedureFee;

        // Gather medicines from table rows
        const medRows = [];
        this.container.querySelectorAll('.med-row').forEach(row => {
          const name = row.querySelector('.med-name').value.trim();
          const type = row.querySelector('.med-type').value;
          const frequency = row.querySelector('.med-freq').value;
          const dur = row.querySelector('.med-duration').value.trim();
          const instructions = row.querySelector('.med-instructions') ? row.querySelector('.med-instructions').value.trim() : '';
          
          if (name) {
            medRows.push({
              name,
              type,
              frequency,
              duration: dur || '5 Days',
              instructions: instructions || 'Take with water after meal'
            });
          }
        });

        if (medRows.length === 0) {
          alert('Please prescribe at least one medicine or clinical formulation from the Selective Medicine Box.');
          return;
        }

        const clinicalNotes = {
          checkupDate: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          doctorName: activeDoctor.name,
          chiefComplaints,
          duration,
          clinicalFindings,
          diagnosis,
          treatmentDone
        };

        const prescription = {
          prescribedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          doctorName: activeDoctor.name,
          medicines: medRows,
          specialAdvice,
          followUpDate
        };

        const feeBreakdown = {
          consultationFee,
          procedureFee,
          medicineFee: 0
        };

        // Save to Database
        const updated = hospitalDb.saveClinicalCheckupAndPrescription(selectedPatient.patientId, {
          clinicalNotes,
          prescription,
          feeBreakdown,
          externalRvgId,
          criticalAlerts: this.activeAlerts,
          dentalLab: { status: labStatus, labName: this.dentalLabName, notes: '' }
        });

        playClinicChime('success');
        notificationEngine.vibrate([200, 100, 200]);
        try {
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
        } catch (err) {}

        // Trigger 1 (Doctor -> Reception Live Notification!)
        notificationEngine.notify({
          type: 'CHECKUP_COMPLETED',
          title: `✅ Checkup Done: ${selectedPatient.name}`,
          message: `${selectedPatient.name} (${selectedPatient.patientId}) consulted by ${activeDoctor.name}. Total: ₹${totalBill} ready for Reception Billing Desk.`,
          icon: '💳',
          actionText: 'Open Billing & UPI QR',
          onAction: () => {
            this.onNavigate('billing', selectedPatient.patientId);
          }
        });

        alert(`Checkup and Prescription for ${selectedPatient.name} saved!\nPatient routed to Reception Billing Desk.`);
        this.onNavigate('billing', selectedPatient.patientId);
      });
    }
  }
}
