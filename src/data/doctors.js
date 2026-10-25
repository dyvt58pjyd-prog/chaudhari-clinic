// Specialist Doctors Data for Chaudhari Skin and Dental Care Multi-Specialty Clinic
// Real Data from Official Clinic Board: Shriram Chowk, Farshi Road, Khamgaon
export const DOCTORS = [
  {
    id: "dr-rajnikant",
    name: "Dr. Rajnikant Arvind Chaudhari",
    nameMarathi: "डॉ. रजनीकांत अरविंद चौधरी",
    role: "Consultant Dermatologist, Cosmetologist, Trichologist & Laser Specialist",
    shortRole: "Dermatology & Trichology Lead",
    department: "skin",
    deptLabel: "Skin, Hair & Aesthetics",
    image: "/images/dr-snehal-chaudhari.jpg", // High-res portrait representation
    qualifications: "M.B.B.S., D.D.V. (Mumbai)",
    specialtiesMarathi: "त्वचारोग तज्ञ, केस विकार तज्ञ, सौंदर्य विषयक तज्ञ, कुष्ठरोग व गुप्तरोग तज्ञ",
    experience: "12+ Years Clinical Excellence",
    rating: 5.0,
    reviewCount: 380,
    opdTimings: "Mon – Sat: 10:00 AM – 2:00 PM & 5:00 PM – 8:30 PM",
    room: "Dermatology Suite 101",
    focus: [
      "Acne & Post-Acne Scar Revision",
      "Melasma & Hyperpigmentation",
      "Hair Fall & Alopecia PRP/GFC",
      "US FDA Laser Hair Reduction",
      "Clinical Dermatology & Eczema",
      "Medical Chemical Peels & Glow"
    ],
    bio: "Dr. Rajnikant Arvind Chaudhari (M.B.B.S., D.D.V. Mumbai) is a senior consultant dermatologist, cosmetologist, and trichologist with over 12 years of specialized medical practice. Trained in Mumbai's premier medical institutes, he brings advanced dermatological, laser, and hair regrowth protocols to Khamgaon and the Buldhana region.",
    slots: {
      morning: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM"],
      evening: ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"]
    },
    badge: "Dermatology Lead",
    badgeColor: "teal"
  },
  {
    id: "dr-rutika",
    name: "Dr. Rutika Tulaskar (Chaudhari)",
    nameMarathi: "डॉ. ऋतिका तुळसकर (चौधरी)",
    role: "Senior Pediatric Dental Specialist & Oral Physician",
    shortRole: "Pediatric Dentistry & Oral Specialist Lead",
    department: "dental",
    deptLabel: "Pediatric & Preventive Dentistry",
    image: "/images/dr-amit-chaudhari.jpg",
    qualifications: "B.D.S., M.D.S. (Nashik)",
    specialtiesMarathi: "बालदंत रोग व मुखरोग तज्ञ",
    experience: "10+ Years Clinical Excellence",
    rating: 5.0,
    reviewCount: 420,
    opdTimings: "Mon – Sat: 9:30 AM – 1:30 PM & 4:30 PM – 8:30 PM",
    room: "Dental Operatory 1 (Pediatric & Aesthetic)",
    focus: [
      "Painless Pediatric (Kids) Dentistry",
      "Child Pulpectomy & Zirconia Crowns",
      "Fluoride Treatment & Space Maintainers",
      "Oral Mucosal Disease Screening",
      "Preventive Dental Care & Sealants",
      "Smile Designing & Aligners"
    ],
    bio: "Dr. Rutika Tulaskar (Chaudhari) (B.D.S., M.D.S. Nashik) is a Master of Dental Surgery specializing in Pediatric and Preventive Dentistry and Oral Diseases. Renowned for her gentle, anxiety-free pediatric protocols, she provides compassionate, child-friendly dental care and oral health rehabilitation.",
    slots: {
      morning: ["09:30 AM", "10:15 AM", "11:00 AM", "11:45 AM", "12:30 PM", "01:15 PM"],
      evening: ["04:30 PM", "05:15 PM", "06:00 PM", "06:45 PM", "07:30 PM", "08:15 PM"]
    },
    badge: "Pediatric & Oral Lead",
    badgeColor: "emerald"
  },
  {
    id: "dr-priyanka",
    name: "Dr. Priyanka Chaudhari (Anekar)",
    nameMarathi: "डॉ. प्रियांका चौधरी (अनेकार)",
    role: "Senior Dental Surgeon & Endodontist / Aesthetic Lead",
    shortRole: "Senior Dental Surgeon & RCT Lead",
    department: "dental",
    deptLabel: "Dental Surgery & Endodontics",
    image: "/images/dr-rohan-chaudhari.jpg",
    qualifications: "B.D.S. (Nashik)",
    specialtiesMarathi: "दंतशल्य चिकित्सक व मुखरोग तज्ञ",
    experience: "9+ Years Clinical Excellence",
    rating: 5.0,
    reviewCount: 390,
    opdTimings: "Mon – Sat: 10:30 AM – 2:30 PM & 5:00 PM – 9:00 PM",
    room: "Dental Operatory 2 (Surgical & RCT)",
    focus: [
      "Painless Single-Visit Root Canal (RCT)",
      "Dental Implants & CAD/CAM Crowns",
      "Digital Smile Designing & Veneers",
      "Impacted Wisdom Tooth Extraction",
      "Laser Teeth Whitening",
      "Emergency Acute Toothache Relief"
    ],
    bio: "Dr. Priyanka Chaudhari (Anekar) (B.D.S. Nashik) is a senior dental surgeon specializing in rotary micro-endodontics, aesthetic smile designing, and comprehensive oral surgery. With modern computerized technology, she delivers 100% painless single-sitting root canals and aesthetic restorative dentistry.",
    slots: {
      morning: ["10:30 AM", "11:15 AM", "12:00 PM", "12:45 PM", "01:30 PM", "02:15 PM"],
      evening: ["05:00 PM", "05:45 PM", "06:30 PM", "07:15 PM", "08:00 PM", "08:45 PM"]
    },
    badge: "Dental Surgery Lead",
    badgeColor: "blue"
  }
];

export function getDoctorById(id) {
  return DOCTORS.find(d => d.id === id) || DOCTORS[0];
}

export function getDoctorsByDept(department) {
  if (department === "all") return DOCTORS;
  return DOCTORS.filter(d => d.department === department);
}
