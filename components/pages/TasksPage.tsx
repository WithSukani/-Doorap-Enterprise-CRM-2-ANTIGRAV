import React, { useState, useMemo, ChangeEvent } from 'react';
import { Task, TaskStatus as TaskStatusType, MaintenancePriority as MaintenancePriorityType, Property, Tenant, MaintenanceRequest } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import TaskForm from '../forms/TaskForm'; 
import Select from '../common/Select';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckCircleIcon, ListBulletIcon } from '../icons/HeroIcons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (task: Task) => void;
  getRelatedEntityName: (task: Task) => string;
}

const getStatusColor = (status: (typeof TaskStatusType)[keyof typeof TaskStatusType]) => {
  switch (status) {
    case TaskStatusType.PENDING: return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    case TaskStatusType.IN_PROGRESS: return 'border-blue-500 bg-blue-50 text-blue-700';
    case TaskStatusType.COMPLETED: return 'border-green-500 bg-green-50 text-green-700';
    case TaskStatusType.ON_HOLD: return 'border-purple-500 bg-purple-50 text-purple-700';
    case TaskStatusType.CANCELLED: return 'border-gray-400 bg-gray-50 text-gray-600';
    default: return 'border-gray-300 bg-gray-100 text-gray-500';
  }
};

const getPriorityPill = (priority: (typeof MaintenancePriorityType)[keyof typeof MaintenancePriorityType]) => {
  switch (priority) {
    case MaintenancePriorityType.URGENT: return 'bg-red-100 text-red-700';
    case MaintenancePriorityType.HIGH: return 'bg-orange-100 text-orange-700';
    case MaintenancePriorityType.MEDIUM: return 'bg-yellow-100 text-yellow-700';
    case MaintenancePriorityType.LOW: return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleComplete, getRelatedEntityName }) => {
  const isOverdue = task.status !== TaskStatusType.COMPLETED && task.dueDate && new Date(task.dueDate) < new Date();
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 ${getStatusColor(task.status).split(' ')[0]}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold text-neutral-dark">{task.title}</h3>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status).split(' ').slice(1).join(' ')}`}>{task.status}</span>
      </div>
      {task.description && <p className="text-sm text-neutral-DEFAULT mb-2">{task.description}</p>}
      <div className="text-xs text-neutral-DEFAULT space-y-1 mb-3">
        {task.dueDate && <p>Due: <span className={isOverdue ? 'text-red-600 font-bold' : ''}>{new Date(task.dueDate).toLocaleDateString()}</span> {isOverdue && '(Overdue)'}</p>}
        <p>Priority: <span className={`px-1.5 py-0.5 rounded-full text-xs ${getPriorityPill(task.priority)}`}>{task.priority}</span></p>
        {task.relatedToId && <p>Related to: {getRelatedEntityName(task)}</p>}
        <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={task.status === TaskStatusType.COMPLETED ? "outline" : "primary"} onClick={() => onToggleComplete(task)} leftIcon={<CheckCircleIcon className="w-4 h-4"/>}>
          {task.status === TaskStatusType.COMPLETED ? 'Mark Pending' : 'Mark Complete'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(task)} leftIcon={<PencilIcon className="w-4 h-4"/>}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(task.id)} leftIcon={<TrashIcon className="w-4 h-4"/>}>Delete</Button>
      </div>
    </div>
  );
};


interface TasksPageProps {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  properties: Property[];
  tenants: Tenant[];
  maintenanceRequests: MaintenanceRequest[];
}

