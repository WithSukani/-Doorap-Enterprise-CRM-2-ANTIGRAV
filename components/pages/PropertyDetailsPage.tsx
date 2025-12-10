import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, MeterReading, Folder, Landlord } from '../../types';
import Button from '../common/Button';
import {
    BuildingOffice2Icon, MapPinIcon, PencilIcon,
    UsersIcon, WrenchScrewdriverIcon, BoltIcon, DocumentTextIcon,
    ChatBubbleLeftRightIcon, ChevronRightIcon, ChevronLeftIcon
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
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
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

    // Tabs Configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BuildingOffice2Icon },
        { id: 'tenants', label: 'Tenants', icon: UsersIcon },
        { id: 'maintenance', label: 'Maintenance', icon: WrenchScrewdriverIcon },
        { id: 'utilities', label: 'Utilities', icon: BoltIcon },
        { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
        { id: 'activity', label: 'Activity Log', icon: ChatBubbleLeftRightIcon },
    ];

    return (
        <div className="animate-fade-in p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center text-sm text-zinc-500">
                    <button onClick={() => navigate('/properties')} className="hover:text-zinc-900 transition-colors">Properties</button>
                    <ChevronRightIcon className="w-4 h-4 mx-2" />
                    <span className="text-zinc-900 font-medium">{property.address}</span>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden p-6 flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full md:w-64 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 border border-zinc-200">
                        <img
                            src={property.imageUrl || 'https://picsum.photos/600/400'}
                            alt={property.address}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 mb-1">{property.address}</h1>
                                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3">
                                    <div className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1" /> {property.postcode}</div>
                                    <div className="flex items-center border-l border-zinc-300 pl-4"><BuildingOffice2Icon className="w-4 h-4 mr-1" /> {property.type}</div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${propertyTenants.length > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {propertyTenants.length > 0 ? 'Occupied' : 'Vacant'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" size="sm" onClick={() => onEditProperty(property)} leftIcon={<PencilIcon className="w-4 h-4" />}>
                                    Edit
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto pt-4 border-t border-zinc-100">
                            <div>
                                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Owner</span>
                                <p className="text-sm font-medium text-zinc-900">{property.ownerName || 'Not Assigned'}</p>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Est. Value</span>
                                <p className="text-sm font-medium text-zinc-900">{property.value ? `£${property.value.toLocaleString()}` : '-'}</p>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Management Fee</span>
                                <p className="text-sm font-medium text-blue-600">
                                    {property.managementFeeType === 'Fixed'
                                        ? `£${property.managementFeeValue} / month`
                                        : property.managementFeeValue ? `${property.managementFeeValue}% of Rent` : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Layout */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm min-h-[500px]">
                <div className="border-b border-zinc-200 px-6 pt-4">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-zinc-900 text-zinc-900'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5">
                                <h3 className="text-base font-semibold text-zinc-900 mb-3">Property Notes</h3>
                                <p className="text-sm text-zinc-600 whitespace-pre-wrap">{property.notes || 'No notes available.'}</p>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                                <h3 className="text-base font-semibold text-zinc-900 mb-4">Quick Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-50 p-4 rounded-md">
                                        <span className="block text-xs text-zinc-500 uppercase mb-1">Active Tenants</span>
                                        <span className="text-2xl font-bold text-zinc-900">{propertyTenants.length}</span>
                                    </div>
                                    <div className="bg-zinc-50 p-4 rounded-md">
                                        <span className="block text-xs text-zinc-500 uppercase mb-1">Open Maintenance</span>
                                        <span className="text-2xl font-bold text-zinc-900">{propertyMaintenance.filter(m => m.status !== 'Completed').length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tenants' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-zinc-900">Active Tenants</h3>
                            {propertyTenants.length > 0 ? (
                                <div className="grid gap-4">
                                    {propertyTenants.map(t => (
                                        <div key={t.id} className="flex justify-between items-center p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-zinc-900">{t.name}</p>
                                                <p className="text-sm text-zinc-500">{t.email} • {t.phone}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active Lease</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-zinc-500 italic">No tenants found for this property.</p>}
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-zinc-900">Maintenance Requests</h3>
                                {/* Button to add request could go here */}
                            </div>
                            {propertyMaintenance.length > 0 ? (
                                <div className="space-y-3">
                                    {propertyMaintenance.map(mr => (
                                        <div key={mr.id} className="p-4 bg-white border border-zinc-200 rounded-lg flex justify-between items-center hover:shadow-sm transition-shadow">
                                            <div>
                                                <p className="font-medium text-zinc-900">{mr.issueTitle}</p>
                                                <p className="text-xs text-zinc-500">Reported on {new Date(mr.reportedDate).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${mr.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {mr.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-zinc-500 italic">No maintenance history.</p>}
                        </div>
                    )}

                    {activeTab === 'utilities' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-zinc-900">Meter Readings</h3>
                                {/* Add Meter functionality would need to be passed down or handled here */}
                            </div>

                            {propertyMeters.length > 0 ? (
                                <table className="min-w-full text-sm divide-y divide-zinc-200 border border-zinc-200 rounded-lg overflow-hidden">
                                    <thead className="bg-zinc-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
                                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Type</th>
                                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Reading</th>
                                            <th className="px-4 py-3 text-left font-medium text-zinc-500">Context</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-zinc-100">
                                        {propertyMeters.map(mr => (
                                            <tr key={mr.id}>
                                                <td className="px-4 py-3 text-zinc-900">{new Date(mr.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-zinc-900">{mr.type}</td>
                                                <td className="px-4 py-3 font-mono text-zinc-600">{mr.reading}</td>
                                                <td className="px-4 py-3 text-zinc-500">{mr.context}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="text-zinc-500 italic">No readings recorded.</p>}
                        </div>
                    )}

                    {activeTab === 'documents' && (
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
                    )}

                    {activeTab === 'activity' && (
                        <CommunicationLogSection
                            logs={communicationLogs}
                            parentId={property.id}
                            parentType="property"
                            addLog={addCommunicationLog}
                            deleteLog={deleteCommunicationLog}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
