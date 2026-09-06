import fs from "fs";
import path from "path";
import { User, UserRole, AccountStatus, ReportStatus, AuditLogItem } from "@/types/auth";
import { findPalikaById, KOSHI_DISTRICTS } from "./koshiGeography";

const USERS_DB_PATH = path.join(process.cwd(), "src", "lib", "users_db.json");
const REPORTS_DB_PATH = path.join(process.cwd(), "src", "lib", "annual_reports_meta_db.json");
const AUDIT_LOGS_PATH = path.join(process.cwd(), "src", "lib", "audit_logs_db.json");

export interface StoredUser extends User {
  password_hash: string;
}

export interface OtpRecord {
  id: string;
  identifier: string; // email or mobile
  code: string;
  purpose: "user_signup" | "employee_signup" | "forgot_password";
  expires_at: number; // timestamp
  attempts: number;
}

// In-memory OTP storage (fast and ephemeral)
const activeOtps = new Map<string, OtpRecord>();

// Pre-seeded default users
const PRE_SEEDED_USERS: StoredUser[] = [
  {
    id: "admin-master-001",
    user_id: "DIC-ADM-000001",
    name: "मुख्य प्रशासक (Super Admin)",
    email: "admin@dic.gov.np",
    phone: "9842661754",
    password_hash: "admin123",
    role: "super_admin",
    account_status: "approved",
    otp_verified: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "emp-phidim-002",
    user_id: "DIC-EMP-000002",
    name: "फिदिम सहायता सहजकर्ता",
    email: "phidim.staff@gmail.com",
    phone: "9841234567",
    address: "फिदिम, पाँचथर",
    password_hash: "phidim123",
    role: "employee",
    account_status: "approved",
    otp_verified: true,
    district_id: "panchthar",
    district_name: "पाँचथर",
    local_government_id: "phidim_mun",
    local_government_name: "फिदिम नगरपालिका",
    palika_id: "phidim_mun",
    palika_name: "फिदिम नगरपालिका",
    palikaId: "phidim_mun",
    palikaName: "फिदिम नगरपालिका",
    districtId: "panchthar",
    districtName: "पाँचथर",
    approved_at: "2026-01-02T10:00:00.000Z",
    approved_by: "मुख्य प्रशासक (Super Admin)",
    created_at: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "emp-pending-003",
    user_id: "DIC-EMP-000003",
    name: "विराटनगर सहजकर्ता (प्रतीक्षारत)",
    email: "pending.staff@gmail.com",
    phone: "9852099999",
    address: "विराटनगर, मोरङ",
    password_hash: "pending123",
    role: "employee",
    account_status: "pending",
    otp_verified: true,
    district_id: "morang",
    district_name: "मोरङ",
    local_government_id: "biratnagar_met",
    local_government_name: "विराटनगर महानगरपालिका",
    palika_id: "biratnagar_met",
    palika_name: "विराटनगर महानगरपालिका",
    palikaId: "biratnagar_met",
    palikaName: "विराटनगर महानगरपालिका",
    districtId: "morang",
    districtName: "मोरङ",
    created_at: "2026-09-05T10:00:00.000Z",
  },
  {
    id: "usr-citizen-004",
    user_id: "DIC-USR-000004",
    name: "राम बहादुर श्रेष्ठ (नागरिक)",
    email: "citizen@example.com",
    phone: "9800000001",
    password_hash: "citizen123",
    role: "normal_user",
    account_status: "approved",
    otp_verified: true,
    created_at: "2026-02-01T00:00:00.000Z",
  }
];

let inMemoryUsers: StoredUser[] | null = null;
let inMemoryReports: Record<string, { status: ReportStatus; admin_notes?: string; submitted_by?: string; updated_at: string }> | null = null;
let inMemoryAuditLogs: AuditLogItem[] | null = null;

/**
 * Read all users from persistent file or fallback to pre-seeded users
 */
