
import React, { useState, useEffect } from 'react';
import { PropertyType, Property, Landlord } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: Property) => void;
  initialData?: Property | null;
  landlords: Landlord[];
}

const getInitialPropertyState = (initialData?: Property | null): Partial<Property> => {
  return initialData || {
    address: '',
    postcode: '',
    type: PropertyType.HOUSE,
    ownerName: '',
    purchaseDate: '',
    value: undefined,
    imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
    notes: '',
    managementFeeType: 'Percentage',
    managementFeeValue: 10,
  };
};

const PropertyForm: React.FC<PropertyFormProps> = ({ isOpen, onClose, onSubmit, initialData, landlords }) => {
  const [property, setProperty] = useState<Partial<Property>>(getInitialPropertyState(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof Property, string>>>({});

  // ... (useEffect remains same) ...
  useEffect(() => {
    if (isOpen) {
      setProperty(getInitialPropertyState(initialData));
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProperty(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Property]) {
      setErrors(prev => ({ ...prev, [name as keyof Property]: undefined }));
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProperty(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    if (errors[name as keyof Property]) {
      setErrors(prev => ({ ...prev, [name as keyof Property]: undefined }));
    }
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof Property, string>> = {};
    if (!property.address?.trim()) newErrors.address = 'Address is required.';
    if (!property.postcode?.trim()) newErrors.postcode = 'Postcode is required.';
    if (!property.ownerName?.trim()) newErrors.ownerName = 'Owner is required.';
    if (!property.type) newErrors.type = 'Property type is required.';
    if (property.value !== undefined && isNaN(property.value)) newErrors.value = 'Value must be a number.';
    if (property.managementFeeValue !== undefined && isNaN(property.managementFeeValue)) newErrors.managementFeeValue = 'Fee value must be a number.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalProperty: Property = {
      id: initialData?.id || `prop_${Date.now()}`,
      address: property.address!,
      postcode: property.postcode!,
      type: property.type!,
      ownerName: property.ownerName!,
      purchaseDate: property.purchaseDate,
      value: property.value,
      notes: property.notes,
      imageUrl: property.imageUrl || `https://picsum.photos/seed/${property.address}/600/400`,
      managementFeeType: property.managementFeeType as any,
      managementFeeValue: property.managementFeeValue,
    };
    onSubmit(finalProperty);
  };

  const propertyTypeOptions = Object.values(PropertyType).map(type => ({ value: type, label: type }));
  const feeTypeOptions = [
    { value: 'Percentage', label: 'Percentage of Rent (%)' },
    { value: 'Fixed', label: 'Fixed Monthly Amount (£)' },
  ];

  // Landlord Options
  const landlordOptions = [
    { value: 'No Owner / Landlord', label: 'No Owner / Landlord' },
    ...landlords.map(l => ({ value: l.name, label: l.name }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Property' : 'Add New Property'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="address" label="Address" value={property.address || ''} onChange={handleChange} error={errors.address} placeholder="e.g., 123 High Street" />
        <Input name="postcode" label="Postcode" value={property.postcode || ''} onChange={handleChange} error={errors.postcode} placeholder="e.g., SW1A 1AA" />
        <Select name="type" label="Property Type" value={property.type || ''} onChange={handleChange} options={propertyTypeOptions} error={errors.type} placeholder="Select property type" />

        {/* Changed from Input to Select for Owner */}
        <Select
          name="ownerName"
          label="Landlord / Owner"
          value={property.ownerName || ''}
          onChange={handleChange}
          options={landlordOptions}
          error={errors.ownerName}
          placeholder="Select a landlord"
        />

        <Input name="purchaseDate" label="Purchase Date" type="date" value={property.purchaseDate || ''} onChange={handleChange} />
        <Input name="value" label="Estimated Value (£)" type="number" value={property.value || ''} onChange={handleValueChange} error={errors.value} placeholder="e.g., 250000" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            name="managementFeeType"
            label="Mgmt Fee Type"
            value={property.managementFeeType || 'Percentage'}
            onChange={handleChange}
            options={feeTypeOptions}
          />
          <Input
            name="managementFeeValue"
            label={`Fee Value (${property.managementFeeType === 'Percentage' ? '%' : '£'})`}
            type="number"
            step={property.managementFeeType === 'Percentage' ? "0.1" : "1"}
            value={property.managementFeeValue || ''}
            onChange={handleValueChange}
            error={errors.managementFeeValue}
          />
        </div>

        <Input name="imageUrl" label="Image URL" value={property.imageUrl || ''} onChange={handleChange} placeholder="Optional image URL" />
        <Textarea name="notes" label="Notes" value={property.notes || ''} onChange={handleChange} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add Property'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PropertyForm;
