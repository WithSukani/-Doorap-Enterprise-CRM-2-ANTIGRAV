
import React, { useState } from 'react';
import { MaintenancePriority, SLA } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import SLAForm from '../forms/SLAForm';
import { PlusCircleIcon, PencilIcon, TrashIcon, DocumentCheckIcon, CheckCircleIcon, XMarkIcon as XMarkSolidIcon } from '../icons/HeroIcons';

const getPriorityPillSLAPage = (priority: SLA['priorityLevel']) => {
  switch (priority) {
    case MaintenancePriority.URGENT: return 'border-red-500 text-red-600 bg-red-50';
    case MaintenancePriority.HIGH: return 'border-orange-500 text-orange-600 bg-orange-50';
    case MaintenancePriority.MEDIUM: return 'border-yellow-500 text-yellow-600 bg-yellow-50';
    case MaintenancePriority.LOW: return 'border-green-500 text-green-600 bg-green-50';
    default: return 'border-gray-400 text-gray-500 bg-gray-50';
  }
}

interface SLACardProps {
  sla: SLA;
  onEdit: (sla: SLA) => void;
  onDelete: (slaId: string) => void;
  onToggleActive: (sla: SLA) => void;
}

const SLACard: React.FC<SLACardProps> = ({ sla, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className={`bg-white p-5 rounded-lg shadow-lg animate-fade-in hover:shadow-xl transition-shadow border-l-4 ${sla.isActive ? 'border-primary' : 'border-neutral-DEFAULT'}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-neutral-dark mb-1">{sla.name}</h3>
        {sla.isActive ? 
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/>Active</span> 
            : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 flex items-center"><XMarkSolidIcon className="w-3 h-3 mr-1"/>Inactive</span>
        }
      </div>
      <p className="text-sm text-neutral-DEFAULT mb-2">{sla.description}</p>
      <p className={`text-xs font-medium inline-block px-2 py-0.5 border rounded-full ${getPriorityPillSLAPage(sla.priorityLevel)} mb-2`}>
        Applies to: {sla.priorityLevel} Priority
      </p>
      <div className="text-sm text-neutral-dark space-y-1">
        {sla.responseTimeHours && <p>Response Time: <strong>{sla.responseTimeHours} hours</strong></p>}
        {sla.resolutionTimeHours && <p>Resolution Time: <strong>{sla.resolutionTimeHours} hours</strong></p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button 
            size="sm" 
            variant={sla.isActive ? "outline" : "primary"}
            onClick={() => onToggleActive(sla)} 
        >
          {sla.isActive ? 'Deactivate' : 'Activate'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(sla)} leftIcon={<PencilIcon className="w-4 h-4"/>}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(sla.id)} leftIcon={<TrashIcon className="w-4 h-4"/>}>Delete</Button>
      </div>
    </div>
  );
};

interface SLAPageProps {
  slas: SLA[];
  addSLA: (sla: SLA) => void;
  updateSLA: (sla: SLA) => void;
  deleteSLA: (slaId: string) => void;
}

const SLAPage: React.FC<SLAPageProps> = ({ slas, addSLA, updateSLA, deleteSLA }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSLA, setEditingSLA] = useState<SLA | null>(null);

  const handleAddSLA = () => {
    setEditingSLA(null);
    setIsFormOpen(true);
  };

  const handleEditSLA = (sla: SLA) => {
    setEditingSLA(sla);
    setIsFormOpen(true);
  };

  const handleDeleteSLA = (slaId: string) => {
    if (window.confirm('Are you sure you want to delete this SLA?')) {
      deleteSLA(slaId);
    }
  };

  const handleSubmitForm = (slaData: SLA) => {
    if (editingSLA) {
      updateSLA(slaData);
    } else {
      addSLA(slaData);
    }
    setIsFormOpen(false);
    setEditingSLA(null);
  };

  const handleToggleActive = (slaToToggle: SLA) => {
    updateSLA({ ...slaToToggle, isActive: !slaToToggle.isActive });
  };
  
  const sortedSLAs = [...slas].sort((a, b) => {
    if (a.isActive === b.isActive) return a.name.localeCompare(b.name);
    return a.isActive ? -1 : 1; // Active SLAs first
  });

  return (
    <div className="animate-slide-in-left">
      <PageHeader 
        title="Service Level Agreements (SLAs)" 
        subtitle={`Define and manage ${slas.length} operational targets.`}
        actions={
          <Button onClick={handleAddSLA} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
            Add SLA
          </Button>
        }
      />

      {sortedSLAs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSLAs.map(sla => (
            <SLACard 
              key={sla.id} 
              sla={sla}
              onEdit={handleEditSLA} 
              onDelete={handleDeleteSLA}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-10">
            <DocumentCheckIcon className="w-16 h-16 mx-auto text-neutral-DEFAULT mb-4"/>
            <p className="text-xl text-neutral-DEFAULT">No SLAs defined yet.</p>
            <p className="text-neutral-DEFAULT mt-2">Click "Add SLA" to create your first service level agreement.</p>
        </div>
      )}

      {isFormOpen && (
        <SLAForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingSLA}
        />
      )}
    </div>
  );
};

export default SLAPage;
