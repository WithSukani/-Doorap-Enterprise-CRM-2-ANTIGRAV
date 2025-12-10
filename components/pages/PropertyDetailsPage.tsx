import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, MeterReading, Folder, Landlord } from '../../types';
import Button from '../common/Button';
import {
    BuildingOffice2Icon, MapPinIcon, PencilIcon,
    UsersIcon, WrenchScrewdriverIcon, BoltIcon, DocumentTextIcon,
    ChatBubbleLeftRightIcon, ChevronLeftIcon,
    BanknotesIcon, ArrowTrendingUpIcon, CheckCircleIcon,
    SparklesIcon, EllipsisHorizontalIcon,
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

    // Stats for Header Logic
    const activeTenants = propertyTenants.length;
    const openMaintenance = propertyMaintenance.filter(m => m.status !== 'Completed').length;
    const isOccupied = activeTenants > 0;

    // Tabs Configuration (Simple string keys to match LandlordsPage style if desired, but we have icons here too. We'll stick to a simple list)
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'tenants', label: 'Tenants' },
        { id: 'maintenance', label: 'Maintenance' },
        { id: 'utilities', label: 'Utilities' },
        { id: 'documents', label: 'Documents' },
        { id: 'activity', label: 'Activity' },
    ];

    return (
        <div className="animate-fade-in pb-10">
            {/* --- Breadcrumbs --- */}
            <div className="mb-8">
                <div className="flex items-center text-sm text-zinc-500 mb-4">
                    <span onClick={() => navigate('/properties')} className="hover:text-zinc-900 hover:underline cursor-pointer">Properties</span>
                    <span className="mx-2">/</span>
                    <span className="text-zinc-900 font-medium">Details</span>
                </div>

                {/* --- Profile Card Header (Landlord Style) --- */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                                    <BuildingOffice2Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-zinc-900">{property.address}</h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-zinc-100 text-zinc-600`}>
                                            <div className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {isOccupied ? 'Occupied' : 'Vacant'}
                                        </span>
                                        <span className="text-zinc-300">|</span>
                                        <span className="text-sm text-zinc-500">
                                            {property.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-zinc-600">
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="w-4 h-4 text-zinc-400" />
                                    <span>{property.postcode}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4 text-zinc-400" />
                                    <span>Owner: {property.ownerName || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-1/3 lg:w-1/4 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                            <div className="flex items-start gap-3">
                                <SparklesIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">Dori's Insight</p>
                                    <p className="text-sm text-zinc-600 leading-snug">
                                        Property is {isOccupied ? 'occupied' : 'vacant'}.
                                        {openMaintenance > 0
                                            ? <span className="text-orange-600 font-medium"> {openMaintenance} open maintenance issue{openMaintenance > 1 ? 's' : ''}.</span>
                                            : " No open maintenance issues."}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-50">
                                <button
                                    onClick={() => onEditProperty(property)}
                                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                                >
                                    <PencilIcon className="w-3 h-3" /> Edit Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Tabs (Landlord Style) --- */}
            <div className="border-b border-zinc-200 mb-6 bg-white px-4 rounded-t-lg">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                ? 'border-zinc-900 text-zinc-900'
                                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>


            {/* --- Main Content --- */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column: Content */}
                <div className="flex-1 min-w-0">

                    {/* Tab Panels */}
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">

                                {/* Quick Stats Grid in Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Est. Value</p>
                                            <p className="text-xl font-bold text-zinc-900 mt-1">{property.value ? `£${property.value.toLocaleString()}` : '-'}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                                            <BanknotesIcon className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Mgmt Fee</p>
                                            <p className="text-xl font-bold text-zinc-900 mt-1">
                                                {property.managementFeeType === 'Fixed'
                                                    ? `£${property.managementFeeValue}`
                                                    : `${property.managementFeeValue}%`}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <ArrowTrendingUpIcon className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Open Issues</p>
                                            <p className="text-xl font-bold text-zinc-900 mt-1">{openMaintenance}</p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${openMaintenance > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                            {openMaintenance > 0 ? <WrenchScrewdriverIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                                        </div>
                                    </div>
                                </div>

                                <section>
                                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">About Property</h3>
                                    <div className="bg-white rounded-lg p-5 border border-zinc-200 shadow-sm">
                                        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap text-sm">
                                            {property.notes || <span className="italic text-zinc-400">No notes available.</span>}
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
                            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden animate-fade-in">
                                <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                                    <h3 className="font-semibold text-zinc-900">Tenant History ({propertyTenants.length})</h3>
                                </div>
                                <div className="divide-y divide-zinc-100">
                                    {propertyTenants.length > 0 ? (
                                        propertyTenants.map(t => (
                                            <div key={t.id} className="p-4 hover:bg-zinc-50 transition-colors flex justify-between items-center bg-white cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
                                                        <UsersIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 text-sm">{t.name}</p>
                                                        <div className="flex flex-wrap gap-x-4 text-xs text-zinc-500 mt-0.5">
                                                            <span>{t.email}</span>
                                                            <span>• {t.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-100">
                                                        Active
                                                    </span>
                                                    <EllipsisHorizontalIcon className="w-5 h-5 text-zinc-300 group-hover:text-zinc-500" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-zinc-400 text-sm">No tenants recorded.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'maintenance' && (
                            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden animate-fade-in">
                                <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                                    <h3 className="font-semibold text-zinc-900">Maintenance Requests ({propertyMaintenance.length})</h3>
                                </div>
                                <div className="divide-y divide-zinc-100">
                                    {propertyMaintenance.length > 0 ? (
                                        propertyMaintenance.map(mr => (
                                            <div key={mr.id} className="p-4 hover:bg-zinc-50 transition-colors bg-white group cursor-pointer">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 p-1 rounded ${mr.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-zinc-900 text-sm">{mr.issueTitle}</h4>
                                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                                Reported {new Date(mr.reportedDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${mr.status === 'Completed'
                                                            ? 'bg-green-100 text-green-700 border-green-200'
                                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                        {mr.status}
                                                    </span>
                                                </div>
                                                {mr.description && (
                                                    <p className="text-zinc-600 text-xs pl-[34px] line-clamp-1 group-hover:line-clamp-none transition-all">
                                                        {mr.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-zinc-400 text-sm">No maintenance history.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'utilities' && (
                            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden animate-fade-in">
                                <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                                    <h3 className="font-semibold text-zinc-900">Meter Readings</h3>
                                </div>

                                {propertyMeters.length > 0 ? (
                                    <table className="min-w-full text-sm divide-y divide-zinc-100">
                                        <thead className="bg-zinc-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">Date</th>
                                                <th className="px-4 py-3 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-3 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">Reading</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 bg-white">
                                            {propertyMeters.map(mr => (
                                                <tr key={mr.id} className="hover:bg-zinc-50 transition-colors">
                                                    <td className="px-4 py-3 text-zinc-900 text-sm">{new Date(mr.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${mr.type === 'Electric' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                mr.type === 'Gas' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-cyan-50 text-cyan-700 border-cyan-200'
                                                            }`}>
                                                            {mr.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-zinc-600 text-xs">{mr.reading}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-zinc-400 text-sm">No meter readings.</div>
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

                {/* Right Column: Sidebar (on large screens) - Kept minimalistic */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-4">
                        <h4 className="font-semibold text-zinc-900 mb-3 text-sm">Quick Actions</h4>
                        <div className="space-y-2">
                            <button className="w-full py-2 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium transition-colors text-left flex items-center text-zinc-700 hover:border-zinc-300">
                                <UsersIcon className="w-3.5 h-3.5 mr-2 text-zinc-400" /> Add New Tenant
                            </button>
                            <button className="w-full py-2 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium transition-colors text-left flex items-center text-zinc-700 hover:border-zinc-300">
                                <WrenchScrewdriverIcon className="w-3.5 h-3.5 mr-2 text-zinc-400" /> Log Maintenance
                            </button>
                            <button className="w-full py-2 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium transition-colors text-left flex items-center text-zinc-700 hover:border-zinc-300">
                                <DocumentTextIcon className="w-3.5 h-3.5 mr-2 text-zinc-400" /> Upload Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
