
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, MaintenancePriority, Property, Tenant, MaintenanceRequest } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
  initialData?: Task | null;
  properties: Property[];
  tenants: Tenant[];
  maintenanceRequests: MaintenanceRequest[];
}

const getInitialState = (initialData?: Task | null): Partial<Task> => {
  return initialData || {
    title: '',
    description: '',
    dueDate: undefined,
    status: TaskStatus.PENDING,
    priority: MaintenancePriority.MEDIUM,
    relatedToId: '',
    relatedToType: 'general',
    createdAt: new Date().toISOString(),
    notes: ''
  };
};

const TaskForm: React.FC<TaskFormProps> = ({ 
    isOpen, onClose, onSubmit, initialData, 
    properties, tenants, maintenanceRequests 
}) => {
  const [task, setTask] = useState<Partial<Task>>(getInitialState(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof Task, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setTask(getInitialState(initialData));
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "relatedToEntity") { // Special handling for combined relatedTo field
        const [type, id] = value.split('-');
        setTask(prev => ({ ...prev, relatedToType: type as any, relatedToId: id }));
    } else {
        setTask(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof Task] || (name === "relatedToEntity" && (errors.relatedToId || errors.relatedToType))) {
      setErrors(prev => ({ ...prev, [name as keyof Task]: undefined, relatedToId: undefined, relatedToType: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Task, string>> = {};
    if (!task.title?.trim()) newErrors.title = 'Title is required.';
    if (!task.status) newErrors.status = 'Status is required.';
    if (!task.priority) newErrors.priority = 'Priority is required.';
    if (task.relatedToType && task.relatedToType !== 'general' && !task.relatedToId) {
        newErrors.relatedToId = 'Please select a specific item if a type is chosen.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalTask: Task = {
      id: initialData?.id || `task_${Date.now()}`,
      title: task.title!,
      description: task.description,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      status: task.status!,
      priority: task.priority!,
      relatedToId: task.relatedToType === 'general' ? undefined : task.relatedToId,
      relatedToType: task.relatedToType === 'general' ? undefined : task.relatedToType,
      createdAt: task.createdAt || new Date().toISOString(),
      notes: task.notes,
    };
    onSubmit(finalTask);
  };

  const statusOptions = Object.values(TaskStatus).map(s => ({ value: s, label: s }));
  const priorityOptions = Object.values(MaintenancePriority).map(p => ({ value: p, label: p }));
  
  const relatedEntityOptions = [
    { value: 'general-', label: 'General Task (No Specific Link)' },
    ...properties.map(p => ({ value: `property-${p.id}`, label: `Property: ${p.address}`})),
    ...tenants.map(t => ({ value: `tenant-${t.id}`, label: `Tenant: ${t.name}`})),
    ...maintenanceRequests.map(m => ({ value: `maintenance_request-${m.id}`, label: `Maint: ${m.issueTitle}`})),
    // TODO: Add Inspections when available
  ];
  const selectedRelatedEntity = task.relatedToType && task.relatedToId ? `${task.relatedToType}-${task.relatedToId}` : 'general-';


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : 'Add New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" label="Task Title" value={task.title || ''} onChange={handleChange} error={errors.title} placeholder="e.g., Follow up with tenant" />
        <Textarea name="description" label="Description (Optional)" value={task.description || ''} onChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="dueDate" label="Due Date (Optional)" type="date" value={task.dueDate || ''} onChange={handleChange} />
            <Select name="status" label="Status" value={task.status || ''} onChange={handleChange} options={statusOptions} error={errors.status}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select name="priority" label="Priority" value={task.priority || ''} onChange={handleChange} options={priorityOptions} error={errors.priority}/>
            <Select name="relatedToEntity" label="Related To (Optional)" value={selectedRelatedEntity} onChange={handleChange} options={relatedEntityOptions} error={errors.relatedToId || errors.relatedToType}/>
        </div>
        <Textarea name="notes" label="Notes (Optional)" value={task.notes || ''} onChange={handleChange} />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Add Task'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
  