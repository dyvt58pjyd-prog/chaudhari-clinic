import { authService, HOSPITAL_STAFF_ACCOUNTS } from './src/data/authService.js';
import { hospitalDb } from './src/data/hospitalDb.js';
import { notificationEngine } from './src/utils/notificationEngine.js';
import { medicinesFormulary, MEDICINE_CATEGORIES } from './src/data/medicinesFormulary.js';

console.log('================================================================');
console.log('🏥 STARTING FULL SYSTEM VERIFICATION: CHAUDHARI CLINIC & PHARMACY');
console.log('================================================================');

// TEST 1: ALL 7 STAFF CREDENTIALS
console.log('\n--- TEST 1: VERIFYING ALL 7 STAFF ACCOUNTS ---');
let allLoginsPassed = true;
HOSPITAL_STAFF_ACCOUNTS.forEach(cred => {
  const result = authService.login(cred.username, cred.password);
  if (!result.success || result.user.role !== cred.role) {
    console.error(`❌ Login FAILED for ${cred.username} (expected role: ${cred.role})`);
    allLoginsPassed = false;
  } else {
    console.log(`✅ [${cred.role.toUpperCase()}] ${cred.username} authenticated successfully -> ${result.user.name}`);
  }
});
if (!allLoginsPassed) throw new Error('Staff authentication failed!');

// TEST 2: RECEPTION RETURNING PATIENT LOOKUP & ADMISSION
console.log('\n--- TEST 2: RECEPTION DESK & RETURNING PATIENT AUTO-FILL ---');
const existingPooja = hospitalDb.findPatientByPhone('9423589012');
console.log(`Searching 9423589012: Found ${existingPooja ? existingPooja.name + ' (' + existingPooja.patientId + ')' : 'NONE'}`);
if (!existingPooja || existingPooja.patientId !== 'CSD-P1002') {
  throw new Error('Returning patient lookup failed!');
}
console.log('✅ Returning patient auto-fill verified.');

// Emergency patient admission
const emergencyPatient = hospitalDb.registerPatient({
  name: "Gajanan Deshmukh",
  phone: "9876543210",
  age: 42,
  gender: "Male",
  address: "Farshi Road, Khamgaon",
  assignedDoctorId: "dr-priyanka",
  reason: "Severe acute molar abscess & throbbing pain",
  isEmergency: true,
  criticalAlerts: ["High BP", "Drug Allergy"]
});
console.log(`Registered Emergency Patient: ${emergencyPatient.patientId} - ${emergencyPatient.name} (Emergency: ${emergencyPatient.isEmergency})`);
const allPatients = hospitalDb.getAllPatients();
if (allPatients[0].patientId !== emergencyPatient.patientId) {
  throw new Error('Emergency patient was not prioritized at head of queue!');
}
console.log('✅ Emergency patient correctly placed at position 1 in queue.');

// TEST 3: SELECTIVE MEDICINE BOX & 8 CATEGORIES
console.log('\n--- TEST 3: SELECTIVE MEDICINE BOX & FORMULARY ---');
const allMeds = medicinesFormulary.getAllMedicines();
console.log(`Total Formulary Items: ${allMeds.length}`);
if (allMeds.length < 35) throw new Error('Formulary has less than 35 medicines!');

const dentalMeds = medicinesFormulary.search('', 'dental');
const dermMeds = medicinesFormulary.search('', 'derm');
const antibioticMeds = medicinesFormulary.search('', 'antibiotic');
console.log(`Dental Meds: ${dentalMeds.length}, Derm Meds: ${dermMeds.length}, Antibiotics: ${antibioticMeds.length}`);

const searchResults = medicinesFormulary.search('amoxicillin');
console.log(`Search 'amoxicillin' matched: ${searchResults.map(m => m.name).join(', ')}`);
if (searchResults.length === 0) throw new Error('Medicine search failed!');
console.log('✅ Selective medicine box formulary verified.');


