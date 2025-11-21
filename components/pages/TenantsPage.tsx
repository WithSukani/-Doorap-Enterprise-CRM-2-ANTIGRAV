
import React, { useState } from 'react';
import { Tenant, Property, Document, CommunicationLog, DocumentTemplate, UserProfile, MeterReading, InventoryItem, EmailIntegrationSettings } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import TenantForm from '../forms/TenantForm';
import AddTenantWizard from '../wizards/AddTenantWizard';
import TenantDetailsModal from '../modals/TenantDetailsModal';
import TenancyWorkflowModal from '../modals/TenancyWorkflowModal';
import BulkEmailModal from '../modals/BulkEmailModal';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, ChatBubbleLeftEllipsisIcon, TableCellsIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ArrowRightStartOnRectangleIcon, ArrowLeftEndOnRectangleIcon, AtSymbolIcon } from '../icons/HeroIcons';

interface TenantsPageProps {
    tenants: Tenant[];
    properties: Property[];
    addTenant: (tenant: Tenant) => void;
    updateTenant: (tenant: Tenant) => void;
    deleteTenant: (tenantId: string) => void;
    getPropertyById: (propertyId: string) => Property | undefined;
    documents: Document[];
    addDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: CommunicationLog) => void;
    deleteCommunicationLog: (logId: string) => void;
    onStartChat: (tenant: Tenant) => void;
    documentTemplates: DocumentTemplate[];
    userProfile: UserProfile;
    onSaveMeterReadings: (readings: MeterReading[]) => void;
    onSaveInventory: (items: InventoryItem[]) => void;
    emailSettings: EmailIntegrationSettings | null;
}

