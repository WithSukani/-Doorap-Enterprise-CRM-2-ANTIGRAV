
export const PropertyType = Object.freeze({
  APARTMENT: "Apartment",
  HOUSE: "House",
  COMMERCIAL: "Commercial",
  STUDENT_ACCOM: "Student Accommodation",
  CARE_HOME: "Care Home",
  BLOCK_APARTMENT: "Block Apartment",
  OTHER: "Other",
} as const);

export const MaintenanceStatus = Object.freeze({
  NEW: "New",
  ASSESSING: "Assessing",
  PENDING_QUOTE: "Pending Quote",
  QUOTE_RECEIVED: "Quote Received",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  PENDING_REVIEW: "Pending Review", // Used for Landlord Approval
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  INVOICED: "Invoiced",
  PAID: "Paid"
} as const);

export const MaintenancePriority = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
} as const);

export const DocumentType = Object.freeze({
  LEASE: "Lease Agreement",
  SAFETY_CERTIFICATE: "Safety Certificate",
  INVOICE: "Invoice",
  QUOTE: "Quote",
  PHOTO_VIDEO: "Photo/Video",
  TENANT_ID: "Tenant ID",
  PROPERTY_DEED: "Property Deed",
  INSPECTION_REPORT: "Inspection Report",
  FINANCIAL_STATEMENT: "Financial Statement",
  TEMPLATE: "Template",
  OTHER: "Other",
} as const);

export const CommunicationType = Object.freeze({
  EMAIL: "Email",
  PHONE_CALL: "Phone Call",
  SMS_MESSAGE: "SMS Message",
  IN_PERSON_MEETING: "In-Person Meeting",
  APP_MESSAGE: "App Message", // For future internal messaging
  NOTE: "General Note",
} as const);

export const NotificationType = Object.freeze({
  OVERDUE_REMINDER: "Overdue Reminder",
  LEASE_EXPIRY_SOON: "Lease Expiry Soon",
  NEW_URGENT_MAINTENANCE: "New Urgent Maintenance",
  RENT_PAYMENT_OVERDUE: "Rent Payment Overdue", // Future use
  SLA_BREACH_RISK: "SLA Breach Risk",
  DOCUMENT_EXPIRY_SOON: "Document Expiry Soon",
  TASK_DUE_SOON: "Task Due Soon", // Future use
  INSPECTION_SCHEDULED: "Inspection Scheduled", // Future use
  GENERAL_INFO: "General Info",
} as const);

export const TaskStatus = Object.freeze({
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled"
} as const);

export const VacancyStatus = Object.freeze({
  AVAILABLE: "Available",
  PENDING_APPLICATION: "Pending Application",
  LEASED: "Leased",
  UNAVAILABLE: "Unavailable"
} as const);

export const ApplicantStatus = Object.freeze({
  NEW: "New",
  VIEWED: "Viewed",
  CONTACTED: "Contacted",
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
  LEASE_SIGNED: "Lease Signed"
} as const);

export const InspectionStatus = Object.freeze({
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NEEDS_FOLLOW_UP: "Needs Follow-up"
} as const);

export const InspectionItemStatus = Object.freeze({
  PASS: "Pass",
  FAIL: "Fail",
  NA: "N/A", // Not Applicable
  NEEDS_REPAIR: "Needs Repair"
} as const);

export const ExpenseCategory = Object.freeze({
    REPAIRS_MAINTENANCE: "Repairs & Maintenance",
    UTILITIES: "Utilities",
    INSURANCE: "Insurance",
    MANAGEMENT_FEES: "Management Fees",
    PROPERTY_TAXES: "Property Taxes",
    MORTGAGE: "Mortgage",
    MARKETING: "Marketing",
    LEGAL_FEES: "Legal Fees",
    OTHER: "Other"
} as const);

export const CustomFieldType = Object.freeze({
    TEXT: "Text",
    TEXTAREA: "Textarea",
    NUMBER: "Number",
    DATE: "Date",
    CHECKBOX: "Checkbox",
    SELECT: "Select",
} as const);


