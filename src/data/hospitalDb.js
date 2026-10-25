// Hospital Database Engine with LocalStorage Persistence & Neon Serverless Postgres Sync
// Handles Patients, Unique Patient IDs, Doctor Notes, Prescriptions & Cash/UPI Billing

import { apiService } from './apiService.js';

const DB_KEY = 'CHAUDHARI_HOSPITAL_DB_V3';


export const INITIAL_HOSPITAL_CONFIG = {
  hospitalName: "Chaudhari Skin & Dental Care Multispeciality Clinic",
  hospitalNameMarathi: "चौधरी स्किन ॲन्ड डेंटल केअर मल्टीस्पेशालिटी क्लिनिक",
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
    name: "Dr. Priyanka Chaudhari (Anokar)",
    nameMarathi: "डॉ. प्रियांका चौधरी (अनोकार)",
    qualifications: "B.D.S. (Nashik)",
    specialty: "Senior Dental Surgeon & Endodontist (Painless RCT)",
    specialtyMarathi: "दंतशल्य चिकित्सक व मुखरोग तज्ञ",
    department: "Dental Surgery & RCT",
    room: "Dental Operatory 2",
    defaultFee: 350
  },
  {
    id: "dr-rutika",
    name: "Dr. Shrutika Tulaskar",
    nameMarathi: "डॉ. श्रुतिका तुळसकर",
    qualifications: "B.D.S., M.D.S. (Nashik)",
    specialty: "Senior Pediatric Dental Specialist & Oral Physician",
    specialtyMarathi: "बालदंत रोग व मुखरोग तज्ञ",
    department: "Pediatric Dentistry & Smile Design",
    room: "Dental Operatory 1",
    defaultFee: 300
  }
];

// Helpers for standardized clinical record timestamps & OPD shifts
export function getShiftFromTime(dateObj = new Date()) {
  const hours = dateObj.getHours();
  if (hours >= 8 && hours < 15) return 'Morning OPD';
  if (hours >= 15 && hours <= 22) return 'Evening OPD';
  return hours < 15 ? 'Morning OPD' : 'Evening OPD';
}

