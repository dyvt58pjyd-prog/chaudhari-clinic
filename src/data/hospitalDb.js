// Hospital Database Engine with LocalStorage Persistence & Neon Serverless Postgres Sync
// Handles Patients, Unique Patient IDs, Doctor Notes, Prescriptions, Medicare Pharmacy & Cash/UPI Billing

import { apiService } from './apiService.js';

const DB_KEY = 'CHAUDHARI_HOSPITAL_DB_V3';


export const INITIAL_HOSPITAL_CONFIG = {
  hospitalName: "Chaudhari Skin & Dental Care Multispeciality Clinic",
  hospitalNameMarathi: "चौधरी स्किन ॲन्ड डेंटल केअर मल्टीस्पेशालिटी क्लिनिक",
  pharmacyName: "Medicare Pharmacy (मेडिकेअर फार्मसी)",
  address: "Shriram Chowk, Farshi Road, Near Dr. Chande Clinic, Shivalay Vihar, Khamgaon, Buldhana – 444303",
  phone: "+91 90498 83983",
  email: "care@chaudhariclinic.com",
  upiId: "9049883983@ybl", // Official Clinic UPI ID (Editable by Admin)
  upiPayeeName: "Chaudhari Clinic Khamgaon",
  defaultConsultationFees: {
    "dr-rajnikant": 400,
    "dr-priyanka": 350,
    "dr-rutika": 300
  }
};

export const DOCTORS_ROSTER = [
  {
    id: "dr-rajnikant",
    name: "Dr. Rajnikant Arvind Chaudhari",
    nameMarathi: "डॉ. रजनीकांत अरविंद चौधरी",
    qualifications: "M.B.B.S., D.D.V. (Mumbai)",
    specialty: "Consultant Dermatologist, Trichologist & Cosmetologist",
    specialtyMarathi: "त्वचारोग, केस विकार, सौंदर्य व कुष्ठरोग तज्ञ",
    department: "Dermatology & Skin",
    room: "Dermatology Suite 101",
    defaultFee: 400
  },
  {
    id: "dr-priyanka",
    name: "Dr. Priyanka Chaudhari (Anekar)",
    nameMarathi: "डॉ. प्रियांका चौधरी (अनेकार)",
    qualifications: "B.D.S. (Nashik)",
    specialty: "Senior Dental Surgeon & Endodontist (Painless RCT)",
    specialtyMarathi: "दंतशल्य चिकित्सक व मुखरोग तज्ञ",
    department: "Dental Surgery & RCT",
    room: "Dental Operatory 2",
    defaultFee: 350
  },
  {
    id: "dr-rutika",
    name: "Dr. Rutika Tulaskar (Chaudhari)",
    nameMarathi: "डॉ. ऋतिका तुळसकर (चौधरी)",
    qualifications: "B.D.S., M.D.S. (Nashik)",
    specialty: "Senior Pediatric Dental Specialist & Oral Physician",
    specialtyMarathi: "बालदंत रोग व मुखरोग तज्ञ",
    department: "Pediatric Dentistry & Smile Design",
    room: "Dental Operatory 1",
    defaultFee: 300
  }
];