// Data structure interfaces
export interface Property {
  id: string;
  address: string;
  postcode: string;
  type: (typeof PropertyType)[keyof typeof PropertyType];
  ownerName: string;
  purchaseDate?: string;
  value?: number;
  imageUrl?: string;
  notes?: string;
  customFieldValues?: Record<string, any>;
  managementFeeType?: 'Percentage' | 'Fixed';
  managementFeeValue?: number;
  isArchived?: boolean;
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  rentAmount?: number;
  securityDeposit?: number;
  depositStatus?: 'Registered' | 'Refunded' | 'Deducted' | 'Pending';
  depositScheme?: string;
  notes?: string;
  avatarUrl?: string;
  customFieldValues?: Record<string, any>;
  isArchived?: boolean;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId?: string;
  issueTitle: string;
  description: string;
  reportedDate: string; // ISO string
  status: (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];
  priority: (typeof MaintenancePriority)[keyof typeof MaintenancePriority];
  assignedProvider?: string;
  quoteAmount?: number;
  quoteUrl?: string;
  invoiceAmount?: number;
  invoiceUrl?: string;
  marketplaceJobId?: string;
  serviceBooked?: boolean;
  completionDate?: string; // ISO string
  notes?: string;
}

export interface Reminder {
  id: string;
  propertyId: string;
  task: string;
  dueDate: string; // ISO string date part
  frequency: 'One-time' | 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Annually' | string; // Allow string for flexibility or define as enum
  isCompleted: boolean;
  lastCompletedDate?: string; // ISO string date part
  notes?: string;
}

export interface SLA {
  id: string;
  name: string;
  description: string;
  priorityLevel: (typeof MaintenancePriority)[keyof typeof MaintenancePriority];
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  isActive: boolean;
}

export type DocumentParentType = 'property' | 'tenant' | 'maintenance_request' | 'inspection' | 'financial_transaction';
export interface Document {
  id: string;
  parentId: string;
  parentType: DocumentParentType;
  name: string;
  type: (typeof DocumentType)[keyof typeof DocumentType];
  uploadDate: string; // ISO string
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  notes?: string;
  expiryDate?: string; // New field
  templateId?: string; // Link to a DocumentTemplate
  content?: string; // For AI-generated document content
  folderId?: string; // New: For Documents Page
}

export interface Folder {
    id: string;
    name: string;
    type: 'system' | 'custom';
    icon?: string;
}

export type CommunicationLogParentType = 'property' | 'tenant' | 'maintenance_request' | 'applicant' | 'inspection';
export interface CommunicationLog {
  id: string;
  parentId: string;
  parentType: CommunicationLogParentType;
  date: string; // ISO string
  type: (typeof CommunicationType)[keyof typeof CommunicationType];
  summary: string;
  participants?: string[];
  notes?: string;
}

export interface UserProfile {
  name: string;
  companyName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  stripeConnectId?: string; // New: For Stripe Connect Integration
  stripeDataFeedEnabled?: boolean; // New
  stripePayoutsEnabled?: boolean; // New
}

export type NotificationParentType = 'reminder' | 'maintenance_request' | 'tenant' | 'document' | 'task' | 'inspection' | 'general';
export interface Notification {
  id: string;
  type: (typeof NotificationType)[keyof typeof NotificationType];
  message: string;
  date: string; // ISO string
  isRead: boolean;
  parentId?: string;
  parentType?: NotificationParentType;
  linkTo?: string;
}

// Chat related types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'support_admin' | 'tenant_simulated' | string;
  text: string;
  timestamp: string; // ISO string
  avatarUrl?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  lastActivity: string; // ISO string
  targetAvatarUrl?: string;
  unreadCount?: number;
}

// --- NEW TYPES ---

// Financials
export interface RentPayment {
  id: string;
  tenantId: string;
  propertyId: string;
  date: string; // ISO string date part
  amount: number;
  paymentMethod: string; // e.g., 'Bank Transfer', 'Cash', 'Card'
  notes?: string;
}

export interface Expense {
  id: string;
  propertyId: string;
  date: string; // ISO string date part
  category: (typeof ExpenseCategory)[keyof typeof ExpenseCategory];
  description: string;
  amount: number;
  vendor?: string;
  receiptUrl?: string; // Link to a document or uploaded receipt
  notes?: string;
}

export interface RecurringPayment {
    id: string;
    type: 'Direct Debit' | 'Standing Order';
    vendor: string;
    reference: string;
    amount: number;
    frequency: 'Monthly' | 'Quarterly' | 'Annually';
    nextDueDate: string;
    status: 'Active' | 'Paused' | 'Review Needed';
    propertyId?: string;
}

