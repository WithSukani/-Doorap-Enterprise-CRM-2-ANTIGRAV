
import React, { useState, useEffect } from 'react';
import { DocumentType, Document as DocumentData } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface DocumentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (document: DocumentData) => void;
  parentId: string;
  parentType: 'property' | 'tenant' | 'maintenance_request' | 'inspection' | 'financial_transaction';
  initialData?: DocumentData | null;
}


const DocumentForm: React.FC<DocumentFormProps> = ({ isOpen, onClose, onSubmit, parentId, parentType, initialData }) => {
  
  const getInitialState = (): Partial<DocumentData> => ({
    name: '',
    type: DocumentType.OTHER,
    notes: '',
    fileName: '', 
    fileSize: '', 
    uploadDate: new Date().toISOString(),
    expiryDate: '', // Added
    ...initialData, 
    parentId, 
    parentType,
  });
  
  const [document, setDocument] = useState<Partial<DocumentData>>(getInitialState());
  const [errors, setErrors] = useState<Partial<Record<keyof DocumentData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setDocument(getInitialState());
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData, parentId, parentType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocument(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof DocumentData]) {
      setErrors(prev => ({ ...prev, [name as keyof DocumentData]: undefined }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocument(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        // In a real app, you'd upload the file and get a URL. For mock, we create a placeholder.
        fileUrl: `#mock-upload-${file.name}` 
      }));
      if (errors.fileName) setErrors(prev => ({ ...prev, fileName: undefined }));
    }
  };


  const validate = () => {
    const newErrors: Partial<Record<keyof DocumentData, string>> = {};
    if (!document.name?.trim()) newErrors.name = 'Document name/title is required.';
    if (!document.type) newErrors.type = 'Document type is required.';
    // if (!document.fileName?.trim()) newErrors.fileName = 'File is required (mocked).'; // Optional if URL can be provided directly
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalDocument: DocumentData = {
      id: initialData?.id || `doc_${Date.now()}`,
      parentId: document.parentId!,
      parentType: document.parentType!,
      name: document.name!,
      type: document.type!,
      uploadDate: document.uploadDate || new Date().toISOString(),
      notes: document.notes,
      fileUrl: document.fileUrl || `#mock-file-${Date.now()}`,
      fileName: document.fileName || 'document.pdf',
      fileSize: document.fileSize || 'N/A',
      expiryDate: document.expiryDate || undefined, // Ensure it's undefined if empty
    };
    onSubmit(finalDocument);
    onClose(); 
  };

  const documentTypeOptions = Object.values(DocumentType).map(type => ({ value: type, label: type }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Document' : 'Add New Document'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label="Document Name/Title" value={document.name || ''} onChange={handleChange} error={errors.name} placeholder="e.g., Gas Safety Certificate 2024" />
        <Select name="type" label="Document Type" value={document.type || ''} onChange={handleChange} options={documentTypeOptions} error={errors.type} placeholder="Select document type"/>
        
        <div className="mb-4">
            <label htmlFor="mockFile" className="block text-sm font-medium text-neutral-dark mb-1">File (Mock Upload)</label>
            <input 
                type="file" 
                id="mockFile" 
                name="mockFile"
                onChange={handleFileChange}
                className="block w-full text-sm text-neutral-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/30"
            />
            {document.fileName && <p className="text-xs mt-1 text-neutral-DEFAULT">Selected: {document.fileName} {document.fileSize ? `(${document.fileSize})` : ''}</p>}
            {errors.fileName && <p className="mt-1 text-xs text-secondary">{errors.fileName}</p>}
        </div>

        <Input name="expiryDate" label="Expiry Date (Optional)" type="date" value={document.expiryDate || ''} onChange={handleChange} />
        <Textarea name="notes" label="Notes (Optional)" value={document.notes || ''} onChange={handleChange} />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add Document'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentForm;
  