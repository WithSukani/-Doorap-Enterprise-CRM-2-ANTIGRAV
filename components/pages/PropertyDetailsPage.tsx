import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, MeterReading, Folder, Landlord } from '../../types';
import Button from '../common/Button';
import PageHeader from '../PageHeader';
import {
    BuildingOffice2Icon, MapPinIcon, PencilIcon,
    UsersIcon, WrenchScrewdriverIcon, BoltIcon, DocumentTextIcon,
    ChatBubbleLeftRightIcon, ChevronRightIcon, ChevronLeftIcon,
    BanknotesIcon, ArrowTrendingUpIcon, ClockIcon, CheckCircleIcon,
    PlusCircleIcon, EllipsisHorizontalIcon, EnvelopeIcon, PhoneIcon,
    ExclamationTriangleIcon
} from '../icons/HeroIcons';
import DocumentSection from '../features/DocumentSection';
import CommunicationLogSection from '../features/CommunicationLogSection';

interface PropertyDetailsPageProps {
    properties: Property[];
    tenants: Tenant[];
    maintenanceRequests: MaintenanceRequest[];
    documents: Document[];
    addDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: CommunicationLog) => void;
    deleteCommunicationLog: (logId: string) => void;
    documentTemplates: DocumentTemplate[];
    userProfile: UserProfile;
    meterReadings?: MeterReading[];
    onAddMeterReading?: (reading: MeterReading) => void;
    folders: Folder[];
    landlords?: Landlord[];
    onEditProperty: (property: Property) => void;
}

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
    properties, tenants, maintenanceRequests, documents, addDocument, deleteDocument,
    communicationLogs, addCommunicationLog, deleteCommunicationLog,
    documentTemplates, userProfile, meterReadings = [], onAddMeterReading, folders, landlords,
    onEditProperty
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const property = properties.find(p => p.id === id);

    if (!property) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
                <BuildingOffice2Icon className="w-16 h-16 mb-4 text-zinc-300" />
                <h2 className="text-xl font-semibold mb-2 text-zinc-900">Property Not Found</h2>
                <Button onClick={() => navigate('/properties')} leftIcon={<ChevronLeftIcon className="w-4 h-4" />}>
                    Back to Properties
                </Button>
            </div>
        );
    }

    // Filter Data
    const propertyTenants = tenants.filter(t => t.propertyId === property.id);
    const propertyMaintenance = maintenanceRequests.filter(mr => mr.propertyId === property.id);
    const propertyMeters = meterReadings.filter(mr => mr.propertyId === property.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Stats for Hero Section
    const activeTenants = propertyTenants.length;
    const openMaintenance = propertyMaintenance.filter(m => m.status !== 'Completed').length;

    // Tabs Configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BuildingOffice2Icon },
        { id: 'tenants', label: 'Tenants', icon: UsersIcon, count: activeTenants },
        { id: 'maintenance', label: 'Maintenance', icon: WrenchScrewdriverIcon, count: openMaintenance },
        { id: 'utilities', label: 'Utilities', icon: BoltIcon },
        { id: 'documents', label: 'Documents', icon: DocumentTextIcon, count: documents.filter(d => d.parentId === property.id).length },
        { id: 'activity', label: 'Activity', icon: ChatBubbleLeftRightIcon },
    ];

    return (
        <div className="animate-fade-in space-y-6">

            {/* --- Standard Header --- */}
            <PageHeader
                title={property.address}
                subtitle={`${property.postcode} • ${property.type}`}
                actions={
                    <Button
                        variant="primary"
                        onClick={() => onEditProperty(property)}
                        leftIcon={<PencilIcon className="w-4 h-4" />}
                    >
                        Edit Property
                    </Button>
                }
            />

            {/* --- Stats Grid (Standard Layout) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Est. Value</p>
                        <p className="text-2xl font-bold text-zinc-900">{property.value ? `£${property.value.toLocaleString()}` : '-'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                        <BanknotesIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Management Fee</p>
                        <p className="text-2xl font-bold text-zinc-900">
                            {property.managementFeeType === 'Fixed'
                                ? `£${property.managementFeeValue}`
                                : `${property.managementFeeValue}%`}
                            <span className="text-sm font-normal text-zinc-400 ml-1">{property.managementFeeType === 'Fixed' ? '/mo' : 'of rent'}</span>
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Open Issues</p>
                        <p className="text-2xl font-bold text-zinc-900">{openMaintenance}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${openMaintenance > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                        {openMaintenance > 0 ? <WrenchScrewdriverIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            {/* --- Main Content Layout --- */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column: Tabs & Content */}
                <div className="flex-1 min-w-0">
                    {/* Tabs */}
                    <div className="mb-6 border-b border-zinc-200">
                        <div className="flex space-x-6 overflow-x-auto no-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group relative pb-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                                            ? 'text-zinc-900 border-b-2 border-zinc-900'
                                            : 'text-zinc-500 hover:text-zinc-700 border-b-2 border-transparent hover:border-zinc-300'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-100 text-zinc-600'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Panels */}
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <section>
                                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">About Property</h3>
                                    <div className="bg-white rounded-lg p-5 border border-zinc-200 shadow-sm">
                                        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap text-sm">
                                            {property.notes || <span className="italic text-zinc-400">No notes available for this property. Click 'Edit Property' to add details.</span>}
                                        </p>
                                    </div>
                                </section>

                                {activeTenants > 0 && (
                                    <section>
                                        <div className="flex justify-between items-end mb-3">
                                            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Current Tenants</h3>
                                            <button onClick={() => setActiveTab('tenants')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {propertyTenants.map(t => (
                                                <div key={t.id} className="flex items-center p-4 bg-white border border-zinc-200 rounded-lg shadow-sm hover:border-zinc-300 transition-all cursor-pointer">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold mr-3 border border-zinc-200">
                                                        {t.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 text-sm">{t.name}</p>
                                                        <p className="text-xs text-zinc-500">{t.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {activeTab === 'tenants' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-zinc-900">Tenant History</h3>
                                    {/* Action button placehoder */}
                                </div>
                                {propertyTenants.length > 0 ? (
                                    <div className="space-y-3">
                                        {propertyTenants.map(t => (
                                            <div key={t.id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
                                                        <UsersIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900">{t.name}</p>
                                                        <div className="flex flex-wrap gap-x-4 text-xs text-zinc-500 mt-1">
                                                            <span className="flex items-center gap-1">{t.email}</span>
                                                            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-zinc-300"></span> {t.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                                                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-100">
                                                        Active Lease
                                                    </span>
                                                    <button className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded hover:bg-zinc-100">
                                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-zinc-300">
                                        <UsersIcon className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                                        <p className="text-zinc-500 font-medium">No tenants associated with this property.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'maintenance' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-zinc-900">Maintenance Requests</h3>
                                </div>
                                {propertyMaintenance.length > 0 ? (
                                    <div className="space-y-3">
                                        {propertyMaintenance.map(mr => (
                                            <div key={mr.id} className="p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all group shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 p-1.5 rounded ${mr.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            <WrenchScrewdriverIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-zinc-900 text-sm">{mr.issueTitle}</h4>
                                                            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                                                Reported {new Date(mr.reportedDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${mr.status === 'Completed'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                        {mr.status}
                                                    </span>
                                                </div>
                                                {mr.description && (
                                                    <p className="text-zinc-600 text-xs pl-[38px]">
                                                        {mr.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-zinc-300">
                                        <WrenchScrewdriverIcon className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                                        <p className="text-zinc-500 font-medium">No maintenance history recorded.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'utilities' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-zinc-900">Meter Readings</h3>
                                </div>

                                {propertyMeters.length > 0 ? (
                                    <div className="overflow-hidden bg-white border border-zinc-200 rounded-lg shadow-sm">
                                        <table className="min-w-full text-sm divide-y divide-zinc-100">
                                            <thead className="bg-zinc-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">Reading</th>
                                                    <th className="px-6 py-3 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">Context</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {propertyMeters.map(mr => (
                                                    <tr key={mr.id} className="hover:bg-zinc-50 transition-colors">
                                                        <td className="px-6 py-4 text-zinc-900 text-sm">{new Date(mr.date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${mr.type === 'Electric' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                    mr.type === 'Gas' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                        'bg-cyan-50 text-cyan-700 border-cyan-200'
                                                                }`}>
                                                                <BoltIcon className="w-3 h-3" />
                                                                {mr.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">{mr.reading}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-zinc-500 text-sm">{mr.context}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-zinc-300">
                                        <BoltIcon className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                                        <p className="text-zinc-500 font-medium">No meter readings recorded.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="animate-fade-in">
                                <DocumentSection
                                    documents={documents}
                                    parentId={property.id}
                                    parentType="property"
                                    addDocument={addDocument}
                                    deleteDocument={deleteDocument}
                                    documentTemplates={documentTemplates}
                                    properties={properties}
                                    tenants={tenants}
                                    userProfile={userProfile}
                                    parentObject={property}
                                    folders={folders}
                                />
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="animate-fade-in">
                                <CommunicationLogSection
                                    logs={communicationLogs}
                                    parentId={property.id}
                                    parentType="property"
                                    addLog={addCommunicationLog}
                                    deleteLog={deleteCommunicationLog}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Sidebar (on large screens) */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Quick Info Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
                        <h4 className="font-medium text-zinc-900 mb-3 flex items-center text-sm">
                            <BuildingOffice2Icon className="w-4 h-4 mr-2 text-zinc-400" />
                            Property Details
                        </h4>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-zinc-50 pb-2">
                                <dt className="text-zinc-500">Postcode</dt>
                                <dd className="font-medium text-zinc-900">{property.postcode}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-50 pb-2">
                                <dt className="text-zinc-500">Property Type</dt>
                                <dd className="font-medium text-zinc-900">{property.type}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-50 pb-2">
                                <dt className="text-zinc-500">Owner</dt>
                                <dd className="font-medium text-zinc-900">{property.ownerName || '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick Actions (Style Matched) */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
                        <h4 className="font-medium text-zinc-900 mb-3 text-sm">Quick Actions</h4>
                        <div className="space-y-2">
                            <button className="w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md text-sm font-medium transition-colors text-left flex items-center text-zinc-700">
                                <UsersIcon className="w-4 h-4 mr-2.5 text-zinc-400" /> Add New Tenant
                            </button>
                            <button className="w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md text-sm font-medium transition-colors text-left flex items-center text-zinc-700">
                                <WrenchScrewdriverIcon className="w-4 h-4 mr-2.5 text-zinc-400" /> Log Maintenance
                            </button>
                            <button className="w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md text-sm font-medium transition-colors text-left flex items-center text-zinc-700">
                                <DocumentTextIcon className="w-4 h-4 mr-2.5 text-zinc-400" /> Upload Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
