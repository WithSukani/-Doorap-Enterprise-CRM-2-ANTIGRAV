
import { 
    PropertyType, MaintenanceStatus, MaintenancePriority, DocumentType, CommunicationType, NotificationType, ExpenseCategory, TaskStatus,
    DocumentParentType, CommunicationLogParentType, NotificationParentType, Landlord, ApprovalRequest, Property, MeterReading, InventoryCheck, Tenant, ChatSession,
    DoriInteraction, DoriAction, AutomationWorkflow, EmergencyItem, DoriExecution, TeamMember
} from './types';

export const APP_NAME = "Doorap";

export const INITIAL_PROPERTIES: Property[] = [
  { id: 'prop1', address: '123 Main St, Anytown', postcode: 'AT1 2BC', type: PropertyType.HOUSE, ownerName: 'John Doe', purchaseDate: '2020-01-15', value: 250000, imageUrl: 'https://picsum.photos/seed/prop1/600/400', notes: 'Recently renovated kitchen.', managementFeeType: 'Percentage', managementFeeValue: 10 },
  { id: 'prop2', address: 'Apt 4B, 456 Oak Rd, Metrocity', postcode: 'MC2 3DE', type: PropertyType.APARTMENT, ownerName: 'Jane Smith', purchaseDate: '2018-06-10', value: 180000, imageUrl: 'https://picsum.photos/seed/prop2/600/400', notes: 'Top floor unit with city views.', managementFeeType: 'Percentage', managementFeeValue: 12 },
  { id: 'prop3', address: 'Unit 7, Business Park, Workville', postcode: 'WV3 4FG', type: PropertyType.COMMERCIAL, ownerName: 'Biz Corp', purchaseDate: '2019-03-22', value: 500000, imageUrl: 'https://picsum.photos/seed/prop3/600/400', managementFeeType: 'Fixed', managementFeeValue: 250 },
  { id: 'prop4', address: 'Elm House, Student Village', postcode: 'SV4 5GH', type: PropertyType.STUDENT_ACCOM, ownerName: 'University Homes', purchaseDate: '2021-08-01', value: 1200000, imageUrl: 'https://picsum.photos/seed/prop4/600/400', notes: 'Shared student housing.', managementFeeType: 'Percentage', managementFeeValue: 15 },
];

export const INITIAL_LANDLORDS: Landlord[] = [
  {
    id: 'll1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '07700 900123',
    address: '10 Downing St, London, SW1A 2AA',
    status: 'Active',
    portalAccess: true,
    sentiment: 'Happy',
    lastInteractionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'll2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '07700 900456',
    address: '221B Baker St, London, NW1 6XE',
    status: 'Active',
    portalAccess: false,
    sentiment: 'Neutral',
    lastInteractionDate: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'll3',
    name: 'Biz Corp',
    email: 'admin@bizcorp.com',
    phone: '020 7946 0000',
    address: 'Canary Wharf, London, E14 5AB',
    status: 'Active',
    portalAccess: true,
    sentiment: 'Happy',
    lastInteractionDate: new Date().toISOString(),
  },
  {
    id: 'll4',
    name: 'University Homes',
    email: 'accom@university.ac.uk',
    phone: '020 7946 0001',
    address: 'University Campus, Oxford, OX1 1AA',
    status: 'Active',
    portalAccess: true,
    sentiment: 'Unhappy',
    lastInteractionDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: 'Concerned about recent maintenance costs.'
  }
];

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

export const INITIAL_TENANTS: Tenant[] = [
  { id: 'ten1', propertyId: 'prop1', name: 'Alice Wonderland', email: 'alice@example.com', phone: '555-1234', leaseStartDate: '2023-02-01', leaseEndDate: '2024-08-31', rentAmount: 1200, securityDeposit: 1500, depositStatus: 'Registered', notes: 'Quiet tenant, always pays on time.' },
  { id: 'ten2', propertyId: 'prop2', name: 'Bob The Builder', email: 'bob@example.com', phone: '555-5678', leaseStartDate: '2022-07-15', leaseEndDate: '2024-07-14', rentAmount: 950, securityDeposit: 1000, depositStatus: 'Registered' },
  { id: 'ten3', propertyId: 'prop1', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-8765', leaseStartDate: '2023-05-01', rentAmount: 1150, securityDeposit: 1150, depositStatus: 'Pending', notes: 'Has a small dog.' },
];

export const INITIAL_MAINTENANCE_REQUESTS = [
  { id: 'maint1', propertyId: 'prop1', tenantId: 'ten1', issueTitle: 'Leaky Faucet in Kitchen', description: 'The kitchen faucet has been dripping constantly for the past two days.', reportedDate: '2023-10-26', status: MaintenanceStatus.NEW, priority: MaintenancePriority.MEDIUM, assignedProvider: 'PlumbPerfect Inc.', marketplaceJobId: 'MP1001' },
  { id: 'maint2', propertyId: 'prop2', issueTitle: 'Broken Window Pane', description: 'A window pane in the living room was accidentally broken.', reportedDate: '2023-10-28', status: MaintenanceStatus.PENDING_QUOTE, priority: MaintenancePriority.HIGH, notes: 'Needs urgent repair for security.' },
  { id: 'maint3', propertyId: 'prop1', tenantId: 'ten3', issueTitle: 'Boiler Not Working', description: 'The central heating boiler is not producing hot water or heating.', reportedDate: '2023-11-01', status: MaintenanceStatus.IN_PROGRESS, priority: MaintenancePriority.URGENT, assignedProvider: 'HeatPro Ltd.', quoteAmount: 250, serviceBooked: true },
];

const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
const threeMonthsFromNow = new Date();
threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);


