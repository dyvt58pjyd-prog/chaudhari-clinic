// Patients API - CRUD for Patient Admissions & Clinical Checkups in Neon DB
import { getSql, ensureSchemaInitialized, getDatabaseUrl } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getSql();
  if (!sql) {
    return res.status(503).json({
      error: 'Neon DATABASE_URL is not configured on this server.',
      fallbackToLocal: true
    });
  }

  await ensureSchemaInitialized(sql);

  try {
    // 1. GET: Fetch all patients or search by phone
    if (req.method === 'GET') {
      const { phone, id } = req.query;

      if (id) {
        const rows = await sql`
          SELECT * FROM patients WHERE patient_id = ${id} LIMIT 1;
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        return res.status(200).json(formatPatientRow(rows[0]));
      }

      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const rows = await sql`
          SELECT * FROM patients 
          WHERE phone LIKE ${'%' + cleanPhone + '%'}
          ORDER BY updated_at DESC LIMIT 5;
        `;
        return res.status(200).json(rows.map(formatPatientRow));
      }

      // Order: Emergency patients first, then newest registered
      const rows = await sql`
        SELECT * FROM patients 
        ORDER BY is_emergency DESC, created_at DESC;
      `;
      return res.status(200).json(rows.map(formatPatientRow));
    }

    // 2. POST: Register new patient
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const {
        name,
        phone,
        age,
        gender = 'Other',
        address,
        assignedDoctorId,
        reason = '',
        isEmergency = false,
        criticalAlerts = [],
        existingPatientId = null
      } = body;

      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required.' });
      }

      let patientId = existingPatientId;
      if (!patientId) {
        // Generate sequential CSD-Pxxxx ID from DB
        const countRes = await sql`SELECT count(*)::int as total FROM patients;`;
        const nextNum = 1001 + countRes[0].total;
        patientId = `CSD-P${nextNum}`;
      }

      // Token generation for today
      const todayTokens = await sql`SELECT count(*)::int as count FROM patients;`;
      const tokenNo = String(todayTokens[0].count + 1).padStart(2, '0');

      const now = new Date();
      const formattedDate =
        now.toLocaleDateString('en-GB') +
        ' ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await sql`
        INSERT INTO patients (
          patient_id, token_no, name, phone, age, gender, address,
          registered_at, assigned_doctor_id, reason, is_emergency,
          critical_alerts, status, external_rvg_id, pharmacy_status
        ) VALUES (
          ${patientId},
          ${tokenNo},
          ${name.trim()},
          ${phone.trim()},
          ${parseInt(age, 10) || 0},
          ${gender},
          ${address.trim()},
          ${formattedDate},
          ${assignedDoctorId},
          ${reason.trim()},
          ${!!isEmergency},
          ${JSON.stringify(criticalAlerts)},
          'Waiting for Doctor',
          '',
          'None'
        )
        ON CONFLICT (patient_id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          age = EXCLUDED.age,
          address = EXCLUDED.address,
          assigned_doctor_id = EXCLUDED.assigned_doctor_id,
          reason = EXCLUDED.reason,
          is_emergency = EXCLUDED.is_emergency,
          critical_alerts = EXCLUDED.critical_alerts,
          status = 'Waiting for Doctor',
          updated_at = CURRENT_TIMESTAMP;
      `;

      const inserted = await sql`SELECT * FROM patients WHERE patient_id = ${patientId};`;
      return res.status(201).json(formatPatientRow(inserted[0]));
    }

    // 3. PUT: Update clinical checkup, prescription, lab, or status
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { patientId } = req.query;
      const targetId = patientId || body.patientId;

      if (!targetId) {
        return res.status(400).json({ error: 'patientId is required for update.' });
      }

      const {
        clinicalNotes,
        prescription,
        feeBreakdown,
        externalRvgId,
        criticalAlerts,
        dentalLab,
        status,
        pharmacyStatus,
        billing
      } = body;

      // Build billing payload if saving clinical checkup
      let billingPayload = billing;
      let newStatus = status || 'Prescription Ready';
      let newPharmStatus = pharmacyStatus || 'None';

      if (feeBreakdown && !billing) {
        const invRes = await sql`SELECT count(*)::int as total FROM patients WHERE billing IS NOT NULL;`;
        const invoiceNum = 1001 + invRes[0].total;
        const invoiceId = `CSD-INV-${invoiceNum}`;

        const consultationFee = parseFloat(feeBreakdown.consultationFee) || 0;
        const procedureFee = parseFloat(feeBreakdown.procedureFee) || 0;
        const medicineFee = parseFloat(feeBreakdown.medicineFee) || 0;
        const totalAmount = consultationFee + procedureFee + medicineFee;

        billingPayload = {
          invoiceId,
          billedAt: '',
          consultationFee,
          procedureFee,
          medicineFee,
          totalAmount,
          paidAmount: 0,
          pendingBalance: totalAmount,
          paymentMethod: '',
          paymentStatus: 'Pending',
          upiTxnRef: '',
          cashTendered: 0,
          cashChange: 0,
          billedBy: ''
        };
      }

      await sql`
        UPDATE patients SET
          clinical_notes = COALESCE(${clinicalNotes ? JSON.stringify(clinicalNotes) : null}, clinical_notes),
          prescription = COALESCE(${prescription ? JSON.stringify(prescription) : null}, prescription),
          billing = COALESCE(${billingPayload ? JSON.stringify(billingPayload) : null}, billing),
          external_rvg_id = COALESCE(${externalRvgId || null}, external_rvg_id),
          critical_alerts = COALESCE(${criticalAlerts ? JSON.stringify(criticalAlerts) : null}, critical_alerts),
          dental_lab = COALESCE(${dentalLab ? JSON.stringify(dentalLab) : null}, dental_lab),
          status = COALESCE(${newStatus}, status),
          pharmacy_status = COALESCE(${newPharmStatus}, pharmacy_status),
          updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ${targetId};
      `;

      const updated = await sql`SELECT * FROM patients WHERE patient_id = ${targetId};`;
      if (updated.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      return res.status(200).json(formatPatientRow(updated[0]));
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('API /api/patients error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Maps snake_case SQL columns to camelCase expected by Frontend
function formatPatientRow(row) {
  if (!row) return null;
  return {
    patientId: row.patient_id,
    tokenNo: row.token_no,
    name: row.name,
    phone: row.phone,
    age: row.age,
    gender: row.gender,
    address: row.address,
    registeredAt: row.registered_at,
    assignedDoctorId: row.assigned_doctor_id,
    reason: row.reason || '',
    isEmergency: row.is_emergency,
    criticalAlerts: typeof row.critical_alerts === 'string' ? JSON.parse(row.critical_alerts) : (row.critical_alerts || []),
    status: row.status,
    externalRvgId: row.external_rvg_id || '',
    pharmacyStatus: row.pharmacy_status || 'None',
    pharmacyDispensedAt: row.pharmacy_dispensed_at || '',
    pharmacyDispensedBy: row.pharmacy_dispensed_by || '',
    dentalLab: typeof row.dental_lab === 'string' ? JSON.parse(row.dental_lab) : (row.dental_lab || { status: 'No Lab Work' }),
    clinicalNotes: typeof row.clinical_notes === 'string' ? JSON.parse(row.clinical_notes) : row.clinical_notes,
    prescription: typeof row.prescription === 'string' ? JSON.parse(row.prescription) : row.prescription,
    billing: typeof row.billing === 'string' ? JSON.parse(row.billing) : row.billing
  };
}
