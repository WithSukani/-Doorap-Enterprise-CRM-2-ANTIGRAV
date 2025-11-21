
import React, { useState } from 'react';
import { DoriInteraction, DoriAction, EmergencyItem, DoriExecution, DoriExecutionStep } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { 
    DoriIcon, MicrophoneIcon, PlayCircleIcon, StopCircleIcon, SpeakerWaveIcon, 
    BoltIcon, CheckCircleIcon, XMarkIcon, ChatBubbleLeftEllipsisIcon, PhoneIcon, 
    EnvelopeIcon, ClockIcon, ArrowTrendingUpIcon, PlusCircleIcon, FireIcon,
    ArrowPathIcon, ListBulletIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, ChevronUpIcon
} from '../icons/HeroIcons';

interface DoriPageProps {
    interactions: DoriInteraction[];
    actions: DoriAction[];
    emergencies: EmergencyItem[];
    executions: DoriExecution[];
    updateAction: (action: DoriAction) => void;
    updateEmergency: (item: EmergencyItem) => void;
}

interface EmergencyCardProps {
    item: EmergencyItem;
    onResolve: (i: EmergencyItem) => void;
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({ item, onResolve }) => (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex justify-between items-start shadow-sm mb-3">
        <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full text-red-600 mt-1">
                <FireIcon className="w-6 h-6"/>
            </div>
            <div>
                <h4 className="font-bold text-red-900">{item.title}</h4>
                <p className="text-sm text-red-800 mt-1">{item.description}</p>
                <p className="text-xs text-red-500 mt-2 flex items-center"><ClockIcon className="w-3 h-3 mr-1"/> {new Date(item.timestamp).toLocaleString()}</p>
            </div>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-none" onClick={() => onResolve({...item, status: 'Resolved'})}>
            Resolve
        </Button>
    </div>
)

const LiveConsole = ({ status, emergencies, onResolveEmergency }: { status: 'Online' | 'Offline', emergencies: EmergencyItem[], onResolveEmergency: (i: EmergencyItem) => void }) => {
    const [isListening, setIsListening] = useState(true);

    return (
        <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <DoriIcon className="w-48 h-48"/>
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Dori Concierge
                            <span className="flex h-3 w-3 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isListening ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">Status: {isListening ? 'Active & Listening' : 'Offline'}</p>
                    </div>
                    <Button 
                        size="sm" 
                        className={`border-none ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        onClick={() => setIsListening(!isListening)}
                    >
                        {isListening ? 'Go Offline' : 'Go Online'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-2 text-zinc-400 text-sm">
                            <PhoneIcon className="w-4 h-4"/> Active Calls
                        </div>
                        <p className="text-2xl font-mono">0</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-2 text-zinc-400 text-sm">
                            <ChatBubbleLeftEllipsisIcon className="w-4 h-4"/> Chats
                        </div>
                        <p className="text-2xl font-mono">0</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <div className="flex items-center gap-3 mb-2 text-zinc-400 text-sm">
                            <BoltIcon className="w-4 h-4"/> Executing Workflows
                        </div>
                        <p className="text-2xl font-mono text-blue-400">1</p>
                    </div>
                </div>

                {/* Integrated Emergency Center */}
                {emergencies.length > 0 && (
                    <div className="mt-6 border-t border-zinc-700 pt-6">
                        <h3 className="text-red-400 font-bold flex items-center mb-4 animate-pulse">
                            <FireIcon className="w-5 h-5 mr-2"/> Active Critical Incidents ({emergencies.length})
                        </h3>
                        <div className="space-y-3">
                            {emergencies.map(em => (
                                <div key={em.id} className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-red-200">{em.title}</h4>
                                        <p className="text-sm text-red-300/80">{em.description}</p>
                                        <p className="text-xs text-red-400 mt-1">{new Date(em.timestamp).toLocaleString()}</p>
                                    </div>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-none" onClick={() => onResolveEmergency({...em, status: 'Resolved'})}>
                                        Resolve
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

interface InteractionLogCardProps {
    log: DoriInteraction;
    onView: (l: DoriInteraction) => void;
}

const InteractionLogCard: React.FC<InteractionLogCardProps> = ({ log, onView }) => {
    const getIcon = () => {
        switch(log.type) {
            case 'Voice Call': return <PhoneIcon className="w-5 h-5 text-blue-500"/>;
            case 'Chat': return <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-green-500"/>;
            case 'Email': return <EnvelopeIcon className="w-5 h-5 text-amber-500"/>;
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => onView(log)}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-50 rounded-full">{getIcon()}</div>
                    <div>
                        <p className="font-semibold text-zinc-900 text-sm">{log.contactName}</p>
                        <p className="text-xs text-zinc-500">{log.contactRole} • {log.direction}</p>
                    </div>
                </div>
                <span className="text-xs text-zinc-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{log.summary}</p>
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    log.sentiment === 'Positive' ? 'bg-green-50 text-green-700 border-green-100' :
                    log.sentiment === 'Urgent' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-zinc-50 text-zinc-600 border-zinc-200'
                }`}>
                    {log.sentiment}
                </span>
                {log.duration && <span className="text-[10px] text-zinc-400 flex items-center"><ClockIcon className="w-3 h-3 mr-1"/> {log.duration}</span>}
            </div>
        </div>
    )
}

interface ActionCardProps {
    action: DoriAction;
    onUpdate: (a: DoriAction) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onUpdate }) => (
    <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm mb-3">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-zinc-900 text-sm">{action.title}</h4>
                    <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200">{action.type}</span>
                </div>
                <p className="text-xs text-zinc-600 mb-2">{action.description}</p>
                <p className="text-[10px] text-zinc-400">Confidence: {action.confidenceScore}%</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onUpdate({...action, status: 'Rejected'})} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><XMarkIcon className="w-5 h-5"/></button>
                <button onClick={() => onUpdate({...action, status: 'Approved'})} className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition-colors"><CheckCircleIcon className="w-5 h-5"/></button>
            </div>
        </div>
    </div>
)

