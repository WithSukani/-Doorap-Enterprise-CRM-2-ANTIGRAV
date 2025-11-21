
import React, { useState, useEffect } from 'react';
import { RentPayment, Property, Tenant } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface RentPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: RentPayment) => void;
  initialData?: RentPayment | null;
  properties: Property[];
  tenants: Tenant[];
}

const getInitialState = (initialData?: RentPayment | null, tenants: Tenant[] = [], properties: Property[] = []): Partial<RentPayment> => {
  const defaultTenant = tenants.length > 0 ? tenants[0] : null;
  const defaultPropertyId = defaultTenant ? defaultTenant.propertyId : (properties.length > 0 ? properties[0].id : '');
  
  return initialData || {
    tenantId: defaultTenant?.id || '',
    propertyId: initialData?.propertyId || defaultPropertyId,
    date: new Date().toISOString().split('T')[0],
    amount: undefined,
    paymentMethod: 'Bank Transfer',
    notes: ''
  };
};

const RentPaymentForm: React.FC<RentPaymentFormProps> = ({ isOpen, onClose, onSubmit, initialData, properties, tenants }) => {
  const [payment, setPayment] = useState<Partial<RentPayment>>(getInitialState(initialData, tenants, properties));
  const [errors, setErrors] = useState<Partial<Record<keyof RentPayment, string>>>({});
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    if (isOpen) {
      const state = getInitialState(initialData, tenants, properties);
      setPayment(state);
      if (state.propertyId) {
        setAvailableTenants(tenants.filter(t => t.propertyId === state.propertyId));
      } else {
        setAvailableTenants(tenants); // Show all tenants if no property initially selected
      }
      setErrors({});
    }
  }, [initialData, isOpen, properties, tenants]);
  
  useEffect(() => {
    if (payment.propertyId) {
      setAvailableTenants(tenants.filter(t => t.propertyId === payment.propertyId));
      // If current tenantId is not in new available tenants, reset it
      if (payment.tenantId && !tenants.find(t => t.id === payment.tenantId && t.propertyId === payment.propertyId)) {
        setPayment(prev => ({ ...prev, tenantId: '' }));
      }
    } else {
      setAvailableTenants(tenants); // Or empty array: setAvailableTenants([]) if property must be chosen first
    }
  }, [payment.propertyId, tenants]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
    if (name === "propertyId") { // Reset tenant if property changes
        setPayment(prev => ({ ...prev, tenantId: ''}));
    }
    if (errors[name as keyof RentPayment]) {
      setErrors(prev => ({ ...prev, [name as keyof RentPayment]: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
     if (errors[name as keyof RentPayment]) {
      setErrors(prev => ({ ...prev, [name as keyof RentPayment]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof RentPayment, string>> = {};
    if (!payment.tenantId) newErrors.tenantId = 'Tenant is required.';
    if (!payment.propertyId) newErrors.propertyId = 'Property is required.';
    if (!payment.date) newErrors.date = 'Payment date is required.';
    if (payment.amount === undefined || isNaN(payment.amount) || payment.amount <= 0) newErrors.amount = 'Valid amount is required.';
    if (!payment.paymentMethod?.trim()) newErrors.paymentMethod = 'Payment method is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const tenantForPayment = tenants.find(t => t.id === payment.tenantId);
    const finalPayment: RentPayment = {
      id: initialData?.id || `rp_${Date.now()}`,
      tenantId: payment.tenantId!,
      propertyId: tenantForPayment!.propertyId, // Ensure propertyId is from selected tenant
      date: payment.date!,
      amount: payment.amount!,
      paymentMethod: payment.paymentMethod!,
      notes: payment.notes
    };
    onSubmit(finalPayment);
  };

  const propertyOptions = properties.map(p => ({ value: p.id, label: p.address }));
  const tenantOptions = availableTenants.map(t => ({ value: t.id, label: t.name }));
  const paymentMethodOptions = [
      {value: "Bank Transfer", label: "Bank Transfer"},
      {value: "Cash", label: "Cash"},
      {value: "Card", label: "Card"},
      {value: "Direct Debit", label: "Direct Debit"},
      {value: "Other", label: "Other"},
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Rent Payment' : 'Log New Rent Payment'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="propertyId" label="Property" value={payment.propertyId || ''} onChange={handleChange} options={propertyOptions} error={errors.propertyId} placeholder="Select property" disabled={properties.length === 0}/>
        <Select name="tenantId" label="Tenant" value={payment.tenantId || ''} onChange={handleChange} options={tenantOptions} error={errors.tenantId} placeholder="Select tenant" disabled={!payment.propertyId || availableTenants.length === 0}/>
        <Input name="date" label="Payment Date" type="date" value={payment.date || ''} onChange={handleChange} error={errors.date} />
        <Input name="amount" label="Amount (£)" type="number" step="0.01" value={payment.amount || ''} onChange={handleAmountChange} error={errors.amount} />
        <Select name="paymentMethod" label="Payment Method" value={payment.paymentMethod || ''} onChange={handleChange} options={paymentMethodOptions} error={errors.paymentMethod} />
        <Textarea name="notes" label="Notes (Optional)" value={payment.notes || ''} onChange={handleChange} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={tenants.length === 0 || properties.length === 0}>{initialData ? 'Save Changes' : 'Log Payment'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RentPaymentForm;
  