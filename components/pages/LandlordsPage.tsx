
import React, { useState, useMemo } from 'react';
import { Landlord, Property, Tenant, ApprovalRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, MaintenanceRequest, RentPayment, Expense, MaintenanceStatus, EmailIntegrationSettings } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { 
    UserGroupIcon, PlusCircleIcon, FolderIcon, FolderOpenIcon, 
    FaceSmileIcon, FaceMehIcon, FaceFrownIcon,
    BuildingOffice2Icon, BanknotesIcon, EyeIcon, ClockIcon, BriefcaseIcon,
    PhoneIcon, EnvelopeIcon, MapPinIcon, ArrowTrendingUpIcon, 
    DocumentTextIcon, ArrowDownLeftIcon, SparklesIcon, CurrencyDollarIconSolid,
    CloudArrowUpIcon, ClipboardDocumentCheckIcon, ReceiptPercentIcon, AtSymbolIcon
} from '../icons/HeroIcons';
import DocumentSection from '../features/DocumentSection';
import CommunicationLogSection from '../features/CommunicationLogSection';
import PropertyDetailsModal from '../modals/PropertyDetailsModal';
import TenantDetailsModal from '../modals/TenantDetailsModal';
import BulkEmailModal from '../modals/BulkEmailModal';

// --- Sub-Components ---

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
    switch (sentiment) {
        case 'Happy': return <FaceSmileIcon className="w-5 h-5 text-green-500" />;
        case 'Unhappy': return <FaceFrownIcon className="w-5 h-5 text-red-500" />;
        default: return <FaceMehIcon className="w-5 h-5 text-yellow-500" />;
    }
}

interface LandlordCardProps {
    landlord: Landlord;
    properties: Property[];
    pendingApprovalsCount: number;
    onClick: () => void;
}

