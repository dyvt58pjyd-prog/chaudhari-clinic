import { DOCTORS, getDoctorById } from '../data/doctors.js';
import { playClinicChime } from '../utils/audio.js';

export class TeleConsultModal {
  constructor(onBookRegularClick) {
    this.onBookRegularClick = onBookRegularClick || (() => {});
    this.selectedDoctorId = 'dr-snehal';
    this.isInCall = false;
    this.isMicMuted = false;
    this.isCameraOff = false;
    this.createDom();
  }

  createDom() {
    const el = document.createElement('div');
    el.id = 'teleconsult-modal-backdrop';
    el.className = 'modal-backdrop hidden';
    el.innerHTML = `
      <div class="modal-card teleconsult-modal-card">
        <header class="modal-header">
          <div class="modal-header-brand">
            <span class="live-pulse-ring"></span>
            <div>
              <h3 class="modal-title">Chaudhari Clinic HD Tele-Consult Suite</h3>
              <p class="modal-subtitle">Direct Encrypted Video Consult with Your Specialist</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-teleconsult">✕</button>
        </header>

        <div class="modal-body" id="teleconsult-body">
          <!-- Injected via render() -->
        </div>
      </div>
    `;

    document.body.appendChild(el);
    this.el = el;
    this.contentEl = el.querySelector('#teleconsult-body');

    this.el.querySelector('#btn-close-teleconsult').addEventListener('click', () => this.close());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });
  }

  open(prefillDocId = 'dr-snehal') {
    this.selectedDoctorId = prefillDocId;
    this.isInCall = false;
    this.render();
    this.el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isInCall = false;
    this.el.classList.add('hidden');
    document.body.style.overflow = '';
  }

  render() {
    const doctor = getDoctorById(this.selectedDoctorId);

    if (this.isInCall) {
      this.contentEl.innerHTML = `
        <div class="video-room-container animate-fade-in">
          <!-- Doctor Main Video Stream Mockup -->
          <div class="video-stream doctor-stream">
            <img src="${doctor.image}" alt="${doctor.name}" class="stream-bg-image" />
            <div class="stream-overlay">
              <div class="stream-doctor-tag">
                <span class="pulse-dot"></span>
                <strong>${doctor.name}</strong> • ${doctor.shortRole}
              </div>
              <div class="stream-quality-tag">HD 1080p • 256-bit Encrypted</div>
            </div>
            <div class="doctor-speaking-indicator">
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span>Dr. ${doctor.name.split(' ')[1]} is connected and reviewing your clinical inquiry...</span>
            </div>
          </div>

          <!-- Patient Picture-in-Picture Viewfinder -->
          <div class="pip-patient-viewfinder ${this.isCameraOff ? 'cam-off' : ''}">
            ${this.isCameraOff ? `
              <div class="cam-off-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 15.5V17l-4.5-3.5"/></svg>
                <span>Camera Off</span>
              </div>
            ` : `
              <div class="self-view-sim">
                <div class="self-avatar">You</div>
                <span class="pip-label">Patient (You)</span>
              </div>
            `}
          </div>

          <!-- Video Control Bar -->
          <div class="video-control-bar">
            <button type="button" class="ctrl-btn ${this.isMicMuted ? 'muted' : ''}" id="btn-toggle-mic" title="Toggle Microphone">
              ${this.isMicMuted ? '🔇 Unmute' : '🎙️ Mic On'}
            </button>
            <button type="button" class="ctrl-btn ${this.isCameraOff ? 'off' : ''}" id="btn-toggle-cam" title="Toggle Camera">
              ${this.isCameraOff ? '📷 Turn Camera On' : '📹 Camera On'}
            </button>
            <button type="button" class="ctrl-btn btn-end-call" id="btn-end-call" title="End Tele-Consult">
              🔴 End Consultation
            </button>
          </div>
        </div>
      `;

      this.contentEl.querySelector('#btn-toggle-mic').addEventListener('click', () => {
        this.isMicMuted = !this.isMicMuted;
        this.render();
      });

      this.contentEl.querySelector('#btn-toggle-cam').addEventListener('click', () => {
        this.isCameraOff = !this.isCameraOff;
        this.render();
      });

      this.contentEl.querySelector('#btn-end-call').addEventListener('click', () => {
        this.isInCall = false;
        playClinicChime('alert');
        this.render();
      });
      return;
    }

    // Pre-call Lobby
    this.contentEl.innerHTML = `
      <div class="teleconsult-lobby-pane animate-fade-in">
        <div class="tele-doc-picker-bar">
          <label class="picker-label">Select Specialist to Tele-Consult:</label>
          <div class="tele-doc-chips">
            ${DOCTORS.map(d => `
              <button type="button" class="tele-doc-chip ${d.id === doctor.id ? 'active' : ''}" data-doc-id="${d.id}">
                <img src="${d.image}" alt="${d.name}" class="chip-avatar" />
                <div class="chip-text">
                  <strong>${d.name}</strong>
                  <span class="text-xs text-muted">${d.department === 'skin' ? 'Dermatology' : 'Dental'}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="tele-doctor-banner">
          <img src="${doctor.image}" alt="${doctor.name}" class="tele-doc-banner-img" />
          <div class="tele-banner-meta">
            <div class="online-indicator-pill">
              <span class="pulse-dot"></span>
              <span>Available for Tele-Consult</span>
            </div>
            <h4>${doctor.name}</h4>
            <p class="text-xs text-muted">${doctor.qualifications}</p>
            <p class="text-sm text-teal-dark font-medium">${doctor.shortRole}</p>
            <p class="text-xs text-muted">Typical waiting room queue: ~3 mins</p>
          </div>
        </div>

        <div class="tele-features-grid">
          <div class="tele-feat-item">
            <span class="feat-icon">🔒</span>
            <div>
              <strong>100% Encrypted & Private</strong>
              <p class="text-xs text-muted">Compliant with Indian Telemedicine Practice Guidelines & HIPAA</p>
            </div>
          </div>
          <div class="tele-feat-item">
            <span class="feat-icon">📑</span>
            <div>
              <strong>Instant Digital Prescription</strong>
              <p class="text-xs text-muted">Doctor issues authorized digital Rx directly to your Patient Portal</p>
            </div>
          </div>
          <div class="tele-feat-item">
            <span class="feat-icon">⚡</span>
            <div>
              <strong>High-Def Skin & Dental Video</strong>
              <p class="text-xs text-muted">Crystal clear feed for lesion examination and dental pain assessment</p>
            </div>
          </div>
        </div>

        <footer class="tele-lobby-footer">
          <button type="button" class="btn btn-outline" id="btn-lobby-switch-inclinic">
            Prefer In-Clinic Visit Instead?
          </button>
          <button type="button" class="btn btn-primary btn-start-call" id="btn-start-teleconsult">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            Join Video Room with Dr. ${doctor.name.split(' ')[1]}
          </button>
        </footer>
      </div>
    `;

    this.contentEl.querySelectorAll('.tele-doc-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDoctorId = btn.getAttribute('data-doc-id');
        this.render();
      });
    });

    this.contentEl.querySelector('#btn-lobby-switch-inclinic').addEventListener('click', () => {
      this.close();
      this.onBookRegularClick({ doctorId: this.selectedDoctorId });
    });

    this.contentEl.querySelector('#btn-start-teleconsult').addEventListener('click', () => {
      playClinicChime('queue-call');
      this.isInCall = true;
      this.render();
    });
  }
}
