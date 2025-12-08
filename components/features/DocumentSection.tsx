import React, { useState } from 'react';
import { DocumentType, Document as DocumentData, DocumentParentType, DocumentTemplate, Property, Tenant, UserProfile, MaintenanceRequest, Inspection, Folder } from '../../types';
import Button from '../common/Button';
import DocumentForm from '../forms/DocumentForm';
import DocumentGenerationModal from '../modals/DocumentGenerationModal';
import TemplateManagerModal from '../modals/TemplateManagerModal';
import DocumentViewerModal from '../modals/DocumentViewerModal';
import { PlusCircleIcon, TrashIcon, DocumentTextIcon, PaperClipIcon, LinkIcon, DocumentCheckIcon as HeroDocumentCheckIcon, DocumentDuplicateIcon, SparklesIcon } from '../icons/HeroIcons';


const getDocumentTypeIcon = (type: (typeof DocumentType)[keyof typeof DocumentType]) => {
  switch (type) {
    case DocumentType.LEASE: return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
    case DocumentType.SAFETY_CERTIFICATE: return <HeroDocumentCheckIcon className="w-5 h-5 text-green-500" />;
    case DocumentType.INVOICE:
    case DocumentType.QUOTE: return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
    case DocumentType.PHOTO_VIDEO: return <PaperClipIcon className="w-5 h-5 text-orange-500" />;
    default: return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
  }
}

interface DocumentSectionProps {
  documents: DocumentData[];
  parentId: string;
  parentType: DocumentParentType;
  addDocument: (doc: DocumentData) => void;
  deleteDocument: (docId: string) => void;
  documentTemplates: DocumentTemplate[];
  properties: Property[];
  tenants: Tenant[];
  userProfile: UserProfile;
  parentObject: Property | Tenant | MaintenanceRequest | Inspection;
  folders?: Folder[];
  addDocumentTemplate?: (template: DocumentTemplate) => void;
}


const DocumentSection: React.FC<DocumentSectionProps> = ({
  documents, parentId, parentType, addDocument, deleteDocument,
  documentTemplates, properties, tenants, userProfile, parentObject,
  folders = [], addDocumentTemplate
}) => {
  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);

  // New State for Refined Workflow
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentData | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');


  const relevantDocuments = documents.filter(doc => doc.parentId === parentId && doc.parentType === parentType);

  const handleOpenForm = (docToEdit?: DocumentData | null) => {
    setEditingDocument(docToEdit || null);
    setIsDocumentFormOpen(true);
  }

  const handleFormSubmit = (doc: DocumentData) => {
    // if (editingDocument) { update logic if needed, current form handles add/edit via initialData }
    addDocument(doc); // addDocument likely handles add/update based on ID internally or onSubmit in form does
    setIsDocumentFormOpen(false);
    setEditingDocument(null);
  };

  const handleDelete = (docId: string) => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      deleteDocument(docId);
    }
  }

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-neutral-dark flex items-center">
          <PaperClipIcon className="w-5 h-5 mr-2 text-primary" />Documents ({relevantDocuments.length})
        </h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsTemplateManagerOpen(true)} leftIcon={<SparklesIcon className="w-4 h-4 text-indigo-500" />}>
            Create with Dori
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenForm(null)} leftIcon={<PlusCircleIcon className="w-4 h-4" />}>
            Upload File
          </Button>
        </div>
      </div>
      {relevantDocuments.length > 0 ? (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {relevantDocuments.map(doc => (
            <li key={doc.id} className="p-3 bg-neutral-light/70 rounded-md shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  {getDocumentTypeIcon(doc.type)}
                  <div className="ml-2 min-w-0">
                    <a
                      href={doc.fileUrl || '#'}
                      target="_blank" rel="noopener noreferrer"
                      onClick={(e) => {
                        if (doc.content) {
                          e.preventDefault();
                          setViewingDoc(doc);
                          setIsViewerOpen(true);
                        }
                      }}
                      className="font-medium text-primary hover:underline truncate block cursor-pointer"
                      title={doc.fileName || doc.name}
                    >
                      {doc.name}
                    </a>
                    <p className="text-xs text-neutral-DEFAULT">{doc.type} - {new Date(doc.uploadDate).toLocaleDateString()} {doc.fileSize ? `(${doc.fileSize})` : ''}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-secondary-dark hover:bg-secondary-light/50 px-2 py-1 flex-shrink-0">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
              {doc.notes && <p className="text-xs italic text-neutral-dark mt-1 pl-7">{doc.notes}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-DEFAULT text-sm py-4 text-center">No documents uploaded for this {parentType.replace('_', ' ')}.</p>
      )}

      {isDocumentFormOpen && (
        <DocumentForm
          isOpen={isDocumentFormOpen}
          onClose={() => { setIsDocumentFormOpen(false); setEditingDocument(null); }}
          onSubmit={handleFormSubmit}
          parentId={parentId}
          parentType={parentType}
          initialData={editingDocument}
        />
      )}

      {isGenerationModalOpen && (
        <DocumentGenerationModal
          isOpen={isGenerationModalOpen}
          onClose={() => setIsGenerationModalOpen(false)}
          onSubmit={addDocument}
          documentTemplates={documentTemplates}
          properties={properties}
          tenants={tenants}
          userProfile={userProfile}
          parentObject={parentObject}
          folders={folders}
          preSelectedTemplateId={selectedTemplateId}
        />
      )}

      {isTemplateManagerOpen && (
        <TemplateManagerModal
          isOpen={isTemplateManagerOpen}
          onClose={() => setIsTemplateManagerOpen(false)}
          templates={documentTemplates}
          onAdd={addDocumentTemplate || (() => { })}
          onDelete={() => { }} // Placeholder if not needed here or pass properly
          folders={folders} // Pass folders prop
          onUse={(template) => {
            setSelectedTemplateId(template.id);
            setIsTemplateManagerOpen(false);
            setIsGenerationModalOpen(true);
          }}
        />
      )}

      {isViewerOpen && viewingDoc && (
        <DocumentViewerModal
          isOpen={isViewerOpen}
          onClose={() => { setIsViewerOpen(false); setViewingDoc(null); }}
          document={viewingDoc}
        />
      )}
    </div>
  );
};

export default DocumentSection;