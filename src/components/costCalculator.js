// Interactive Treatment Cost & 0% EMI Calculator Component
export const CALCULATOR_PROCEDURES = [
  {
    id: "calc-aligners",
    name: "Clear Invisible Aligners (Full Arch)",
    doctor: "Dr. Shrutika Tulaskar",
    doctorId: "dr-rutika",
    dept: "Smile Aesthetics & Orthodontics",
    baseCost: 45000,
    downPaymentOptions: [5000, 10000, 15000],
    tenures: [3, 6, 9, 12],
    includes: "3D Digital Scan + All Aligner Trays + 2 Retainers + Monthly Doctor Reviews"
  },
  {
    id: "calc-implants",
    name: "Immediate Titanium Dental Implant + Zirconia Crown",
    doctor: "Dr. Priyanka Chaudhari (Anokar)",
    doctorId: "dr-priyanka",
    dept: "Dental Surgery & Implantology",
    baseCost: 28000,
    downPaymentOptions: [4000, 8000, 12000],
    tenures: [3, 6, 9],
    includes: "Surgical Placement + Swiss Biocompatible Screw + CAD/CAM Zirconia Crown (Lifetime Warranty)"
  },
  {
    id: "calc-laser-hair",
    name: "Full Body Triple-Wave Laser Hair Reduction (6 Sessions)",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    dept: "Dermatology & Laser",
    baseCost: 29999,
    downPaymentOptions: [3000, 6000, 10000],
    tenures: [3, 6],
    includes: "6 Full Body Sessions + Sapphire Cooling + US FDA Triple Wavelength Protocol"
  },
  {
    id: "calc-veneers",
    name: "Hollywood Smile Design (8 E.max Porcelain Veneers)",
    doctor: "Dr. Priyanka Chaudhari (Anokar)",
    doctorId: "dr-priyanka",
    dept: "Cosmetic Restorative Dentistry",
    baseCost: 64000,
    downPaymentOptions: [10000, 15000, 20000],
    tenures: [3, 6, 9, 12],
    includes: "Digital Smile Design Mockup + 8 Handcrafted E.max Veneers + Color Matching"
  },
  {
    id: "calc-prp-hair",
    name: "GFC & PRP Hair Density Package (6 Sessions)",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    doctorId: "dr-rajnikant",
    dept: "Trichology & Hair Regrowth",
    baseCost: 24000,
    downPaymentOptions: [4000, 8000],
    tenures: [3, 6],
    includes: "6 High-Yield GFC Sessions + Dermoscopy Tracking + Scalp Meso Infusion"
  }
];

export class CostCalculator {
  constructor(containerEl, onBookProcedure) {
    this.container = containerEl;
    this.onBookProcedure = onBookProcedure || (() => {});
    this.selectedProcedure = CALCULATOR_PROCEDURES[0];
    this.downPayment = this.selectedProcedure.downPaymentOptions[0];
    this.tenure = 6; // months
    this.render();
  }

  setProcedure(procId) {
    const found = CALCULATOR_PROCEDURES.find(p => p.id === procId);
    if (found) {
      this.selectedProcedure = found;
      this.downPayment = found.downPaymentOptions[0];
      this.render();
    }
  }

  calculateEmi() {
    const principal = this.selectedProcedure.baseCost - this.downPayment;
    return Math.round(principal / this.tenure);
  }

