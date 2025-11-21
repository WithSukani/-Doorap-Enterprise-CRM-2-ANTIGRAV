import React, { useState, useMemo } from 'react';
import { Inspection, InspectionStatus as InspectionStatusType, Property, Tenant, Document, CommunicationLog, DocumentParentType, CommunicationLogParentType, UserProfile, DocumentTemplate } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import InspectionForm from '../forms/InspectionForm'; // To be created
import Modal from '../common/Modal'; // For details view
import DocumentSection from '../features/DocumentSection';
import CommunicationLogSection from '../features/CommunicationLogSection';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, ShieldCheckIcon, CalendarDaysIcon } from '../icons/HeroIcons';

interface InspectionCardProps {
  inspection: Inspection;
  property?: Property;
  tenant?: Tenant;
  onEdit: (inspection: Inspection) => void;
  onDelete: (inspectionId: string) => void;
  onViewDetails: (inspection: Inspection) => void;
}

const getStatusPillColor = (status: (typeof InspectionStatusType)[keyof typeof InspectionStatusType]) => {
    switch(status) {
        case InspectionStatusType.SCHEDULED: return 'bg-blue-100 text-blue-700';
        case InspectionStatusType.IN_PROGRESS: return 'bg-yellow-100 text-yellow-700';
        case InspectionStatusType.COMPLETED: return 'bg-green-100 text-green-700';
        case InspectionStatusType.CANCELLED: return 'bg-gray-100 text-gray-700';
        case InspectionStatusType.NEEDS_FOLLOW_UP: return 'bg-purple-100 text-purple-700';
        default: return 'bg-neutral-100 text-neutral-700';
    }
}

const InspectionCard: React.FC<InspectionCardProps> = ({ inspection, property, tenant, onEdit, onDelete, onViewDetails }) => (
  <div className="bg-white p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold text-neutral-dark">{inspection.inspectionType}</h3>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusPillColor(inspection.status)}`}>{inspection.status}</span>
    </div>
    {property && <p className="text-sm text-neutral-DEFAULT mb-1">Property: {property.address}</p>}
    {tenant && <p className="text-sm text-neutral-DEFAULT mb-1">Tenant: {tenant.name}</p>}
    <p className="text-sm text-neutral-DEFAULT mb-2">Scheduled: {new Date(inspection.scheduledDate).toLocaleString()}</p>
    {inspection.inspectorName && <p className="text-xs text-neutral-DEFAULT mb-2">Inspector: {inspection.inspectorName}</p>}
    <div className="flex flex-wrap gap-2 mt-3">
      <Button size="sm" variant="ghost" onClick={() => onViewDetails(inspection)} leftIcon={<EyeIcon className="w-4 h-4"/>}>Details</Button>
      <Button size="sm" variant="outline" onClick={() => onEdit(inspection)} leftIcon={<PencilIcon className="w-4 h-4"/>}>Edit</Button>
      <Button size="sm" variant="danger" onClick={() => onDelete(inspection.id)} leftIcon={<TrashIcon className="w-4 h-4"/>}>Delete</Button>
    </div>
  </div>
);

interface InspectionDetailsModalProps {
    inspection: Inspection | null;
    property?: Property;
    tenant?: Tenant;
    onClose: () => void;
    // TODO: Add checklist item management props if implementing editable checklists here
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
}

const InspectionDetailsModal: React.FC<InspectionDetailsModalProps> = ({
    inspection, property, tenant, onClose,
    documents, addDocument, deleteDocument,
    communicationLogs, addCommunicationLog, deleteCommunicationLog,
    documentTemplates, properties, tenants, userProfile,
}) => {
    if (!inspection) return null;

    return (
        <Modal isOpen={!!inspection} onClose={onClose} title={`Inspection: ${inspection.inspectionType}`} size="xl">
            <div className="space-y-4">
                <p><strong>Type:</strong> {inspection.inspectionType}</p>
                {property && <p><strong>Property:</strong> {property.address}</p>}
                {tenant && <p><strong>Tenant:</strong> {tenant.name}</p>}
                <p><strong>Scheduled Date:</strong> {new Date(inspection.scheduledDate).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusPillColor(inspection.status)}`}>{inspection.status}</span></p>
                {inspection.inspectorName && <p><strong>Inspector:</strong> {inspection.inspectorName}</p>}
                {inspection.summaryNotes && <div className="p-3 bg-neutral-light rounded-md"><strong>Summary Notes:</strong> {inspection.summaryNotes}</div>}
                
                {/* Placeholder for Checklist Items */}
                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-md font-semibold text-neutral-dark mb-2">Checklist Items (Placeholder)</h4>
                    <p className="text-neutral-DEFAULT text-sm">Detailed checklist items would be displayed and managed here.</p>
                </div>

                <DocumentSection
                    documents={documents}
                    parentId={inspection.id}
                    parentType={'inspection' as DocumentParentType}
                    addDocument={addDocument}
                    deleteDocument={deleteDocument}
                    documentTemplates={documentTemplates}
                    properties={properties}
                    tenants={tenants}
                    userProfile={userProfile}
                    parentObject={inspection}
                />
                <CommunicationLogSection
                    logs={communicationLogs}
                    parentId={inspection.id}
                    parentType={'inspection' as CommunicationLogParentType}
                    addLog={addCommunicationLog}
                    deleteLog={deleteCommunicationLog}
                />
            </div>
            <div className="flex justify-end pt-6 mt-4 border-t">
                <Button onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};


