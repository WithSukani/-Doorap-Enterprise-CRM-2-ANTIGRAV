import React, { useState, useEffect } from 'react';
import {
  Document as DocumentData, DocumentTemplate, Property, Tenant, UserProfile,
  MaintenanceRequest, Inspection, DocumentType, DocumentParentType, Folder
} from '../../types';
import { generateDocumentFromTemplate } from '../ai/gemini';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Spinner from '../common/Spinner';
import { SparklesIcon } from '../icons/HeroIcons';

interface DocumentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (document: DocumentData) => void;
  documentTemplates: DocumentTemplate[];
  properties: Property[];
  tenants: Tenant[];
  userProfile: UserProfile;
  parentObject: Property | Tenant | MaintenanceRequest | Inspection;
  folders: Folder[];
  preSelectedTemplateId?: string;
}

const DocumentGenerationModal: React.FC<DocumentGenerationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  documentTemplates,
  properties,
  tenants,
  userProfile,
  parentObject,
  folders,
  preSelectedTemplateId
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(preSelectedTemplateId || '');

  useEffect(() => {
    if (isOpen && preSelectedTemplateId) {
      setSelectedTemplateId(preSelectedTemplateId);
    }
  }, [isOpen, preSelectedTemplateId]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentTypeMap: { [key: string]: DocumentParentType } = {
    address: 'property',
    name: 'tenant', // This is ambiguous, but likely tenant in this context
    issueTitle: 'maintenance_request',
    inspectionType: 'inspection'
  };

  const getParentType = (obj: any): DocumentParentType => {
    if (!obj) return 'property'; // Fallback
    if ('address' in obj) return 'property';
    if ('issueTitle' in obj) return 'maintenance_request';
    if ('inspectionType' in obj) return 'inspection';
    return 'tenant';
  };

  const parentType = getParentType(parentObject);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = documentTemplates.find(t => t.id === selectedTemplateId);
      const tenantName = (parentType === 'tenant' && parentObject && 'name' in parentObject) ? (parentObject as any).name : 'Tenant';
      if (template) {
        setDocumentName(`${template.name} - ${tenantName}`);
        if (template.folderId) setSelectedFolderId(template.folderId);
      }
    } else {
      setDocumentName('');
      setSelectedFolderId('');
    }
    setGeneratedContent('');
  }, [selectedTemplateId, documentTemplates, parentObject, parentType]);

  const handleGenerate = async () => {
    const template = documentTemplates.find(t => t.id === selectedTemplateId);
    if (!template) {
      setError('Please select a template.');
      return;
    }

    setIsLoading(true);
    setError(null);

    let contextTenant: Tenant | undefined;
    let contextProperty: Property | undefined;

    if (parentType === 'tenant') {
      contextTenant = parentObject as Tenant;
      contextProperty = properties.find(p => p.id === contextTenant?.propertyId);
    } else if (parentType === 'property') {
      contextProperty = parentObject as Property;
    } else if (parentType === 'maintenance_request' || parentType === 'inspection') {
      const parentId = (parentObject as MaintenanceRequest | Inspection).propertyId;
      contextProperty = properties.find(p => p.id === parentId);
      const tenantId = (parentObject as MaintenanceRequest | Inspection).tenantId;
      if (tenantId) {
        contextTenant = tenants.find(t => t.id === tenantId);
      }
    }


    try {
      const content = await generateDocumentFromTemplate(template, {
        tenant: contextTenant,
        property: contextProperty,
        userProfile,
      });
      setGeneratedContent(content);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!documentName.trim()) {
      setError('Please provide a name for the document.');
      return;
    }
    if (!generatedContent.trim()) {
      setError('Please generate content before saving.');
      return;
    }

    const template = documentTemplates.find(t => t.id === selectedTemplateId);

    const newDocument: DocumentData = {
      id: `doc_gen_${Date.now()}`,
      parentId: parentObject.id,
      parentType: parentType,
      name: documentName,
      type: DocumentType.OTHER, // Could be derived from template category
      uploadDate: new Date().toISOString(),
      content: generatedContent,
      templateId: selectedTemplateId,
      folderId: selectedFolderId || undefined
    };
    onSubmit(newDocument);
    onClose();
  };

  const templateOptions = documentTemplates.map(t => ({ value: t.id, label: t.name }));
  const selectedTemplate = documentTemplates.find(t => t.id === selectedTemplateId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Document from Template" size="xl">
      <div className="space-y-4">
        <Select
          label="Choose a Template"
          name="template"
          options={templateOptions}
          value={selectedTemplateId}
          onChange={e => setSelectedTemplateId(e.target.value)}
          placeholder="Select a document template..."
        />

        <Select
          label="Save to Folder (Optional)"
          name="folder"
          options={[{ value: '', label: 'No Folder' }, ...folders.map(f => ({ value: f.id, label: f.name }))]}
          value={selectedFolderId}
          onChange={e => setSelectedFolderId(e.target.value)}
        />

        {selectedTemplate && (
          <div className="p-3 my-2 border rounded-md bg-neutral-light/50">
            <h4 className="font-semibold text-sm text-neutral-dark mb-1">Template Preview:</h4>
            <Textarea
              name="template_preview"
              value={selectedTemplate.content}
              readOnly
              rows={5}
              className="text-xs bg-white"
            />
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={handleGenerate} isLoading={isLoading} disabled={!selectedTemplateId}>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Document
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Spinner />
            <p className="ml-3 text-neutral-DEFAULT">Generating content...</p>
          </div>
        )}

        {error && <p className="text-sm text-secondary text-center">{error}</p>}

        {generatedContent && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-neutral-dark">Generated Document:</h4>
            <Input
              label="Document Name"
              name="documentName"
              value={documentName}
              onChange={e => setDocumentName(e.target.value)}
            />
            <Textarea
              name="generated_content"
              value={generatedContent}
              readOnly
              rows={12}
              className="bg-white"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!generatedContent || !documentName.trim()}>
            Save Document
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentGenerationModal;