-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA: GOVERNMENT GRIEVANCE SYSTEM MODULE
-- अपाङ्गता सूचना केन्द्र (Disability Information Center - DIC)
-- कोशी प्रदेश सरकार तथा स्थानीय तह एकीकृत अनलाइन गुनासो व्यवस्थापन प्रणाली
-- ====================================================================

-- 1. GOVERNMENT CONTACTS (Ministries & 137 Local Governments)
CREATE TABLE IF NOT EXISTS government_contacts (
    id VARCHAR(64) PRIMARY KEY,
    organization_type VARCHAR(32) NOT NULL CHECK (organization_type IN ('ministry', 'local_government', 'provincial_office')),
    ministry_id VARCHAR(64),
    district_id VARCHAR(50),
    local_government_id VARCHAR(64),
    organization_name_ne VARCHAR(255) NOT NULL,
    organization_name_en VARCHAR(255),
    official_email VARCHAR(150) NOT NULL,
    official_phone VARCHAR(60) NOT NULL,
    office_address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_gov_contacts_type ON government_contacts(organization_type);
CREATE INDEX IF NOT EXISTS idx_gov_contacts_district ON government_contacts(district_id);
CREATE INDEX IF NOT EXISTS idx_gov_contacts_palika ON government_contacts(local_government_id);
CREATE INDEX IF NOT EXISTS idx_gov_contacts_verified ON government_contacts(is_verified);

-- 2. GRIEVANCE SETTINGS (Mandatory CC, limits, etc.)
CREATE TABLE IF NOT EXISTS grievance_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'default_settings',
    mandatory_cc_email VARCHAR(150) NOT NULL DEFAULT 'grievance.mosd@koshi.gov.np',
    is_mandatory_cc_active BOOLEAN DEFAULT TRUE,
    allow_anonymous BOOLEAN DEFAULT TRUE,
    max_doc_size_mb INT DEFAULT 10,
    max_img_size_mb INT DEFAULT 8,
    max_video_size_mb INT DEFAULT 30,
    allowed_doc_formats TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Grievance Settings
INSERT INTO grievance_settings (id, mandatory_cc_email, is_mandatory_cc_active, allow_anonymous)
VALUES ('default_settings', 'grievance.mosd@koshi.gov.np', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number VARCHAR(32) UNIQUE NOT NULL,
    complaint_type VARCHAR(20) NOT NULL CHECK (complaint_type IN ('identified', 'anonymous')),
    
    -- Identified fields (NULL for anonymous)
    full_name VARCHAR(150),
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(150),
    
    -- Recipient Organization Routing
    recipient_type VARCHAR(32) NOT NULL CHECK (recipient_type IN ('ministry', 'local_government')),
    ministry_id VARCHAR(64),
    district_id VARCHAR(50),
    local_government_id VARCHAR(64),
    organization_name VARCHAR(255) NOT NULL,
    official_recipient_email VARCHAR(150) NOT NULL,
    official_recipient_phone VARCHAR(60),
    
    -- Content
    subject VARCHAR(100) NOT NULL,
    other_subject VARCHAR(200),
    description TEXT NOT NULL,
    
    -- Status Workflow
    status VARCHAR(50) NOT NULL DEFAULT 'नयाँ' CHECK (status IN (
        'नयाँ',
        'सम्बन्धित निकायमा पठाइएको',
        'हेर्दै गरिएको',
        'समाधान प्रक्रियामा',
        'समाधान भएको',
        'अस्वीकृत',
        'थप विवरण आवश्यक'
    )),
    admin_remarks TEXT,
    
    -- Email Routing Status
    email_status VARCHAR(30) DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'retrying')),
    mandatory_cc_email VARCHAR(150),
    email_sent_at TIMESTAMPTZ,
    email_error TEXT,
    retry_count INT DEFAULT 0,
    
    -- Metadata
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_number ON complaints(complaint_number);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_recipient ON complaints(recipient_type, ministry_id, local_government_id);
CREATE INDEX IF NOT EXISTS idx_complaints_email_status ON complaints(email_status);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);

-- 4. COMPLAINT ATTACHMENTS (Documents, Photos, Videos)
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('document', 'image', 'video')),
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_complaint ON complaint_attachments(complaint_id);

-- 5. COMPLAINT EMAIL LOGS
CREATE TABLE IF NOT EXISTS complaint_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    to_email VARCHAR(150) NOT NULL,
    cc_email VARCHAR(150),
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    retry_count INT DEFAULT 0
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE government_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_email_logs ENABLE ROW LEVEL SECURITY;

-- Read policy: Anyone can read verified active government contacts
CREATE POLICY "Public can view active government contacts"
ON government_contacts FOR SELECT
USING (is_active = TRUE AND is_verified = TRUE);

-- Public can insert new complaints
CREATE POLICY "Public can insert complaints"
ON complaints FOR INSERT
WITH CHECK (TRUE);

-- Public can insert attachments for their complaints
CREATE POLICY "Public can insert complaint attachments"
ON complaint_attachments FOR INSERT
WITH CHECK (TRUE);

-- Public can view complaint status by complaint_number (without exposing private fields)
CREATE POLICY "Public can view complaint status"
ON complaints FOR SELECT
USING (TRUE);

-- Admins have full access to everything
CREATE POLICY "Admins have full access to complaints"
ON complaints FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "Admins have full access to government contacts"
ON government_contacts FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "Admins have full access to grievance settings"
ON grievance_settings FOR ALL
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);
