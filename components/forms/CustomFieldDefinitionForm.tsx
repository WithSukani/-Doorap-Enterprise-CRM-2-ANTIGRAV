
import React, { useState, useEffect } from 'react';
import { CustomFieldDefinition, CustomFieldType } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea'; // For options list
import Button from '../common/Button';

interface CustomFieldDefinitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (definition: CustomFieldDefinition) => void;
  initialData?: CustomFieldDefinition | null;
}

const getInitialState = (initialData?: CustomFieldDefinition | null): Partial<CustomFieldDefinition> => {
  return initialData || {
    entityType: 'property',
    name: '',
    label: '',
    fieldType: CustomFieldType.TEXT,
    options: [],
    placeholder: '',
    isRequired: false
  };
};

const CustomFieldDefinitionForm: React.FC<CustomFieldDefinitionFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [definition, setDefinition] = useState<Partial<CustomFieldDefinition>>(getInitialState(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof CustomFieldDefinition, string>>>({});
  const [optionsString, setOptionsString] = useState(initialData?.options?.join('\n') || '');

  useEffect(() => {
    if (isOpen) {
      const state = getInitialState(initialData);
      setDefinition(state);
      setOptionsString(state.options?.join('\n') || '');
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'optionsString') {
        setOptionsString(value);
        setDefinition(prev => ({...prev, options: value.split('\n').map(opt => opt.trim()).filter(Boolean)}));
    } else {
        setDefinition(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    
    if (errors[name as keyof CustomFieldDefinition]) {
      setErrors(prev => ({ ...prev, [name as keyof CustomFieldDefinition]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof CustomFieldDefinition, string>> = {};
    if (!definition.entityType) newErrors.entityType = 'Entity type is required.';
    if (!definition.name?.trim()) newErrors.name = 'Field Name (system key) is required (e.g., petPolicy, parkingSpaces). Should be camelCase, no spaces.';
    else if (!/^[a-z]+[A-Za-z0-9]*$/.test(definition.name)) newErrors.name = 'Field Name must be camelCase (e.g. myFieldName) and contain no spaces or special characters.';
    if (!definition.label?.trim()) newErrors.label = 'Display Label is required.';
    if (!definition.fieldType) newErrors.fieldType = 'Field type is required.';
    if (definition.fieldType === CustomFieldType.SELECT && (!definition.options || definition.options.length === 0)) {
        newErrors.options = 'Options are required for Select field type (one per line).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalDefinition: CustomFieldDefinition = {
      id: initialData?.id || `cfd_${Date.now()}`,
      entityType: definition.entityType!,
      name: definition.name!,
      label: definition.label!,
      fieldType: definition.fieldType!,
      options: definition.fieldType === CustomFieldType.SELECT ? definition.options : undefined,
      placeholder: definition.placeholder,
      isRequired: definition.isRequired || false
    };
    onSubmit(finalDefinition);
  };

  const entityTypeOptions = [
    { value: 'property', label: 'Property' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'maintenance_request', label: 'Maintenance Request' }
  ];
  const fieldTypeOptions = Object.values(CustomFieldType).map(ft => ({ value: ft, label: ft }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Custom Field' : 'Add New Custom Field'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="entityType" label="Applies To" value={definition.entityType || ''} onChange={handleChange} options={entityTypeOptions} error={errors.entityType} />
        <Input name="label" label="Display Label" value={definition.label || ''} onChange={handleChange} error={errors.label} placeholder="e.g., Pet Policy" />
        <Input name="name" label="Field Name (System Key)" value={definition.name || ''} onChange={handleChange} error={errors.name} placeholder="e.g., petPolicy (camelCase, no spaces)" />
        <Select name="fieldType" label="Field Type" value={definition.fieldType || ''} onChange={handleChange} options={fieldTypeOptions} error={errors.fieldType} />
        
        {definition.fieldType === CustomFieldType.SELECT && (
          <Textarea name="optionsString" label="Options (one per line)" value={optionsString} onChange={handleChange} error={errors.options} rows={3} />
        )}
        {(definition.fieldType === CustomFieldType.TEXT || definition.fieldType === CustomFieldType.TEXTAREA || definition.fieldType === CustomFieldType.NUMBER) && (
             <Input name="placeholder" label="Placeholder (Optional)" value={definition.placeholder || ''} onChange={handleChange} />
        )}

        <div className="flex items-center">
            <input type="checkbox" id="isRequired" name="isRequired" checked={definition.isRequired || false} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"/>
            <label htmlFor="isRequired" className="text-sm text-neutral-dark">This field is required</label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add Field'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomFieldDefinitionForm;
  