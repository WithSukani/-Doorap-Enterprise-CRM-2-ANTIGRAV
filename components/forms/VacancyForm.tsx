
import React, { useState, useEffect } from 'react';
import { Vacancy, Property, VacancyStatus } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { generateVacancyDescription } from '../ai/gemini';
import { SparklesIcon } from '../icons/HeroIcons';

interface VacancyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vacancy: Vacancy) => void;
  initialData?: Vacancy | null;
  properties: Property[];
}

const getInitialState = (initialData?: Vacancy | null, properties: Property[] = []): Partial<Vacancy> => {
  return initialData || {
    propertyId: properties.length > 0 ? properties[0].id : '',
    listingTitle: '',
    description: '',
    rentAmount: undefined,
    availableDate: new Date().toISOString().split('T')[0],
    status: VacancyStatus.AVAILABLE,
    notes: ''
  };
};

const VacancyForm: React.FC<VacancyFormProps> = ({ isOpen, onClose, onSubmit, initialData, properties }) => {
  const [vacancy, setVacancy] = useState<Partial<Vacancy>>(getInitialState(initialData, properties));
  const [errors, setErrors] = useState<Partial<Record<keyof Vacancy, string>>>({});
  const [aiKeywords, setAiKeywords] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVacancy(getInitialState(initialData, properties));
      setErrors({});
      setAiKeywords('');
      setIsAiLoading(false);
      setAiError(null);
    }
  }, [initialData, isOpen, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVacancy(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Vacancy]) {
      setErrors(prev => ({ ...prev, [name as keyof Vacancy]: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVacancy(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
     if (errors[name as keyof Vacancy]) {
      setErrors(prev => ({ ...prev, [name as keyof Vacancy]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Vacancy, string>> = {};
    if (!vacancy.propertyId) newErrors.propertyId = 'Property is required.';
    if (!vacancy.listingTitle?.trim()) newErrors.listingTitle = 'Listing title is required.';
    if (vacancy.rentAmount === undefined || isNaN(vacancy.rentAmount) || vacancy.rentAmount <= 0) newErrors.rentAmount = 'Valid rent amount is required.';
    if (!vacancy.availableDate) newErrors.availableDate = 'Available date is required.';
    if (!vacancy.status) newErrors.status = 'Status is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalVacancy: Vacancy = {
      id: initialData?.id || `vac_${Date.now()}`,
      propertyId: vacancy.propertyId!,
      listingTitle: vacancy.listingTitle!,
      description: vacancy.description,
      rentAmount: vacancy.rentAmount!,
      availableDate: vacancy.availableDate!,
      status: vacancy.status!,
      notes: vacancy.notes
    };
    onSubmit(finalVacancy);
  };

  const handleGenerateDescription = async () => {
    if (!aiKeywords.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
        const description = await generateVacancyDescription(aiKeywords);
        setVacancy(prev => ({ ...prev, description }));
    } catch(err: any) {
        setAiError(err.message || 'An error occurred.');
    } finally {
        setIsAiLoading(false);
    }
  };

  const propertyOptions = properties.map(p => ({ value: p.id, label: p.address }));
  const statusOptions = Object.values(VacancyStatus).map(s => ({ value: s, label: s }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Vacancy' : 'List New Vacancy'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="propertyId" label="Property" value={vacancy.propertyId || ''} onChange={handleChange} options={propertyOptions} error={errors.propertyId} placeholder="Select property" disabled={properties.length === 0} />
        <Input name="listingTitle" label="Listing Title" value={vacancy.listingTitle || ''} onChange={handleChange} error={errors.listingTitle} placeholder="e.g., Spacious 2-Bed Apartment with City Views" />
        
        {/* Dori Description Generation */}
        <div className="p-3 bg-primary-light/10 rounded-lg border border-primary-light/20">
            <h4 className="font-semibold text-neutral-dark flex items-center mb-2"><SparklesIcon className="w-5 h-5 mr-1 text-primary"/> Generate with Dori</h4>
            <Textarea 
                name="aiKeywords" 
                label="Keywords for description" 
                placeholder="e.g., 3 bed, 2 bath, new kitchen, close to park, quiet street"
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                containerClassName="mb-2"
            />
            <Button type="button" onClick={handleGenerateDescription} isLoading={isAiLoading} disabled={!aiKeywords.trim()}>
                Draft with Dori
            </Button>
            {aiError && <p className="text-xs text-secondary mt-1">{aiError}</p>}
        </div>

        <Textarea name="description" label="Marketing Description" value={vacancy.description || ''} onChange={handleChange} rows={5} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="rentAmount" label="Monthly Rent (£)" type="number" step="0.01" value={vacancy.rentAmount || ''} onChange={handleAmountChange} error={errors.rentAmount} />
            <Input name="availableDate" label="Available From Date" type="date" value={vacancy.availableDate || ''} onChange={handleChange} error={errors.availableDate} />
        </div>
        <Select name="status" label="Status" value={vacancy.status || ''} onChange={handleChange} options={statusOptions} error={errors.status} />
        <Textarea name="notes" label="Internal Notes (Optional)" value={vacancy.notes || ''} onChange={handleChange} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={properties.length === 0}>{initialData ? 'Save Changes' : 'List Vacancy'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default VacancyForm;