// Petty Cash Expenses API for Neon DB
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
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM petty_expenses
        ORDER BY created_at DESC;
      `;
      const formatted = rows.map(r => ({
        id: r.id,
        category: r.category,
        amount: parseFloat(r.amount),
        note: r.note || '',
        date: r.expense_date
      }));
      return res.status(200).json(formatted);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { category, amount, note = '' } = body;

      if (!category || !amount) {
        return res.status(400).json({ error: 'Category and amount are required.' });
      }

      const id = `exp-${Date.now()}`;
      const expenseDate = new Date().toLocaleDateString('en-GB');

      await sql`
        INSERT INTO petty_expenses (id, category, amount, note, expense_date)
        VALUES (${id}, ${category.trim()}, ${parseFloat(amount)}, ${note.trim()}, ${expenseDate});
      `;

      return res.status(201).json({
        id,
        category,
        amount: parseFloat(amount),
        note,
        date: expenseDate
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/expenses error:', err);
    return res.status(500).json({ error: err.message });
  }
}
