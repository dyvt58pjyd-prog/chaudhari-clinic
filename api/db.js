// Neon Database Connection & Auto-Migration Helper for Vercel Serverless
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

let isSchemaInitialized = false;

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getSql() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return null;
  }
  return neon(dbUrl);
}

export async function ensureSchemaInitialized(sql) {
  if (isSchemaInitialized || !sql) return;

  try {
    // 1. Hospital Config Table
    await sql`
      CREATE TABLE IF NOT EXISTS hospital_config (
        id INT PRIMARY KEY DEFAULT 1,
        hospital_name VARCHAR(255) NOT NULL DEFAULT 'Chaudhari Skin & Dental Care Multispeciality Clinic & Medicare Pharmacy',
        hospital_name_marathi VARCHAR(255) NOT NULL DEFAULT 'चौधरी स्किन व डेंटल केअर मल्टीस्पेशालिटी क्लिनिक व मेडिकेअर फार्मसी',
        address TEXT NOT NULL DEFAULT 'Shriram Chowk, Farshi Road, Near Dr. Chande Clinic, Shivalay Vihar, Khamgaon, Buldhana – 444303',
        phone VARCHAR(50) NOT NULL DEFAULT '+91 90498 83983',
        upi_id VARCHAR(100) NOT NULL DEFAULT '9049883983@ybl',
        upi_payee_name VARCHAR(255) NOT NULL DEFAULT 'Chaudhari Clinic Khamgaon',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      INSERT INTO hospital_config (id, hospital_name, hospital_name_marathi, address, phone, upi_id, upi_payee_name)
      VALUES (
        1,
        'Chaudhari Skin & Dental Care Multispeciality Clinic & Medicare Pharmacy',
        'चौधरी स्किन व डेंटल केअर मल्टीस्पेशालिटी क्लिनिक व मेडिकेअर फार्मसी',
        'Shriram Chowk, Farshi Road, Near Dr. Chande Clinic, Shivalay Vihar, Khamgaon, Buldhana – 444303',
        '+91 90498 83983',
        '9049883983@ybl',
        'Chaudhari Clinic Khamgaon'
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Patients Table
    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        patient_id VARCHAR(50) PRIMARY KEY,
        token_no VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        age INT NOT NULL,
        gender VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        registered_at VARCHAR(100) NOT NULL,
        assigned_doctor_id VARCHAR(50) NOT NULL,
        reason TEXT DEFAULT '',
        is_emergency BOOLEAN DEFAULT FALSE,
        critical_alerts JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(100) NOT NULL DEFAULT 'Waiting for Doctor',
        external_rvg_id VARCHAR(100) DEFAULT '',
        pharmacy_status VARCHAR(50) DEFAULT 'None',
        pharmacy_dispensed_at VARCHAR(50) DEFAULT '',
        pharmacy_dispensed_by VARCHAR(100) DEFAULT '',
        dental_lab JSONB DEFAULT '{"status": "No Lab Work", "labName": "", "notes": ""}'::jsonb,
        clinical_notes JSONB DEFAULT NULL,
        prescription JSONB DEFAULT NULL,
        billing JSONB DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Petty Expenses Table
    await sql`
      CREATE TABLE IF NOT EXISTS petty_expenses (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        note TEXT DEFAULT '',
        expense_date VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    isSchemaInitialized = true;
  } catch (err) {
    console.error('Failed to auto-initialize Neon database schema:', err);
  }
}