// TEST 4: DOCTOR CHECKUP & BILLING HANDOFF
console.log('\n--- TEST 4: DOCTOR CHECKUP & PRESCRIPTION HANDOFF ---');
const savedEmergency = hospitalDb.saveClinicalCheckupAndPrescription(emergencyPatient.patientId, {
  clinicalNotes: {
    chiefComplaints: "Severe acute pulpitic pain in lower left molar (36)",
    examination: "Deep disto-occlusal carious lesion in 36, tender to vertical percussion, grade I mobility",
    diagnosis: "Acute Irreversible Pulpitis #36 with Apical Periodontitis",
    treatmentDone: "Single-sitting rotary RCT initiated, access opening, working length 21mm, calcium hydroxide dressing",
    doctorName: "Dr. Priyanka Chaudhari (Anekar)"
  },
  prescription: {
    prescribedAt: "2026-10-25 06:40 PM",
    doctorName: "Dr. Priyanka Chaudhari (Anekar)",
    medicines: [
      { name: "Amoxicillin 500mg + Clavulanic Acid 125mg (Augmentin 625)", type: "Tablet", frequency: "1-0-1 (After Food)", duration: "5 Days", instructions: "Take after food with plenty of water" },
      { name: "Ketorolac Tromethamine 10mg (Ketorol-DT)", type: "Tablet", frequency: "1-0-1 (SOS / Pain)", duration: "3 Days", instructions: "Disperse in half cup water immediately for severe pain" },
      { name: "Pantoprazole 40mg + Domperidone 30mg (Pan-D)", type: "Capsule", frequency: "1-0-0 (Before Food)", duration: "5 Days", instructions: "Take 30 mins before breakfast on empty stomach" },
      { name: "Chlorhexidine Gluconate 0.2% w/v Mouthwash (Hexidine)", type: "Liquid", frequency: "1-0-1 (Post Brushing)", duration: "10 Days", instructions: "Swish 10ml undiluted for 60 seconds and spit" }
    ],
    specialAdvice: "Avoid chewing hard food from the left side. Warm saline rinses 3 times daily.",
    followUpDate: "2026-10-30"
  },
  feeBreakdown: {
    consultationFee: 350,
    procedureFee: 2500, // RCT
    medicineFee: 420
  },
  externalRvgId: "RVG-KHM-402",
  criticalAlerts: ["High BP", "Drug Allergy"]
});

console.log(`Doctor Saved Checkup for ${savedEmergency.name}:`);
console.log(`- Status: ${savedEmergency.status}`);
console.log(`- External RVG Ref: ${savedEmergency.externalRvgId}`);
console.log(`- Total Bill: ₹${savedEmergency.billing.totalAmount}`);
console.log(`- Pharmacy Status: ${savedEmergency.pharmacyStatus}`);
if (savedEmergency.status !== 'Prescription Ready' || savedEmergency.pharmacyStatus !== 'Pending') {
  throw new Error('Checkup handoff status mismatch!');
}
console.log('✅ Doctor checkup and billing handoff verified.');

// TEST 5: REAL-TIME NOTIFICATION ENGINE
console.log('\n--- TEST 5: REAL-TIME NOTIFICATION BROADCAST ---');
let notified = false;
const unsub = notificationEngine.onNotification((notif) => {
  console.log(`Live Notification Received: [${notif.type}] ${notif.title} -> ${notif.message}`);
  notified = true;
});

notificationEngine.notify({
  type: 'CHECKUP_DONE',
  title: '✅ Checkup Done: Gajanan Deshmukh (CSD-P1004)',
  message: 'Checkup completed by Dr. Priyanka Chaudhari. Ready for Billing (₹3,270) & Medicare Pharmacy!',
  icon: '📋',
  patientId: savedEmergency.patientId,
  targetView: 'billing'
});

unsub();
if (!notified) throw new Error('Notification engine failed to broadcast!');
console.log('✅ Real-time notification trigger 1 verified.');

