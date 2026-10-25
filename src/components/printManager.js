// Comprehensive Print Manager for Hospital Operations
// Supports OPD Registration Slip, 1-Page A4 Prescriptions (English/Marathi/Hindi),
// Dental/Dermatology Procedure Consent Forms, Medical Fitness Certificates,
// and Tax Invoices with Cash & UPI QR.

// Multilingual Translations for Frequencies & Instructions
const TRANSLATIONS = {
  mr: {
    "1-0-1 (After Food)": "सकाळी १ - रात्री १ (जेवणानंतर)",
    "1-1-1 (After Food)": "सकाळी १ - दुपारी १ - रात्री १ (जेवणानंतर)",
    "1-0-0 (Empty Stomach)": "सकाळी १ (उपाशीपोटी / नाश्त्यापूर्वी ३० मि.)",
    "0-0-1 (Bedtime)": "रात्री झोपताना १",
    "SOS (When Needed for Pain)": "गरज भासल्यास / दुखणे असल्यास (SOS)",
    "Every 4 Hours": "दर ४ तासांनी लावावे",
    "5ml twice daily (After Food)": "५ मि.ली. सकाळी व रात्री (जेवणानंतर)",
    "Tablet": "गोळी (Tab)",
    "Capsule": "कॅप्सूल (Cap)",
    "Gel": "मलम / जेल (Gel)",
    "Syrup": "सिरप (Syrup)",
    "Liquid": "माउथवॉश / द्रव (Rinse)",
    "Drops": "थेंब (Drops)",
    "Days": "दिवस",
    "rxTitle": "वैद्यकीय प्रिस्क्रिप्शन (औषधोपचार पत्रक)",
    "diagnosisLabel": "निदान / आजार:",
    "adviceLabel": "डॉक्टरांचा सल्ला व सूचना:",
    "followUpLabel": "पुढील तपासणी तारीख:",
    "clinicTag": "कृपया डॉक्टरांच्या सल्ल्यानुसार औषधोपचार पूर्ण करावा."
  },
  hi: {
    "1-0-1 (After Food)": "सुबह १ - रात १ (खाने के बाद)",
    "1-1-1 (After Food)": "सुबह १ - दोपहर १ - रात १ (खाने के बाद)",
    "1-0-0 (Empty Stomach)": "सुबह १ (खाली पेट / नाश्ते से पहले)",
    "0-0-1 (Bedtime)": "रात को सोते समय १",
    "SOS (When Needed for Pain)": "दर्द होने पर (SOS)",
    "Every 4 Hours": "हर ४ घंटे में लगाएं",
    "5ml twice daily (After Food)": "५ मि.ली. सुबह और रात (खाने के बाद)",
    "Tablet": "गोली (Tab)",
    "Capsule": "कैप्सूल (Cap)",
    "Gel": "मलहम / जेल (Gel)",
    "Syrup": "सिरप (Syrup)",
    "Liquid": "माउथवॉश (Rinse)",
    "Drops": "ड्रॉप्स (Drops)",
    "Days": "दिन",
    "rxTitle": "चिकित्सा पर्चा (Prescription)",
    "diagnosisLabel": "निदान (Diagnosis):",
    "adviceLabel": "डॉक्टर की सलाह:",
    "followUpLabel": "अगली जांच तिथि:",
    "clinicTag": "कृपया डॉक्टर के निर्देशानुसार दवाइयों का सेवन करें।"
  },
  en: {
    "rxTitle": "Doctor's Clinical Prescription (Rx)",
    "diagnosisLabel": "Clinical Diagnosis:",
    "adviceLabel": "Doctor's Advice & Precautions:",
    "followUpLabel": "Recommended Follow-Up Date:",
    "clinicTag": "Take medications as directed by consulting specialist."
  }
};

function translateText(text, lang = 'en') {
  if (lang === 'en' || !text) return text;
  const dict = TRANSLATIONS[lang] || {};
  return dict[text] || text;
}

