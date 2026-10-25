// Medicare Pharmacy API - Dispensing Queue & Verification in Neon DB
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
    // 1. GET: Prescriptions queue
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM patients
        WHERE prescription IS NOT NULL
        ORDER BY updated_at DESC;
      `;

      const formatted = rows.map(r => ({
        patientId: r.patient_id,
        tokenNo: r.token_no,
        name: r.name,
        phone: r.phone,
        age: r.age,
        gender: r.gender,
        criticalAlerts: typeof r.critical_alerts === 'string' ? JSON.parse(r.critical_alerts) : (r.critical_alerts || []),
        status: r.status,
        pharmacyStatus: r.pharmacy_status || 'None',
        pharmacyDispensedAt: r.pharmacy_dispensed_at || '',
        pharmacyDispensedBy: r.pharmacy_dispensed_by || '',
        clinicalNotes: typeof r.clinical_notes === 'string' ? JSON.parse(r.clinical_notes) : r.clinical_notes,
        prescription: typeof r.prescription === 'string' ? JSON.parse(r.prescription) : r.prescription
      }));

      return res.status(200).json(formatted);
    }

    // 2. POST: Mark prescription dispensed
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { patientId, pharmacistName = 'Medicare Pharmacy Desk' } = body;

      if (!patientId) {
        return res.status(400).json({ error: 'patientId is required.' });
      }

      const dispensedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await sql`
        UPDATE patients SET
          pharmacy_status = 'Dispensed',
          pharmacy_dispensed_at = ${dispensedTime},
          pharmacy_dispensed_by = ${pharmacistName},
          updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ${patientId};
      `;

      return res.status(200).json({
        success: true,
        patientId,
        pharmacyStatus: 'Dispensed',
        dispensedAt: dispensedTime,
        dispensedBy: pharmacistName
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/pharmacy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
