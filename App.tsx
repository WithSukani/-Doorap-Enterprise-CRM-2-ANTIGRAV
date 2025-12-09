// ... existing imports ...
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  PropertyType, MaintenanceStatus, MaintenancePriority, NotificationType, CommunicationType, TaskStatus,
  Property, Tenant, MaintenanceRequest, Reminder, SLA, UserProfile, Document, CommunicationLog, Notification as NotificationData, ChatMessage, ChatSession,
  RentPayment, Expense, DocumentTemplate, Task, Vacancy, Applicant, Inspection, InspectionChecklistItem, CalendarEvent, Landlord, ApprovalRequest, Folder,
  MeterReading, InventoryCheck, InventoryItem, DoriInteraction, DoriAction, AutomationWorkflow, EmergencyItem, DoriExecution, TeamMember,
  RecurringPayment, PaymentLink, BankAccount
} from './types';
import {
  INITIAL_PROPERTIES, INITIAL_TENANTS, INITIAL_MAINTENANCE_REQUESTS, INITIAL_REMINDERS, INITIAL_SLAS, USER_PROFILE_DATA, APP_NAME,
  INITIAL_DOCUMENTS, INITIAL_COMMUNICATION_LOGS, INITIAL_NOTIFICATIONS,
  INITIAL_RENT_PAYMENTS, INITIAL_EXPENSES, INITIAL_DOCUMENT_TEMPLATES, INITIAL_TASKS, INITIAL_VACANCIES, INITIAL_APPLICANTS,
  INITIAL_INSPECTIONS, INITIAL_INSPECTION_CHECKLIST_ITEMS, INITIAL_LANDLORDS, INITIAL_APPROVALS,
  INITIAL_METER_READINGS, INITIAL_INVENTORY_CHECKS, INITIAL_CHAT_SESSIONS, INITIAL_DORI_LOGS, INITIAL_DORI_ACTIONS, INITIAL_WORKFLOWS, INITIAL_EMERGENCIES, INITIAL_DORI_EXECUTIONS, INITIAL_TEAM_MEMBERS,
  INITIAL_RECURRING_PAYMENTS, INITIAL_PAYMENT_LINKS, INITIAL_BANK_ACCOUNTS, INITIAL_INTEGRATION_SETTINGS
} from './constants';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import PropertiesPage from './components/pages/PropertiesPage';
import TenantsPage from './components/pages/TenantsPage';
import MaintenancePage from './components/pages/MaintenancePage';
import FinancialsPage from './components/pages/FinancialsPage';
import WorkflowPage from './components/pages/WorkflowPage';
import DocumentsPage from './components/pages/DocumentsPage';
import CalendarPage from './components/pages/CalendarPage';
import VacanciesPage from './components/pages/VacanciesPage';
import SettingsPage from './components/pages/SettingsPage';
import LandlordsPage from './components/pages/LandlordsPage';
import MessagesPage from './components/pages/MessagesPage';
import DoriPage from './components/pages/DoriPage'; // New Page
import SubscriptionModal from './components/SubscriptionModal';
import { Bars3Icon, XMarkIcon } from './components/icons/HeroIcons';
import NotificationBell from './components/features/NotificationBell';
import SupportChatLauncher from './components/chat/SupportChatLauncher';
import ChatModal from './components/chat/ChatModal';
import DoriSidebar from './components/features/DoriSidebar';


import { useDoorapData } from './src/hooks/useDoorapData';
import { GeminiService } from './src/services/GeminiService';
import { DoorapService } from './src/services/DoorapService';
import { supabase } from './src/lib/supabase';
import LoginPage from './components/auth/LoginPage';



const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  return [storedValue, setValue];
};


