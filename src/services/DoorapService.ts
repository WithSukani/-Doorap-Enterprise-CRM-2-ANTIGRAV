
import { supabase } from '../lib/supabase';
import { Document, DocumentTemplate, Folder, Property, Tenant, Landlord, MaintenanceRequest, Reminder, Task, RentPayment, Expense, RecurringPayment, PaymentLink, Vacancy, Applicant, Inspection, InspectionChecklistItem, MeterReading, InventoryItem, TeamMember, PermissionSet } from '../../types';

// --- Helper Functions (Mappers) ---

const mapDbToDoc = (data: any): any => {
    return {
        ...data,
        parentId: data.parent_id,
        parentType: data.parent_type,
        fileUrl: data.file_url,
        fileName: data.file_name,
        fileSize: data.file_size,
        folderId: data.folder_id,
        templateId: data.template_id,
    };
};

const mapDbToProperty = (data: any): any => {
    return {
        id: data.id,
        address: data.address,
        postcode: data.postcode,
        type: data.type,
        ownerName: data.owner_name,
        purchaseDate: data.purchase_date,
        value: data.value,
        imageUrl: data.image_url,
        notes: data.notes,
        managementFeeType: data.management_fee_type,
        managementFeeValue: data.management_fee_value,
        landlordId: data.landlord_id
    };
};

const mapDbToTenant = (data: any): any => {
    return {
        id: data.id,
        propertyId: data.property_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        leaseStartDate: data.lease_start_date,
        leaseEndDate: data.lease_end_date,
        rentAmount: data.rent_amount,
        securityDeposit: data.security_deposit,
        depositStatus: data.deposit_status,
        depositScheme: data.deposit_scheme,
        notes: data.notes
    };
};

// --- Service Object ---

