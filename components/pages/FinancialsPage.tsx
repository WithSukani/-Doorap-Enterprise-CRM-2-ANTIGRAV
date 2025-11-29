
import React, { useState, useMemo } from 'react';
import { RentPayment, Expense, Property, Tenant, Landlord, RecurringPayment, PaymentLink, ApprovalRequest, BankAccount, ArrearChaseLog } from '../../types';
import { INITIAL_BANK_ACCOUNTS } from '../../constants';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { 
    PlusCircleIcon, ArrowUpRightIcon, ArrowDownLeftIcon, 
    CreditCardIcon, DocumentTextIcon,
    BanknotesIcon, LinkIcon, CalendarDaysIcon, ExclamationTriangleIcon,
    ChartPieIcon, ArrowPathIcon, CheckCircleIcon, XMarkIcon, UserGroupIcon, BuildingOffice2Icon,
    PresentationChartLineIcon, ReceiptPercentIcon, BriefcaseIcon, PaperAirplaneIcon,
    ArrowDownTrayIcon, WalletIcon, ClockIcon, FunnelIcon, MagnifyingGlassIcon,
    ChatBubbleLeftEllipsisIcon, EnvelopeIcon, DocumentDuplicateIcon, ClipboardDocumentCheckIcon
} from '../icons/HeroIcons';
import RentPaymentForm from '../forms/RentPaymentForm';
import ExpenseForm from '../forms/ExpenseForm';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

// --- Mock Data for Transactions ---
const MOCK_BANK_TRANSACTIONS = [
    { id: 'tx_1', date: new Date().toISOString(), description: 'FPS CREDIT FROM A. WONDERLAND', amount: 1200, type: 'credit', status: 'matched', matchId: 'ten1', bankAccountId: 'ba1' },
    { id: 'tx_2', date: new Date(Date.now() - 86400000).toISOString(), description: 'DIRECT DEBIT BGAS SERVICES', amount: -45.50, type: 'debit', status: 'auto-categorized', category: 'Utilities', bankAccountId: 'ba2' },
    { id: 'tx_3', date: new Date(Date.now() - 172800000).toISOString(), description: 'FPS CREDIT FROM B. BUILDER', amount: 950, type: 'credit', status: 'matched', matchId: 'ten2', bankAccountId: 'ba1' },
    { id: 'tx_4', date: new Date(Date.now() - 259200000).toISOString(), description: 'PLUMBPERFECT LTD INV-992', amount: -120.00, type: 'debit', status: 'pending', matchId: 'exp1', bankAccountId: 'ba2' },
    { id: 'tx_5', date: new Date(Date.now() - 345600000).toISOString(), description: 'UNKNOWN CREDIT REF 99281', amount: 500, type: 'credit', status: 'unreconciled', bankAccountId: 'ba3' },
    { id: 'tx_6', date: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'TFR FROM C. BROWN', amount: 1150, type: 'credit', status: 'unreconciled', bankAccountId: 'ba1' },
];

interface FinancialsPageProps {
  rentPayments: RentPayment[];
  addRentPayment: (payment: RentPayment) => void;
  updateRentPayment: (payment: RentPayment) => void;
  deleteRentPayment: (paymentId: string) => void;
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  properties: Property[];
  tenants: Tenant[];
  landlords: Landlord[];
  recurringPayments: RecurringPayment[];
  addRecurringPayment: (p: RecurringPayment) => void;
  paymentLinks: PaymentLink[];
  addPaymentLink: (l: PaymentLink) => void;
  addApprovalRequest: (req: ApprovalRequest) => void;
}

