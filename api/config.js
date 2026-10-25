// Hospital Configuration & Official UPI ID API in Neon DB
import { getSql, ensureSchemaInitialized } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
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
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM hospital_config WHERE id = 1 LIMIT 1;
      `;
      if (rows.length === 0) {
        return res.status(200).json({
          hospitalName: 'Chaudhari Skin & Dental Care Multispeciality Clinic & Medicare Pharmacy',
          hospitalNameMarathi: 'चौधरी स्किन व डेंटल केअर मल्टीस्पेशालिटी क्लिनिक व मेडिकेअर फार्मसी',
          address: 'Shriram Chowk, Farshi Road, Near Dr. Chande Clinic, Shivalay Vihar, Khamgaon, Buldhana – 444303',
          phone: '+91 90498 83983',
          upiId: '9049883983@ybl',
          upiPayeeName: 'Chaudhari Clinic Khamgaon'
        });
      }

      const r = rows[0];
      return res.status(200).json({
        hospitalName: r.hospital_name,
        hospitalNameMarathi: r.hospital_name_marathi,
        address: r.address,
        phone: r.phone,
        upiId: r.upi_id,
        upiPayeeName: r.upi_payee_name
      });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const {
        hospitalName,
        hospitalNameMarathi,
        address,
        phone,
        upiId,
        upiPayeeName
      } = body;

      await sql`
        UPDATE hospital_config SET
          hospital_name = COALESCE(${hospitalName || null}, hospital_name),
          hospital_name_marathi = COALESCE(${hospitalNameMarathi || null}, hospital_name_marathi),
          address = COALESCE(${address || null}, address),
          phone = COALESCE(${phone || null}, phone),
          upi_id = COALESCE(${upiId || null}, upi_id),
          upi_payee_name = COALESCE(${upiPayeeName || null}, upi_payee_name),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1;
      `;

      const updated = await sql`SELECT * FROM hospital_config WHERE id = 1;`;
      const r = updated[0];
      return res.status(200).json({
        hospitalName: r.hospital_name,
        hospitalNameMarathi: r.hospital_name_marathi,
        address: r.address,
        phone: r.phone,
        upiId: r.upi_id,
        upiPayeeName: r.upi_payee_name
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/config error:', err);
    return res.status(500).json({ error: err.message });
  }
}