interface InspectionsPageProps {
  inspections: Inspection[];
  addInspection: (inspection: Inspection) => void;
  updateInspection: (inspection: Inspection) => void;
  deleteInspection: (inspectionId: string) => void;
  properties: Property[];
  tenants: Tenant[];
  getPropertyById: (propertyId: string) => Property | undefined;
  getTenantById: (tenantId?: string) => Tenant | undefined;
  documents: Document[];
  addDocument: (doc: Document) => void;
  deleteDocument: (docId: string) => void;
  communicationLogs: CommunicationLog[];
  addCommunicationLog: (log: CommunicationLog) => void;
  deleteCommunicationLog: (logId: string) => void;
  documentTemplates: DocumentTemplate[];
  userProfile: UserProfile;
}

const InspectionsPage: React.FC<InspectionsPageProps> = ({
  inspections, addInspection, updateInspection, deleteInspection,
  properties, tenants, getPropertyById, getTenantById,
  documents, addDocument, deleteDocument,
  communicationLogs, addCommunicationLog, deleteCommunicationLog,
  documentTemplates, userProfile,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [viewingInspection, setViewingInspection] = useState<Inspection | null>(null);

  const handleAddInspection = () => { setEditingInspection(null); setIsFormOpen(true); };
  const handleEditInspection = (inspection: Inspection) => { setEditingInspection(inspection); setIsFormOpen(true); };
  const handleDeleteInspection = (id: string) => { if (window.confirm('Delete this inspection?')) deleteInspection(id); };
  const handleViewDetails = (inspection: Inspection) => setViewingInspection(inspection);
  
  const handleSubmitForm = (inspection: Inspection) => {
    if (editingInspection) updateInspection(inspection); else addInspection(inspection);
    setIsFormOpen(false);
  };
  
  const sortedInspections = useMemo(() => {
    return [...inspections].sort((a,b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [inspections]);

  return (
    <div className="animate-slide-in-left">
      <PageHeader
        title="Inspections"
        subtitle={`Schedule and track ${inspections.length} property inspections.`}
        actions={<Button onClick={handleAddInspection} leftIcon={<PlusCircleIcon className="w-5 h-5"/>} disabled={properties.length === 0}>Schedule Inspection</Button>}
      />
      {properties.length === 0 && <p className="text-neutral-DEFAULT p-4 bg-yellow-50 rounded-md mb-4">Add properties before scheduling inspections.</p>}

      {sortedInspections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedInspections.map(insp => (
            <InspectionCard
              key={insp.id}
              inspection={insp}
              property={getPropertyById(insp.propertyId)}
              tenant={getTenantById(insp.tenantId)}
              onEdit={handleEditInspection}
              onDelete={handleDeleteInspection}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <ShieldCheckIcon className="w-16 h-16 mx-auto text-neutral-DEFAULT mb-4"/>
          <p className="text-xl text-neutral-DEFAULT">No inspections scheduled.</p>
        </div>
      )}

      {isFormOpen && (
        <InspectionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingInspection}
          properties={properties}
          tenants={tenants}
        />
      )}
      {viewingInspection && (
        <InspectionDetailsModal
            inspection={viewingInspection}
            property={getPropertyById(viewingInspection.propertyId)}
            tenant={getTenantById(viewingInspection.tenantId)}
            onClose={() => setViewingInspection(null)}
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
        />
      )}
    </div>
  );
};

export default InspectionsPage;