
import React, { useState } from 'react';
import { Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, MeterReading, Folder } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { UsersIcon, WrenchScrewdriverIcon, PresentationChartLineIcon, BoltIcon, PlusCircleIcon } from '../icons/HeroIcons';
import DocumentSection from '../features/DocumentSection';
import CommunicationLogSection from '../features/CommunicationLogSection';

interface PropertyDetailsModalProps {
    property: Property | null;
    tenants: Tenant[];
    maintenanceRequests: MaintenanceRequest[];
    onClose: () => void;
    documents: Document[];
    addDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: CommunicationLog) => void;
    deleteCommunicationLog: (logId: string) => void;
    documentTemplates: DocumentTemplate[];
    properties: Property[];
    userProfile: UserProfile;
    onMarketAnalysis: (property: Property) => void;
    meterReadings?: MeterReading[];
    onAddMeterReading?: (reading: MeterReading) => void;
    folders: Folder[];
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
    property, tenants, maintenanceRequests, onClose, documents, addDocument, deleteDocument,
    communicationLogs, addCommunicationLog, deleteCommunicationLog,
    documentTemplates, properties, userProfile, onMarketAnalysis, meterReadings = [], onAddMeterReading, folders
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'utilities'>('overview');
    const [isAddingReading, setIsAddingReading] = useState(false);
    const [newReadingType, setNewReadingType] = useState('Electric');
    const [newReadingValue, setNewReadingValue] = useState('');
    const [newReadingDate, setNewReadingDate] = useState(new Date().toISOString().split('T')[0]);

    if (!property) return null;

    const propertyTenants = tenants.filter(t => t.propertyId === property.id);
    const propertyMaintenance = maintenanceRequests.filter(mr => mr.propertyId === property.id);
    const propertyMeters = meterReadings.filter(mr => mr.propertyId === property.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAddReading = (e: React.FormEvent) => {
        e.preventDefault();
        if (onAddMeterReading && newReadingValue) {
            onAddMeterReading({
                id: `mr_${Date.now()}`,
                propertyId: property.id,
                type: newReadingType as any,
                reading: parseFloat(newReadingValue),
                date: newReadingDate,
                context: 'Routine'
            });
            setIsAddingReading(false);
            setNewReadingValue('');
        }
    }

    return (
        <Modal isOpen={!!property} onClose={onClose} title={property.address} size="xl">
            <div className="space-y-6">

                {/* Tabs */}
                <div className="border-b border-zinc-200">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('overview')} className={`pb-2 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Overview</button>
                        <button onClick={() => setActiveTab('utilities')} className={`pb-2 text-sm font-medium ${activeTab === 'utilities' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Utilities & Meters</button>
                    </nav>
                </div>

                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100">
                                <span className="block text-zinc-500 text-xs uppercase tracking-wider font-medium mb-1">Type</span>
                                <span className="font-semibold text-zinc-900">{property.type}</span>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100">
                                <span className="block text-zinc-500 text-xs uppercase tracking-wider font-medium mb-1">Owner</span>
                                <span className="font-semibold text-zinc-900">{property.ownerName}</span>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100">
                                <span className="block text-zinc-500 text-xs uppercase tracking-wider font-medium mb-1">Value</span>
                                <span className="font-semibold text-zinc-900">{property.value ? `£${property.value.toLocaleString()}` : 'N/A'}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-md border border-indigo-100 text-sm flex items-center justify-between">
                            <div>
                                <span className="block text-indigo-600 text-xs uppercase tracking-wider font-medium mb-1">Management Fee</span>
                                <span className="font-semibold text-indigo-900">
                                    {property.managementFeeType === 'Fixed'
                                        ? `£${property.managementFeeValue} / month`
                                        : `${property.managementFeeValue}% of Rent`}
                                </span>
                            </div>
                        </div>

                        {property.notes && (
                            <div className="text-sm text-zinc-600 bg-zinc-50 p-4 rounded-md border border-zinc-100">
                                <span className="font-semibold text-zinc-900 block mb-1">Notes</span>
                                {property.notes}
                            </div>
                        )}

                        <div className="pt-4 border-t border-zinc-100">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center"><UsersIcon className="w-4 h-4 mr-2 text-zinc-400" />Tenants</h4>
                            {propertyTenants.length > 0 ? (
                                <div className="space-y-2">
                                    {propertyTenants.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-md hover:border-zinc-300 transition-colors">
                                            <div>
                                                <p className="font-medium text-zinc-900 text-sm">{t.name}</p>
                                                <p className="text-xs text-zinc-500">{t.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-zinc-500 italic pl-6">No tenants assigned.</p>}
                        </div>

                        <div className="pt-4 border-t border-zinc-100">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center"><WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-zinc-400" />Maintenance</h4>
                            {propertyMaintenance.length > 0 ? (
                                <div className="space-y-2">
                                    {propertyMaintenance.map(mr => (
                                        <div key={mr.id} className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-md hover:border-zinc-300 transition-colors">
                                            <span className="text-sm text-zinc-900 font-medium">{mr.issueTitle}</span>
                                            <span className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full font-medium border border-zinc-200">{mr.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-zinc-500 italic pl-6">No active maintenance requests.</p>}
                        </div>

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

                        <CommunicationLogSection
                            logs={communicationLogs}
                            parentId={property.id}
                            parentType="property"
                            addLog={addCommunicationLog}
                            deleteLog={deleteCommunicationLog}
                        />
                    </>
                )}

                {activeTab === 'utilities' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-zinc-900 flex items-center"><BoltIcon className="w-5 h-5 mr-2 text-yellow-600" /> Meter Readings</h4>
                            <Button size="sm" variant="outline" onClick={() => setIsAddingReading(!isAddingReading)} leftIcon={<PlusCircleIcon className="w-4 h-4" />}>
                                {isAddingReading ? 'Cancel' : 'Add Reading'}
                            </Button>
                        </div>

                        {isAddingReading && (
                            <form onSubmit={handleAddReading} className="bg-zinc-50 p-4 rounded-lg mb-4 border border-zinc-200">
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <Select
                                        name="type" options={[{ value: 'Electric', label: 'Electric' }, { value: 'Gas', label: 'Gas' }, { value: 'Water', label: 'Water' }]}
                                        value={newReadingType} onChange={(e) => setNewReadingType(e.target.value)}
                                        label="Type"
                                    />
                                    <Input name="reading" type="number" label="Reading" value={newReadingValue} onChange={(e) => setNewReadingValue(e.target.value)} placeholder="00000" required />
                                    <Input name="date" type="date" label="Date" value={newReadingDate} onChange={(e) => setNewReadingDate(e.target.value)} />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" size="sm">Save Reading</Button>
                                </div>
                            </form>
                        )}

                        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
                            {propertyMeters.length > 0 ? (
                                <table className="min-w-full text-sm divide-y divide-zinc-100">
                                    <thead className="bg-zinc-50">
                                        <tr className="text-left text-zinc-500">
                                            <th className="px-4 py-2 font-medium">Date</th>
                                            <th className="px-4 py-2 font-medium">Type</th>
                                            <th className="px-4 py-2 font-medium">Reading</th>
                                            <th className="px-4 py-2 font-medium">Context</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {propertyMeters.map(mr => (
                                            <tr key={mr.id}>
                                                <td className="px-4 py-2 text-zinc-600">{new Date(mr.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 font-medium">{mr.type}</td>
                                                <td className="px-4 py-2 font-mono bg-zinc-50 rounded inline-block my-1">{mr.reading}</td>
                                                <td className="px-4 py-2 text-zinc-500 text-xs">{mr.context}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="text-zinc-500 text-sm italic p-4 text-center">No readings recorded yet.</p>}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-zinc-100 mt-6">
                    <Button onClick={() => { onMarketAnalysis(property!); onClose(); }} variant="secondary" leftIcon={<PresentationChartLineIcon className="w-4 h-4" />}>
                        Dori's Market Analysis
                    </Button>
                    <Button onClick={onClose} variant="primary">Close</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PropertyDetailsModal;