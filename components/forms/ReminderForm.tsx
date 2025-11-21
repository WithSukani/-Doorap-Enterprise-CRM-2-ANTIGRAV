
import React, { useState, useEffect } from 'react';
import { Reminder, Property } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reminder: Reminder) => void;
  initialData?: Reminder | null;
  properties: Property[];
}

const getInitialReminderState = (
  initialData?: Reminder | null,
  properties: Property[] = []
): Partial<Reminder> => {
  return initialData || {
    propertyId: properties.length > 0 ? properties[0].id : '',
    task: '',
    dueDate: new Date().toISOString().split('T')[0],
    frequency: 'Annually',
    isCompleted: false,
    lastCompletedDate: '',
    notes: '',
  };
};
  
const ReminderForm: React.FC<ReminderFormProps> = ({ isOpen, onClose, onSubmit, initialData, properties }) => {
  const [reminder, setReminder] = useState<Partial<Reminder>>(getInitialReminderState(initialData, properties));
  const [errors, setErrors] = useState<Partial<Record<keyof Reminder, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setReminder(getInitialReminderState(initialData, properties));
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    const checked = (e.target as HTMLInputElement).checked;

    setReminder(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name as keyof Reminder]) {
      setErrors(prev => ({ ...prev, [name as keyof Reminder]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Reminder, string>> = {};
    if (!reminder.propertyId) newErrors.propertyId = 'Property is required.';
    if (!reminder.task?.trim()) newErrors.task = 'Task description is required.';
    if (!reminder.dueDate) newErrors.dueDate = 'Due date is required.';
    if (!reminder.frequency) newErrors.frequency = 'Frequency is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalReminder: Reminder = {
      id: initialData?.id || `rem_${Date.now()}`,
      propertyId: reminder.propertyId!,
      task: reminder.task!,
      dueDate: reminder.dueDate!,
      frequency: reminder.frequency!,
      isCompleted: reminder.isCompleted || false,
      lastCompletedDate: reminder.lastCompletedDate,
      notes: reminder.notes,
    };
    onSubmit(finalReminder);
  };

  const propertyOptions = properties.map(p => ({ value: p.id, label: `${p.address}, ${p.postcode}` }));
  const frequencyOptions = [
    { value: 'One-time', label: 'One-time' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Bi-Annually', label: 'Bi-Annually' },
    { value: 'Annually', label: 'Annually' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Reminder' : 'Add New Reminder'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="propertyId" label="Property" value={reminder.propertyId || ''} onChange={handleChange} options={propertyOptions} error={errors.propertyId} disabled={properties.length === 0} placeholder={properties.length === 0 ? "No properties available" : "Select property"} />
        <Input name="task" label="Task Description" value={reminder.task || ''} onChange={handleChange} error={errors.task} placeholder="e.g., Annual Gas Safety Check"/>
        <Input name="dueDate" label="Due Date" type="date" value={reminder.dueDate || ''} onChange={handleChange} error={errors.dueDate} />
        <Select name="frequency" label="Frequency" value={reminder.frequency || ''} onChange={handleChange} options={frequencyOptions} error={errors.frequency} placeholder="Select frequency"/>
        <Input name="lastCompletedDate" label="Last Completed Date (Optional)" type="date" value={reminder.lastCompletedDate || ''} onChange={handleChange} />
        <Textarea name="notes" label="Notes (Optional)" value={reminder.notes || ''} onChange={handleChange} />
        <div className="flex items-center">
          <input type="checkbox" id="isCompleted" name="isCompleted" checked={reminder.isCompleted || false} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"/>
          <label htmlFor="isCompleted" className="text-sm text-neutral-dark">Mark as Completed</label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={properties.length === 0}>{initialData ? 'Save Changes' : 'Add Reminder'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReminderForm;
