
import React, { useState, useEffect } from 'react';
import { MaintenanceStatus, MaintenancePriority, MaintenanceRequest, Property, Tenant } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface MaintenanceRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: MaintenanceRequest) => void;
  initialData?: MaintenanceRequest | null;
  properties: Property[];
  tenants: Tenant[];
  defaultPropertyId?: string;
}

const getInitialRequestState = (
  initialData?: MaintenanceRequest | null,
  defaultPropertyId?: string,
  properties: Property[] = []
): Partial<MaintenanceRequest> => {
  return initialData || {
    propertyId: defaultPropertyId || (properties.length > 0 ? properties[0].id : ''),
    tenantId: '',
    issueTitle: '',
    description: '',
    reportedDate: new Date().toISOString().split('T')[0], // Today's date
    status: MaintenanceStatus.NEW,
    priority: MaintenancePriority.MEDIUM,
    assignedProvider: '',
    quoteAmount: undefined,
    quoteUrl: '',
    invoiceAmount: undefined,
    invoiceUrl: '',
    marketplaceJobId: '',
    serviceBooked: false,
    completionDate: '',
    notes: ''
  };
};
  
const MaintenanceRequestForm: React.FC<MaintenanceRequestFormProps> = ({ 
  isOpen, onClose, onSubmit, initialData, properties, tenants, defaultPropertyId 
}) => {
  const [request, setRequest] = useState<Partial<MaintenanceRequest>>(getInitialRequestState(initialData, defaultPropertyId, properties));
  const [errors, setErrors] = useState<Partial<Record<keyof MaintenanceRequest, string>>>({});
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    if (isOpen) {
      const currentInitialState = getInitialRequestState(initialData, defaultPropertyId, properties);
      setRequest(currentInitialState);
      setErrors({});
      if (currentInitialState.propertyId) {
        setAvailableTenants(tenants.filter(t => t.propertyId === currentInitialState.propertyId));
      } else {
        setAvailableTenants([]);
      }
    }
  }, [initialData, isOpen, properties, tenants, defaultPropertyId]);

  useEffect(() => {
    if (request.propertyId) {
      setAvailableTenants(tenants.filter(t => t.propertyId === request.propertyId));
      if (request.tenantId && !tenants.find(t => t.id === request.tenantId && t.propertyId === request.propertyId)) {
        setRequest(prev => ({ ...prev, tenantId: '' }));
      }
    } else {
      setAvailableTenants([]);
      setRequest(prev => ({ ...prev, tenantId: '' }));
    }
  }, [request.propertyId, tenants, request.tenantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({ ...prev, [name]: value }));
     if (errors[name as keyof MaintenanceRequest]) {
      setErrors(prev => ({ ...prev, [name as keyof MaintenanceRequest]: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({...prev, [name]: value === '' ? undefined : parseFloat(value)}));
    if (errors[name as keyof MaintenanceRequest]) {
      setErrors(prev => ({ ...prev, [name as keyof MaintenanceRequest]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof MaintenanceRequest, string>> = {};
    if (!request.propertyId) newErrors.propertyId = 'Property is required.';
    if (!request.issueTitle?.trim()) newErrors.issueTitle = 'Issue title is required.';
    if (!request.description?.trim()) newErrors.description = 'Description is required.';
    if (!request.reportedDate) newErrors.reportedDate = 'Reported date is required.';
    if (!request.status) newErrors.status = 'Status is required.';
    if (!request.priority) newErrors.priority = 'Priority is required.';
    if (request.quoteAmount !== undefined && isNaN(request.quoteAmount)) newErrors.quoteAmount = 'Quote amount must be a number.';
    if (request.invoiceAmount !== undefined && isNaN(request.invoiceAmount)) newErrors.invoiceAmount = 'Invoice amount must be a number.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalRequest: MaintenanceRequest = {
      id: initialData?.id || `maint_${Date.now()}`,
      propertyId: request.propertyId!,
      tenantId: request.tenantId || undefined,
      issueTitle: request.issueTitle!,
      description: request.description!,
      reportedDate: request.reportedDate!,
      status: request.status!,
      priority: request.priority!,
      assignedProvider: request.assignedProvider,
      quoteAmount: request.quoteAmount,
      quoteUrl: request.quoteUrl,
      invoiceAmount: request.invoiceAmount,
      invoiceUrl: request.invoiceUrl,
      marketplaceJobId: request.marketplaceJobId,
      serviceBooked: request.serviceBooked || false,
      completionDate: request.completionDate,
      notes: request.notes
    };
    onSubmit(finalRequest);
  };

  const propertyOptions = properties.map(p => ({ value: p.id, label: `${p.address}, ${p.postcode}` }));
  const tenantOptions = availableTenants.map(t => ({ value: t.id, label: t.name }));
  const statusOptions = Object.values(MaintenanceStatus).map(s => ({ value: s, label: s }));
  const priorityOptions = Object.values(MaintenancePriority).map(p => ({ value: p, label: p }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Maintenance Request' : 'Add New Maintenance Request'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="propertyId" label="Property" value={request.propertyId || ''} onChange={handleChange} options={propertyOptions} error={errors.propertyId} disabled={properties.length === 0} placeholder={properties.length === 0 ? "No properties available" : "Select property"}/>
          <Select name="tenantId" label="Tenant (Optional)" value={request.tenantId || ''} onChange={handleChange} options={tenantOptions} disabled={!request.propertyId || availableTenants.length === 0} placeholder={!request.propertyId ? "Select property first" : (availableTenants.length === 0 ? "No tenants for property" : "Select tenant")}/>
        </div>
        <Input name="issueTitle" label="Issue Title" value={request.issueTitle || ''} onChange={handleChange} error={errors.issueTitle} placeholder="e.g., Leaking Tap"/>
        <Textarea name="description" label="Description of Issue" value={request.description || ''} onChange={handleChange} error={errors.description} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="reportedDate" label="Reported Date" type="date" value={request.reportedDate || ''} onChange={handleChange} error={errors.reportedDate} />
            <Input name="completionDate" label="Completion Date (Optional)" type="date" value={request.completionDate || ''} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select name="status" label="Status" value={request.status || ''} onChange={handleChange} options={statusOptions} error={errors.status} placeholder="Select status"/>
            <Select name="priority" label="Priority" value={request.priority || ''} onChange={handleChange} options={priorityOptions} error={errors.priority} placeholder="Select priority"/>
        </div>
        <Input name="assignedProvider" label="Assigned Provider (Optional)" value={request.assignedProvider || ''} onChange={handleChange} placeholder="e.g., Local Plumbers Ltd."/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="quoteAmount" label="Quote Amount (£) (Optional)" type="number" step="0.01" value={request.quoteAmount || ''} onChange={handleAmountChange} error={errors.quoteAmount} />
            <Input name="quoteUrl" label="Quote URL (Optional)" value={request.quoteUrl || ''} onChange={handleChange} placeholder="Link to quote document"/>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="invoiceAmount" label="Invoice Amount (£) (Optional)" type="number" step="0.01" value={request.invoiceAmount || ''} onChange={handleAmountChange} error={errors.invoiceAmount} />
            <Input name="invoiceUrl" label="Invoice URL (Optional)" value={request.invoiceUrl || ''} onChange={handleChange} placeholder="Link to invoice document"/>
        </div>
        <Input name="marketplaceJobId" label="Marketplace Job ID (Optional)" value={request.marketplaceJobId || ''} onChange={handleChange} />
        <Textarea name="notes" label="Internal Notes (Optional)" value={request.notes || ''} onChange={handleChange} />
        <div className="flex items-center">
            <input type="checkbox" id="serviceBooked" name="serviceBooked" checked={request.serviceBooked || false} onChange={(e) => setRequest(prev => ({ ...prev, serviceBooked: e.target.checked }))} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"/>
            <label htmlFor="serviceBooked" className="text-sm text-neutral-dark">Service Provider Booked</label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={properties.length === 0}>{initialData ? 'Save Changes' : 'Add Request'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default MaintenanceRequestForm;