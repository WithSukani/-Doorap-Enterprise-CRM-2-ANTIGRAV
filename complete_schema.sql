-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Core Entities
-- ==========================================

-- 1. Landlords (Owners)
CREATE TABLE landlords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'Active', -- 'Active', 'Inactive', 'Pending'
    portal_access BOOLEAN DEFAULT FALSE,
    sentiment TEXT, -- 'Happy', 'Neutral', 'Unhappy'
    last_interaction_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    stripe_connect_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL,
    postcode TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Apartment', 'House', etc.
    owner_name TEXT, -- Keeping as text per frontend types, but we'll also link to landlords
    purchase_date DATE,
    value NUMERIC,
    image_url TEXT,
    notes TEXT,
    management_fee_type TEXT, -- 'Percentage', 'Fixed'
    management_fee_value NUMERIC,
    is_archived BOOLEAN DEFAULT FALSE,
    landlord_id UUID REFERENCES landlords(id) ON DELETE SET NULL, -- Link to owner
    custom_field_values JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    lease_start_date DATE,
    lease_end_date DATE,
    rent_amount NUMERIC,
    security_deposit NUMERIC,
    deposit_status TEXT, -- 'Registered', 'Refunded', etc.
    deposit_scheme TEXT,
    notes TEXT,
    avatar_url TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    custom_field_values JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles (App Users / Managers)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Assuming single user per row for now, or link to auth.users
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    stripe_connect_id TEXT,
    stripe_data_feed_enabled BOOLEAN DEFAULT FALSE,
    stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
    company_address TEXT,
    company_reg_no TEXT,
    company_vat_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. Integration Settings (e.g. Gemini, SendGrid)
CREATE TABLE integration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL, -- 'gemini', 'sendgrid', 'stripe'
    api_key TEXT, -- Store encrypted in production!
    is_active BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}'::jsonb, -- Store extra config like model_name, sender_email
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4c. Portal Settings (e.g. Rightmove, Zoopla)
CREATE TABLE portal_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portal_name TEXT NOT NULL, -- 'rightmove', 'zoopla'
    branch_id TEXT,
    network_id TEXT, -- or certificate
    is_active BOOLEAN DEFAULT FALSE,
    is_live_feed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Team Members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL, -- 'Admin', 'Property Manager', etc.
    status TEXT DEFAULT 'Invited', -- 'Active', 'Invited', 'Deactivated'
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Operations & CRM
-- ==========================================

-- 6. Maintenance Requests
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    issue_title TEXT NOT NULL,
    description TEXT,
    reported_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL, -- 'New', 'In Progress', etc.
    priority TEXT NOT NULL, -- 'Low', 'Medium', 'High', 'Urgent'
    assigned_provider TEXT,
    quote_amount NUMERIC,
    quote_url TEXT,
    invoice_amount NUMERIC,
    invoice_url TEXT,
    marketplace_job_id TEXT,
    service_booked BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Reminders
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    due_date DATE NOT NULL,
    frequency TEXT, -- 'One-time', 'Monthly', etc.
    is_completed BOOLEAN DEFAULT FALSE,
    last_completed_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SLAs
CREATE TABLE slas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    priority_level TEXT NOT NULL,
    response_time_hours INTEGER,
    resolution_time_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Documents (Files)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL, -- Polymorphic ID
    parent_type TEXT NOT NULL, -- 'property', 'tenant', 'maintenance_request', etc.
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Lease', 'Invoice', etc.
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    file_name TEXT,
    file_size TEXT,
    file_url TEXT,
    notes TEXT,
    expiry_date DATE,
    template_id UUID, -- Link to document_templates
    content TEXT, -- For AI generated content
    folder_id UUID, -- Link to folders (if implemented)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Communication Logs
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL, -- Polymorphic ID
    parent_type TEXT NOT NULL, -- 'property', 'tenant', etc.
    date TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL, -- 'Email', 'Phone Call', etc.
    summary TEXT,
    participants TEXT[], -- Array of names string
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    parent_id UUID,
    parent_type TEXT,
    link_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    assigned_to TEXT,
    status TEXT DEFAULT 'Pending',
    priority TEXT,
    related_to_id UUID,
    related_to_type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Financials
