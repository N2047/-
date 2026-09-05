export type UserRole = 'provincial_admin' | 'palika_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  palika_id?: string;
  palika_name?: string;
  district_name?: string;
  palikaId?: string;
  palikaName?: string;
  districtId?: string;
  districtName?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
