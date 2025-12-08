
import React, { useState, useMemo } from 'react';
import { MaintenanceStatus, MaintenancePriority, MaintenanceRequest, Property, Tenant, Document, CommunicationLog, UserProfile, DocumentTemplate, Landlord, ApprovalRequest, Folder } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import MaintenanceRequestForm from '../forms/MaintenanceRequestForm';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, BriefcaseIcon, LinkIcon, WrenchScrewdriverIcon, ListBulletIcon, Squares2X2Icon, PaperAirplaneIcon } from '../icons/HeroIcons';
import Modal from '../common/Modal';
import DocumentSection from '../features/DocumentSection';
import CommunicationLogSection from '../features/CommunicationLogSection';

// --- Helpers & Configuration ---

const getStatusColor = (status: MaintenanceRequest['status']) => {
  switch (status) {
    case MaintenanceStatus.NEW: return 'bg-blue-50 text-blue-700 border-blue-200';
    case MaintenanceStatus.PENDING_QUOTE:
    case MaintenanceStatus.QUOTE_RECEIVED:
    case MaintenanceStatus.ASSESSING:
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case MaintenanceStatus.APPROVED:
    case MaintenanceStatus.IN_PROGRESS:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case MaintenanceStatus.PENDING_REVIEW:
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case MaintenanceStatus.COMPLETED:
    case MaintenanceStatus.PAID:
      return 'bg-green-50 text-green-700 border-green-200';
    case MaintenanceStatus.CANCELLED:
    case MaintenanceStatus.INVOICED:
      return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    default: return 'bg-zinc-50 text-zinc-600 border-zinc-200';
  }
};

const getPriorityPill = (priority: MaintenanceRequest['priority']) => {
  switch (priority) {
    case MaintenancePriority.URGENT: return 'border-red-200 text-red-700 bg-red-50';
    case MaintenancePriority.HIGH: return 'border-orange-200 text-orange-700 bg-orange-50';
    case MaintenancePriority.MEDIUM: return 'border-yellow-200 text-yellow-700 bg-yellow-50';
    case MaintenancePriority.LOW: return 'border-green-200 text-green-700 bg-green-50';
    default: return 'border-zinc-200 text-zinc-500 bg-zinc-50';
  }
}

// Grouping statuses into columns
const KANBAN_COLUMNS = [
  {
    id: 'new',
    title: 'New & Triage',
    statuses: [MaintenanceStatus.NEW, MaintenanceStatus.ASSESSING] as string[],
    defaultStatus: MaintenanceStatus.NEW
  },
  {
    id: 'planning',
    title: 'Planning & Quotes',
    statuses: [MaintenanceStatus.PENDING_QUOTE, MaintenanceStatus.QUOTE_RECEIVED] as string[],
    defaultStatus: MaintenanceStatus.PENDING_QUOTE
  },
  {
    id: 'progress',
    title: 'In Progress',
    statuses: [MaintenanceStatus.APPROVED, MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.PENDING_REVIEW] as string[],
    defaultStatus: MaintenanceStatus.IN_PROGRESS
  },
  {
    id: 'done',
    title: 'Done',
    statuses: [MaintenanceStatus.COMPLETED, MaintenanceStatus.INVOICED, MaintenanceStatus.PAID, MaintenanceStatus.CANCELLED] as string[],
    defaultStatus: MaintenanceStatus.COMPLETED
  }
];

// --- Components ---

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  property?: Property;
  tenant?: Tenant;
  onEdit: (request: MaintenanceRequest) => void;
  onDelete: (requestId: string) => void;
  onViewDetails: (request: MaintenanceRequest) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, requestId: string) => void;
}

