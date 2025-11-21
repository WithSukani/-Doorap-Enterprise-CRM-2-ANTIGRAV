
import React, { useState, useEffect } from 'react';
import { MaintenancePriority, SLA } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface SLAFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sla: SLA) => void;
  initialData?: SLA | null;
}

const getInitialSLAState = (initialData?: SLA | null): Partial<SLA> => {
  return initialData || {
    name: '',
    description: '',
    priorityLevel: MaintenancePriority.MEDIUM,
    responseTimeHours: undefined,
    resolutionTimeHours: undefined,
    isActive: true,
  };
};

const SLAForm: React.FC<SLAFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [sla, setSla] = useState<Partial<SLA>>(getInitialSLAState(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof SLA, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setSla(getInitialSLAState(initialData));
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    const checked = (e.target as HTMLInputElement).checked;


    if (name === "responseTimeHours" || name === "resolutionTimeHours") {
        setSla(prev => ({ ...prev, [name]: value === '' ? undefined : parseInt(value, 10) }));
    } else {
        setSla(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    if (errors[name as keyof SLA]) {
      setErrors(prev => ({ ...prev, [name as keyof SLA]: undefined }));
    }
  };


  const validate = () => {
    const newErrors: Partial<Record<keyof SLA, string>> = {};
    if (!sla.name?.trim()) newErrors.name = 'SLA name is required.';
    if (!sla.description?.trim()) newErrors.description = 'Description is required.';
    if (!sla.priorityLevel) newErrors.priorityLevel = 'Priority level is required.';
    if (sla.responseTimeHours !== undefined && (isNaN(sla.responseTimeHours) || sla.responseTimeHours < 0)) newErrors.responseTimeHours = 'Response time must be a positive number.';
    if (sla.resolutionTimeHours !== undefined && (isNaN(sla.resolutionTimeHours) || sla.resolutionTimeHours < 0)) newErrors.resolutionTimeHours = 'Resolution time must be a positive number.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalSLA: SLA = {
      id: initialData?.id || `sla_${Date.now()}`,
      name: sla.name!,
      description: sla.description!,
      priorityLevel: sla.priorityLevel!,
      responseTimeHours: sla.responseTimeHours,
      resolutionTimeHours: sla.resolutionTimeHours,
      isActive: sla.isActive === undefined ? true : sla.isActive,
    };
    onSubmit(finalSLA);
  };

  const priorityLevelOptions = Object.values(MaintenancePriority).map(p => ({ value: p, label: p }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit SLA' : 'Add New SLA'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label="SLA Name" value={sla.name || ''} onChange={handleChange} error={errors.name} placeholder="e.g., Urgent Repair Response"/>
        <Textarea name="description" label="Description" value={sla.description || ''} onChange={handleChange} error={errors.description} />
        <Select name="priorityLevel" label="Target Priority Level" value={sla.priorityLevel || ''} onChange={handleChange} options={priorityLevelOptions} error={errors.priorityLevel} placeholder="Select priority level"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="responseTimeHours" label="Response Time (Hours, Optional)" type="number" value={sla.responseTimeHours || ''} onChange={handleChange} error={errors.responseTimeHours} />
            <Input name="resolutionTimeHours" label="Resolution Time (Hours, Optional)" type="number" value={sla.resolutionTimeHours || ''} onChange={handleChange} error={errors.resolutionTimeHours} />
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="isActive" name="isActive" checked={sla.isActive === undefined ? true : sla.isActive} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"/>
          <label htmlFor="isActive" className="text-sm text-neutral-dark">Active SLA</label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add SLA'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default SLAForm;
