// Medicare Pharmacy Portal Component
// Live Prescription Queue, Medication Dispensing & Packet Label Printing

import { hospitalDb } from '../data/hospitalDb.js';
import { printPharmacySlip } from './printManager.js';
import { playClinicChime } from '../utils/audio.js';
import confetti from 'canvas-confetti';

export class PharmacyPortal {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate || (() => {});
    this.searchQuery = '';
    this.activeFilter = 'pending'; // 'pending', 'all', 'dispensed'
    this.render();
  }

  render() {
    const allQueue = hospitalDb.getPharmacyQueue();
    const config = hospitalDb.getConfig();

    const filtered = allQueue.filter(p => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q);

      if (!matchesSearch) return false;

      if (this.activeFilter === 'pending') {
        return p.pharmacyStatus !== 'Dispensed';
      } else if (this.activeFilter === 'dispensed') {
        return p.pharmacyStatus === 'Dispensed';
      }
      return true;
    });

    const pendingCount = allQueue.filter(p => p.pharmacyStatus !== 'Dispensed').length;
    const dispensedCount = allQueue.filter(p => p.pharmacyStatus === 'Dispensed').length;

    this.container.innerHTML = `
      <div class="pharmacy-portal-layout animate-fade-in">
        <!-- Top Pharmacy Header -->
        <div class="portal-header-row">
          <div>
            <div class="section-tag-pill emerald">On-Site Dispensary</div>
            <h2 class="portal-title">Medicare Pharmacy Desk (मेडिकेअर फार्मसी)</h2>
            <p class="portal-subtitle">Live Doctor Prescriptions • Medication Verification • Dispensing Queue • Label Printing</p>
          </div>

          <div class="pharmacy-stats-strip">
            <div class="pharm-stat-badge">
              <span class="pulse-dot"></span>
              <strong>${pendingCount}</strong> Pending Dispensing
            </div>
            <div class="pharm-stat-badge completed">
              <strong>${dispensedCount}</strong> Packets Dispensed
            </div>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="pharmacy-controls-card">
          <div class="pharmacy-search-wrap">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              id="pharmacy-search-input" 
              class="form-input pharmacy-search-input" 
              placeholder="Search by Patient ID (e.g. CSD-P1002), Name, or Mobile..." 
              value="${this.searchQuery}"
            />
          </div>

          <div class="pharmacy-filter-tabs">
            <button type="button" class="pharm-tab-btn ${this.activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
              ⏳ To Dispense (${pendingCount})
            </button>
            <button type="button" class="pharm-tab-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
              📋 All Prescriptions (${allQueue.length})
            </button>
            <button type="button" class="pharm-tab-btn ${this.activeFilter === 'dispensed' ? 'active' : ''}" data-filter="dispensed">
              ✓ Completed (${dispensedCount})
            </button>
          </div>
        </div>

        <!-- Prescriptions Queue -->
        <div class="pharmacy-queue-list mt-3">
          ${filtered.length === 0 ? `
            <div class="empty-pharmacy-state">
              <div style="font-size: 2.5rem;">💊</div>
              <h3>No Prescriptions in this View</h3>
              <p>When doctors save checkups and digital prescriptions, they will appear live in this dispensing queue.</p>
            </div>
          ` : filtered.map(patient => {
            const rx = patient.prescription;
            const isDispensed = patient.pharmacyStatus === 'Dispensed';

            return `
              <div class="pharmacy-patient-card ${isDispensed ? 'dispensed' : 'pending'}" data-id="${patient.patientId}">
                <div class="ppc-header">
                  <div class="ppc-id-name">
                    <span class="patient-id-badge">${patient.patientId}</span>
                    <strong class="ppc-name">${patient.name}</strong>
                    <span class="ppc-meta">${patient.age}y / ${patient.gender} • +91 ${patient.phone}</span>
                  </div>

                  <div class="ppc-status-group">
                    <span class="status-pill ${isDispensed ? 'status-paid' : 'status-pending'}">
                      ${isDispensed ? `✓ Dispensed (${patient.pharmacyDispensedAt || 'Today'})` : '⏳ Awaiting Dispense'}
                    </span>
                    <span class="doc-badge-sm">👨‍⚕️ ${rx.doctorName}</span>
                  </div>
                </div>

                ${patient.clinicalNotes && patient.clinicalNotes.diagnosis ? `
                  <div class="ppc-diagnosis-strip">
                    <strong>Diagnosis:</strong> ${patient.clinicalNotes.diagnosis}
                    ${patient.criticalAlerts && patient.criticalAlerts.length > 0 ? `
                      <span class="critical-alert-tag">⚠️ Alert: ${patient.criticalAlerts.join(', ')}</span>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Prescribed Medicines Table -->
                <div class="ppc-table-wrap">
                  <table class="pharmacy-med-table">
                    <thead>
                      <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 35%;">Medicine Name & Strength</th>
                        <th style="width: 15%;">Form</th>
                        <th style="width: 25%;">Dosage & Frequency</th>
                        <th style="width: 20%;">Duration & Advice</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rx.medicines.map((m, idx) => `
                        <tr>
                          <td><strong>${idx + 1}</strong></td>
                          <td>
                            <strong class="med-text-name">${m.name}</strong>
                          </td>
                          <td><span class="fmc-type-badge ${m.type.toLowerCase()}">${m.type}</span></td>
                          <td class="text-teal font-bold">${m.frequency}</td>
                          <td>
                            <span>${m.duration}</span>
                            ${m.instructions ? `<div class="text-xs text-muted">${m.instructions}</div>` : ''}
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                ${rx.specialAdvice ? `
                  <div class="ppc-advice-box">
                    <strong>Doctor's Advice:</strong> ${rx.specialAdvice}
                  </div>
                ` : ''}

                <!-- Action Bar -->
                <div class="ppc-actions-bar">
                  <div class="ppc-timing text-xs text-muted">
                    Prescribed: ${rx.prescribedAt}
                  </div>

                  <div class="ppc-buttons">
                    <button type="button" class="btn btn-outline btn-sm btn-print-pharmacy-slip" data-id="${patient.patientId}">
                      🏷️ Print Medicine Packet Slip
                    </button>

                    ${!isDispensed ? `
                      <button type="button" class="btn btn-emerald btn-sm btn-mark-dispensed glow-emerald" data-id="${patient.patientId}">
                        ✓ Mark Dispensed & Packaged
                      </button>
                    ` : `
                      <span class="text-xs text-emerald font-bold">✓ Packaged by ${patient.pharmacyDispensedBy || 'Medicare Pharmacy'}</span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents(config);
  }

  bindEvents(config) {
    const searchInput = this.container.querySelector('#pharmacy-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Filter tabs
    this.container.querySelectorAll('.pharm-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.getAttribute('data-filter');
        this.render();
      });
    });

    // Print Pharmacy Slip
    this.container.querySelectorAll('.btn-print-pharmacy-slip').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        const patient = hospitalDb.getPatientById(pid);
        if (patient) {
          printPharmacySlip(patient, config);
        }
      });
    });

    // Mark Dispensed
    this.container.querySelectorAll('.btn-mark-dispensed').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-id');
        hospitalDb.markPharmacyDispensed(pid, 'Medicare Pharmacy Desk');
        playClinicChime('success');
        try {
          confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        } catch (e) {}
        this.render();
      });
    });
  }
}
