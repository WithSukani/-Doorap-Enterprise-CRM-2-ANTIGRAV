import React, { useState, useEffect } from 'react';
import { CommunicationType, CommunicationLog, CommunicationLogParentType } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface CommunicationLogEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (logEntry: CommunicationLog) => void;
  parentId: string;
  parentType: CommunicationLogParentType;
  initialData?: CommunicationLog | null;
}

const CommunicationLogEntryForm: React.FC<CommunicationLogEntryFormProps> = ({ isOpen, onClose, onSubmit, parentId, parentType, initialData }) => {
  
  const getInitialState = (): Partial<CommunicationLog> => ({
    type: CommunicationType.NOTE,
    summary: '',
    participants: [],
    notes: '',
    date: new Date().toISOString().split('T')[0],
    ...initialData,
    parentId,
    parentType,
  });

  const [logEntry, setLogEntry] = useState<Partial<CommunicationLog>>(getInitialState());
  const [errors, setErrors] = useState<Partial<Record<keyof CommunicationLog, string>>>({});
  const [participantsInput, setParticipantsInput] = useState(initialData?.participants?.join(', ') || '');

  useEffect(() => {
    if (isOpen) {
      const initialState = getInitialState();
      setLogEntry(initialState);
      setParticipantsInput(initialState.participants?.join(', ') || '');
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData, parentId, parentType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLogEntry(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CommunicationLog]) {
      setErrors(prev => ({ ...prev, [name as keyof CommunicationLog]: undefined }));
    }
  };

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setParticipantsInput(value);
    setLogEntry(prev => ({ ...prev, participants: value.split(',').map(p => p.trim()).filter(p => p) }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof CommunicationLog, string>> = {};
    if (!logEntry.date) newErrors.date = 'Date is required.';
    if (!logEntry.type) newErrors.type = 'Communication type is required.';
    if (!logEntry.summary?.trim()) newErrors.summary = 'Summary is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalLogEntry: CommunicationLog = {
      id: initialData?.id || `comm_${Date.now()}`,
      parentId: logEntry.parentId!,
      parentType: logEntry.parentType!,
      date: logEntry.date!,
      type: logEntry.type!,
      summary: logEntry.summary!,
      participants: logEntry.participants || [],
      notes: logEntry.notes,
    };
    onSubmit(finalLogEntry);
    onClose();
  };

  const communicationTypeOptions = Object.values(CommunicationType).map(type => ({ value: type, label: type }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Log Entry' : 'Add Communication Log'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="date" label="Date" type="date" value={logEntry.date || ''} onChange={handleChange} error={errors.date} />
        <Select name="type" label="Communication Type" value={logEntry.type || ''} onChange={handleChange} options={communicationTypeOptions} error={errors.type} placeholder="Select communication type"/>
        <Textarea name="summary" label="Summary" value={logEntry.summary || ''} onChange={handleChange} error={errors.summary} placeholder="Brief summary of the communication" />
        <Input name="participants" label="Participants (Optional, comma-separated)" value={participantsInput} onChange={handleParticipantsChange} placeholder="e.g., John Doe, Property Manager" />
        <Textarea name="notes" label="Detailed Notes (Optional)" value={logEntry.notes || ''} onChange={handleChange} />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add Log Entry'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CommunicationLogEntryForm;