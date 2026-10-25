// Healthcheck & Neon DB Status Endpoint
import { getSql, ensureSchemaInitialized, getDatabaseUrl } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return res.status(200).json({
      status: 'offline_mode',
      message: 'DATABASE_URL not configured. The clinic app is running in resilient local cache mode.',
      neonConnected: false,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const sql = getSql();
    await ensureSchemaInitialized(sql);

    const start = Date.now();
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name;`;
    const latencyMs = Date.now() - start;

    const patientsCount = await sql`SELECT count(*)::int as count FROM patients;`;
    const expensesCount = await sql`SELECT count(*)::int as count FROM petty_expenses;`;

    return res.status(200).json({
      status: 'healthy',
      neonConnected: true,
      database: result[0].db_name,
      serverTime: result[0].current_time,
      latencyMs,
      tableCounts: {
        patients: patientsCount[0].count,
        pettyExpenses: expensesCount[0].count
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Neon healthcheck failed:', err);
    return res.status(500).json({
      status: 'error',
      neonConnected: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
