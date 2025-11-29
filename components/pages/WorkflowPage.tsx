
import React, { useState, useMemo } from 'react';
import { Task, Reminder, Inspection, Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, TaskStatus, MaintenancePriority, AutomationWorkflow, AutomationStep, InspectionStatus } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import { 
    ClipboardDocumentListIcon, ListBulletIcon, BellAlertIcon, ShieldCheckIcon, 
    CheckCircleIcon, PlusCircleIcon, PencilIcon, TrashIcon,
    BoltIcon, FunnelIcon, ClockIcon, ArrowRightIcon, StopCircleIcon,
    ArrowPathIcon
} from '../icons/HeroIcons';
import TaskForm from '../forms/TaskForm';
import ReminderForm from '../forms/ReminderForm';
import InspectionForm from '../forms/InspectionForm';

// --- Types for the Unified View ---
type WorkflowItemType = 'task' | 'reminder' | 'inspection';

interface NormalizedItem {
    id: string;
    type: WorkflowItemType;
    title: string;
    subtitle?: string;
    date: string; // Due date or scheduled date
    status: string;
    priority?: string; // For tasks
    frequency?: string; // For reminders
    relatedEntityName?: string;
    isCompleted: boolean;
    raw: Task | Reminder | Inspection;
}

interface WorkflowPageProps {
    tasks: Task[];
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    
    reminders: Reminder[];
    addReminder: (reminder: Reminder) => void;
    updateReminder: (reminder: Reminder) => void;
    deleteReminder: (reminderId: string) => void;

    inspections: Inspection[];
    addInspection: (inspection: Inspection) => void;
    updateInspection: (inspection: Inspection) => void;
    deleteInspection: (inspectionId: string) => void;

    properties: Property[];
    tenants: Tenant[];
    maintenanceRequests: MaintenanceRequest[];
    getPropertyById: (id: string) => Property | undefined;
    getTenantById: (id: string) => Tenant | undefined;

    documents: Document[];
    addDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: CommunicationLog) => void;
    deleteCommunicationLog: (logId: string) => void;
    documentTemplates: DocumentTemplate[];
    userProfile: UserProfile;

    workflows: AutomationWorkflow[];
    addWorkflow: (wf: AutomationWorkflow) => void;
    updateWorkflow: (wf: AutomationWorkflow) => void;
    deleteWorkflow: (id: string) => void;
}