// Initial pre-seeded patient records for immediate verification
const SEED_PATIENTS = [
  {
    patientId: "CSD-P1001",
    tokenNo: "01",
    name: "Suresh Baburao Deshmukh",
    phone: "9822145670",
    age: 48,
    gender: "Male",
    address: "At Post Jalamb, Nandura Road, Khamgaon",
    registeredAt: "2026-10-25 09:30 AM",
    assignedDoctorId: "dr-priyanka",
    isEmergency: false,
    criticalAlerts: ["High BP"],
    status: "Billing Completed",
    externalRvgId: "RVG-308",
    pharmacyStatus: "Dispensed",
    dentalLab: {
      status: "Sent to Lab",
      labName: "Apex Dental Ceramic Studio, Akola",
      notes: "Zirconia Crown for #46 shade A2"
    },
    clinicalNotes: {
      checkupDate: "2026-10-25 10:15 AM",
      doctorName: "Dr. Priyanka Chaudhari (Anekar)",
      chiefComplaints: "Severe throbbing toothache in lower right back tooth since 3 days. Unable to chew.",
      duration: "3 Days",
      clinicalFindings: "Deep disto-occlusal caries in #46, tenderness on vertical percussion (++), positive cold test lingering pain.",
      diagnosis: "Acute Irreversible Pulpitis #46 with Apical Periodontitis",
      treatmentDone: "Single-sitting rotary endodontic access, biomechanical preparation up to 25/06, bioceramic obturation."
    },
    prescription: {
      prescribedAt: "2026-10-25 10:45 AM",
      doctorName: "Dr. Priyanka Chaudhari (Anekar)",
      medicines: [
        { name: "Amoxicillin 500mg", type: "Capsule", frequency: "1-1-1 (After Food)", duration: "5 Days", instructions: "Complete full antibiotic course" },
        { name: "Zerodol-SP (Aceclofenac + Serratiopeptidase)", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "3 Days", instructions: "For pain and swelling relief" },
        { name: "Pantocid 40mg (Pantoprazole)", type: "Tablet", frequency: "1-0-0 (Empty Stomach)", duration: "5 Days", instructions: "Take 30 mins before breakfast" },
        { name: "Hexidine 0.2% Mouthwash", type: "Liquid", frequency: "1-0-1 (After Food)", duration: "7 Days", instructions: "Rinse 10ml for 1 minute after brushing" }
      ],
      specialAdvice: "Avoid chewing hard food on right side for 48 hours. Warm saline gargles starting tomorrow. Return for crown measurement after 5 days.",
      followUpDate: "2026-10-30"
    },
    billing: {
      invoiceId: "CSD-INV-1001",
      billedAt: "2026-10-25 11:00 AM",
      consultationFee: 350,
      procedureFee: 2500, // RCT fee
      medicineFee: 320,
      totalAmount: 3170,
      paidAmount: 3170,
      pendingBalance: 0,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      upiTxnRef: "UPI-429810459821",
      cashTendered: 0,
      cashChange: 0,
      billedBy: "Reception Desk"
    }
  },
  {
    patientId: "CSD-P1002",
    tokenNo: "02",
    name: "Pooja Santosh Wankhede",
    phone: "9423589012",
    age: 24,
    gender: "Female",
    address: "Farshi Road, Khamgaon",
    registeredAt: "2026-10-25 10:00 AM",
    assignedDoctorId: "dr-rajnikant",
    isEmergency: false,
    criticalAlerts: [],
    status: "Prescription Ready", // Ready for Billing & Pharmacy!
    externalRvgId: "",
    pharmacyStatus: "Pending",
    dentalLab: { status: "No Lab Work", labName: "", notes: "" },
    clinicalNotes: {
      checkupDate: "2026-10-25 10:35 AM",
      doctorName: "Dr. Rajnikant Arvind Chaudhari",
      chiefComplaints: "Persistent cystic acne on both cheeks and forehead with post-inflammatory dark spots for 6 months.",
      duration: "6 Months",
      clinicalFindings: "Grade III inflammatory papules, pustules, and mandibular comedones. Oily skin type IV with hyperpigmentation.",
      diagnosis: "Acne Vulgaris (Grade III) with Post-Inflammatory Hyperpigmentation (PIH)",
      treatmentDone: "Comedone extraction + Salicylic-Mandelic chemical peel trial on active lesions."
    },
    prescription: {
      prescribedAt: "2026-10-25 10:55 AM",
      doctorName: "Dr. Rajnikant Arvind Chaudhari",
      medicines: [
        { name: "Adapalene 0.1% + Clindamycin 1% Gel (Deriva-CMS)", type: "Gel", frequency: "0-0-1 (Bedtime)", duration: "30 Days", instructions: "Apply pea-sized amount over lesions at night" },
        { name: "Doxycycline 100mg (Doxy-1 L-DR)", type: "Capsule", frequency: "1-0-0 (After Food)", duration: "15 Days", instructions: "Take with full glass of water, do not lie down immediately" },
        { name: "Cetaphil / Sebamed Gentle Skin Cleanser", type: "Liquid", frequency: "1-0-1 (Morning-Night)", duration: "Daily", instructions: "Wash face gently twice daily with lukewarm water" },
        { name: "Silicone Matte Sunscreen Gel SPF 50+ PA+++", type: "Gel", frequency: "Every 4 Hours", duration: "Daily", instructions: "Apply 20 mins before sun exposure" }
      ],
      specialAdvice: "Do not pick or squeeze acne lesions. Drink 3 liters of water daily. Avoid excess oily, dairy, and high-glycemic food.",
      followUpDate: "2026-11-10"
    },
    billing: {
      invoiceId: "CSD-INV-1002",
      billedAt: "",
      consultationFee: 400,
      procedureFee: 800, // Peel
      medicineFee: 650,
      totalAmount: 1850,
      paidAmount: 0,
      pendingBalance: 1850,
      paymentMethod: "",
      paymentStatus: "Pending",
      upiTxnRef: "",
      cashTendered: 0,
      cashChange: 0,
      billedBy: ""
    }
  },
  {
    patientId: "CSD-P1003",
    tokenNo: "03",
    name: "Master Aarav Sachin Kulkarni",
    phone: "9890123456",
    age: 7,
    gender: "Male",
    address: "Shivalay Vihar, Khamgaon",
    registeredAt: "2026-10-25 10:30 AM",
    assignedDoctorId: "dr-rutika",
    isEmergency: true, // Emergency acute tooth pain
    criticalAlerts: ["Drug Allergy"],
    status: "Waiting for Doctor",
    externalRvgId: "",
    pharmacyStatus: "None",
    dentalLab: { status: "No Lab Work", labName: "", notes: "" },
    clinicalNotes: null,
    prescription: null,
    billing: null
  }
];

