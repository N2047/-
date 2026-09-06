export type UserRole = 'normal_user' | 'employee' | 'super_admin' | 'provincial_admin' | 'palika_staff';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type ReportStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'returned_for_correction';

export interface User {
  id: string;
  user_id: string; // Unique human-readable code: DIC-EMP-000123 or DIC-USR-000456
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  account_status: AccountStatus;
  otp_verified: boolean;
  
  // Location mapping (strictly for employees)
  district_id?: string;
  district_name?: string;
  local_government_id?: string;
  local_government_name?: string;
  
  // Backward-compatibility aliases
  palika_id?: string;
  palika_name?: string;
  palikaId?: string;
  palikaName?: string;
  districtId?: string;
  districtName?: string;

  // Metadata
  created_at: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
  last_login_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuditLogItem {
  id: string;
  action: string;
  performed_by_id: string;
  performed_by_name: string;
  target_user_id?: string;
  target_user_name?: string;
  details: string;
  timestamp: string;
}
