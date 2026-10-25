import { BEFORE_AFTER_CASES } from '../data/cases.js';
import { getDoctorById } from '../data/doctors.js';

export class BeforeAfterGallery {
  constructor(containerEl, onConsultClick) {
    this.container = containerEl;
    this.onConsultClick = onConsultClick || (() => {});
    this.cases = BEFORE_AFTER_CASES;
    this.activeCase = this.cases[0];
    this.sliderPosition = 50; // percentage
    this.isDragging = false;
    this.render();
  }

  setCase(caseId) {
    const found = this.cases.find(c => c.id === caseId);
    if (found) {
      this.activeCase = found;
      this.sliderPosition = 50;
      this.render();
    }
  }

  render() {
    const c = this.activeCase;
    const doc = getDoctorById(c.doctorId);

    this.container.innerHTML = `
      <div class="before-after-wrapper">
        <!-- Category Filter Pills -->
        <div class="ba-filter-pills" role="tablist">
          ${this.cases.map(item => `
            <button type="button" 
              class="ba-pill ${item.id === c.id ? 'active' : ''}" 
              data-case-id="${item.id}"
              role="tab"
              aria-selected="${item.id === c.id}">
              <span class="ba-pill-dot"></span>
              ${item.category}
            </button>
          `).join('')}
        </div>

        <div class="ba-viewer-layout">
          <!-- Interactive Slider Screen -->
          <div class="ba-slider-container" id="ba-slider-box">
            <!-- After Image (Base) -->
            <img src="${c.afterImage}" alt="${c.title} - After treatment" class="ba-img ba-after-img" />
            <div class="ba-label-tag after">AFTER RESULTS</div>

            <!-- Before Image (Clipped) -->
            <div class="ba-before-clipper" id="ba-clipper" style="width: ${this.sliderPosition}%;">
              <img src="${c.beforeImage}" alt="${c.title} - Before treatment" class="ba-img ba-before-img" />
              <div class="ba-label-tag before">BEFORE TREATMENT</div>
            </div>

            <!-- Drag Handle Divider -->
            <div class="ba-handle-line" id="ba-handle" style="left: ${this.sliderPosition}%;">
              <div class="ba-handle-thumb" aria-label="Drag slider to compare before and after">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                  <polyline points="9 18 15 12 9 6" transform="translate(6, 0) scale(-1, 1)"></polyline>
                </svg>
              </div>
            </div>

            <div class="ba-drag-hint">
              <span>↔ Drag divider left & right to compare</span>
            </div>
          </div>

          <!-- Clinical Case Details & Doctor Attribution -->
          <div class="ba-case-info-card">
            <div class="ba-doctor-attribution">
              <img src="${doc.image}" alt="${doc.name}" class="ba-doc-avatar" />
              <div>
                <span class="doc-badge-pill ${doc.badgeColor}">${c.doctorBadge}</span>
                <h4 class="ba-doc-name">Treated by ${c.doctor}</h4>
                <p class="ba-doc-role text-xs text-muted">${c.doctorRole}</p>
              </div>
            </div>

            <h3 class="ba-case-title">${c.title}</h3>
            
            <div class="ba-metrics-grid">
              <div class="ba-metric-item">
                <span class="lbl">Timeline</span>
                <strong class="val">${c.timeline}</strong>
              </div>
              <div class="ba-metric-item">
                <span class="lbl">Patient</span>
                <strong class="val">${c.patientAge}, ${c.gender}</strong>
              </div>
              <div class="ba-metric-item full-width">
                <span class="lbl">Clinical Technique</span>
                <strong class="val text-primary">${c.technique}</strong>
              </div>
              <div class="ba-metric-item full-width highlight-green">
                <span class="lbl">Measured Outcome</span>
                <strong class="val">${c.improvement}</strong>
              </div>
            </div>

            <p class="ba-notes text-sm text-muted">${c.notes}</p>

            <div class="ba-actions">
              <button type="button" class="btn btn-primary btn-consult-case" id="btn-consult-doctor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Book Similar Treatment with ${c.doctor.split(' ')[1]}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Pill selection
    this.container.querySelectorAll('.ba-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-case-id');
        this.setCase(id);
      });
    });

    // Slider Drag Logic
    const sliderBox = this.container.querySelector('#ba-slider-box');
    const clipper = this.container.querySelector('#ba-clipper');
    const handle = this.container.querySelector('#ba-handle');

    const updateSlider = (clientX) => {
      const rect = sliderBox.getBoundingClientRect();
      let pos = ((clientX - rect.left) / rect.width) * 100;
      if (pos < 2) pos = 2;
      if (pos > 98) pos = 98;
      this.sliderPosition = pos;
      clipper.style.width = `${pos}%`;
      handle.style.left = `${pos}%`;
    };

    const onPointerDown = (e) => {
      this.isDragging = true;
      sliderBox.classList.add('dragging');
      updateSlider(e.clientX);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      updateSlider(e.clientX);
    };

    const onPointerUp = () => {
      this.isDragging = false;
      sliderBox.classList.remove('dragging');
    };

    sliderBox.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Book doctor button
    const consultBtn = this.container.querySelector('#btn-consult-doctor');
    if (consultBtn) {
      consultBtn.addEventListener('click', () => {
        this.onConsultClick({
          doctorId: this.activeCase.doctorId,
          department: this.activeCase.doctorId === 'dr-snehal' ? 'skin' : 'dental'
        });
      });
    }
  }
}
