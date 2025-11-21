
import React, { useState } from 'react';
import { CommunicationLog, CommunicationLogParentType } from '../../types';
import Button from '../common/Button';
import CommunicationLogEntryForm from '../forms/CommunicationLogEntryForm';
import { PlusCircleIcon, TrashIcon, ChatBubbleLeftEllipsisIcon } from '../icons/HeroIcons';

const getCommunicationTypeIcon = (type: CommunicationLog['type']) => {
  // Simple icon for now, can be expanded
  return <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-primary-dark mr-2 flex-shrink-0" />;
};

interface CommunicationLogSectionProps {
    logs: CommunicationLog[];
    parentId: string;
    parentType: CommunicationLogParentType;
    addLog: (log: CommunicationLog) => void;
    deleteLog: (logId: string) => void;
}

const CommunicationLogSection: React.FC<CommunicationLogSectionProps> = ({ logs, parentId, parentType, addLog, deleteLog }) => {
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null);

  const relevantLogs = logs.filter(log => log.parentId === parentId && log.parentType === parentType);

  const handleOpenForm = (logToEdit?: CommunicationLog | null) => {
    setEditingLog(logToEdit || null);
    setIsLogFormOpen(true);
  };

  const handleFormSubmit = (log: CommunicationLog) => {
    addLog(log); // addLog likely handles add/update based on ID or form onSubmit does
    setIsLogFormOpen(false);
    setEditingLog(null);
  };
  
  const handleDelete = (logId: string) => {
      if(window.confirm("Are you sure you want to delete this log entry?")) {
          deleteLog(logId);
      }
  }

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-neutral-dark flex items-center">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-2 text-primary"/>Communication Log ({relevantLogs.length})
        </h4>
        <Button size="sm" variant="outline" onClick={() => handleOpenForm(null)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>
          Add Log
        </Button>
      </div>
      {relevantLogs.length > 0 ? (
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {relevantLogs.map(log => (
            <li key={log.id} className="p-3 bg-neutral-light/70 rounded-md shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                    <div className="flex items-center mb-1">
                        {getCommunicationTypeIcon(log.type)}
                        <span className="font-medium text-neutral-dark">{log.type}</span>
                        <span className="text-xs text-neutral-DEFAULT ml-2">- {new Date(log.date).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-neutral-dark leading-tight mb-1">{log.summary}</p>
                    {log.participants && log.participants.length > 0 && (
                        <p className="text-xs text-neutral-DEFAULT">Participants: {log.participants.join(', ')}</p>
                    )}
                </div>
                {/* Edit button can be added here if needed:
                 <Button size="sm" variant="ghost" onClick={() => handleOpenForm(log)} className="text-primary-dark hover:bg-primary-light/50 px-2 py-1 ml-2 flex-shrink-0">
                  <PencilIcon className="w-4 h-4"/>
                </Button> */}
                 <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)} className="text-secondary-dark hover:bg-secondary-light/50 px-2 py-1 ml-2 flex-shrink-0">
                  <TrashIcon className="w-4 h-4"/>
                </Button>
              </div>
              {log.notes && <p className="text-xs italic text-neutral-dark mt-1 pt-1 border-t border-neutral-light/50">{log.notes}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-DEFAULT text-sm py-4 text-center">No communication logs for this {parentType.replace('_', ' ')}.</p>
      )}

      {isLogFormOpen && (
        <CommunicationLogEntryForm
          isOpen={isLogFormOpen}
          onClose={() => { setIsLogFormOpen(false); setEditingLog(null); }}
          onSubmit={handleFormSubmit}
          parentId={parentId}
          parentType={parentType}
          initialData={editingLog}
        />
      )}
    </div>
  );
};

export default CommunicationLogSection;