export const DoorapService = {
    // --- Helper: Get Context Owner ID ---
    async getCurrentOwnerId() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        // 1. Check if I am a Team Member
        const { data: member } = await supabase
            .from('team_members')
            .select('user_id')
            .eq('auth_user_id', user.id)
            .single();

        if (member && member.user_id) {
            return member.user_id; // Return my boss's ID
        }

        // 2. Otherwise return my own ID (I am the owner)
        return user.id;
    },

    // --- Properties ---
    async createProperty(property: Partial<Property>) {
        const ownerId = await this.getCurrentOwnerId();

        const dbProperty = {
            address: property.address,
            postcode: property.postcode,
            type: property.type,
            purchase_date: property.purchaseDate,
            value: property.value,
            image_url: property.imageUrl,
            notes: property.notes,
            management_fee_type: property.managementFeeType,
            management_fee_value: property.managementFeeValue,
            owner_name: property.ownerName,
            user_id: ownerId
        };
        // Remove undefined
        Object.keys(dbProperty).forEach(key => (dbProperty as any)[key] === undefined && delete (dbProperty as any)[key]);

        const { data, error } = await supabase.from('properties').insert(dbProperty).select().single();
        if (error) throw error;
        return mapDbToProperty(data);
    },

    async updateProperty(property: Partial<Property>) {
        if (!property.id) throw new Error("Property ID required");

        const dbProperty = {
            address: property.address,
            postcode: property.postcode,
            type: property.type,
            purchase_date: property.purchaseDate,
            value: property.value,
            image_url: property.imageUrl,
            notes: property.notes,
            management_fee_type: property.managementFeeType,
            management_fee_value: property.managementFeeValue,
            owner_name: property.ownerName
        };
        Object.keys(dbProperty).forEach(key => (dbProperty as any)[key] === undefined && delete (dbProperty as any)[key]);

        const { data, error } = await supabase.from('properties').update(dbProperty).eq('id', property.id).select().single();
        if (error) throw error;
        return mapDbToProperty(data);
    },

    async deleteProperty(id: string) {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Tenants ---
    async createTenant(tenant: Partial<Tenant>) {
        const ownerId = await this.getCurrentOwnerId();
        const { data: { user } } = await supabase.auth.getUser(); // Needed if we want to store creator, but usually ownerId is key

        const dbTenant = {
            property_id: tenant.propertyId,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            lease_start_date: tenant.leaseStartDate,
            lease_end_date: tenant.leaseEndDate,
            rent_amount: tenant.rentAmount,
            security_deposit: tenant.securityDeposit,
            deposit_status: tenant.depositStatus,
            deposit_scheme: tenant.depositScheme,
            notes: tenant.notes,
            user_id: ownerId
        };
        Object.keys(dbTenant).forEach(key => (dbTenant as any)[key] === undefined && delete (dbTenant as any)[key]);

        const { data, error } = await supabase.from('tenants').insert(dbTenant).select().single();
        if (error) throw error;
        return mapDbToTenant(data);
    },

    async updateTenant(tenant: Partial<Tenant>) {
        if (!tenant.id) throw new Error("Tenant ID required");

        const dbTenant = {
            property_id: tenant.propertyId,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            lease_start_date: tenant.leaseStartDate,
            lease_end_date: tenant.leaseEndDate,
            rent_amount: tenant.rentAmount,
            security_deposit: tenant.securityDeposit,
            deposit_status: tenant.depositStatus,
            deposit_scheme: tenant.depositScheme,
            notes: tenant.notes
        };
        Object.keys(dbTenant).forEach(key => (dbTenant as any)[key] === undefined && delete (dbTenant as any)[key]);

        const { data, error } = await supabase.from('tenants').update(dbTenant).eq('id', tenant.id).select().single();
        if (error) throw error;
        return mapDbToTenant(data);
    },

    async deleteTenant(id: string) {
        const { error } = await supabase.from('tenants').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Folders ---
    async getFolders() {
        const { data, error } = await supabase.from('folders').select('*');
        if (error) throw error;
        return data;
    },

    async createFolder(folder: Partial<Folder>) {
        const dbFolder = {
            id: folder.id,
            name: folder.name,
            type: folder.type,
            parent_id: folder.parentId,
            created_at: new Date().toISOString(),
            user_id: await this.getCurrentOwnerId()
        };

        Object.keys(dbFolder).forEach(key => (dbFolder as any)[key] === undefined && delete (dbFolder as any)[key]);

        const { data, error } = await supabase.from('folders').insert(dbFolder).select().single();
        if (error) throw error;

        return {
            ...data,
            parentId: data.parent_id
        };
    },

    async deleteFolder(folderId: string) {
        const { error } = await supabase.from('folders').delete().eq('id', folderId);
        if (error) throw error;
    },

    // --- Document Templates ---
    async getTemplates() {
        const { data, error } = await supabase.from('document_templates').select('*');
        if (error) throw error;
        return data.map((t: any) => ({
            ...t,
            folderId: t.folder_id
        }));
    },

    async createTemplate(template: Partial<DocumentTemplate>) {
        const dbTemplate = {
            name: template.name,
            category: template.category,
            content: template.content,
            description: template.description,
            folder_id: template.folderId,
            created_at: new Date().toISOString(),
            user_id: await this.getCurrentOwnerId()
        };

        const { data, error } = await supabase.from('document_templates').insert(dbTemplate).select().single();
        if (error) throw error;
        return {
            ...data,
            folderId: data.folder_id
        };
    },

    async deleteTemplate(templateId: string) {
        const { error } = await supabase.from('document_templates').delete().eq('id', templateId);
        if (error) throw error;
    },

    // --- Documents ---
    async createDocument(doc: Partial<Document>) {
        const dbDoc = {
            parent_id: doc.parentId,
            parent_type: doc.parentType,
            name: doc.name,
            type: doc.type,
            file_url: doc.fileUrl,
            file_name: doc.fileName,
            file_size: doc.fileSize,
            content: doc.content,
            folder_id: doc.folderId,
            template_id: doc.templateId,
            user_id: await this.getCurrentOwnerId()
        };

        Object.keys(dbDoc).forEach(key => (dbDoc as any)[key] === undefined && delete (dbDoc as any)[key]);

        const { data, error } = await supabase.from('documents').insert(dbDoc).select().single();
        if (error) throw error;
        return mapDbToDoc(data);
    },

    // --- Team Permissions ---
    async inviteTeamMember(email: string, name: string, role: string, permissions: PermissionSet) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        // Call the Edge Function to securely invite the user using Admin API
        const { data, error } = await supabase.functions.invoke('invite-user', {
            body: {
                email,
                name,
                role,
                permissions,
                invited_by_user_id: user.id
            }
        });

        if (error) {
            console.error('[DoorapService] Invite failed:', error);
            throw error;
        }

        return data.member; // Return the created team_member record
    },

    async updateMemberPermissions(memberId: string, permissions: PermissionSet) {
        const { error } = await supabase.from('team_members').update({ permissions }).eq('id', memberId);
        if (error) throw error;
    },

    async updateTeamMember(member: Partial<TeamMember>) {
        // Separate permissions update if needed, or update generic fields
        const { permissions, id, ...updates } = member;

        // Update basic fields
        if (Object.keys(updates).length > 0) {
            const { error } = await supabase.from('team_members').update(updates).eq('id', id);
            if (error) throw error;
        }

        // Update permissions separately (or together if RLS permits)
        if (permissions) {
            const { error } = await supabase.from('team_members').update({ permissions }).eq('id', id);
            if (error) throw error;
        }
    },

    async deleteTeamMember(memberId: string) {
        const { error } = await supabase.from('team_members').delete().eq('id', memberId);
        if (error) throw error;
    },

    async getTeamMembers() {
        const { data, error } = await supabase.from('team_members').select('*');
        if (error) throw error;
        return data.map((m: any) => ({
            ...m,
            permissions: m.permissions as PermissionSet,
            lastLogin: m.last_login,
            avatarUrl: m.avatar_url,
            authUserId: m.auth_user_id
        }));
    },

    async getMyPermissions(): Promise<PermissionSet | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data } = await supabase.from('team_members').select('permissions').eq('auth_user_id', user.id).single();

        if (data) return data.permissions;

        // If not found in team_members, assume I am the Owner (full access)
        return {
            canManageProperties: true,
            canManageTenants: true,
            canViewFinancials: true,
            canManageSettings: true,
            canViewLandlords: true
        };
    }
};
