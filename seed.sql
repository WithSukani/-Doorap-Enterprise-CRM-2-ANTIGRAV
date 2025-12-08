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
INSERT INTO user_profiles (id, name, company_name, email, phone, avatar_url) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Alex Manager', 'PropertyMax Solutions', 'alex.manager@propmax.com', '020 7946 0000', 'https://picsum.photos/seed/useravatar/100/100');

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
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'zoopla', 'ZP9921', NULL, false, false);

-- 26. Custom Seed Data for Dori Demo
-- Property: 218 Eastern Avenue
INSERT INTO properties (id, address, postcode, type, owner_name, purchase_date, value, image_url, notes, management_fee_type, management_fee_value, landlord_id) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b99', '218 Eastern Avenue, London', 'E2 0AA', 'House', 'Jane Smith', '2015-06-15', 550000, 'https://picsum.photos/seed/prop99/600/400', 'Newly requested property for demo.', 'Percentage', 12, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02');

INSERT INTO tenants (id, property_id, name, email, phone, lease_start_date, lease_end_date, rent_amount, security_deposit, deposit_status, notes) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c99', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b99', 'Frank Gallagher', 'frank@example.com', '07700 900999', '2023-01-01', '2025-01-01', 2500, 2500, 'Registered', 'Good tenant.');

