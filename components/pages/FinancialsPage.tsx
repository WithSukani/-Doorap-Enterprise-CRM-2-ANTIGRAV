
import React, { useState, useMemo } from 'react';
import { RentPayment, Expense, Property, Tenant, Landlord, RecurringPayment, PaymentLink, ApprovalRequest } from '../../types';
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
    ArrowDownTrayIcon
} from '../icons/HeroIcons';
import RentPaymentForm from '../forms/RentPaymentForm';
import ExpenseForm from '../forms/ExpenseForm';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

// --- Mock Data ---
const MOCK_BANK_TRANSACTIONS = [
    { id: 'tx_1', date: new Date().toISOString(), description: 'FPS CREDIT FROM A. WONDERLAND', amount: 1200, type: 'credit', status: 'matched', matchId: 'ten1' },
    { id: 'tx_2', date: new Date(Date.now() - 86400000).toISOString(), description: 'DIRECT DEBIT BGAS SERVICES', amount: -45.50, type: 'debit', status: 'auto-categorized', category: 'Utilities' },
    { id: 'tx_3', date: new Date(Date.now() - 172800000).toISOString(), description: 'FPS CREDIT FROM B. BUILDER', amount: 950, type: 'credit', status: 'matched', matchId: 'ten2' },
    { id: 'tx_4', date: new Date(Date.now() - 259200000).toISOString(), description: 'PLUMBPERFECT LTD INV-992', amount: -120.00, type: 'debit', status: 'pending', matchId: 'exp1' },
    { id: 'tx_5', date: new Date(Date.now() - 345600000).toISOString(), description: 'UNKNOWN CREDIT REF 99281', amount: 500, type: 'credit', status: 'unreconciled' },
    { id: 'tx_6', date: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'TFR FROM C. BROWN', amount: 1150, type: 'credit', status: 'unreconciled' },
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

const ReconcileModal = ({ isOpen, onClose, tenants }: { isOpen: boolean, onClose: () => void, tenants: Tenant[] }) => {
    const [selectedTx, setSelectedTx] = useState<string | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
    const unreconciledTxs = MOCK_BANK_TRANSACTIONS.filter(tx => tx.status === 'unreconciled' || tx.status === 'pending');

    const handleMatch = () => {
        if(selectedTx && selectedTenant) {
            alert("Transaction matched successfully (Simulated)");
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reconcile Transactions" size="xl">
            <div className="flex flex-col md:flex-row gap-6 h-[500px]">
                {/* Left: Bank Feed */}
                <div className="flex-1 bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden flex flex-col">
                    <div className="p-3 bg-white border-b border-zinc-200 font-semibold text-sm">Bank Feed (Unreconciled)</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {unreconciledTxs.map(tx => (
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
                                <span className={`text-[10px] uppercase font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: System Matches */}
                <div className="flex-1 bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden flex flex-col">
                    <div className="p-3 bg-white border-b border-zinc-200 font-semibold text-sm">Possible Matches</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {tenants.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => setSelectedTenant(t.id)}
                                className={`p-3 rounded-md border cursor-pointer transition-all ${selectedTenant === t.id ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                            >
                                <p className="font-medium text-sm">{t.name}</p>
                                <p className="text-xs text-zinc-500">Rent: £{t.rentAmount}</p>
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

const SendFinancialRequestModal = ({ isOpen, onClose, onSubmit, landlords, initialLandlordId }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void, landlords: Landlord[], initialLandlordId?: string }) => {
    const [type, setType] = useState<'Invoice' | 'Quote'>('Invoice');
    const [landlordId, setLandlordId] = useState(initialLandlordId || '');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ type, landlordId, amount, description });
        onClose();
    }

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Send ${type} to Landlord`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 mb-2">
                    <button type="button" onClick={() => setType('Invoice')} className={`flex-1 py-2 text-sm font-medium rounded-md border ${type === 'Invoice' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600'}`}>Send Invoice</button>
                    <button type="button" onClick={() => setType('Quote')} className={`flex-1 py-2 text-sm font-medium rounded-md border ${type === 'Quote' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600'}`}>Send Quote</button>
                </div>
                <Select label="Landlord" name="landlord" value={landlordId} onChange={e => setLandlordId(e.target.value)} options={landlords.map(l => ({ value: l.id, label: l.name }))} placeholder="Select recipient" />
                <Input label="Amount (£)" name="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                <Textarea label="Description / Line Items" name="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                <div className="flex justify-end pt-2">
                    <Button type="submit" leftIcon={<PaperAirplaneIcon className="w-4 h-4"/>}>Send Request</Button>
                </div>
            </form>
        </Modal>
    )
}

const FinancialsPage: React.FC<FinancialsPageProps> = ({
  rentPayments, addRentPayment, updateRentPayment, deleteRentPayment,
  expenses, addExpense, updateExpense, deleteExpense,
  properties, tenants, landlords,
  recurringPayments, addRecurringPayment, paymentLinks, addPaymentLink, addApprovalRequest
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expenses' | 'forecasting' | 'clients'>('dashboard');
  const [incomeSubTab, setIncomeSubTab] = useState<'feed' | 'links' | 'recurring'>('feed');
  const [activeClient, setActiveClient] = useState<string>('all');
  const [statementDateStart, setStatementDateStart] = useState<string>('');
  const [statementDateEnd, setStatementDateEnd] = useState<string>('');

  // Modals State
  const [isRentFormOpen, setIsRentFormOpen] = useState(false);
  const [editingRentPayment, setEditingRentPayment] = useState<RentPayment | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isArrearsModalOpen, setIsArrearsModalOpen] = useState(false);
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isFinancialRequestModalOpen, setIsFinancialRequestModalOpen] = useState(false);

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

  const handleSendFinancialRequest = (data: any) => {
      addApprovalRequest({
          id: `appr_fin_${Date.now()}`,
          landlordId: data.landlordId,
          type: data.type === 'Invoice' ? 'Invoice' : 'Maintenance Quote', // Simplified type mapping
          title: `${data.type} Request`,
          description: data.description,
          amount: parseFloat(data.amount),
          status: 'Sent',
          sentDate: new Date().toISOString(),
      });
      alert(`${data.type} sent successfully.`);
  }

  // --- Calculations & Chart Data ---
  const totalRevenue = rentPayments.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  // Yield Calc
  const totalPortfolioValue = properties.reduce((sum, p) => sum + (p.value || 0), 0);
  const monthlyRentRoll = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  const annualRentRunRate = monthlyRentRoll * 12;
  const portfolioYield = totalPortfolioValue > 0 ? (annualRentRunRate / totalPortfolioValue) * 100 : 0;

  // Arrears Logic (Mock)
  const tenantsInArrears = tenants.filter((t, i) => i % 3 === 0);

  // Data for Charts
  const cashFlowData = useMemo(() => {
      const data: any[] = [];
      const months = 6;
      for (let i = months - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthName = d.toLocaleString('default', { month: 'short' });
          // Simulate somewhat realistic data based on total revenue average
          const simulatedIncome = (totalRevenue / (months || 1)) * (0.8 + Math.random() * 0.4);
          const simulatedExpense = (totalExpenses / (months || 1)) * (0.8 + Math.random() * 0.4);
          data.push({
              name: monthName,
              Income: Math.floor(simulatedIncome),
              Expenses: Math.floor(simulatedExpense),
          });
      }
      return data;
  }, [totalRevenue, totalExpenses]);

  const expenseBreakdownData = useMemo(() => {
      const categoryTotals: Record<string, number> = {};
      expenses.forEach(e => {
          categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });
      // If empty, add mock data for visualization
      if (Object.keys(categoryTotals).length === 0) {
          return [
              { name: 'Maintenance', value: 4500 },
              { name: 'Mgmt Fees', value: 2100 },
              { name: 'Utilities', value: 800 },
              { name: 'Insurance', value: 1200 }
          ];
      }
      return Object.keys(categoryTotals).map(cat => ({ name: cat, value: categoryTotals[cat] }));
  }, [expenses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Agency Fees Calc
  const agencyRevenue = properties.reduce((sum, prop) => {
      const propRent = rentPayments.filter(r => r.propertyId === prop.id).reduce((s, r) => s + r.amount, 0);
      if (prop.managementFeeType === 'Fixed') {
          return sum + (prop.managementFeeValue || 0); 
      } else {
          return sum + (propRent * ((prop.managementFeeValue || 10) / 100));
      }
  }, 0);

  // Client Accounting View Logic
  const clientLedger = useMemo(() => {
      const targetLandlordId = activeClient === 'all' ? null : activeClient;
      
      // Filter properties belonging to this landlord
      const clientProperties = properties.filter(p => 
          targetLandlordId ? p.ownerName === landlords.find(l => l.id === targetLandlordId)?.name : true
      );
      const clientPropIds = clientProperties.map(p => p.id);

      const cRevenueItems = rentPayments.filter(r => clientPropIds.includes(r.propertyId)).map(r => ({ ...r, type: 'Credit' as const }));
      const cExpenseItems = expenses.filter(e => clientPropIds.includes(e.propertyId)).map(e => ({ ...e, type: 'Debit' as const }));
      
      const combinedLedger = [...cRevenueItems, ...cExpenseItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate Running Balance
      let balance = 0;
      const ledgerWithBalance = combinedLedger.map(item => {
          if (item.type === 'Credit') balance += item.amount;
          else balance -= item.amount;
          
          // Calculate Fees if it's a rent payment
          let fee = 0;
          if (item.type === 'Credit') {
              const prop = properties.find(p => p.id === item.propertyId);
              if (prop) {
                  if (prop.managementFeeType === 'Fixed') fee = 0; // Fixed fees usually charged separately once a month, simplified here
                  else fee = item.amount * ((prop.managementFeeValue || 10) / 100);
              }
              balance -= fee; // Deduct fee from landlord balance
          }

          return { ...item, balance, fee };
      });

      const totalRevenue = cRevenueItems.reduce((sum, r) => sum + r.amount, 0);
      const totalExpenses = cExpenseItems.reduce((sum, e) => sum + e.amount, 0);
      const totalFees = ledgerWithBalance.reduce((sum, i) => sum + (i.fee || 0), 0);

      return {
          items: ledgerWithBalance,
          summary: {
              revenue: totalRevenue,
              expenses: totalExpenses,
              fees: totalFees,
              net: totalRevenue - totalExpenses - totalFees
          }
      }
  }, [activeClient, rentPayments, expenses, properties, landlords]);

  const handleExportStatement = (format: 'pdf' | 'csv') => {
      const landlordName = activeClient === 'all' ? 'All Clients' : landlords.find(l => l.id === activeClient)?.name;
      alert(`Exporting ${format.toUpperCase()} statement for ${landlordName}... (Simulated)`);
  };


  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Financials & Banking" 
        subtitle="Complete financial oversight, banking feeds, and client accounting."
        actions={
            <div className="flex gap-2">
                <Button onClick={() => setIsReconcileModalOpen(true)} variant="outline" leftIcon={<DocumentTextIcon className="w-4 h-4"/>} className="hidden sm:flex">Reconcile</Button>
                <Button onClick={() => setIsArrearsModalOpen(true)} variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100" leftIcon={<ExclamationTriangleIcon className="w-4 h-4"/>}>Arrears</Button>
                <Button onClick={handleAddExpense} variant="secondary" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Log Expense</Button>
                <Button onClick={handleAddRentPayment} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Log Rent</Button>
            </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-zinc-200 bg-white px-4 rounded-t-lg">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {['dashboard', 'income', 'expenses', 'forecasting', 'clients'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`${
                        activeTab === tab
                            ? 'border-zinc-900 text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                    {tab === 'clients' ? 'Landlord Accounting' : tab}
                </button>
            ))}
        </nav>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
          <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm font-medium text-zinc-500">Net Cash Flow</p>
                              <h3 className="text-2xl font-bold text-zinc-900 mt-1">£{netIncome.toLocaleString()}</h3>
                          </div>
                          <div className="p-2 bg-green-100 text-green-600 rounded-lg"><BanknotesIcon className="w-5 h-5"/></div>
                      </div>
                      <div className="mt-4 flex items-center text-xs">
                          <span className="text-green-600 font-medium flex items-center"><ArrowUpRightIcon className="w-3 h-3 mr-1"/> +12%</span>
                          <span className="text-zinc-400 ml-2">vs last period</span>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm font-medium text-zinc-500">Total Expenses</p>
                              <h3 className="text-2xl font-bold text-zinc-900 mt-1">£{totalExpenses.toLocaleString()}</h3>
                          </div>
                          <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ChartPieIcon className="w-5 h-5"/></div>
                      </div>
                      <div className="mt-4 flex items-center text-xs">
                          <span className="text-red-600 font-medium flex items-center"><ArrowUpRightIcon className="w-3 h-3 mr-1"/> +4%</span>
                          <span className="text-zinc-400 ml-2">vs last period</span>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm font-medium text-zinc-500">Portfolio Yield</p>
                              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{portfolioYield.toFixed(2)}%</h3>
                          </div>
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><PresentationChartLineIcon className="w-5 h-5"/></div>
                      </div>
                      <div className="mt-4 flex items-center text-xs">
                          <span className="text-zinc-400">Target: 6.5%</span>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm font-medium text-zinc-500">Agency Revenue</p>
                              <h3 className="text-2xl font-bold text-zinc-900 mt-1">£{agencyRevenue.toFixed(0)}</h3>
                          </div>
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><BuildingOffice2Icon className="w-5 h-5"/></div>
                      </div>
                      <div className="mt-4 flex items-center text-xs">
                          <span className="text-zinc-400">Fees & Commissions</span>
                      </div>
                  </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Chart */}
                  <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm min-h-[350px]">
                      <h3 className="font-bold text-zinc-900 mb-4">Cash Flow Trend</h3>
                      <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={cashFlowData}>
                              <defs>
                                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5"/>
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}/>
                              <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                              <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>

                  {/* Side Chart / Widget */}
                  <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm min-h-[350px] flex flex-col">
                      <h3 className="font-bold text-zinc-900 mb-4">Expense Breakdown</h3>
                      <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={expenseBreakdownData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {expenseBreakdownData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend verticalAlign="bottom" height={36}/>
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>

              {/* Action Buttons Mobile */}
              <div className="sm:hidden">
                  <Button onClick={() => setIsReconcileModalOpen(true)} variant="outline" leftIcon={<DocumentTextIcon className="w-4 h-4"/>} className="w-full">Reconcile Transactions</Button>
              </div>
          </div>
      )}

      {/* INCOME TAB (Feed, Links, Recurring) */}
      {activeTab === 'income' && (
          <div>
              {/* Sub Nav */}
              <div className="flex space-x-4 mb-6 border-b border-zinc-200 pb-2">
                  <button onClick={() => setIncomeSubTab('feed')} className={`text-sm font-medium pb-2 ${incomeSubTab === 'feed' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500'}`}>Bank Feed</button>
                  <button onClick={() => setIncomeSubTab('links')} className={`text-sm font-medium pb-2 ${incomeSubTab === 'links' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500'}`}>Payment Links</button>
                  <button onClick={() => setIncomeSubTab('recurring')} className={`text-sm font-medium pb-2 ${incomeSubTab === 'recurring' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500'}`}>Recurring Payments</button>
              </div>

              {incomeSubTab === 'feed' && (
                  <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                      <table className="min-w-full divide-y divide-zinc-100">
                          <thead className="bg-zinc-50">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Property</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tenant</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Amount</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-zinc-100">
                              {rentPayments.map(rp => {
                                  const property = properties.find(p => p.id === rp.propertyId);
                                  const tenant = tenants.find(t => t.id === rp.tenantId);
                                  return (
                                      <tr key={rp.id} className="hover:bg-zinc-50">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">{new Date(rp.date).toLocaleDateString()}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{property?.address}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{tenant?.name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">£{rp.amount.toLocaleString()}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                              <button onClick={() => handleEditRentPayment(rp)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                              <button onClick={() => handleDeleteRentPayment(rp.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                          </td>
                                      </tr>
                                  )
                              })}
                              {rentPayments.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-zinc-400 text-sm">No rent payments recorded.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              )}

              {incomeSubTab === 'links' && (
                  <div className="space-y-4">
                      <div className="flex justify-end">
                          <Button size="sm" onClick={() => setIsPaymentLinkModalOpen(true)} leftIcon={<LinkIcon className="w-4 h-4"/>}>Create Link</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {paymentLinks.map(link => (
                              <div key={link.id} className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-bold text-zinc-900">{link.description}</h4>
                                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${link.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{link.status}</span>
                                  </div>
                                  <p className="text-sm text-zinc-500 mb-2">For: {tenants.find(t => t.id === link.tenantId)?.name}</p>
                                  <p className="text-xl font-bold text-zinc-900 mb-3">£{link.amount}</p>
                                  <div className="flex gap-2">
                                      <Button size="sm" variant="outline" className="flex-1 text-xs">Copy Link</Button>
                                      <Button size="sm" variant="ghost" className="text-red-500">Cancel</Button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {incomeSubTab === 'recurring' && (
                  <div className="space-y-4">
                      <div className="flex justify-end">
                          <Button size="sm" onClick={() => setIsRecurringModalOpen(true)} leftIcon={<CalendarDaysIcon className="w-4 h-4"/>}>Add Recurring</Button>
                      </div>
                      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                          <table className="min-w-full divide-y divide-zinc-100">
                              <thead className="bg-zinc-50">
                                  <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Vendor</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Type</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Frequency</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Next Due</th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Amount</th>
                                      <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100">
                                  {recurringPayments.map(rp => (
                                      <tr key={rp.id} className="hover:bg-zinc-50">
                                          <td className="px-6 py-4 text-sm font-medium text-zinc-900">{rp.vendor}</td>
                                          <td className="px-6 py-4 text-sm text-zinc-500">{rp.type}</td>
                                          <td className="px-6 py-4 text-sm text-zinc-500">{rp.frequency}</td>
                                          <td className="px-6 py-4 text-sm text-zinc-500">{new Date(rp.nextDueDate).toLocaleDateString()}</td>
                                          <td className="px-6 py-4 text-sm text-right font-medium">£{rp.amount.toFixed(2)}</td>
                                          <td className="px-6 py-4 text-center">
                                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                  rp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                              }`}>{rp.status}</span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-zinc-100">
                  <thead className="bg-zinc-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Description</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-zinc-100">
                      {expenses.map(exp => {
                          const property = properties.find(p => p.id === exp.propertyId);
                          return (
                              <tr key={exp.id} className="hover:bg-zinc-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">{new Date(exp.date).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{property?.address}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{exp.category}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{exp.description}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">£{exp.amount.toLocaleString()}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button onClick={() => handleEditExpense(exp)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                      <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                  </td>
                              </tr>
                          )
                      })}
                      {expenses.length === 0 && <tr><td colSpan={6} className="px-6 py-4 text-center text-zinc-400 text-sm">No expenses recorded.</td></tr>}
                  </tbody>
              </table>
          </div>
      )}

      {/* FORECASTING TAB */}
      {activeTab === 'forecasting' && (
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="font-bold text-zinc-900 mb-4">Rent Review Opportunities</h3>
                  <table className="min-w-full divide-y divide-zinc-100">
                      <thead>
                          <tr>
                              <th className="text-left text-xs font-medium text-zinc-500 uppercase pb-2">Property</th>
                              <th className="text-right text-xs font-medium text-zinc-500 uppercase pb-2">Current Rent</th>
                              <th className="text-right text-xs font-medium text-zinc-500 uppercase pb-2">Market Est.</th>
                              <th className="text-right text-xs font-medium text-zinc-500 uppercase pb-2">Potential Uplift</th>
                              <th className="text-right text-xs font-medium text-zinc-500 uppercase pb-2">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                          {properties.slice(0, 3).map(p => {
                              const currentRent = tenants.filter(t => t.propertyId === p.id).reduce((s, t) => s + (t.rentAmount || 0), 0);
                              const marketRent = currentRent * 1.12; // Mock logic
                              return (
                                  <tr key={p.id}>
                                      <td className="py-3 text-sm font-medium text-zinc-900">{p.address}</td>
                                      <td className="py-3 text-sm text-right">£{currentRent}</td>
                                      <td className="py-3 text-sm text-right text-zinc-500">£{marketRent.toFixed(0)}</td>
                                      <td className="py-3 text-sm text-right text-green-600">+£{(marketRent - currentRent).toFixed(0)}</td>
                                      <td className="py-3 text-right">
                                          <Button size="sm" variant="outline" className="text-xs py-1 h-7">Start Review</Button>
                                      </td>
                                  </tr>
                              )
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* CLIENTS (LANDLORD ACCOUNTING) TAB - Advanced */}
      {activeTab === 'clients' && (
          <div className="space-y-6">
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-sm font-medium text-zinc-700 whitespace-nowrap">Client Ledger:</span>
                          <Select 
                              name="client" 
                              value={activeClient} 
                              onChange={(e) => setActiveClient(e.target.value)}
                              options={[{value: 'all', label: 'All Clients (Agency View)'}, ...landlords.map(l => ({ value: l.id, label: l.name }))]}
                              containerClassName="mb-0 w-full sm:w-64"
                          />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-sm font-medium text-zinc-700">Period:</span>
                          <Input type="date" name="start" value={statementDateStart} onChange={e => setStatementDateStart(e.target.value)} containerClassName="mb-0" />
                          <span className="text-zinc-400">-</span>
                          <Input type="date" name="end" value={statementDateEnd} onChange={e => setStatementDateEnd(e.target.value)} containerClassName="mb-0" />
                      </div>
                  </div>
                  
                  <div className="flex gap-2 w-full lg:w-auto justify-end">
                      {activeClient !== 'all' && (
                          <>
                            <Button size="sm" variant="outline" leftIcon={<ArrowDownTrayIcon className="w-4 h-4"/>} onClick={() => handleExportStatement('pdf')}>PDF</Button>
                            <Button size="sm" variant="outline" leftIcon={<ArrowDownTrayIcon className="w-4 h-4"/>} onClick={() => handleExportStatement('csv')}>CSV</Button>
                            <Button size="sm" onClick={() => setIsFinancialRequestModalOpen(true)} leftIcon={<ReceiptPercentIcon className="w-4 h-4"/>}>Send Invoice</Button>
                          </>
                      )}
                  </div>
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                      <p className="text-xs text-zinc-500 uppercase font-bold">Gross Income</p>
                      <p className="text-xl font-bold text-green-600">£{clientLedger.summary.revenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                      <p className="text-xs text-zinc-500 uppercase font-bold">Total Expenses</p>
                      <p className="text-xl font-bold text-red-600">£{clientLedger.summary.expenses.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                      <p className="text-xs text-zinc-500 uppercase font-bold">Agency Fees (Retained)</p>
                      <p className="text-xl font-bold text-indigo-600">£{clientLedger.summary.fees.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                      <p className="text-xs text-green-800 uppercase font-bold">Net Payable to Landlord</p>
                      <p className="text-xl font-bold text-green-700">£{clientLedger.summary.net.toLocaleString()}</p>
                  </div>
              </div>

              {/* Detailed Ledger Table */}
              {activeClient !== 'all' ? (
                  <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                          <h3 className="font-bold text-sm text-zinc-900">Statement of Account: {landlords.find(l => l.id === activeClient)?.name}</h3>
                          <span className="text-xs text-zinc-500">Generated: {new Date().toLocaleDateString()}</span>
                      </div>
                      <table className="min-w-full divide-y divide-zinc-100">
                          <thead>
                              <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Type</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Description</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Property</th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Amount</th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Fees</th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Balance</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                              {clientLedger.items.map((item: any, idx: number) => (
                                  <tr key={`${item.id}-${idx}`} className="hover:bg-zinc-50">
                                      <td className="px-4 py-3 text-sm text-zinc-600 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                                      <td className="px-4 py-3 text-sm">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              {item.type === 'Credit' ? 'Rent' : 'Expense'}
                                          </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-zinc-900">{item.description || (item.type === 'Credit' ? 'Rent Payment' : item.category)}</td>
                                      <td className="px-4 py-3 text-sm text-zinc-500">{properties.find(p => p.id === item.propertyId)?.address}</td>
                                      <td className={`px-4 py-3 text-sm text-right font-medium ${item.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                                          {item.type === 'Credit' ? '+' : '-'}£{item.amount.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-right text-zinc-400">
                                          {item.fee > 0 ? `-£${item.fee.toFixed(2)}` : '-'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-right font-bold text-zinc-900">
                                          £{item.balance.toLocaleString()}
                                      </td>
                                  </tr>
                              ))}
                              {clientLedger.items.length === 0 && (
                                  <tr><td colSpan={7} className="p-8 text-center text-sm text-zinc-400">No transactions found for this period.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              ) : (
                  <div className="text-center py-12 bg-zinc-50 border border-dashed border-zinc-200 rounded-lg">
                      <UserGroupIcon className="w-12 h-12 mx-auto text-zinc-300 mb-3"/>
                      <p className="text-zinc-500 font-medium">Select a client to view their detailed ledger and statements.</p>
                  </div>
              )}
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
      {isArrearsModalOpen && (
          <Modal isOpen={isArrearsModalOpen} onClose={() => setIsArrearsModalOpen(false)} title="Arrears Management" size="lg">
              <div className="space-y-4">
                  <table className="min-w-full divide-y divide-zinc-100">
                      <thead><tr><th className="text-left text-xs uppercase text-zinc-500">Tenant</th><th className="text-right text-xs uppercase text-zinc-500">Arrears</th><th className="text-right text-xs uppercase text-zinc-500">Action</th></tr></thead>
                      <tbody>
                          {tenantsInArrears.map(t => (
                              <tr key={t.id} className="border-b border-zinc-50">
                                  <td className="py-3 font-medium text-sm">{t.name}</td>
                                  <td className="py-3 text-right text-red-600 font-bold text-sm">£{t.rentAmount}</td>
                                  <td className="py-3 text-right"><Button size="sm" variant="outline">Chase</Button></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  <div className="flex justify-end"><Button onClick={() => setIsArrearsModalOpen(false)}>Close</Button></div>
              </div>
          </Modal>
      )}
      {isPaymentLinkModalOpen && (
          <Modal isOpen={isPaymentLinkModalOpen} onClose={() => setIsPaymentLinkModalOpen(false)} title="Create Payment Link">
              <form onSubmit={(e) => { e.preventDefault(); addPaymentLink({ id: `pl_${Date.now()}`, tenantId: 'ten1', amount: 100, description: 'Misc Fee', status: 'Open', createdAt: new Date().toISOString(), url: '#' }); setIsPaymentLinkModalOpen(false); }} className="space-y-4">
                  <Select name="tenant" label="Tenant" options={tenants.map(t => ({ value: t.id, label: t.name }))} />
                  <Input name="amount" label="Amount" type="number" placeholder="0.00" />
                  <Input name="desc" label="Description" placeholder="e.g. Late Fee" />
                  <div className="flex justify-end"><Button type="submit">Create Link</Button></div>
              </form>
          </Modal>
      )}
      {isRecurringModalOpen && (
          <Modal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} title="Add Recurring Payment">
              <form onSubmit={(e) => { e.preventDefault(); addRecurringPayment({ id: `rec_${Date.now()}`, type: 'Direct Debit', vendor: 'Test Vendor', reference: 'REF1', amount: 50, frequency: 'Monthly', nextDueDate: '2023-12-01', status: 'Active' }); setIsRecurringModalOpen(false); }} className="space-y-4">
                  <Input name="vendor" label="Vendor" placeholder="e.g. British Gas" />
                  <Input name="amount" label="Amount" type="number" />
                  <Select name="freq" label="Frequency" options={[{value:'Monthly', label:'Monthly'}]} />
                  <div className="flex justify-end"><Button type="submit">Save</Button></div>
              </form>
          </Modal>
      )}
      
      <ReconcileModal isOpen={isReconcileModalOpen} onClose={() => setIsReconcileModalOpen(false)} tenants={tenants} />
      
      <SendFinancialRequestModal 
        isOpen={isFinancialRequestModalOpen} 
        onClose={() => setIsFinancialRequestModalOpen(false)} 
        onSubmit={handleSendFinancialRequest} 
        landlords={landlords}
        initialLandlordId={activeClient !== 'all' ? activeClient : undefined}
      />
    </div>
  );
};

export default FinancialsPage;
