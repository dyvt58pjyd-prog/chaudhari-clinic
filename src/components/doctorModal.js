import { getDoctorById } from '../data/doctors.js';

export class DoctorModal {
  constructor(onBookDoctor) {
    this.onBookDoctor = onBookDoctor || (() => {});
    this.currentDoctor = null;
    this.createDom();
  }

  createDom() {
    const el = document.createElement('div');
    el.id = 'doctor-modal-backdrop';
    el.className = 'modal-backdrop hidden';
    el.innerHTML = `
      <div class="modal-card doctor-modal-card">
        <header class="modal-header">
          <div class="modal-header-brand">
            <span class="brand-crest">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7.5" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
            </span>
            <div>
              <h3 class="modal-title">Specialist Clinical Credentials</h3>
              <p class="modal-subtitle">Full CV, Certifications & OPD Consultation Schedule</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-doc-modal">✕</button>
        </header>
        <div class="modal-body" id="doc-modal-body">
          <!-- Injected via render() -->
        </div>
      </div>
    `;

    document.body.appendChild(el);
    this.el = el;
    this.contentEl = el.querySelector('#doc-modal-body');

    this.el.querySelector('#btn-close-doc-modal').addEventListener('click', () => this.close());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });
  }

  open(doctorId) {
    this.currentDoctor = getDoctorById(doctorId);
    this.render();
    this.el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.el.classList.add('hidden');
    document.body.style.overflow = '';
  }

  render() {
    const doc = this.currentDoctor;
    if (!doc) return;

    this.contentEl.innerHTML = `
      <div class="doc-detail-pane animate-fade-in">
        <div class="doc-profile-top-banner">
          <img src="${doc.image}" alt="${doc.name}" class="doc-detail-portrait" />
          <div class="doc-detail-intro">
            <span class="doc-badge-pill ${doc.badgeColor}">${doc.badge}</span>
            <h3 class="detail-name">${doc.name}</h3>
            <p class="detail-role text-teal-dark font-semibold">${doc.role}</p>
            <p class="detail-creds text-xs text-muted">${doc.qualifications}</p>
            <div class="detail-stars">
              <span class="stars">★★★★★</span>
              <strong>${doc.rating} / 5.0</strong>
              <span class="text-xs text-muted">(${doc.reviewCount}+ verified patient reviews)</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="detail-section-title">Professional Biography & Clinical Experience</h4>
          <p class="detail-bio-text">${doc.bio}</p>
        </div>

        <div class="detail-grid-2">
          <div class="detail-box">
            <h5 class="box-title">🏆 Clinical Milestones & Affiliations:</h5>
            <ul class="bullet-list">
              <li>Senior Consultant at Chaudhari Skin and Dental Care Multi-Specialty Clinic.</li>
              <li>Ex-Faculty & Resident Mentor at Top Government Medical & Dental Institutes.</li>
              <li>Active Member: Indian Association of Dermatologists (IADVL) / Indian Dental Association (IDA).</li>
              <li>Trained in Advanced International Protocols (Munich Germany / ICOI USA).</li>
            </ul>
          </div>

          <div class="detail-box">
            <h5 class="box-title">📍 OPD Timings & Consultation Suites:</h5>
            <div class="opd-timing-card">
              <p><strong>OPD Schedule:</strong> ${doc.opdTimings}</p>
              <p><strong>Clinical Operatory:</strong> ${doc.room}</p>
              <p><strong>Emergency Availability:</strong> On-call priority for acute trauma and acute dental pain.</p>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="detail-section-title">Key Core Procedures</h4>
          <div class="focus-tags-cloud">
            ${doc.focus.map(f => `<span class="focus-tag large">${f}</span>`).join('')}
          </div>
        </div>

        <footer class="doc-modal-footer">
          <button type="button" class="btn btn-outline" id="btn-close-doc-profile">Close</button>
          <button type="button" class="btn btn-primary" id="btn-book-from-profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Book Appointment with ${doc.name.split(' ')[1]}
          </button>
        </footer>
      </div>
    `;

    this.contentEl.querySelector('#btn-close-doc-profile').addEventListener('click', () => this.close());
    this.contentEl.querySelector('#btn-book-from-profile').addEventListener('click', () => {
      this.close();
      this.onBookDoctor({
        doctorId: doc.id,
        department: doc.department
      });
    });
  }
}
