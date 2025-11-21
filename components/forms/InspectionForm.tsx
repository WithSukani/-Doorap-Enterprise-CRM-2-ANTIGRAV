
import React, { useState, useEffect } from 'react';
import { Inspection, Property, Tenant, InspectionStatus } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface InspectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inspection: Inspection) => void;
  initialData?: Inspection | null;
  properties: Property[];
  tenants: Tenant[];
}

const getInitialState = (initialData?: Inspection | null, properties: Property[] = []): Partial<Inspection> => {
  return initialData || {
    propertyId: properties.length > 0 ? properties[0].id : '',
    tenantId: undefined,
    scheduledDate: new Date().toISOString(), // Default to now for datetime-local
    inspectionType: 'Routine Quarterly',
    status: InspectionStatus.SCHEDULED,
    summaryNotes: '',
    inspectorName: ''
  };
};

const InspectionForm: React.FC<InspectionFormProps> = ({ isOpen, onClose, onSubmit, initialData, properties, tenants }) => {
  const [inspection, setInspection] = useState<Partial<Inspection>>(getInitialState(initialData, properties));
  const [errors, setErrors] = useState<Partial<Record<keyof Inspection, string>>>({});
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      const state = getInitialState(initialData, properties);
      setInspection(state);
      if (state.propertyId) {
        setAvailableTenants(tenants.filter(t => t.propertyId === state.propertyId));
      } else {
        setAvailableTenants([]);
      }
      setErrors({});
    }
  }, [initialData, isOpen, properties, tenants]);

  useEffect(() => {
    if (inspection.propertyId) {
      setAvailableTenants(tenants.filter(t => t.propertyId === inspection.propertyId));
      if (inspection.tenantId && !tenants.find(t => t.id === inspection.tenantId && t.propertyId === inspection.propertyId)) {
        setInspection(prev => ({ ...prev, tenantId: undefined }));
      }
    } else {
      setAvailableTenants([]);
      setInspection(prev => ({ ...prev, tenantId: undefined }));
    }
  }, [inspection.propertyId, tenants, inspection.tenantId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInspection(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Inspection]) {
      setErrors(prev => ({ ...prev, [name as keyof Inspection]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Inspection, string>> = {};
    if (!inspection.propertyId) newErrors.propertyId = 'Property is required.';
    if (!inspection.scheduledDate) newErrors.scheduledDate = 'Scheduled date and time are required.';
    if (!inspection.inspectionType?.trim()) newErrors.inspectionType = 'Inspection type is required.';
    if (!inspection.status) newErrors.status = 'Status is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalInspection: Inspection = {
      id: initialData?.id || `insp_${Date.now()}`,
      propertyId: inspection.propertyId!,
      tenantId: inspection.tenantId || undefined,
      scheduledDate: inspection.scheduledDate!,
      inspectionType: inspection.inspectionType!,
      status: inspection.status!,
      summaryNotes: inspection.summaryNotes,
      inspectorName: inspection.inspectorName
    };
    onSubmit(finalInspection);
  };

  const propertyOptions = properties.map(p => ({ value: p.id, label: p.address }));
  const tenantOptions = availableTenants.map(t => ({ value: t.id, label: t.name }));
  const statusOptions = Object.values(InspectionStatus).map(s => ({ value: s, label: s }));
  const inspectionTypeOptions = [
    { value: 'Move-in', label: 'Move-in' },
    { value: 'Move-out', label: 'Move-out' },
    { value: 'Routine Quarterly', label: 'Routine Quarterly' },
    { value: 'Routine Bi-Annually', label: 'Routine Bi-Annually' },
    { value: 'Complaint Follow-up', label: 'Complaint Follow-up' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Inspection' : 'Schedule New Inspection'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="propertyId" label="Property" value={inspection.propertyId || ''} onChange={handleChange} options={propertyOptions} error={errors.propertyId} placeholder="Select property" disabled={properties.length === 0} />
        <Select name="tenantId" label="Tenant (Optional)" value={inspection.tenantId || ''} onChange={handleChange} options={tenantOptions} placeholder="Select tenant if applicable" disabled={!inspection.propertyId || availableTenants.length === 0}/>
        <Input name="scheduledDate" label="Scheduled Date & Time" type="datetime-local" value={inspection.scheduledDate || ''} onChange={handleChange} error={errors.scheduledDate} />
        <Select name="inspectionType" label="Inspection Type" value={inspection.inspectionType || ''} onChange={handleChange} options={inspectionTypeOptions} error={errors.inspectionType} />
        <Input name="inspectorName" label="Inspector Name (Optional)" value={inspection.inspectorName || ''} onChange={handleChange} placeholder="e.g., Alex Manager" />
        <Select name="status" label="Status" value={inspection.status || ''} onChange={handleChange} options={statusOptions} error={errors.status} />
        <Textarea name="summaryNotes" label="Summary Notes (Optional)" value={inspection.summaryNotes || ''} onChange={handleChange} placeholder="Initial notes or objectives for the inspection." />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={properties.length === 0}>{initialData ? 'Save Changes' : 'Schedule Inspection'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default InspectionForm;
  