const AutomationBuilderModal = ({ isOpen, onClose, onSubmit }: any) => {
    const [name, setName] = useState('');
    const [triggerType, setTriggerType] = useState('Lease Expiry');
    const [steps, setSteps] = useState<AutomationStep[]>([]);
    
    // Adding step state
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [newStepType, setNewStepType] = useState<'action' | 'delay' | 'condition'>('action');
    const [newStepValue, setNewStepValue] = useState('');

    const getStepOptions = (type: 'action' | 'delay' | 'condition') => {
        switch(type) {
            case 'action': return [
                {value: 'Create Task', label: 'Create a To-Do Task'},
                {value: 'Send Email', label: 'Send Email to Tenant'},
                {value: 'Notify Owner', label: 'Notify Landlord via Email'},
                {value: 'SMS Alert', label: 'Send SMS Alert to Manager'},
                {value: 'Generate Document', label: 'Generate & Save Document'},
                {value: 'Create Invoice', label: 'Create Invoice Draft'},
            ];
            case 'delay': return [
                {value: 'Wait 1 Hour', label: 'Wait 1 Hour'},
                {value: 'Wait 1 Day', label: 'Wait 1 Day'},
                {value: 'Wait 3 Days', label: 'Wait 3 Days'},
                {value: 'Wait 1 Week', label: 'Wait 1 Week'},
                {value: 'Wait 1 Month', label: 'Wait 1 Month'},
            ];
            case 'condition': return [
                {value: 'If Tenant Active', label: 'If Tenant is Active'},
                {value: 'If Rent Overdue', label: 'If Rent is Overdue'},
                {value: 'If High Priority', label: 'If Priority is High/Urgent'},
                {value: 'If No Response', label: 'If No Response Received'},
            ];
            default: return [];
        }
    }

    const handleAddStep = () => {
        if (!newStepValue) return;
        const newStep: AutomationStep = {
            id: `step_${Date.now()}`,
            type: newStepType,
            description: newStepValue
        };
        setSteps([...steps, newStep]);
        setIsAddingStep(false);
        setNewStepValue('');
    };

    const handleDeleteStep = (index: number) => {
        const updated = [...steps];
        updated.splice(index, 1);
        setSteps(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert("Please give your workflow a name.");
            return;
        }
        if (steps.length === 0) {
            alert("Please add at least one step to the workflow.");
            return;
        }

        onSubmit({ 
            id: `wf_${Date.now()}`, 
            name, 
            trigger: triggerType, 
            steps, 
            isActive: true 
        });
        
        // Reset
        setName('');
        setSteps([]);
        setTriggerType('Lease Expiry');
        onClose();
    }

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Automation Builder" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Workflow Name</label>
                    <Input name="workflowName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lease Renewal Sequence" containerClassName="mb-0" />
                </div>

                <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 min-h-[300px] flex flex-col items-center">
                    
                    {/* Trigger Block */}
                    <div className="w-full max-w-md bg-white border-2 border-zinc-800 rounded-lg p-3 shadow-sm relative z-10">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            Trigger
                        </div>
                        <Select 
                            name="trigger"
                            value={triggerType} 
                            onChange={e => setTriggerType(e.target.value)} 
                            options={[
                                {value: 'Lease Expiry', label: 'Lease Expiry (60 Days)'},
                                {value: 'Rent Overdue', label: 'Rent Payment Overdue'},
                                {value: 'Maintenance Request', label: 'New Urgent Maintenance'},
                                {value: 'Vacancy Created', label: 'New Vacancy Listed'},
                                {value: 'Inspection Due', label: 'Inspection Scheduled Soon'},
                            ]}
                            containerClassName="mb-0"
                        />
                    </div>

                    {/* Connector */}
                    <div className="h-6 w-0.5 bg-zinc-300 my-1"></div>

                    {/* Steps List */}
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className="w-full max-w-md bg-white border border-zinc-300 rounded-lg p-3 shadow-sm relative group">
                                <div className={`absolute -top-2 left-4 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                    step.type === 'action' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    step.type === 'delay' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                    {step.type}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-sm font-medium text-zinc-800">{step.description}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleDeleteStep(idx)}
                                        className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                            <div className="h-6 w-0.5 bg-zinc-300 my-1"></div>
                        </React.Fragment>
                    ))}

                    {/* Add Step Button / Form */}
                    {isAddingStep ? (
                        <div className="w-full max-w-md bg-white border border-dashed border-zinc-400 rounded-lg p-4 animate-fade-in">
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {['action', 'delay', 'condition'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => { setNewStepType(type as any); setNewStepValue(''); }}
                                        className={`py-1 text-xs font-medium rounded capitalize border ${
                                            newStepType === type 
                                            ? 'bg-zinc-900 text-white border-zinc-900' 
                                            : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div className="mb-3">
                                <Select 
                                    name="stepValue"
                                    value={newStepValue}
                                    onChange={e => setNewStepValue(e.target.value)}
                                    options={getStepOptions(newStepType)}
                                    placeholder={`Select ${newStepType}...`}
                                    containerClassName="mb-0"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" type="button" onClick={handleAddStep} className="flex-1">Add</Button>
                                <Button size="sm" type="button" variant="outline" onClick={() => setIsAddingStep(false)}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => setIsAddingStep(true)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 transition-colors"
                        >
                            <PlusCircleIcon className="w-5 h-5"/>
                        </button>
                    )}

                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Workflow</Button>
                </div>
            </form>
        </Modal>
    )
}