export function formatDateYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime12(d = new Date()) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initial pre-seeded patient records with full date & time history for immediate verification
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
    registeredDate: "2026-10-25",
    registeredTime: "09:30 AM",
    registeredShift: "Morning OPD",
    registeredTimestamp: 1792920600000,
    assignedDoctorId: "dr-priyanka",
    isEmergency: false,
    criticalAlerts: ["High BP"],
    status: "Billing Completed",
    externalRvgId: "RVG-308",
    pharmacyStatus: "None",
    dentalLab: {
      status: "Sent to Lab",
      labName: "Apex Dental Ceramic Studio, Akola",
      notes: "Zirconia Crown for #46 shade A2"
    },
    clinicalNotes: {
      checkupDate: "2026-10-25 10:15 AM",
      doctorName: "Dr. Priyanka Chaudhari (Anokar)",
      chiefComplaints: "Severe throbbing toothache in lower right back tooth since 3 days. Unable to chew.",
      duration: "3 Days",
      clinicalFindings: "Deep disto-occlusal caries in #46, tenderness on vertical percussion (++), positive cold test lingering pain.",
      diagnosis: "Acute Irreversible Pulpitis #46 with Apical Periodontitis",
      treatmentDone: "Single-sitting rotary endodontic access, biomechanical preparation up to 25/06, bioceramic obturation."
    },
    prescription: {
      prescribedAt: "2026-10-25 10:45 AM",
      doctorName: "Dr. Priyanka Chaudhari (Anokar)",
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
      billedDate: "2026-10-25",
      billedTime: "11:00 AM",
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
    },
    visitHistory: [
      {
        visitId: "VIS-1001-A",
        date: "2026-10-25",
        time: "10:15 AM",
        shift: "Morning OPD",
        doctorName: "Dr. Priyanka Chaudhari (Anokar)",
        diagnosis: "Acute Irreversible Pulpitis #46 with Apical Periodontitis",
        treatmentDone: "Single-sitting rotary endodontic access, biomechanical preparation, bioceramic obturation."
      }
    ]
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
    registeredDate: "2026-10-25",
    registeredTime: "10:00 AM",
    registeredShift: "Morning OPD",
    registeredTimestamp: 1792922400000,
    assignedDoctorId: "dr-rajnikant",
    isEmergency: false,
    criticalAlerts: [],
    status: "Prescription Ready", // Ready for Billing Desk
    externalRvgId: "",
    pharmacyStatus: "None",
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
      billedDate: "2026-10-25",
      billedTime: "",
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
    },
    visitHistory: [
      {
        visitId: "VIS-1002-A",
        date: "2026-10-25",
        time: "10:35 AM",
        shift: "Morning OPD",
        doctorName: "Dr. Rajnikant Arvind Chaudhari",
        diagnosis: "Acne Vulgaris (Grade III) with PIH",
        treatmentDone: "Comedone extraction + Salicylic-Mandelic peel trial."
      }
    ]
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
    registeredDate: "2026-10-25",
    registeredTime: "10:30 AM",
    registeredShift: "Morning OPD",
    registeredTimestamp: 1792924200000,
    assignedDoctorId: "dr-rutika",
    isEmergency: true, // Emergency acute tooth pain
    criticalAlerts: ["Drug Allergy: Penicillin"],
    status: "Waiting for Doctor",
    externalRvgId: "",
    pharmacyStatus: "None",
    dentalLab: { status: "No Lab Work", labName: "", notes: "" },
    clinicalNotes: null,
    prescription: null,
    billing: null,
    visitHistory: []
  },
  {
    patientId: "CSD-P0998",
    tokenNo: "12",
    name: "Rekha Sandeep Patil",
    phone: "9765412890",
    age: 39,
    gender: "Female",
    address: "Near Civil Hospital, Nandura",
    registeredAt: "2026-10-24 05:45 PM",
    registeredDate: "2026-10-24",
    registeredTime: "05:45 PM",
    registeredShift: "Evening OPD",
    registeredTimestamp: 1792863900000,
    assignedDoctorId: "dr-rajnikant",
    isEmergency: false,
    criticalAlerts: [],
    status: "Billing Completed",
    externalRvgId: "",
    pharmacyStatus: "None",
    dentalLab: { status: "No Lab Work", labName: "", notes: "" },
    clinicalNotes: {
      checkupDate: "2026-10-24 06:15 PM",
      doctorName: "Dr. Rajnikant Arvind Chaudhari",
      chiefComplaints: "Symmetrical brownish pigmentation on malar prominences and bridge of nose since 1 year.",
      duration: "1 Year",
      clinicalFindings: "Epidermal melasma pattern confirmed under Wood's lamp. Normal thyroid profile.",
      diagnosis: "Malar Chloasma / Epidermal Melasma",
      treatmentDone: "Q-Switched Nd:YAG Laser toning session + Meso-Glow infusion trial."
    },
    prescription: {
      prescribedAt: "2026-10-24 06:35 PM",
      doctorName: "Dr. Rajnikant Arvind Chaudhari",
      medicines: [
        { name: "Tranexamic Acid 250mg + Pine Bark Ext", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "30 Days", instructions: "Take regularly with water" },
        { name: "Kojic Acid + Arbutin + Mulberry Depigmenting Cream", type: "Gel", frequency: "0-0-1 (Night)", duration: "45 Days", instructions: "Apply strictly on pigmented spots only" },
        { name: "Tinted Physical Sunscreen SPF 50+ Zinc Oxide", type: "Gel", frequency: "Every 3 Hours", duration: "Daily", instructions: "Mandatory sun avoidance" }
      ],
      specialAdvice: "Strict barrier defense against kitchen heat and direct sunlight. Reapply sunblock religiously.",
      followUpDate: "2026-11-24"
    },
    billing: {
      invoiceId: "CSD-INV-0998",
      billedAt: "2026-10-24 06:50 PM",
      billedDate: "2026-10-24",
      billedTime: "06:50 PM",
      consultationFee: 400,
      procedureFee: 1500,
      medicineFee: 850,
      totalAmount: 2750,
      paidAmount: 2750,
      pendingBalance: 0,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      upiTxnRef: "",
      cashTendered: 3000,
      cashChange: 250,
      billedBy: "Reception Desk"
    },
    visitHistory: [
      {
        visitId: "VIS-0998-A",
        date: "2026-10-24",
        time: "06:15 PM",
        shift: "Evening OPD",
        doctorName: "Dr. Rajnikant Arvind Chaudhari",
        diagnosis: "Malar Chloasma / Epidermal Melasma",
        treatmentDone: "Q-Switched Nd:YAG Laser toning session."
      }
    ]
  },
  {
    patientId: "CSD-P0997",
    tokenNo: "05",
    name: "Rajesh Mohanrao Wagh",
    phone: "9823098765",
    age: 32,
    gender: "Male",
    address: "Ganesh Nagar, Farshi Road, Khamgaon",
    registeredAt: "2026-10-24 11:15 AM",
    registeredDate: "2026-10-24",
    registeredTime: "11:15 AM",
    registeredShift: "Morning OPD",
    registeredTimestamp: 1792839300000,
    assignedDoctorId: "dr-priyanka",
    isEmergency: false,
    criticalAlerts: [],
    status: "Billing Completed",
    externalRvgId: "RVG-299",
    pharmacyStatus: "None",
    dentalLab: { status: "No Lab Work", labName: "", notes: "" },
    clinicalNotes: {
      checkupDate: "2026-10-24 11:40 AM",
      doctorName: "Dr. Priyanka Chaudhari (Anokar)",
      chiefComplaints: "Recurrent swelling and difficulty opening mouth around lower left jaw angle.",
      duration: "10 Days",
      clinicalFindings: "Mesioangular impacted tooth #38 with inflamed operculum and food impaction.",
      diagnosis: "Acute Pericoronitis secondary to Mesioangular Impacted #38",
      treatmentDone: "Surgical disimpaction under local anesthesia (2% Lignocaine with 1:80000 Adrenaline), bone guttering, tooth sectioning, 3-0 silk sutures."
    },
    prescription: {
      prescribedAt: "2026-10-24 12:15 PM",
      doctorName: "Dr. Priyanka Chaudhari (Anokar)",
      medicines: [
        { name: "Augmentin 625mg Duo", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "5 Days", instructions: "Take after meals" },
        { name: "Zerodol-SP", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "3 Days", instructions: "For pain and edema" },
        { name: "Metrogyl 400mg", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "5 Days", instructions: "Anaerobic protection" },
        { name: "Choline Salicylate Dental Gel", type: "Gel", frequency: "TDS", duration: "5 Days", instructions: "Apply gently over wound area" }
      ],
      specialAdvice: "Ice pack compression externally for 24h. Cold liquids only. Suture removal scheduled on Day 7.",
      followUpDate: "2026-10-31"
    },
    billing: {
      invoiceId: "CSD-INV-0997",
      billedAt: "2026-10-24 12:30 PM",
      billedDate: "2026-10-24",
      billedTime: "12:30 PM",
      consultationFee: 350,
      procedureFee: 3000,
      medicineFee: 420,
      totalAmount: 3770,
      paidAmount: 3770,
      pendingBalance: 0,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      upiTxnRef: "UPI-918237461928",
      cashTendered: 0,
      cashChange: 0,
      billedBy: "Reception Desk"
    },
    visitHistory: [
      {
        visitId: "VIS-0997-A",
        date: "2026-10-24",
        time: "11:40 AM",
        shift: "Morning OPD",
        doctorName: "Dr. Priyanka Chaudhari (Anokar)",
        diagnosis: "Acute Pericoronitis #38 Disimpaction",
        treatmentDone: "Surgical disimpaction with bone guttering and silk sutures."
      }
    ]
  },
  {
    patientId: "CSD-P0990",
    tokenNo: "08",
    name: "Dnyaneshwar Vitthalrao Gawande",
    phone: "9422891234",
    age: 52,
    gender: "Male",
    address: "At Post Rohinkhed, Motala Taluka",
    registeredAt: "2026-10-21 10:30 AM",
    registeredDate: "2026-10-21",
    registeredTime: "10:30 AM",
    registeredShift: "Morning OPD",
    registeredTimestamp: 1792580400000,
    assignedDoctorId: "dr-rajnikant",
    isEmergency: false,
    criticalAlerts: ["Diabetes Type 2"],
    status: "Billing Completed",
    externalRvgId: "",
    pharmacyStatus: "None",
    dentalLab: { status: "No Lab Work", labName: "", notes: "" },
    clinicalNotes: {
      checkupDate: "2026-10-21 11:00 AM",
      doctorName: "Dr. Rajnikant Arvind Chaudhari",
      chiefComplaints: "Intensely itchy ring-shaped elevated red patches over waistline and groin for 3 weeks.",
      duration: "3 Weeks",
      clinicalFindings: "Annular erythematous plaques with central clearing and active peripheral scaling borders.",
      diagnosis: "Tinea Cruris & Tinea Corporis (Extensive Fungal Infection)",
      treatmentDone: "Skin scraping KOH mount positive for fungal hyphae. Antifungal regimen initiated."
    },
    prescription: {
      prescribedAt: "2026-10-21 11:20 AM",
      doctorName: "Dr. Rajnikant Arvind Chaudhari",
      medicines: [
        { name: "Itraconazole 200mg (Itracip / Canditral)", type: "Capsule", frequency: "0-0-1 (After Dinner)", duration: "21 Days", instructions: "Take immediately after heavy meal" },
        { name: "Luliconazole 1% Cream (Lulifin)", type: "Gel", frequency: "1-0-1 (Morning & Bedtime)", duration: "21 Days", instructions: "Apply 2cm beyond the red border" },
        { name: "Levocetirizine 5mg (Levocet)", type: "Tablet", frequency: "0-0-1 (Bedtime)", duration: "10 Days", instructions: "For relief from nocturnal itch" }
      ],
      specialAdvice: "Do not use steroid combination creams. Wear loose cotton clothes. Wash innerwear in hot boiling water and iron inside out.",
      followUpDate: "2026-11-11"
    },
    billing: {
      invoiceId: "CSD-INV-0990",
      billedAt: "2026-10-21 11:40 AM",
      billedDate: "2026-10-21",
      billedTime: "11:40 AM",
      consultationFee: 400,
      procedureFee: 200,
      medicineFee: 780,
      totalAmount: 1380,
      paidAmount: 1380,
      pendingBalance: 0,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      upiTxnRef: "UPI-827364519028",
      cashTendered: 0,
      cashChange: 0,
      billedBy: "Reception Desk"
    },
    visitHistory: [
      {
        visitId: "VIS-0990-A",
        date: "2026-10-21",
        time: "11:00 AM",
        shift: "Morning OPD",
        doctorName: "Dr. Rajnikant Arvind Chaudhari",
        diagnosis: "Tinea Cruris & Tinea Corporis",
        treatmentDone: "KOH mount examination & systemic antifungal counseling."
      }
    ]
  }
];

