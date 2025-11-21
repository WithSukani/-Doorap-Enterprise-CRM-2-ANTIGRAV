
import React, { useState, useEffect } from 'react';
import { Tenant, Property } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface TenantFormFieldsProps {
  onCancel: () => void;
  onSubmit: (tenant: Tenant) => void;
  initialData?: Partial<Tenant> | null;
  properties: Property[];
  defaultPropertyId?: string;
}

const getInitialTenantState = (
    initialData?: Partial<Tenant> | null, 
    defaultPropertyId?: string, 
    properties: Property[] = []
  ): Partial<Tenant> => {
  return initialData || {
    propertyId: defaultPropertyId || (properties.length > 0 ? properties[0].id : ''),
    name: '',
    email: '',
    phone: '',
    leaseStartDate: '',
    leaseEndDate: '',
    rentAmount: undefined,
    securityDeposit: undefined,
    notes: ''
  };
};

const TenantFormFields: React.FC<TenantFormFieldsProps> = ({ onCancel, onSubmit, initialData, properties, defaultPropertyId }) => {
  const [tenant, setTenant] = useState<Partial<Tenant>>(getInitialTenantState(initialData, defaultPropertyId, properties));
  const [errors, setErrors] = useState<Partial<Record<keyof Tenant, string>>>({});

  useEffect(() => {
    setTenant(getInitialTenantState(initialData, defaultPropertyId, properties));
    setErrors({});
  }, [initialData, defaultPropertyId, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTenant(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Tenant]) {
      setErrors(prev => ({ ...prev, [name as keyof Tenant]: undefined }));
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const amount = value === '' ? undefined : parseFloat(value);
    setTenant(prev => ({ ...prev, [name]: isNaN(amount as number) ? undefined : amount }));
     if (errors[name as keyof Tenant]) {
      setErrors(prev => ({ ...prev, [name as keyof Tenant]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Tenant, string>> = {};
    if (!tenant.name?.trim()) newErrors.name = 'Name is required.';
    if (!tenant.email?.trim()) {
        newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(tenant.email)) {
        newErrors.email = 'Email is invalid.';
    }
    if (!tenant.phone?.trim()) newErrors.phone = 'Phone number is required.';
    if (!tenant.propertyId) newErrors.propertyId = 'Property selection is required.';
    if (tenant.rentAmount !== undefined && isNaN(tenant.rentAmount)) newErrors.rentAmount = 'Rent amount must be a number.';
    if (tenant.securityDeposit !== undefined && isNaN(tenant.securityDeposit)) newErrors.securityDeposit = 'Security deposit must be a number.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalTenant: Tenant = {
      id: (initialData as Tenant)?.id || `ten_${Date.now()}`,
      propertyId: tenant.propertyId!,
      name: tenant.name!,
      email: tenant.email!,
      phone: tenant.phone!,
      leaseStartDate: tenant.leaseStartDate,
      leaseEndDate: tenant.leaseEndDate,
      rentAmount: tenant.rentAmount,
      securityDeposit: tenant.securityDeposit,
      notes: tenant.notes,
    };
    onSubmit(finalTenant);
  };

  const propertyOptions = properties.map(p => ({ value: p.id, label: `${p.address}, ${p.postcode}` }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="propertyId" label="Property" value={tenant.propertyId || ''} onChange={handleChange} options={propertyOptions} error={errors.propertyId} disabled={properties.length === 0} placeholder={properties.length === 0 ? "No properties available" : "Select a property"}/>
        <Input name="name" label="Full Name" value={tenant.name || ''} onChange={handleChange} error={errors.name} placeholder="e.g., Alice Smith"/>
        <Input name="email" label="Email Address" type="email" value={tenant.email || ''} onChange={handleChange} error={errors.email} placeholder="e.g., alice@example.com"/>
        <Input name="phone" label="Phone Number" type="tel" value={tenant.phone || ''} onChange={handleChange} error={errors.phone} placeholder="e.g., 07123456789"/>
        <Input name="leaseStartDate" label="Lease Start Date" type="date" value={tenant.leaseStartDate || ''} onChange={handleChange} />
        <Input name="leaseEndDate" label="Lease End Date" type="date" value={tenant.leaseEndDate || ''} onChange={handleChange} />
        <Input name="rentAmount" label="Rent Amount (£)" type="number" value={tenant.rentAmount ?? ''} onChange={handleAmountChange} error={errors.rentAmount} placeholder="e.g., 1200"/>
        <Input name="securityDeposit" label="Security Deposit (£)" type="number" value={tenant.securityDeposit ?? ''} onChange={handleAmountChange} error={errors.securityDeposit} placeholder="e.g., 1500"/>
        <Textarea name="notes" label="Notes" value={tenant.notes || ''} onChange={handleChange} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={properties.length === 0}>{initialData?.id ? 'Save Changes' : 'Add Tenant'}</Button>
        </div>
      </form>
  );
};

export default TenantFormFields;
