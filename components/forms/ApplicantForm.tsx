
import React, { useState, useEffect } from 'react';
import { Applicant, ApplicantStatus } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface ApplicantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicant: Applicant) => void;
  initialData?: Applicant | null;
  vacancyId: string; // The vacancy this applicant is for
}

const getInitialState = (initialData?: Applicant | null, vacancyId?: string): Partial<Applicant> => {
  return initialData || {
    vacancyId: vacancyId || '',
    name: '',
    email: '',
    phone: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: ApplicantStatus.NEW,
    notes: ''
  };
};

const ApplicantForm: React.FC<ApplicantFormProps> = ({ isOpen, onClose, onSubmit, initialData, vacancyId }) => {
  const [applicant, setApplicant] = useState<Partial<Applicant>>(getInitialState(initialData, vacancyId));
  const [errors, setErrors] = useState<Partial<Record<keyof Applicant, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setApplicant(getInitialState(initialData, vacancyId));
      setErrors({});
    }
  }, [initialData, isOpen, vacancyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicant(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Applicant]) {
      setErrors(prev => ({ ...prev, [name as keyof Applicant]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Applicant, string>> = {};
    if (!applicant.name?.trim()) newErrors.name = 'Applicant name is required.';
    if (!applicant.email?.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(applicant.email)) newErrors.email = 'Email address is invalid.';
    if (!applicant.phone?.trim()) newErrors.phone = 'Phone number is required.';
    if (!applicant.applicationDate) newErrors.applicationDate = 'Application date is required.';
    if (!applicant.status) newErrors.status = 'Status is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalApplicant: Applicant = {
      id: initialData?.id || `app_${Date.now()}`,
      vacancyId: applicant.vacancyId!,
      name: applicant.name!,
      email: applicant.email!,
      phone: applicant.phone!,
      applicationDate: applicant.applicationDate!,
      status: applicant.status!,
      notes: applicant.notes
    };
    onSubmit(finalApplicant);
  };

  const statusOptions = Object.values(ApplicantStatus).map(s => ({ value: s, label: s }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Applicant' : 'Add New Applicant'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label="Full Name" value={applicant.name || ''} onChange={handleChange} error={errors.name} placeholder="e.g., Jane Applicant" />
        <Input name="email" label="Email Address" type="email" value={applicant.email || ''} onChange={handleChange} error={errors.email} placeholder="jane.applicant@example.com" />
        <Input name="phone" label="Phone Number" type="tel" value={applicant.phone || ''} onChange={handleChange} error={errors.phone} placeholder="07123456789" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="applicationDate" label="Application Date" type="date" value={applicant.applicationDate || ''} onChange={handleChange} error={errors.applicationDate} />
            <Select name="status" label="Status" value={applicant.status || ''} onChange={handleChange} options={statusOptions} error={errors.status} />
        </div>
        <Textarea name="notes" label="Notes (Optional)" value={applicant.notes || ''} onChange={handleChange} placeholder="e.g., Viewed property on [date], good references." />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add Applicant'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicantForm;
  