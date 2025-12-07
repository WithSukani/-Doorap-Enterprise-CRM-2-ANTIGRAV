
import {
  PropertyType, MaintenanceStatus, MaintenancePriority, DocumentType, CommunicationType, NotificationType, ExpenseCategory, TaskStatus,
  DocumentParentType, CommunicationLogParentType, NotificationParentType, Landlord, ApprovalRequest, Property, MeterReading, InventoryCheck, Tenant, ChatSession,
  DoriInteraction, DoriAction, AutomationWorkflow, EmergencyItem, DoriExecution, TeamMember, RecurringPayment, PaymentLink, BankAccount
} from './types';

export const APP_NAME = "Doorap";

// TODO: Fetch from Supabase
export const INITIAL_PROPERTIES: Property[] = [];

// TODO: Fetch from Supabase
export const INITIAL_LANDLORDS: Landlord[] = [];

// TODO: Fetch from Supabase
export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm1', name: 'Alex Manager', email: 'alex.manager@propmax.com', role: 'Admin', status: 'Active', lastLogin: new Date().toISOString() },
  { id: 'tm2', name: 'Sarah Staff', email: 'sarah.staff@propmax.com', role: 'Property Manager', status: 'Active', lastLogin: new Date(Date.now() - 86400000).toISOString() },
  { id: 'tm3', name: 'Mike Maintenance', email: 'mike.m@propmax.com', role: 'Maintenance', status: 'Invited' },
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr1',
    landlordId: 'll2', // Jane Smith
    type: 'Maintenance Quote',
    title: 'Boiler Repair - Quote #102',
    description: 'Replacement of heat exchanger for Apt 4B.',
    amount: 450,
    status: 'Sent',
    sentDate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'appr2',
    landlordId: 'll1', // John Doe
    type: 'Lease Renewal',
    title: 'Lease Renewal - 123 Main St',
    description: 'Renewal for 12 months at £1250/mo for Alice Wonderland.',
    status: 'Approved',
    sentDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    viewedDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    actionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'appr3',
    landlordId: 'll4', // University Homes
    type: 'Compliance Certificate',
    title: 'HMO License Renewal',
    amount: 850,
    status: 'Viewed',
    sentDate: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    viewedDate: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
  }
];

// TODO: Fetch from Supabase
export const INITIAL_TENANTS: Tenant[] = [];

// TODO: Fetch from Supabase
export const INITIAL_MAINTENANCE_REQUESTS = [];

const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
const threeMonthsFromNow = new Date();
threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);


// TODO: Fetch from Supabase
export const INITIAL_REMINDERS = [];

export const INITIAL_SLAS = [
  { id: 'sla1', name: 'Urgent Repairs SLA', description: 'For issues classified as Urgent.', priorityLevel: MaintenancePriority.URGENT, responseTimeHours: 2, resolutionTimeHours: 24, isActive: true },
  { id: 'sla2', name: 'High Priority SLA', description: 'For High priority issues.', priorityLevel: MaintenancePriority.HIGH, responseTimeHours: 4, resolutionTimeHours: 48, isActive: true },
  { id: 'sla3', name: 'Standard Maintenance SLA', description: 'For Medium and Low priority issues.', priorityLevel: MaintenancePriority.MEDIUM, responseTimeHours: 24, resolutionTimeHours: 120, isActive: false },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'plan1',
    name: 'Essential Manager',
    priceDisplay: '£279',
    pricePerMonth: 279,
    features: ['Up to 50 Properties', 'Core CRM Features', 'Maintenance Tracking', 'Tenant Management', 'Basic Reminders', 'Email Support'],
    cta: 'Choose Plan'
  },
  {
    id: 'plan2',
    name: 'Pro Portfolio',
    priceDisplay: '£499',
    pricePerMonth: 499,
    features: ['Up to 200 Properties', 'All Essential Features', 'Advanced Reminders & SLAs', 'Marketplace Integration Hooks', 'Reporting Dashboard', 'Priority Support', 'Document Management', 'Communication Logs', 'Basic Notifications', 'Basic Financials', 'Task Management'],
    cta: 'Choose Plan',
    highlight: true,
  },
  {
    id: 'plan3',
    name: 'Enterprise Suite',
    priceDisplay: 'Custom',
    features: ['Unlimited Properties', 'All Pro Features', 'Custom Integrations', 'Dedicated Account Manager', 'Bespoke SLA Configuration', 'API Access', 'Advanced Financials & Reporting', 'Vacancy Management', 'Inspections Module', 'Custom Fields', 'Document Templates'],
    cta: 'Contact Us'
  }
];

export const USER_PROFILE_DATA = {
  name: 'Alex Manager',
  companyName: 'PropertyMax Solutions',
  email: 'alex.manager@propmax.com',
  avatarUrl: 'https://picsum.photos/seed/useravatar/100/100',
  phone: '020 7946 0000'
};