const MaintenanceRequestCard: React.FC<MaintenanceRequestCardProps> = ({
  request, property, tenant, onEdit, onDelete, onViewDetails, isDraggable, onDragStart
}) => {
  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart && onDragStart(e, request.id)}
      className={`bg-white p-4 rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-all group ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-zinc-900 leading-tight line-clamp-2">{request.issueTitle}</h3>
        <button onClick={(e) => { e.stopPropagation(); onViewDetails(request); }} className="text-zinc-400 hover:text-zinc-600"><EyeIcon className="w-4 h-4" /></button>
      </div>

      <div className="space-y-1 mb-3">
        {property && <p className="text-xs text-zinc-500 truncate">{property.address}</p>}
        <div className="flex flex-wrap gap-1 mt-2">
          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border rounded-full ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border rounded-full ${getPriorityPill(request.priority)}`}>
            {request.priority}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[10px] text-zinc-400">{new Date(request.reportedDate).toLocaleDateString()}</div>
        <div className="flex space-x-1">
          <button onClick={() => onEdit(request)} className="p-1 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100"><PencilIcon className="w-3 h-3" /></button>
          <button onClick={() => onDelete(request.id)} className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50"><TrashIcon className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
};

interface MaintenanceDetailsModalProps {
  request: MaintenanceRequest | null;
  property?: Property;
  tenant?: Tenant;
  onClose: () => void;
  onBookProvider: (requestId: string) => void;
  documents: Document[];
  addDocument: (doc: Document) => void;
  deleteDocument: (docId: string) => void;
  communicationLogs: CommunicationLog[];
  addCommunicationLog: (log: CommunicationLog) => void;
  deleteCommunicationLog: (logId: string) => void;
  documentTemplates: DocumentTemplate[];
  properties: Property[];
  tenants: Tenant[];
  userProfile: UserProfile;
  landlords: Landlord[];
  onSendToLandlord: (request: MaintenanceRequest) => void;
  folders: Folder[];
}

