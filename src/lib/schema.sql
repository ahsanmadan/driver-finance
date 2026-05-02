-- ============================================================
-- DriverFinance — Supabase SQL Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- 1. Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  gross_income BIGINT NOT NULL DEFAULT 0,
  fuel_expense BIGINT NOT NULL DEFAULT 0,
  food_expense BIGINT NOT NULL DEFAULT 0,
  net_income BIGINT GENERATED ALWAYS AS (gross_income - fuel_expense - food_expense) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount BIGINT NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Seed: Pre-create the three default wallets
-- ============================================================
INSERT INTO wallets (name, balance) VALUES
  ('Uang Cash', 0),
  ('BCA',       0),
  ('ShopeePay', 0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Row Level Security (optional, for single-user without auth)
-- Disable RLS so the app can read/write without JWT
-- ============================================================
ALTER TABLE wallets     DISABLE ROW LEVEL SECURITY;
ALTER TABLE shifts      DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
