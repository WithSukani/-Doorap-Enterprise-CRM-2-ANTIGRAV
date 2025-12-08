
import {
  PropertyType, MaintenanceStatus, MaintenancePriority, DocumentType, CommunicationType, NotificationType, ExpenseCategory, TaskStatus,
  DocumentParentType, CommunicationLogParentType, NotificationParentType, Landlord, ApprovalRequest, Property, MeterReading, InventoryCheck, Tenant, ChatSession,
  DoriInteraction, DoriAction, AutomationWorkflow, EmergencyItem, DoriExecution, TeamMember, RecurringPayment, PaymentLink, BankAccount
} from './types';

export const APP_NAME = "Doorap";

export const INITIAL_PROPERTIES: Property[] = [];
export const INITIAL_LANDLORDS: Landlord[] = [];
export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [];
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [];
export const INITIAL_APPROVALS: ApprovalRequest[] = [];
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_MAINTENANCE_REQUESTS = [];
export const INITIAL_REMINDERS = [];
export const INITIAL_SLAS = [];

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
  name: '',
  companyName: '',
  email: '',
  avatarUrl: '',
  phone: ''
};

export const INITIAL_DOCUMENTS = [];
export const INITIAL_COMMUNICATION_LOGS = [];
export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_RENT_PAYMENTS = [];
export const INITIAL_EXPENSES = [];
export const INITIAL_DOCUMENT_TEMPLATES = [];
export const INITIAL_TASKS = [];
export const INITIAL_VACANCIES = [];
export const INITIAL_APPLICANTS = [];
export const INITIAL_INSPECTIONS = [];
export const INITIAL_INSPECTION_CHECKLIST_ITEMS = [];

export const INITIAL_METER_READINGS: MeterReading[] = [];
export const INITIAL_INVENTORY_CHECKS: InventoryCheck[] = [];

export const INITIAL_CHAT_SESSIONS: Record<string, ChatSession> = {};

export const INITIAL_DORI_LOGS: DoriInteraction[] = [];
export const INITIAL_DORI_ACTIONS: DoriAction[] = [];

export const INITIAL_WORKFLOWS: AutomationWorkflow[] = [];

export const INITIAL_EMERGENCIES: EmergencyItem[] = [];

export const INITIAL_DORI_EXECUTIONS: DoriExecution[] = [];

export const INITIAL_RECURRING_PAYMENTS: RecurringPayment[] = [];

export const INITIAL_PAYMENT_LINKS: PaymentLink[] = [];

// Hardcoded System Configurations
export const GLOBAL_DORI_CONFIG = {
  phoneNumber: '+44 7700 900555', // Placeholder - Please update with your actual Twilio number
  agentId: 'agent_8501kbyzv7aweh18qqt270c43mkk',
  isActive: true
};

export const INITIAL_INTEGRATION_SETTINGS = [
  {
    provider: 'twilio',
    isActive: GLOBAL_DORI_CONFIG.isActive,
    phoneNumber: GLOBAL_DORI_CONFIG.phoneNumber,
    agentId: GLOBAL_DORI_CONFIG.agentId
  },
  {
    provider: 'sendgrid',
    isActive: false,
    apiKey: ''
  },
  {
    provider: 'gemini',
    isActive: true,
    apiKey: 'universal_key'
  }
];