export const INITIAL_REMINDERS = [
  { id: 'rem1', propertyId: 'prop1', task: 'Annual Gas Safety Check', dueDate: '2024-09-15', frequency: 'Annually', isCompleted: false, notes: 'Certificate renewal required.' },
  { id: 'rem2', propertyId: 'prop2', task: 'PAT Testing for Appliances', dueDate: oneMonthAgo.toISOString().split('T')[0], frequency: 'Annually', isCompleted: false, notes: 'This reminder is overdue.' }, // Overdue reminder
  { id: 'rem3', propertyId: 'prop3', task: 'Fire Alarm System Test', dueDate: '2023-12-01', frequency: 'Monthly', isCompleted: true, lastCompletedDate: '2023-11-01' },
];

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
export const INITIAL_RENT_PAYMENTS = [];
export const INITIAL_EXPENSES = [ // Example expense
    { id: 'exp1', propertyId: 'prop1', date: '2023-11-15', category: ExpenseCategory.REPAIRS_MAINTENANCE, description: 'Fix kitchen sink plumbing', amount: 120.50, vendor: 'PlumbPerfect Inc.'}
];
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
export const INITIAL_TASKS = [
    { id: 'task1', title: 'Follow up on overdue rent for Apt 4B', dueDate: new Date().toISOString().split('T')[0], status: TaskStatus.PENDING, priority: MaintenancePriority.HIGH, relatedToId: 'ten2', relatedToType: 'tenant' as 'tenant', createdAt: new Date().toISOString() }
];
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

export const INITIAL_DORI_LOGS: DoriInteraction[] = [
    {
        id: 'dori_1', type: 'Voice Call', direction: 'Inbound', contactName: 'Unknown (07700 900123)', contactRole: 'Lead',
        summary: 'Inquired about 2-bed flats in downtown. Scheduled viewing for Tuesday.',
        sentiment: 'Positive', timestamp: new Date().toISOString(), duration: '2m 14s', status: 'Completed',
        transcript: "Caller: Hi, I saw the listing for the apartment on High St.\nDori: Hello! Yes, that unit is available. Would you like to schedule a viewing?\nCaller: Yes please, is Tuesday good?\nDori: I have a slot at 2pm. Shall I book that?\nCaller: Perfect.",
        actionItems: ['Schedule Viewing', 'Send Confirmation SMS']
    },
    {
        id: 'dori_2', type: 'Voice Call', direction: 'Inbound', contactName: 'Alice Wonderland', contactRole: 'Tenant',
        summary: 'Reported a water leak in the bathroom. Classified as Urgent.',
        sentiment: 'Urgent', timestamp: new Date(Date.now() - 3600000).toISOString(), duration: '1m 05s', status: 'Completed',
        transcript: "Dori: Hello Alice, how can I help?\nAlice: There's water coming through the ceiling!\nDori: I understand this is urgent. I am contacting the emergency plumber immediately.",
        actionItems: ['Create Maintenance Request', 'Call PlumbPerfect Inc.']
    }
];

export const INITIAL_DORI_ACTIONS: DoriAction[] = [
    { id: 'act_1', title: 'Schedule Viewing', description: 'Book viewing for Lead (07700 900123) at 123 Main St on Tuesday 2pm.', type: 'Admin', status: 'Pending', confidenceScore: 98, suggestedAt: new Date().toISOString() },
    { id: 'act_2', title: 'Dispatch Plumber', description: 'Auto-assign PlumbPerfect to Unit 1 Leak.', type: 'Maintenance', status: 'Pending', confidenceScore: 95, suggestedAt: new Date(Date.now() - 3500000).toISOString() }
];

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