  render() {
    const p = this.selectedProcedure;
    const emi = this.calculateEmi();

    this.container.innerHTML = `
      <div class="cost-calculator-card">
        <div class="calc-header-strip">
          <div class="calc-badge">
            <span class="badge-icon">💳</span>
            <span>0% Interest Easy EMI Planner</span>
          </div>
          <h3 class="calc-main-title">Transparent Pricing & Flexible Financing</h3>
          <p class="calc-sub-title">Calculate your monthly payment for signature smile makeovers, dental implants, and laser treatments.</p>
        </div>

        <div class="calc-body-grid">
          <!-- Selection Controls -->
          <div class="calc-controls-col">
            <div class="calc-field-group">
              <label class="calc-field-label">1. Select Clinical Procedure</label>
              <select id="calc-procedure-select" class="form-select calc-select">
                ${CALCULATOR_PROCEDURES.map(proc => `
                  <option value="${proc.id}" ${proc.id === p.id ? 'selected' : ''}>
                    ${proc.name} (₹${proc.baseCost.toLocaleString()})
                  </option>
                `).join('')}
              </select>
              <p class="calc-doc-tag">Supervised by <strong>${p.doctor}</strong> • ${p.dept}</p>
            </div>

            <div class="calc-field-group">
              <label class="calc-field-label">2. Select Initial Down Payment</label>
              <div class="down-payment-chips">
                ${p.downPaymentOptions.map(dp => `
                  <button type="button" class="dp-chip ${dp === this.downPayment ? 'selected' : ''}" data-dp="${dp}">
                    ₹${dp.toLocaleString()}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="calc-field-group">
              <label class="calc-field-label">3. Select EMI Tenure (No Extra Interest)</label>
              <div class="tenure-chips">
                ${p.tenures.map(t => `
                  <button type="button" class="tenure-chip ${t === this.tenure ? 'selected' : ''}" data-tenure="${t}">
                    ${t} Months
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="calc-inclusions-box">
              <span class="inc-title">✓ Inclusions in this estimate:</span>
              <p class="inc-text">${p.includes}</p>
            </div>
          </div>

          <!-- Live Output Card -->
          <div class="calc-result-card">
            <div class="result-top">
              <span class="calc-badge-green">0% APR Confirmed</span>
              <span class="text-xs text-muted">Zero Hidden Processing Fees</span>
            </div>

            <div class="emi-display-box">
              <span class="emi-label">Your Monthly EMI:</span>
              <div class="emi-amount-row">
                <span class="currency-symbol">₹</span>
                <span class="emi-value">${emi.toLocaleString()}</span>
                <span class="per-month">/ month</span>
              </div>
              <span class="tenure-note">for ${this.tenure} equal monthly installments</span>
            </div>

            <div class="cost-breakdown-table">
              <div class="breakdown-row">
                <span>Total Treatment Cost:</span>
                <strong>₹${p.baseCost.toLocaleString()}</strong>
              </div>
              <div class="breakdown-row">
                <span>Initial Down Payment:</span>
                <strong>- ₹${this.downPayment.toLocaleString()}</strong>
              </div>
              <div class="breakdown-row total">
                <span>Remaining Financed Amount:</span>
                <strong class="text-teal-dark">₹${(p.baseCost - this.downPayment).toLocaleString()}</strong>
              </div>
            </div>

            <div class="financing-partners-row">
              <span class="partner-lbl">Instant Approval Partners:</span>
              <div class="partner-badges">
                <span class="partner-pill">Bajaj Finserv Health</span>
                <span class="partner-pill">HDFC Medical EMI</span>
                <span class="partner-pill">Pine Labs Zero Cost</span>
              </div>
            </div>

            <button type="button" class="btn btn-primary btn-book-calc" id="btn-calc-book">
              Book Consultation & Check EMI Eligibility
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const select = this.container.querySelector('#calc-procedure-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.setProcedure(e.target.value);
      });
    }

    this.container.querySelectorAll('.dp-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.downPayment = parseInt(btn.getAttribute('data-dp'), 10);
        this.render();
      });
    });

    this.container.querySelectorAll('.tenure-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.tenure = parseInt(btn.getAttribute('data-tenure'), 10);
        this.render();
      });
    });

    const bookBtn = this.container.querySelector('#btn-calc-book');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        this.onBookProcedure({
          doctorId: this.selectedProcedure.doctorId,
          treatmentName: this.selectedProcedure.name
        });
      });
    }
  }
}
