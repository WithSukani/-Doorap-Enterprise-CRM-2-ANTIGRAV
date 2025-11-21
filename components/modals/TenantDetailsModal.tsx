
import React from 'react';
import { Tenant, Property, Document, CommunicationLog, DocumentTemplate, UserProfile } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ChatBubbleLeftEllipsisIcon } from '../icons/HeroIcons';
import DocumentSection from '../features/DocumentSection';
import CommunicationLogSection from '../features/CommunicationLogSection';

interface TenantDetailsModalProps {
    tenant: Tenant | null;
    property?: Property;
    onClose: () => void;
    documents: Document[];
    addDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: CommunicationLog) => void;
    deleteCommunicationLog: (logId: string) => void;
    onStartChat: (tenant: Tenant) => void;
    documentTemplates: DocumentTemplate[];
    properties: Property[];
    tenants: Tenant[];
    userProfile: UserProfile;
}

const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({ 
    tenant, property, onClose, documents, addDocument, deleteDocument, 
    communicationLogs, addCommunicationLog, deleteCommunicationLog, onStartChat,
    documentTemplates, properties, tenants, userProfile
}) => {
  if (!tenant) return null;

  return (
    <Modal isOpen={!!tenant} onClose={onClose} title={`Tenant Details: ${tenant.name}`} size="xl">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-neutral-dark">{tenant.name}</h2>
          <Button onClick={() => {onStartChat(tenant); onClose();}} variant="primary" leftIcon={<ChatBubbleLeftEllipsisIcon className="w-4 h-4"/>}>
            Chat with Tenant
          </Button>
        </div>
        <p><strong>Email:</strong> {tenant.email}</p>
        <p><strong>Phone:</strong> {tenant.phone}</p>
        {property && <p><strong>Property:</strong> {property.address}, {property.postcode}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {tenant.leaseStartDate && <p><strong>Lease Start:</strong> {new Date(tenant.leaseStartDate).toLocaleDateString()}</p>}
            {tenant.leaseEndDate && <p><strong>Lease End:</strong> {new Date(tenant.leaseEndDate).toLocaleDateString()}</p>}
            {tenant.rentAmount && <p><strong>Rent Amount:</strong> £{tenant.rentAmount.toLocaleString()}</p>}
            {tenant.securityDeposit && <p><strong>Security Deposit:</strong> £{tenant.securityDeposit.toLocaleString()}</p>}
        </div>

        {tenant.notes && <p className="mt-2 p-3 bg-neutral-light rounded-md"><strong>Notes:</strong> {tenant.notes}</p>}

        <DocumentSection 
            documents={documents}
            parentId={tenant.id}
            parentType="tenant"
            addDocument={addDocument}
            deleteDocument={deleteDocument}
            documentTemplates={documentTemplates}
            properties={properties}
            tenants={tenants}
            userProfile={userProfile}
            parentObject={tenant}
        />

        <CommunicationLogSection
            logs={communicationLogs}
            parentId={tenant.id}
            parentType="tenant"
            addLog={addCommunicationLog}
            deleteLog={deleteCommunicationLog}
        />

         <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default TenantDetailsModal;