-- ==========================================

-- 13. Bank Accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    last4 TEXT,
    balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'GBP',
    status TEXT DEFAULT 'Active',
    type TEXT, -- 'Checking', 'Savings'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Rent Payments
CREATE TABLE rent_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    vendor TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Recurring Payments
CREATE TABLE recurring_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    type TEXT, -- 'Direct Debit', etc.
    vendor TEXT,
    reference TEXT,
    amount NUMERIC,
    frequency TEXT, -- 'Monthly', etc.
    next_due_date DATE,
    status TEXT, -- 'Active', 'Paused'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Payment Links
CREATE TABLE payment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payer_id UUID, -- Polymorphic (Tenant or Landlord)
    payer_type TEXT,
    amount NUMERIC,
    description TEXT,
    status TEXT, -- 'Open', 'Paid'
    url TEXT,
    frequency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Tenancy Cycle & Marketing
-- ==========================================

-- 18. Vacancies
CREATE TABLE vacancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    listing_title TEXT NOT NULL,
    description TEXT,
    rent_amount NUMERIC,
    available_date DATE,
    status TEXT, -- 'Available', etc.
    notes TEXT,
    portal_status JSONB, -- Stores rightmove/zoopla status
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Applicants
CREATE TABLE applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacancy_id UUID REFERENCES vacancies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    application_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT, -- 'New', 'Viewed', etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Inspections
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMPTZ,
    inspection_type TEXT,
    status TEXT,
    summary_notes TEXT,
    inspector_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Inspection Checklist Items
CREATE TABLE inspection_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    status TEXT, -- 'Pass', 'Fail', etc.
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Meter Readings
CREATE TABLE meter_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Gas', 'Electric'
    reading NUMERIC NOT NULL,
    date DATE NOT NULL,
    photo_url TEXT,
    context TEXT, -- 'Move In', 'Routine'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Inventory Checks
CREATE TABLE inventory_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    type TEXT, -- 'Check In', 'Check Out'
    date DATE,
    items JSONB DEFAULT '[]'::jsonb, -- Store items as JSONB for simplicity as they are nested
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Automation, AI & Config
-- ==========================================

-- 24. Document Templates
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    content TEXT,
    description TEXT,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24b. Folders
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Custom',
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Custom Field Definitions
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    name TEXT NOT NULL, -- key
    label TEXT NOT NULL,
    field_type TEXT NOT NULL,
    options TEXT[],
    placeholder TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Automation Workflows
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    steps JSONB DEFAULT '[]'::jsonb, -- Store steps configuration
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. Dori Interactions (AI Logs)
CREATE TABLE dori_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT,
    direction TEXT,
    contact_name TEXT,
    contact_role TEXT,
    summary TEXT,
    sentiment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    duration TEXT,
    transcript TEXT,
    audio_url TEXT,
    status TEXT,
    action_items TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. Dori Actions (Suggestions)
CREATE TABLE dori_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT,
    confidence_score NUMERIC,
    suggested_at TIMESTAMPTZ DEFAULT NOW(),
    related_entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. Dori Executions (Workflow Runs)
CREATE TABLE dori_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name TEXT,
    entity_name TEXT,
    entity_role TEXT,
    status TEXT,
    start_time TIMESTAMPTZ,
    steps JSONB DEFAULT '[]'::jsonb, -- Execution log steps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. Emergencies
