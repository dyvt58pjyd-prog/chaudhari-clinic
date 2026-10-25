// Billing API - Records Cash and Amount-Based UPI Payments in Neon DB
import { getSql, ensureSchemaInitialized } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: 'Neon DATABASE_URL is not configured.' });
  }

  await ensureSchemaInitialized(sql);

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      patientId,
      paymentMethod,
      paymentMode,
      paidToday = null,
      paidAmount = null,
      cashTendered = 0,
      cashChange = 0,
      upiTxnRef = '',
      upiRef = '',
      billedBy = 'Reception Staff Desk'
    } = body;

    const method = paymentMethod || paymentMode;
    const payment = paidToday !== null ? paidToday : paidAmount;

    if (!patientId || !method) {
      return res.status(400).json({ error: 'patientId and paymentMethod are required.' });
    }

    const rows = await sql`SELECT * FROM patients WHERE patient_id = ${patientId};`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = rows[0];
    const existingBilling = typeof patient.billing === 'string' ? JSON.parse(patient.billing) : (patient.billing || {});

    const total = existingBilling.totalAmount || 400;
    const amountPaid = payment !== null ? parseFloat(payment) : total;
    const pending = Math.max(0, total - amountPaid);

    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-GB') +
      ' ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedBilling = {
      ...existingBilling,
      paymentMethod: method,
      paidAmount: amountPaid,
      pendingBalance: pending,
      status: pending === 0 ? 'Paid' : 'Partial',
      paymentStatus: pending === 0 ? 'Paid' : 'Partial',
      billedAt: formattedDate,
      billedBy,
      cashTendered,
      cashChange,
      upiTxnRef: upiTxnRef || upiRef || (method === 'UPI' ? `UPI-${Date.now().toString().slice(-8)}` : '')
    };

    await sql`
      UPDATE patients SET
        billing = ${JSON.stringify(updatedBilling)},
        status = 'Billing Completed',
        updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ${patientId};
    `;

    return res.status(200).json({
      success: true,
      patientId,
      billing: updatedBilling,
      status: 'Billing Completed'
    });
  } catch (err) {
    console.error('API /api/billing error:', err);
    return res.status(500).json({ error: err.message });
  }
}
