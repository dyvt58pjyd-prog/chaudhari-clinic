// Mock Patient Portal & 3-Doctor Live Queue Data - Chaudhari Clinic Khamgaon
export const CURRENT_PATIENT = {
  id: "CSD-KHM-4402",
  name: "Rahul Sharma",
  age: 29,
  gender: "Male",
  phone: "+91 90498 83983",
  email: "rahul.sharma@example.com",
  bloodGroup: "O+ve",
  city: "Khamgaon, Dist. Buldhana",
  memberSince: "March 2025",
  allergies: "None reported (Penicillin Tolerant)"
};

export const INITIAL_PATIENT_APPOINTMENTS = [
  {
    id: "CSD-APT-8821",
    doctorId: "dr-priyanka",
    doctorName: "Dr. Priyanka Chaudhari (Anekar)",
    doctorRole: "Senior Dental Surgeon",
    doctorDept: "Dental Surgery & Endodontics",
    doctorImage: "/images/dr-rohan-chaudhari.jpg",
    treatment: "Zirconia Crown Final Seating & Occlusal Check (Post-RCT)",
    date: "Tomorrow, Oct 26, 2026",
    time: "11:15 AM",
    status: "Confirmed",
    room: "Dental Operatory 2",
    type: "In-Clinic Procedure",
    token: "Token #03"
  },
  {
    id: "CSD-APT-8845",
    doctorId: "dr-rajnikant",
    doctorName: "Dr. Rajnikant Arvind Chaudhari",
    doctorRole: "Consultant Dermatologist",
    doctorDept: "Skin, Hair & Aesthetics",
    doctorImage: "/images/dr-snehal-chaudhari.jpg",
    treatment: "Session 3 of 6: US FDA Laser Hair Reduction",
    date: "Nov 02, 2026",
    time: "05:30 PM",
    status: "Upcoming",
    room: "Dermatology Suite 101",
    type: "In-Clinic Procedure",
    token: "Token #08"
  },
  {
    id: "CSD-APT-7910",
    doctorId: "dr-rutika",
    doctorName: "Dr. Rutika Tulaskar (Chaudhari)",
    doctorRole: "Pediatric Dentist & Smile Specialist",
    doctorDept: "Pediatric & Preventive Dentistry",
    doctorImage: "/images/dr-amit-chaudhari.jpg",
    treatment: "Clear Aligner Tray 4 Fitment & 3D Optical Scan",
    date: "Oct 14, 2026",
    time: "06:00 PM",
    status: "Completed",
    room: "Dental Operatory 1",
    type: "In-Clinic",
    token: "Token #05"
  }
];