export const INITIAL_DOCUMENTS = [
  { id: 'doc1', parentId: 'prop1', parentType: 'property' as DocumentParentType, name: 'Property Deed - 123 Main St', type: DocumentType.PROPERTY_DEED, uploadDate: '2020-01-10', fileName: 'deed_main_st.pdf', fileSize: '1.2MB', notes: 'Original copy.' },
  { id: 'doc2', parentId: 'ten1', parentType: 'tenant' as DocumentParentType, name: 'Alice Wonderland Lease', type: DocumentType.LEASE, uploadDate: '2023-01-20', fileUrl: '#mock-lease-alice', fileName: 'lease_alice.pdf', fileSize: '800KB', expiryDate: '2024-01-31' },
  { id: 'doc3', parentId: 'maint1', parentType: 'maintenance_request' as DocumentParentType, name: 'Kitchen Faucet Photo', type: DocumentType.PHOTO_VIDEO, uploadDate: '2023-10-26', fileUrl: '#mock-photo-faucet', fileName: 'faucet_leak.jpg', fileSize: '3.1MB', notes: 'Photo of the leak before repair.' },
  { id: 'doc4', parentId: 'prop1', parentType: 'property' as DocumentParentType, name: 'Gas Safety Cert 2023', type: DocumentType.SAFETY_CERTIFICATE, uploadDate: '2023-03-20', fileUrl: '#mock-gas-cert', fileName: 'gas_safety_2023_prop1.pdf', fileSize: '500KB', expiryDate: threeMonthsFromNow.toISOString().split('T')[0] }, // Expires in 3 months
];

export const INITIAL_COMMUNICATION_LOGS = [
  { id: 'comm1', parentId: 'ten1', parentType: 'tenant' as CommunicationLogParentType, date: '2023-10-25', type: CommunicationType.PHONE_CALL, summary: 'Tenant Alice reported leaky faucet.', participants: ['Alex Manager', 'Alice Wonderland'], notes: 'Advised tenant we will send someone.' },
  { id: 'comm2', parentId: 'maint1', parentType: 'maintenance_request' as CommunicationLogParentType, date: '2023-10-27', type: CommunicationType.EMAIL, summary: 'Sent confirmation to PlumbPerfect Inc. for faucet repair.', participants: ['Alex Manager', 'PlumbPerfect Inc.'], notes: 'Job MP1001 details sent.' },
  { id: 'comm3', parentId: 'prop2', parentType: 'property' as CommunicationLogParentType, date: '2023-11-05', type: CommunicationType.NOTE, summary: 'Conducted quarterly inspection.', participants: ['Alex Manager'] },
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'notif1', type: NotificationType.GENERAL_INFO, message: 'Welcome to Doorap! Explore the features.', date: new Date().toISOString(), isRead: true, parentType: 'general' as NotificationParentType },
];

// Initial empty arrays for new data types
// TODO: Fetch from Supabase
export const INITIAL_RENT_PAYMENTS = [];
// TODO: Fetch from Supabase
export const INITIAL_EXPENSES = [];
export const INITIAL_DOCUMENT_TEMPLATES = [
  {
    id: 'dtmpl_lease_1',
    name: 'Standard Residential Lease Agreement',
    category: 'Lease',
    content: `RESIDENTIAL LEASE AGREEMENT...`
  },
  {
    id: 'dtmpl_welcome_1',
    name: 'New Tenant Welcome Letter',
    category: 'Welcome',
    content: `Welcome to your new home!...`
  }
];
// TODO: Fetch from Supabase
export const INITIAL_TASKS = [];
export const INITIAL_VACANCIES = [];
export const INITIAL_APPLICANTS = [];
export const INITIAL_INSPECTIONS = [];
export const INITIAL_INSPECTION_CHECKLIST_ITEMS = [];

export const INITIAL_METER_READINGS: MeterReading[] = [
  { id: 'mr1', propertyId: 'prop1', type: 'Electric', reading: 12540, date: '2023-02-01', context: 'Move In' },
  { id: 'mr2', propertyId: 'prop1', type: 'Gas', reading: 8890, date: '2023-02-01', context: 'Move In' },
];

export const INITIAL_INVENTORY_CHECKS: InventoryCheck[] = [];

export const INITIAL_CHAT_SESSIONS: Record<string, ChatSession> = {
  'session_ten1': {
    id: 'session_ten1',
    name: 'Alice Wonderland',
    targetAvatarUrl: 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=indigo&color=fff',
    lastActivity: new Date().toISOString(),
    unreadCount: 1,
    messages: [
      {
        id: 'msg_1',
        sender: 'Alice Wonderland',
        text: 'Hi Alex, is the maintenance guy coming tomorrow?',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=indigo&color=fff'
      },
      {
        id: 'msg_2',
        sender: 'user',
        text: 'Yes, PlumbPerfect is scheduled for 10 AM. Does that work?',
        timestamp: new Date(Date.now() - 80000000).toISOString(),
      },
      {
        id: 'msg_3',
        sender: 'Alice Wonderland',
        text: 'Great, thanks! I will be home.',
        timestamp: new Date().toISOString(),
        avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=indigo&color=fff'
      }
    ]
  },
  'session_ll1': {
    id: 'session_ll1',
    name: 'John Doe',
    targetAvatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=0f172a&color=fff',
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: 'msg_ll1_1',
        sender: 'user',
        text: 'Hi John, I have uploaded the new gas certificate for 123 Main St.',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'msg_ll1_2',
        sender: 'John Doe',
        text: 'Thanks Alex. Also, did we approve the boiler repair?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=0f172a&color=fff'
      }
    ]
  },
  'session_prov1': {
    id: 'session_prov1',
    name: 'PlumbPerfect Inc.',
    targetAvatarUrl: 'https://ui-avatars.com/api/?name=Plumb+Perfect&background=orange&color=fff',
    lastActivity: new Date(Date.now() - 172800000).toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: 'msg_prov1_1',
        sender: 'PlumbPerfect Inc.',
        text: 'Quote sent for the leak at Flat 4.',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        avatarUrl: 'https://ui-avatars.com/api/?name=Plumb+Perfect&background=orange&color=fff'
      }
    ]
  }
};