const LandlordCard: React.FC<LandlordCardProps> = ({ landlord, properties, pendingApprovalsCount, onClick }) => {
    const landlordProperties = properties.filter(p => p.ownerName === landlord.name);
    const totalValue = landlordProperties.reduce((sum, p) => sum + (p.value || 0), 0);
    
    const financialHealthColor = pendingApprovalsCount > 0 ? 'border-orange-400 ring-1 ring-orange-100' : 'border-zinc-200';

    return (
        <div onClick={onClick} className={`bg-white rounded-lg border ${financialHealthColor} shadow-sm hover:shadow-md transition-all cursor-pointer p-5 flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm mr-3">
                        {landlord.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 text-base">{landlord.name}</h3>
                        <div className="flex items-center text-xs text-zinc-500 mt-0.5">
                            <SentimentIcon sentiment={landlord.sentiment} />
                            <span className="ml-1.5">{landlord.sentiment}</span>
                        </div>
                    </div>
                </div>
                {pendingApprovalsCount > 0 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        {pendingApprovalsCount} Approval{pendingApprovalsCount > 1 ? 's' : ''}
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 border-t border-zinc-50 pt-4">
                <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Portfolio</p>
                    <p className="text-sm font-semibold text-zinc-900 flex items-center mt-1">
                        <BuildingOffice2Icon className="w-4 h-4 mr-1 text-zinc-400"/> {landlordProperties.length} Units
                    </p>
                </div>
                <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Est. Value</p>
                    <p className="text-sm font-semibold text-zinc-900 flex items-center mt-1">
                        <BanknotesIcon className="w-4 h-4 mr-1 text-zinc-400"/> £{(totalValue / 1000).toFixed(0)}k
                    </p>
                </div>
            </div>
            
            <div className="mt-auto pt-2 flex justify-between items-center text-xs text-zinc-400">
                <span>Last interaction: {new Date(landlord.lastInteractionDate).toLocaleDateString()}</span>
            </div>
        </div>
    );
}

const ApprovalWorkflowHub = ({ 
    approvals, 
    onApprove, 
    onReject,
    onCreateRequest
}: { 
    approvals: ApprovalRequest[], 
    onApprove: (id: string) => void, 
    onReject: (id: string) => void,
    onCreateRequest: () => void
}) => {
    return (
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                <h3 className="font-semibold text-zinc-900">Approval Workflow</h3>
                <Button size="sm" leftIcon={<PlusCircleIcon className="w-4 h-4"/>} onClick={onCreateRequest}>New Request</Button>
            </div>
            {approvals.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                    {approvals.map(appr => (
                        <div key={appr.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-50 transition-colors">
                            <div className="mb-3 sm:mb-0 flex-1 mr-4">
                                <div className="flex items-center mb-1">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full mr-2 ${
                                        appr.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        appr.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {appr.status}
                                    </span>
                                    <span className="text-sm font-medium text-zinc-900">{appr.title}</span>
                                </div>
                                <p className="text-xs text-zinc-500">{appr.description || `Request for £${appr.amount}`}</p>
                                <div className="flex items-center mt-2 space-x-4 text-xs text-zinc-400">
                                    <span className="flex items-center"><ClockIcon className="w-3 h-3 mr-1"/> Sent: {new Date(appr.sentDate).toLocaleDateString()}</span>
                                    {appr.viewedDate && <span className="flex items-center text-blue-400"><EyeIcon className="w-3 h-3 mr-1"/> Viewed {new Date(appr.viewedDate).toLocaleDateString()}</span>}
                                </div>
                                {appr.documentUrl && (
                                    <a href={appr.documentUrl} className="text-xs text-indigo-600 hover:underline mt-1 inline-block flex items-center">
                                        <DocumentTextIcon className="w-3 h-3 mr-1"/> Attached Document
                                    </a>
                                )}
                            </div>
                            
                            {appr.status === 'Sent' || appr.status === 'Viewed' ? (
                                <div className="flex space-x-2 self-start sm:self-center">
                                    <Button size="sm" variant="outline" onClick={() => onReject(appr.id)} className="text-red-600 hover:bg-red-50 border-red-200">Reject</Button>
                                    <Button size="sm" onClick={() => onApprove(appr.id)} className="bg-green-600 hover:bg-green-700 text-white border-none">
                                        {appr.type === 'Maintenance Quote' ? 'Approve & Pay' : 'Approve'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-right text-xs text-zinc-500 self-start sm:self-center">
                                    {appr.status === 'Approved' ? 'Signed digitally' : 'Request declined'}
                                    <br/>
                                    {appr.actionDate && new Date(appr.actionDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-zinc-400 text-sm">No active approval requests.</div>
            )}
        </div>
    );
}

const CreateApprovalModal = ({ isOpen, onClose, onSubmit, properties, documents }: any) => {
    const [requestType, setRequestType] = useState('Maintenance Quote');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [selectedDocId, setSelectedDocId] = useState('');
    const [uploadMode, setUploadMode] = useState<'upload' | 'select'>('upload');
    
    // Dynamic Fields
    const [contractor, setContractor] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [tenantName, setTenantName] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalDescription = description;
        // Enhance description based on type
        if (requestType === 'Maintenance Quote') finalDescription = `Contractor: ${contractor}. ${description}`;
        if (requestType === 'Invoice') finalDescription = `Due Date: ${dueDate}. ${description}`;
        if (requestType === 'Lease Renewal') finalDescription = `Tenant: ${tenantName}. ${description}`;
        
        let documentUrl = undefined;
        if (uploadMode === 'upload' && file) {
            documentUrl = `#mock-${file.name}`;
        } else if (uploadMode === 'select' && selectedDocId) {
            const doc = documents.find((d: any) => d.id === selectedDocId);
            documentUrl = doc?.fileUrl;
        }

        onSubmit({
            title,
            type: requestType,
            amount: amount ? parseFloat(amount) : undefined,
            description: finalDescription,
            status: 'Sent',
            sentDate: new Date().toISOString(),
            documentUrl
        });
        onClose();
        // Reset form
        setTitle(''); setAmount(''); setDescription(''); setFile(null); setContractor(''); setDueDate(''); setSelectedDocId('');
    }

    const requestTypes = [
        { id: 'Maintenance Quote', icon: BriefcaseIcon, label: 'Maintenance Quote' },
        { id: 'Invoice', icon: ReceiptPercentIcon, label: 'Invoice Approval' },
        { id: 'Lease Renewal', icon: UserGroupIcon, label: 'Lease / Tenancy' },
        { id: 'Compliance Certificate', icon: ClipboardDocumentCheckIcon, label: 'Compliance Doc' },
        { id: 'Other', icon: DocumentTextIcon, label: 'General Request' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Approval Request" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Type Selector */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Request Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {requestTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setRequestType(type.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                                    requestType === type.id 
                                        ? 'bg-zinc-900 text-white border-zinc-900 ring-2 ring-offset-1 ring-zinc-900' 
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                                }`}
                            >
                                <type.icon className={`w-5 h-5 mb-1 ${requestType === type.id ? 'text-white' : 'text-zinc-400'}`} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <Input label="Request Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={requestType === 'Invoice' ? 'e.g., PlumbRight Invoice #4092' : 'e.g., Boiler Repair Quote'} />
                    
                    {/* Dynamic Fields based on Type */}
                    {requestType === 'Maintenance Quote' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Contractor Name" name="contractor" value={contractor} onChange={(e) => setContractor(e.target.value)} placeholder="e.g., FixIt Ltd" />
                            <Input label="Quote Amount (£)" name="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                    )}

                    {requestType === 'Invoice' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Invoice Amount (£)" name="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                            <Input label="Due Date" name="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                    )}

                    {requestType === 'Lease Renewal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Tenant Name" name="tenantName" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                            <Input label="Proposed Rent (£)" name="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                    )}

                    {requestType === 'Compliance Certificate' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Cost of Service (£)" name="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Optional" />
                            <Input label="Expiry Date" name="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </div>
                    )}

                    <Textarea label="Description / Notes to Landlord" name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    
                    {/* Attachment Logic */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Attachment</label>
                        <div className="flex gap-4 mb-2">
                            <button type="button" onClick={() => setUploadMode('upload')} className={`text-xs font-medium ${uploadMode === 'upload' ? 'text-indigo-600 underline' : 'text-zinc-500 hover:text-zinc-700'}`}>Upload New</button>
                            <button type="button" onClick={() => setUploadMode('select')} className={`text-xs font-medium ${uploadMode === 'select' ? 'text-indigo-600 underline' : 'text-zinc-500 hover:text-zinc-700'}`}>Select Existing</button>
                        </div>

                        {uploadMode === 'upload' ? (
                            <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-zinc-50 transition-colors relative">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <CloudArrowUpIcon className="w-10 h-10 text-zinc-300 mb-2" />
                                {file ? (
                                    <p className="text-sm font-medium text-indigo-600">{file.name}</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-zinc-900">Click or drag to attach document</p>
                                        <p className="text-xs text-zinc-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Select 
                                name="existingDoc" 
                                value={selectedDocId} 
                                onChange={e => setSelectedDocId(e.target.value)} 
                                options={documents.map((d: any) => ({ label: d.name, value: d.id }))}
                                placeholder="Select a document..."
                            />
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Send Request</Button>
                </div>
            </form>
        </Modal>
    )
}

const DocumentVault = ({
    landlordId, documents, addDocument, deleteDocument, templates, properties, tenants, userProfile, onCreateFolder, folders
}: any) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 bg-white rounded-lg border border-zinc-200 shadow-sm p-4">
                <h4 className="font-semibold text-zinc-900 mb-4">Folders</h4>
                <ul className="space-y-1">
                    <li className="flex items-center justify-between p-2 bg-zinc-100 rounded-md text-sm font-medium text-zinc-900 cursor-pointer">
                        <div className="flex items-center"><FolderOpenIcon className="w-5 h-5 mr-2 text-zinc-500"/> All Documents</div>
                    </li>
                    {folders.map((f: any, i: number) => (
                        <li key={i} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-md text-sm text-zinc-600 cursor-pointer transition-colors">
                            <div className="flex items-center"><FolderIcon className="w-5 h-5 mr-2 text-zinc-400"/> {f.name}</div>
                            <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-xs">{f.count}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-zinc-100">
                    <Button size="sm" variant="outline" className="w-full" leftIcon={<PlusCircleIcon className="w-4 h-4"/>} onClick={onCreateFolder}>New Folder</Button>
                </div>
            </div>
            <div className="col-span-2">
                <DocumentSection
                    documents={documents}
                    parentId={landlordId}
                    parentType="financial_transaction" 
                    addDocument={addDocument}
                    deleteDocument={deleteDocument}
                    documentTemplates={templates}
                    properties={properties}
                    tenants={tenants}
                    userProfile={userProfile}
                    parentObject={{ id: landlordId, name: 'Landlord' } as any} 
                />
            </div>
        </div>
    )
}

const TenantsList = ({ 
    tenants, 
    properties, 
    onViewTenant 
}: { 
    tenants: Tenant[], 
    properties: Property[], 
    onViewTenant: (t: Tenant) => void 
}) => {
    return (
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                <h3 className="font-semibold text-zinc-900">Tenants ({tenants.length})</h3>
            </div>
            <div className="divide-y divide-zinc-100">
                {tenants.map(tenant => {
                    const property = properties.find(p => p.id === tenant.propertyId);
                    return (
                        <div key={tenant.id} onClick={() => onViewTenant(tenant)} className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex justify-between items-center">
                            <div>
                                <p className="font-medium text-zinc-900">{tenant.name}</p>
                                <p className="text-xs text-zinc-500">{tenant.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-zinc-700">{property?.address || 'Unknown Property'}</p>
                                <p className="text-xs text-zinc-500">Rent: £{tenant.rentAmount?.toLocaleString()}</p>
                            </div>
                        </div>
                    )
                })}
                {tenants.length === 0 && <div className="p-6 text-center text-zinc-400 text-sm">No tenants associated with this landlord's properties.</div>}
            </div>
        </div>
    );
}

const YieldReportModal = ({ isOpen, onClose, propertyFinancials, totalValue }: { isOpen: boolean, onClose: () => void, propertyFinancials: any[], totalValue: number }) => {
    if (!isOpen) return null;

    const totalAnnualRent = propertyFinancials.reduce((sum, p) => sum + p.rent * 12, 0); // Assuming monthly rent passed
    const totalAnnualNet = propertyFinancials.reduce((sum, p) => sum + p.net * 12, 0);
    
    const grossYield = totalValue > 0 ? (totalAnnualRent / totalValue) * 100 : 0;
    const netYield = totalValue > 0 ? (totalAnnualNet / totalValue) * 100 : 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Portfolio Yield Report">
            <div className="space-y-6">
                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                    <h4 className="text-sm font-semibold text-zinc-900 mb-4">Portfolio Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-zinc-500">Total Value</p>
                            <p className="font-bold text-zinc-900">£{totalValue.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Annual Gross Rent</p>
                            <p className="font-bold text-zinc-900">£{totalAnnualRent.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2 border-t border-zinc-200 pt-2 mt-2 grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-xs text-zinc-500">Gross Yield</p>
                                <p className="font-bold text-indigo-600 text-lg">{grossYield.toFixed(2)}%</p>
                            </div>
                             <div>
                                <p className="text-xs text-zinc-500">Net Yield (Est.)</p>
                                <p className="font-bold text-green-600 text-lg">{netYield.toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-zinc-900 mb-2">Property Breakdown</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {propertyFinancials.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 bg-white border border-zinc-100 rounded text-sm">
                                <span className="font-medium truncate w-1/2">{p.address}</span>
                                <span className="text-zinc-500">Yield: {p.propertyValue > 0 ? ((p.rent * 12 / p.propertyValue) * 100).toFixed(1) : 0}%</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={onClose}>Close Report</Button>
                </div>
            </div>
        </Modal>
    )
}

const CreateFolderModal = ({ isOpen, onClose, onSubmit }: any) => {
    const [folderName, setFolderName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(folderName);
        setFolderName('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Folder">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Folder Name" name="folderName" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="e.g., 2024 Invoices" />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create Folder</Button>
                </div>
            </form>
        </Modal>
    )
}

interface LandlordsPageProps {
    landlords: Landlord[];
    addLandlord: (l: Landlord) => void;
    updateLandlord: (l: Landlord) => void;
    deleteLandlord: (id: string) => void;
    properties: Property[];
    tenants: Tenant[];
    maintenanceRequests: MaintenanceRequest[];
    approvalRequests: ApprovalRequest[];
    addApprovalRequest: (r: ApprovalRequest) => void;
    updateApprovalRequest: (r: ApprovalRequest) => void;
    documents: Document[];
    addDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: CommunicationLog) => void;
    deleteCommunicationLog: (logId: string) => void;
    documentTemplates: DocumentTemplate[];
    userProfile: UserProfile;
    rentPayments: RentPayment[];
    expenses: Expense[];
    updateMaintenanceRequest: (request: MaintenanceRequest) => void;
    emailSettings: EmailIntegrationSettings | null;
}

const LandlordsPage: React.FC<LandlordsPageProps> = ({
    landlords, addLandlord, updateLandlord, deleteLandlord,
    properties, tenants, maintenanceRequests,
    approvalRequests, addApprovalRequest, updateApprovalRequest,
    documents, addDocument, deleteDocument,
    communicationLogs, addCommunicationLog, deleteCommunicationLog,
    documentTemplates, userProfile, rentPayments, expenses,
    updateMaintenanceRequest, emailSettings
}) => {
    const [activeLandlord, setActiveLandlord] = useState<Landlord | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'tenants' | 'financials' | 'approvals' | 'documents' | 'activity'>('dashboard');
    
    const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
    const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);

    // Financial Filters State
    const [filterTime, setFilterTime] = useState('all');
    const [filterProperty, setFilterProperty] = useState('all');
    const [filterTenant, setFilterTenant] = useState('all');

    // Modals State
    const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
    const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);
    
    const [folders, setFolders] = useState([
        { name: 'Compliance & ID', count: 2 },
        { name: 'Monthly Statements', count: 12 },
        { name: 'Property Documents', count: 5 },
    ]);

    const getLandlordProperties = (landlordName: string) => properties.filter(p => p.ownerName === landlordName);
    
    const handleApprove = (id: string) => {
        const req = approvalRequests.find(r => r.id === id);
        if (req) {
            updateApprovalRequest({ ...req, status: 'Approved', actionDate: new Date().toISOString() });
            
            // Automatically update maintenance request status if linked
            if (req.maintenanceRequestId) {
                const linkedMaintReq = maintenanceRequests.find(m => m.id === req.maintenanceRequestId);
                if (linkedMaintReq) {
                    updateMaintenanceRequest({ ...linkedMaintReq, status: MaintenanceStatus.APPROVED });
                }
            }
        }
    };

    const handleReject = (id: string) => {
        const req = approvalRequests.find(r => r.id === id);
        if (req) {
            updateApprovalRequest({ ...req, status: 'Rejected', actionDate: new Date().toISOString() });
        }
    };

    const handleCreateApproval = (data: any) => {
        if (activeLandlord) {
            addApprovalRequest({
                id: `appr_${Date.now()}`,
                landlordId: activeLandlord.id,
                ...data
            });
        }
    }

    const handleCreateFolder = (name: string) => {
        setFolders(prev => [...prev, { name, count: 0 }]);
    }

    const bulkEmailRecipients = landlords.map(l => ({ id: l.id, name: l.name, email: l.email }));

    if (activeLandlord) {
        const landlordProperties = getLandlordProperties(activeLandlord.name);
        const landlordApprovals = approvalRequests.filter(r => r.landlordId === activeLandlord.id);
        const landlordTenants = tenants.filter(t => landlordProperties.some(p => p.id === t.propertyId));

        // --- Financial Logic ---
        const isDateInTimeRange = (dateStr: string) => {
            const date = new Date(dateStr);
            const now = new Date();
            if (filterTime === 'all') return true;
            if (filterTime === 'this_month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            if (filterTime === 'last_month') {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
            }
            if (filterTime === 'this_year') return date.getFullYear() === now.getFullYear();
            return true;
        }

        let totalRent = 0;
        let totalMgmtFees = 0;
        let totalMaintenance = 0;
        const propertyFinancials: any[] = [];

        landlordProperties.forEach(prop => {
            if (filterProperty !== 'all' && prop.id !== filterProperty) return;

            // Use REAL payments if available, filtered by time/tenant
            const relevantPayments = rentPayments.filter(rp => {
                if (rp.propertyId !== prop.id) return false;
                if (filterTenant !== 'all' && rp.tenantId !== filterTenant) return false;
                return isDateInTimeRange(rp.date);
            });

            let propRent = relevantPayments.reduce((sum, rp) => sum + rp.amount, 0);

            // Fallback to simulated rent if no payments logged yet, but respect filters
            if (relevantPayments.length === 0 && filterTime === 'all' && filterTenant === 'all') {
                 if (rentPayments.length === 0) {
                     const propTenants = tenants.filter(t => t.propertyId === prop.id);
                     propRent = propTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
                 }
            }

            // Expenses
            const relevantExpenses = expenses.filter(e => {
                if (e.propertyId !== prop.id) return false;
                return isDateInTimeRange(e.date);
            });
            const propMaint = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);

            // Management Fee Calculation
            let propFee = 0;
            if (prop.managementFeeType === 'Fixed') {
                const monthlyFee = prop.managementFeeValue || 0;
                if (filterTime === 'this_month' || filterTime === 'last_month') propFee = monthlyFee;
                else if (filterTime === 'this_year') propFee = monthlyFee * 12; // approx
                else propFee = monthlyFee; // Snapshot
            } else {
                const percentage = prop.managementFeeValue || 10;
                propFee = propRent * (percentage / 100);
            }

            totalRent += propRent;
            totalMaintenance += propMaint;
            totalMgmtFees += propFee;

            propertyFinancials.push({
                id: prop.id,
                address: prop.address,
                rent: propRent,
                maintenance: propMaint,
                fee: propFee,
                net: propRent - propMaint - propFee,
                propertyValue: prop.value || 0
            });
        });

        const totalOutgoings = totalMaintenance + totalMgmtFees;
        const netIncome = totalRent - totalOutgoings;
        const portfolioValue = landlordProperties.reduce((sum, p) => sum + (p.value || 0), 0);

        return (
            <div className="animate-slide-in-left min-h-screen pb-10">
                {/* Profile Header */}
                <div className="mb-8">
                    <div className="flex items-center text-sm text-zinc-500 mb-4">
                        <span onClick={() => setActiveLandlord(null)} className="hover:text-zinc-900 hover:underline cursor-pointer">Landlords</span>
                        <span className="mx-2">/</span>
                        <span className="text-zinc-900 font-medium">Profile</span>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-2xl font-bold">
                                        {activeLandlord.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-zinc-900">{activeLandlord.name}</h1>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-zinc-100 text-zinc-600`}>
                                                <div className={`w-2 h-2 rounded-full ${activeLandlord.status === 'Active' ? 'bg-green-500' : 'bg-zinc-400'}`}></div>
                                                {activeLandlord.status}
                                            </span>
                                            <span className="text-zinc-300">|</span>
                                            <span className="text-sm text-zinc-500 flex items-center gap-1">
                                                <SentimentIcon sentiment={activeLandlord.sentiment} /> {activeLandlord.sentiment}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-zinc-600">
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="w-4 h-4 text-zinc-400"/>
                                        <a href={`mailto:${activeLandlord.email}`} className="hover:text-zinc-900">{activeLandlord.email}</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-4 h-4 text-zinc-400"/>
                                        <span>{activeLandlord.phone}</span>
                                    </div>
                                    {activeLandlord.address && (
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <MapPinIcon className="w-4 h-4 text-zinc-400"/>
                                            <span>{activeLandlord.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:w-1/3 lg:w-1/4 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                                <div className="flex items-start gap-3">
                                    <SparklesIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">Dori's Insight</p>
                                        <p className="text-sm text-zinc-600 leading-snug">
                                            {activeLandlord.name.split(' ')[0]} is {activeLandlord.sentiment.toLowerCase()}. 
                                            {landlordApprovals.filter(a => a.status === 'Sent').length > 0 
                                                ? <span className="text-indigo-600 font-medium"> {landlordApprovals.filter(a => a.status === 'Sent').length} items pending approval.</span> 
                                                : " Portfolio is running smoothly."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-200 mb-6 bg-white px-4 rounded-t-lg">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {['dashboard', 'properties', 'tenants', 'approvals', 'documents'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-zinc-900 text-zinc-900'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-all`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                            
                            {/* Filtering Bar */}
                            <div className="lg:col-span-3 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex flex-wrap gap-4 items-center">
                                <span className="text-sm font-medium text-zinc-700 mr-2">Filter Financials:</span>
                                <Select 
                                    name="filterTime" 
                                    containerClassName="mb-0 w-40"
                                    value={filterTime} 
                                    onChange={(e) => setFilterTime(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Time' },
                                        { value: 'this_month', label: 'This Month' },
                                        { value: 'last_month', label: 'Last Month' },
                                        { value: 'this_year', label: 'This Year' },
                                    ]}
                                />
                                <Select 
                                    name="filterProperty" 
                                    containerClassName="mb-0 w-48"
                                    value={filterProperty} 
                                    onChange={(e) => setFilterProperty(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Properties' },
                                        ...landlordProperties.map(p => ({ value: p.id, label: p.address }))
                                    ]}
                                />
                                <Select 
                                    name="filterTenant" 
                                    containerClassName="mb-0 w-48"
                                    value={filterTenant} 
                                    onChange={(e) => setFilterTenant(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Tenants' },
                                        ...landlordTenants.map(t => ({ value: t.id, label: t.name }))
                                    ]}
                                />
                            </div>

                            {/* Financial Cards Row */}
                            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Income</p>
                                    <p className="text-xl font-bold text-zinc-900 mt-1">£{totalRent.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Est. Mgmt Fees</p>
                                    <p className="text-xl font-bold text-indigo-600 mt-1">£{totalMgmtFees.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Outgoings</p>
                                    <p className="text-xl font-bold text-red-600 mt-1">£{totalOutgoings.toLocaleString()}</p>
                                    <p className="text-[10px] text-zinc-400 mt-1">Maint + Fees</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm bg-green-50/50 border-green-100">
                                    <p className="text-xs text-green-800 uppercase tracking-wider font-bold">Net Income</p>
                                    <p className="text-xl font-bold text-green-700 mt-1">£{netIncome.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Property Performance Table */}
                            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden lg:col-span-2">
                                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                                    <h3 className="font-semibold text-zinc-900">Property Financial Performance</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-zinc-100">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Address</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Rent</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Fee</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Maint.</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Net</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {propertyFinancials.length > 0 ? propertyFinancials.map(pf => (
                                                <tr key={pf.id} className="hover:bg-zinc-50 text-sm">
                                                    <td className="px-4 py-3 font-medium text-zinc-900 truncate max-w-xs">{pf.address}</td>
                                                    <td className="px-4 py-3 text-right text-green-600">£{pf.rent.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-zinc-500">£{pf.fee.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right text-red-500">£{pf.maintenance.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-zinc-900">£{pf.net.toLocaleString()}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={5} className="p-4 text-center text-sm text-zinc-400">No data for selected filters</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Quick Actions & Summary */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-4">
                                    <h3 className="font-semibold text-zinc-900 mb-3">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <Button size="sm" variant="outline" className="w-full justify-start" leftIcon={<DocumentTextIcon className="w-4 h-4"/>}>Generate Statement</Button>
                                        <Button size="sm" variant="outline" className="w-full justify-start" leftIcon={<ArrowTrendingUpIcon className="w-4 h-4"/>} onClick={() => setIsYieldModalOpen(true)}>Run Yield Report</Button>
                                        <Button size="sm" variant="outline" className="w-full justify-start" leftIcon={<EnvelopeIcon className="w-4 h-4"/>}>Email Landlord</Button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-4">
                                    <h3 className="font-semibold text-zinc-900 mb-3">Portfolio Stats</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Properties</span>
                                            <span className="font-medium">{landlordProperties.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Tenants</span>
                                            <span className="font-medium">{landlordTenants.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Occupancy</span>
                                            <span className="font-medium">{(landlordTenants.length / (landlordProperties.length || 1) * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'properties' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                            {landlordProperties.map(p => {
                                const propTenants = tenants.filter(t => t.propertyId === p.id);
                                return (
                                    <div key={p.id} onClick={() => setViewingProperty(p)} className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm hover:border-zinc-400 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate max-w-[200px]">{p.address}</h4>
                                                <p className="text-xs text-zinc-500">{p.postcode}</p>
                                            </div>
                                            {propTenants.length > 0 ? (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Occupied</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Vacant</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-2 flex items-center justify-between border-t border-zinc-50 pt-2">
                                            <span className="flex items-center"><BanknotesIcon className="w-3 h-3 mr-1"/> Value: £{p.value?.toLocaleString()}</span>
                                            <span className="flex items-center"><CurrencyDollarIconSolid className="w-3 h-3 mr-1 text-indigo-400"/> Fee: {p.managementFeeType === 'Fixed' ? '£' : ''}{p.managementFeeValue}{p.managementFeeType === 'Percentage' ? '%' : ''}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'tenants' && (
                        <div className="animate-fade-in">
                            <TenantsList tenants={landlordTenants} properties={properties} onViewTenant={setViewingTenant} />
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className="animate-fade-in">
                            <ApprovalWorkflowHub 
                                approvals={landlordApprovals} 
                                onApprove={handleApprove} 
                                onReject={handleReject} 
                                onCreateRequest={() => setIsApprovalModalOpen(true)}
                            />
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="animate-fade-in">
                            <DocumentVault 
                                landlordId={activeLandlord.id}
                                documents={documents}
                                addDocument={addDocument}
                                deleteDocument={deleteDocument}
                                templates={documentTemplates}
                                properties={properties}
                                tenants={tenants}
                                userProfile={userProfile}
                                onCreateFolder={() => setIsNewFolderModalOpen(true)}
                                folders={folders}
                            />
                        </div>
                    )}
                </div>

                {/* Details Modals */}
                {viewingProperty && (
                    <PropertyDetailsModal 
                        property={viewingProperty}
                        tenants={tenants}
                        maintenanceRequests={maintenanceRequests}
                        onClose={() => setViewingProperty(null)}
                        documents={documents}
                        addDocument={addDocument}
                        deleteDocument={deleteDocument}
                        communicationLogs={communicationLogs}
                        addCommunicationLog={addCommunicationLog}
                        deleteCommunicationLog={deleteCommunicationLog}
                        documentTemplates={documentTemplates}
                        properties={properties}
                        userProfile={userProfile}
                        onMarketAnalysis={() => {}}
                    />
                )}
                {viewingTenant && (
                    <TenantDetailsModal
                        tenant={viewingTenant}
                        property={properties.find(p => p.id === viewingTenant.propertyId)}
                        onClose={() => setViewingTenant(null)}
                        documents={documents}
                        addDocument={addDocument}
                        deleteDocument={deleteDocument}
                        communicationLogs={communicationLogs}
                        addCommunicationLog={addCommunicationLog}
                        deleteCommunicationLog={deleteCommunicationLog}
                        onStartChat={() => {}}
                        documentTemplates={documentTemplates}
                        properties={properties}
                        tenants={tenants}
                        userProfile={userProfile}
                    />
                )}

                <YieldReportModal 
                    isOpen={isYieldModalOpen} 
                    onClose={() => setIsYieldModalOpen(false)}
                    propertyFinancials={propertyFinancials}
                    totalValue={portfolioValue}
                />

                <CreateApprovalModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    onSubmit={handleCreateApproval}
                    properties={landlordProperties}
                    documents={documents}
                />

                <CreateFolderModal
                    isOpen={isNewFolderModalOpen}
                    onClose={() => setIsNewFolderModalOpen(false)}
                    onSubmit={handleCreateFolder}
                />
            </div>
        );
    }

    // Directory View
    return (
        <div className="animate-slide-in-left">
            <PageHeader 
                title="Landlords" 
                subtitle={`Manage relationships with your ${landlords.length} property owners.`}
                actions={
                    <div className="flex gap-2">
                        {emailSettings?.isActive && (
                            <Button variant="secondary" onClick={() => setIsBulkEmailOpen(true)} leftIcon={<AtSymbolIcon className="w-5 h-5"/>}>
                                Bulk Email
                            </Button>
                        )}
                        <Button onClick={() => alert("Mock add landlord")} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
                            Add Client
                        </Button>
                    </div>
                }
            />

            {/* Filters Mock */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button className="px-4 py-1.5 rounded-full bg-zinc-900 text-white text-sm font-medium">All Clients</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50">Action Required</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50">High Value</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50">At Risk</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {landlords.map(landlord => (
                    <LandlordCard 
                        key={landlord.id}
                        landlord={landlord}
                        properties={properties}
                        pendingApprovalsCount={approvalRequests.filter(r => r.landlordId === landlord.id && r.status === 'Sent').length}
                        onClick={() => { setActiveLandlord(landlord); setActiveTab('dashboard'); }}
                    />
                ))}
            </div>

            {isBulkEmailOpen && (
                <BulkEmailModal 
                    isOpen={isBulkEmailOpen}
                    onClose={() => setIsBulkEmailOpen(false)}
                    recipients={bulkEmailRecipients}
                    context="Landlords"
                />
            )}
        </div>
    );
};

export default LandlordsPage;