// TEST 6: BILLING (PARTIAL PAYMENT & DYNAMIC UPI)
console.log('\n--- TEST 6: BILLING DESK & PARTIAL PAYMENT ---');
// Patient pays ₹2,000 today out of ₹3,270 (pending ₹1,270 for obturation)
const billedPatient = hospitalDb.completeBilling(savedEmergency.patientId, {
  paymentMethod: 'UPI',
  paidToday: 2000,
  upiTxnRef: 'UPI-TEST-9049883983-001',
  billedBy: 'Reception Staff Desk'
});

console.log(`Billed Patient: ${billedPatient.name}`);
console.log(`- Total Bill: ₹${billedPatient.billing.totalAmount}`);
console.log(`- Paid Today: ₹${billedPatient.billing.paidAmount}`);
console.log(`- Pending Balance: ₹${billedPatient.billing.pendingBalance}`);
console.log(`- Status: ${billedPatient.billing.paymentStatus}`);
if (billedPatient.billing.pendingBalance !== 1270 || billedPatient.billing.paidAmount !== 2000) {
  throw new Error('Partial payment calculation failed!');
}
console.log('✅ Partial payment & pending balance verified.');

// TEST 7: MEDICARE PHARMACY DISPENSING
console.log('\n--- TEST 7: MEDICARE PHARMACY DISPENSING ---');
const pharmacyQueue = hospitalDb.getPharmacyQueue();
console.log(`Pharmacy Queue Count: ${pharmacyQueue.length}`);
const pharmItem = pharmacyQueue.find(p => p.patientId === savedEmergency.patientId);
if (!pharmItem) throw new Error('Patient not found in Medicare Pharmacy queue!');

hospitalDb.markPharmacyDispensed(savedEmergency.patientId, 'Pharmacist Rahul');
const dispensedPatient = hospitalDb.getPatientById(savedEmergency.patientId);
console.log(`Patient Pharmacy Status: ${dispensedPatient.pharmacyStatus} by ${dispensedPatient.pharmacyDispensedBy}`);
if (dispensedPatient.pharmacyStatus !== 'Dispensed') throw new Error('Dispense status update failed!');
console.log('✅ Medicare Pharmacy queue and dispense confirmed.');

// TEST 8: ADMIN ANALYTICS & DOCTOR-WISE SPLIT
console.log('\n--- TEST 8: ADMIN CLOSING, DOCTOR SPLIT & PETTY CASH ---');
hospitalDb.addPettyExpense({
  category: "Clinic Autoclave Pouches & Alcohol Swabs",
  amount: 450,
  note: "Buldhana Surgical Supplies"
});

const metrics = hospitalDb.getMetrics();
console.log(`Total Gross Revenue: ₹${metrics.totalRevenue}`);
console.log(`UPI Revenue: ₹${metrics.upiRevenue}, Cash Revenue: ₹${metrics.cashRevenue}`);
console.log(`Total Petty Expenses: ₹${metrics.totalPettyExpenses}`);
console.log(`Net Hospital Balance: ₹${metrics.netHospitalBalance}`);
console.log('Doctor-Wise Breakdown:');
Object.keys(metrics.doctorCollections).forEach(docKey => {
  const d = metrics.doctorCollections[docKey];
  console.log(`- ${d.name}: ₹${d.amount} (${d.count} patients)`);
});

if (metrics.netHospitalBalance !== (metrics.totalRevenue - metrics.totalPettyExpenses)) {
  throw new Error('Net hospital balance calculation error!');
}
console.log('✅ Admin analytics, doctor-wise split, and petty expenses verified.');

// TEST 9: BACKUP & RESTORE
console.log('\n--- TEST 9: DATABASE JSON BACKUP & RESTORE ---');
const backupJson = hospitalDb.exportJson();
if (!backupJson || backupJson.length < 500) throw new Error('JSON export produced invalid payload');
console.log(`JSON Backup generated (${backupJson.length} bytes).`);
const restoreSuccess = hospitalDb.importJson(backupJson);
if (!restoreSuccess) throw new Error('JSON backup restoration failed!');
console.log('✅ JSON Database backup & restore verified.');

console.log('\n================================================================');
console.log('🎉 ALL 9 SYSTEM VERIFICATION SUITES PASSED WITH ZERO ERRORS! 🚀');
console.log('================================================================\n');
