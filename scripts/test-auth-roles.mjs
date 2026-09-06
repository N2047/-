// scripts/test-auth-roles.mjs
// Automated verification suite for Authentication, User Roles, Employee Approval, and Report Control

const BASE_URL = "http://localhost:3001";

async function runTests() {
  console.log("===============================================================");
  console.log("🚀 DIC AUTHENTICATION & ROLE-BASED ACCESS CONTROL TEST SUITE");
  console.log("===============================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Normal User Registration & Instant Active Login
  // --------------------------------------------------------------------------
  console.log("--- TEST 1: Normal User OTP, Registration, and Instant Login ---");
  const citizenEmail = `citizen.${Date.now()}@test.com`;
  
  // 1a: Send OTP
  const sendOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: citizenEmail, purpose: "user_signup" }),
  });
  const sendOtpData = await sendOtpRes.json();
  assert(sendOtpRes.ok && sendOtpData.success, "Send OTP to normal user succeeded");
  const normalOtp = sendOtpData.preview_code || "123456";

  // 1b: Verify OTP
  const verifyOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: citizenEmail, code: normalOtp, purpose: "user_signup" }),
  });
  const verifyOtpData = await verifyOtpRes.json();
  assert(verifyOtpRes.ok && (verifyOtpData.verified || verifyOtpData.success), "Verify OTP for normal user succeeded");

  // 1c: Register Normal User
  const regUserRes = await fetch(`${BASE_URL}/api/auth/register-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: "नवीन कार्की (नागरिक)",
      identifier: citizenEmail,
      password: "citizenpassword123",
      otp_verified: true,
    }),
  });
  const regUserData = await regUserRes.json();
  assert(regUserRes.ok && regUserData.success, "Normal user registered successfully");
  assert(regUserData.user.role === "normal_user", "User role is normal_user");
  assert(regUserData.user.account_status === "approved", "Normal user is immediately active without admin approval");

  // 1d: Login Normal User
  const loginUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: citizenEmail, password: "citizenpassword123" }),
  });
  const loginUserData = await loginUserRes.json();
  assert(loginUserRes.ok && loginUserData.success, "Normal user can log in immediately");
  assert(loginUserData.user.role === "normal_user", "Session confirms normal_user role");

  console.log("\n--- TEST 2: Employee Signup, OTP, and Pending Approval Status ---");
  const empEmail = `staff.${Date.now()}@palika.gov.np`;
  const empPhone = "98" + Math.floor(10000000 + Math.random() * 90000000);

  // 2a: Send OTP to employee
  const sendEmpOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: empEmail, purpose: "employee_signup" }),
  });
  const sendEmpOtpData = await sendEmpOtpRes.json();
  assert(sendEmpOtpRes.ok && sendEmpOtpData.success, "Send OTP to employee succeeded");
  const empOtp = sendEmpOtpData.preview_code || "123456";

  // 2b: Verify employee OTP
  const verifyEmpOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: empEmail, code: empOtp, purpose: "employee_signup" }),
  });
  const verifyEmpOtpData = await verifyEmpOtpRes.json();
  assert(verifyEmpOtpRes.ok && (verifyEmpOtpData.verified || verifyEmpOtpData.success), "Verify employee OTP succeeded");

  // 2c: Register Employee
  const regEmpRes = await fetch(`${BASE_URL}/api/auth/register-employee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: "सुमन पोखरेल (सहजकर्ता)",
      email: empEmail,
      phone: empPhone,
      address: "फिदिम बजार, पाँचथर",
      district_id: "panchthar",
      local_government_id: "phidim_mun",
      password: "staffpassword123",
      otp_verified: true,
    }),
  });
  const regEmpData = await regEmpRes.json();
  assert(regEmpRes.ok && regEmpData.success, "Employee registered successfully");
  assert(regEmpData.user.role === "employee", "User role is employee");
  assert(regEmpData.user.account_status === "pending", "Employee account status is 'pending'");
  assert(regEmpData.user.local_government_id === "phidim_mun", "Employee permanently linked to phidim_mun");
  const registeredEmpId = regEmpData.user.id;

  // --------------------------------------------------------------------------
  // TEST 3: Pending Employee Login Attempt (Must be blocked 403)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Pending Employee Login Block (Must return 403 with contact info) ---");
  const pendingLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: empEmail, password: "staffpassword123" }),
  });
  const pendingLoginData = await pendingLoginRes.json();
  assert(pendingLoginRes.status === 403, "Pending employee login is blocked with status 403");
  assert(pendingLoginData.account_status === "pending", "Response indicates account is pending");
  const pendingMsg = pendingLoginData.details || pendingLoginData.error || pendingLoginData.message || "";
  assert(pendingMsg.includes("+9779842661754") || pendingMsg.includes("Pending Approval"), "Message directs employee to Admin contact numbers");

  // --------------------------------------------------------------------------
  // TEST 4: Super Admin Login & Review Accounts
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Super Admin Login & Accounts Inspection ---");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "admin@dic.gov.np", password: "admin123" }),
  });
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginRes.ok && adminLoginData.success, "Super Admin logged in successfully");
  assert(adminLoginData.user.role === "super_admin", "Admin role confirmed as super_admin");

  // Fetch accounts list as admin
  const accountsRes = await fetch(`${BASE_URL}/api/admin/accounts?role=employee&status=pending`, {
    headers: { "x-user-role": "super_admin", "x-user-id": adminLoginData.user.id },
  });
  const accountsData = await accountsRes.json();
  assert(accountsRes.ok && accountsData.success, "Admin can retrieve accounts list");
  const foundPending = accountsData.users.find((u) => u.id === registeredEmpId || u.email === empEmail);
  assert(!!foundPending, "New pending employee is visible in admin approval list");

  // --------------------------------------------------------------------------
  // TEST 5: Super Admin Approves Employee
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: Super Admin Employee Approval & Automated Notification Email ---");
  const approveRes = await fetch(`${BASE_URL}/api/admin/accounts`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-user-role": "super_admin",
      "x-user-id": adminLoginData.user.id
    },
    body: JSON.stringify({
      user_id: registeredEmpId,
      action: "approve",
      admin_id: adminLoginData.user.id,
      admin_name: adminLoginData.user.name,
    }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.ok && approveData.success, "Admin successfully approved employee");
  assert(approveData.user.account_status === "approved", "Employee status updated to 'approved'");
  assert(approveData.email_dispatched === true, "Automated approval notification email was dispatched with sign-in link");

  // --------------------------------------------------------------------------
  // TEST 6: Approved Employee Can Now Log In Successfully
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 6: Approved Employee Login Verification ---");
  const approvedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: empEmail, password: "staffpassword123" }),
  });
  const approvedLoginData = await approvedLoginRes.json();
  assert(approvedLoginRes.ok && approvedLoginData.success, "Approved employee can now log in successfully");
  assert(approvedLoginData.user.account_status === "approved", "User session confirms approved status");
  assert(approvedLoginData.user.local_government_id === "phidim_mun", "Assigned municipality remains phidim_mun");

  // --------------------------------------------------------------------------
  // TEST 7: Annual Report Lifecycle (Draft -> Submit -> Return -> Resubmit)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 7: Annual Report Lifecycle & Return for Correction ---");
  // 7a: Save draft
  const draftRes = await fetch(`${BASE_URL}/api/reports/manage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      report_id: `rep_phidim_mun_2082`,
      palika_id: "phidim_mun",
      fiscal_year: "2082/083",
      action: "draft",
      user_id: registeredEmpId,
      user_role: "employee",
      user_name: "सुमन पोखरेल (सहजकर्ता)",
      summary_data: { q2_total: 120, q9_total: 110, home_visits_count: 35, assistive_devices_count: 14 }
    }),
  });
  const draftData = await draftRes.json();
  assert(draftRes.ok && draftData.success, "Employee can save draft report");
  assert(draftData.report.status === "draft", "Report status is 'draft'");

  // 7b: Final Submit
  const submitRes = await fetch(`${BASE_URL}/api/reports/manage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      report_id: `rep_phidim_mun_2082`,
      palika_id: "phidim_mun",
      fiscal_year: "2082/083",
      action: "submit",
      user_id: registeredEmpId,
      user_role: "employee",
      user_name: "सुमन पोखरेल (सहजकर्ता)",
      summary_data: { q2_total: 125, q9_total: 115, home_visits_count: 40, assistive_devices_count: 15 }
    }),
  });
  const submitData = await submitRes.json();
  assert(submitRes.ok && submitData.success, "Employee can submit report");
  assert(submitData.report.status === "submitted", "Report status is 'submitted'");

  // 7c: Super Admin Return for Correction
  const correctionNote = "Question 12 को महिला/पुरुष संख्या र अनुसूची १.१ को नामावली पुनः जाँच गर्नुहोस्।";
  const returnRes = await fetch(`${BASE_URL}/api/reports/manage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      report_id: `rep_phidim_mun_2082`,
      palika_id: "phidim_mun",
      fiscal_year: "2082/083",
      action: "return_for_correction",
      admin_notes: correctionNote,
      user_id: adminLoginData.user.id,
      user_role: "super_admin",
      user_name: adminLoginData.user.name,
    }),
  });
  const returnData = await returnRes.json();
  assert(returnRes.ok && returnData.success, "Super Admin can return report for correction");
  assert(returnData.report.status === "returned_for_correction", "Report status is 'returned_for_correction'");
  assert(returnData.report.admin_notes === correctionNote, "Admin correction note is saved with report");

  // 7d: Employee resubmits after correction
  const resubmitRes = await fetch(`${BASE_URL}/api/reports/manage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      report_id: `rep_phidim_mun_2082`,
      palika_id: "phidim_mun",
      fiscal_year: "2082/083",
      action: "submit",
      user_id: registeredEmpId,
      user_role: "employee",
      user_name: "सुमन पोखरेल (सहजकर्ता)",
      summary_data: { q2_total: 128, q9_total: 118, home_visits_count: 42, assistive_devices_count: 16 }
    }),
  });
  const resubmitData = await resubmitRes.json();
  assert(resubmitRes.ok && resubmitData.success, "Employee can resubmit corrected report");
  assert(resubmitData.report.status === "submitted", "Report status back to 'submitted'");

  console.log("\n===============================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("===============================================================\n");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
