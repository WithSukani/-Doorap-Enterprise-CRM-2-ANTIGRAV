
import React, { useState, useMemo } from 'react';
import { Task, Reminder, Inspection, Property, Tenant, MaintenanceRequest, Document, CommunicationLog, DocumentTemplate, UserProfile, TaskStatus, MaintenancePriority, AutomationWorkflow, AutomationStep, InspectionStatus } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import { 
    ClipboardDocumentListIcon, ListBulletIcon, BellAlertIcon, ShieldCheckIcon, 
    CheckCircleIcon, CalendarDaysIcon, ClockIcon, FunnelIcon, MagnifyingGlassIcon,
    PlusCircleIcon, ChevronDownIcon, EllipsisHorizontalIcon, PencilIcon, TrashIcon,
    ArrowPathIcon, ArrowTrendingUpIcon, BoltIcon, SparklesIcon, XMarkIcon
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
    const [trigger, setTrigger] = useState('');
    const [steps, setSteps] = useState<AutomationStep[]>([]);

    const addStep = (type: 'action' | 'condition' | 'delay') => {
        setSteps([...steps, { id: `step_${Date.now()}_${steps.length}`, type, description: '' }]);
    };

    const updateStep = (id: string, description: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, description } : s));
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            id: `wf_${Date.now()}`, 
            name, 
            trigger, 
            steps, 
            isActive: true 
        });
        onClose();
        setName(''); setTrigger(''); setSteps([]);
    }

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Automation Builder" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <Input label="Workflow Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lead Qualification Flow" />
                    <Select 
                        label="Trigger Event" 
                        name="trigger"
                        value={trigger} 
                        onChange={e => setTrigger(e.target.value)} 
                        options={[
                            {value: '', label: 'Select Trigger...'},
                            {value: 'Incoming Call', label: 'Incoming Call'}, 
                            {value: 'Incoming Email', label: 'Incoming Email'},
                            {value: 'Maintenance Created', label: 'Maintenance Created'},
                            {value: 'Rent Overdue', label: 'Rent Overdue'},
                            {value: 'Lease End Date', label: 'Lease End Date (Schedule)'}
                        ]}
                    />
                </div>

                <div className="border-t border-zinc-200 pt-4">
                    <h4 className="font-semibold text-zinc-900 mb-3 flex items-center"><BoltIcon className="w-4 h-4 mr-2 text-indigo-500"/> Workflow Steps</h4>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto p-1">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2 p-3 bg-zinc-50 rounded-md border border-zinc-200">
                                <span className="text-xs font-bold text-zinc-400 w-6">{index + 1}</span>
                                <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${
                                    step.type === 'action' ? 'bg-green-100 text-green-700' : 
                                    step.type === 'condition' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                }`}>{step.type}</span>
                                <input 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-zinc-800"
                                    placeholder="Describe this step..."
                                    value={step.description}
                                    onChange={(e) => updateStep(step.id, e.target.value)}
                                />
                                <button type="button" onClick={() => removeStep(step.id)} className="text-zinc-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                        {steps.length === 0 && <p className="text-center text-sm text-zinc-400 italic py-2">No steps defined yet.</p>}
                    </div>
                    <div className="flex gap-2 justify-center">
                        <Button type="button" size="sm" variant="outline" onClick={() => addStep('action')}>+ Action</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => addStep('condition')}>+ Condition</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => addStep('delay')}>+ Delay</Button>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-100">
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
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'reminders' | 'inspections' | 'automations'>('overview');
    
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

    const incompleteItems = normalizedItems.filter(i => !i.isCompleted);

    return (
        <div className="animate-slide-in-left">
            <PageHeader 
                title="Workflow & Automation" 
                subtitle="Manage your daily operations and automated processes."
                actions={
                    <div className="flex gap-2">
                        <Button onClick={() => setIsAutomationModalOpen(true)} variant="secondary" leftIcon={<BoltIcon className="w-4 h-4"/>}>New Automation</Button>
                        <Button onClick={() => { setEditingTask(null); setIsTaskFormOpen(true); }} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add Task</Button>
                    </div>
                }
            />

            <div className="border-b border-zinc-200 bg-white px-2 rounded-t-lg mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: ClipboardDocumentListIcon },
                        { id: 'tasks', label: 'Tasks', icon: ListBulletIcon },
                        { id: 'reminders', label: 'Reminders', icon: BellAlertIcon },
                        { id: 'inspections', label: 'Inspections', icon: ShieldCheckIcon },
                        { id: 'automations', label: 'Automations', icon: BoltIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-zinc-900 text-zinc-900'
                                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                            } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all`}
                        >
                            <tab.icon className={`${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-500'} -ml-0.5 mr-2 h-5 w-5`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
                        <h3 className="font-semibold text-zinc-900 mb-4">Up Next</h3>
                        {incompleteItems.length > 0 ? (
                            <div className="space-y-3">
                                {incompleteItems.slice(0, 5).map(item => (
                                    <div key={item.id} className="flex items-center p-3 border rounded-md hover:bg-zinc-50">
                                        <div className={`p-2 rounded-full mr-3 ${
                                            item.type === 'task' ? 'bg-blue-100 text-blue-600' :
                                            item.type === 'reminder' ? 'bg-orange-100 text-orange-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                            {item.type === 'task' && <ListBulletIcon className="w-4 h-4"/>}
                                            {item.type === 'reminder' && <BellAlertIcon className="w-4 h-4"/>}
                                            {item.type === 'inspection' && <ShieldCheckIcon className="w-4 h-4"/>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                                            <p className="text-xs text-zinc-500">{item.subtitle} • Due {new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                        {item.type === 'task' && (
                                            <Button size="sm" variant="outline" onClick={() => handleToggleTask(item.raw as Task)}>Complete</Button>
                                        )}
                                        {item.type === 'reminder' && (
                                            <Button size="sm" variant="outline" onClick={() => handleToggleReminder(item.raw as Reminder)}>Done</Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm text-center py-8">All caught up! No pending items.</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'tasks' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map(task => (
                        <div key={task.id} className={`bg-white p-4 rounded-lg shadow-sm border ${task.status === TaskStatus.COMPLETED ? 'border-green-200 opacity-75' : 'border-zinc-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-semibold ${task.status === TaskStatus.COMPLETED ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>{task.title}</h4>
                                <button onClick={() => { setEditingTask(task); setIsTaskFormOpen(true); }} className="text-zinc-400 hover:text-zinc-600"><PencilIcon className="w-4 h-4"/></button>
                            </div>
                            <p className="text-sm text-zinc-600 mb-3">{task.description}</p>
                            <div className="flex justify-between items-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    task.priority === MaintenancePriority.URGENT ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-600'
                                }`}>{task.priority}</span>
                                <Button size="sm" variant={task.status === TaskStatus.COMPLETED ? 'outline' : 'primary'} onClick={() => handleToggleTask(task)}>
                                    {task.status === TaskStatus.COMPLETED ? 'Mark Pending' : 'Complete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && <p className="col-span-3 text-center text-zinc-400 py-10">No tasks found.</p>}
                </div>
            )}

            {activeTab === 'reminders' && (
                <div className="space-y-4">
                    <div className="flex justify-end"><Button size="sm" variant="outline" onClick={() => { setEditingReminder(null); setIsReminderFormOpen(true); }} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add Reminder</Button></div>
                    {reminders.map(rem => (
                        <div key={rem.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                            <div>
                                <h4 className="font-semibold text-zinc-900">{rem.task}</h4>
                                <p className="text-sm text-zinc-500">Property: {properties.find(p => p.id === rem.propertyId)?.address}</p>
                                <p className="text-xs text-zinc-400">Due: {new Date(rem.dueDate).toLocaleDateString()} • {rem.frequency}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditingReminder(rem); setIsReminderFormOpen(true); }}><PencilIcon className="w-4 h-4"/></Button>
                                <Button size="sm" variant={rem.isCompleted ? 'outline' : 'primary'} onClick={() => handleToggleReminder(rem)}>
                                    {rem.isCompleted ? 'Undo' : 'Complete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'inspections' && (
                <div className="space-y-4">
                    <div className="flex justify-end"><Button size="sm" variant="outline" onClick={() => { setEditingInspection(null); setIsInspectionFormOpen(true); }} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Schedule Inspection</Button></div>
                    {inspections.map(insp => (
                        <div key={insp.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                            <div>
                                <h4 className="font-semibold text-zinc-900">{insp.inspectionType}</h4>
                                <p className="text-sm text-zinc-500">{properties.find(p => p.id === insp.propertyId)?.address}</p>
                                <p className="text-xs text-zinc-400">Date: {new Date(insp.scheduledDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    insp.status === InspectionStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>{insp.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'automations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workflows.map(wf => (
                        <div key={wf.id} className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-zinc-900">{wf.name}</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Trigger: <span className="font-mono bg-zinc-100 px-1 rounded">{wf.trigger}</span></p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${wf.isActive ? 'bg-green-500' : 'bg-zinc-300'}`} title={wf.isActive ? 'Active' : 'Inactive'}></div>
                            </div>
                            <div className="space-y-2 mb-4">
                                {wf.steps.slice(0, 3).map((step, i) => (
                                    <div key={step.id} className="flex items-center text-xs text-zinc-600">
                                        <span className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center mr-2 text-[10px] font-bold">{i + 1}</span>
                                        <span className="truncate">{step.description}</span>
                                    </div>
                                ))}
                                {wf.steps.length > 3 && <p className="text-xs text-zinc-400 pl-6">+{wf.steps.length - 3} more steps</p>}
                            </div>
                            <div className="flex justify-end pt-2 border-t border-zinc-50">
                                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteWorkflow(wf.id)}><TrashIcon className="w-4 h-4"/></Button>
                                <Button size="sm" variant="ghost" onClick={() => alert("Edit workflow mock")}><PencilIcon className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    ))}
                    <div className="border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center p-8 hover:bg-zinc-50 cursor-pointer transition-colors" onClick={() => setIsAutomationModalOpen(true)}>
                        <PlusCircleIcon className="w-10 h-10 text-zinc-300 mb-2"/>
                        <span className="text-zinc-500 font-medium">Create New Workflow</span>
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
