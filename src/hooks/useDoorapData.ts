
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Property, Tenant, Landlord, MaintenanceRequest, Reminder,
    Document, CommunicationLog, BankAccount, RentPayment,
    Expense, RecurringPayment, SLA, AutomationWorkflow,
    DoriInteraction, Notification, UserProfile, TeamMember
} from '../../types';

// Helper to map snake_case DB keys to camelCase frontend keys
const mapKeysToCamelCase = (data: any[]): any[] => {
    if (!data) return [];
    return data.map(item => {
        const newItem: any = {};
        for (const key in item) {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            newItem[camelKey] = item[key];
        }
        return newItem;
    });
};

export const useDoorapData = (session: any) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Internal state for all entities
    const [properties, setProperties] = useState<Property[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [landlords, setLandlords] = useState<Landlord[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
    const [slas, setSlas] = useState<SLA[]>([]);
    const [automationWorkflows, setAutomationWorkflows] = useState<AutomationWorkflow[]>([]);
    const [doriInteractions, setDoriInteractions] = useState<DoriInteraction[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [inspections, setInspections] = useState<any[]>([]);
    const [inspectionChecklistItems, setInspectionChecklistItems] = useState<any[]>([]);
    const [approvalRequests, setApprovalRequests] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [meterReadings, setMeterReadings] = useState<any[]>([]);
    const [inventoryChecks, setInventoryChecks] = useState<any[]>([]);
    const [documentTemplates, setDocumentTemplates] = useState<any[]>([]);
    const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
    const [chatSessions, setChatSessions] = useState<Record<string, any>>({});
    const [doriActions, setDoriActions] = useState<any[]>([]);
    const [doriExecutions, setDoriExecutions] = useState<any[]>([]);
    const [emergencies, setEmergencies] = useState<any[]>([]);
    const [portalSettings, setPortalSettings] = useState<any[]>([]);
    const [integrationSettings, setIntegrationSettings] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // If no session, don't fetch (or clear data)
            if (!session) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch all tables in parallel
                const results = await Promise.all([
                    supabase.from('properties').select('*'),
                    supabase.from('tenants').select('*'),
                    supabase.from('landlords').select('*'),
                    supabase.from('maintenance_requests').select('*'),
                    supabase.from('reminders').select('*'),
                    supabase.from('documents').select('*'),
                    supabase.from('communication_logs').select('*'),
                    supabase.from('bank_accounts').select('*'),
                    supabase.from('rent_payments').select('*'),
                    supabase.from('expenses').select('*'),
                    supabase.from('recurring_payments').select('*'),
                    supabase.from('slas').select('*'),
                    supabase.from('automation_workflows').select('*'),
                    supabase.from('dori_interactions').select('*'),
                    supabase.from('notifications').select('*'),
                    supabase.from('user_profiles').select('*').limit(1), // Assume single user for now
                    supabase.from('team_members').select('*'),
                    // New tables
                    supabase.from('tasks').select('*'),
                    supabase.from('vacancies').select('*'),
                    supabase.from('applicants').select('*'),
                    supabase.from('inspections').select('*'),
                    supabase.from('inspection_checklist_items').select('*'),
                    supabase.from('approval_requests').select('*'),
                    supabase.from('folders').select('*'),
                    supabase.from('meter_readings').select('*'),
                    supabase.from('inventory_checks').select('*'),
                    supabase.from('document_templates').select('*'),
                    supabase.from('payment_links').select('*'),
                    supabase.from('chat_sessions').select('*'),
                    supabase.from('chat_messages').select('*'),
                    supabase.from('dori_actions').select('*'),
                    supabase.from('dori_executions').select('*'),
                    supabase.from('emergencies').select('*'),
                    supabase.from('portal_settings').select('*'),
                    supabase.from('integration_settings').select('*'),
                ]);

                // Check for errors
                const errors = results.filter(r => r.error).map(r => r.error?.message);
                if (errors.length > 0) {
                    console.error("Supabase fetch errors:", errors);
                    setError("Failed to fetch some data. Check console details.");
                }

                // Map data
                setProperties(mapKeysToCamelCase(results[0].data || []));
                setTenants(mapKeysToCamelCase(results[1].data || []));
                setLandlords(mapKeysToCamelCase(results[2].data || []));
                setMaintenanceRequests(mapKeysToCamelCase(results[3].data || []));
                setReminders(mapKeysToCamelCase(results[4].data || []));
                setDocuments(mapKeysToCamelCase(results[5].data || []));
                setCommunicationLogs(mapKeysToCamelCase(results[6].data || []));
                setBankAccounts(mapKeysToCamelCase(results[7].data || []));
                setRentPayments(mapKeysToCamelCase(results[8].data || []));
                setExpenses(mapKeysToCamelCase(results[9].data || []));
                setRecurringPayments(mapKeysToCamelCase(results[10].data || []));
                setSlas(mapKeysToCamelCase(results[11].data || []));
                setAutomationWorkflows(mapKeysToCamelCase(results[12].data || []));
                setDoriInteractions(mapKeysToCamelCase(results[13].data || []));
                setNotifications(mapKeysToCamelCase(results[14].data || []));

                if (results[15].data && results[15].data.length > 0) {
                    setUserProfile(mapKeysToCamelCase(results[15].data)[0]);
                } else {
                    // Fallback mock profile if DB empty
                    // Fallback to empty if DB empty
                    setUserProfile({
                        name: '',
                        companyName: '',
                        email: '',
                        phone: '',
                    } as UserProfile);
                }

                setTeamMembers(mapKeysToCamelCase(results[16].data || []));
                setTasks(mapKeysToCamelCase(results[17].data || []));
                setVacancies(mapKeysToCamelCase(results[18].data || []));
                setApplicants(mapKeysToCamelCase(results[19].data || []));
                setInspections(mapKeysToCamelCase(results[20].data || []));
                setInspectionChecklistItems(mapKeysToCamelCase(results[21].data || []));
                setApprovalRequests(mapKeysToCamelCase(results[22].data || []));
                setFolders(mapKeysToCamelCase(results[23].data || []));
                setMeterReadings(mapKeysToCamelCase(results[24].data || []));
                setInventoryChecks(mapKeysToCamelCase(results[25].data || []));
                setDocumentTemplates(mapKeysToCamelCase(results[26].data || []));
                setPaymentLinks(mapKeysToCamelCase(results[27].data || []));

                // Reconstruct Chat Sessions (Join messages?)
                // For now just return raw sessions + messages or reconstruct the object structure
                // App.tsx expects Record<string, ChatSession>
                const sessions = mapKeysToCamelCase(results[28].data || []);
                const messages = mapKeysToCamelCase(results[29].data || []);
                const chatSessionMap: Record<string, any> = {};
                sessions.forEach((s: any) => {
                    chatSessionMap[s.id] = {
                        ...s,
                        messages: messages.filter((m: any) => m.sessionId === s.id)
                    };
                });
                setChatSessions(chatSessionMap);

                setDoriActions(mapKeysToCamelCase(results[30].data || []));
                setDoriExecutions(mapKeysToCamelCase(results[31].data || []));
                setEmergencies(mapKeysToCamelCase(results[32].data || []));
                setPortalSettings(mapKeysToCamelCase(results[33].data || []));
                setIntegrationSettings(mapKeysToCamelCase(results[34].data || []));

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    return {
        loading,
        error,
        properties,
        tenants,
        landlords,
        maintenanceRequests,
        reminders,
        documents,
        communicationLogs,
        bankAccounts,
        rentPayments,
        expenses,
        recurringPayments,
        slas,
        automationWorkflows,
        doriInteractions,
        notifications,
        userProfile,
        teamMembers,
        tasks,
        vacancies,
        applicants,
        inspections,
        inspectionChecklistItems,
        approvalRequests,
        folders,
        meterReadings,
        inventoryChecks,
        documentTemplates,
        paymentLinks,
        chatSessions,
        doriActions,
        doriExecutions,
        emergencies,
        portalSettings,
        integrationSettings
    };
};