// TODO: Fetch from Supabase
export const INITIAL_DORI_LOGS: DoriInteraction[] = [];

// TODO: Fetch from Supabase
export const INITIAL_DORI_ACTIONS: DoriAction[] = [];

export const INITIAL_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: 'wf_1',
    name: 'Urgent Maintenance Dispatch',
    trigger: 'Incoming Call',
    isActive: true,
    steps: [
      { id: 's1', type: 'condition', description: 'Keyword "Leak" or "Flood" detected' },
      { id: 's2', type: 'action', description: 'Create Urgent Maintenance Request' },
      { id: 's3', type: 'action', description: 'Call "PlumbPerfect Inc." (Preferred Contractor)' },
      { id: 's4', type: 'action', description: 'Notify Property Manager via SMS' }
    ]
  },
  {
    id: 'wf_2',
    name: 'Viewing Appointment Booking',
    trigger: 'Incoming Call / Message',
    isActive: true,
    steps: [
      { id: 's1', type: 'action', description: 'Extract Lead Details (Name, Contact, Budget)' },
      { id: 's2', type: 'action', description: 'Check PM Calendar Availability' },
      { id: 's3', type: 'condition', description: 'If Slot Available -> Book Appointment' },
      { id: 's4', type: 'action', description: 'Send Confirmation SMS to Lead' },
      { id: 's5', type: 'condition', description: 'If No Slot -> Send "Will callback" message' }
    ]
  },
  {
    id: 'wf_3',
    name: 'Tenant Move-Out Process',
    trigger: 'Lease End Date - 60 Days',
    isActive: true,
    steps: [
      { id: 's1', type: 'action', description: 'Email "Renewal or Vacate?" Notice to Tenant' },
      { id: 's2', type: 'delay', description: 'Wait 7 Days for Response' },
      { id: 's3', type: 'condition', description: 'If No Response -> Flag for PM Call' }
    ]
  },
];

export const INITIAL_EMERGENCIES: EmergencyItem[] = [
  {
    id: 'em_1',
    title: 'Gas Leak Reported',
    description: 'Tenant at 123 Main St reported smell of gas. Dori advised evacuation and called National Grid.',
    severity: 'Critical',
    status: 'Open',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_DORI_EXECUTIONS: DoriExecution[] = [
  {
    id: 'exec_1',
    workflowName: 'Urgent Maintenance Dispatch',
    entityName: 'John Doe',
    entityRole: 'Tenant',
    status: 'Running',
    startTime: new Date().toISOString(),
    steps: [
      { id: 's1', timestamp: new Date(Date.now() - 60000).toISOString(), description: 'Triggered by keyword "Leak"', status: 'Completed' },
      { id: 's2', timestamp: new Date(Date.now() - 30000).toISOString(), description: 'Created Maintenance Request #MR-102', status: 'Completed' },
      { id: 's3', timestamp: new Date().toISOString(), description: 'Calling PlumbPerfect Inc...', status: 'Pending' }
    ]
  },
  {
    id: 'exec_2',
    workflowName: 'Viewing Appointment',
    entityName: 'Sarah Connor',
    entityRole: 'Lead',
    status: 'Completed',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    steps: [
      { id: 's1', timestamp: new Date(Date.now() - 3600000).toISOString(), description: 'Call Received', status: 'Completed' },
      { id: 's2', timestamp: new Date(Date.now() - 3590000).toISOString(), description: 'Checked Calendar Availability', status: 'Completed' },
      { id: 's3', timestamp: new Date(Date.now() - 3580000).toISOString(), description: 'Booked Slot: Tuesday 2pm', status: 'Completed' },
      { id: 's4', timestamp: new Date(Date.now() - 3570000).toISOString(), description: 'Sent Confirmation SMS', status: 'Completed' }
    ]
  }
];

// TODO: Fetch from Supabase
export const INITIAL_RECURRING_PAYMENTS: RecurringPayment[] = [];

export const INITIAL_PAYMENT_LINKS: PaymentLink[] = [
  { id: 'pl_1', payerId: 'ten3', payerType: 'Tenant', amount: 50.00, description: 'Replacement Key Fee', status: 'Open', createdAt: new Date().toISOString(), url: 'https://buy.stripe.com/test_key_fee' }
];