const TasksPage: React.FC<TasksPageProps> = ({ 
    tasks, addTask, updateTask, deleteTask, 
    properties, tenants, maintenanceRequests 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRelatedTo, setFilterRelatedTo] = useState(''); // e.g., 'property-id1', 'tenant-id2'


  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleToggleComplete = (task: Task) => {
    updateTask({ 
      ...task, 
      status: task.status === TaskStatusType.COMPLETED ? TaskStatusType.PENDING : TaskStatusType.COMPLETED 
    });
  };

  const handleSubmitForm = (taskData: Task) => {
    if (editingTask) {
      updateTask(taskData);
    } else {
      addTask(taskData);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const getRelatedEntityName = (task: Task): string => {
    if (!task.relatedToId || !task.relatedToType) return 'General Task';
    switch (task.relatedToType) {
      case 'property':
        return properties.find(p => p.id === task.relatedToId)?.address || 'Unknown Property';
      case 'tenant':
        return tenants.find(t => t.id === task.relatedToId)?.name || 'Unknown Tenant';
      case 'maintenance_request':
        return maintenanceRequests.find(m => m.id === task.relatedToId)?.issueTitle || 'Unknown Maintenance';
      default:
        return 'Unknown Entity';
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = filterStatus ? task.status === filterStatus : true;
      const matchesPriority = filterPriority ? task.priority === filterPriority : true;
      let matchesRelated = true;
      if (filterRelatedTo && filterRelatedTo !== "general-") { // ensure general- is not split
          const [type, id] = filterRelatedTo.split(/-(.+)/); // Split only on the first hyphen
          matchesRelated = task.relatedToType === type && task.relatedToId === id;
      } else if (filterRelatedTo === "general-") {
          matchesRelated = !task.relatedToType || task.relatedToType === 'general';
      }
      return matchesStatus && matchesPriority && matchesRelated;
    }).sort((a,b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : (a.dueDate ? -1 : (b.dueDate ? 1: 0)));
  }, [tasks, filterStatus, filterPriority, filterRelatedTo]);

  const statusOptions = [{value: '', label: 'All Statuses'}, ...Object.values(TaskStatusType).map(s => ({value: s, label: s}))];
  const priorityOptions = [{value: '', label: 'All Priorities'}, ...Object.values(MaintenancePriorityType).map(p => ({value: p, label: p}))];
  
  const relatedEntityOptions = [
    { value: 'general-', label: 'All Related Entities / General' },
    ...properties.map(p => ({ value: `property-${p.id}`, label: `Prop: ${p.address.substring(0,20)}...`})),
    ...tenants.map(t => ({ value: `tenant-${t.id}`, label: `Tenant: ${t.name}`})),
    ...maintenanceRequests.map(m => ({ value: `maintenance_request-${m.id}`, label: `Maint: ${m.issueTitle.substring(0,20)}...`})),
    // TODO: Add Inspections when available
  ];


  return (
    <div className="animate-slide-in-left">
      <PageHeader
        title="Tasks"
        subtitle={`Manage your ${tasks.length} to-do items.`}
        actions={<Button onClick={handleAddTask} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>Add Task</Button>}
      />
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select name="filterStatus" containerClassName="mb-0" options={statusOptions} value={filterStatus} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)} label="Filter by Status"/>
          <Select name="filterPriority" containerClassName="mb-0" options={priorityOptions} value={filterPriority} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterPriority(e.target.value)} label="Filter by Priority"/>
          <Select name="filterRelatedTo" containerClassName="mb-0" options={relatedEntityOptions} value={filterRelatedTo} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterRelatedTo(e.target.value)} label="Filter by Related Entity"/>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={handleEditTask} 
              onDelete={handleDeleteTask} 
              onToggleComplete={handleToggleComplete}
              getRelatedEntityName={getRelatedEntityName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <ListBulletIcon className="w-16 h-16 mx-auto text-neutral-DEFAULT mb-4"/>
          <p className="text-xl text-neutral-DEFAULT">No tasks found.</p>
          {(filterStatus || filterPriority || filterRelatedTo) && <p className="text-neutral-DEFAULT mt-2">Try adjusting your filters or add a new task.</p>}
        </div>
      )}

      {isFormOpen && (
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
          onSubmit={handleSubmitForm}
          initialData={editingTask}
          properties={properties}
          tenants={tenants}
          maintenanceRequests={maintenanceRequests}
        />
      )}
    </div>
  );
};

export default TasksPage;