CREATE TABLE emergencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT,
    status TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    related_id UUID,
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. Chat Sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Usually a distinctive string in frontend, but UUID for DB
    session_key TEXT UNIQUE, -- To store 'session_ten1' style keys
    name TEXT,
    target_avatar_url TEXT,
    last_activity TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender TEXT,
    text TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. Approval Requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landlord_id UUID REFERENCES landlords(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    description TEXT,
    amount NUMERIC,
    document_url TEXT,
    status TEXT,
    sent_date TIMESTAMPTZ,
    viewed_date TIMESTAMPTZ,
    action_date TIMESTAMPTZ,
    notes TEXT,
    maintenance_request_id UUID REFERENCES maintenance_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RLS Policies (Public Access for Dev)
-- ==========================================

-- Helper function to enable RLS and add public policies
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Policy: Allow all operations for now
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access for all users" ON %I;', t);
        EXECUTE format('CREATE POLICY "Enable all access for all users" ON %I FOR ALL USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;

-- ==========================================
-- SEED DATA
-- ==========================================

-- UUID Mappings:
-- prop1 -> a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01
-- prop2 -> a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02
-- prop3 -> a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03
-- prop4 -> a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04
-- ll1   -> b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01
-- ll2   -> b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02
-- ll3   -> b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03
-- ll4   -> b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04
-- ten1  -> c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01
-- ten2  -> c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02
-- ten3  -> c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03
-- tm1   -> d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01 (Alex Manager)

-- 1. Landlords
INSERT INTO landlords (id, name, email, phone, address, status, portal_access, sentiment, last_interaction_date, notes) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'John Doe', 'john.doe@example.com', '07700 900123', '10 Downing St, London, SW1A 2AA', 'Active', true, 'Happy', NOW() - INTERVAL '2 days', NULL),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Jane Smith', 'jane.smith@example.com', '07700 900456', '221B Baker St, London, NW1 6XE', 'Active', false, 'Neutral', NOW() - INTERVAL '10 days', NULL),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Biz Corp', 'admin@bizcorp.com', '020 7946 0000', 'Canary Wharf, London, E14 5AB', 'Active', true, 'Happy', NOW(), NULL),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'University Homes', 'accom@university.ac.uk', '020 7946 0001', 'University Campus, Oxford, OX1 1AA', 'Active', true, 'Unhappy', NOW() - INTERVAL '5 days', 'Concerned about recent maintenance costs.');

-- 2. Properties
INSERT INTO properties (id, address, postcode, type, owner_name, purchase_date, value, image_url, notes, management_fee_type, management_fee_value, landlord_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '123 Main St, Anytown', 'AT1 2BC', 'House', 'John Doe', '2020-01-15', 250000, 'https://picsum.photos/seed/prop1/600/400', 'Recently renovated kitchen.', 'Percentage', 10, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Apt 4B, 456 Oak Rd, Metrocity', 'MC2 3DE', 'Apartment', 'Jane Smith', '2018-06-10', 180000, 'https://picsum.photos/seed/prop2/600/400', 'Top floor unit with city views.', 'Percentage', 12, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Unit 7, Business Park, Workville', 'WV3 4FG', 'Commercial', 'Biz Corp', '2019-03-22', 500000, 'https://picsum.photos/seed/prop3/600/400', NULL, 'Fixed', 250, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Elm House, Student Village', 'SV4 5GH', 'Student Accommodation', 'University Homes', '2021-08-01', 1200000, 'https://picsum.photos/seed/prop4/600/400', 'Shared student housing.', 'Percentage', 15, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04');

-- 3. Tenants
INSERT INTO tenants (id, property_id, name, email, phone, lease_start_date, lease_end_date, rent_amount, security_deposit, deposit_status, notes) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Alice Wonderland', 'alice@example.com', '555-1234', '2023-02-01', '2024-08-31', 1200, 1500, 'Registered', 'Quiet tenant, always pays on time.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Bob The Builder', 'bob@example.com', '555-5678', '2022-07-15', '2024-07-14', 950, 1000, 'Registered', NULL),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Charlie Brown', 'charlie@example.com', '555-8765', '2023-05-01', NULL, 1150, 1150, 'Pending', 'Has a small dog.');

