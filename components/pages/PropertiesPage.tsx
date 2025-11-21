
import React, { useState } from 'react';
import { Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, MeterReading } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import PropertyForm from '../forms/PropertyForm';
import { PlusCircleIcon, PencilIcon, TrashIcon, MapPinIcon, BuildingOffice2Icon, ArchiveBoxArrowDownIcon, ArrowUturnLeftIcon } from '../icons/HeroIcons'; 
import PropertyDetailsModal from '../modals/PropertyDetailsModal';
import MarketAnalysisModal from '../modals/MarketAnalysisModal';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
  onViewDetails: (property: Property) => void;
  onArchive: (property: Property) => void;
  onRestore: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit, onDelete, onViewDetails, onArchive, onRestore }) => {
  return (
    <div className={`group bg-white rounded-lg border border-zinc-200 overflow-hidden flex flex-col h-full hover:border-zinc-300 transition-colors ${property.isArchived ? 'opacity-75 grayscale' : ''}`}>
      <div className="relative h-48 bg-zinc-100 overflow-hidden border-b border-zinc-100">
        <img 
            src={property.imageUrl || 'https://picsum.photos/600/400'} 
            alt={property.address} 
            className="w-full h-full object-cover opacity-95" 
        />
        <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm border backdrop-blur ${property.isArchived ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-white/90 text-zinc-800 border-zinc-200/50'}`}>
                {property.isArchived ? 'Archived' : property.type}
            </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1 mb-1" title={property.address}>{property.address}</h3>
        <div className="flex items-center text-sm text-zinc-500 mb-4">
            <MapPinIcon className="w-4 h-4 mr-1.5 text-zinc-400"/>
            {property.postcode}
        </div>
        
        <div className="space-y-2 mb-6 flex-1">
            <div className="flex justify-between items-center text-sm border-b border-zinc-50 pb-2">
                <span className="text-zinc-500">Owner</span>
                <span className="font-medium text-zinc-900">{property.ownerName}</span>
            </div>
            {property.value && (
                <div className="flex justify-between items-center text-sm border-b border-zinc-50 pb-2">
                    <span className="text-zinc-500">Value</span>
                    <span className="font-medium text-zinc-900">£{property.value.toLocaleString()}</span>
                </div>
            )}
        </div>

        <div className="flex gap-2 pt-2 mt-auto">
          <Button size="sm" variant="secondary" onClick={() => onViewDetails(property)} className="flex-1 justify-center">Details</Button>
          {property.isArchived ? (
              <Button size="sm" variant="outline" onClick={() => onRestore(property)} className="px-2.5 text-green-600 hover:text-green-700 hover:border-green-200" title="Restore">
                  <ArrowUturnLeftIcon className="w-4 h-4"/>
              </Button>
          ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => onEdit(property)} className="px-2.5"><PencilIcon className="w-4 h-4"/></Button>
                <Button size="sm" variant="outline" onClick={() => onArchive(property)} className="px-2.5 text-zinc-500 hover:text-zinc-700" title="Archive">
                    <ArchiveBoxArrowDownIcon className="w-4 h-4"/>
                </Button>
              </>
          )}
          <Button size="sm" variant="outline" onClick={() => onDelete(property.id)} className="text-red-600 hover:text-red-700 hover:border-red-200 px-2.5"><TrashIcon className="w-4 h-4"/></Button>
        </div>
      </div>
    </div>
  );
};

interface PropertiesPageProps {
    properties: Property[];
    addProperty: (property: Property) => void;
    updateProperty: (property: Property) => void;
    deleteProperty: (propertyId: string) => void;
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
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ 
    properties, addProperty, updateProperty, deleteProperty, 
    tenants, maintenanceRequests,
    documents, addDocument, deleteDocument,
    communicationLogs, addCommunicationLog, deleteCommunicationLog,
    documentTemplates, userProfile,
    meterReadings, onAddMeterReading
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [analyzingProperty, setAnalyzingProperty] = useState<Property | null>(null);
  const [viewArchived, setViewArchived] = useState(false);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Delete this property and all associated data?')) {
      deleteProperty(propertyId);
    }
  };
  
  const handleArchiveProperty = (property: Property) => {
      if (window.confirm(`Are you sure you want to archive ${property.address}? It will be moved to the Archive folder.`)) {
          updateProperty({ ...property, isArchived: true });
      }
  };

  const handleRestoreProperty = (property: Property) => {
      updateProperty({ ...property, isArchived: false });
  };
  
  const handleViewDetails = (property: Property) => {
    setViewingProperty(property);
  };

  const handleSubmitForm = (propertyData: Property) => {
    if (editingProperty) {
      updateProperty(propertyData);
    } else {
      addProperty(propertyData);
    }
    setIsFormOpen(false);
    setEditingProperty(null);
  };

  const handleMarketAnalysis = (property: Property) => {
    setAnalyzingProperty(property);
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = 
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.postcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArchive = viewArchived ? p.isArchived : !p.isArchived;
    
    return matchesSearch && matchesArchive;
  });


  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Properties" 
        actions={
          <Button onClick={handleAddProperty} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
            Add Property
          </Button>
        }
      />
       <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search properties..."
          className="w-full max-w-md px-4 py-2.5 bg-white border border-zinc-200 rounded-md shadow-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm placeholder-zinc-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button 
                onClick={() => setViewArchived(false)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${!viewArchived ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                Active
            </button>
            <button 
                onClick={() => setViewArchived(true)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewArchived ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                Archived
            </button>
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onEdit={handleEditProperty} 
              onDelete={handleDeleteProperty}
              onViewDetails={handleViewDetails}
              onArchive={handleArchiveProperty}
              onRestore={handleRestoreProperty}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-zinc-200">
            <div className="bg-zinc-50 p-4 rounded-full inline-block mb-4">
                <BuildingOffice2Icon className="w-8 h-8 text-zinc-400"/>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">No {viewArchived ? 'archived' : ''} properties found</h3>
            <p className="text-sm text-zinc-500 mb-6">
                {viewArchived ? "You haven't archived any properties yet." : "Get started by adding your first property to the portfolio."}
            </p>
            {!viewArchived && (
                <Button onClick={handleAddProperty} variant="outline" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>
                    Add Property
                </Button>
            )}
        </div>
      )}

      {isFormOpen && (
        <PropertyForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleSubmitForm}
          initialData={editingProperty}
        />
      )}
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
            onMarketAnalysis={handleMarketAnalysis}
            meterReadings={meterReadings}
            onAddMeterReading={onAddMeterReading}
        />
      )}
      {analyzingProperty && (
        <MarketAnalysisModal
            isOpen={!!analyzingProperty}
            onClose={() => setAnalyzingProperty(null)}
            property={analyzingProperty}
            tenants={tenants}
        />
      )}
    </div>
  );
};

export default PropertiesPage;