export const MULTI_SESSION_TRACKERS = [
  {
    id: "track-laser",
    treatmentName: "US FDA Triple-Wave Laser Hair Reduction",
    doctorId: "dr-rajnikant",
    doctorName: "Dr. Rajnikant Arvind Chaudhari",
    dept: "Skin & Laser",
    totalSessions: 6,
    completedSessions: 2,
    percentComplete: 33,
    nextSessionDue: "Nov 02, 2026 (05:30 PM)",
    status: "Active & In-Progress",
    log: [
      { session: 1, date: "Aug 20, 2026", notes: "Patch test tolerated well. 810nm diode used with sapphire contact chill. Minimal redness subsided in 2 hours." },
      { session: 2, date: "Sep 22, 2026", notes: "Follicular density reduction noted. Energy calibrated. 40% reduction verified on trichoscopy." }
    ],
    careNote: "Apply prescribed sunscreen and avoid direct sun exposure for 3 days post-session."
  },
  {
    id: "track-rct",
    treatmentName: "Micro-Endodontic Single-Visit RCT & Crown Rehabilitation",
    doctorId: "dr-priyanka",
    doctorName: "Dr. Priyanka Chaudhari (Anekar)",
    dept: "Endodontics",
    totalSessions: 2,
    completedSessions: 1,
    percentComplete: 50,
    nextSessionDue: "Tomorrow, Oct 26, 2026 (11:15 AM)",
    status: "Crown Seating Due",
    log: [
      { session: 1, date: "Oct 18, 2026", notes: "Rotary instrumentation completed on tooth #36. Electronic apex locator verified working length. Obturated with gutta-percha. Temporary seal placed. Patient reported zero pain." }
    ],
    careNote: "Refrain from hard biting on left quadrant until permanent zirconia crown is cemented tomorrow."
  },
  {
    id: "track-aligner",
    treatmentName: "Clear Invisible Aligners Smile Transformation",
    doctorId: "dr-rutika",
    doctorName: "Dr. Rutika Tulaskar (Chaudhari)",
    dept: "Pediatric & Smile Aesthetics",
    totalSessions: 12,
    completedSessions: 4,
    percentComplete: 33,
    nextSessionDue: "Nov 16, 2026",
    status: "Tray 4 Active",
    log: [
      { session: 1, date: "Jul 10, 2026", notes: "Initial digital optical scan and 3D simulation approved." },
      { session: 2, date: "Aug 05, 2026", notes: "Delivered aligner sets 1 to 3 with aesthetic composite attachments." },
      { session: 3, date: "Sep 15, 2026", notes: "Delivered aligner set 4. Tracking 100% on schedule." }
    ],
    careNote: "Wear aligners 20 to 22 hours per day. Remove only during meals and brushing."
  }
];

export const DIGITAL_PRESCRIPTIONS = [
  {
    id: "RX-KHM-2026-9041",
    date: "18 Oct 2026",
    doctor: "Dr. Priyanka Chaudhari (Anekar)",
    degree: "B.D.S. (Nashik)",
    dept: "Dental & Oral Surgery",
    dispensedBy: "Prescription Issued at Doctor Cabin",
    diagnosis: "Acute Irreversible Pulpitis - Mandibular Left 1st Molar (Tooth #36)",
    medicines: [
      { name: "Tab. Augmentin 625 Duo (Amoxicillin + Pot. Clavulanate)", dosage: "1 Tablet Twice Daily (After Food)", duration: "3 Days" },
      { name: "Tab. Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)", dosage: "1 Tablet SOS (Pain only, After food)", duration: "3 Days" },
      { name: "Hexidine Mouthwash (0.2% Chlorhexidine Gluconate)", dosage: "10 ml rinse twice daily, do not swallow", duration: "5 Days" }
    ],
    instructions: "Light warm saline rinses starting 24h post-RCT. Do not bite on hard foods on left side until crown is seated.",
    signedBy: "Dr. Priyanka Chaudhari (BDS Reg No. 44812, Nashik)"
  },
  {
    id: "RX-KHM-2026-8714",
    date: "22 Sep 2026",
    doctor: "Dr. Rajnikant Arvind Chaudhari",
    degree: "M.B.B.S., D.D.V. (Mumbai)",
    dept: "Skin, Hair & Aesthetics",
    dispensedBy: "Prescription Issued at Doctor Cabin",
    diagnosis: "Follicular Hair Reduction Maintenance & Post-Laser Barrier Support",
    medicines: [
      { name: "Episoft AC Hydrating Sunscreen Gel SPF 50+ PA++++", dosage: "Apply generously 20 mins before sun exposure, reapply q3h", duration: "Continuous" },
      { name: "Cicalfate+ Restorative Barrier Cream", dosage: "Apply thin layer at night for 3 consecutive days", duration: "3 Nights" }
    ],
    instructions: "Strict sun defense with broad spectrum SPF 50+.",
    signedBy: "Dr. Rajnikant Arvind Chaudhari (DDV Mumbai Reg No. 67104)"
  }
];