export interface PaymentLink {
    id: string;
    tenantId: string;
    amount: number;
    description: string;
    status: 'Open' | 'Paid' | 'Expired';
    createdAt: string;
    url: string;
}

// Document Templates
export interface DocumentTemplate {
  id: string;
  name: string;
  category: string; // e.g., 'Lease', 'Notice', 'Inspection'
  content: string; // Could be markdown, HTML, or structured JSON
}

// Tasks
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string date part
  assignedTo?: string; // User ID or name (for future multi-user)
  status: (typeof TaskStatus)[keyof typeof TaskStatus];
  priority: (typeof MaintenancePriority)[keyof typeof MaintenancePriority]; // Reuse priority
  relatedToId?: string; // ID of property, tenant, maintenance, etc.
  relatedToType?: 'property' | 'tenant' | 'maintenance_request' | 'inspection' | 'general';
  createdAt: string; // ISO string
  notes?: string;
}

// Vacancy Management
export interface PortalStatus {
    rightmove: 'Not Listed' | 'Pending' | 'Live' | 'Error';
    zoopla: 'Not Listed' | 'Pending' | 'Live' | 'Error';
    onthemarket: 'Not Listed' | 'Pending' | 'Live' | 'Error';
}

export interface Vacancy {
  id: string;
  propertyId: string;
  listingTitle: string;
  description?: string;
  rentAmount: number;
  availableDate: string; // ISO string date part
  status: (typeof VacancyStatus)[keyof typeof VacancyStatus];
  notes?: string;
  portalStatus?: PortalStatus;
}

export interface Applicant {
  id: string;
  vacancyId: string;
  name: string;
  email: string;
  phone: string;
  applicationDate: string; // ISO string
  status: (typeof ApplicantStatus)[keyof typeof ApplicantStatus];
  notes?: string;
}

// Inspections
export interface Inspection {
  id: string;
  propertyId: string;
  tenantId?: string; // Optional if property is vacant
  scheduledDate: string; // ISO string
  inspectionType: string; // e.g., 'Move-in', 'Move-out', 'Routine Quarterly'
  status: (typeof InspectionStatus)[keyof typeof InspectionStatus];
  summaryNotes?: string;
  inspectorName?: string;
}

export interface InspectionChecklistItem {
  id: string;
  inspectionId: string;
  itemName: string; // e.g., "Living Room Walls Condition"
  status: (typeof InspectionItemStatus)[keyof typeof InspectionItemStatus];
  notes?: string;
  photoUrl?: string; // Link to an uploaded photo document
}

// Landlords
export type LandlordStatus = 'Active' | 'Inactive' | 'Pending';

export interface Landlord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string; // Added address
  avatarUrl?: string;
  status: LandlordStatus;
  portalAccess: boolean; // New: Access to Client Portal
  sentiment: 'Happy' | 'Neutral' | 'Unhappy';
  lastInteractionDate: string; // ISO
  notes?: string;
  isArchived?: boolean;
  stripeConnectId?: string; // New: Connected Account ID
}

export interface ApprovalRequest {
  id: string;
  landlordId: string;
  type: 'Maintenance Quote' | 'Lease Renewal' | 'Compliance Certificate' | 'Other';
  title: string;
  description?: string;
  amount?: number;
  documentUrl?: string; // Link to quote/doc
  status: 'Sent' | 'Viewed' | 'Approved' | 'Rejected';
  sentDate: string; // ISO
  viewedDate?: string; // ISO
  actionDate?: string; // ISO
  notes?: string;
  maintenanceRequestId?: string; // Link back to maintenance request if applicable
}

// Team Members (Internal)
export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Property Manager' | 'Viewer' | 'Maintenance';
    status: 'Active' | 'Invited' | 'Deactivated';
    avatarUrl?: string;
    lastLogin?: string;
}

// Calendar Event (utility type for displaying various items on a calendar)
export interface CalendarEvent {
    id: string;
    title: string;
    start: string; // ISO Date string
    end?: string; // ISO Date string (optional for multi-day or timed events)
    type: 'reminder' | 'task' | 'lease_expiry' | 'document_expiry' | 'inspection';
    color?: string; // Optional color for event type
    link?: string; // Link to the item in the app
    data?: Reminder | Task | Tenant | Document | Inspection; // Original data object
}

export type CustomFieldEntityType = 'property' | 'tenant' | 'maintenance_request';

