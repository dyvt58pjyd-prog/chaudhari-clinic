// Comprehensive End-to-End Service Test for Neon PostgreSQL & Chaudhari Clinic HMS
import 'dotenv/config';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5173/api';

async function runNeonServicesE2E() {
  console.log('================================================================');
  console.log('🏥 STARTING END-TO-END NEON SERVICES VERIFICATION');
  console.log(`Endpoint Base: ${BASE_URL}`);
  console.log('================================================================\n');

  let passes = 0;
  let total = 10;

  // 1. Healthcheck
  console.log('--- TEST 1: NEON DATABASE HEALTHCHECK ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  if (health.status === 'healthy' && health.neonConnected === true) {
    console.log(`✅ Neon PostgreSQL is Connected! Latency: ${health.latencyMs}ms, DB: ${health.database}`);
    passes++;
  } else {
    console.error('❌ Health check failed:', health);
  }

  // 2. Hospital Config & UPI Settings
  console.log('\n--- TEST 2: CLINIC CONFIG & UPI SETTINGS ---');
  const configRes = await fetch(`${BASE_URL}/config`);
  const config = await configRes.json();
  if (config.upiId === '9049883983@ybl' && config.hospitalName) {
    console.log(`✅ Clinic Config Verified: ${config.hospitalName}`);
    console.log(`   Official Hospital UPI VPA: ${config.upiId} (${config.upiPayeeName})`);
    passes++;
  } else {
    console.error('❌ Config check failed:', config);
  }

  // 3. Patient Admission
  console.log('\n--- TEST 3: RECEPTION DESK PATIENT ADMISSION (WRITE TO NEON) ---');
  const patPayload = {
    name: 'Gajanan V. Deshmukh',
    phone: '9822154321',
    age: 46,
    gender: 'Male',
    address: 'Shriram Chowk, Farshi Road, Khamgaon',
    assignedDoctorId: 'dr.priyanka',
    reason: 'Severe molar toothache & gum bleeding',
    isEmergency: true,
    criticalAlerts: ['Hypertensive (140/90)']
  };
  const admitRes = await fetch(`${BASE_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patPayload)
  });
  const admitted = await admitRes.json();
  if (admitted.patientId && admitted.name === patPayload.name) {
    console.log(`✅ Patient Admitted to Neon: ${admitted.patientId} - ${admitted.name} (Token #${admitted.tokenNo})`);
    passes++;
  } else {
    console.error('❌ Admission failed:', admitted);
  }

  const patientId = admitted.patientId;

  // 4. Patient Query / Phone Search
  console.log('\n--- TEST 4: PATIENT SEARCH BY MOBILE (READ FROM NEON) ---');
  const searchRes = await fetch(`${BASE_URL}/patients?phone=9822154321`);
  const searchResults = await searchRes.json();
  if (Array.isArray(searchResults) && searchResults.some(p => p.patientId === patientId)) {
    console.log(`✅ Patient Found via Mobile Search (Count: ${searchResults.length})`);
    passes++;
  } else {
    console.error('❌ Patient search failed:', searchResults);
  }

  // 5. Clinical Checkup & Prescription
  console.log('\n--- TEST 5: DOCTOR CLINICAL CHECKUP & PRESCRIPTION (UPDATE IN NEON) ---');
  const checkupPayload = {
    patientId,
    status: 'Prescription Ready',
    externalRvgId: 'RVG-KHM-NEON-101',
    clinicalNotes: {
      diagnosis: 'Acute Irreversible Pulpitis #46 with Periapical Radiolucency',
      treatmentDone: 'Emergency Access Cavity Opened & Pulp Extirpated',
      nextVisit: 'After 3 days for RCT Obturation'
    },
    prescription: [
      { name: 'Augmentin 625 Duo (Amoxicillin + Clavulanic)', dosage: '1-0-1', days: 5, timing: 'After Food' },
      { name: 'Ketorol DT 10mg (Ketorolac Tromethamine)', dosage: '1-0-1 (SOS)', days: 3, timing: 'After Food' }
    ],
    billing: {
      consultationFee: 300,
      treatmentCharges: 2500,
      xrayCharges: 300,
      medicineCharges: 420,
      totalAmount: 3520,
      status: 'Unpaid'
    }
  };
  const checkupRes = await fetch(`${BASE_URL}/patients?patientId=${patientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkupPayload)
  });
  const checkupResult = await checkupRes.json();
  if (checkupResult.patientId && checkupResult.externalRvgId === 'RVG-KHM-NEON-101') {
    console.log(`✅ Doctor Clinical Checkup & Rx Saved: Bill ₹${checkupResult.billing?.totalAmount}`);
    console.log(`   External Dental RVG Software ID: ${checkupResult.externalRvgId}`);
    passes++;
  } else {
    console.error('❌ Checkup save failed:', checkupResult);
  }

  // 6. Billing Desk & UPI Payment
  console.log('\n--- TEST 6: BILLING DESK & UPI PAYMENT (UPDATE IN NEON) ---');
  const billingPayload = {
    patientId,
    paidAmount: 3520,
    paymentMethod: 'UPI',
    upiRef: 'UPI-NEON-9049883983',
    discount: 0
  };
  const billRes = await fetch(`${BASE_URL}/billing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(billingPayload)
  });
  const billResult = await billRes.json();
  if (billResult.success && (billResult.billing?.status === 'Paid' || billResult.patient?.billing?.status === 'Paid')) {
    const billingInfo = billResult.billing || billResult.patient?.billing;
    console.log(`✅ Bill Paid via UPI: Total ₹${billingInfo.totalAmount}, Status: ${billingInfo.status}`);
    passes++;
  } else {
    console.error('❌ Billing failed:', billResult);
  }

  // 7. Medicare Pharmacy Queue
  console.log('\n--- TEST 7: MEDICARE PHARMACY PRESCRIPTION QUEUE ---');
  const pharmRes = await fetch(`${BASE_URL}/pharmacy`);
  const pharmQueue = await pharmRes.json();
  const patientInQueue = Array.isArray(pharmQueue) && pharmQueue.some(p => p.patientId === patientId);
  if (patientInQueue) {
    console.log(`✅ Medicare Pharmacy Queue Active (Prescriptions Pending: ${pharmQueue.length})`);
    passes++;
  } else {
    console.error('❌ Pharmacy queue failed:', pharmQueue);
  }

  // 8. Pharmacy Dispense
  console.log('\n--- TEST 8: MEDICARE PHARMACY DISPENSE VERIFICATION ---');
  const dispenseRes = await fetch(`${BASE_URL}/pharmacy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, pharmacistName: 'Pharmacist Rahul Chaudhari' })
  });
  const dispenseResult = await dispenseRes.json();
  if (dispenseResult.success && dispenseResult.pharmacyStatus === 'Dispensed') {
    console.log(`✅ Medication Dispensed by: ${dispenseResult.dispensedBy} at ${dispenseResult.dispensedAt}`);
    passes++;
  } else {
    console.error('❌ Pharmacy dispense failed:', dispenseResult);
  }

  // 9. Petty Cash Expense
  console.log('\n--- TEST 9: PETTY CASH EXPENSE VOUCHER (WRITE TO NEON) ---');
  const expRes = await fetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Sterilization & Autoclave Rolls',
      amount: 680,
      note: 'Reception desk petty cash voucher'
    })
  });
  const expResult = await expRes.json();
  if (expResult.id && expResult.amount === 680) {
    console.log(`✅ Petty Cash Voucher Created: ₹${expResult.amount} (${expResult.category})`);
    passes++;
  } else {
    console.error('❌ Expense failed:', expResult);
  }

  // 10. Database Backup Sync
  console.log('\n--- TEST 10: FULL NEON DATABASE JSON BACKUP & RESTORE ---');
  const syncRes = await fetch(`${BASE_URL}/sync`);
  const syncData = await syncRes.json();
  if (syncData.patients && syncData.patients.length > 0) {
    console.log(`✅ Neon Database Backup Verified: ${syncData.patients.length} Patients, ${syncData.pettyExpenses?.length} Expenses`);
    passes++;
  } else {
    console.error('❌ Sync export failed:', syncData);
  }

  console.log('\n================================================================');
  if (passes === total) {
    console.log(`🎉 ALL ${passes}/${total} NEON SERVICES PASSED END-TO-END! 🚀`);
  } else {
    console.log(`⚠️ ${passes}/${total} tests passed.`);
  }
  console.log('================================================================\n');

  if (passes !== total) {
    process.exit(1);
  }
}

runNeonServicesE2E().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