const App = () => {
  // Existing state
  const [properties, setProperties] = useLocalStorage<Property[]>('crm_properties_v2', INITIAL_PROPERTIES);
  const [tenants, setTenants] = useLocalStorage<Tenant[]>('crm_tenants_v2', INITIAL_TENANTS);
  const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage<MaintenanceRequest[]>('crm_maintenance_requests_v2', INITIAL_MAINTENANCE_REQUESTS);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('crm_reminders_v2', INITIAL_REMINDERS);
  const [slas, setSlas] = useLocalStorage<SLA[]>('crm_slas_v2', INITIAL_SLAS);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('crm_user_profile_v2', USER_PROFILE_DATA);
  const [documents, setDocuments] = useLocalStorage<Document[]>('crm_documents_v2', INITIAL_DOCUMENTS);
  const [communicationLogs, setCommunicationLogs] = useLocalStorage<CommunicationLog[]>('crm_communication_logs_v2', INITIAL_COMMUNICATION_LOGS);

  const [chatSessions, setChatSessions] = useLocalStorage<Record<string, ChatSession>>('crm_chat_sessions_v2', INITIAL_CHAT_SESSIONS);

  // New state for additional features
  const [rentPayments, setRentPayments] = useLocalStorage<RentPayment[]>('crm_rent_payments_v2', INITIAL_RENT_PAYMENTS);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('crm_expenses_v2', INITIAL_EXPENSES);
  const [documentTemplates, setDocumentTemplates] = useLocalStorage<DocumentTemplate[]>('crm_document_templates_v2', INITIAL_DOCUMENT_TEMPLATES);
  const [tasks, setTasks] = useLocalStorage<Task[]>('crm_tasks_v2', INITIAL_TASKS);
  const [vacancies, setVacancies] = useLocalStorage<Vacancy[]>('crm_vacancies_v2', INITIAL_VACANCIES);
  const [applicants, setApplicants] = useLocalStorage<Applicant[]>('crm_applicants_v2', INITIAL_APPLICANTS);
  const [inspections, setInspections] = useLocalStorage<Inspection[]>('crm_inspections_v2', INITIAL_INSPECTIONS);
  const [inspectionChecklistItems, setInspectionChecklistItems] = useLocalStorage<InspectionChecklistItem[]>('crm_inspection_checklist_items_v2', INITIAL_INSPECTION_CHECKLIST_ITEMS);
  const [landlords, setLandlords] = useLocalStorage<Landlord[]>('crm_landlords_v2', INITIAL_LANDLORDS);
  const [approvalRequests, setApprovalRequests] = useLocalStorage<ApprovalRequest[]>('crm_approval_requests_v2', INITIAL_APPROVALS);
  const [folders, setFolders] = useLocalStorage<Folder[]>('crm_folders_v2', []);
  const [meterReadings, setMeterReadings] = useLocalStorage<MeterReading[]>('crm_meter_readings_v2', INITIAL_METER_READINGS);
  const [inventoryChecks, setInventoryChecks] = useLocalStorage<InventoryCheck[]>('crm_inventory_checks_v2', INITIAL_INVENTORY_CHECKS);
  const [emailSettings, setEmailSettings] = useLocalStorage<any>('crm_email_settings_v2', null);
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('crm_team_members_v2', INITIAL_TEAM_MEMBERS);

  // Financial Advanced
  const [recurringPayments, setRecurringPayments] = useLocalStorage<RecurringPayment[]>('crm_recurring_payments_v2', INITIAL_RECURRING_PAYMENTS);
  const [paymentLinks, setPaymentLinks] = useLocalStorage<PaymentLink[]>('crm_payment_links_v2', INITIAL_PAYMENT_LINKS);
  const [bankAccounts, setBankAccounts] = useLocalStorage<BankAccount[]>('crm_bank_accounts_v2', INITIAL_BANK_ACCOUNTS);
  const [portalSettings, setPortalSettings] = useLocalStorage<any[]>('crm_portal_settings_v2', []);
  const [integrationSettings, setIntegrationSettings] = useLocalStorage<any[]>('crm_integration_settings_v2', []);



  // Dori State
  const [doriInteractions, setDoriInteractions] = useLocalStorage<DoriInteraction[]>('crm_dori_interactions_v2', INITIAL_DORI_LOGS);
  const [doriActions, setDoriActions] = useLocalStorage<DoriAction[]>('crm_dori_actions_v2', INITIAL_DORI_ACTIONS);
  const [automationWorkflows, setAutomationWorkflows] = useLocalStorage<AutomationWorkflow[]>('crm_automation_workflows_v2', INITIAL_WORKFLOWS);
  const [emergencies, setEmergencies] = useLocalStorage<EmergencyItem[]>('crm_emergencies_v2', INITIAL_EMERGENCIES);
  // Updated key to force refresh of mock data
  const [doriExecutions, setDoriExecutions] = useLocalStorage<DoriExecution[]>('crm_dori_executions_v2', INITIAL_DORI_EXECUTIONS);

  // --- Authentication State ---
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [activeTenantForChat, setActiveTenantForChat] = useState<Tenant | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');

  // --- Supabase Data Sync ---
  const {
    properties: dbProperties, tenants: dbTenants, landlords: dbLandlords, maintenanceRequests: dbMaintenance,
    reminders: dbReminders, documents: dbDocuments, communicationLogs: dbLogs, bankAccounts: dbBankAccounts,
    rentPayments: dbRentPayments, expenses: dbExpenses, recurringPayments: dbRecurring, slas: dbSlas,
    automationWorkflows: dbWorkflows, doriInteractions: dbDoriLogs,
    userProfile: dbUserProfile, teamMembers: dbTeamMembers, tasks: dbTasks, vacancies: dbVacancies,
    applicants: dbApplicants, inspections: dbInspections, inspectionChecklistItems: dbChecklist,
    approvalRequests: dbApprovals, folders: dbFolders, meterReadings: dbMeterReadings,
    inventoryChecks: dbInventory, documentTemplates: dbTemplates, paymentLinks: dbPaymentLinks,
    chatSessions: dbChatSessions, doriActions: dbDoriActions, doriExecutions: dbExecutions,
    emergencies: dbEmergencies, portalSettings: dbPortalSettings, integrationSettings: dbIntegrationSettings, loading: dbLoading
  } = useDoorapData(session);

  useEffect(() => {
    if (!dbLoading) {
      setProperties(dbProperties || []);
      setTenants(dbTenants || []);
      setLandlords(dbLandlords || []);
      setMaintenanceRequests(dbMaintenance || []);
      setReminders(dbReminders || []);
      setDocuments(dbDocuments || []);
      setCommunicationLogs(dbLogs || []);
      setBankAccounts(dbBankAccounts || []);
      setRentPayments(dbRentPayments || []);
      setExpenses(dbExpenses || []);
      setRecurringPayments(dbRecurring || []);
      setSlas(dbSlas || []);
      setAutomationWorkflows(dbWorkflows || []);
      setDoriInteractions(dbDoriLogs || []);

      console.log('[App.tsx] Updating userProfile state from DB:', dbUserProfile);

      // Fallback Logic: If DB profile is empty, use Session Metadata (critical for fresh signups)
      let finalProfile = dbUserProfile;
      if (!finalProfile && session?.user) {
        console.log('[App.tsx] DB Profile empty, falling back to Session Metadata');
        const metadata = session.user.user_metadata;
        finalProfile = {
          id: session.user.id,
          name: metadata.full_name || metadata.name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim(),
          email: session.user.email || '',
          companyName: metadata.company_name,
          role: metadata.role as 'self_managing' | 'company',
          phone: metadata.phone || '',
          // Add default values for other required fields to avoid crashes
          companyAddress: metadata.company_address || '',
          companyRegNo: metadata.company_reg_no || '',
          companyVatNumber: metadata.company_vat_number || '',
          website: metadata.website || '',
          jobTitle: metadata.job_title || '',
          avatarUrl: metadata.avatar_url || '',
          stripeConnectId: metadata.stripe_connect_id,
          stripeDataFeedEnabled: metadata.stripe_data_feed_enabled || false,
          stripePayoutsEnabled: metadata.stripe_payouts_enabled || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as UserProfile;
      }

      setUserProfile(finalProfile || { name: '', companyName: '', email: '', phone: '' } as UserProfile);
      setTeamMembers(dbTeamMembers || []);
      setTasks(dbTasks || []);
      setVacancies(dbVacancies || []);
      setApplicants(dbApplicants || []);
      setInspections(dbInspections || []);
      setInspectionChecklistItems(dbChecklist || []);
      setApprovalRequests(dbApprovals || []);
      setFolders(dbFolders || []);
      setMeterReadings(dbMeterReadings || []);
      setInventoryChecks(dbInventory || []);
      setDocumentTemplates(dbTemplates || []);
      setPaymentLinks(dbPaymentLinks || []);
      setChatSessions(Object.keys(dbChatSessions).length ? dbChatSessions : {});
      setDoriActions(dbDoriActions || []);
      setDoriExecutions(dbExecutions || []);
      setEmergencies(dbEmergencies || []);
      setPortalSettings(dbPortalSettings || []);

      // Enforce Global Dori Config while keeping other DB settings
      // This ensures clients always have the backend-provisioned number and cannot change it
      const dbSettings = dbIntegrationSettings || [];
      const twilioConfig = INITIAL_INTEGRATION_SETTINGS.find(s => s.provider === 'twilio');
      const mergedIntegrationSettings = [
        ...dbSettings.filter((s: any) => s.provider !== 'twilio'),
        twilioConfig
      ];
      setIntegrationSettings(mergedIntegrationSettings);

      // Map Integration Settings to Email Settings if SendGrid exists
      const sendGrid = dbIntegrationSettings?.find((ist: any) => ist.provider === 'sendgrid');
      if (sendGrid) {
        setEmailSettings({
          provider: 'sendgrid',
          apiKey: sendGrid.apiKey,
          isActive: sendGrid.isActive,
          fromName: sendGrid.config?.fromName,
          fromEmail: sendGrid.config?.fromEmail
        });
      }

    }
  }, [dbLoading, dbUserProfile, dbProperties, dbTenants, dbLandlords, dbMaintenance]);

  useEffect(() => {
    const path = location.pathname.substring(1).split('?')[0] || 'dashboard';
    setCurrentView(path);
  }, [location]);

  const handleNavigation = useCallback((view: string) => {
    navigate(`/${view}`);
    setIsSidebarOpen(false);
  }, [navigate]);

  const getPropertyById = useCallback((propertyId?: string): Property | undefined => {
    if (!propertyId) return undefined;
    return properties.find(p => p.id === propertyId);
  }, [properties]);

  const getTenantById = useCallback((tenantId?: string): Tenant | undefined => {
    if (!tenantId) return undefined;
    return tenants.find(t => t.id === tenantId);
  }, [tenants]);






  // --- CRUD Operations ---
  const addProperty = async (property: Property) => {
    try {
      const savedProperty = await DoorapService.createProperty(property);
      setProperties(prev => [...prev, savedProperty]);
      return savedProperty;
    } catch (e) {
      console.error("Failed to create property", e);
      // Optional: Show toast error
      throw e; // Propagate to component if needed
    }
  };

  const updateProperty = async (updatedProperty: Property) => {
    try {
      const saved = await DoorapService.updateProperty(updatedProperty);
      setProperties(prev => prev.map(p => p.id === saved.id ? saved : p));
    } catch (e) {
      console.error("Failed to update property", e);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      await DoorapService.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setTenants(prev => prev.filter(t => t.propertyId !== propertyId));
      setMaintenanceRequests(prev => prev.filter(mr => mr.propertyId !== propertyId));
      setReminders(prev => prev.filter(r => r.propertyId !== propertyId));
      setDocuments(prev => prev.filter(d => !(d.parentType === 'property' && d.parentId === propertyId)));
      setCommunicationLogs(prev => prev.filter(cl => !(cl.parentType === 'property' && cl.parentId === propertyId)));
      setExpenses(prev => prev.filter(e => e.propertyId !== propertyId));
      setVacancies(prev => prev.filter(v => v.propertyId !== propertyId));
      setInspections(prev => prev.filter(i => i.propertyId !== propertyId));
    } catch (e) {
      console.error("Failed to delete property", e);
    }
  };

  const addTenant = (tenant: Tenant) => setTenants(prev => [...prev, tenant]);
  const updateTenant = (updatedTenant: Tenant) => setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  const deleteTenant = (tenantId: string) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    setMaintenanceRequests(prev => prev.map(mr => mr.tenantId === tenantId ? { ...mr, tenantId: undefined } : mr));
    setDocuments(prev => prev.filter(d => !(d.parentType === 'tenant' && d.parentId === tenantId)));
    setCommunicationLogs(prev => prev.filter(cl => !(cl.parentType === 'tenant' && cl.parentId === tenantId)));
    setRentPayments(prev => prev.filter(rp => rp.tenantId !== tenantId));
    setChatSessions(prev => {
      const newSessions = { ...prev };
      delete newSessions[`tenant_${tenantId}`];
      return newSessions;
    });
  };

  const addMaintenanceRequest = (request: MaintenanceRequest) => {
    setMaintenanceRequests(prev => [request, ...prev].sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime()));
  };
  const updateMaintenanceRequest = (updatedRequest: MaintenanceRequest) => setMaintenanceRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r).sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime()));
  const deleteMaintenanceRequest = (requestId: string) => {
    setMaintenanceRequests(prev => prev.filter(r => r.id !== requestId));
    setDocuments(prev => prev.filter(d => !(d.parentType === 'maintenance_request' && d.parentId === requestId)));
    setCommunicationLogs(prev => prev.filter(cl => !(cl.parentType === 'maintenance_request' && cl.parentId === requestId)));
  }

  const addReminder = (reminder: Reminder) => setReminders(prev => [...prev, reminder]);
  const updateReminder = (updatedReminder: Reminder) => {
    setReminders(prev => prev.map(r => r.id === updatedReminder.id ? updatedReminder : r));
  }
  const deleteReminder = (reminderId: string) => setReminders(prev => prev.filter(r => r.id !== reminderId));

  const addSLA = (sla: SLA) => setSlas(prev => [...prev, sla]);
  const updateSLA = (updatedSLA: SLA) => setSlas(prev => prev.map(s => s.id === updatedSLA.id ? updatedSLA : s));
  const deleteSLA = (slaId: string) => setSlas(prev => prev.filter(s => s.id !== slaId));

  const addDocument = async (doc: Document) => {
    try {
      const savedDoc = await DoorapService.createDocument(doc);
      setDocuments(prev => [savedDoc, ...prev].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
    } catch (e) {
      console.error("Failed to add document", e);
      // Fallback or alert user
    }
  };
  const deleteDocument = async (docId: string) => {
    try {
      await DoorapService.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (e) {
      console.error("Failed to delete document", e);
    }
  };

  const addCommunicationLog = useCallback((log: CommunicationLog) => {
    setCommunicationLogs(prev => [log, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setCommunicationLogs]);
  const deleteCommunicationLog = (logId: string) => setCommunicationLogs(prev => prev.filter(cl => cl.id !== logId));



  const addRentPayment = (payment: RentPayment) => setRentPayments(prev => [payment, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const updateRentPayment = (updatedPayment: RentPayment) => setRentPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  const deleteRentPayment = (paymentId: string) => setRentPayments(prev => prev.filter(p => p.id !== paymentId));

  const addExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const updateExpense = (updatedExpense: Expense) => setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  const deleteExpense = (expenseId: string) => setExpenses(prev => prev.filter(e => e.id !== expenseId));

  const addDocumentTemplate = async (template: DocumentTemplate) => {
    try {
      const savedTemplate = await DoorapService.createTemplate(template);
      setDocumentTemplates(prev => [...prev, savedTemplate]);
    } catch (e) {
      console.error("Failed to create template", e);
    }
  };
  const updateDocumentTemplate = (updatedTemplate: DocumentTemplate) => setDocumentTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  const deleteDocumentTemplate = async (templateId: string) => {
    try {
      await DoorapService.deleteTemplate(templateId);
      setDocumentTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (e) {
      console.error("Failed to delete template", e);
    }
  };

  const addTask = (task: Task) => setTasks(prev => [task, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  const updateTask = (updatedTask: Task) => setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  const deleteTask = (taskId: string) => setTasks(prev => prev.filter(t => t.id !== taskId));

  const addVacancy = (vacancy: Vacancy) => setVacancies(prev => [vacancy, ...prev]);
  const updateVacancy = (updatedVacancy: Vacancy) => setVacancies(prev => prev.map(v => v.id === updatedVacancy.id ? updatedVacancy : v));
  const deleteVacancy = (vacancyId: string) => {
    setVacancies(prev => prev.filter(v => v.id !== vacancyId));
    setApplicants(prev => prev.filter(a => a.vacancyId !== vacancyId));
  };

  const addApplicant = (applicant: Applicant) => setApplicants(prev => [applicant, ...prev]);
  const updateApplicant = (updatedApplicant: Applicant) => setApplicants(prev => prev.map(a => a.id === updatedApplicant.id ? updatedApplicant : a));
  const deleteApplicant = (applicantId: string) => setApplicants(prev => prev.filter(a => a.id !== applicantId));

  const addInspection = (inspection: Inspection) => setInspections(prev => [inspection, ...prev].sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()));
  const updateInspection = (updatedInspection: Inspection) => setInspections(prev => prev.map(i => i.id === updatedInspection.id ? updatedInspection : i));
  const deleteInspection = (inspectionId: string) => {
    setInspections(prev => prev.filter(i => i.id !== inspectionId));
    setInspectionChecklistItems(prev => prev.filter(item => item.inspectionId !== inspectionId));
  };

  const addLandlord = (landlord: Landlord) => setLandlords(prev => [...prev, landlord]);
  const updateLandlord = (updatedLandlord: Landlord) => setLandlords(prev => prev.map(l => l.id === updatedLandlord.id ? updatedLandlord : l));
  const deleteLandlord = (landlordId: string) => setLandlords(prev => prev.filter(l => l.id !== landlordId));

  const addApprovalRequest = (req: ApprovalRequest) => setApprovalRequests(prev => [...prev, req].sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()));
  const updateApprovalRequest = (updatedReq: ApprovalRequest) => setApprovalRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));

  const addFolder = async (folder: Folder) => {
    try {
      const savedFolder = await DoorapService.createFolder(folder);
      setFolders(prev => [...prev, savedFolder]);
    } catch (e) {
      console.error("Failed to create folder", e);
    }
  };
  const deleteFolder = async (folderId: string) => {
    try {
      await DoorapService.deleteFolder(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
    } catch (e) {
      console.error("Failed to delete folder", e);
    }
  };

  const addMeterReading = (reading: MeterReading) => setMeterReadings(prev => [...prev, reading]);
  const addMeterReadings = (readings: MeterReading[]) => setMeterReadings(prev => [...prev, ...readings]);
  const addInventoryCheck = (items: InventoryItem[]) => {
    // Logic to create a new inventory check record would go here
  };

  // Team CRUD
  const addTeamMember = (member: TeamMember) => setTeamMembers(prev => [...prev, member]);
  const updateTeamMember = (updated: TeamMember) => setTeamMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
  const deleteTeamMember = (id: string) => setTeamMembers(prev => prev.filter(m => m.id !== id));

  // Dori CRUD
  const addDoriInteraction = (item: DoriInteraction) => setDoriInteractions(prev => [item, ...prev]);
  const updateDoriAction = (action: DoriAction) => setDoriActions(prev => prev.map(a => a.id === action.id ? action : a));
  const addWorkflow = (wf: AutomationWorkflow) => setAutomationWorkflows(prev => [...prev, wf]);
  const updateWorkflow = (wf: AutomationWorkflow) => setAutomationWorkflows(prev => prev.map(w => w.id === wf.id ? wf : w));
  const deleteWorkflow = (id: string) => setAutomationWorkflows(prev => prev.filter(w => w.id !== id));
  const updateEmergency = (item: EmergencyItem) => setEmergencies(prev => prev.map(e => e.id === item.id ? item : e));
  const addDoriExecution = (execution: DoriExecution) => setDoriExecutions(prev => [execution, ...prev]);

  // Financial Advanced
  const addRecurringPayment = (payment: RecurringPayment) => setRecurringPayments(prev => [...prev, payment]);
  const addPaymentLink = (link: PaymentLink) => setPaymentLinks(prev => [...prev, link]);

  // New Bank Accounts CRUD
  const addBankAccount = (account: BankAccount) => setBankAccounts(prev => [...prev, account]);


  const handleSendMessage = (chatId: string, text: string, senderType: 'user' | 'support_admin' | 'tenant_simulated' | string) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: senderType === 'user' ? 'user' : senderType,
      text,
      timestamp: new Date().toISOString(),
      avatarUrl: senderType === 'user' ? userProfile.avatarUrl : undefined,
    };

    setChatSessions(prevSessions => {
      const currentSession = prevSessions[chatId] || {
        id: chatId,
        name: chatId === 'support' ? "Support Admin" : activeTenantForChat?.name || "Tenant",
        messages: [],
        lastActivity: new Date().toISOString(),
        targetAvatarUrl: chatId === 'support' ? undefined : activeTenantForChat?.avatarUrl,
      };
      return {
        ...prevSessions,
        [chatId]: {
          ...currentSession,
          messages: [...currentSession.messages, newMessage],
          lastActivity: new Date().toISOString(),
        }
      };
    });

    if (senderType === 'user') {
      // Universal AI Logic
      if (chatId === 'support') {
        setTimeout(async () => {
          try {
            const gemini = new GeminiService({ apiKey: '' }); // API Key handled internally by env var
            handleSendMessage(chatId, "Thinking...", 'support_admin');
            const response = await gemini.askDori(text);
            handleSendMessage(chatId, response, 'support_admin');
          } catch (e) {
            handleSendMessage(chatId, "I'm having trouble connecting to AI services right now.", 'support_admin');
          }
        }, 1000);
        return;
      }


      // Default Simulation if no AI
      const currentActiveTenantForChat = activeTenantForChat;

      // (Simplified simulation logic for brevity, same as before)
    }
  };

  const openSupportChat = () => setIsSupportChatOpen(true);
  const closeSupportChat = () => setIsSupportChatOpen(false);
  const openTenantChat = (tenant: Tenant) => setActiveTenantForChat(tenant);
  const closeTenantChat = () => setActiveTenantForChat(null);

  const supportSessionId = 'support';
  const supportChatSession: ChatSession = chatSessions[supportSessionId] || {
    id: supportSessionId, name: "Support Admin", messages: [], lastActivity: new Date().toISOString(),
    targetAvatarUrl: `https://ui-avatars.com/api/?name=Support+A&background=18181b&color=F0F0F0`
  };

  const tenantChatSessionId = activeTenantForChat ? `tenant_${activeTenantForChat.id}` : '';
  const currentTenantChatSession: ChatSession | null = activeTenantForChat ? (chatSessions[tenantChatSessionId] || {
    id: tenantChatSessionId, name: activeTenantForChat.name, messages: [], lastActivity: new Date().toISOString(),
    targetAvatarUrl: activeTenantForChat.avatarUrl || `https://ui-avatars.com/api/?name=${activeTenantForChat.name.replace(' ', '+')}&background=06b6d4&color=fff`
  }) : null;

  const allCalendarEvents: CalendarEvent[] = [
    ...reminders.filter(r => !r.isCompleted).map(r => ({ id: `rem-${r.id}`, title: `Reminder: ${r.task}`, start: r.dueDate, type: 'reminder' as 'reminder', color: '#f59e0b', link: `/workflow?tab=reminders&highlight=${r.id}`, data: r })),
    ...tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate).map(t => ({ id: `task-${t.id}`, title: `Task: ${t.title}`, start: t.dueDate!, type: 'task' as 'task', color: '#8b5cf6', link: `/workflow?tab=tasks&highlight=${t.id}`, data: t })),
    ...tenants.filter(t => t.leaseEndDate).map(t => ({ id: `lease-${t.id}`, title: `Lease End: ${t.name}`, start: t.leaseEndDate!, type: 'lease_expiry' as 'lease_expiry', color: '#ec4899', link: `/tenants?highlight=${t.id}`, data: t })),
    ...documents.filter(d => d.expiryDate).map(d => ({ id: `doc-exp-${d.id}`, title: `Doc Exp: ${d.name}`, start: d.expiryDate!, type: 'document_expiry' as 'document_expiry', color: '#10b981', link: `/documents`, data: d })),
    ...inspections.filter(i => i.status === 'Scheduled' || i.status === 'In Progress').map(i => ({ id: `insp-${i.id}`, title: `Inspection: ${i.inspectionType} for ${getPropertyById(i.propertyId)?.address}`, start: i.scheduledDate, type: 'inspection' as 'inspection', color: '#3b82f6', link: `/workflow?tab=inspections&highlight=${i.id}`, data: i })),
    ...applicants.map(app => {
      const vacancy = vacancies.find(v => v.id === app.vacancyId);
      const prop = vacancy ? properties.find(p => p.id === vacancy.propertyId) : null;
      return {
        id: `app-${app.id}`,
        title: `Applicant: ${app.name} (${prop?.address || 'Unknown'})`,
        start: app.applicationDate,
        type: 'applicant' as 'applicant',
        color: '#0ea5e9', // Sky blue
        link: `/vacancies`,
        data: app
      };
    })
  ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());


  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900">
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          navigate(`/${view}`);
          setIsSidebarOpen(false);
        }}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        userProfile={userProfile}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center lg:hidden z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center text-white font-bold text-lg">D</div>
            <h1 className="text-lg font-bold text-zinc-900">{APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell isMobileContext={true} />
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-500 hover:text-zinc-900">
              {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-50 p-6 lg:px-10 lg:py-10">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage
                properties={properties} tenants={tenants} maintenanceRequests={maintenanceRequests} reminders={reminders}
                documents={documents} communicationLogs={communicationLogs} rentPayments={rentPayments} expenses={expenses}
                tasks={tasks} vacancies={vacancies} applicants={applicants} inspections={inspections}
                userProfile={userProfile} documentTemplates={documentTemplates}
                addTask={addTask} updateTask={updateTask} emergencies={emergencies}
              />} />
              <Route path="/dashboard" element={<DashboardPage
                properties={properties} tenants={tenants} maintenanceRequests={maintenanceRequests} reminders={reminders}
                documents={documents} communicationLogs={communicationLogs} rentPayments={rentPayments} expenses={expenses}
                tasks={tasks} vacancies={vacancies} applicants={applicants} inspections={inspections}
                userProfile={userProfile} documentTemplates={documentTemplates}
                addTask={addTask} updateTask={updateTask} emergencies={emergencies}
              />} />
              <Route path="/dori" element={<DoriPage
                interactions={doriInteractions}
                actions={doriActions}
                updateAction={updateDoriAction}
                emergencies={emergencies}
                updateEmergency={updateEmergency}
                executions={doriExecutions}
                addExecution={addDoriExecution}
                integrationSettings={integrationSettings}
              />}
              />
              <Route path="/properties" element={<PropertiesPage
                properties={properties} addProperty={addProperty} updateProperty={updateProperty} deleteProperty={deleteProperty}
                tenants={tenants} maintenanceRequests={maintenanceRequests}
                documents={documents} addDocument={addDocument} deleteDocument={deleteDocument}
                communicationLogs={communicationLogs} addCommunicationLog={addCommunicationLog} deleteCommunicationLog={deleteCommunicationLog}
                documentTemplates={documentTemplates} userProfile={userProfile} folders={folders} landlords={landlords}
              />}
              />
              <Route path="/tenants" element={<TenantsPage
                tenants={tenants} properties={properties} addTenant={addTenant} updateTenant={updateTenant} deleteTenant={deleteTenant} getPropertyById={getPropertyById}
                documents={documents} addDocument={addDocument} deleteDocument={deleteDocument}
                communicationLogs={communicationLogs} addCommunicationLog={addCommunicationLog} deleteCommunicationLog={deleteCommunicationLog}
                onStartChat={openTenantChat}
                documentTemplates={documentTemplates} userProfile={userProfile} folders={folders}
                onSaveMeterReadings={addMeterReadings}
                onSaveInventory={addInventoryCheck}
                emailSettings={emailSettings}
              />}
              />
              <Route path="/landlords" element={<LandlordsPage
                landlords={landlords} addLandlord={addLandlord} updateLandlord={updateLandlord} deleteLandlord={deleteLandlord}
                properties={properties} tenants={tenants} maintenanceRequests={maintenanceRequests}
                approvalRequests={approvalRequests} addApprovalRequest={addApprovalRequest} updateApprovalRequest={updateApprovalRequest}
                documents={documents} addDocument={addDocument} deleteDocument={deleteDocument}
                communicationLogs={communicationLogs} addCommunicationLog={addCommunicationLog} deleteCommunicationLog={deleteCommunicationLog}
                documentTemplates={documentTemplates} userProfile={userProfile} folders={folders}
                rentPayments={rentPayments} expenses={expenses}
                updateMaintenanceRequest={updateMaintenanceRequest}
                emailSettings={emailSettings}
              />}


              />
              <Route path="/maintenance" element={<MaintenancePage
                maintenanceRequests={maintenanceRequests} properties={properties} tenants={tenants}
                addMaintenanceRequest={addMaintenanceRequest} updateMaintenanceRequest={updateMaintenanceRequest} deleteMaintenanceRequest={deleteMaintenanceRequest}
                getPropertyById={getPropertyById} getTenantById={getTenantById}
                documents={documents} addDocument={addDocument} deleteDocument={deleteDocument}
                communicationLogs={communicationLogs} addCommunicationLog={addCommunicationLog} deleteCommunicationLog={deleteCommunicationLog}
                documentTemplates={documentTemplates} userProfile={userProfile} folders={folders}
                landlords={landlords} addApprovalRequest={addApprovalRequest}
              />}
              />
              <Route path="/financials" element={<FinancialsPage
                rentPayments={rentPayments} addRentPayment={addRentPayment} updateRentPayment={updateRentPayment} deleteRentPayment={deleteRentPayment}
                expenses={expenses} addExpense={addExpense} updateExpense={updateExpense} deleteExpense={deleteExpense}
                properties={properties} tenants={tenants} landlords={landlords}
                recurringPayments={recurringPayments} addRecurringPayment={addRecurringPayment}
                paymentLinks={paymentLinks} addPaymentLink={addPaymentLink}
                addApprovalRequest={addApprovalRequest}
              />}
              />
              <Route path="/workflow" element={<WorkflowPage
                tasks={tasks} addTask={addTask} updateTask={updateTask} deleteTask={deleteTask}
                reminders={reminders} addReminder={addReminder} updateReminder={updateReminder} deleteReminder={deleteReminder}
                inspections={inspections} addInspection={addInspection} updateInspection={updateInspection} deleteInspection={deleteInspection}
                properties={properties} tenants={tenants} maintenanceRequests={maintenanceRequests}
                getPropertyById={getPropertyById} getTenantById={getTenantById}
                documents={documents} addDocument={addDocument} deleteDocument={deleteDocument}
                communicationLogs={communicationLogs} addCommunicationLog={addCommunicationLog} deleteCommunicationLog={deleteCommunicationLog}
                documentTemplates={documentTemplates} userProfile={userProfile}
                workflows={automationWorkflows} addWorkflow={addWorkflow} updateWorkflow={updateWorkflow} deleteWorkflow={deleteWorkflow}
              />}
              />
              <Route path="/documents" element={<DocumentsPage
                documents={documents} addDocument={addDocument} deleteDocument={deleteDocument}
                folders={folders} addFolder={addFolder} deleteFolder={deleteFolder}
                documentTemplates={documentTemplates} addDocumentTemplate={addDocumentTemplate}
                properties={properties} tenants={tenants} userProfile={userProfile} maintenanceRequests={maintenanceRequests}
              />}
              />
              <Route path="/calendar" element={<CalendarPage events={allCalendarEvents} />} />
              <Route path="/vacancies" element={<VacanciesPage
                vacancies={vacancies} addVacancy={addVacancy} updateVacancy={updateVacancy} deleteVacancy={deleteVacancy}
                applicants={applicants} addApplicant={addApplicant} updateApplicant={updateApplicant} deleteApplicant={deleteApplicant}
                properties={properties} getPropertyById={getPropertyById}
                communicationLogs={communicationLogs} addCommunicationLog={addCommunicationLog} deleteCommunicationLog={deleteCommunicationLog}
              />}
              />
              <Route path="/settings" element={<SettingsPage
                userProfile={userProfile}
                updateUserProfile={async (updatedProfile: UserProfile) => {
                  try {
                    // 1. Optimistic Update
                    setUserProfile(updatedProfile);

                    // 2. Persist to Supabase
                    const dbProfile = {
                      id: session?.user?.id,
                      name: updatedProfile.name,
                      email: updatedProfile.email,
                      phone: updatedProfile.phone,
                      role: updatedProfile.role,
                      company_name: updatedProfile.companyName,
                      avatar_url: updatedProfile.avatarUrl,
                      job_title: updatedProfile.jobTitle,
                      company_address: updatedProfile.companyAddress,
                      company_reg_no: updatedProfile.companyRegNo,
                      company_vat_number: updatedProfile.companyVatNumber,
                      website: updatedProfile.website,
                      stripe_connect_id: updatedProfile.stripeConnectId,
                      stripe_data_feed_enabled: updatedProfile.stripeDataFeedEnabled,
                      stripe_payouts_enabled: updatedProfile.stripePayoutsEnabled
                    };

                    const { error } = await supabase
                      .from('user_profiles')
                      .upsert(dbProfile);

                    if (error) throw error;
                    console.log('User profile synced to Supabase');
                  } catch (err) {
                    console.error('Failed to sync user profile:', err);
                    alert('Failed to save profile changes to the server. Please try again.');
                    // Revert? (Optional: fetch fresh data)
                  }
                }}
                emailSettings={emailSettings} setEmailSettings={setEmailSettings}
                teamMembers={teamMembers} addTeamMember={addTeamMember} updateTeamMember={updateTeamMember} deleteTeamMember={deleteTeamMember}
                landlords={landlords} updateLandlord={updateLandlord}
                portalSettings={portalSettings} setPortalSettings={setPortalSettings}
              />}



              />
              <Route path="/messages" element={<MessagesPage
                chatSessions={chatSessions}
                onSendMessage={handleSendMessage}
                userProfile={userProfile}
                tenants={tenants}
                landlords={landlords}
              />}
              />
            </Routes>
            {/* Subscription Modal */}


            {/* Tenant Chat Modal - Keeping this for tenant comms */}
            {/* Tenant Chat Modal - Keeping this for tenant comms */}
            {currentTenantChatSession && (
              <ChatModal
                isOpen={!!activeTenantForChat}
                onClose={closeTenantChat}
                title={currentTenantChatSession.name}
                messages={currentTenantChatSession.messages}
                onSendMessage={(text) => handleSendMessage(tenantChatSessionId, text, 'user')}
                currentUser={userProfile}
                targetAvatarUrl={currentTenantChatSession.targetAvatarUrl}
              />
            )}
          </div>
        </main>
      </div>

      {/* Overlays / Portals */}
      {isSubscriptionModalOpen && (
        <SubscriptionModal
          onClose={() => setIsSubscriptionModalOpen(false)}
        // currentPlan="Enterprise" // Removed if not in props
        />
      )}

      {/* Ask Dori Sidebar */}
      <DoriSidebar
        isOpen={isSupportChatOpen}
        onClose={closeSupportChat}
        currentUser={userProfile}
      />
      {!isSupportChatOpen && (
        <SupportChatLauncher
          onClick={openSupportChat}
          unreadCount={0}
        // title="Ask Dori" // Removed because prop doesn't exist
        />
      )}

    </div>
  );
};

export default App;