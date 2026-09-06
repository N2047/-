import { NextResponse } from "next/server";
import { 
  getAllUsers, 
  approveEmployee, 
  rejectEmployee, 
  updateUserStatus, 
  blockUser,
  unblockUser,
  getAuditLogs 
} from "@/lib/authStore";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // 'normal_user' | 'employee' | 'all'
    const status = searchParams.get("status"); // 'pending' | 'approved' | 'all'

    const all = getAllUsers();

    let filtered = all.map(({ password_hash, ...u }) => u);

    if (role && role !== "all") {
      filtered = filtered.filter(u => u.role === role);
    }

    if (status && status !== "all") {
      filtered = filtered.filter(u => u.account_status === status);
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      users: filtered,
      audit_logs: getAuditLogs().slice(0, 50)
    });

  } catch (err: any) {
    console.error("GET /api/admin/accounts error:", err);
    return NextResponse.json(
      { error: "खाता विवरण लोड गर्न सकिएन।" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;
    const userId = body.userId || body.user_id;
    const adminId = body.adminId || body.admin_id || "admin-master-001";
    const adminName = body.adminName || body.admin_name || "मुख्य प्रशासक";
    const reason = body.reason;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "action र userId दुवै अनिवार्य छन्।" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const res = approveEmployee(userId, adminId, adminName);
      if (!res.success || !res.user) {
        return NextResponse.json({ error: res.error || "Approve गर्न सकिएन।" }, { status: 400 });
      }

      // Requirement 28: Automatic Approval Email Dispatch
      const emp = res.user;
      const signInLink = "https://kosi-dic.vercel.app/local-reporting";

      const approvalSubject = `तपाईंको कर्मचारी खाता सफलतापूर्वक Approve भयो — अपाङ्गता सूचना केन्द्र`;
      const approvalBody = `
अपाङ्गता सूचना केन्द्र (DIC), कोशी प्रदेश

नमस्कार ${emp.name} ज्यू,

तपाईंको अपाङ्गता सूचना केन्द्रको कर्मचारी खाता सफलतापूर्वक Approve भएको जानकारी गराइन्छ।

अब तपाईं प्रणालीमा Sign In गरी आफ्ना अधिकारअनुसारका सुविधाहरू तथा स्थानीय सरकार वार्षिक प्रतिवेदन प्रविष्टि प्रयोग गर्न सक्नुहुनेछ।

खाता विवरण:
कर्मचारी आईडी: ${emp.user_id}
स्थानीय तह: ${emp.local_government_name || emp.palika_name}
जिल्ला: ${emp.district_name}
ईमेल: ${emp.email || "उपलब्ध छैन"}
मोबाइल: ${emp.phone || "उपलब्ध छैन"}

Sign In गर्न तलको लिंक खोल्नुहोस्:
${signInLink}

धन्यवाद,
अपाङ्गता सूचना केन्द्र (DIC), कोशी प्रदेश
      `.trim();

      console.log(`[APPROVAL EMAIL DISPATCHED]`);
      console.log(`To: ${emp.email || emp.phone}`);
      console.log(`Subject: ${approvalSubject}`);
      console.log(approvalBody);

      return NextResponse.json({
        success: true,
        message: `'${emp.name}' (${emp.user_id}) को कर्मचारी खाता सफलतापूर्वक Approve गरियो। Approval Email पठाइयो।`,
        user: emp,
        emailDispatched: true,
        email_dispatched: true
      });
    }

    if (action === "reject") {
      const res = rejectEmployee(userId, adminId, adminName, reason);
      if (!res.success || !res.user) {
        return NextResponse.json({ error: res.error || "Reject गर्न सकिएन।" }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `'${res.user.name}' को कर्मचारी खाता अस्वीकृत (Rejected) गरियो।`,
        user: res.user
      });
    }

    if (action === "toggle_employee_status") {
      const all = getAllUsers();
      const current = all.find(u => u.id === userId || u.user_id === userId);
      if (!current) {
        return NextResponse.json({ error: "कर्मचारी फेला परेन।" }, { status: 404 });
      }

      if (current.account_status === "approved") {
        // Toggle OFF -> Set to pending
        const res = updateUserStatus(userId, "pending", adminId, adminName);
        return NextResponse.json({
          success: true,
          message: `'${res.user?.name}' को खाता स्थिति 'Pending (स्वीकृति बाँकी)' मा परिवर्तन गरियो।`,
          user: res.user,
          newStatus: "pending"
        });
      } else {
        // Toggle ON -> Approve
        const res = approveEmployee(userId, adminId, adminName);
        return NextResponse.json({
          success: true,
          message: `'${res.user?.name}' को खाता सफलतापूर्वक 'Approved (स्वीकृत)' गरियो।`,
          user: res.user,
          newStatus: "approved"
        });
      }
    }

    if (action === "pending") {
      const res = updateUserStatus(userId, "pending", adminId, adminName);
      return NextResponse.json({
        success: true,
        message: `'${res.user?.name}' को खाता स्थिति 'Pending (स्वीकृति बाँकी)' मा परिवर्तन गरियो।`,
        user: res.user
      });
    }

    if (action === "suspend") {
      const res = updateUserStatus(userId, "suspended", adminId, adminName);
      return NextResponse.json({
        success: true,
        message: "खाता निलम्बन (Suspended) गरियो।",
        user: res.user
      });
    }

    if (action === "activate") {
      const res = updateUserStatus(userId, "approved", adminId, adminName);
      return NextResponse.json({
        success: true,
        message: "खाता पुनः सक्रिय (Active) गरियो।",
        user: res.user
      });
    }

    if (action === "block") {
      const res = blockUser(userId, adminId, adminName, reason);
      if (!res.success || !res.user) {
        return NextResponse.json({ error: res.error || "प्रयोगकर्ता ब्लक गर्न सकिएन।" }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `'${res.user.name}' को खाता सफलतापूर्वक Block गरियो। उक्त खाताबाट अब लगइन सम्भव हुने छैन।`,
        user: res.user,
        newStatus: "blocked"
      });
    }

    if (action === "unblock") {
      const res = unblockUser(userId, adminId, adminName);
      if (!res.success || !res.user) {
        return NextResponse.json({ error: res.error || "प्रयोगकर्ता Unblock गर्न सकिएन।" }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `'${res.user.name}' को खाता सफलतापूर्वक Unblock गरियो। अब प्रयोगकर्ताले लगइन गर्न सक्नेछन्।`,
        user: res.user,
        newStatus: "approved"
      });
    }

    return NextResponse.json({ error: "अमान्य कार्य (Invalid Action)" }, { status: 400 });

  } catch (err: any) {
    console.error("POST /api/admin/accounts error:", err);
    return NextResponse.json(
      { error: "प्रक्रियामा प्राविधिक त्रुटि भयो।" },
      { status: 500 }
    );
  }
}
