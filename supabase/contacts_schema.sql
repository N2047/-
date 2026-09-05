-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA: CONTACT DIRECTORY MODULE
-- अपाङ्गता सूचना केन्द्र (Disability Information Center - DIC)
-- ====================================================================

-- 1. PROVINCE LEVEL CONTACTS TABLE
CREATE TABLE IF NOT EXISTS province_contacts (
    id VARCHAR(50) PRIMARY KEY,
    organization_name_ne VARCHAR(255) NOT NULL,
    organization_name_en VARCHAR(255),
    contact_person_name VARCHAR(150),
    contact_person_mobile VARCHAR(50),
    office_phone VARCHAR(50),
    email VARCHAR(100),
    address_ne VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Province Contacts (Ministry & NFDN)
INSERT INTO province_contacts (id, organization_name_ne, organization_name_en, contact_person_name, contact_person_mobile, office_phone, email, address_ne, is_public)
VALUES
(
    'ministry_koshi',
    'सामाजिक विकास मन्त्रालय, कोशी प्रदेश',
    'Ministry of Social Development, Koshi Province',
    NULL,
    NULL,
    '०२१-४६०१२३',
    'mosd@koshi.gov.np',
    'विराटनगर, मोरङ, कोशी प्रदेश',
    TRUE
),
(
    'nfdn_koshi',
    'राष्ट्रिय अपाङ्ग महासंघ नेपाल, कोशी प्रदेश',
    'National Federation of the Disabled Nepal (NFDN), Koshi Province',
    NULL,
    NULL,
    '०२१-५१२३४५',
    'nfdn.koshi@gmail.com',
    'विराटनगर, मोरङ, कोशी प्रदेश',
    TRUE
)
ON CONFLICT (id) DO NOTHING;


-- 2. 137 LOCAL GOVERNMENTS CONTACTS TABLE
CREATE TABLE IF NOT EXISTS local_government_contacts (
    id SERIAL PRIMARY KEY,
    local_government_id VARCHAR(64) UNIQUE NOT NULL,
    palika_name_ne VARCHAR(200) NOT NULL,
    district_id VARCHAR(50) NOT NULL,
    district_name_ne VARCHAR(100) NOT NULL,
    disability_facilitator_name VARCHAR(150),
    disability_facilitator_mobile VARCHAR(50),
    women_children_social_branch_name VARCHAR(150),
    women_children_social_branch_mobile VARCHAR(50),
    deputy_mayor_chairperson_name VARCHAR(150),
    deputy_mayor_chairperson_mobile VARCHAR(50),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search and district filtering
CREATE INDEX IF NOT EXISTS idx_lg_contacts_palika_id ON local_government_contacts(local_government_id);
CREATE INDEX IF NOT EXISTS idx_lg_contacts_district_id ON local_government_contacts(district_id);
CREATE INDEX IF NOT EXISTS idx_lg_contacts_is_public ON local_government_contacts(is_public);

-- Enable Row Level Security (RLS)
ALTER TABLE province_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_government_contacts ENABLE ROW LEVEL SECURITY;

-- Read policy: Anyone can view public contacts
CREATE POLICY "Public contacts are readable by everyone" 
ON province_contacts FOR SELECT 
USING (is_public = true);

CREATE POLICY "Public local contacts are readable by everyone" 
ON local_government_contacts FOR SELECT 
USING (is_public = true);

-- Admin policy: Authenticated admins can manage all records
CREATE POLICY "Admins have full access to province contacts" 
ON province_contacts FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admins have full access to local contacts" 
ON local_government_contacts FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