const MaintenanceDetailsModal: React.FC<MaintenanceDetailsModalProps> = ({
  request, property, tenant, onClose, onBookProvider,
  documents, addDocument, deleteDocument,
  communicationLogs, addCommunicationLog, deleteCommunicationLog,
  documentTemplates, properties, tenants, userProfile,
  landlords, onSendToLandlord, folders
}) => {
  if (!request) return null;

  const landlordName = property?.ownerName;
  const landlord = landlords.find(l => l.name === landlordName);

  // Logic to show "Send to Landlord" button:
  // 1. Must have a landlord linked (via property).
  // 2. Must have a quote amount to approve.
  // 3. Status should be relevant (e.g., Quote Received or New).
  // 4. Should not already be in Pending Review (unless resending).
  const canSendToLandlord = landlord && request.quoteAmount && request.quoteAmount > 0 && request.status !== MaintenanceStatus.PENDING_REVIEW && request.status !== MaintenanceStatus.APPROVED;

  return (
    <Modal isOpen={!!request} onClose={onClose} title={`Maintenance: ${request.issueTitle}`} size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-zinc-50 rounded border border-zinc-100">
            <span className="block text-xs text-zinc-500 uppercase font-semibold">Status</span>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>{request.status}</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded border border-zinc-100">
            <span className="block text-xs text-zinc-500 uppercase font-semibold">Priority</span>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityPill(request.priority)}`}>{request.priority}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-zinc-700">
          <p><strong className="font-medium text-zinc-900">Property:</strong> {property ? `${property.address}, ${property.postcode}` : 'N/A'}</p>
          <p><strong className="font-medium text-zinc-900">Tenant:</strong> {tenant ? tenant.name : 'N/A'}</p>
          <p><strong className="font-medium text-zinc-900">Reported:</strong> {new Date(request.reportedDate).toLocaleDateString()}</p>
          <p><strong className="font-medium text-zinc-900">Landlord:</strong> {landlord ? landlord.name : (property?.ownerName || 'Unknown')}</p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100 text-sm">
          <h4 className="font-medium text-zinc-900 mb-1">Description</h4>
          <p className="text-zinc-600">{request.description}</p>
        </div>

        {(request.quoteAmount || request.invoiceAmount) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
            {request.quoteAmount && (
              <div>
                <p className="text-xs text-zinc-500">Quote Amount</p>
                <p className="font-medium">£{request.quoteAmount.toLocaleString()}</p>
                {request.quoteUrl && <a href={request.quoteUrl} className="text-xs text-primary hover:underline flex items-center mt-1"><LinkIcon className="w-3 h-3 mr-1" />View Quote</a>}
              </div>
            )}
            {request.invoiceAmount && (
              <div>
                <p className="text-xs text-zinc-500">Invoice Amount</p>
                <p className="font-medium">£{request.invoiceAmount.toLocaleString()}</p>
                {request.invoiceUrl && <a href={request.invoiceUrl} className="text-xs text-primary hover:underline flex items-center mt-1"><LinkIcon className="w-3 h-3 mr-1" />View Invoice</a>}
              </div>
            )}
          </div>
        )}

        {request.marketplaceJobId && <p className="text-xs text-zinc-500">Marketplace Job ID: {request.marketplaceJobId}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {canSendToLandlord && (
            <Button
              onClick={() => onSendToLandlord(request)}
              variant="secondary"
              size="sm"
              className="w-full justify-center border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
            >
              Send Quote to Landlord
            </Button>
          )}

          {!request.serviceBooked && request.status === MaintenanceStatus.APPROVED && (
            <Button onClick={() => onBookProvider(request.id)} variant="primary" size="sm" className="w-full justify-center" leftIcon={<BriefcaseIcon className="w-4 h-4" />}>
              Book Provider (Mock)
            </Button>
          )}
        </div>

        <DocumentSection
          documents={documents} parentId={request.id} parentType="maintenance_request"
          addDocument={addDocument} deleteDocument={deleteDocument}
          documentTemplates={documentTemplates} properties={properties} tenants={tenants} userProfile={userProfile}
          parentObject={request}
          folders={folders}
        />

        <CommunicationLogSection
          logs={communicationLogs} parentId={request.id} parentType="maintenance_request"
          addLog={addCommunicationLog} deleteLog={deleteCommunicationLog}
        />

        <div className="flex justify-end pt-4 border-t border-zinc-100 mt-4">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </div>
    </Modal>
  );
};

// --- Main Page Component ---

interface MaintenancePageProps {
  maintenanceRequests: MaintenanceRequest[];
  properties: Property[];
  tenants: Tenant[];
  addMaintenanceRequest: (request: MaintenanceRequest) => void;
  updateMaintenanceRequest: (request: MaintenanceRequest) => void;
  deleteMaintenanceRequest: (requestId: string) => void;
  getPropertyById: (propertyId: string) => Property | undefined;
  getTenantById: (tenantId: string) => Tenant | undefined;
  documents: Document[];
  addDocument: (doc: Document) => void;
  deleteDocument: (docId: string) => void;
  communicationLogs: CommunicationLog[];
  addCommunicationLog: (log: CommunicationLog) => void;
  deleteCommunicationLog: (logId: string) => void;
  documentTemplates: DocumentTemplate[];
  userProfile: UserProfile;
  landlords: Landlord[];
  addApprovalRequest: (req: ApprovalRequest) => void;
  folders: Folder[];
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  maintenanceRequests, properties, tenants,
  addMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest,
  getPropertyById, getTenantById,
  documents, addDocument, deleteDocument,
  communicationLogs, addCommunicationLog, deleteCommunicationLog,
  documentTemplates, userProfile,
  landlords, addApprovalRequest, folders
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPropertyId, setFilterPropertyId] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // --- Logic ---

  const handleAddRequest = () => { setEditingRequest(null); setIsFormOpen(true); };
  const handleEditRequest = (request: MaintenanceRequest) => { setEditingRequest(request); setIsFormOpen(true); };
  const handleDeleteRequest = (requestId: string) => { if (window.confirm('Delete request?')) deleteMaintenanceRequest(requestId); };
  const handleViewDetails = (request: MaintenanceRequest) => { setViewingRequest(request); };
  const handleSubmitForm = (requestData: MaintenanceRequest) => {
    editingRequest ? updateMaintenanceRequest(requestData) : addMaintenanceRequest(requestData);
    setIsFormOpen(false); setEditingRequest(null);
  };

  const handleSimulateMarketplaceJob = () => {
    if (properties.length === 0) return alert("Add a property first.");
    const randomProperty = properties[Math.floor(Math.random() * properties.length)];
    const newJob: MaintenanceRequest = {
      id: `maint_market_${Date.now()}`,
      propertyId: randomProperty.id,
      issueTitle: "Simulated: Boiler Fault",
      description: `Simulated job from marketplace.`,
      reportedDate: new Date().toISOString().split('T')[0],
      status: MaintenanceStatus.NEW,
      priority: MaintenancePriority.HIGH,
      marketplaceJobId: `MP-${Math.floor(Math.random() * 9000) + 1000}`,
    };
    addMaintenanceRequest(newJob);
  };

  const handleBookProvider = (requestId: string) => {
    const req = maintenanceRequests.find(r => r.id === requestId);
    if (req) {
      updateMaintenanceRequest({ ...req, serviceBooked: true, status: MaintenanceStatus.IN_PROGRESS });
      alert(`Provider booking simulated. Status updated.`);
      setViewingRequest(prev => prev ? { ...prev, serviceBooked: true, status: MaintenanceStatus.IN_PROGRESS } : null);
    }
  };

  const handleSendToLandlord = (request: MaintenanceRequest) => {
    const property = properties.find(p => p.id === request.propertyId);
    if (!property) return;

    // Ideally link by ID, but using name for now as per current data structure
    const landlord = landlords.find(l => l.name === property.ownerName);

    if (landlord) {
      // Create Approval Request
      const newApproval: ApprovalRequest = {
        id: `appr_maint_${Date.now()}`,
        landlordId: landlord.id,
        type: 'Maintenance Quote',
        title: `Approve Quote: ${request.issueTitle}`,
        description: `Approval required for maintenance at ${property.address}. Quote amount: £${request.quoteAmount}`,
        amount: request.quoteAmount,
        documentUrl: request.quoteUrl,
        status: 'Sent',
        sentDate: new Date().toISOString(),
        maintenanceRequestId: request.id
      };
      addApprovalRequest(newApproval);

      // Update Maintenance Status
      const updatedReq = { ...request, status: MaintenanceStatus.PENDING_REVIEW };
      updateMaintenanceRequest(updatedReq);

      alert(`Quote sent to ${landlord.name} for approval.`);
      setViewingRequest(updatedReq);
    } else {
      alert("Could not find a linked landlord account for this property owner.");
    }
  };

  // --- Drag and Drop Handlers ---

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, requestId: string) => {
    e.dataTransfer.setData("requestId", requestId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    const requestId = e.dataTransfer.getData("requestId");
    const targetColumn = KANBAN_COLUMNS.find(c => c.id === targetColumnId);
    const request = maintenanceRequests.find(r => r.id === requestId);

    if (request && targetColumn) {
      // Only update if the status group actually changes to the default of the new column, 
      // or if the user drags to a column where the current status doesn't belong.
      if (!targetColumn.statuses.includes(request.status)) {
        updateMaintenanceRequest({ ...request, status: targetColumn.defaultStatus });
      }
    }
  };

  // --- Filtering ---

  const filteredRequests: MaintenanceRequest[] = useMemo(() => {
    return maintenanceRequests.filter(req => {
      const property = getPropertyById(req.propertyId);
      const matchesSearch = searchTerm === '' ||
        req.issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property && property.address.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesProperty = filterPropertyId === '' || req.propertyId === filterPropertyId;
      const matchesPriority = filterPriority === '' || req.priority === filterPriority;
      return matchesSearch && matchesProperty && matchesPriority;
    });
  }, [maintenanceRequests, searchTerm, filterPropertyId, filterPriority, getPropertyById]);

  const propertyOptions = [{ value: '', label: 'All Properties' }, ...properties.map(p => ({ value: p.id, label: p.address }))];
  const priorityOptions = [{ value: '', label: 'All Priorities' }, ...Object.values(MaintenancePriority).map(p => ({ value: p, label: p }))];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <PageHeader
        title="Maintenance"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 mr-2">
              <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`} title="Board View"><Squares2X2Icon className="w-5 h-5" /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`} title="List View"><ListBulletIcon className="w-5 h-5" /></button>
            </div>
            <Button onClick={handleSimulateMarketplaceJob} variant="secondary" leftIcon={<BriefcaseIcon className="w-5 h-5" />} disabled={properties.length === 0}>
              Simulate Job
            </Button>
            <Button onClick={handleAddRequest} leftIcon={<PlusCircleIcon className="w-5 h-5" />} disabled={properties.length === 0}>
              Add Request
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search requests..."
          className="w-full sm:w-64 px-3 py-2 bg-white border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterPropertyId} onChange={(e) => setFilterPropertyId(e.target.value)} className="px-3 py-2 bg-white border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none">
          {propertyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 bg-white border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none">
          {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
        {properties.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-lg">
            <WrenchScrewdriverIcon className="w-12 h-12 mb-2" />
            <p>Add a property to start managing maintenance.</p>
          </div>
        ) : viewMode === 'board' ? (
          <div className="flex h-full gap-6 pb-4">
            {KANBAN_COLUMNS.map(column => {
              const columnRequests = filteredRequests.filter(r => column.statuses.includes(r.status))
                .sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime());
              return (
                <div
                  key={column.id}
                  className="flex-1 min-w-[280px] max-w-sm flex flex-col bg-zinc-50/50 rounded-xl border border-zinc-200/60"
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, column.id)}
                >
                  <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                    <h3 className="font-semibold text-zinc-900 text-sm">{column.title}</h3>
                    <span className="bg-zinc-200/50 text-zinc-600 px-2 py-0.5 rounded-full text-xs font-bold">{columnRequests.length}</span>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {columnRequests.map(req => (
                      <MaintenanceRequestCard
                        key={req.id}
                        request={req}
                        property={getPropertyById(req.propertyId)}
                        tenant={req.tenantId ? getTenantById(req.tenantId) : undefined}
                        onEdit={handleEditRequest}
                        onDelete={handleDeleteRequest}
                        onViewDetails={handleViewDetails}
                        isDraggable={true}
                        onDragStart={onDragStart}
                      />
                    ))}
                    {columnRequests.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-zinc-100 rounded-lg flex items-center justify-center text-zinc-300 text-xs">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View Fallback
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-full pb-10">
            {filteredRequests.map(req => (
              <MaintenanceRequestCard
                key={req.id}
                request={req}
                property={getPropertyById(req.propertyId)}
                tenant={req.tenantId ? getTenantById(req.tenantId) : undefined}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
                onViewDetails={handleViewDetails}
                isDraggable={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <MaintenanceRequestForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingRequest}
          properties={properties}
          tenants={tenants}
          defaultPropertyId={filterPropertyId || undefined}
        />
      )}
      {viewingRequest && (
        <MaintenanceDetailsModal
          request={viewingRequest}
          property={getPropertyById(viewingRequest.propertyId)}
          tenant={viewingRequest.tenantId ? getTenantById(viewingRequest.tenantId) : undefined}
          onClose={() => setViewingRequest(null)}
          onBookProvider={handleBookProvider}
          documents={documents}
          addDocument={addDocument}
          deleteDocument={deleteDocument}
          communicationLogs={communicationLogs}
          addCommunicationLog={addCommunicationLog}
          deleteCommunicationLog={deleteCommunicationLog}
          documentTemplates={documentTemplates}
          properties={properties}
          tenants={tenants}
          userProfile={userProfile}
          landlords={landlords}
          landlords={landlords}
          onSendToLandlord={handleSendToLandlord}
          folders={folders}
        />
      )}
    </div>
  );
};

export default MaintenancePage;