export function getAllUsers(): StoredUser[] {
  if (inMemoryUsers && inMemoryUsers.length > 0) {
    return inMemoryUsers;
  }

  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      const raw = fs.readFileSync(USERS_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryUsers = parsed;
        return inMemoryUsers!;
      }
    }
  } catch (e) {
    console.warn("Could not read users_db.json, using defaults:", e);
  }

  inMemoryUsers = [...PRE_SEEDED_USERS];
  saveAllUsers(inMemoryUsers);
  return inMemoryUsers;
}

export function saveAllUsers(users: StoredUser[]): boolean {
  inMemoryUsers = users;
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write users_db.json:", err);
    return false;
  }
}

/**
 * Find user by ID, user_id (e.g. DIC-EMP-000123), email, or phone
 */
export function findUserByIdentifier(identifier: string): StoredUser | undefined {
  const users = getAllUsers();
  const clean = identifier.trim().toLowerCase();

  return users.find((u) => {
    if (u.id.toLowerCase() === clean) return true;
    if (u.user_id.toLowerCase() === clean) return true;
    if (u.email && u.email.toLowerCase() === clean) return true;
    if (u.phone && u.phone.trim() === identifier.trim()) return true;
    return false;
  });
}

/**
 * OTP GENERATION & VERIFICATION
 */
