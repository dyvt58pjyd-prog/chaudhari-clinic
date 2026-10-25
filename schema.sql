-- =========================================================================
-- Chaudhari Skin & Dental Care Multispeciality Clinic & Medicare Pharmacy
-- Khamgaon, Buldhana - 444303 | Helpline: +91 90498 83983
-- Neon Serverless PostgreSQL Database Schema
-- =========================================================================

-- 1. Hospital Configuration Table
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

-- Seed Initial Config if empty
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

-- 2. Patients & Clinical EMR Master Table
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

CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(assigned_doctor_id);

-- 3. Petty Cash Expenses Table
CREATE TABLE IF NOT EXISTS petty_expenses (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  note TEXT DEFAULT '',
  expense_date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial petty expense
INSERT INTO petty_expenses (id, category, amount, note, expense_date)
VALUES (
  'exp-1',
  'Clinic Sanitization & Autoclave Pouches',
  350.00,
  'Autoclave pouches & surface disinfectant',
  '2026-10-25'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Seed Patients
INSERT INTO patients (
  patient_id, token_no, name, phone, age, gender, address, 
  registered_at, assigned_doctor_id, reason, is_emergency, 
  critical_alerts, status, external_rvg_id, pharmacy_status, 
  clinical_notes, prescription, billing
)
VALUES 
(
  'CSD-P1001',
  '01',
  'Rameshwar Pandurang Patil',
  '9822456789',
  46,
  'Male',
  'Farshi Road, Khamgaon',
  '2026-10-25 09:30 AM',
  'dr-priyanka',
  'Severe throbbing pain in lower right jaw #46 while chewing',
  false,
  '["Hypertension"]'::jsonb,
  'Waiting for Doctor',
  'RVG-388',
  'None',
  NULL,
  NULL,
  NULL
),
(
  'CSD-P1002',
  '02',
  'Pooja Santosh Wankhede',
  '9423589012',
  24,
  'Female',
  'Farshi Road, Khamgaon',
  '2026-10-25 10:00 AM',
  'dr-rajnikant',
  'Acne breakouts, hyperpigmentation and facial dark spots',
  false,
  '[]'::jsonb,
  'Prescription Ready',
  '',
  'Pending',
  '{
    "chiefComplaints": "Persistent severe papulopustular acne with dark post-inflammatory spots for 6 months",
    "examination": "Multiple inflammatory erythematous papules, open & closed comedones over cheeks and chin. Grade III severity.",
    "diagnosis": "Acne Vulgaris (Grade III) with Post-Inflammatory Hyperpigmentation (PIH)",
    "treatmentDone": "Comedone extraction + Salicylic-Mandelic chemical peel trial on active lesions.",
    "doctorName": "Dr. Rajnikant Arvind Chaudhari"
  }'::jsonb,
  '{
    "prescribedAt": "2026-10-25 10:55 AM",
    "doctorName": "Dr. Rajnikant Arvind Chaudhari",
    "medicines": [
      { "name": "Adapalene 0.1% + Clindamycin 1% Gel (Deriva-CMS)", "type": "Gel", "frequency": "0-0-1 (Bedtime)", "duration": "30 Days", "instructions": "Apply pea-sized amount over lesions at night" },
      { "name": "Doxycycline 100mg (Doxy-1 L-DR)", "type": "Capsule", "frequency": "1-0-0 (After Food)", "duration": "15 Days", "instructions": "Take with full glass of water, do not lie down immediately" },
      { "name": "Cetaphil / Sebamed Gentle Skin Cleanser", "type": "Liquid", "frequency": "1-0-1 (Morning-Night)", "duration": "Daily", "instructions": "Wash face gently twice daily with lukewarm water" },
      { "name": "Silicone Matte Sunscreen Gel SPF 50+ PA+++", "type": "Gel", "frequency": "Every 4 Hours", "duration": "Daily", "instructions": "Apply 20 mins before sun exposure" }
    ],
    "specialAdvice": "Do not pick or squeeze acne lesions. Drink 3 liters of water daily. Avoid excess oily and dairy food.",
    "followUpDate": "2026-11-10"
  }'::jsonb,
  '{
    "invoiceId": "CSD-INV-1002",
    "billedAt": "",
    "consultationFee": 400,
    "procedureFee": 800,
    "medicineFee": 650,
    "totalAmount": 1850,
    "paidAmount": 0,
    "pendingBalance": 1850,
    "paymentMethod": "",
    "paymentStatus": "Pending",
    "upiTxnRef": "",
    "cashTendered": 0,
    "cashChange": 0,
    "billedBy": ""
  }'::jsonb
),
(
  'CSD-P1003',
  '03',
  'Master Aarav Sachin Kulkarni',
  '9890123456',
  7,
  'Male',
  'Shivalay Vihar, Khamgaon',
  '2026-10-25 10:30 AM',
  'dr-rutika',
  'Severe sharp toothache in lower milk molar while eating chocolates',
  true,
  '["Drug Allergy"]'::jsonb,
  'Waiting for Doctor',
  '',
  'None',
  NULL,
  NULL,
  NULL
)
ON CONFLICT (patient_id) DO NOTHING;