export class HospitalDatabase {
  constructor() {
    this.data = this.load();
    this.initCloudSync();
  }

  async initCloudSync() {
    if (typeof window === 'undefined') return;
    try {
      const health = await apiService.checkHealth();
      if (health && health.neonConnected) {
        await this.pullFromNeon();
      }
    } catch (e) {
      console.warn('Neon cloud sync note:', e);
    }
  }

  async pullFromNeon() {
    try {
      const [remotePatients, remoteConfig, remoteExpenses] = await Promise.all([
        apiService.fetchPatients(),
        apiService.fetchConfig(),
        apiService.fetchExpenses()
      ]);

      let changed = false;
      if (Array.isArray(remotePatients) && remotePatients.length > 0) {
        this.data.patients = remotePatients;
        changed = true;
      }
      if (remoteConfig && remoteConfig.upiId) {
        this.data.config = { ...this.data.config, ...remoteConfig };
        changed = true;
      }
      if (Array.isArray(remoteExpenses) && remoteExpenses.length > 0) {
        this.data.pettyExpenses = remoteExpenses;
        changed = true;
      }

      if (changed) {
        this.save();
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('CSD_DATABASE_SYNCED'));
        }
      }
    } catch (e) {
      console.warn('Error syncing with Neon:', e);
    }
  }

  async syncWithNeon() {
    return await apiService.pushFullSync(this.data);
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.error('Failed to load DB from localStorage:', e);
    }

    const initial = {
      config: { ...INITIAL_HOSPITAL_CONFIG },
      patients: [...SEED_PATIENTS],
      pettyExpenses: [
        { id: 'exp-1', category: 'Clinic Sanitization', amount: 350, date: '2026-10-25', note: 'Autoclave pouches & disinfectant' }
      ],
      nextPatientNum: 1004,
      nextInvoiceNum: 1003
    };
    this.save(initial);
    return initial;
  }

  save(data = this.data) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
      }
      this.data = data;
    } catch (e) {
      console.error('Failed to save DB to localStorage:', e);
    }
  }


  // --- Patient Management ---
  getAllPatients() {
    return this.data.patients || [];
  }

  getPatientById(patientId) {
    return (this.data.patients || []).find(p => p.patientId === patientId);
  }

  findPatientByPhone(phone) {
    if (!phone) return null;
    const clean = phone.trim().replace(/\D/g, '');
    if (clean.length < 10) return null;
    return (this.data.patients || []).find(p => {
      const pClean = p.phone.replace(/\D/g, '');
      return pClean === clean || pClean.endsWith(clean) || clean.endsWith(pClean);
    });
  }

  registerPatient({ name, phone, age, gender = 'Other', address, assignedDoctorId, reason = '', isEmergency = false, criticalAlerts = [], existingPatientId = null }) {
    let patientId = existingPatientId;
    let num = this.data.nextPatientNum || 1004;

    if (!patientId) {
      patientId = `CSD-P${num}`;
      num++;
      this.data.nextPatientNum = num;
    }

    // Token for today
    const tokenCount = (this.data.patients || []).length + 1;
    const tokenNo = String(tokenCount).padStart(2, '0');
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient = {
      patientId,
      tokenNo,
      name: name.trim(),
      phone: phone.trim(),
      age: parseInt(age, 10) || 0,
      gender,
      address: address.trim(),
      registeredAt: formattedDate,
      assignedDoctorId,
      reason: reason.trim(),
      isEmergency: !!isEmergency,
      criticalAlerts: Array.isArray(criticalAlerts) ? criticalAlerts : [],
      status: "Waiting for Doctor",
      externalRvgId: "",
      pharmacyStatus: "None",
      dentalLab: { status: "No Lab Work", labName: "", notes: "" },
      clinicalNotes: null,
      prescription: null,
      billing: null
    };

    // If emergency, insert at front
    if (isEmergency) {
      this.data.patients.unshift(newPatient);
    } else {
      this.data.patients.push(newPatient);
    }

    this.save();
    apiService.registerPatient(newPatient).catch(err => console.warn('Async Neon sync note:', err));
    return newPatient;
  }

  // --- Doctor Notes & Prescription ---
  saveClinicalCheckupAndPrescription(patientId, { clinicalNotes, prescription, feeBreakdown, externalRvgId = '', criticalAlerts = [], dentalLab = null }) {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    patient.clinicalNotes = clinicalNotes;
    patient.prescription = prescription;
    patient.externalRvgId = externalRvgId || patient.externalRvgId || '';
    if (criticalAlerts.length > 0) {
      patient.criticalAlerts = criticalAlerts;
    }
    if (dentalLab) {
      patient.dentalLab = dentalLab;
    }
    patient.status = "Prescription Ready";
    patient.pharmacyStatus = "Pending"; // Notify Medicare Pharmacy

    // Prepare billing stub for reception
    const invoiceNum = this.data.nextInvoiceNum || 1003;
    const invoiceId = `CSD-INV-${invoiceNum}`;

    const consultationFee = parseFloat(feeBreakdown.consultationFee) || 0;
    const procedureFee = parseFloat(feeBreakdown.procedureFee) || 0;
    const medicineFee = parseFloat(feeBreakdown.medicineFee) || 0;
    const totalAmount = consultationFee + procedureFee + medicineFee;

    patient.billing = {
      invoiceId,
      billedAt: "",
      consultationFee,
      procedureFee,
      medicineFee,
      totalAmount,
      paidAmount: 0,
      pendingBalance: totalAmount,
      paymentMethod: "",
      paymentStatus: "Pending",
      upiTxnRef: "",
      cashTendered: 0,
      cashChange: 0,
      billedBy: ""
    };

    this.data.nextInvoiceNum = invoiceNum + 1;
    this.save();

    apiService.updatePatient(patientId, {
      clinicalNotes,
      prescription,
      feeBreakdown,
      externalRvgId: patient.externalRvgId,
      criticalAlerts: patient.criticalAlerts,
      dentalLab: patient.dentalLab,
      status: patient.status,
      pharmacyStatus: patient.pharmacyStatus,
      billing: patient.billing
    }).catch(err => console.warn('Async Neon sync note:', err));

    return patient;
  }

  // --- Billing (Cash & Dynamic UPI) ---
  completeBilling(patientId, { paymentMethod, paidToday = null, cashTendered = 0, cashChange = 0, upiTxnRef = '', billedBy = 'Reception Staff' }) {
    const patient = this.getPatientById(patientId);
    if (!patient || !patient.billing) return null;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const total = patient.billing.totalAmount || 0;
    const amountPaid = paidToday !== null ? parseFloat(paidToday) : total;
    const pending = Math.max(0, total - amountPaid);

    patient.billing.paymentMethod = paymentMethod; // 'Cash' or 'UPI'
    patient.billing.paidAmount = amountPaid;
    patient.billing.pendingBalance = pending;
    patient.billing.paymentStatus = pending === 0 ? "Paid" : "Partial";
    patient.billing.billedAt = formattedDate;
    patient.billing.billedBy = billedBy;
    patient.billing.cashTendered = cashTendered;
    patient.billing.cashChange = cashChange;
    patient.billing.upiTxnRef = upiTxnRef || (paymentMethod === 'UPI' ? `UPI-${Date.now().toString().slice(-8)}` : '');

    patient.status = "Billing Completed";
    this.save();

    apiService.completeBilling(patientId, {
      paymentMethod,
      paidToday: amountPaid,
      cashTendered,
      cashChange,
      upiTxnRef: patient.billing.upiTxnRef,
      billedBy
    }).catch(err => console.warn('Async Neon sync note:', err));

    return patient;
  }

  // --- Medicare Pharmacy Operations ---
  getPharmacyQueue() {
    return (this.data.patients || []).filter(p => 
      p.prescription && 
      p.prescription.medicines && 
      p.prescription.medicines.length > 0 &&
      (p.status === 'Prescription Ready' || p.status === 'Billing Completed')
    );
  }

  markPharmacyDispensed(patientId, pharmacistName = 'Medicare Pharmacy') {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;
    patient.pharmacyStatus = "Dispensed";
    patient.pharmacyDispensedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    patient.pharmacyDispensedBy = pharmacistName;
    this.save();

    apiService.markPharmacyDispensed(patientId, pharmacistName).catch(err => console.warn('Async Neon sync note:', err));
    return patient;
  }

  // --- Dental Lab Tracker ---
  updateDentalLab(patientId, { status, labName = '', notes = '' }) {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;
    patient.dentalLab = {
      status,
      labName,
      notes,
      updatedAt: new Date().toLocaleDateString('en-GB')
    };
    this.save();

    apiService.updatePatient(patientId, { dentalLab: patient.dentalLab }).catch(err => console.warn('Async Neon sync note:', err));
    return patient;
  }

  // --- Petty Expenses ---
  addPettyExpense({ category, amount, note = '' }) {
    if (!this.data.pettyExpenses) this.data.pettyExpenses = [];
    const expense = {
      id: `exp-${Date.now()}`,
      category,
      amount: parseFloat(amount) || 0,
      note,
      date: new Date().toLocaleDateString('en-GB')
    };
    this.data.pettyExpenses.push(expense);
    this.save();

    apiService.addExpense(expense).catch(err => console.warn('Async Neon sync note:', err));
    return expense;
  }

  getPettyExpenses() {
    return this.data.pettyExpenses || [];
  }

  // --- Hospital Settings & Config ---
  getConfig() {
    return this.data.config || INITIAL_HOSPITAL_CONFIG;
  }

  updateConfig(newConfig) {
    this.data.config = { ...this.data.config, ...newConfig };
    this.save();

    apiService.updateConfig(this.data.config).catch(err => console.warn('Async Neon sync note:', err));
    return this.data.config;
  }


  // --- Analytics & Financial Metrics ---
  getMetrics() {
    const patients = this.data.patients || [];
    const totalPatients = patients.length;
    
    let totalRevenue = 0;
    let cashRevenue = 0;
    let upiRevenue = 0;
    let pendingBills = 0;
    let completedBills = 0;
    let waitingPatients = 0;
    let totalPendingBalance = 0;

    // Doctor-wise Split
    const doctorCollections = {
      "dr-rajnikant": { count: 0, amount: 0, name: "Dr. Rajnikant Chaudhari (Dermatology)" },
      "dr-priyanka": { count: 0, amount: 0, name: "Dr. Priyanka Chaudhari (Dental Surgery)" },
      "dr-rutika": { count: 0, amount: 0, name: "Dr. Rutika Chaudhari (Pediatric Dental)" }
    };

    patients.forEach(p => {
      if (p.status === 'Waiting for Doctor') waitingPatients++;
      if (p.billing) {
        const paid = p.billing.paidAmount !== undefined ? p.billing.paidAmount : (p.billing.paymentStatus === 'Paid' ? p.billing.totalAmount : 0);
        totalPendingBalance += (p.billing.pendingBalance || 0);

        if (p.billing.paymentStatus === 'Paid' || p.billing.paymentStatus === 'Partial') {
          totalRevenue += paid;
          if (p.billing.paymentMethod === 'Cash') {
            cashRevenue += paid;
          } else if (p.billing.paymentMethod === 'UPI') {
            upiRevenue += paid;
          }
          completedBills++;

          // Credit doctor
          if (p.assignedDoctorId && doctorCollections[p.assignedDoctorId]) {
            doctorCollections[p.assignedDoctorId].count++;
            doctorCollections[p.assignedDoctorId].amount += paid;
          }
        } else if (p.billing.paymentStatus === 'Pending') {
          pendingBills++;
        }
      }
    });

    // Expenses
    const totalPettyExpenses = (this.data.pettyExpenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const netHospitalBalance = totalRevenue - totalPettyExpenses;

    return {
      totalPatients,
      totalRevenue,
      cashRevenue,
      upiRevenue,
      pendingBills,
      completedBills,
      waitingPatients,
      totalPendingBalance,
      doctorCollections,
      totalPettyExpenses,
      netHospitalBalance
    };
  }

  // --- Database Export / Import ---
  exportJson() {
    return JSON.stringify(this.data, null, 2);
  }

  importJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.patients && parsed.config) {
        this.save(parsed);
        apiService.pushFullSync(parsed).catch(err => console.warn('Neon sync note:', err));
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import:', e);
    }
    return false;
  }

  resetToDefault() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DB_KEY);
    }
    this.data = this.load();
    return this.data;
  }
}

// Global Singleton Instance
export const hospitalDb = new HospitalDatabase();