('exebc99-9c0b-4ef8-bb6d-6bb9bd380x01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b99', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Maintenance', 450.00, NOW() - INTERVAL '5 days', 'Boiler Service', NULL);

-- ==========================================
-- SECURITY & ISOLATION SETUP
-- ==========================================

-- 1. Ensure Role Column Exists
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'self_managing';

-- 2. Enable RLS on All Sensitive Tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Create Isolation Policies (Users see only their own data)
-- Note: We use "auth.uid() = user_id" as the standard check.

-- Properties
DROP POLICY IF EXISTS "Users can only see their own properties" ON properties;
CREATE POLICY "Users can only see their own properties" ON properties USING (auth.uid() = user_id);

-- Landlords
DROP POLICY IF EXISTS "Users can only see their own landlords" ON landlords;
CREATE POLICY "Users can only see their own landlords" ON landlords USING (auth.uid() = user_id);

-- Tenants
DROP POLICY IF EXISTS "Users can only see their own tenants" ON tenants;
CREATE POLICY "Users can only see their own tenants" ON tenants USING (auth.uid() = user_id);

-- Maintenance
DROP POLICY IF EXISTS "Users can only see their own maintenance requests" ON maintenance_requests;
CREATE POLICY "Users can only see their own maintenance requests" ON maintenance_requests USING (auth.uid() = user_id);

-- Reminders
DROP POLICY IF EXISTS "Users can only see their own reminders" ON reminders;
CREATE POLICY "Users can only see their own reminders" ON reminders USING (auth.uid() = user_id);

-- Documents
DROP POLICY IF EXISTS "Users can only see their own documents" ON documents;
CREATE POLICY "Users can only see their own documents" ON documents USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "Users can only see their own notifications" ON notifications;
CREATE POLICY "Users can only see their own notifications" ON notifications USING (auth.uid() = user_id);

-- Expenses
DROP POLICY IF EXISTS "Users can only see their own expenses" ON expenses;
CREATE POLICY "Users can only see their own expenses" ON expenses USING (auth.uid() = user_id);

-- User Profiles (Strict: only see your own profile)
DROP POLICY IF EXISTS "Users can only see their own profile" ON user_profiles;
CREATE POLICY "Users can only see their own profile" ON user_profiles USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can upsert their own profile" ON user_profiles;
CREATE POLICY "Users can upsert their own profile" ON user_profiles WITH CHECK (id = auth.uid());

-- Chat Sessions
DROP POLICY IF EXISTS "Users can only see their own chat sessions" ON chat_sessions;
CREATE POLICY "Users can only see their own chat sessions" ON chat_sessions USING (auth.uid() = user_id);

-- Chat Messages
DROP POLICY IF EXISTS "Users can only see their own chat messages" ON chat_messages;
CREATE POLICY "Users can only see their own chat messages" ON chat_messages USING (auth.uid() = user_id);

-- ==========================================
-- END SECURITY SETUP
-- ==========================================
-- ==============================================================================
-- MIGRATION: ADD MULTI-TENANCY (USER_ID) TO ALL TABLES
-- This script adds a `user_id` column to all data tables to support data isolation.
-- ==============================================================================

-- 1. Add user_id column to tables
ALTER TABLE properties ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE landlords ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE communication_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE rent_payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE recurring_payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE slas ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE dori_interactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE dori_actions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE inspection_checklist_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE folders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE meter_readings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE inventory_checks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
-- notifications already has user_id, but lets make sure
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. IMPORTANT: Backfill existing data
-- Since we don't know your specific User ID, we cannot automatically assign these rows to you.
-- RUN THE FOLLOWING COMMAND MANUALLY IN SUPABASE SQL EDITOR, REPLACING THE ID:
-- UPDATE properties SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
-- (Repeat for all tables above if you want to keep data visible)

-- 3. Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE dori_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dori_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create/Refresh RLS Policies
-- We drop existing policies to ensure clean state

-- GENERIC POLICY FUNCTION (Optional optimization, but explicit policies are safer for clarity)

-- PROPERTIES
DROP POLICY IF EXISTS "Users can select own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
CREATE POLICY "Users can select own properties" ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

-- TENANTS
DROP POLICY IF EXISTS "Users can CRUD own tenants" ON tenants;
CREATE POLICY "Users can CRUD own tenants" ON tenants USING (auth.uid() = user_id);

-- LANDLORDS
DROP POLICY IF EXISTS "Users can CRUD own landlords" ON landlords;
CREATE POLICY "Users can CRUD own landlords" ON landlords USING (auth.uid() = user_id);

-- MAINTENANCE REQUESTS
DROP POLICY IF EXISTS "Users can CRUD own maintenance" ON maintenance_requests;
CREATE POLICY "Users can CRUD own maintenance" ON maintenance_requests USING (auth.uid() = user_id);

-- REMINDERS
DROP POLICY IF EXISTS "Users can CRUD own reminders" ON reminders;
CREATE POLICY "Users can CRUD own reminders" ON reminders USING (auth.uid() = user_id);

-- DOCUMENTS
DROP POLICY IF EXISTS "Users can CRUD own documents" ON documents;
CREATE POLICY "Users can CRUD own documents" ON documents USING (auth.uid() = user_id);

-- COMMUNICATION LOGS
DROP POLICY IF EXISTS "Users can CRUD own communication_logs" ON communication_logs;
CREATE POLICY "Users can CRUD own communication_logs" ON communication_logs USING (auth.uid() = user_id);

-- BANK ACCOUNTS
DROP POLICY IF EXISTS "Users can CRUD own bank_accounts" ON bank_accounts;
CREATE POLICY "Users can CRUD own bank_accounts" ON bank_accounts USING (auth.uid() = user_id);

-- RENT PAYMENTS
DROP POLICY IF EXISTS "Users can CRUD own rent_payments" ON rent_payments;
CREATE POLICY "Users can CRUD own rent_payments" ON rent_payments USING (auth.uid() = user_id);

-- EXPENSES
DROP POLICY IF EXISTS "Users can CRUD own expenses" ON expenses;
CREATE POLICY "Users can CRUD own expenses" ON expenses USING (auth.uid() = user_id);

-- RECURRING PAYMENTS
DROP POLICY IF EXISTS "Users can CRUD own recurring_payments" ON recurring_payments;
CREATE POLICY "Users can CRUD own recurring_payments" ON recurring_payments USING (auth.uid() = user_id);

-- SLAS
DROP POLICY IF EXISTS "Users can CRUD own slas" ON slas;
CREATE POLICY "Users can CRUD own slas" ON slas USING (auth.uid() = user_id);

-- AUTOMATION WORKFLOWS
DROP POLICY IF EXISTS "Users can CRUD own automation_workflows" ON automation_workflows;
CREATE POLICY "Users can CRUD own automation_workflows" ON automation_workflows USING (auth.uid() = user_id);

-- DORI INTERACTIONS
DROP POLICY IF EXISTS "Users can CRUD own dori_interactions" ON dori_interactions;
CREATE POLICY "Users can CRUD own dori_interactions" ON dori_interactions USING (auth.uid() = user_id);

-- DORI ACTIONS
DROP POLICY IF EXISTS "Users can CRUD own dori_actions" ON dori_actions;
CREATE POLICY "Users can CRUD own dori_actions" ON dori_actions USING (auth.uid() = user_id);

-- EMERGENCIES
DROP POLICY IF EXISTS "Users can CRUD own emergencies" ON emergencies;
CREATE POLICY "Users can CRUD own emergencies" ON emergencies USING (auth.uid() = user_id);

-- TASKS
DROP POLICY IF EXISTS "Users can CRUD own tasks" ON tasks;
CREATE POLICY "Users can CRUD own tasks" ON tasks USING (auth.uid() = user_id);

-- VACANCIES
DROP POLICY IF EXISTS "Users can CRUD own vacancies" ON vacancies;
CREATE POLICY "Users can CRUD own vacancies" ON vacancies USING (auth.uid() = user_id);

-- APPLICANTS
DROP POLICY IF EXISTS "Users can CRUD own applicants" ON applicants;
CREATE POLICY "Users can CRUD own applicants" ON applicants USING (auth.uid() = user_id);

-- INSPECTIONS
DROP POLICY IF EXISTS "Users can CRUD own inspections" ON inspections;
CREATE POLICY "Users can CRUD own inspections" ON inspections USING (auth.uid() = user_id);

-- INSPECTION CHECKLIST ITEMS
DROP POLICY IF EXISTS "Users can CRUD own inspection_checklist_items" ON inspection_checklist_items;
CREATE POLICY "Users can CRUD own inspection_checklist_items" ON inspection_checklist_items USING (auth.uid() = user_id);

-- APPROVAL REQUESTS
DROP POLICY IF EXISTS "Users can CRUD own approval_requests" ON approval_requests;
CREATE POLICY "Users can CRUD own approval_requests" ON approval_requests USING (auth.uid() = user_id);

-- Folders
DROP POLICY IF EXISTS "Users can CRUD own folders" ON folders;
CREATE POLICY "Users can CRUD own folders" ON folders USING (auth.uid() = user_id);

-- METER READINGS
DROP POLICY IF EXISTS "Users can CRUD own meter_readings" ON meter_readings;
CREATE POLICY "Users can CRUD own meter_readings" ON meter_readings USING (auth.uid() = user_id);

-- INVENTORY CHECKS
DROP POLICY IF EXISTS "Users can CRUD own inventory_checks" ON inventory_checks;
CREATE POLICY "Users can CRUD own inventory_checks" ON inventory_checks USING (auth.uid() = user_id);

-- DOCUMENT TEMPLATES
DROP POLICY IF EXISTS "Users can CRUD own document_templates" ON document_templates;
CREATE POLICY "Users can CRUD own document_templates" ON document_templates USING (auth.uid() = user_id);

-- PAYMENT LINKS
DROP POLICY IF EXISTS "Users can CRUD own payment_links" ON payment_links;
CREATE POLICY "Users can CRUD own payment_links" ON payment_links USING (auth.uid() = user_id);

-- CHAT SESSIONS
DROP POLICY IF EXISTS "Users can CRUD own chat_sessions" ON chat_sessions;
CREATE POLICY "Users can CRUD own chat_sessions" ON chat_sessions USING (auth.uid() = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can CRUD own notifications" ON notifications;
CREATE POLICY "Users can CRUD own notifications" ON notifications USING (auth.uid() = user_id);

-- USER PROFILES (Strict)
DROP POLICY IF EXISTS "Users can CRUD own profile" ON user_profiles;
CREATE POLICY "Users can CRUD own profile" ON user_profiles USING (auth.uid() = id);

-- 5. Helper Function to auto-assign user_id on insert
CREATE OR REPLACE FUNCTION public.handle_new_user_row()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. apply Triggers to All Tables
-- Properties
DROP TRIGGER IF EXISTS on_property_insert ON properties;
CREATE TRIGGER on_property_insert BEFORE INSERT ON properties FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Tenants
DROP TRIGGER IF EXISTS on_tenant_insert ON tenants;
CREATE TRIGGER on_tenant_insert BEFORE INSERT ON tenants FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Landlords
DROP TRIGGER IF EXISTS on_landlord_insert ON landlords;
CREATE TRIGGER on_landlord_insert BEFORE INSERT ON landlords FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Maintenance Requests
DROP TRIGGER IF EXISTS on_maintenance_insert ON maintenance_requests;
CREATE TRIGGER on_maintenance_insert BEFORE INSERT ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Reminders
DROP TRIGGER IF EXISTS on_reminder_insert ON reminders;
CREATE TRIGGER on_reminder_insert BEFORE INSERT ON reminders FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Documents
DROP TRIGGER IF EXISTS on_document_insert ON documents;
CREATE TRIGGER on_document_insert BEFORE INSERT ON documents FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Communication Logs
DROP TRIGGER IF EXISTS on_comm_log_insert ON communication_logs;
CREATE TRIGGER on_comm_log_insert BEFORE INSERT ON communication_logs FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Bank Accounts
DROP TRIGGER IF EXISTS on_bank_account_insert ON bank_accounts;
CREATE TRIGGER on_bank_account_insert BEFORE INSERT ON bank_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Rent Payments
DROP TRIGGER IF EXISTS on_rent_payment_insert ON rent_payments;
CREATE TRIGGER on_rent_payment_insert BEFORE INSERT ON rent_payments FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Expenses
DROP TRIGGER IF EXISTS on_expense_insert ON expenses;
CREATE TRIGGER on_expense_insert BEFORE INSERT ON expenses FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Recurring Payments
DROP TRIGGER IF EXISTS on_recurring_payment_insert ON recurring_payments;
CREATE TRIGGER on_recurring_payment_insert BEFORE INSERT ON recurring_payments FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- SLAs
DROP TRIGGER IF EXISTS on_sla_insert ON slas;
CREATE TRIGGER on_sla_insert BEFORE INSERT ON slas FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Automation Workflows
DROP TRIGGER IF EXISTS on_workflow_insert ON automation_workflows;
CREATE TRIGGER on_workflow_insert BEFORE INSERT ON automation_workflows FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Dori Interactions
DROP TRIGGER IF EXISTS on_dori_interaction_insert ON dori_interactions;
CREATE TRIGGER on_dori_interaction_insert BEFORE INSERT ON dori_interactions FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Dori Actions
DROP TRIGGER IF EXISTS on_dori_action_insert ON dori_actions;
CREATE TRIGGER on_dori_action_insert BEFORE INSERT ON dori_actions FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Emergencies
DROP TRIGGER IF EXISTS on_emergency_insert ON emergencies;
CREATE TRIGGER on_emergency_insert BEFORE INSERT ON emergencies FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Tasks
DROP TRIGGER IF EXISTS on_task_insert ON tasks;
CREATE TRIGGER on_task_insert BEFORE INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Vacancies
DROP TRIGGER IF EXISTS on_vacancy_insert ON vacancies;
CREATE TRIGGER on_vacancy_insert BEFORE INSERT ON vacancies FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Applicants
DROP TRIGGER IF EXISTS on_applicant_insert ON applicants;
CREATE TRIGGER on_applicant_insert BEFORE INSERT ON applicants FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Inspections
DROP TRIGGER IF EXISTS on_inspection_insert ON inspections;
CREATE TRIGGER on_inspection_insert BEFORE INSERT ON inspections FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Inspection Checklist Items
DROP TRIGGER IF EXISTS on_checklist_item_insert ON inspection_checklist_items;
CREATE TRIGGER on_checklist_item_insert BEFORE INSERT ON inspection_checklist_items FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Approval Requests
DROP TRIGGER IF EXISTS on_approval_request_insert ON approval_requests;
CREATE TRIGGER on_approval_request_insert BEFORE INSERT ON approval_requests FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Folders
DROP TRIGGER IF EXISTS on_folder_insert ON folders;
CREATE TRIGGER on_folder_insert BEFORE INSERT ON folders FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Meter Readings
DROP TRIGGER IF EXISTS on_meter_reading_insert ON meter_readings;
CREATE TRIGGER on_meter_reading_insert BEFORE INSERT ON meter_readings FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Inventory Checks
DROP TRIGGER IF EXISTS on_inventory_check_insert ON inventory_checks;
CREATE TRIGGER on_inventory_check_insert BEFORE INSERT ON inventory_checks FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Document Templates
DROP TRIGGER IF EXISTS on_doc_template_insert ON document_templates;
CREATE TRIGGER on_doc_template_insert BEFORE INSERT ON document_templates FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Payment Links
DROP TRIGGER IF EXISTS on_payment_link_insert ON payment_links;
CREATE TRIGGER on_payment_link_insert BEFORE INSERT ON payment_links FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Chat Sessions
DROP TRIGGER IF EXISTS on_chat_session_insert ON chat_sessions;
CREATE TRIGGER on_chat_session_insert BEFORE INSERT ON chat_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();

-- Notifications
DROP TRIGGER IF EXISTS on_notification_insert ON notifications;
CREATE TRIGGER on_notification_insert BEFORE INSERT ON notifications FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_row();
