
import React, { useState, useMemo } from 'react';
import { Reminder, Property } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import ReminderForm from '../forms/ReminderForm';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckCircleIcon, CalendarDaysIcon, InformationCircleIcon } from '../icons/HeroIcons';

interface ReminderCardProps {
  reminder: Reminder;
  property?: Property;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onToggleComplete: (reminderId: string) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, property, onEdit, onDelete, onToggleComplete }) => {
  const isOverdue = !reminder.isCompleted && new Date(reminder.dueDate) < new Date();
  return (
    <div className={`bg-white p-5 rounded-lg shadow-lg animate-fade-in hover:shadow-xl transition-shadow border-l-4 ${reminder.isCompleted ? 'border-green-500' : isOverdue ? 'border-red-500' : 'border-yellow-500'}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-neutral-dark mb-1">{reminder.task}</h3>
        {reminder.isCompleted ? 
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Completed</span> 
            : isOverdue ? 
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Overdue</span>
            : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Upcoming</span>
        }
      </div>
      {property && <p className="text-sm text-neutral-DEFAULT mb-1">Property: {property.address}</p>}
      <p className="text-sm text-neutral-DEFAULT mb-1">Due: <span className={isOverdue && !reminder.isCompleted ? 'text-red-600 font-semibold' : ''}>{new Date(reminder.dueDate).toLocaleDateString()}</span></p>
      <p className="text-xs text-neutral-DEFAULT mb-2">Frequency: {reminder.frequency}</p>
      {reminder.lastCompletedDate && <p className="text-xs text-neutral-DEFAULT mb-2">Last Done: {new Date(reminder.lastCompletedDate).toLocaleDateString()}</p>}
      {reminder.notes && <p className="text-xs italic text-neutral-DEFAULT mt-2 p-2 bg-neutral-light rounded">{reminder.notes}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button 
            size="sm" 
            variant={reminder.isCompleted ? "outline" : "primary"}
            onClick={() => onToggleComplete(reminder.id)} 
            leftIcon={<CheckCircleIcon className="w-4 h-4"/>}
        >
          {reminder.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(reminder)} leftIcon={<PencilIcon className="w-4 h-4"/>}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(reminder.id)} leftIcon={<TrashIcon className="w-4 h-4"/>}>Delete</Button>
      </div>
    </div>
  );
};

interface RemindersPageProps {
  reminders: Reminder[];
  properties: Property[];
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (reminderId: string) => void;
}

const RemindersPage: React.FC<RemindersPageProps> = ({ reminders, properties, addReminder, updateReminder, deleteReminder }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPropertyId, setFilterPropertyId] = useState('');

  const handleAddReminder = () => {
    setEditingReminder(null);
    setIsFormOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder(reminderId);
    }
  };

  const handleToggleComplete = (reminderId: string) => {
    const reminderToUpdate = reminders.find(r => r.id === reminderId);
    if (reminderToUpdate) {
      updateReminder({ 
        ...reminderToUpdate, 
        isCompleted: !reminderToUpdate.isCompleted,
        lastCompletedDate: !reminderToUpdate.isCompleted ? new Date().toISOString().split('T')[0] : reminderToUpdate.lastCompletedDate 
      });
    }
  };

  const handleSubmitForm = (reminderData: Reminder) => {
    if (editingReminder) {
      updateReminder(reminderData);
    } else {
      addReminder(reminderData);
    }
    setIsFormOpen(false);
    setEditingReminder(null);
  };
  
  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.address : 'Unknown Property';
  };

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const isOverdue = !r.isCompleted && new Date(r.dueDate) < new Date();
      let matchesStatus = true;
      if (filterStatus === 'completed') matchesStatus = r.isCompleted;
      else if (filterStatus === 'pending') matchesStatus = !r.isCompleted && !isOverdue;
      else if (filterStatus === 'overdue') matchesStatus = isOverdue;

      const matchesProperty = filterPropertyId === '' || r.propertyId === filterPropertyId;
      
      return matchesStatus && matchesProperty;
    }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [reminders, filterStatus, filterPropertyId]);
  
  const propertyOptions = [{ value: '', label: 'All Properties' }, ...properties.map(p => ({ value: p.id, label: `${p.address.substring(0,25)}...` }))];
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="animate-slide-in-left">
      <PageHeader 
        title="Maintenance Reminders" 
        subtitle={`Stay on top of ${reminders.length} scheduled tasks.`}
        actions={
          <Button onClick={handleAddReminder} leftIcon={<PlusCircleIcon className="w-5 h-5"/>} disabled={properties.length === 0}>
            Add Reminder
          </Button>
        }
      />
      {properties.length === 0 && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <p><strong>Note:</strong> You need to add at least one property before you can add reminders.</p>
          </div>
      )}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={filterPropertyId} onChange={(e) => setFilterPropertyId(e.target.value)} className="w-full p-2 border border-neutral-light rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
            {propertyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 border border-neutral-light rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {filteredReminders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReminders.map(reminder => (
            <ReminderCard 
              key={reminder.id} 
              reminder={reminder}
              property={properties.find(p => p.id === reminder.propertyId)}
              onEdit={handleEditReminder} 
              onDelete={handleDeleteReminder}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-10">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-neutral-DEFAULT mb-4"/>
            <p className="text-xl text-neutral-DEFAULT">No reminders found.</p>
            {(filterStatus !== 'all' || filterPropertyId) && <p className="text-neutral-DEFAULT mt-2">Try adjusting your filters or add a new reminder.</p>}
        </div>
      )}

      {isFormOpen && (
        <ReminderForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingReminder}
          properties={properties}
        />
      )}
    </div>
  );
};

export default RemindersPage;