-- 4. User Profile (Map to Alex Manager)
INSERT INTO user_profiles (id, name, company_name, email, phone, avatar_url, stripe_connect_id, stripe_data_feed_enabled, stripe_payouts_enabled, company_address, company_reg_no, company_vat_number) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Alex Manager', 'PropertyMax Solutions', 'alex.manager@propmax.com', '020 7946 0000', 'https://picsum.photos/seed/useravatar/100/100', NULL, false, false, '123 Business Rd, London', 'REG12345', 'GB123456789');

-- 5. Team Members
INSERT INTO team_members (id, name, email, role, status, last_login) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Alex Manager', 'alex.manager@propmax.com', 'Admin', 'Active', NOW()),
(uuid_generate_v4(), 'Sarah Staff', 'sarah.staff@propmax.com', 'Property Manager', 'Active', NOW() - INTERVAL '1 day'),
(uuid_generate_v4(), 'Mike Maintenance', 'mike.m@propmax.com', 'Maintenance', 'Invited', NULL);

-- 6. Maintenance Requests
-- maint1 -> e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01
-- maint2 -> e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02
-- maint3 -> e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03
INSERT INTO maintenance_requests (id, property_id, tenant_id, issue_title, description, reported_date, status, priority, assigned_provider, marketplace_job_id, quote_amount, service_booked, notes) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'Leaky Faucet in Kitchen', 'The kitchen faucet has been dripping constantly for the past two days.', '2023-10-26', 'New', 'Medium', 'PlumbPerfect Inc.', 'MP1001', NULL, false, NULL),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'Broken Window Pane', 'A window pane in the living room was accidentally broken.', '2023-10-28', 'Pending Quote', 'High', NULL, NULL, NULL, false, 'Needs urgent repair for security.'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'Boiler Not Working', 'The central heating boiler is not producing hot water or heating.', '2023-11-01', 'In Progress', 'Urgent', 'HeatPro Ltd.', NULL, 250, true, NULL);

-- 7. Reminders
-- rem1 -> f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01
INSERT INTO reminders (id, property_id, task, due_date, frequency, is_completed, last_completed_date, notes) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Annual Gas Safety Check', '2024-09-15', 'Annually', false, NULL, 'Certificate renewal required.'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'PAT Testing for Appliances', CURRENT_DATE - INTERVAL '1 month', 'Annually', false, NULL, 'This reminder is overdue.'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Fire Alarm System Test', '2023-12-01', 'Monthly', true, '2023-11-01', NULL);

-- 8. Financials (Bank Accounts & Payments)
-- ba1 -> 20eebc99-9c0b-4ef8-bb6d-6bb9bd380201
INSERT INTO bank_accounts (id, name, last4, balance, currency, type) VALUES
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380201', 'Client Money - Lettings', '4242', 45200.50, 'GBP', 'Checking'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380202', 'Operations - Main', '8812', 12450.00, 'GBP', 'Checking'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380203', 'Reserve Fund - Block A', '1129', 8900.25, 'GBP', 'Savings');

INSERT INTO rent_payments (tenant_id, property_id, bank_account_id, date, amount, payment_method) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380201', CURRENT_DATE, 1200, 'Bank Transfer'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380201', CURRENT_DATE - INTERVAL '2 days', 950, 'Bank Transfer');

-- 9. SLAs
INSERT INTO slas (id, name, description, priority_level, response_time_hours, resolution_time_hours, is_active) VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380301', 'Urgent Repairs SLA', 'For issues classified as Urgent.', 'Urgent', 2, 24, true),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380302', 'High Priority SLA', 'For High priority issues.', 'High', 4, 48, true),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380303', 'Standard Maintenance SLA', 'For Medium and Low priority issues.', 'Medium', 24, 120, false);