const TranscriptModal = ({ log, onClose }: { log: DoriInteraction, onClose: () => void }) => {
    if (!log) return null;
    return (
        <Modal isOpen={!!log} onClose={onClose} title="Interaction Detail">
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <div>
                        <p className="font-semibold text-zinc-900">{log.contactName}</p>
                        <p className="text-xs text-zinc-500">{log.contactRole} • {log.type}</p>
                    </div>
                    {log.audioUrl && (
                        <Button size="sm" variant="outline" leftIcon={<PlayCircleIcon className="w-4 h-4"/>}>Play Recording</Button>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold text-zinc-900 mb-2 text-sm">Dori's Summary</h4>
                    <p className="text-sm text-zinc-600 bg-blue-50 p-3 rounded border border-blue-100">{log.summary}</p>
                </div>

                {log.transcript && (
                    <div>
                        <h4 className="font-semibold text-zinc-900 mb-2 text-sm">Transcript</h4>
                        <div className="bg-zinc-50 p-4 rounded border border-zinc-200 max-h-60 overflow-y-auto text-sm font-mono text-zinc-700 whitespace-pre-wrap">
                            {log.transcript}
                        </div>
                    </div>
                )}

                {log.actionItems && log.actionItems.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-zinc-900 mb-2 text-sm">Detected Action Items</h4>
                        <ul className="space-y-2">
                            {log.actionItems.map((item, i) => (
                                <li key={i} className="flex items-center text-sm text-zinc-700">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2"/> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    )
}

const ExecutionLogList = ({ executions }: { executions: DoriExecution[] }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Running' | 'Completed'>('All');

    const filteredExecutions = executions.filter(ex => {
        const matchesSearch = ex.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ex.entityName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || ex.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Running': return 'bg-blue-100 text-blue-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Failed': return 'bg-red-100 text-red-700';
            case 'Waiting': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-zinc-100 text-zinc-700';
        }
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-zinc-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-zinc-900 text-lg">Workflow Execution Log</h3>
                    <Button variant="ghost" size="sm" leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>Refresh</Button>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                        <input 
                            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-md focus:ring-2 focus:ring-zinc-900 outline-none"
                            placeholder="Search workflows or names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="All">All Status</option>
                        <option value="Running">Running</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredExecutions.length > 0 ? (
                    <div className="divide-y divide-zinc-100">
                        {filteredExecutions.map(ex => (
                            <div key={ex.id} className="bg-white">
                                <div 
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
                                    onClick={() => toggleExpand(ex.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`p-2 rounded-full bg-zinc-100 flex-shrink-0`}>
                                            <BoltIcon className="w-5 h-5 text-zinc-500"/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-zinc-900 text-sm truncate">{ex.workflowName}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(ex.status)}`}>{ex.status}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                For: <span className="font-medium text-zinc-700">{ex.entityName}</span> ({ex.entityRole})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-shrink-0">
                                        <span>{new Date(ex.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                        {expandedId === ex.id ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}
                                    </div>
                                </div>
                                
                                {expandedId === ex.id && (
                                    <div className="bg-zinc-50 p-4 border-t border-zinc-100 pl-12">
                                        <ul className="relative border-l-2 border-zinc-200 space-y-4">
                                            {ex.steps.map((step, idx) => (
                                                <li key={step.id} className="ml-4 relative">
                                                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                                        step.status === 'Completed' ? 'bg-green-500' :
                                                        step.status === 'Pending' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-300'
                                                    }`}></div>
                                                    <div className="flex justify-between items-start text-sm">
                                                        <span className="text-zinc-700">{step.description}</span>
                                                        <span className="text-xs text-zinc-400 font-mono">{new Date(step.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center text-zinc-400 text-sm">
                        No workflow executions found.
                    </div>
                )}
            </div>
        </div>
    )
}

const DoriPage: React.FC<DoriPageProps> = ({ 
    interactions, actions, emergencies, updateAction, updateEmergency, executions
}) => {
    const [selectedLog, setSelectedLog] = useState<DoriInteraction | null>(null);

    const pendingActions = actions.filter(a => a.status === 'Pending');
    const openEmergencies = emergencies.filter(e => e.status === 'Open');

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader title="Dori Command Center" subtitle="Your automated concierge and operation handler." />

            <div className="space-y-6">
                <LiveConsole status="Online" emergencies={openEmergencies} onResolveEmergency={updateEmergency} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Logs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-zinc-900 text-lg">Interaction Feed</h3>
                                <Button variant="ghost" size="sm" leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>Refresh</Button>
                            </div>
                            <div className="space-y-4">
                                {interactions.slice(0, 5).map(log => (
                                    <InteractionLogCard key={log.id} log={log} onView={setSelectedLog} />
                                ))}
                            </div>
                        </div>

                        {/* Enhanced Execution Log */}
                        <ExecutionLogList executions={executions} />
                    </div>

                    {/* Right: Approvals */}
                    <div className="space-y-6">
                        <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-zinc-900 flex items-center">
                                    <BoltIcon className="w-5 h-5 mr-2 text-yellow-500"/> Permissions Queue
                                </h3>
                                <span className="bg-zinc-200 text-zinc-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingActions.length}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-4">Dori needs your confirmation to proceed with these actions.</p>
                            {pendingActions.length > 0 ? (
                                <div>
                                    {pendingActions.map(action => (
                                        <ActionCard key={action.id} action={action} onUpdate={updateAction} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-400 text-center py-4">No pending approvals.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TranscriptModal log={selectedLog!} onClose={() => setSelectedLog(null)} />
        </div>
    );
};

export default DoriPage;