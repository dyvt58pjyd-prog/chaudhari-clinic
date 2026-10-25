// Full Sync & Database Backup/Restore API for Neon DB
import { getSql, ensureSchemaInitialized } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: 'Neon DATABASE_URL is not configured.' });
  }

  await ensureSchemaInitialized(sql);

  try {
    // 1. GET: Export full database snapshot from Neon
    if (req.method === 'GET') {
      const configRows = await sql`SELECT * FROM hospital_config WHERE id = 1 LIMIT 1;`;
      const patientRows = await sql`SELECT * FROM patients ORDER BY is_emergency DESC, created_at DESC;`;
      const expenseRows = await sql`SELECT * FROM petty_expenses ORDER BY created_at DESC;`;

      const config = configRows[0] ? {
        hospitalName: configRows[0].hospital_name,
        hospitalNameMarathi: configRows[0].hospital_name_marathi,
        address: configRows[0].address,
        phone: configRows[0].phone,
        upiId: configRows[0].upi_id,
        upiPayeeName: configRows[0].upi_payee_name
      } : {};

      const patients = patientRows.map(r => ({
        patientId: r.patient_id,
        tokenNo: r.token_no,
        name: r.name,
        phone: r.phone,
        age: r.age,
        gender: r.gender,
        address: r.address,
        registeredAt: r.registered_at,
        assignedDoctorId: r.assigned_doctor_id,
        reason: r.reason || '',
        isEmergency: r.is_emergency,
        criticalAlerts: typeof r.critical_alerts === 'string' ? JSON.parse(r.critical_alerts) : (r.critical_alerts || []),
        status: r.status,
        externalRvgId: r.external_rvg_id || '',
        pharmacyStatus: r.pharmacy_status || 'None',
        pharmacyDispensedAt: r.pharmacy_dispensed_at || '',
        pharmacyDispensedBy: r.pharmacy_dispensed_by || '',
        dentalLab: typeof r.dental_lab === 'string' ? JSON.parse(r.dental_lab) : (r.dental_lab || { status: 'No Lab Work' }),
        clinicalNotes: typeof r.clinical_notes === 'string' ? JSON.parse(r.clinical_notes) : r.clinical_notes,
        prescription: typeof r.prescription === 'string' ? JSON.parse(r.prescription) : r.prescription,
        billing: typeof r.billing === 'string' ? JSON.parse(r.billing) : r.billing
      }));

      const pettyExpenses = expenseRows.map(r => ({
        id: r.id,
        category: r.category,
        amount: parseFloat(r.amount),
        note: r.note || '',
        date: r.expense_date
      }));

      return res.status(200).json({
        config,
        patients,
        pettyExpenses,
        exportedAt: new Date().toISOString(),
        source: 'Neon Serverless PostgreSQL'
      });
    }

    // 2. POST: Bulk restore JSON backup into Neon
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { config, patients = [], pettyExpenses = [] } = body;

      // Update config
      if (config) {
        await sql`
          UPDATE hospital_config SET
            hospital_name = COALESCE(${config.hospitalName || null}, hospital_name),
            hospital_name_marathi = COALESCE(${config.hospitalNameMarathi || null}, hospital_name_marathi),
            address = COALESCE(${config.address || null}, address),
            phone = COALESCE(${config.phone || null}, phone),
            upi_id = COALESCE(${config.upiId || null}, upi_id),
            upi_payee_name = COALESCE(${config.upiPayeeName || null}, upi_payee_name),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = 1;
        `;
      }

      // Upsert patients
      for (const p of patients) {
        await sql`
          INSERT INTO patients (
            patient_id, token_no, name, phone, age, gender, address,
            registered_at, assigned_doctor_id, reason, is_emergency,
            critical_alerts, status, external_rvg_id, pharmacy_status,
            pharmacy_dispensed_at, pharmacy_dispensed_by, dental_lab,
            clinical_notes, prescription, billing
          ) VALUES (
            ${p.patientId},
            ${p.tokenNo || '01'},
            ${p.name},
            ${p.phone},
            ${parseInt(p.age, 10) || 0},
            ${p.gender || 'Other'},
            ${p.address || ''},
            ${p.registeredAt || ''},
            ${p.assignedDoctorId || 'dr-rajnikant'},
            ${p.reason || ''},
            ${!!p.isEmergency},
            ${JSON.stringify(p.criticalAlerts || [])},
            ${p.status || 'Waiting for Doctor'},
            ${p.externalRvgId || ''},
            ${p.pharmacyStatus || 'None'},
            ${p.pharmacyDispensedAt || ''},
            ${p.pharmacyDispensedBy || ''},
            ${JSON.stringify(p.dentalLab || { status: 'No Lab Work' })},
            ${p.clinicalNotes ? JSON.stringify(p.clinicalNotes) : null},
            ${p.prescription ? JSON.stringify(p.prescription) : null},
            ${p.billing ? JSON.stringify(p.billing) : null}
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
            status = EXCLUDED.status,
            external_rvg_id = EXCLUDED.external_rvg_id,
            pharmacy_status = EXCLUDED.pharmacy_status,
            pharmacy_dispensed_at = EXCLUDED.pharmacy_dispensed_at,
            pharmacy_dispensed_by = EXCLUDED.pharmacy_dispensed_by,
            dental_lab = EXCLUDED.dental_lab,
            clinical_notes = EXCLUDED.clinical_notes,
            prescription = EXCLUDED.prescription,
            billing = EXCLUDED.billing,
            updated_at = CURRENT_TIMESTAMP;
        `;
      }

      // Upsert expenses
      for (const e of pettyExpenses) {
        await sql`
          INSERT INTO petty_expenses (id, category, amount, note, expense_date)
          VALUES (${e.id || `exp-${Date.now()}`}, ${e.category}, ${parseFloat(e.amount) || 0}, ${e.note || ''}, ${e.date || ''})
          ON CONFLICT (id) DO UPDATE SET
            category = EXCLUDED.category,
            amount = EXCLUDED.amount,
            note = EXCLUDED.note,
            expense_date = EXCLUDED.expense_date;
        `;
      }

      return res.status(200).json({
        success: true,
        message: 'Neon Database snapshot restored successfully.',
        syncedPatients: patients.length,
        syncedExpenses: pettyExpenses.length
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}