-- 10. Documents
INSERT INTO documents (id, parent_id, parent_type, name, type, upload_date, file_name, file_size, notes) VALUES
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380401', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'property', 'Property Deed - 123 Main St', 'Property Deed', '2020-01-10', 'deed_main_st.pdf', '1.2MB', 'Original copy.'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380402', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'tenant', 'Alice Wonderland Lease', 'Lease Agreement', '2023-01-20', 'lease_alice.pdf', '800KB', NULL),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380403', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'maintenance_request', 'Kitchen Faucet Photo', 'Photo/Video', '2023-10-26', 'faucet_leak.jpg', '3.1MB', 'Photo of the leak before repair.');

-- 11. Notifications
INSERT INTO notifications (type, message, date, is_read, parent_type) VALUES
('General Info', 'Welcome to Doorap! Explore the features.', NOW(), true, 'general');

-- 12. Automation Workflows
INSERT INTO automation_workflows (id, name, trigger_event, is_active, steps) VALUES
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380501', 'Urgent Maintenance Dispatch', 'Incoming Call', true, '[{"id": "s1", "type": "condition", "description": "Keyword Leak or Flood detected"}, {"id": "s2", "type": "action", "description": "Create Urgent Maintenance Request"}]'::jsonb),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380502', 'Viewing Appointment Booking', 'Incoming Call / Message', true, '[{"id": "s1", "type": "action", "description": "Extract Lead Details"}, {"id": "s2", "type": "action", "description": "Check PM Calendar Availability"}]'::jsonb);

-- 13. Dori Logs/Activity
INSERT INTO dori_interactions (id, type, direction, contact_name, contact_role, summary, sentiment, transcript, status) VALUES
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380601', 'Voice Call', 'Inbound', 'Unknown (07700 900123)', 'Lead', 'Inquired about 2-bed flats. Scheduled viewing.', 'Positive', 'Caller: Hi... Dori: Hello!', 'Completed');