// 3-Doctor Parallel Live Queue for Reception & Staff Admin Dashboard
export const INITIAL_DOCTOR_QUEUES = {
  "dr-rajnikant": {
    doctorName: "Dr. Rajnikant Arvind Chaudhari",
    room: "Dermatology Suite 101",
    specialty: "Consultant Dermatologist & Trichologist (D.D.V. Mumbai)",
    avatar: "/images/dr-snehal-chaudhari.jpg",
    statusText: "Currently In Consultation",
    currentPatient: "Pooja Deshmukh (Token #04) — Chemical Peel",
    patients: [
      { id: "Q-101", token: "#04", name: "Pooja Deshmukh", age: 25, treatment: "Medical Glow Peel", status: "In Room", time: "05:15 PM", priority: "Normal" },
      { id: "Q-102", token: "#05", name: "Kunal Mehra", age: 31, treatment: "Acne Scar Subcision", status: "Waiting in Lounge", time: "05:45 PM", priority: "Normal" },
      { id: "Q-103", token: "#06", name: "Ananya Roy", age: 27, treatment: "PRP Hair Therapy", status: "Waiting in Lounge", time: "06:15 PM", priority: "Normal" },
      { id: "Q-104", token: "#07", name: "Neha Kadam", age: 34, treatment: "Hydrafacial Glow", status: "Scheduled", time: "06:45 PM", priority: "Normal" }
    ]
  },
  "dr-priyanka": {
    doctorName: "Dr. Priyanka Chaudhari (Anekar)",
    room: "Dental Operatory 2 (Surgical & RCT)",
    specialty: "Senior Dental Surgeon & Endodontist (BDS Nashik)",
    avatar: "/images/dr-rohan-chaudhari.jpg",
    statusText: "Currently In RCT Procedure",
    currentPatient: "Vikram Patil (Token #02) — Rotary RCT Step 1",
    patients: [
      { id: "Q-201", token: "#02", name: "Vikram Patil", age: 48, treatment: "Rotary RCT Step 1", status: "In Room", time: "05:00 PM", priority: "Normal" },
      { id: "Q-202", token: "#03", name: "Amitabh Joshi", age: 52, treatment: "Acute Toothache / Emergency Pulpitis", status: "Waiting in Lounge", time: "05:30 PM", priority: "EMERGENCY PAIN" },
      { id: "Q-203", token: "#04", name: "Suresh Agarwal", age: 61, treatment: "Dental Implant Check", status: "Waiting in Lounge", time: "06:15 PM", priority: "Normal" },
      { id: "Q-204", token: "#05", name: "Priyanka Naik", age: 38, treatment: "Wisdom Tooth Microsurgery", status: "Scheduled", time: "07:00 PM", priority: "Normal" }
    ]
  },
  "dr-rutika": {
    doctorName: "Dr. Rutika Tulaskar (Chaudhari)",
    room: "Dental Operatory 1 (Pediatric & Aesthetic)",
    specialty: "Pediatric Dental Specialist & Oral Physician (M.D.S. Nashik)",
    avatar: "/images/dr-amit-chaudhari.jpg",
    statusText: "Currently In Pediatric Care",
    currentPatient: "Aarav Sharma (Child, Token #03) — Pulpectomy & Fluoride",
    patients: [
      { id: "Q-301", token: "#03", name: "Aarav Sharma (Child)", age: 8, treatment: "Pediatric Fluoride & Pulpectomy", status: "In Room", time: "05:10 PM", priority: "Normal" },
      { id: "Q-302", token: "#04", name: "Simran Kaur", age: 23, treatment: "3D Intraoral Aligners Scan", status: "Waiting in Lounge", time: "05:50 PM", priority: "Normal" },
      { id: "Q-303", token: "#05", name: "Tanvi Shah", age: 21, treatment: "Porcelain Veneers Consultation", status: "Waiting in Lounge", time: "06:30 PM", priority: "Normal" },
      { id: "Q-304", token: "#06", name: "Rohan Varma", age: 28, treatment: "Teeth Whitening", status: "Scheduled", time: "07:15 PM", priority: "Normal" }
    ]
  }
};