const WorkflowPage: React.FC<WorkflowPageProps> = ({ 
    tasks, addTask, updateTask, deleteTask,
    reminders, addReminder, updateReminder, deleteReminder,
    inspections, addInspection, updateInspection, deleteInspection,
    properties, tenants, maintenanceRequests,
    workflows, addWorkflow, updateWorkflow, deleteWorkflow
}) => {
    const [activeTab, setActiveTab] = useState<'work' | 'automations'>('work');
    const [filterType, setFilterType] = useState<'all' | WorkflowItemType>('all');
    const [filterStatus, setFilterStatus] = useState<'pending' | 'completed'>('pending');
    
    // Modals
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
    const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
    const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);

    // Editing states
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);

    const handleToggleTask = (task: Task) => {
        updateTask({ 
            ...task, 
            status: task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED 
        });
    };

    const handleToggleReminder = (reminder: Reminder) => {
        updateReminder({
            ...reminder,
            isCompleted: !reminder.isCompleted,
            lastCompletedDate: !reminder.isCompleted ? new Date().toISOString().split('T')[0] : reminder.lastCompletedDate
        });
    };

    const handleToggleInspection = (inspection: Inspection) => {
        updateInspection({
            ...inspection,
            status: inspection.status === InspectionStatus.COMPLETED ? InspectionStatus.SCHEDULED : InspectionStatus.COMPLETED
        });
    }

    const handleDeleteWorkflow = (id: string) => {
        if(window.confirm("Delete this workflow?")) deleteWorkflow(id);
    }

    const normalizedItems: NormalizedItem[] = useMemo(() => {
        const items: NormalizedItem[] = [];
        
        tasks.forEach(t => items.push({
            id: t.id, type: 'task', title: t.title, subtitle: t.description, date: t.dueDate || t.createdAt,
            status: t.status, priority: t.priority, isCompleted: t.status === TaskStatus.COMPLETED, raw: t
        }));

        reminders.forEach(r => items.push({
            id: r.id, type: 'reminder', title: r.task, subtitle: properties.find(p => p.id === r.propertyId)?.address, date: r.dueDate,
            status: r.isCompleted ? 'Completed' : 'Pending', frequency: r.frequency, isCompleted: r.isCompleted, raw: r
        }));

        inspections.forEach(i => items.push({
            id: i.id, type: 'inspection', title: `${i.inspectionType}`, subtitle: properties.find(p => p.id === i.propertyId)?.address, date: i.scheduledDate,
            status: i.status, isCompleted: i.status === InspectionStatus.COMPLETED, raw: i
        }));

        return items.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [tasks, reminders, inspections, properties]);

    const filteredItems = normalizedItems.filter(item => {
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesStatus = filterStatus === 'pending' ? !item.isCompleted : item.isCompleted;
        return matchesType && matchesStatus;
    });

    const getTypeIcon = (type: WorkflowItemType) => {
        switch(type) {
            case 'task': return <ListBulletIcon className="w-5 h-5 text-blue-600" />;
            case 'reminder': return <BellAlertIcon className="w-5 h-5 text-orange-600" />;
            case 'inspection': return <ShieldCheckIcon className="w-5 h-5 text-purple-600" />;
        }
    }

    const getTypeColor = (type: WorkflowItemType) => {
        switch(type) {
            case 'task': return 'bg-blue-50 border-blue-200';
            case 'reminder': return 'bg-orange-50 border-orange-200';
            case 'inspection': return 'bg-purple-50 border-purple-200';
        }
    }

    const handleEditItem = (item: NormalizedItem) => {
        if (item.type === 'task') { setEditingTask(item.raw as Task); setIsTaskFormOpen(true); }
        if (item.type === 'reminder') { setEditingReminder(item.raw as Reminder); setIsReminderFormOpen(true); }
        if (item.type === 'inspection') { setEditingInspection(item.raw as Inspection); setIsInspectionFormOpen(true); }
    }

    const handleDeleteItem = (item: NormalizedItem) => {
        if(!window.confirm("Are you sure you want to delete this item?")) return;
        if (item.type === 'task') deleteTask(item.id);
        if (item.type === 'reminder') deleteReminder(item.id);
        if (item.type === 'inspection') deleteInspection(item.id);
    }

    return (
        <div className="animate-slide-in-left">
            <PageHeader 
                title="Workflow & Automation" 
                subtitle="Manage tasks, reminders, inspections, and automations in one place."
                actions={
                    <div className="flex gap-2">
                        {activeTab === 'automations' ? (
                            <Button onClick={() => setIsAutomationModalOpen(true)} leftIcon={<BoltIcon className="w-4 h-4"/>}>Create Automation</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => { setEditingReminder(null); setIsReminderFormOpen(true); }} className="hidden sm:flex">Add Reminder</Button>
                                <Button onClick={() => { setEditingTask(null); setIsTaskFormOpen(true); }} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add Task</Button>
                            </>
                        )}
                    </div>
                }
            />

            <div className="border-b border-zinc-200 bg-white px-2 rounded-t-lg mb-6 flex justify-between items-center">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('work')}
                        className={`${
                            activeTab === 'work'
                            ? 'border-zinc-900 text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                        } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all`}
                    >
                        <ClipboardDocumentListIcon className={`${activeTab === 'work' ? 'text-zinc-900' : 'text-zinc-400'} -ml-0.5 mr-2 h-5 w-5`} />
                        Work List
                    </button>
                    <button
                        onClick={() => setActiveTab('automations')}
                        className={`${
                            activeTab === 'automations'
                            ? 'border-zinc-900 text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                        } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all`}
                    >
                        <BoltIcon className={`${activeTab === 'automations' ? 'text-zinc-900' : 'text-zinc-400'} -ml-0.5 mr-2 h-5 w-5`} />
                        Automations
                    </button>
                </nav>
            </div>

            {activeTab === 'work' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-2 flex-1">
                            <FunnelIcon className="w-5 h-5 text-zinc-400"/>
                            <div className="flex gap-2">
                                <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${filterType === 'all' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>All</button>
                                <button onClick={() => setFilterType('task')} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${filterType === 'task' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>Tasks</button>
                                <button onClick={() => setFilterType('reminder')} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${filterType === 'reminder' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>Reminders</button>
                                <button onClick={() => setFilterType('inspection')} className={`px-3 py-1.5 text-xs font-medium rounded-full border ${filterType === 'inspection' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>Inspections</button>
                            </div>
                        </div>
                        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                            <button onClick={() => setFilterStatus('pending')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'pending' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>Pending</button>
                            <button onClick={() => setFilterStatus('completed')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'completed' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>Completed</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden min-h-[400px]">
                        {filteredItems.length > 0 ? (
                            <div className="divide-y divide-zinc-100">
                                {filteredItems.map(item => (
                                    <div key={item.id} className={`p-4 flex items-center hover:bg-zinc-50 transition-colors group ${item.isCompleted ? 'opacity-60 grayscale' : ''}`}>
                                        <div className={`p-2 rounded-full mr-4 border flex-shrink-0 ${getTypeColor(item.type)}`}>
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`font-semibold text-sm text-zinc-900 truncate ${item.isCompleted ? 'line-through' : ''}`}>{item.title}</h4>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${
                                                    item.type === 'task' ? 'text-blue-600 border-blue-200 bg-blue-50' : 
                                                    item.type === 'reminder' ? 'text-orange-600 border-orange-200 bg-orange-50' : 
                                                    'text-purple-600 border-purple-200 bg-purple-50'
                                                }`}>{item.type}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                                                <span className="flex items-center"><ClockIcon className="w-3 h-3 mr-1"/> Due: {new Date(item.date).toLocaleDateString()}</span>
                                                {item.priority && <span>Priority: {item.priority}</span>}
                                                {item.frequency && <span>Freq: {item.frequency}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                size="sm" 
                                                variant={item.isCompleted ? 'outline' : 'primary'} 
                                                onClick={() => {
                                                    if (item.type === 'task') handleToggleTask(item.raw as Task);
                                                    if (item.type === 'reminder') handleToggleReminder(item.raw as Reminder);
                                                    if (item.type === 'inspection') handleToggleInspection(item.raw as Inspection);
                                                }}
                                            >
                                                {item.isCompleted ? 'Undo' : 'Complete'}
                                            </Button>
                                            <button onClick={() => handleEditItem(item)} className="p-1.5 text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200 rounded hover:bg-zinc-50"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteItem(item)} className="p-1.5 text-zinc-400 hover:text-red-600 bg-white border border-zinc-200 rounded hover:bg-red-50"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                                <CheckCircleIcon className="w-12 h-12 mb-2 opacity-20"/>
                                <p>No items found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'automations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workflows.map(wf => (
                        <div key={wf.id} className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm relative group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-zinc-900">{wf.name}</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Trigger: <span className="font-mono bg-zinc-100 px-1 rounded">{wf.trigger}</span></p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${wf.isActive ? 'bg-green-500' : 'bg-zinc-300'}`} title={wf.isActive ? 'Active' : 'Inactive'}></div>
                            </div>
                            <div className="space-y-2 mb-4 bg-zinc-50/50 p-3 rounded-md border border-zinc-100">
                                {wf.steps.map((step, i) => (
                                    <div key={step.id} className="flex items-center text-xs text-zinc-600">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 text-[10px] font-bold ${
                                            step.type === 'condition' ? 'bg-purple-100 text-purple-700' : 
                                            step.type === 'delay' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {i + 1}
                                        </span>
                                        <span className="truncate font-medium">{step.type === 'delay' ? 'Delay:' : ''} {step.description}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-2 border-t border-zinc-50">
                                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteWorkflow(wf.id)}><TrashIcon className="w-4 h-4"/></Button>
                                {/* Edit logic to be implemented later */}
                                {/* <Button size="sm" variant="ghost"><PencilIcon className="w-4 h-4"/></Button> */}
                            </div>
                        </div>
                    ))}
                    <div 
                        className="border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center p-8 hover:bg-zinc-50 cursor-pointer transition-colors min-h-[200px]" 
                        onClick={() => setIsAutomationModalOpen(true)}
                    >
                        <PlusCircleIcon className="w-10 h-10 text-zinc-300 mb-2"/>
                        <span className="text-zinc-500 font-medium">Create New Automation</span>
                        <span className="text-xs text-zinc-400 mt-1">Design custom workflows with triggers and actions</span>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isTaskFormOpen && (
                <TaskForm 
                    isOpen={isTaskFormOpen} 
                    onClose={() => setIsTaskFormOpen(false)} 
                    onSubmit={(t) => { if(editingTask) updateTask(t); else addTask(t); setIsTaskFormOpen(false); }} 
                    initialData={editingTask} 
                    properties={properties} tenants={tenants} maintenanceRequests={maintenanceRequests}
                />
            )}
            {isReminderFormOpen && (
                <ReminderForm 
                    isOpen={isReminderFormOpen} 
                    onClose={() => setIsReminderFormOpen(false)} 
                    onSubmit={(r) => { if(editingReminder) updateReminder(r); else addReminder(r); setIsReminderFormOpen(false); }} 
                    initialData={editingReminder} 
                    properties={properties} 
                />
            )}
            {isInspectionFormOpen && (
                <InspectionForm 
                    isOpen={isInspectionFormOpen} 
                    onClose={() => setIsInspectionFormOpen(false)} 
                    onSubmit={(i) => { if(editingInspection) updateInspection(i); else addInspection(i); setIsInspectionFormOpen(false); }} 
                    initialData={editingInspection} 
                    properties={properties} tenants={tenants} 
                />
            )}
            <AutomationBuilderModal 
                isOpen={isAutomationModalOpen} 
                onClose={() => setIsAutomationModalOpen(false)} 
                onSubmit={addWorkflow} 
            />
        </div>
    );
};

export default WorkflowPage;