export class HospitalDatabase {
  formatDateYMD(d = new Date()) {
    return formatDateYMD(d);
  }

  formatTime12(d = new Date()) {
    return formatTime12(d);
  }

  getCurrentShift(d = new Date()) {
    return getCurrentShift(d);
  }

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
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.patients)) {
            // Auto-migrate any un-indexed records with standardized date/time keys
            parsed.patients = parsed.patients.map(p => {
              if (!p.registeredDate) {
                const parts = (p.registeredAt || '').split(' ');
                let d = parts[0] || '2026-10-25';
                if (d.includes('/')) {
                  const dp = d.split('/');
                  if (dp.length === 3) d = `${dp[2]}-${dp[1].padStart(2, '0')}-${dp[0].padStart(2, '0')}`;
                }
                p.registeredDate = d;
                p.registeredTime = parts.slice(1).join(' ') || '09:30 AM';
                p.registeredShift = p.registeredTime.includes('PM') && parseInt(p.registeredTime, 10) >= 5 ? 'Evening OPD' : 'Morning OPD';
                p.registeredTimestamp = new Date(p.registeredDate).getTime();
              }

              // Doctor Name Normalization
              if (p.assignedDoctorId === 'dr-priyanka') {
                if (p.clinicalNotes && p.clinicalNotes.doctorName) p.clinicalNotes.doctorName = "Dr. Priyanka Chaudhari (Anokar)";
                if (p.prescription && p.prescription.doctorName) p.prescription.doctorName = "Dr. Priyanka Chaudhari (Anokar)";
              } else if (p.assignedDoctorId === 'dr-rutika') {
                if (p.clinicalNotes && p.clinicalNotes.doctorName) p.clinicalNotes.doctorName = "Dr. Shrutika Tulaskar";
                if (p.prescription && p.prescription.doctorName) p.prescription.doctorName = "Dr. Shrutika Tulaskar";
              }

              if (!p.visitHistory) {
                p.visitHistory = p.clinicalNotes ? [{
                  visitId: `VIS-${p.patientId}-1`,
                  date: p.registeredDate,
                  time: p.registeredTime,
                  shift: p.registeredShift,
                  doctorName: p.clinicalNotes.doctorName || (p.assignedDoctorId === 'dr-priyanka' ? "Dr. Priyanka Chaudhari (Anokar)" : p.assignedDoctorId === 'dr-rutika' ? "Dr. Shrutika Tulaskar" : "Dr. Rajnikant Arvind Chaudhari"),
                  assignedDoctorId: p.assignedDoctorId,
                  diagnosis: p.clinicalNotes.diagnosis || '',
                  clinicalNotes: { ...p.clinicalNotes },
                  prescription: p.prescription ? { ...p.prescription } : null,
                  externalRvgId: p.externalRvgId || ''
                }] : [];
              } else {
                p.visitHistory.forEach(vh => {
                  if (vh.assignedDoctorId === 'dr-priyanka' || vh.doctorName?.includes('Priyanka')) {
                    vh.doctorName = "Dr. Priyanka Chaudhari (Anokar)";
                  } else if (vh.assignedDoctorId === 'dr-rutika' || vh.doctorName?.includes('Rutika')) {
                    vh.doctorName = "Dr. Shrutika Tulaskar";
                  }
                });
              }
              return p;
            });
          }
          if (!parsed.config) parsed.config = { ...INITIAL_HOSPITAL_CONFIG };
          if (!Array.isArray(parsed.patients)) parsed.patients = [...SEED_PATIENTS];
          if (!Array.isArray(parsed.pettyExpenses)) parsed.pettyExpenses = [];
          if (!parsed.nextPatientNum) parsed.nextPatientNum = 1004;
          if (!parsed.nextInvoiceNum) parsed.nextInvoiceNum = 1003;
          return parsed;
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

  registerPatient({ name, phone, age, gender = 'Other', address, assignedDoctorId, reason = '', isEmergency = false, criticalAlerts = [], existingPatientId = null, visitDate = null, visitTime = null }) {
    let patientId = existingPatientId;
    let num = this.data.nextPatientNum || 1004;

    if (!patientId) {
      patientId = `CSD-P${num}`;
      num++;
      this.data.nextPatientNum = num;
    }

    const now = new Date();
    const registeredDate = visitDate || formatDateYMD(now);
    const registeredTime = visitTime || formatTime12(now);
    const registeredShift = getShiftFromTime(now);
    const formattedDate = `${registeredDate} ${registeredTime}`;

    // Token calculation for today
    const tokenCount = (this.data.patients || []).filter(p => (p.registeredDate || '').startsWith(registeredDate)).length + 1;
    const tokenNo = String(tokenCount).padStart(2, '0');

    const newPatient = {
      patientId,
      tokenNo,
      name: name.trim(),
      phone: phone.trim(),
      age: parseInt(age, 10) || 0,
      gender,
      address: address.trim(),
      registeredAt: formattedDate,
      registeredDate,
      registeredTime,
      registeredShift,
      registeredTimestamp: now.getTime(),
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
      billing: null,
      visitHistory: []
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

    const now = new Date();
    const consultedDate = formatDateYMD(now);
    const consultedTime = formatTime12(now);
    const consultedShift = getShiftFromTime(now);
    const formattedConsultedAt = `${consultedDate} ${consultedTime}`;

    patient.consultedAt = formattedConsultedAt;
    patient.consultedDate = consultedDate;
    patient.consultedTime = consultedTime;
    patient.consultedShift = consultedShift;
    patient.consultedTimestamp = now.getTime();

    if (clinicalNotes) {
      clinicalNotes.checkupDate = formattedConsultedAt;
    }
    if (prescription) {
      prescription.prescribedAt = formattedConsultedAt;
    }

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
    patient.pharmacyStatus = "None"; // No on-site pharmacy

    // Log this visit into patient's permanent clinical visit history
    patient.visitHistory = patient.visitHistory || [];
    patient.visitHistory.push({
      visitId: `VIS-${Date.now()}`,
      date: consultedDate,
      time: consultedTime,
      shift: consultedShift,
      doctorName: clinicalNotes?.doctorName || '',
      assignedDoctorId: patient.assignedDoctorId,
      diagnosis: clinicalNotes?.diagnosis || '',
      treatmentDone: clinicalNotes?.treatmentDone || '',
      chiefComplaints: clinicalNotes?.chiefComplaints || '',
      clinicalNotes: clinicalNotes ? { ...clinicalNotes } : null,
      prescription: prescription ? { ...prescription } : null,
      externalRvgId: patient.externalRvgId
    });

    // Prepare billing stub for reception
    const invoiceNum = this.data.nextInvoiceNum || 1003;
    const invoiceId = `CSD-INV-${invoiceNum}`;

    const consultationFee = parseFloat(feeBreakdown?.consultationFee) || 0;
    const procedureFee = parseFloat(feeBreakdown?.procedureFee) || 0;
    const medicineFee = parseFloat(feeBreakdown?.medicineFee) || 0;
    const totalAmount = consultationFee + procedureFee + medicineFee;

    patient.billing = {
      invoiceId,
      billedAt: "",
      billedDate: "",
      billedTime: "",
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
    const billedDate = formatDateYMD(now);
    const billedTime = formatTime12(now);
    const formattedDate = `${billedDate} ${billedTime}`;

    const total = patient.billing.totalAmount || 0;
    const amountPaid = paidToday !== null ? parseFloat(paidToday) : total;
    const pending = Math.max(0, total - amountPaid);

    patient.billing.paymentMethod = paymentMethod; // 'Cash' or 'UPI'
    patient.billing.paidAmount = amountPaid;
    patient.billing.pendingBalance = pending;
    patient.billing.paymentStatus = pending === 0 ? "Paid" : "Partial";
    patient.billing.billedAt = formattedDate;
    patient.billing.billedDate = billedDate;
    patient.billing.billedTime = billedTime;
    patient.billing.billedTimestamp = now.getTime();
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

  // ========================================================
  // COMPREHENSIVE MEDICAL RECORDS STORAGE & DATE-TIME SEARCH
  // ========================================================
  searchMedicalRecords({ query = '', date = '', startDate = '', endDate = '', shift = 'all', doctorId = 'all', status = 'all', department = 'all' } = {}) {
    const q = (query || '').trim().toLowerCase();
    const all = this.getAllPatients();

    return all.filter(p => {
      // 1. Text Search (Name, Phone, UHID, Token, Address, Diagnosis, RVG)
      if (q) {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const phoneMatch = p.phone && p.phone.includes(q);
        const idMatch = p.patientId && p.patientId.toLowerCase().includes(q);
        const tokenMatch = p.tokenNo && String(p.tokenNo).includes(q);
        const addrMatch = p.address && p.address.toLowerCase().includes(q);
        const diagMatch = p.clinicalNotes?.diagnosis && p.clinicalNotes.diagnosis.toLowerCase().includes(q);
        const rvgMatch = p.externalRvgId && p.externalRvgId.toLowerCase().includes(q);
        const textMatched = nameMatch || phoneMatch || idMatch || tokenMatch || addrMatch || diagMatch || rvgMatch;
        if (!textMatched) return false;
      }

      // 2. Exact Calendar Date Search
      const recDate = p.registeredDate || (p.registeredAt ? p.registeredAt.split(' ')[0] : '');
      if (date && recDate !== date) {
        // Also check consultedDate / billedDate
        const consDate = p.consultedDate || '';
        const billDate = p.billing?.billedDate || '';
        if (consDate !== date && billDate !== date) {
          return false;
        }
      }

      // 3. Date Range Search
      if (startDate && recDate < startDate) return false;
      if (endDate && recDate > endDate) return false;

      // 4. OPD Shift Search (Morning OPD: 09:00 - 13:30, Evening OPD: 17:00 - 21:30)
      if (shift && shift !== 'all') {
        const pShift = p.registeredShift || (p.registeredTime && p.registeredTime.includes('PM') && parseInt(p.registeredTime, 10) >= 5 ? 'Evening OPD' : 'Morning OPD');
        if (pShift !== shift) return false;
      }

      // 5. Consulting Doctor Filter
      if (doctorId && doctorId !== 'all') {
        if (p.assignedDoctorId !== doctorId) return false;
      }

      // 6. Clinical Department Filter
      if (department && department !== 'all') {
        if (department === 'derm' && p.assignedDoctorId !== 'dr-rajnikant') return false;
        if (department === 'dental' && p.assignedDoctorId !== 'dr-priyanka') return false;
        if (department === 'pediatric' && p.assignedDoctorId !== 'dr-rutika') return false;
      }

      // 7. Status Filter
      if (status && status !== 'all') {
        if (p.status !== status) return false;
      }

      return true;
    });
  }

  // Generate downloadable CSV formatted for Microsoft Excel & Google Sheets
  exportRecordsAsCsv() {
    const patients = this.getAllPatients();
    const headers = [
      "Patient ID",
      "Token No",
      "Patient Name",
      "Age",
      "Gender",
      "Mobile Phone",
      "Address",
      "Registration Date",
      "Registration Time",
      "OPD Shift",
      "Attending Doctor",
      "Emergency Flag",
      "Status",
      "Diagnosis",
      "Treatment Performed",
      "External RVG ID",
      "Prescribed Medicines",
      "Invoice ID",
      "Total Amount (INR)",
      "Paid Amount (INR)",
      "Payment Mode",
      "UPI Reference",
      "Billed Date & Time"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = patients.map(p => {
      const doc = DOCTORS_ROSTER.find(d => d.id === p.assignedDoctorId);
      const docName = doc ? doc.name : (p.assignedDoctorId || 'OPD');
      const medList = p.prescription?.medicines ? p.prescription.medicines.map(m => `${m.name} (${m.frequency}, ${m.duration})`).join('; ') : '';
      const bill = p.billing || {};

      return [
        escapeCsv(p.patientId),
        escapeCsv(p.tokenNo),
        escapeCsv(p.name),
        escapeCsv(p.age),
        escapeCsv(p.gender),
        escapeCsv(p.phone),
        escapeCsv(p.address),
        escapeCsv(p.registeredDate || p.registeredAt?.split(' ')[0] || ''),
        escapeCsv(p.registeredTime || p.registeredAt?.split(' ').slice(1).join(' ') || ''),
        escapeCsv(p.registeredShift || 'Morning OPD'),
        escapeCsv(docName),
        escapeCsv(p.isEmergency ? 'YES' : 'NO'),
        escapeCsv(p.status),
        escapeCsv(p.clinicalNotes?.diagnosis || 'N/A'),
        escapeCsv(p.clinicalNotes?.treatmentDone || 'N/A'),
        escapeCsv(p.externalRvgId || 'N/A'),
        escapeCsv(medList),
        escapeCsv(bill.invoiceId || 'N/A'),
        escapeCsv(bill.totalAmount || 0),
        escapeCsv(bill.paidAmount || 0),
        escapeCsv(bill.paymentMethod || 'N/A'),
        escapeCsv(bill.upiTxnRef || 'N/A'),
        escapeCsv(bill.billedAt || 'N/A')
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  // Export full JSON database for backup
  exportRecordsAsJson() {
    return JSON.stringify(this.data, null, 2);
  }

  // Restore database from imported JSON
  importRecordsFromJson(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (parsed && Array.isArray(parsed.patients)) {
        this.save(parsed);
        apiService.pushFullSync(parsed).catch(err => console.warn('Neon sync note:', err));
        return { success: true, count: parsed.patients.length };
      }
      return { success: false, error: 'JSON does not contain a valid patients array.' };
    } catch (e) {
      console.error('Failed to import JSON records:', e);
      return { success: false, error: e.message };
    }
  }

  // Get storage statistics and audit summary
  getStorageStats() {
    const patients = this.getAllPatients();
    const dates = patients.map(p => p.registeredDate || p.registeredAt?.split(' ')[0]).filter(Boolean).sort();
    const oldestDate = dates[0] || 'Today';
    const newestDate = dates[dates.length - 1] || 'Today';

    let jsonBytes = 0;
    try {
      jsonBytes = new Blob([JSON.stringify(this.data)]).size;
    } catch (e) {}

    return {
      totalRecords: patients.length,
      oldestDate,
      newestDate,
      storageSizeKb: (jsonBytes / 1024).toFixed(1),
      neonConnected: apiService.isNeonConnected,
      doctorsCount: DOCTORS_ROSTER.length
    };
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
      "dr-priyanka": { count: 0, amount: 0, name: "Dr. Priyanka Chaudhari (Anokar) (Dental Surgery)" },
      "dr-rutika": { count: 0, amount: 0, name: "Dr. Shrutika Tulaskar (Pediatric Dental)" }
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
