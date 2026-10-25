import { SYMPTOMS } from '../data/symptoms.js';
import { getDoctorById } from '../data/doctors.js';

export class SymptomMatcher {
  constructor(containerEl, onDoctorSelected) {
    this.container = containerEl;
    this.onDoctorSelected = onDoctorSelected || (() => {});
    this.activeSymptom = SYMPTOMS[0]; // Default: Severe Toothache
    this.isAnalyzing = false;
    this.render();
  }

  selectSymptom(symId) {
    const sym = SYMPTOMS.find(s => s.id === symId);
    if (!sym) return;

    this.isAnalyzing = true;
    this.render();

    setTimeout(() => {
      this.activeSymptom = sym;
      this.isAnalyzing = false;
      this.render();
    }, 350);
  }

  render() {
    const active = this.activeSymptom;
    const doctor = getDoctorById(active.targetDoctorId);
    const secondaryDoctor = active.secondaryDoctorId ? getDoctorById(active.secondaryDoctorId) : null;

    this.container.innerHTML = `
      <div class="symptom-matcher-card">
        <div class="symptom-matcher-header">
          <div class="ai-badge-pill">
            <span class="sparkle-icon">✨</span>
            <span>Intelligent Clinical Triage</span>
          </div>
          <h3 class="matcher-title">Not Sure Which Specialist to Book?</h3>
          <p class="matcher-subtitle">Tap your primary symptom below. Our clinical matcher routes you directly to the right specialist out of our 3 doctors.</p>
        </div>

        <!-- Clickable Symptom Badges -->
        <div class="symptoms-chip-cloud" role="tablist" aria-label="Clinical Symptoms">
          ${SYMPTOMS.map(s => `
            <button type="button" 
              class="symptom-chip ${s.id === active.id ? 'active' : ''}" 
              data-sym-id="${s.id}"
              role="tab"
              aria-selected="${s.id === active.id}">
              <span class="chip-dept-dot ${s.dept}"></span>
              <span class="chip-title">${s.name}</span>
              ${s.urgency.includes('HIGH') ? '<span class="chip-urgency-flair">Urgent</span>' : ''}
            </button>
          `).join('')}
        </div>

        <!-- Result Box -->
        <div class="matcher-result-area ${this.isAnalyzing ? 'analyzing' : ''}">
          ${this.isAnalyzing ? `
            <div class="matcher-loading-state">
              <div class="spinner-clinical"></div>
              <p>Analyzing clinical symptom patterns against OPD schedules...</p>
            </div>
          ` : `
            <div class="recommendation-card animate-fade-in">
              <div class="rec-top-row">
                <div class="rec-confidence">
                  <span class="confidence-meter-icon">✓</span>
                  <strong>${active.confidence}</strong>
                </div>
                <span class="rec-urgency-tag ${active.urgency.includes('HIGH') ? 'urgent' : ''}">${active.urgencyBadge}</span>
              </div>

              <div class="rec-body-grid">
                <div class="rec-doctor-profile">
                  <div class="rec-avatar-wrap">
                    <img src="${doctor.image}" alt="${doctor.name}" class="rec-doctor-avatar" />
                    <span class="rec-avatar-dept-badge ${doctor.department}">
                      ${doctor.department === 'skin' ? 'Dermatology' : 'Dental'}
                    </span>
                  </div>

                  <div class="rec-doctor-details">
                    <span class="doc-badge-pill ${doctor.badgeColor}">${doctor.shortRole}</span>
                    <h4 class="rec-doc-name">${doctor.name}</h4>
                    <p class="rec-doc-creds">${doctor.qualifications}</p>
                    <p class="rec-doc-exp text-teal-dark font-medium">★ ${doctor.rating} Rating • ${doctor.experience}</p>
                    <p class="rec-opd-hours text-xs text-muted"><strong>OPD:</strong> ${doctor.opdTimings}</p>
                  </div>
                </div>

                <div class="rec-clinical-analysis">
                  <h5 class="analysis-heading">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Why Dr. ${doctor.name.split(' ')[1]}?
                  </h5>
                  <p class="analysis-text">${active.reason}</p>

                  <div class="recommended-protocol-box">
                    <span class="protocol-lbl">Recommended Treatment Protocol:</span>
                    <strong class="protocol-val">${active.treatmentRecommendation}</strong>
                  </div>

                  ${secondaryDoctor ? `
                    <div class="secondary-doc-note">
                      <span>Also involves joint evaluation with: <strong>${secondaryDoctor.name}</strong> (${secondaryDoctor.shortRole})</span>
                    </div>
                  ` : ''}

                  <div class="rec-action-row">
                    <button type="button" class="btn btn-primary btn-book-match" id="btn-book-matched-doc">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Book Appointment with ${doctor.name.split(' ')[1]}
                    </button>
                    <span class="instant-slot-hint">⚡ Next Available Slot: Today in Evening OPD</span>
                  </div>
                </div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    // Bind symptom chips
    this.container.querySelectorAll('.symptom-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const symId = btn.getAttribute('data-sym-id');
        this.selectSymptom(symId);
      });
    });

    const bookBtn = this.container.querySelector('#btn-book-matched-doc');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        this.onDoctorSelected({
          doctorId: doctor.id,
          department: doctor.department,
          treatmentId: active.treatmentId,
          isEmergency: active.urgency.includes('HIGH')
        });
      });
    }
  }
}