// 1. OPD REGISTRATION SLIP
export function printOpdSlip(patient, config) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OPD Slip - ${patient.patientId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; }
        .slip-card { border: 2px solid #0f766e; border-radius: 12px; padding: 20px; max-width: 480px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 16px; }
        .clinic-name { font-size: 18px; font-weight: 800; color: #0f766e; margin: 0; }
        .clinic-sub { font-size: 11px; color: #475569; margin-top: 3px; }
        .token-row { display: flex; justify-content: space-between; align-items: center; background: #f0fdfa; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #ccfbf1; }
        .token-big { font-size: 26px; font-weight: 800; color: #0f766e; }
        .emergency-pill { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
        .field-full { grid-column: span 2; }
        .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; display: block; }
        .value { font-weight: 700; color: #0f172a; margin-top: 2px; }
        .footer { text-align: center; margin-top: 18px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="slip-card">
        <div class="header">
          <h2 class="clinic-name">${config.hospitalName}</h2>
          <p class="clinic-sub">${config.hospitalNameMarathi}</p>
          <p class="clinic-sub">${config.address} • Phone: ${config.phone}</p>
        </div>
        <div class="token-row">
          <div>
            <span class="label">OPD QUEUE TOKEN</span>
            <span class="token-big">TOKEN #${patient.tokenNo}</span>
          </div>
          <div style="text-align: right;">
            <span class="label">PATIENT ID</span>
            <span style="font-size: 16px; font-weight: 800; color: #0284c7;">${patient.patientId}</span>
            ${patient.isEmergency ? `<div class="emergency-pill mt-1">🚨 EMERGENCY</div>` : ''}
          </div>
        </div>
        <div class="field-grid">
          <div>
            <span class="label">Patient Name</span>
            <div class="value">${patient.name}</div>
          </div>
          <div>
            <span class="label">Age / Gender</span>
            <div class="value">${patient.age} Yrs / ${patient.gender}</div>
          </div>
          <div>
            <span class="label">Contact Mobile</span>
            <div class="value">+91 ${patient.phone}</div>
          </div>
          <div>
            <span class="label">Admission Date</span>
            <div class="value">${patient.registeredAt}</div>
          </div>
          <div class="field-full">
            <span class="label">Residential Address</span>
            <div class="value">${patient.address}</div>
          </div>
          <div class="field-full">
            <span class="label">Consulting Doctor</span>
            <div class="value" style="color: #0f766e;">${patient.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka Chaudhari (Anokar) - Dental Operatory 2' : patient.assignedDoctorId === 'dr-rutika' ? 'Dr. Shrutika Tulaskar - Dental Operatory 1' : 'Dr. Rajnikant Arvind Chaudhari - Dermatology Suite 101'}</div>
          </div>
          ${patient.reason ? `
            <div class="field-full">
              <span class="label">Visit Reason / Chief Complaints</span>
              <div class="value" style="color: #475569;">"${patient.reason}"</div>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          Please be seated in waiting lounge. Hospital Helpline: +91 90498 83983
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// 2. DETAILED CLINICAL CASE SHEET & PRESCRIPTION (STRICT 1-PAGE A4 PRINT)
export function printPrescription(patient, config, lang = 'mr') {
  const rx = patient.prescription;
  const notes = patient.clinicalNotes;
  if (!rx) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const dict = TRANSLATIONS[lang] || TRANSLATIONS.mr;

  const docQualifications = patient.assignedDoctorId === 'dr-rajnikant' 
    ? 'M.B.B.S., D.D.V. (Mumbai) • Consultant Dermatologist, Trichologist & Cosmetologist'
    : patient.assignedDoctorId === 'dr-priyanka'
    ? 'B.D.S. (Nashik) • Senior Dental Surgeon & Endodontist (Painless RCT Specialist)'
    : 'B.D.S., M.D.S. (Nashik) • Senior Pediatric Dental Specialist & Oral Physician';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>Prescription_${patient.patientId}_${patient.name.replace(/\s+/g, '_')}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif;
          font-size: 9.5pt;
          line-height: 1.3;
        }
        .a4-page-frame {
          width: 100%;
          max-width: 194mm;
          height: 280mm;
          max-height: 280mm;
          margin: 0 auto;
          padding: 8mm 9mm 6mm 9mm;
          border: 2px solid #0f766e;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          page-break-inside: avoid;
          page-break-after: avoid;
          overflow: hidden;
        }
        /* Clinic Official Header */
        .clinic-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f766e;
          padding-bottom: 6px;
          margin-bottom: 6px;
        }
        .clinic-brand {
          max-width: 62%;
        }
        .clinic-brand h1 {
          font-size: 13.5pt;
          font-weight: 800;
          color: #0f766e;
          margin: 0;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }
        .clinic-brand .mr-name {
          font-size: 10.5pt;
          font-weight: 700;
          color: #0369a1;
          margin: 2px 0 0 0;
        }
        .clinic-brand .addr-text {
          font-size: 7.8pt;
          color: #475569;
          margin: 3px 0 0 0;
          line-height: 1.25;
        }
        .clinic-brand .contact-pill {
          display: inline-block;
          font-size: 8pt;
          font-weight: 700;
          color: #0f766e;
          margin-top: 3px;
        }
        .doctor-badge {
          text-align: right;
          max-width: 36%;
        }
        .doc-name {
          font-size: 11.5pt;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }
        .doc-creds {
          font-size: 8pt;
          color: #0284c7;
          font-weight: 700;
          margin: 2px 0 0 0;
          line-height: 1.2;
        }
        .doc-meta {
          font-size: 7.5pt;
          color: #64748b;
          margin-top: 3px;
        }
        /* Patient Demographic Row */
        .patient-info-strip {
          display: grid;
          grid-template-columns: 1.6fr 1.6fr 1fr 1.2fr;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          padding: 5px 8px;
          margin-bottom: 6px;
          font-size: 8.5pt;
        }
        .pi-item span {
          display: block;
          font-size: 6.8pt;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 1px;
        }
        .pi-item strong {
          color: #0f172a;
          font-size: 9pt;
        }
        /* Safety Alerts & RVG X-Ray Strip */
        .sub-meta-strip {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }
        .alert-flag {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 7.5pt;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          flex: 1;
        }
        .rvg-flag {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          font-size: 7.5pt;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        /* Clinical Examination Notes & Diagnosis Box */
        .clinical-notes-box {
          background: #f0fdfa;
          border-left: 3.5px solid #0f766e;
          border-radius: 0 5px 5px 0;
          padding: 5px 8px;
          margin-bottom: 6px;
          font-size: 8.5pt;
        }
        .cn-diag-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .cn-label {
          font-size: 7.2pt;
          text-transform: uppercase;
          font-weight: 800;
          color: #0f766e;
        }
        .cn-diag-title {
          font-size: 10pt;
          font-weight: 800;
          color: #0f172a;
        }
        .cn-sub-line {
          font-size: 7.8pt;
          color: #334155;
          margin-top: 2px;
          line-height: 1.25;
        }
        /* Rx Heading */
        .rx-header-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 2px 0 4px 0;
        }
        .rx-symbol {
          font-size: 18pt;
          font-weight: 900;
          color: #0f766e;
          font-family: Georgia, serif;
          line-height: 1;
        }
        .rx-badge-title {
          font-size: 8.5pt;
          font-weight: 800;
          color: #0f766e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        /* Rx Medicine Table */
        .rx-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
          font-size: 8.5pt;
        }
        .rx-table th {
          background: #f1f5f9;
          color: #334155;
          font-size: 7.5pt;
          text-transform: uppercase;
          padding: 4px 6px;
          border: 1px solid #cbd5e1;
          text-align: left;
          font-weight: 700;
        }
        .rx-table td {
          padding: 4px 6px;
          border: 1px solid #e2e8f0;
          vertical-align: middle;
        }
        .rx-table tr:nth-child(even) td {
          background: #fafafa;
        }
        .med-name-bold {
          font-weight: 700;
          color: #0f172a;
          font-size: 9pt;
        }
        .med-type-badge {
          font-size: 7.2pt;
          color: #0284c7;
          font-weight: 600;
        }
        .med-freq-highlight {
          color: #0f766e;
          font-weight: 700;
          font-size: 8.5pt;
        }
        /* Doctor Special Advice Box */
        .advice-card {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 5px;
          padding: 5px 8px;
          margin-bottom: 6px;
          font-size: 8pt;
        }
        .advice-head {
          font-size: 7.2pt;
          text-transform: uppercase;
          font-weight: 800;
          color: #b45309;
        }
        .advice-text {
          margin: 2px 0 0 0;
          color: #78350f;
          line-height: 1.25;
        }
        .follow-chip {
          display: inline-block;
          margin-top: 3px;
          background: #fef3c7;
          color: #92400e;
          font-weight: 700;
          font-size: 7.8pt;
          padding: 1px 5px;
          border-radius: 3px;
        }
        /* Bottom Footer with Signature Block */
        .footer-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 6px;
          border-top: 1.5px dashed #cbd5e1;
          margin-top: 4px;
        }
        .footer-note {
          font-size: 7.2pt;
          color: #64748b;
          max-width: 60%;
          line-height: 1.25;
        }
        .sig-block {
          text-align: right;
        }
        .sig-space {
          height: 28px;
        }
        .sig-line {
          width: 160px;
          border-top: 1px solid #0f172a;
          margin-bottom: 2px;
        }
        .sig-name {
          font-size: 9.5pt;
          font-weight: 800;
          color: #0f172a;
        }
        .sig-seal {
          font-size: 7pt;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="a4-page-frame">
        <!-- 1. Clinic Letterhead Header -->
        <div>
          <div class="clinic-header">
            <div class="clinic-brand">
              <h1>${config.hospitalName}</h1>
              <div class="mr-name">${config.hospitalNameMarathi}</div>
              <div class="addr-text">${config.address}</div>
              <div class="contact-pill">Helpline & WhatsApp: ${config.phone} • Official UPI: ${config.upiId}</div>
            </div>
            <div class="doctor-badge">
              <div class="doc-name">${rx.doctorName}</div>
              <div class="doc-creds">${docQualifications}</div>
              <div class="doc-meta">Consultation Date: <strong>${rx.prescribedAt}</strong></div>
            </div>
          </div>

          <!-- 2. Patient Demographics Strip -->
          <div class="patient-info-strip">
            <div class="pi-item">
              <span>Patient Full Name</span>
              <strong>${patient.name}</strong>
            </div>
            <div class="pi-item">
              <span>Patient ID & Token</span>
              <strong>${patient.patientId} (Token #${patient.tokenNo})</strong>
            </div>
            <div class="pi-item">
              <span>Age / Gender</span>
              <strong>${patient.age} Yrs / ${patient.gender}</strong>
            </div>
            <div class="pi-item">
              <span>Mobile / Locality</span>
              <strong>+91 ${patient.phone}</strong>
              <small style="display:block; color:#64748b; font-size:7pt;">${patient.address}</small>
            </div>
          </div>

          <!-- 3. Safety Alerts & External RVG Strip (if present) -->
          ${(patient.criticalAlerts && patient.criticalAlerts.length > 0) || patient.externalRvgId ? `
            <div class="sub-meta-strip">
              ${patient.criticalAlerts && patient.criticalAlerts.length > 0 ? `
                <div class="alert-flag">⚠️ SAFETY FLAGS: ${patient.criticalAlerts.join(' • ')}</div>
              ` : ''}
              ${patient.externalRvgId ? `
                <div class="rvg-flag">📷 External X-Ray / RVG Machine ID: <strong>${patient.externalRvgId}</strong></div>
              ` : ''}
            </div>
          ` : ''}

          <!-- 4. Clinical Examination & Diagnosis -->
          ${notes && (notes.diagnosis || notes.chiefComplaints || notes.treatmentDone) ? `
            <div class="clinical-notes-box">
              <div class="cn-diag-row">
                <span class="cn-label">${dict.diagnosisLabel}</span>
                <span class="cn-diag-title">${notes.diagnosis || 'Clinical Checkup'}</span>
              </div>
              ${notes.chiefComplaints ? `
                <div class="cn-sub-line"><strong>Complaints / History:</strong> ${notes.chiefComplaints} ${notes.duration ? `(${notes.duration})` : ''}</div>
              ` : ''}
              ${notes.clinicalFindings ? `
                <div class="cn-sub-line"><strong>Clinical Observations:</strong> ${notes.clinicalFindings}</div>
              ` : ''}
              ${notes.treatmentDone ? `
                <div class="cn-sub-line" style="color: #0f766e;"><strong>Procedure Done:</strong> ${notes.treatmentDone}</div>
              ` : ''}
            </div>
          ` : ''}

          <!-- 5. ℞ Prescription Header -->
          <div class="rx-header-row">
            <span class="rx-symbol">℞</span>
            <span class="rx-badge-title">${dict.rxTitle}</span>
          </div>

          <!-- 6. ℞ Medicines Table -->
          <table class="rx-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">#</th>
                <th style="width: 36%;">Medicine Formulation & Type</th>
                <th style="width: 25%;">Frequency / Timing</th>
                <th style="width: 14%;">Duration</th>
                <th style="width: 20%;">Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${rx.medicines.map((m, idx) => `
                <tr>
                  <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                  <td>
                    <span class="med-name-bold">${m.name}</span>
                    <span class="med-type-badge">[${translateText(m.type, lang)}]</span>
                  </td>
                  <td class="med-freq-highlight">${translateText(m.frequency, lang)}</td>
                  <td>${m.duration.replace('Days', translateText('Days', lang))}</td>
                  <td style="font-size: 8pt; color: #334155;">${m.instructions}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- 7. Doctor's Special Advice & Follow-Up Date -->
          ${rx.specialAdvice || rx.followUpDate ? `
            <div class="advice-card">
              <div class="advice-head">${dict.adviceLabel}</div>
              ${rx.specialAdvice ? `<p class="advice-text">${rx.specialAdvice}</p>` : ''}
              ${rx.followUpDate ? `<div class="follow-chip">📅 ${dict.followUpLabel} ${rx.followUpDate}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <!-- 8. Footer & Doctor Signature / Clinic Seal Block -->
        <div class="footer-bottom-row">
          <div class="footer-note">
            <strong>${config.hospitalName}</strong><br />
            ${dict.clinicTag}<br />
            Helpline & Emergency Contact: <strong>+91 90498 83983</strong> • Khamgaon
          </div>
          <div class="sig-block">
            <div class="sig-space"></div>
            <div class="sig-line"></div>
            <div class="sig-name">${rx.doctorName}</div>
            <div class="sig-sub">Consulting Specialist Signature & Clinic Seal</div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// 3. CLINICAL PROCEDURE CONSENT FORM (MARATHI & ENGLISH)
export function printConsentForm(patient, config, lang = 'mr') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const isMarathi = lang === 'mr';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Procedure Consent Form - ${patient.patientId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif; padding: 24px; color: #0f172a; line-height: 1.5; }
        .consent-card { border: 2px solid #0f766e; border-radius: 12px; padding: 26px; max-width: 760px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 18px; }
        .title { font-size: 18px; font-weight: 800; color: #0f766e; margin: 0; }
        .sub { font-size: 11px; color: #475569; }
        .patient-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px; }
        .body-text { font-size: 13px; text-align: justify; margin-bottom: 24px; }
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
        .sig-line { border-top: 1px solid #0f172a; width: 100%; margin-top: 45px; }
      </style>
    </head>
    <body>
      <div class="consent-card">
        <div class="header">
          <h2 class="title">${config.hospitalName}</h2>
          <p class="sub">${config.hospitalNameMarathi} • ${config.address}</p>
          <h3 style="font-size: 15px; margin: 10px 0 0 0; color: #0f172a;">
            ${isMarathi ? 'वैद्यकीय / दंतशल्यक्रिया संमतीपत्र (Informed Clinical Consent Form)' : 'Informed Medical & Surgical Procedure Consent Form'}
          </h3>
        </div>

        <div class="patient-box">
          <div><span>रुग्णाचे नाव / Patient:</span> <strong>${patient.name}</strong></div>
          <div><span>रुग्ण क्रमांक / ID:</span> <strong>${patient.patientId}</strong></div>
          <div><span>वय / लिंग:</span> <strong>${patient.age}y / ${patient.gender}</strong></div>
          <div><span>मोबाईल / Phone:</span> <strong>+91 ${patient.phone}</strong></div>
          <div><span>तपासणी दिनांक / Date:</span> <strong>${new Date().toLocaleDateString('en-GB')}</strong></div>
          <div><span>उपचार करणारे डॉक्टर:</span> <strong>${patient.assignedDoctorId === 'dr-priyanka' ? 'Dr. Priyanka Chaudhari (Anokar) (Dental Surgeon)' : patient.assignedDoctorId === 'dr-rutika' ? 'Dr. Shrutika Tulaskar (Pediatric Specialist)' : 'Dr. Rajnikant Chaudhari (Dermatologist)'}</strong></div>
        </div>

        <div class="body-text">
          ${isMarathi ? `
            <p>१. मी याद्वारे संमती देतो/देते की मला माझ्या आजाराविषयी (उदा. रूट कॅनाल / दात काढणे / लेझर / त्वचारोग प्रक्रिया) डॉक्टरांनी सविस्तर माहिती समजावून सांगितली आहे.</p>
            <p>२. या उपचारादरम्यान स्थानिक भूल (Local Anaesthesia), औषधोपचार, व इतर संबंधित प्रक्रियेचे फायदे, संभाव्य जोखीम व पर्यायी उपचार मला पूर्णपणे अवगत करण्यात आले आहेत.</p>
            <p>३. मी माझ्या आरोग्याची संपूर्ण खरी माहिती (उदा. मधुमेह, उच्च रक्तदाब, रक्त पातळ करण्याची औषधे, किंवा औषधांची ॲलर्जी) डॉक्टरांना दिली आहे.</p>
            <p>४. उपचारांनंतर डॉक्टरांनी दिलेल्या सर्व सूचनांचे व पथ्यांचे मी तंतोतंत पालन करीन याची मी हमी देतो/देते.</p>
          ` : `
            <p>1. I hereby authorize and consent to the dental / dermatological procedures, examinations, and treatments recommended by the specialist doctor at Chaudhari Clinic.</p>
            <p>2. The nature and purpose of the proposed procedure (including Single-Sitting Rotary Endodontics, Dental Surgery, Laser Therapy, or Chemical Peel), along with risks, benefits, and alternatives have been explained to me in a language I understand.</p>
            <p>3. I have disclosed my complete medical history including systemic conditions (Diabetes, Hypertension, Bleeding disorders, Pregnancy) and drug allergies.</p>
            <p>4. I agree to follow post-procedure clinical instructions, medication dosages, and scheduled follow-up visits diligently.</p>
          `}
        </div>

        <div class="sig-grid">
          <div>
            <div class="sig-line"></div>
            <strong>रुग्ण / पालकाची सही (Patient / Guardian Signature)</strong>
            <div style="font-size: 11px; color: #64748b;">नाव: ${patient.name}</div>
          </div>
          <div style="text-align: right;">
            <div class="sig-line"></div>
            <strong>उपचारक डॉक्टरांची सही व शिक्का (Doctor Signature & Seal)</strong>
            <div style="font-size: 11px; color: #64748b;">Chaudhari Clinic, Khamgaon</div>
          </div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// 4. MEDICAL FITNESS CERTIFICATE
export function printFitnessCertificate(patient, config) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medical Certificate - ${patient.patientId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; line-height: 1.6; }
        .cert-card { border: 3px double #0f766e; border-radius: 12px; padding: 32px; max-width: 720px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 14px; margin-bottom: 24px; }
        .cert-title { font-size: 20px; font-weight: 800; color: #0f766e; letter-spacing: 1px; text-transform: uppercase; margin-top: 10px; }
        .cert-body { font-size: 14px; text-align: justify; margin: 28px 0; }
        .sig-block { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
      </style>
    </head>
    <body>
      <div class="cert-card">
        <div class="header">
          <h2 style="margin: 0; color: #0f766e;">${config.hospitalName}</h2>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #475569;">${config.hospitalNameMarathi} • ${config.address}</p>
          <div class="cert-title">Medical Fitness / Rest Certificate</div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569;">
          <span>Ref No: CSD-MED-${Date.now().toString().slice(-6)}</span>
          <span>Date: ${new Date().toLocaleDateString('en-GB')}</span>
        </div>

        <div class="cert-body">
          <p>This is to certify that <strong>${patient.name}</strong>, aged <strong>${patient.age} years</strong>, resident of <strong>${patient.address}</strong>, bearing Patient ID <strong>${patient.patientId}</strong>, was examined and treated at this clinical center under our care.</p>
          <p>The patient was diagnosed with <strong>${patient.clinicalNotes ? patient.clinicalNotes.diagnosis : 'Clinical condition under active treatment'}</strong> and was advised required clinical therapy and recuperation.</p>
          <p>Having undergone the recommended protocol, the patient is evaluated and found <strong>Fit to resume regular duty / academic responsibilities</strong> from <strong>${new Date(Date.now() + 86400000).toLocaleDateString('en-GB')}</strong>.</p>
        </div>

        <div class="sig-block">
          <div>
            <div style="font-size: 11px; color: #64748b;">Seal of Clinic & Pharmacy</div>
            <div style="width: 120px; height: 50px; border: 1px dashed #cbd5e1; border-radius: 6px; margin-top: 6px;"></div>
          </div>
          <div style="text-align: right;">
            <div style="border-top: 1px solid #0f172a; width: 180px; margin-top: 50px;"></div>
            <strong>Treating Specialist Doctor</strong>
            <div style="font-size: 11px; color: #64748b;">Chaudhari Clinic, Khamgaon</div>
          </div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// 5. MEDICARE PHARMACY DISPENSE PACKET SLIP
export function printPharmacySlip(patient, config) {
  const rx = patient.prescription;
  if (!rx) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pharmacy Dispense Packet - ${patient.patientId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 18px; color: #0f172a; }
        .packet-card { border: 2px dashed #059669; border-radius: 10px; padding: 16px; max-width: 520px; margin: 0 auto; background: #f0fdf4; }
        .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-bottom: 12px; }
        .ph-title { font-size: 16px; font-weight: 800; color: #059669; margin: 0; }
        .ph-sub { font-size: 11px; color: #475569; }
        .patient-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #a7f3d0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; background: #ffffff; border-radius: 6px; overflow: hidden; }
        th { background: #d1fae5; padding: 6px 8px; text-align: left; font-size: 11px; color: #065f46; text-transform: uppercase; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        .footer { font-size: 10px; text-align: center; margin-top: 12px; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="packet-card">
        <div class="header">
          <h3 class="ph-title">MEDICARE PHARMACY (मेडिकेअर फार्मसी)</h3>
          <p class="ph-sub">${config.hospitalName} • Shriram Chowk, Khamgaon</p>
          <div style="font-size: 11px; font-weight: 700; color: #047857; margin-top: 2px;">Patient Medicine Packet Dispense Slip</div>
        </div>

        <div class="patient-row">
          <div>
            <strong>${patient.name}</strong> (${patient.age}y / ${patient.gender})
            <div style="font-size: 11px; color: #64748b;">+91 ${patient.phone}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: #059669;">${patient.patientId}</div>
            <div style="font-size: 10px; color: #64748b;">${rx.prescribedAt}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 8%;">✓</th>
              <th style="width: 44%;">Medicine & Form</th>
              <th style="width: 30%;">Dosage / Timing</th>
              <th style="width: 18%;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${rx.medicines.map((m, idx) => `
              <tr>
                <td><input type="checkbox" checked /></td>
                <td>
                  <strong>${m.name}</strong>
                  <div style="font-size: 10px; color: #64748b;">[${m.type}]</div>
                </td>
                <td style="color: #059669; font-weight: 700;">${m.frequency}</td>
                <td>${m.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${rx.specialAdvice ? `
          <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; font-size: 11px; margin-top: 10px;">
            <strong>Instructions:</strong> ${rx.specialAdvice}
          </div>
        ` : ''}

        <div class="footer">
          Keep all medications in a cool, dry place away from children • Helpline: ${config.phone}
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// 6. TAX INVOICE RECEIPT (CASH / UPI & PENDING BALANCE)
export function printInvoice(patient, config) {
  const bill = patient.billing;
  if (!bill) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const isUpi = bill.paymentMethod === 'UPI';
  const pending = bill.pendingBalance || 0;
  const paid = bill.paidAmount !== undefined ? bill.paidAmount : bill.totalAmount;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${bill.invoiceId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
        .invoice-card { border: 2px solid #0284c7; border-radius: 12px; padding: 24px; max-width: 680px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 14px; margin-bottom: 16px; }
        .clinic-title { font-size: 18px; font-weight: 800; color: #0284c7; margin: 0; }
        .inv-badge { text-align: right; }
        .inv-num { font-size: 16px; font-weight: 800; color: #0f172a; }
        .status-stamp { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
        .paid-upi { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
        .paid-cash { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 18px; font-size: 12px; border: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .total-row td { font-size: 15px; font-weight: 800; color: #0f172a; border-top: 2px solid #0f172a; }
        .pending-row td { font-size: 14px; font-weight: 700; color: #b91c1c; background: #fef2f2; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 14px; }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            <h1 class="clinic-title">${config.hospitalName}</h1>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #475569;">${config.hospitalNameMarathi}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">${config.address} • Helpline: ${config.phone}</p>
          </div>
          <div class="inv-badge">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">TAX INVOICE</span>
            <div class="inv-num">${bill.invoiceId}</div>
            <span class="status-stamp ${isUpi ? 'paid-upi' : 'paid-cash'}">
              ✓ PAID VIA ${bill.paymentMethod || 'CASH'}
            </span>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <span style="color:#64748b;">Patient Name:</span>
            <strong>${patient.name}</strong>
          </div>
          <div>
            <span style="color:#64748b;">Patient ID:</span>
            <strong>${patient.patientId}</strong>
          </div>
          <div>
            <span style="color:#64748b;">Billing Date:</span>
            <strong>${bill.billedAt || new Date().toLocaleDateString('en-GB')}</strong>
          </div>
          <div>
            <span style="color:#64748b;">Phone / Address:</span>
            <strong>+91 ${patient.phone} • ${patient.address}</strong>
          </div>
          ${bill.upiTxnRef ? `
            <div style="grid-column: span 2; color: #0369a1; font-weight: 600;">
              UPI Reference: ${bill.upiTxnRef} (Paid to ${config.upiId})
            </div>
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Service & Description</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <strong>Specialist Consultation Fee</strong>
                <div style="font-size: 11px; color: #64748b;">Consulting Doctor Evaluation & Clinical EMR Notes</div>
              </td>
              <td style="text-align: right;">₹${bill.consultationFee.toFixed(2)}</td>
            </tr>
            ${bill.procedureFee > 0 ? `
              <tr>
                <td>2</td>
                <td>
                  <strong>Clinical Procedure / Surgery Charges</strong>
                  <div style="font-size: 11px; color: #64748b;">Procedure / Clinical Treatment Rendered</div>
                </td>
                <td style="text-align: right;">₹${bill.procedureFee.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${bill.medicineFee > 0 ? `
              <tr>
                <td>3</td>
                <td>
                  <strong>Medicare Pharmacy Medications & Disposables</strong>
                  <div style="font-size: 11px; color: #64748b;">Prescribed formulations & topicals</div>
                </td>
                <td style="text-align: right;">₹${bill.medicineFee.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="2">TOTAL INVOICE CHARGES</td>
              <td style="text-align: right;">₹${bill.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Amount Paid Today (${bill.paymentMethod || 'Cash'})</strong></td>
              <td style="text-align: right; font-weight: 800; color: #047857;">₹${paid.toFixed(2)}</td>
            </tr>
            ${pending > 0 ? `
              <tr class="pending-row">
                <td colspan="2"><strong>Pending Balance Payable on Next Sitting</strong></td>
                <td style="text-align: right;">₹${pending.toFixed(2)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="footer">
          <div>
            <strong>Medicare Pharmacy & Clinic Desk</strong>
            <div>Official Helpline & WhatsApp: ${config.phone}</div>
          </div>
          <div style="text-align: right;">
            <div>Authorized Signatory: <strong>${bill.billedBy || 'Reception Desk'}</strong></div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Thank you for trusting Chaudhari Clinic Khamgaon.</div>
          </div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