export interface CustomFieldDefinition {
  id: string;
  entityType: CustomFieldEntityType;
  name: string; // The key for the value, e.g., 'petPolicy'
  label: string; // The display name, e.g., 'Pet Policy'
  fieldType: (typeof CustomFieldType)[keyof typeof CustomFieldType];
  options?: string[]; // For 'Select' type
  placeholder?: string;
  isRequired: boolean;
}

export interface MarketAnalysis {
  estimatedSalePrice: number;
  estimatedAverageRent: number;
  estimatedYieldPercentage: number;
  rentComparisonPercentage?: number;
  marketTrendSummary: string;
  localMarketDemand: 'Low' | 'Medium' | 'High';
  averageTimeToLetDays: number;
  keyAmenities: string[];
  investmentSummary: string;
  areaAnalysis: string;
}

// --- Tenancy Lifecycle Types ---

export interface MeterReading {
    id: string;
    propertyId: string;
    type: 'Gas' | 'Electric' | 'Water';
    reading: number;
    date: string; // ISO Date
    photoUrl?: string;
    context: 'Move In' | 'Move Out' | 'Routine';
}

export interface InventoryItem {
    id: string;
    name: string; // e.g., "Living Room Walls"
    conditionCheckIn: string; // "Good, clean"
    photoCheckIn?: string;
    conditionCheckOut?: string;
    photoCheckOut?: string;
    aiAssessment?: 'Fair Wear' | 'Tenant Damage' | 'Landlord Responsibility';
    deductionAmount?: number;
}

export interface InventoryCheck {
    id: string;
    propertyId: string;
    tenantId: string;
    type: 'Check In' | 'Check Out';
    date: string;
    items: InventoryItem[];
}

// --- Dori AI Types ---
export interface DoriInteraction {
  id: string;
  type: 'Voice Call' | 'Chat' | 'Email';
  direction: 'Inbound' | 'Outbound';
  contactName: string;
  contactRole: 'Tenant' | 'Landlord' | 'Contractor' | 'Lead' | 'Unknown';
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Urgent';
  timestamp: string;
  duration?: string;
  transcript?: string;
  audioUrl?: string; // Mock URL
  status: 'Live' | 'Completed' | 'Missed';
  actionItems?: string[];
}

export interface DoriAction {
  id: string;
  title: string;
  description: string;
  type: 'Maintenance' | 'Communication' | 'Admin';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Executed';
  confidenceScore: number; // 0-100
  suggestedAt: string;
  relatedEntityId?: string;
}

export interface AutomationStep {
    id: string;
    type: 'action' | 'condition' | 'delay';
    description: string;
    config?: any;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: AutomationStep[];
  isActive: boolean;
  lastRun?: string;
}

export interface EmergencyItem {
    id: string;
    title: string;
    description: string;
    severity: 'Critical' | 'High';
    status: 'Open' | 'Resolved';
    timestamp: string;
    relatedId?: string;
}

export interface DoriExecutionStep {
    id: string;
    timestamp: string;
    description: string;
    status: 'Completed' | 'Pending' | 'Failed' | 'Skipped';
}

export interface DoriExecution {
    id: string;
    workflowName: string;
    entityName: string;
    entityRole: string;
    status: 'Running' | 'Completed' | 'Failed' | 'Waiting';
    startTime: string;
    steps: DoriExecutionStep[];
}

export interface EmailIntegrationSettings {
    provider: 'sendgrid';
    apiKey: string;
    fromName: string;
    fromEmail: string;
    isActive: boolean;
}

export interface PortalIntegrationSettings {
    rightmove: { isActive: boolean; branchId?: string; certificate?: string };
    zoopla: { isActive: boolean; branchId?: string; apiKey?: string };
}

export interface CrmData {
    properties: Property[];
    tenants: Tenant[];
    maintenanceRequests: MaintenanceRequest[];
    reminders: Reminder[];
    documents: Document[];
    communicationLogs: CommunicationLog[];
    rentPayments: RentPayment[];
    expenses: Expense[];
    tasks: Task[];
    vacancies: Vacancy[];
    applicants: Applicant[];
    inspections: Inspection[];
    userProfile: UserProfile;
    documentTemplates: DocumentTemplate[];
    customFieldDefinitions?: CustomFieldDefinition[];
    landlords?: Landlord[];
    meterReadings?: MeterReading[];
    inventoryChecks?: InventoryCheck[];
    teamMembers?: TeamMember[];
}