const CreatePaymentLinkModal = ({ isOpen, onClose, onSubmit, tenants, landlords, bankAccounts, history }: { 
    isOpen: boolean, onClose: () => void, onSubmit: (l: PaymentLink) => void, tenants: Tenant[], landlords: Landlord[], bankAccounts: BankAccount[], history: PaymentLink[]
}) => {
    const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
    const [payerType, setPayerType] = useState<'Tenant' | 'Landlord'>('Tenant');
    const [payerId, setPayerId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [accountId, setAccountId] = useState(bankAccounts[0]?.id || '');
    const [frequency, setFrequency] = useState<'One-off' | 'Weekly' | 'Monthly'>('One-off');

    const handleAction = (method: 'copy' | 'email' | 'sms') => {
        if (!amount || !payerId) return;
        
        const newLink: PaymentLink = { 
            id: `pl_${Date.now()}`, 
            payerId, 
            payerType,
            amount: parseFloat(amount), 
            description, 
            status: 'Open', 
            createdAt: new Date().toISOString(), 
            url: `https://pay.doorap.com/${Date.now()}`,
            frequency
        };
        onSubmit(newLink);
        
        let message = '';
        if (method === 'copy') message = "Link generated and copied to clipboard.";
        if (method === 'email') message = `Link generated and emailed to payer.`;
        if (method === 'sms') message = `Link generated and sent via SMS.`;
        
        alert(message);
        
        // Reset and switch to history to show it
        setPayerId(''); setAmount(''); setDescription('');
        setActiveTab('history');
    }

    if (!isOpen) return null;

    const getPayerName = (id: string, type: 'Tenant' | 'Landlord') => {
        if (type === 'Tenant') return tenants.find(t => t.id === id)?.name || 'Unknown';
        return landlords.find(l => l.id === id)?.name || 'Unknown';
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Money In (Payment Request)">
            <div className="flex border-b border-zinc-200 mb-4">
                <button 
                    className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'create' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('create')}
                >
                    New Request
                </button>
                <button 
                    className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Request History
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="space-y-4">
                    <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 flex items-start text-sm text-indigo-700">
                        <LinkIcon className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0" />
                        <p>Send a secure payment link for deposits, rent, or fees.</p>
                    </div>
                    
                    <Select 
                        label="Destination Account" 
                        name="account" 
                        value={accountId} 
                        onChange={e => setAccountId(e.target.value)} 
                        options={bankAccounts.map(ba => ({ value: ba.id, label: `${ba.name} (**** ${ba.last4})` }))} 
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Request Type</label>
                            <div className="flex border border-zinc-200 rounded-md overflow-hidden">
                                <button type="button" onClick={() => setFrequency('One-off')} className={`flex-1 py-2 text-sm transition-colors ${frequency === 'One-off' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>One-off</button>
                                <button type="button" onClick={() => setFrequency('Monthly')} className={`flex-1 py-2 text-sm transition-colors ${frequency === 'Monthly' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>Monthly</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Payer Type</label>
                            <div className="flex border border-zinc-200 rounded-md overflow-hidden">
                                <button type="button" onClick={() => setPayerType('Tenant')} className={`flex-1 py-2 text-sm transition-colors ${payerType === 'Tenant' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>Tenant</button>
                                <button type="button" onClick={() => setPayerType('Landlord')} className={`flex-1 py-2 text-sm transition-colors ${payerType === 'Landlord' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}>Landlord</button>
                            </div>
                        </div>
                    </div>

                    <Select 
                        label={payerType === 'Tenant' ? 'Select Tenant' : 'Select Landlord'} 
                        name="payer" 
                        value={payerId} 
                        onChange={e => setPayerId(e.target.value)} 
                        options={payerType === 'Tenant' 
                            ? tenants.map(t => ({ value: t.id, label: t.name })) 
                            : landlords.map(l => ({ value: l.id, label: l.name }))} 
                        placeholder="Select payer..."
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Amount (£)" name="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                        <Input label="Description" name="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder={frequency === 'Monthly' ? "e.g. Rent Payment" : "e.g. Maintenance Deposit"} />
                    </div>

                    <div className="flex justify-end pt-4 gap-2 border-t border-zinc-100">
                        <Button type="button" variant="outline" onClick={() => handleAction('copy')} leftIcon={<LinkIcon className="w-4 h-4"/>}>Copy Link</Button>
                        <Button type="button" variant="outline" onClick={() => handleAction('sms')} leftIcon={<ChatBubbleLeftEllipsisIcon className="w-4 h-4"/>}>SMS</Button>
                        <Button type="button" onClick={() => handleAction('email')} leftIcon={<EnvelopeIcon className="w-4 h-4"/>}>Send Email</Button>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="overflow-y-auto max-h-[400px]">
                    {history.length === 0 ? (
                        <p className="text-center text-zinc-400 py-8 text-sm">No payment links created yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(link => (
                                <div key={link.id} className="p-3 bg-white border border-zinc-200 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-zinc-900">£{link.amount.toLocaleString()}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${link.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {link.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            To: {getPayerName(link.payerId, link.payerType)} • {new Date(link.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-zinc-400">{link.description}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-800" onClick={() => alert("Link copied!")}>
                                        Copy
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    )
}

const ReconcileModal = ({ isOpen, onClose, tenants, bankAccounts }: { isOpen: boolean, onClose: () => void, tenants: Tenant[], bankAccounts: BankAccount[] }) => {
    const [selectedTx, setSelectedTx] = useState<string | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
    const [filterAccount, setFilterAccount] = useState('all');

    const filteredTxs = MOCK_BANK_TRANSACTIONS.filter(tx => 
        (tx.status === 'unreconciled' || tx.status === 'pending') && 
        (filterAccount === 'all' || tx.bankAccountId === filterAccount)
    );

    const handleMatch = () => {
        if(selectedTx && selectedTenant) {
            alert("Transaction matched successfully (Simulated)");
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reconcile Transactions" size="xl">
            <div className="mb-4">
                <Select 
                    label="Bank Account to Reconcile" 
                    name="accountFilter" 
                    value={filterAccount} 
                    onChange={(e) => setFilterAccount(e.target.value)}
                    options={[{value: 'all', label: 'All Accounts'}, ...bankAccounts.map(ba => ({value: ba.id, label: `${ba.name} (**${ba.last4})`}))]}
                />
            </div>
            <div className="flex flex-col md:flex-row gap-6 h-[400px]">
                <div className="flex-1 bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden flex flex-col">
                    <div className="p-3 bg-white border-b border-zinc-200 font-semibold text-sm flex justify-between">
                        <span>Bank Feed</span>
                        <span className="text-zinc-400 font-normal">{filteredTxs.length} items</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredTxs.length === 0 && <p className="text-xs text-center text-zinc-400 mt-4">No unreconciled transactions.</p>}
                        {filteredTxs.map(tx => {
                            const accName = bankAccounts.find(b => b.id === tx.bankAccountId)?.name;
                            return (
                                <div 
                                    key={tx.id} 
                                    onClick={() => setSelectedTx(tx.id)}
                                    className={`p-3 rounded-md border cursor-pointer transition-all ${selectedTx === tx.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-zinc-900">£{Math.abs(tx.amount)}</span>
                                        <span className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-zinc-600 truncate">{tx.description}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className={`text-[10px] uppercase font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.type}</span>
                                        <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 rounded">{accName}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex-1 bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden flex flex-col">
                    <div className="p-3 bg-white border-b border-zinc-200 font-semibold text-sm">Suggested Matches</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {tenants.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => setSelectedTenant(t.id)}
                                className={`p-3 rounded-md border cursor-pointer transition-all ${selectedTenant === t.id ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                            >
                                <p className="font-medium text-sm">{t.name}</p>
                                <p className="text-xs text-zinc-500">Expected Rent: £{t.rentAmount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-zinc-100 mt-4 gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleMatch} disabled={!selectedTx || !selectedTenant}>Match & Reconcile</Button>
            </div>
        </Modal>
    )
}

const ChasePaymentModal = ({ isOpen, onClose, arrearItem, currentStatus, onStatusChange }: { isOpen: boolean, onClose: () => void, arrearItem: any, currentStatus: string, onStatusChange: (status: string) => void }) => {
    const [actionStep, setActionStep] = useState<'select' | 'success'>('select');
    const [successMessage, setSuccessMessage] = useState('');
    const [performedAction, setPerformedAction] = useState('');

    if(!isOpen || !arrearItem) return null;

    const handleAction = (action: string, nextStatus: string) => {
        let msg = '';
        if (action === 'Gentle Email Reminder') msg = `Gentle reminder email has been queued and sent to ${arrearItem.tenant.email}.`;
        if (action === 'SMS Nudge') msg = `SMS nudge sent to ${arrearItem.tenant.phone}.`;
        if (action === 'Formal Notice') msg = `Formal Demand Notice (PDF) has been generated and emailed to ${arrearItem.tenant.name}. A copy has been saved to documents.`;
        
        setPerformedAction(action);
        setSuccessMessage(msg);
        onStatusChange(nextStatus);
        setActionStep('success');
    }

    const handleClose = () => {
        setActionStep('select');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={actionStep === 'success' ? 'Action Successful' : 'Chase Payment Action'} size="md">
            {actionStep === 'select' ? (
                <div className="space-y-6">
                    <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-zinc-900 text-lg">{arrearItem.tenant.name}</h4>
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">{arrearItem.daysOverdue} Days Late</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-zinc-600">Outstanding:</span>
                            <span className="font-bold text-red-600 text-xl">£{arrearItem.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-zinc-100 pt-2">
                            <span className="text-zinc-500">Current Status:</span>
                            <span className="font-medium text-zinc-800">{currentStatus || 'Action Required'}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider">Select Action</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                onClick={() => handleAction('Gentle Email Reminder', 'Reminder Sent')}
                                className="flex items-center p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all text-left group"
                            >
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                                    <EnvelopeIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 text-sm">Send Gentle Reminder</p>
                                    <p className="text-xs text-zinc-500">Email notification about upcoming/missed payment.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleAction('SMS Nudge', 'SMS Sent')}
                                className="flex items-center p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all text-left group"
                            >
                                <div className="bg-green-100 text-green-600 p-2 rounded-full mr-4 group-hover:bg-green-200 transition-colors">
                                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 text-sm">Send SMS Nudge</p>
                                    <p className="text-xs text-zinc-500">Direct text message to tenant's mobile.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleAction('Formal Notice', 'Formal Notice Issued')}
                                className="flex items-center p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all text-left group"
                            >
                                <div className="bg-orange-100 text-orange-600 p-2 rounded-full mr-4 group-hover:bg-orange-200 transition-colors">
                                    <DocumentDuplicateIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 text-sm">Issue Formal Notice</p>
                                    <p className="text-xs text-zinc-500">Generate and send formal demand letter.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircleIcon className="h-10 w-10 text-green-600" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">{performedAction} Sent</h3>
                        <p className="text-sm text-zinc-500 mt-2 px-4">{successMessage}</p>
                    </div>
                    {performedAction === 'Formal Notice' && (
                        <div className="bg-zinc-50 p-3 mx-4 rounded-md border border-zinc-200 flex items-center justify-center text-xs text-zinc-600">
                            <DocumentTextIcon className="w-4 h-4 mr-2 text-zinc-400"/> Formal_Demand_Notice.pdf (Generated)
                        </div>
                    )}
                    <div className="pt-4">
                        <Button onClick={handleClose} className="w-full justify-center">Done</Button>
                    </div>
                </div>
            )}
        </Modal>
    )
}

const FinancialsPage: React.FC<FinancialsPageProps> = ({
  rentPayments, addRentPayment, updateRentPayment, deleteRentPayment,
  expenses, addExpense, updateExpense, deleteExpense,
  properties, tenants, landlords,
  recurringPayments, addRecurringPayment, paymentLinks, addPaymentLink, addApprovalRequest
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cashflow' | 'property_ledger' | 'arrears'>('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);

  // Modals State
  const [isRentFormOpen, setIsRentFormOpen] = useState(false);
  const [editingRentPayment, setEditingRentPayment] = useState<RentPayment | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  
  // Arrears Modal & State
  const [chaseModalOpen, setChaseModalOpen] = useState(false);
  const [selectedArrear, setSelectedArrear] = useState<any>(null);
  // Store status of chases. Key: tenantId, Value: Status string
  const [chaseStatuses, setChaseStatuses] = useState<Record<string, string>>({});

  // Filters for Cashflow
  const [cashflowDateFilter, setCashflowDateFilter] = useState('this_month');
  const [cashflowTypeFilter, setCashflowTypeFilter] = useState('all');
  const [cashflowPropertyFilter, setCashflowPropertyFilter] = useState('all');
  const [cashflowSearch, setCashflowSearch] = useState('');

  // Handlers
  const handleAddRentPayment = () => { setEditingRentPayment(null); setIsRentFormOpen(true); };
  const handleEditRentPayment = (payment: RentPayment) => { setEditingRentPayment(payment); setIsRentFormOpen(true); };
  const handleDeleteRentPayment = (id: string) => { if (window.confirm('Delete payment?')) deleteRentPayment(id); };
  const handleRentSubmit = (payment: RentPayment) => {
      if (editingRentPayment) updateRentPayment(payment); else addRentPayment(payment);
      setIsRentFormOpen(false);
  }

  const handleAddExpense = () => { setEditingExpense(null); setIsExpenseFormOpen(true); };
  const handleEditExpense = (expense: Expense) => { setEditingExpense(expense); setIsExpenseFormOpen(true); };
  const handleDeleteExpense = (id: string) => { if (window.confirm('Delete expense?')) deleteExpense(id); };
  const handleExpenseSubmit = (expense: Expense) => {
      if (editingExpense) updateExpense(expense); else addExpense(expense);
      setIsExpenseFormOpen(false);
  }

  const handleAddBankAccount = () => {
      alert("Opening Stripe Treasury connect flow... (Mock)");
  }

  const handleOpenChaseModal = (arrearItem: any) => {
      setSelectedArrear(arrearItem);
      setChaseModalOpen(true);
  }

  const handleUpdateChaseStatus = (newStatus: string) => {
      if (selectedArrear) {
          setChaseStatuses(prev => ({
              ...prev,
              [selectedArrear.tenant.id]: newStatus
          }));
      }
  }

  const handleViewLedger = (propertyId: string) => {
      setCashflowPropertyFilter(propertyId);
      setCashflowDateFilter('all');
      setActiveTab('cashflow');
  }

  // --- Computations ---

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Combine all transactions for Cashflow Tab
  const cashflowData = useMemo(() => {
      const formattedRent = rentPayments.map(r => ({
          id: r.id,
          date: r.date,
          description: `Rent: ${tenants.find(t => t.id === r.tenantId)?.name || 'Unknown'}`,
          category: 'Rent',
          amount: r.amount,
          type: 'Income',
          propertyId: r.propertyId,
          bankAccountId: r.bankAccountId,
          status: 'Cleared'
      }));

      const formattedExpenses = expenses.map(e => ({
          id: e.id,
          date: e.date,
          description: e.description,
          category: e.category,
          amount: e.amount,
          type: 'Expense',
          propertyId: e.propertyId,
          bankAccountId: e.bankAccountId,
          status: 'Cleared'
      }));

      // Combine with Mock Bank Transactions if they aren't reconciled yet to show true cashflow
      const bankTxs = MOCK_BANK_TRANSACTIONS.filter(tx => tx.status === 'unreconciled' || tx.status === 'pending').map(tx => ({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          category: 'Uncategorized',
          amount: Math.abs(tx.amount),
          type: tx.type === 'credit' ? 'Income' : 'Expense',
          propertyId: null,
          bankAccountId: tx.bankAccountId,
          status: 'Pending'
      }));

      return [...formattedRent, ...formattedExpenses, ...bankTxs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rentPayments, expenses, tenants]);

  const filteredCashflow = cashflowData.filter(item => {
      const matchesAccount = selectedAccountId === 'all' || item.bankAccountId === selectedAccountId;
      const matchesType = cashflowTypeFilter === 'all' || item.type === cashflowTypeFilter;
      const matchesProperty = cashflowPropertyFilter === 'all' || item.propertyId === cashflowPropertyFilter;
      
      let matchesDate = true;
      const date = new Date(item.date);
      const now = new Date();
      if(cashflowDateFilter === 'this_month') matchesDate = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      if(cashflowDateFilter === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() -1, 1);
          matchesDate = date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      }
      if(cashflowDateFilter === 'this_year') matchesDate = date.getFullYear() === now.getFullYear();

      // Search Filter
      const matchesSearch = cashflowSearch === '' || 
          item.description.toLowerCase().includes(cashflowSearch.toLowerCase()) ||
          item.category.toLowerCase().includes(cashflowSearch.toLowerCase()) ||
          item.amount.toString().includes(cashflowSearch);

      return matchesAccount && matchesType && matchesProperty && matchesDate && matchesSearch;
  });

  // Calculate Arrears
  const arrearsList = useMemo(() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const unpaidTenants = tenants.filter(t => {
          const hasPaidThisMonth = rentPayments.some(rp => {
              const pd = new Date(rp.date);
              return rp.tenantId === t.id && pd.getMonth() === currentMonth && pd.getFullYear() === currentYear;
          });
          // Also check mock condition for visual demo
          return !hasPaidThisMonth && t.rentAmount && t.rentAmount > 0;
      });

      return unpaidTenants.map(t => {
          const daysOverdue = Math.floor(Math.random() * 15) + 1; // Mock days overdue
          return {
              tenant: t,
              amount: t.rentAmount || 0,
              daysOverdue,
              property: properties.find(p => p.id === t.propertyId),
              status: chaseStatuses[t.id] || 'Action Required' // Get status from local state
          };
      });
  }, [tenants, rentPayments, properties, chaseStatuses]);


  // Property Ledger Grouping
  const propertyLedgerData = useMemo(() => {
      return properties.map(p => {
          const pIncome = cashflowData.filter(c => c.propertyId === p.id && c.type === 'Income').reduce((s, c) => s + c.amount, 0);
          const pExpense = cashflowData.filter(c => c.propertyId === p.id && c.type === 'Expense').reduce((s, c) => s + c.amount, 0);
          return {
              ...p,
              totalIncome: pIncome,
              totalExpense: pExpense,
              net: pIncome - pExpense
          }
      });
  }, [properties, cashflowData]);

  const getAccountName = (id?: string) => {
      if(!id) return '';
      const acc = bankAccounts.find(ba => ba.id === id);
      return acc ? acc.name : '';
  }

  const getArrearStatusBadge = (status: string) => {
      switch(status) {
          case 'Action Required': return 'bg-red-100 text-red-700';
          case 'Reminder Sent': return 'bg-blue-100 text-blue-700';
          case 'SMS Sent': return 'bg-green-100 text-green-700';
          case 'Formal Notice Issued': return 'bg-orange-100 text-orange-700';
          default: return 'bg-gray-100 text-gray-600';
      }
  }


  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Financials & Banking" 
        subtitle="Complete financial oversight, banking feeds, and client accounting."
        actions={
            <div className="flex gap-2">
                <Button onClick={() => setIsReconcileModalOpen(true)} variant="outline" leftIcon={<DocumentTextIcon className="w-4 h-4"/>} className="hidden sm:flex">Reconcile</Button>
                <Button onClick={() => setIsPaymentLinkModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none" leftIcon={<LinkIcon className="w-4 h-4"/>}>Money In</Button>
            </div>
        }
      />

      {/* Multi-Account Management Section */}
      <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Bank Accounts</h3>
              <Button size="sm" variant="outline" onClick={handleAddBankAccount} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Connect Account</Button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2">
              <div 
                  onClick={() => setSelectedAccountId('all')}
                  className={`min-w-[240px] p-4 rounded-lg border cursor-pointer transition-all ${selectedAccountId === 'all' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
              >
                  <p className={`text-sm font-medium ${selectedAccountId === 'all' ? 'text-zinc-300' : 'text-zinc-500'}`}>Total Cash Position</p>
                  <p className="text-2xl font-bold mt-1">£{totalBalance.toLocaleString()}</p>
              </div>
              {bankAccounts.map(account => (
                  <div 
                      key={account.id}
                      onClick={() => setSelectedAccountId(account.id)}
                      className={`min-w-[240px] p-4 rounded-lg border cursor-pointer transition-all ${selectedAccountId === account.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                  >
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-semibold flex items-center"><WalletIcon className="w-4 h-4 mr-1 opacity-70"/> {account.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{account.status}</span>
                      </div>
                      <p className="text-xl font-bold text-zinc-900">£{account.balance.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500 mt-1">**** {account.last4} • {account.type}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-zinc-200 bg-white px-2 rounded-t-lg">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                  { id: 'dashboard', label: 'Overview', icon: PresentationChartLineIcon },
                  { id: 'cashflow', label: 'Cashflow', icon: BanknotesIcon },
                  { id: 'property_ledger', label: 'Property Ledger', icon: BuildingOffice2Icon },
                  { id: 'arrears', label: 'Arrears & Chasing', icon: ExclamationTriangleIcon },
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
                      <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400'}`} />
                      {tab.label}
                  </button>
              ))}
          </nav>
      </div>

      {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                  <h4 className="font-bold text-zinc-900 mb-4">Live Cash Flow</h4>
                  <div className="h-64 flex items-end justify-center space-x-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                              { name: 'Week 1', income: 4000, expense: 2400 },
                              { name: 'Week 2', income: 3000, expense: 1398 },
                              { name: 'Week 3', income: 2000, expense: 9800 },
                              { name: 'Week 4', income: 2780, expense: 3908 },
                          ]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10}/>
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                              <CartesianGrid vertical={false} stroke="#f4f4f5" />
                              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm flex flex-col">
                  <h4 className="font-bold text-zinc-900 mb-4">Latest Transactions</h4>
                  <div className="flex-1 overflow-y-auto space-y-4">
                      {cashflowData.slice(0, 5).map(tx => (
                          <div key={tx.id} className="flex justify-between items-center text-sm border-b border-zinc-50 pb-2">
                              <div>
                                  <p className="font-medium text-zinc-900 truncate max-w-[150px]">{tx.description}</p>
                                  <p className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                              </div>
                              <span className={`font-mono font-medium ${tx.type === 'Income' ? 'text-green-600' : 'text-zinc-900'}`}>
                                  {tx.type === 'Income' ? '+' : '-'}£{Math.abs(tx.amount).toFixed(2)}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'cashflow' && (
          <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-lg border border-zinc-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex gap-2 items-center flex-wrap flex-1">
                      <div className="relative w-48">
                          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                          <input 
                              type="text" 
                              placeholder="Search transactions..." 
                              className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-md focus:ring-2 focus:ring-zinc-900 outline-none"
                              value={cashflowSearch}
                              onChange={(e) => setCashflowSearch(e.target.value)}
                          />
                      </div>
                      <Select 
                          name="timeFilter" 
                          value={cashflowDateFilter} 
                          onChange={(e) => setCashflowDateFilter(e.target.value)}
                          options={[
                              {value: 'this_month', label: 'This Month'},
                              {value: 'last_month', label: 'Last Month'},
                              {value: 'this_year', label: 'This Year'},
                              {value: 'all', label: 'All Time'}
                          ]}
                          containerClassName="mb-0 w-32"
                      />
                      <Select 
                          name="typeFilter" 
                          value={cashflowTypeFilter} 
                          onChange={(e) => setCashflowTypeFilter(e.target.value)}
                          options={[
                              {value: 'all', label: 'All Types'},
                              {value: 'Income', label: 'Income Only'},
                              {value: 'Expense', label: 'Expense Only'}
                          ]}
                          containerClassName="mb-0 w-32"
                      />
                      <Select 
                          name="propFilter" 
                          value={cashflowPropertyFilter} 
                          onChange={(e) => setCashflowPropertyFilter(e.target.value)}
                          options={[{value: 'all', label: 'All Properties'}, ...properties.map(p => ({value: p.id, label: p.address}))]}
                          containerClassName="mb-0 w-48"
                      />
                  </div>
                  <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddExpense} variant="outline" leftIcon={<ArrowDownLeftIcon className="w-4 h-4"/>}>Log Expense</Button>
                      <Button size="sm" onClick={handleAddRentPayment} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Record Income</Button>
                  </div>
              </div>

              <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Property</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-zinc-200">
                            {filteredCashflow.length > 0 ? filteredCashflow.map((item, idx) => (
                                <tr key={`${item.id}-${idx}`} className="hover:bg-zinc-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{new Date(item.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{item.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                                        {item.bankAccountId ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {getAccountName(item.bankAccountId)}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{properties.find(p => p.id === item.propertyId)?.address || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500"><span className="bg-zinc-100 px-2 py-1 rounded">{item.category}</span></td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${item.type === 'Income' ? 'text-green-600' : 'text-zinc-900'}`}>
                                        {item.type === 'Income' ? '+' : '-'}£{Math.abs(item.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-bold ${item.status === 'Cleared' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{item.status}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="p-8 text-center text-zinc-400 text-sm">No transactions match your filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'property_ledger' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {propertyLedgerData.map(p => (
                  <div key={p.id} className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                          <h4 className="font-bold text-zinc-900 truncate" title={p.address}>{p.address}</h4>
                          <p className="text-xs text-zinc-500">{p.postcode}</p>
                      </div>
                      <div className="p-4 flex-1">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-zinc-600">Total Income</span>
                              <span className="text-sm font-medium text-green-600">£{p.totalIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-sm text-zinc-600">Total Expenses</span>
                              <span className="text-sm font-medium text-red-600">£{p.totalExpense.toLocaleString()}</span>
                          </div>
                          <div className="pt-3 border-t border-dashed border-zinc-200 flex justify-between items-center">
                              <span className="text-sm font-bold text-zinc-900">Net Cashflow</span>
                              <span className={`text-lg font-bold ${p.net >= 0 ? 'text-zinc-900' : 'text-red-600'}`}>£{p.net.toLocaleString()}</span>
                          </div>
                      </div>
                      <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
                          <button 
                            onClick={() => handleViewLedger(p.id)}
                            className="text-xs font-medium text-indigo-600 hover:underline w-full h-full block"
                          >
                              View Full Ledger
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {activeTab === 'arrears' && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                  <div>
                      <h4 className="text-red-900 font-bold">Arrears Action Center</h4>
                      <p className="text-red-700 text-sm mt-1">You have {arrearsList.length} tenants with overdue payments this month. Total outstanding: £{arrearsList.reduce((s, a) => s + a.amount, 0).toLocaleString()}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {arrearsList.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg border border-zinc-200 shadow-sm p-5 hover:shadow-md transition-shadow relative">
                          <div className="absolute top-4 right-4">
                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getArrearStatusBadge(item.status)}`}>
                                  {item.status}
                              </span>
                          </div>
                          <div className="flex justify-between items-start mb-3 mt-6">
                              <div>
                                  <h4 className="font-bold text-zinc-900">{item.tenant.name}</h4>
                                  <p className="text-xs text-zinc-500">{item.property?.address}</p>
                              </div>
                          </div>
                          <div className="mb-4">
                              <p className="text-2xl font-bold text-zinc-900">£{item.amount.toLocaleString()}</p>
                              <p className="text-xs text-red-500 font-medium mt-1">{item.daysOverdue} Days Overdue</p>
                          </div>
                          <Button 
                              onClick={() => handleOpenChaseModal(item)} 
                              variant="outline" 
                              className="w-full justify-center text-red-600 hover:bg-red-50 border-red-200"
                              leftIcon={<PaperAirplaneIcon className="w-4 h-4"/>}
                          >
                              Chase Payment
                          </Button>
                      </div>
                  ))}
                  {arrearsList.length === 0 && (
                      <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-dashed border-zinc-200">
                          <CheckCircleIcon className="w-16 h-16 text-green-200 mx-auto mb-4"/>
                          <h3 className="text-lg font-medium text-zinc-900">All Clear!</h3>
                          <p className="text-zinc-500">No arrears detected for the current period.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Modals */}
      {isRentFormOpen && (
          <RentPaymentForm
              isOpen={isRentFormOpen}
              onClose={() => setIsRentFormOpen(false)}
              onSubmit={handleRentSubmit}
              initialData={editingRentPayment}
              properties={properties}
              tenants={tenants}
          />
      )}
      {isExpenseFormOpen && (
          <ExpenseForm
              isOpen={isExpenseFormOpen}
              onClose={() => setIsExpenseFormOpen(false)}
              onSubmit={handleExpenseSubmit}
              initialData={editingExpense}
              properties={properties}
          />
      )}
      
      <CreatePaymentLinkModal 
          isOpen={isPaymentLinkModalOpen} 
          onClose={() => setIsPaymentLinkModalOpen(false)} 
          onSubmit={addPaymentLink} 
          tenants={tenants}
          landlords={landlords}
          bankAccounts={bankAccounts}
          history={paymentLinks}
      />

      <ReconcileModal 
          isOpen={isReconcileModalOpen}
          onClose={() => setIsReconcileModalOpen(false)}
          tenants={tenants}
          bankAccounts={bankAccounts}
      />

      <ChasePaymentModal
          isOpen={chaseModalOpen}
          onClose={() => setChaseModalOpen(false)}
          arrearItem={selectedArrear}
          currentStatus={selectedArrear?.status}
          onStatusChange={handleUpdateChaseStatus}
      />

    </div>
  );
};

export default FinancialsPage;
