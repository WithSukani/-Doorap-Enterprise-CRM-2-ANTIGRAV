
import React, { useState, useEffect } from 'react';
import { DocumentTemplate } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface DocumentTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: DocumentTemplate) => void;
  initialData?: DocumentTemplate | null;
}

const getInitialState = (initialData?: DocumentTemplate | null): Partial<DocumentTemplate> => {
  return initialData || {
    name: '',
    category: '',
    content: ''
  };
};

const DocumentTemplateForm: React.FC<DocumentTemplateFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [template, setTemplate] = useState<Partial<DocumentTemplate>>(getInitialState(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof DocumentTemplate, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setTemplate(getInitialState(initialData));
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof DocumentTemplate]) {
      setErrors(prev => ({ ...prev, [name as keyof DocumentTemplate]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof DocumentTemplate, string>> = {};
    if (!template.name?.trim()) newErrors.name = 'Template name is required.';
    if (!template.category?.trim()) newErrors.category = 'Category is required.';
    if (!template.content?.trim()) newErrors.content = 'Template content is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalTemplate: DocumentTemplate = {
      id: initialData?.id || `dtmpl_${Date.now()}`,
      name: template.name!,
      category: template.category!,
      content: template.content!
    };
    onSubmit(finalTemplate);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Document Template' : 'Add New Document Template'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label="Template Name" value={template.name || ''} onChange={handleChange} error={errors.name} placeholder="e.g., Standard Tenancy Agreement" />
        <Input name="category" label="Category" value={template.category || ''} onChange={handleChange} error={errors.category} placeholder="e.g., Lease, Notice, Inspection" />
        <Textarea name="content" label="Template Content" value={template.content || ''} onChange={handleChange} error={errors.content} rows={10} placeholder="Enter template text. You can use placeholders like {{TENANT_NAME}}, {{PROPERTY_ADDRESS}}, etc. (Placeholder functionality not yet implemented)" />
        <p className="text-xs text-neutral-DEFAULT">Basic placeholder support (e.g. {'{{PLACEHOLDER_NAME}}'}) can be manually replaced. Full mail-merge functionality is a future enhancement.</p>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add Template'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentTemplateForm;
