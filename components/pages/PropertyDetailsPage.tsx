import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, MeterReading, Folder, Landlord } from '../../types';
import Button from '../common/Button';
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
        <div className="animate-fade-in max-w-7xl mx-auto pb-12">

            {/* --- Hero Header Section --- */}
            <div className="relative bg-zinc-900 -mx-6 md:-mx-10 lg:-mx-16 -mt-6 md:-mt-10 lg:-mt-10 mb-8 pb-16 pt-10 px-6 md:px-10 lg:px-16 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${property.imageUrl || 'https://picsum.photos/1200/400'})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
                    <div className="flex-1 space-y-4">
                        {/* Breadcrumbs */}
                        <div className="flex items-center text-xs font-medium text-zinc-400 mb-2">
                            <button onClick={() => navigate('/properties')} className="hover:text-white transition-colors">PROPERTIES</button>
                            <ChevronRightIcon className="w-3 h-3 mx-2 opacity-50" />
                            <span className="text-white opacity-80">{property.type.toUpperCase()}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{property.address}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-zinc-300 text-sm">
                            <div className="flex items-center"><MapPinIcon className="w-4 h-4 mr-2 opacity-70" /> {property.postcode}</div>
                            <div className="flex items-center"><BuildingOffice2Icon className="w-4 h-4 mr-2 opacity-70" /> {property.ownerName || 'No Owner Assigned'}</div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${propertyTenants.length > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {propertyTenants.length > 0 ? 'OCCUPIED' : 'VACANT'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            className="bg-white text-zinc-900 hover:bg-zinc-100 border-transparent shadow-xl"
                            onClick={() => onEditProperty(property)}
                            leftIcon={<PencilIcon className="w-4 h-4" />}
                        >
                            Edit Property
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- Stats Grid (Overlapping Hero) --- */}
            <div className="relative z-20 -mt-24 mb-10 px-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-lg border border-zinc-100 flex items-center justify-between group hover:border-zinc-300 transition-colors">
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Est. Value</p>
                            <p className="text-2xl font-bold text-zinc-900">{property.value ? `£${property.value.toLocaleString()}` : '-'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-lg border border-zinc-100 flex items-center justify-between group hover:border-zinc-300 transition-colors">
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Management Fee</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {property.managementFeeType === 'Fixed'
                                    ? `£${property.managementFeeValue}`
                                    : `${property.managementFeeValue}%`}
                                <span className="text-sm font-normal text-zinc-400 ml-1">{property.managementFeeType === 'Fixed' ? '/mo' : 'of rent'}</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:text-blue-600 transition-colors">
                            <ArrowTrendingUpIcon className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-lg border border-zinc-100 flex items-center justify-between group hover:border-zinc-300 transition-colors">
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Open Issues</p>
                            <p className="text-2xl font-bold text-zinc-900">{openMaintenance}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${openMaintenance > 0 ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                            {openMaintenance > 0 ? <WrenchScrewdriverIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Layout --- */}
            <div className="flex flex-col lg:flex-row gap-8">

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
                                            ? 'text-zinc-900'
                                            : 'text-zinc-500 hover:text-zinc-700'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-t-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Panels */}
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fade-in-up">
                                <section>
                                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">About Property</h3>
                                    <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                                        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                            {property.notes || <span className="italic text-zinc-400">No notes available for this property. Click 'Edit Property' to add details.</span>}
                                        </p>
                                    </div>
                                </section>

                                {activeTenants > 0 && (
                                    <section>
                                        <div className="flex justify-between items-end mb-4">
                                            <h3 className="text-lg font-semibold text-zinc-900">Current Tenants</h3>
                                            <button onClick={() => setActiveTab('tenants')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {propertyTenants.map(t => (
                                                <div key={t.id} className="flex items-center p-4 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                                                        {t.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900">{t.name}</p>
                                                        <p className="text-sm text-zinc-500">{t.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {activeTab === 'tenants' && (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-zinc-900">Tenant History</h3>
                                    {/* Action button placehoder */}
                                </div>
                                {propertyTenants.length > 0 ? (
                                    <div className="grid gap-4">
                                        {propertyTenants.map(t => (
                                            <div key={t.id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-all shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                                        <UsersIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 text-lg">{t.name}</p>
                                                        <div className="flex flex-wrap gap-x-4 text-sm text-zinc-500 mt-1">
                                                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span> {t.email}</span>
                                                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span> {t.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full font-medium border border-green-100">
                                                        Active Lease
                                                    </span>
                                                    <button className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50">
                                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                                        <UsersIcon className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                                        <p className="text-zinc-500 font-medium">No tenants associated with this property.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'maintenance' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-zinc-900">Maintenance Requests</h3>
                                </div>
                                {propertyMaintenance.length > 0 ? (
                                    <div className="space-y-4">
                                        {propertyMaintenance.map(mr => (
                                            <div key={mr.id} className="p-5 bg-white border border-zinc-200 rounded-xl hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 p-2 rounded-lg ${mr.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            <WrenchScrewdriverIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-zinc-900">{mr.issueTitle}</h4>
                                                            <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-2">
                                                                <ClockIcon className="w-3.5 h-3.5" />
                                                                Reported {new Date(mr.reportedDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${mr.status === 'Completed'
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                        }`}>
                                                        {mr.status}
                                                    </span>
                                                </div>
                                                {mr.description && (
                                                    <p className="text-zinc-600 text-sm pl-[52px] mb-3 bg-zinc-50 p-3 rounded-lg mx-2 border border-zinc-100/50">
                                                        {mr.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                                        <WrenchScrewdriverIcon className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                                        <p className="text-zinc-500 font-medium">No maintenance history recorded.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'utilities' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-zinc-900">Meter Readings</h3>
                                </div>

                                {propertyMeters.length > 0 ? (
                                    <div className="overflow-hidden bg-white border border-zinc-200 rounded-xl shadow-sm">
                                        <table className="min-w-full text-sm divide-y divide-zinc-100">
                                            <thead className="bg-zinc-50/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-semibold text-zinc-900">Date</th>
                                                    <th className="px-6 py-4 text-left font-semibold text-zinc-900">Type</th>
                                                    <th className="px-6 py-4 text-left font-semibold text-zinc-900">Reading</th>
                                                    <th className="px-6 py-4 text-left font-semibold text-zinc-900">Context</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {propertyMeters.map(mr => (
                                                    <tr key={mr.id} className="hover:bg-zinc-50/80 transition-colors">
                                                        <td className="px-6 py-4 text-zinc-600 font-medium">{new Date(mr.date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${mr.type === 'Electric' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                    mr.type === 'Gas' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                        'bg-cyan-50 text-cyan-700 border-cyan-100'
                                                                }`}>
                                                                <BoltIcon className="w-3 h-3" />
                                                                {mr.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded">{mr.reading}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-zinc-500">{mr.context}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                                        <BoltIcon className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                                        <p className="text-zinc-500 font-medium">No meter readings recorded.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="animate-fade-in-up">
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
                            <div className="animate-fade-in-up">
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
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                        <h4 className="font-semibold text-zinc-900 mb-4 flex items-center">
                            <BuildingOffice2Icon className="w-4 h-4 mr-2 text-zinc-400" />
                            Property Specifics
                        </h4>
                        <dl className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-zinc-50 pb-2">
                                <dt className="text-zinc-500">Postcode</dt>
                                <dd className="font-medium text-zinc-900">{property.postcode}</dd>
                            </div>
                            <div className="flex justify-between border-b border-zinc-50 pb-2">
                                <dt className="text-zinc-500">Property Type</dt>
                                <dd className="font-medium text-zinc-900">{property.type}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick Actions (Placeholder) */}
                    <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl shadow-lg p-5 text-white">
                        <h4 className="font-bold text-lg mb-2">Quick Actions</h4>
                        <p className="text-zinc-400 text-sm mb-4">Manage this property efficiently.</p>
                        <div className="space-y-2">
                            <button className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-left flex items-center">
                                <UsersIcon className="w-4 h-4 mr-3" /> Add New Tenant
                            </button>
                            <button className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-left flex items-center">
                                <WrenchScrewdriverIcon className="w-4 h-4 mr-3" /> Log Maintenance
                            </button>
                            <button className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-left flex items-center">
                                <DocumentTextIcon className="w-4 h-4 mr-3" /> Upload Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
