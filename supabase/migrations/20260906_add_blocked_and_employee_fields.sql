-- ==============================================================================
-- DIC SUPABASE MIGRATION: Add Blocked Account Status and Employee Profile Fields
-- Date: 2026-09-06
-- ==============================================================================

-- 1. Add employee details and block metadata columns to profiles if they don't exist
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS designation VARCHAR(150),
  ADD COLUMN IF NOT EXISTS organization VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ward_number VARCHAR(10),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100) DEFAULT 'कोशी प्रदेश',
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- 2. Create index on account_status and role for quick filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_status_role ON profiles(account_status, role);

-- 3. Update RLS policy to ensure blocked users cannot perform actions even if authenticated
DROP POLICY IF EXISTS "Users can update own basic profile" ON profiles;

CREATE POLICY "Users can update own basic profile"
  ON profiles FOR UPDATE
  USING (
    auth_user_id = auth.uid() 
    AND account_status NOT IN ('blocked', 'suspended')
  )
  WITH CHECK (
    auth_user_id = auth.uid()
    AND account_status NOT IN ('blocked', 'suspended')
  );

-- 4. Notify completion
COMMENT ON TABLE profiles IS 'User and employee profiles with RBAC and administrative block/approval workflows';