const TenantsPage: React.FC<TenantsPageProps> = ({ 
    tenants, properties, addTenant, updateTenant, deleteTenant, getPropertyById,
    documents, addDocument, deleteDocument,
    communicationLogs, addCommunicationLog, deleteCommunicationLog,
    onStartChat, documentTemplates, userProfile,
    onSaveMeterReadings, onSaveInventory, emailSettings
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  
  // Workflow Modal State
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [workflowType, setWorkflowType] = useState<'Move In' | 'Move Out'>('Move In');
  const [workflowTenant, setWorkflowTenant] = useState<Tenant | null>(null);

  // Bulk Email State
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPropertyId, setFilterPropertyId] = useState('');

  const handleAddTenant = () => setIsWizardOpen(true);
  const handleEditTenant = (tenant: Tenant) => { setEditingTenant(tenant); setIsFormOpen(true); };
  const handleDeleteTenant = (tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this tenant and all associated data?')) {
      deleteTenant(tenantId);
    }
  };
  const handleViewDetails = (tenant: Tenant) => setViewingTenant(tenant);
  
  const handleWizardSubmit = (tenantData: Tenant) => { 
      addTenant(tenantData); 
      setIsWizardOpen(false);
      // Trigger Move In Workflow immediately
      setWorkflowTenant(tenantData);
      setWorkflowType('Move In');
      setIsWorkflowOpen(true);
  };
  
  const handleFormSubmit = (tenantData: Tenant) => {
    editingTenant ? updateTenant(tenantData) : addTenant(tenantData);
    setIsFormOpen(false); setEditingTenant(null);
  };

  const handleStartWorkflow = (tenant: Tenant, type: 'Move In' | 'Move Out') => {
      setWorkflowTenant(tenant);
      setWorkflowType(type);
      setIsWorkflowOpen(true);
  }

  const handleWorkflowComplete = (data: any) => {
      // Update tenant status if needed (e.g. mark as past tenant after move out)
      if (workflowType === 'Move Out' && workflowTenant) {
          updateTenant({ ...workflowTenant, leaseEndDate: data.date, notes: `${workflowTenant.notes || ''} \nMoved Out: ${data.date}. Deposit Return: £${data.refundAmount}`});
      }
  }

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.address : 'Unassigned';
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearchTerm = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              getPropertyName(t.propertyId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPropertyFilter = filterPropertyId ? t.propertyId === filterPropertyId : true;
    return matchesSearchTerm && matchesPropertyFilter;
  });
  
  const propertyOptions = [{ value: '', label: 'All Properties' }, ...properties.map(p => ({ value: p.id, label: `${p.address}` }))];

  const bulkEmailRecipients = filteredTenants.map(t => ({ id: t.id, name: t.name, email: t.email }));

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Tenants" 
        subtitle={`Manage your ${tenants.length} active tenants.`}
        actions={
          <div className="flex gap-2">
              {emailSettings?.isActive && (
                  <Button variant="secondary" onClick={() => setIsBulkEmailOpen(true)} leftIcon={<AtSymbolIcon className="w-5 h-5"/>}>
                      Bulk Email
                  </Button>
              )}
              <Button onClick={handleAddTenant} leftIcon={<PlusCircleIcon className="w-5 h-5"/>} disabled={properties.length === 0}>
                Add Tenant & Move In
              </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
            <input
                type="text"
                placeholder="Search tenants..."
                className="w-full px-4 py-2 border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="w-full sm:w-64">
            <select
                className="w-full px-4 py-2 border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                value={filterPropertyId}
                onChange={(e) => setFilterPropertyId(e.target.value)}
            >
                {propertyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-100">
                <thead className="bg-zinc-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Tenant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Lease Term</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Rent</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-100">
                    {filteredTenants.length > 0 ? filteredTenants.map((tenant) => {
                        const property = properties.find(p => p.id === tenant.propertyId);
                        const isLeaseEnding = tenant.leaseEndDate && new Date(tenant.leaseEndDate) < new Date(new Date().setDate(new Date().getDate() + 60));
                        
                        return (
                            <tr key={tenant.id} className="hover:bg-zinc-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div className="text-sm font-medium text-zinc-900">{tenant.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center text-xs text-zinc-500">
                                            <EnvelopeIcon className="w-3 h-3 mr-1"/> {tenant.email}
                                        </div>
                                        <div className="flex items-center text-xs text-zinc-500">
                                            <PhoneIcon className="w-3 h-3 mr-1"/> {tenant.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-zinc-900 flex items-center">
                                        <MapPinIcon className="w-3 h-3 mr-1 text-zinc-400"/>
                                        {property ? property.address : <span className="text-red-500">Unassigned</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500">
                                    {tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toLocaleDateString() : 'N/A'} - {tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-zinc-900">
                                    £{tenant.rentAmount?.toLocaleString() || '0'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {isLeaseEnding ? (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Expiring Soon</span>
                                    ) : (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleStartWorkflow(tenant, 'Move Out')} className="text-zinc-400 hover:text-orange-600 p-1" title="Start Move Out"><ArrowRightStartOnRectangleIcon className="w-4 h-4"/></button>
                                        <button onClick={() => onStartChat(tenant)} className="text-indigo-600 hover:text-indigo-900 p-1" title="Chat"><ChatBubbleLeftEllipsisIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleViewDetails(tenant)} className="text-zinc-400 hover:text-zinc-600 p-1" title="View Details"><EyeIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleEditTenant(tenant)} className="text-zinc-400 hover:text-zinc-600 p-1" title="Edit"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteTenant(tenant.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={7} className="px-6 py-10 text-center text-sm text-zinc-500 bg-zinc-50/50">
                                <TableCellsIcon className="w-10 h-10 mx-auto text-zinc-300 mb-2"/>
                                No tenants found matching your filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>

      {/* Modals */}
      {isWizardOpen && (
        <AddTenantWizard 
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
            onSubmit={handleWizardSubmit}
            properties={properties}
            defaultPropertyId={filterPropertyId || undefined}
        />
      )}
      {isFormOpen && (
        <TenantForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingTenant}
          properties={properties}
          defaultPropertyId={filterPropertyId || undefined}
        />
      )}
      {viewingTenant && (
          <TenantDetailsModal
            tenant={viewingTenant}
            property={getPropertyById(viewingTenant.propertyId)}
            onClose={() => setViewingTenant(null)}
            documents={documents}
            addDocument={addDocument}
            deleteDocument={deleteDocument}
            communicationLogs={communicationLogs}
            addCommunicationLog={addCommunicationLog}
            deleteCommunicationLog={deleteCommunicationLog}
            onStartChat={onStartChat}
            documentTemplates={documentTemplates}
            properties={properties}
            tenants={tenants}
            userProfile={userProfile}
          />
      )}
      {isWorkflowOpen && workflowTenant && (
          <TenancyWorkflowModal 
            isOpen={isWorkflowOpen}
            onClose={() => setIsWorkflowOpen(false)}
            tenant={workflowTenant}
            property={getPropertyById(workflowTenant.propertyId)!}
            type={workflowType}
            onSaveMeterReadings={onSaveMeterReadings}
            onSaveInventory={onSaveInventory}
            onComplete={handleWorkflowComplete}
            addDocument={addDocument}
            documents={documents} // Pass documents to allow selection
          />
      )}
      {isBulkEmailOpen && (
          <BulkEmailModal 
            isOpen={isBulkEmailOpen}
            onClose={() => setIsBulkEmailOpen(false)}
            recipients={bulkEmailRecipients}
            context="Tenants"
          />
      )}
    </div>
  );
};

export default TenantsPage;