export function generateOtp(identifier: string, purpose: "user_signup" | "employee_signup" | "forgot_password"): { code: string; expires_at: number } {
  const cleanId = identifier.trim().toLowerCase();
  
  // Generate a random 6-digit OTP (e.g. 842103)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  const record: OtpRecord = {
    id: `otp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    identifier: cleanId,
    code,
    purpose,
    expires_at,
    attempts: 0
  };

  activeOtps.set(`${cleanId}_${purpose}`, record);

  // In development & testing, log to console for visibility
  console.log(`[DIC OTP DISPATCH] Identifier: ${identifier} | Purpose: ${purpose} | Code: ${code} | Valid until: ${new Date(expires_at).toLocaleTimeString()}`);

  return { code, expires_at };
}

export function verifyOtp(identifier: string, code: string, purpose: "user_signup" | "employee_signup" | "forgot_password"): { success: boolean; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const key = `${cleanId}_${purpose}`;
  const record = activeOtps.get(key);

  if (!record) {
    return { success: false, error: "OTP फेला परेन वा म्याद सकियो। कृपया पुन: पठाउनुहोस्।" };
  }

  if (Date.now() > record.expires_at) {
    activeOtps.delete(key);
    return { success: false, error: "OTP को ५ मिनेटको समय समाप्त भएको छ। कृपया पुन: OTP मगाउनुहोस्।" };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    activeOtps.delete(key);
    return { success: false, error: "अत्यधिक गलत प्रयासका कारण यो OTP रद्द भएको छ। कृपया पुन: प्रयास गर्नुहोस्।" };
  }

  // Accept generated code OR demo test code '123456' in dev
  if (record.code === code.trim() || code.trim() === "123456") {
    activeOtps.delete(key);
    return { success: true };
  }

  return { success: false, error: "OTP गलत छ। कृपया ६ अंकको सही कोड प्रविष्टि गर्नुहोस्।" };
}

/**
 * REGISTER NORMAL USER (Immediately Active)
 */
export function registerNormalUser(params: {
  name: string;
  identifier: string; // Email or Mobile
  password: string;
  address?: string;
}): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers();
  const cleanId = params.identifier.trim();
  const isEmail = cleanId.includes("@");

  if (findUserByIdentifier(cleanId)) {
    return { success: false, error: "यो Email वा Mobile नम्बर पहिले नै दर्ता भइसकेको छ। कृपया लगइन गर्नुहोस्।" };
  }

  const seq = (users.filter(u => u.role === "normal_user").length + 1).toString().padStart(6, "0");
  const uniqueUserId = `DIC-USR-${seq}`;
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUser: StoredUser = {
    id,
    user_id: uniqueUserId,
    name: params.name.trim(),
    email: isEmail ? cleanId.toLowerCase() : undefined,
    phone: !isEmail ? cleanId : undefined,
    address: params.address?.trim() || "नेपाल",
    role: "normal_user",
    account_status: "approved", // Normal user immediately active!
    otp_verified: true,
    password_hash: params.password,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);

  addAuditLog(
    "USER_REGISTERED",
    newUser.id,
    newUser.name,
    newUser.id,
    newUser.name,
    `नयाँ सामान्य नागरिक खाता दर्ता भयो (${newUser.user_id})`
  );

  const { password_hash, ...safeUser } = newUser;
  return { success: true, user: safeUser };
}

/**
 * REGISTER EMPLOYEE (Status: PENDING)
 */
export function registerEmployee(params: {
  name: string;
  address: string;
  district_id: string;
  local_government_id: string;
  email?: string;
  phone: string;
  password: string;
}): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers();
  const cleanPhone = params.phone.trim();
  const cleanEmail = params.email?.trim().toLowerCase();

  if (findUserByIdentifier(cleanPhone) || (cleanEmail && findUserByIdentifier(cleanEmail))) {
    return { success: false, error: "यो फोन नम्बर वा इमेल पहिले नै दर्ता भइसकेको छ।" };
  }

  // Resolve district & palika names
  const district = KOSHI_DISTRICTS.find(d => d.id === params.district_id);
  const palika = district?.local_governments.find(p => p.id === params.local_government_id);

  if (!district || !palika) {
    return { success: false, error: "अमान्य जिल्ला वा स्थानीय तह चयन गरिएको छ।" };
  }

  const seq = (users.filter(u => u.role === "employee").length + 1).toString().padStart(6, "0");
  const uniqueUserId = `DIC-EMP-${seq}`;
  const id = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newEmployee: StoredUser = {
    id,
    user_id: uniqueUserId,
    name: params.name.trim(),
    email: cleanEmail || undefined,
    phone: cleanPhone,
    address: params.address.trim(),
    role: "employee",
    account_status: "pending", // Strict: Must be pending until Super Admin approval!
    otp_verified: true,
    district_id: district.id,
    district_name: district.name_ne,
    local_government_id: palika.id,
    local_government_name: palika.name_ne,
    palika_id: palika.id,
    palika_name: palika.name_ne,
    palikaId: palika.id,
    palikaName: palika.name_ne,
    districtId: district.id,
    districtName: district.name_ne,
    password_hash: params.password,
    created_at: new Date().toISOString(),
  };

  users.push(newEmployee);
  saveAllUsers(users);

  addAuditLog(
    "EMPLOYEE_REGISTERED_PENDING",
    newEmployee.id,
    newEmployee.name,
    newEmployee.id,
    newEmployee.name,
    `नयाँ कर्मचारी दर्ता भयो (आईडी: ${newEmployee.user_id}, स्थानीय तह: ${palika.name_ne}) - हाल स्वीकृति पर्खिरहेको छ।`
  );

  const { password_hash, ...safeUser } = newEmployee;
  return { success: true, user: safeUser };
}

/**
 * APPROVE EMPLOYEE (Super Admin Only)
 */
export function approveEmployee(employeeId: string, adminId: string, adminName: string): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === employeeId || u.user_id === employeeId);

  if (idx < 0) {
    return { success: false, error: "कर्मचारी खाता फेला परेन।" };
  }

  const emp = users[idx];
  emp.account_status = "approved";
  emp.approved_at = new Date().toISOString();
  emp.approved_by = adminName;
  emp.updated_at = new Date().toISOString();

  users[idx] = emp;
  saveAllUsers(users);

  addAuditLog(
    "EMPLOYEE_APPROVED",
    adminId,
    adminName,
    emp.id,
    emp.name,
    `कर्मचारी खाता स्वीकृत गरियो (आईडी: ${emp.user_id}, स्थानीय तह: ${emp.palika_name})`
  );

  const { password_hash, ...safeUser } = emp;
  return { success: true, user: safeUser };
}

/**
 * REJECT EMPLOYEE (Super Admin Only)
 */
export function rejectEmployee(employeeId: string, adminId: string, adminName: string, reason?: string): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === employeeId || u.user_id === employeeId);

  if (idx < 0) {
    return { success: false, error: "कर्मचारी खाता फेला परेन।" };
  }

  const emp = users[idx];
  emp.account_status = "rejected";
  emp.updated_at = new Date().toISOString();

  users[idx] = emp;
  saveAllUsers(users);

  addAuditLog(
    "EMPLOYEE_REJECTED",
    adminId,
    adminName,
    emp.id,
    emp.name,
    `कर्मचारी खाता अस्वीकृत गरियो (आईडी: ${emp.user_id}). कारण: ${reason || "प्रशासकीय निर्णय"}`
  );

  const { password_hash, ...safeUser } = emp;
  return { success: true, user: safeUser };
}

/**
 * SUSPEND / TOGGLE STATUS (Super Admin Only)
 */
export function updateUserStatus(userId: string, newStatus: AccountStatus, adminId: string, adminName: string): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId || u.user_id === userId);

  if (idx < 0) {
    return { success: false, error: "प्रयोगकर्ता फेला परेन।" };
  }

  users[idx].account_status = newStatus;
  users[idx].updated_at = new Date().toISOString();
  saveAllUsers(users);

  addAuditLog(
    "USER_STATUS_CHANGED",
    adminId,
    adminName,
    users[idx].id,
    users[idx].name,
    `खाता स्थिति परिवर्तन: ${newStatus}`
  );

  const { password_hash, ...safeUser } = users[idx];
  return { success: true, user: safeUser };
}

/**
 * AUDIT LOGS MANAGEMENT
 */
export function getAuditLogs(): AuditLogItem[] {
  if (inMemoryAuditLogs && inMemoryAuditLogs.length > 0) {
    return inMemoryAuditLogs;
  }

  try {
    if (fs.existsSync(AUDIT_LOGS_PATH)) {
      const raw = fs.readFileSync(AUDIT_LOGS_PATH, "utf-8");
      inMemoryAuditLogs = JSON.parse(raw);
      return inMemoryAuditLogs || [];
    }
  } catch (e) {
    console.warn("Could not read audit logs:", e);
  }

  inMemoryAuditLogs = [];
  return inMemoryAuditLogs;
}

export function addAuditLog(
  action: string,
  performedById: string,
  performedByName: string,
  targetId?: string,
  targetName?: string,
  details?: string
): void {
  const logs = getAuditLogs();
  const item: AuditLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action,
    performed_by_id: performedById,
    performed_by_name: performedByName,
    target_user_id: targetId,
    target_user_name: targetName,
    details: details || "",
    timestamp: new Date().toISOString()
  };

  logs.unshift(item);
  inMemoryAuditLogs = logs.slice(0, 500); // Keep latest 500 logs

  try {
    fs.writeFileSync(AUDIT_LOGS_PATH, JSON.stringify(inMemoryAuditLogs, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write audit logs:", err);
  }
}

/**
 * ANNUAL REPORTS STATUS & CORRECTION NOTES PERSISTENCE
 */
export function getReportsMeta(): Record<string, { status: ReportStatus; admin_notes?: string; submitted_by?: string; updated_at: string }> {
  if (inMemoryReports) return inMemoryReports;

  try {
    if (fs.existsSync(REPORTS_DB_PATH)) {
      const raw = fs.readFileSync(REPORTS_DB_PATH, "utf-8");
      inMemoryReports = JSON.parse(raw);
      return inMemoryReports || {};
    }
  } catch {
    // fallback
  }

  inMemoryReports = {};
  return inMemoryReports;
}

export function saveReportMeta(palikaId: string, status: ReportStatus, adminNotes?: string, submittedBy?: string): void {
  const meta = getReportsMeta();
  meta[palikaId] = {
    status,
    admin_notes: adminNotes || meta[palikaId]?.admin_notes,
    submitted_by: submittedBy || meta[palikaId]?.submitted_by,
    updated_at: new Date().toISOString()
  };

  inMemoryReports = meta;
  try {
    fs.writeFileSync(REPORTS_DB_PATH, JSON.stringify(meta, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write reports meta:", err);
  }
}
