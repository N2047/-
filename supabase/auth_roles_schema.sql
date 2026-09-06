-- ==============================================================================
-- अपाङ्गता सूचना केन्द्र (DIC) — Authentication, Roles & Employee Approval Schema
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. DIC-EMP-000123, DIC-USR-000456
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Role & Status
  role VARCHAR(50) NOT NULL DEFAULT 'normal_user', -- 'normal_user', 'employee', 'super_admin'
  account_status VARCHAR(50) NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected', 'suspended', 'blocked'
  otp_verified BOOLEAN NOT NULL DEFAULT false,

  -- Employee Details & Assigned Geography
  designation VARCHAR(150),
  organization VARCHAR(255),
  ward_number VARCHAR(10),
  province VARCHAR(100) DEFAULT 'कोशी प्रदेश',
  district_id VARCHAR(100),
  local_government_id VARCHAR(100),
  
  -- Administrative Approval & Block Metadata
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(255),
  blocked_at TIMESTAMPTZ,
  blocked_by VARCHAR(255),
  block_reason TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_local_gov ON profiles(local_government_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- 2. OTP CODES TABLE
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- email or mobile
  code VARCHAR(10) NOT NULL,
  purpose VARCHAR(50) NOT NULL, -- 'user_signup', 'employee_signup', 'password_reset'
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_identifier ON otp_codes(identifier);

-- 3. ANNUAL REPORTS TABLE (With Status & Correction Notes)
CREATE TABLE IF NOT EXISTS annual_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_government_id VARCHAR(100) NOT NULL,
  district_id VARCHAR(100) NOT NULL,
  fiscal_year VARCHAR(50) NOT NULL DEFAULT '२०८२/०८३',
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'under_review', 'approved', 'returned_for_correction'
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  admin_correction_notes TEXT,
  submitted_by VARCHAR(255),
  submitted_by_id VARCHAR(100),
  submitted_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(local_government_id, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_annual_reports_local_gov ON annual_reports(local_government_id);
CREATE INDEX IF NOT EXISTS idx_annual_reports_status ON annual_reports(status);

-- 4. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  performed_by_id VARCHAR(100) NOT NULL,
  performed_by_name VARCHAR(255) NOT NULL,
  target_id VARCHAR(100),
  target_name VARCHAR(255),
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Super Admin can do everything
CREATE POLICY "Super admin has full access on profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

-- Users can update their own non-role fields
CREATE POLICY "Users can update own basic profile"
  ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid()
  );

-- Annual Reports Policies
-- Super Admin can manage all reports
CREATE POLICY "Super admin full access on annual reports"
  ON annual_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Approved Employee can view/edit ONLY their own local government's report
CREATE POLICY "Approved employee can access assigned palika report"
  ON annual_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.role = 'employee'
        AND p.account_status = 'approved'
        AND p.local_government_id = annual_reports.local_government_id
    )
  );

-- Normal users can only read published/approved statistical summaries
CREATE POLICY "Public can view approved reports"
  ON annual_reports FOR SELECT
  USING (status = 'approved');