-- 14. Document Templates
INSERT INTO document_templates (id, name, category, content) VALUES
('a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'Standard Residential Lease Agreement', 'Lease', 'RESIDENTIAL LEASE AGREEMENT...'),
('a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'New Tenant Welcome Letter', 'Welcome', 'Welcome to your new home!...');

-- 15. Tasks
-- task1 -> a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61
INSERT INTO tasks (id, title, due_date, status, priority, related_to_id, related_to_type, created_at) VALUES
('a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'Follow up on overdue rent for Apt 4B', CURRENT_DATE, 'Pending', 'High', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'tenant', NOW());

-- 16. Recurring Payments
INSERT INTO recurring_payments (id, type, vendor, reference, amount, frequency, next_due_date, status, property_id) VALUES
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380701', 'Direct Debit', 'British Gas', 'BG-99281', 45.50, 'Monthly', '2023-12-01', 'Active', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380702', 'Standing Order', 'CleanCo Services', 'CLN-001', 80.00, 'Monthly', '2023-12-05', 'Active', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380703', 'Direct Debit', 'Halifax Mortgage', 'MTG-112', 650.00, 'Monthly', '2023-12-10', 'Review Needed', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01');

-- 17. Payment Links
INSERT INTO payment_links (id, payer_id, payer_type, amount, description, status, created_at, url) VALUES
('80eebc99-9c0b-4ef8-bb6d-6bb9bd380801', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'Tenant', 50.00, 'Replacement Key Fee', 'Open', NOW(), 'https://buy.stripe.com/test_key_fee');

-- 18. Approval Requests
-- appr1 -> 90eebc99-9c0b-4ef8-bb6d-6bb9bd380901
INSERT INTO approval_requests (id, landlord_id, type, title, description, amount, status, sent_date, viewed_date, action_date) VALUES
('90eebc99-9c0b-4ef8-bb6d-6bb9bd380901', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Maintenance Quote', 'Boiler Repair - Quote #102', 'Replacement of heat exchanger for Apt 4B.', 450, 'Sent', NOW() - INTERVAL '1 day', NULL, NULL),
('90eebc99-9c0b-4ef8-bb6d-6bb9bd380902', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Lease Renewal', 'Lease Renewal - 123 Main St', 'Renewal for 12 months at £1250/mo for Alice Wonderland.', NULL, 'Approved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
('90eebc99-9c0b-4ef8-bb6d-6bb9bd380903', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'Compliance Certificate', 'HMO License Renewal', NULL, 850, 'Viewed', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '30 minutes', NULL);

-- 19. Meter Readings
INSERT INTO meter_readings (id, property_id, type, reading, date, context) VALUES
('a5eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Electric', 12540, '2023-02-01', 'Move In'),
('a5eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Gas', 8890, '2023-02-01', 'Move In');

-- 20. Chat Sessions & Messages
-- session_ten1 -> a7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71
INSERT INTO chat_sessions (id, name, target_avatar_url, last_activity, unread_count) VALUES
('a7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'Alice Wonderland', 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=indigo&color=fff', NOW(), 1),
('a7eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', 'John Doe', 'https://ui-avatars.com/api/?name=John+Doe&background=0f172a&color=fff', NOW() - INTERVAL '1 hour', 0);

INSERT INTO chat_messages (id, session_id, sender, text, timestamp, avatar_url) VALUES
('a8eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', 'a7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'Alice Wonderland', 'Hi Alex, is the maintenance guy coming tomorrow?', NOW() - INTERVAL '1 day', 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=indigo&color=fff'),
('a8eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', 'a7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'user', 'Yes, PlumbPerfect is scheduled for 10 AM. Does that work?', NOW() - INTERVAL '22 hours', NULL),
('a8eebc99-9c0b-4ef8-bb6d-6bb9bd380a83', 'a7eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'Alice Wonderland', 'Great, thanks! I will be home.', NOW(), 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=indigo&color=fff');

-- 21. Dori Actions
INSERT INTO dori_actions (id, title, description, type, status, confidence_score, suggested_at) VALUES
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Schedule Viewing', 'Book viewing for Lead (07700 900123) at 123 Main St on Tuesday 2pm.', 'Admin', 'Pending', 98, NOW()),
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Dispatch Plumber', 'Auto-assign PlumbPerfect to Unit 1 Leak.', 'Maintenance', 'Pending', 95, NOW() - INTERVAL '1 hour');

-- 22. Emergencies
INSERT INTO emergencies (id, title, description, severity, status, timestamp) VALUES
('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Gas Leak Reported', 'Tenant at 123 Main St reported smell of gas. Dori advised evacuation and called National Grid.', 'Critical', 'Open', NOW());

-- 23. Dori Executions
INSERT INTO dori_executions (id, workflow_name, entity_name, entity_role, status, start_time, steps) VALUES
('a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Urgent Maintenance Dispatch', 'John Doe', 'Tenant', 'Running', NOW(), '[{"id": "s1", "status": "Completed", "timestamp": "2023-11-01T10:00:00Z", "description": "Triggered by keyword Leak"}]'::jsonb),
('a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Viewing Appointment', 'Sarah Connor', 'Lead', 'Completed', NOW() - INTERVAL '1 hour', '[{"id": "s1", "status": "Completed", "timestamp": "2023-11-01T09:00:00Z", "description": "Call Received"}]'::jsonb);

-- 24. Integration Settings
INSERT INTO integration_settings (id, provider, api_key, is_active, config) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'sendgrid', 'SG.mock_key_123', true, '{"fromName": "Doorap Admin", "fromEmail": "admin@doorap.com"}'::jsonb),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 'gemini', NULL, false, '{"model": "gemini-pro"}'::jsonb);

-- 25. Portal Settings
INSERT INTO portal_settings (id, portal_name, branch_id, network_id, is_active, is_live_feed) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'rightmove', '12345', 'RM_CERT_99', true, true),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'zoopla', 'ZP9921', NULL, false, false);
