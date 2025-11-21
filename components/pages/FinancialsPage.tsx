
import React, { useState, useMemo } from 'react';
import { RentPayment, Expense, Property, Tenant, Landlord } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { 
    PlusCircleIcon, PencilIcon, TrashIcon, PresentationChartLineIcon, 
    BuildingLibraryIcon, CreditCardIcon, DocumentTextIcon, ChartPieIcon,
    ArrowUpRightIcon, ArrowDownLeftIcon, CheckCircleIcon, ClockIcon,
    ShieldCheckIcon, CalculatorIcon, ArrowPathIcon,
    CurrencyDollarIconSolid, BanknotesIcon, ExclamationTriangleIcon,
    LinkIcon, CalendarDaysIcon, UserGroupIcon, XMarkIcon
} from '../icons/HeroIcons';
import RentPaymentForm from '../forms/RentPaymentForm';
import ExpenseForm from '../forms/ExpenseForm';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Select from '../common/Select';

// --- Mock Data for Open Banking Feed ---
const MOCK_BANK_TRANSACTIONS = [
    { id: 'tx_1', date: new Date().toISOString(), description: 'FPS CREDIT FROM A. WONDERLAND', amount: 1200, type: 'credit', status: 'matched', matchId: 'ten1' },
    { id: 'tx_2', date: new Date(Date.now() - 86400000).toISOString(), description: 'DIRECT DEBIT BGAS SERVICES', amount: -45.50, type: 'debit', status: 'auto-categorized', category: 'Utilities' },
    { id: 'tx_3', date: new Date(Date.now() - 172800000).toISOString(), description: 'FPS CREDIT FROM B. BUILDER', amount: 950, type: 'credit', status: 'matched', matchId: 'ten2' },
    { id: 'tx_4', date: new Date(Date.now() - 259200000).toISOString(), description: 'PLUMBPERFECT LTD INV-992', amount: -120.00, type: 'debit', status: 'pending', matchId: 'exp1' },
    { id: 'tx_5', date: new Date(Date.now() - 345600000).toISOString(), description: 'UNKNOWN CREDIT REF 99281', amount: 500, type: 'credit', status: 'unreconciled' },
];

const INITIAL_PORTFOLIO_HEALTH_DATA = [
    { id: 'ph_1', name: '123 Main St', yield: 5.2, status: 'Good', reviewDue: '2024-12-01', projectedRent: 1350, currentRent: 1200 },
    { id: 'ph_2', name: 'Apt 4B', yield: 3.8, status: 'Review', reviewDue: 'Overdue', projectedRent: 1100, currentRent: 950 },
    { id: 'ph_3', name: 'Unit 7', yield: 6.5, status: 'Excellent', reviewDue: '2025-03-15', projectedRent: 5500, currentRent: 5000 },
];

const STRIPE_DATA = {
    available: 2450.00,
    pending: 850.00,
    inTransit: 1200.00,
    nextPayout: new Date(Date.now() + 86400000).toISOString(),
};

const INITIAL_PAYMENT_LINKS = [
    { id: 'pl_1', description: 'Security Deposit - Unit 4B', amount: 1200, created: new Date(Date.now() - 100000000).toISOString(), status: 'Paid', tenant: 'New Tenant A' },
    { id: 'pl_2', description: 'Late Fee - Nov Rent', amount: 50, created: new Date(Date.now() - 20000000).toISOString(), status: 'Open', tenant: 'Bob Builder' },
    { id: 'pl_3', description: 'Replacement Keys', amount: 25, created: new Date().toISOString(), status: 'Open', tenant: 'Alice Wonderland' },
];

const INITIAL_RECURRING_EXPENSES = [
    { id: 'rec_1', vendor: 'British Gas', description: 'Utilities - 123 Main St', amount: 145.00, frequency: 'Monthly', nextDue: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'Active', lastStatus: 'Paid' },
    { id: 'rec_2', vendor: 'CleanCo Ltd', description: 'Communal Cleaning - Block A', amount: 80.00, frequency: 'Weekly', nextDue: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'Active', lastStatus: 'Paid' },
    { id: 'rec_3', vendor: 'Halifax', description: 'Mortgage - Apt 4B', amount: 650.00, frequency: 'Monthly', nextDue: new Date(Date.now() + 86400000 * 15).toISOString(), status: 'Review Needed', lastStatus: 'Price Change' },
];

// --- Sub-Components ---

const StatWidget = ({ title, value, trend, icon, color }: any) => (
    <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-sm font-medium">{title}</span>
            <div className={`p-2 rounded-md ${color} bg-opacity-10`}>
                {React.cloneElement(icon, { className: `w-5 h-5 ${color.replace('bg-', 'text-')}` })}
            </div>
        </div>
        <div>
            <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
            <span className={`text-xs font-medium ${trend.includes('+') ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                {trend.includes('+') ? <ArrowUpRightIcon className="w-3 h-3 mr-1"/> : <ArrowDownLeftIcon className="w-3 h-3 mr-1"/>}
                {trend} vs last month
            </span>
        </div>
    </div>
);

const StripeTreasuryCard = () => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-lg shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCardIcon className="w-32 h-32" />
        </div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        Stripe Treasury
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">Live</span>
                    </h3>
                    <p className="text-3xl font-bold mt-2">£{STRIPE_DATA.available.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">Available to pay out</p>
                </div>
                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 border-none font-semibold shadow-none">
                    Instant Payout
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                <div>
                    <p className="text-xs text-slate-400">Pending Clearing</p>
                    <p className="font-semibold">£{STRIPE_DATA.pending.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">In Transit to Bank</p>
                    <p className="font-semibold">£{STRIPE_DATA.inTransit.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Est. arrival: Tomorrow</p>
                </div>
            </div>
        </div>
    </div>
);

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
}

const FinancialsPage: React.FC<FinancialsPageProps> = ({
  rentPayments, addRentPayment, updateRentPayment, deleteRentPayment,
  expenses, addExpense, updateExpense, deleteExpense,
  properties, tenants, landlords
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'income' | 'expenses' | 'reporting' | 'forecasting'>('dashboard');
  const [activeIncomeView, setActiveIncomeView] = useState<'bank' | 'links' | 'recurring'>('bank');
  
  // Local State for Lists
  const [paymentLinks, setPaymentLinks] = useState(INITIAL_PAYMENT_LINKS);
  const [recurringExpenses, setRecurringExpenses] = useState(INITIAL_RECURRING_EXPENSES);
  const [portfolioHealthData, setPortfolioHealthData] = useState(INITIAL_PORTFOLIO_HEALTH_DATA);

  // Client Accounting State
  const [selectedLandlordId, setSelectedLandlordId] = useState<string>('all');

  // Modal States
  const [isRentFormOpen, setIsRentFormOpen] = useState(false);
  const [editingRentPayment, setEditingRentPayment] = useState<RentPayment | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [isArrearsModalOpen, setIsArrearsModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [isRecurringPaymentModalOpen, setIsRecurringPaymentModalOpen] = useState(false);
  const [isRentReviewModalOpen, setIsRentReviewModalOpen] = useState(false);
  const [rentReviewProperty, setRentReviewProperty] = useState<any>(null);

  // --- AGGREGATIONS & HELPERS ---

  // 1. Calculate Agency Revenue (Management Fees)
  const calculateManagementFee = (propertyId: string, rentAmount: number) => {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return 0;
      if (property.managementFeeType === 'Fixed') {
          return property.managementFeeValue || 0;
      } else {
          // Percentage
          const percent = property.managementFeeValue || 10; // Default 10%
          return (rentAmount * percent) / 100;
      }
  };

  const totalRentCollected = useMemo(() => rentPayments.reduce((sum, p) => sum + p.amount, 0), [rentPayments]);
  
  const agencyRevenue = useMemo(() => {
      let revenue = 0;
      rentPayments.forEach(rp => {
          revenue += calculateManagementFee(rp.propertyId, rp.amount);
      });
      if (rentPayments.length === 0) {
          tenants.forEach(t => {
              if (t.rentAmount) {
                  revenue += calculateManagementFee(t.propertyId, t.rentAmount);
              }
          });
      }
      return revenue;
  }, [rentPayments, tenants, properties]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const netPosition = totalRentCollected - totalExpenses; 
  const occupancyRate = properties.length > 0 ? ((new Set(tenants.map(t => t.propertyId)).size) / properties.length) * 100 : 0;

  // Mock Chart Data
  const cashFlowData = [
      { name: 'Jan', income: 4000, expenses: 2400 },
      { name: 'Feb', income: 4200, expenses: 1398 },
      { name: 'Mar', income: 4100, expenses: 9800 }, // Big repair
      { name: 'Apr', income: 4300, expenses: 3908 },
      { name: 'May', income: 4500, expenses: 4800 },
      { name: 'Jun', income: 4600, expenses: 3800 },
      { name: 'Jul', income: 4600, expenses: 4300 },
  ];

  // --- CLIENT ACCOUNTING LOGIC ---
  const isAllClients = selectedLandlordId === 'all';
  const selectedLandlord = landlords.find(l => l.id === selectedLandlordId);
  
  const selectedLandlordProperties = useMemo(() => {
      if (isAllClients) return properties;
      if (!selectedLandlord) return [];
      return properties.filter(p => p.ownerName === selectedLandlord.name);
  }, [selectedLandlord, properties, isAllClients]);

  const clientFinancials = useMemo(() => {
      // If no specific landlord selected and not 'all', show nothing
      if (!isAllClients && !selectedLandlord) return { rent: 0, expenses: 0, fees: 0, net: 0, ledger: [] };
      
      const propIds = selectedLandlordProperties.map(p => p.id);
      const clientRent = rentPayments.filter(r => propIds.includes(r.propertyId));
      const clientExpenses = expenses.filter(e => propIds.includes(e.propertyId));

      const totalRent = clientRent.reduce((sum, r) => sum + r.amount, 0);
      const totalExp = clientExpenses.reduce((sum, e) => sum + e.amount, 0);
      let totalFees = 0;
      
      clientRent.forEach(r => {
          totalFees += calculateManagementFee(r.propertyId, r.amount);
      });

      // Combine for ledger
      const ledger = [
          ...clientRent.map(r => ({ 
              id: r.id, date: r.date, desc: 'Rent Received', amount: r.amount, type: 'credit', 
              prop: properties.find(p=>p.id===r.propertyId)?.address 
          })),
          ...clientExpenses.map(e => ({ 
              id: e.id, date: e.date, desc: e.description, amount: -e.amount, type: 'debit',
              prop: properties.find(p=>p.id===e.propertyId)?.address 
          })),
          { id: 'fee_deduction', date: new Date().toISOString(), desc: 'Management Fees (Est)', amount: -totalFees, type: 'fee', prop: 'Portfolio' }
      ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
          rent: totalRent,
          expenses: totalExp,
          fees: totalFees,
          net: totalRent - totalExp - totalFees,
          ledger
      };
  }, [selectedLandlordProperties, rentPayments, expenses, isAllClients, selectedLandlord]);


  // Form Handlers
  const handleRentSubmit = (payment: RentPayment) => {
    if (editingRentPayment) updateRentPayment(payment); else addRentPayment(payment);
    setIsRentFormOpen(false); setEditingRentPayment(null);
  };
  const handleExpenseSubmit = (expense: Expense) => {
    if (editingExpense) updateExpense(expense); else addExpense(expense);
    setIsExpenseFormOpen(false); setEditingExpense(null);
  };

  const handleCreatePaymentLink = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const newLink = {
          id: `pl_${Date.now()}`,
          description: formData.get('description') as string,
          amount: parseFloat(formData.get('amount') as string),
          created: new Date().toISOString(),
          status: 'Open',
          tenant: formData.get('tenant') as string
      };
      setPaymentLinks(prev => [newLink, ...prev]);
      setIsPaymentLinkModalOpen(false);
  };

  const handleCreateRecurringPayment = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const newRec = {
          id: `rec_${Date.now()}`,
          vendor: formData.get('vendor') as string,
          description: formData.get('description') as string,
          amount: parseFloat(formData.get('amount') as string),
          frequency: formData.get('frequency') as string,
          nextDue: formData.get('nextDue') as string,
          status: 'Active',
          lastStatus: 'New'
      };
      setRecurringExpenses(prev => [...prev, newRec]);
      setIsRecurringPaymentModalOpen(false);
  };

  const handleRentReviewSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Mock update of status
      if(rentReviewProperty) {
          setPortfolioHealthData(prev => prev.map(p => p.id === rentReviewProperty.id ? {...p, status: 'In Review'} : p));
      }
      setIsRentReviewModalOpen(false);
      setRentReviewProperty(null);
  }

  const landlordOptions = [
      { value: 'all', label: 'All Clients (Portfolio View)' },
      ...landlords.map(l => ({ value: l.id, label: l.name }))
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Financial Command Center"
        subtitle="Real-time portfolio performance, automation, and forecasting."
        actions={
            <div className="flex gap-2">
                <Button variant="outline" leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>Sync Banks</Button>
                <Button onClick={() => {setEditingRentPayment(null); setIsRentFormOpen(true)}} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Log Payment</Button>
            </div>
        }
      />

      {/* Main Navigation Tabs */}
      <div className="border-b border-zinc-200 bg-white px-2 rounded-t-lg">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Live Dashboard', icon: PresentationChartLineIcon },
            { id: 'clients', label: 'Clients', icon: UserGroupIcon },
            { id: 'income', label: 'Income & Banking', icon: BuildingLibraryIcon },
            { id: 'expenses', label: 'Expenses & Controls', icon: CreditCardIcon },
            { id: 'reporting', label: 'Reporting & Tax', icon: DocumentTextIcon },
            { id: 'forecasting', label: 'Forecasting', icon: ChartPieIcon },
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

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatWidget title="Net Cash Flow (Mtd)" value={`£${netPosition.toLocaleString()}`} trend="+12.5%" icon={<BanknotesIcon/>} color="text-green-600 bg-green-100" />
                    <StatWidget title="Agency Revenue" value={`£${agencyRevenue.toLocaleString()}`} trend="+5.2%" icon={<CurrencyDollarIconSolid/>} color="text-indigo-600 bg-indigo-100" />
                    <StatWidget title="Total Arrears" value="£850.00" trend="-5.0%" icon={<ExclamationTriangleIcon/>} color="text-red-600 bg-red-100" />
                    <StatWidget title="Occupancy Rate" value={`${occupancyRate.toFixed(1)}%`} trend="0.0%" icon={<BuildingLibraryIcon/>} color="text-zinc-600 bg-zinc-100" />
                </div>
                
                {/* Stripe Treasury Widget */}
                <div className="lg:col-span-1">
                    <StripeTreasuryCard />
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">Cash Flow Analysis</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                                <CartesianGrid vertical={false} stroke="#f4f4f5" />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                    itemStyle={{fontSize: '12px'}}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Arrears Heatmap / Breakdown */}
                <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">Arrears Watchlist</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Unit 4B (Bob)', amount: 450, days: 12, risk: 'Medium' },
                            { name: '123 Main (Alice)', amount: 0, days: 0, risk: 'Low' },
                            { name: 'Unit 7 (Biz)', amount: 400, days: 45, risk: 'High' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-md border border-zinc-100">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                                    <p className="text-xs text-zinc-500">{item.days > 0 ? `${item.days} days overdue` : 'Up to date'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-zinc-900">£{item.amount}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                        item.risk === 'High' ? 'bg-red-100 text-red-700' : 
                                        item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                        {item.risk} Risk
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => setIsArrearsModalOpen(true)}>View All Arrears</Button>
                </div>
            </div>
        </div>
      )}

      {/* --- CLIENT ACCOUNTING TAB --- */}
      {activeTab === 'clients' && (
          <div className="animate-slide-up space-y-6">
              <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center gap-4">
                  <span className="text-sm font-medium text-zinc-700">Select Client Account:</span>
                  <Select 
                    name="selectedLandlord" 
                    options={landlordOptions} 
                    value={selectedLandlordId} 
                    onChange={(e) => setSelectedLandlordId(e.target.value)} 
                    containerClassName="mb-0 w-64"
                  />
              </div>

              {(selectedLandlord || isAllClients) ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Client Summary Cards */}
                      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                              <p className="text-xs text-zinc-500 uppercase font-bold">Total Rent Collected</p>
                              <p className="text-lg font-bold text-green-600 mt-1">£{clientFinancials.rent.toLocaleString()}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                              <p className="text-xs text-zinc-500 uppercase font-bold">Total Expenses</p>
                              <p className="text-lg font-bold text-red-500 mt-1">£{clientFinancials.expenses.toLocaleString()}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                              <p className="text-xs text-zinc-500 uppercase font-bold">Management Fees</p>
                              <p className="text-lg font-bold text-indigo-600 mt-1">£{clientFinancials.fees.toLocaleString()}</p>
                          </div>
                          <div className="bg-zinc-900 p-4 rounded-lg shadow-md text-white">
                              <p className="text-xs text-zinc-400 uppercase font-bold">Net Payout Available</p>
                              <p className="text-2xl font-bold mt-1">£{clientFinancials.net.toLocaleString()}</p>
                          </div>
                      </div>

                      {/* Client Ledger */}
                      <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                              <h3 className="font-semibold text-zinc-900">
                                  {isAllClients ? 'Portfolio Ledger' : 'Client Ledger'}
                              </h3>
                              <Button size="sm" variant="outline" leftIcon={<ArrowDownLeftIcon className="w-4 h-4"/>}>Export Statement</Button>
                          </div>
                          <div className="overflow-x-auto max-h-[500px]">
                              <table className="min-w-full divide-y divide-zinc-100">
                                  <thead className="bg-white sticky top-0 z-10">
                                      <tr>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Property</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Description</th>
                                          <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Amount</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-100 text-sm">
                                      {clientFinancials.ledger.length > 0 ? clientFinancials.ledger.map((entry: any, idx: number) => (
                                          <tr key={idx} className="hover:bg-zinc-50">
                                              <td className="px-4 py-3 text-zinc-500">{new Date(entry.date).toLocaleDateString()}</td>
                                              <td className="px-4 py-3 text-zinc-900 font-medium">{entry.prop || '-'}</td>
                                              <td className="px-4 py-3 text-zinc-600">{entry.desc}</td>
                                              <td className={`px-4 py-3 text-right font-bold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                  £{Math.abs(entry.amount).toLocaleString()} {entry.amount < 0 ? 'Dr' : 'Cr'}
                                              </td>
                                          </tr>
                                      )) : (
                                          <tr><td colSpan={4} className="p-6 text-center text-zinc-400">No transactions found.</td></tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      {/* Properties List */}
                      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-4">
                          <h3 className="font-semibold text-zinc-900 mb-4">{isAllClients ? 'All Properties' : 'Client Properties'}</h3>
                          <ul className="space-y-3 max-h-[500px] overflow-y-auto">
                              {selectedLandlordProperties.map(p => (
                                  <li key={p.id} className="p-3 border border-zinc-100 rounded-md bg-zinc-50">
                                      <p className="text-sm font-medium text-zinc-900">{p.address}</p>
                                      <div className="flex justify-between mt-2 text-xs text-zinc-500">
                                          <span>Fee: {p.managementFeeType === 'Fixed' ? `£${p.managementFeeValue}` : `${p.managementFeeValue}%`}</span>
                                          <span>Val: £{p.value?.toLocaleString()}</span>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-12 text-zinc-400">
                      <UserGroupIcon className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                      <p>Select a client to view their accounts.</p>
                  </div>
              )}
          </div>
      )}

      {/* --- INCOME & BANKING TAB --- */}
      {activeTab === 'income' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            {/* Main Feed Column */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                {/* Tab Switcher for Feed */}
                <div className="flex border-b border-zinc-100">
                    <button 
                        onClick={() => setActiveIncomeView('bank')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeIncomeView === 'bank' ? 'bg-zinc-50 text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        Open Banking Feed
                    </button>
                    <button 
                        onClick={() => setActiveIncomeView('links')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeIncomeView === 'links' ? 'bg-indigo-50 text-indigo-900 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        Payment Links (Stripe)
                    </button>
                    <button 
                        onClick={() => setActiveIncomeView('recurring')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeIncomeView === 'recurring' ? 'bg-teal-50 text-teal-900 border-b-2 border-teal-500' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        Recurring Payments
                    </button>
                </div>

                {/* View Content */}
                <div className="flex-1 overflow-y-auto relative">
                    {activeIncomeView === 'bank' && (
                        <div className="divide-y divide-zinc-100">
                             <div className="p-4 bg-zinc-50/50 flex justify-between items-center border-b border-zinc-100">
                                <p className="text-xs text-zinc-500">Connected to Barclays Business •••• 4492</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                    Live
                                </span>
                            </div>
                            {MOCK_BANK_TRANSACTIONS.map(tx => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-600'}`}>
                                            {tx.type === 'credit' ? <ArrowDownLeftIcon className="w-4 h-4"/> : <ArrowUpRightIcon className="w-4 h-4"/>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{tx.description}</p>
                                            <p className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString()} • {tx.status.replace('-', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-700' : 'text-zinc-900'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}£{Math.abs(tx.amount).toFixed(2)}
                                        </p>
                                        {tx.status === 'matched' ? (
                                            <span className="inline-flex items-center text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                <CheckCircleIcon className="w-3 h-3 mr-1"/> Auto-Matched
                                            </span>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="text-xs h-6 px-2 text-blue-600">Reconcile</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeIncomeView === 'links' && (
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-900">Active Payment Links</h4>
                                    <p className="text-xs text-zinc-500">Generate one-off links for deposits or repairs.</p>
                                </div>
                                <Button size="sm" onClick={() => setIsPaymentLinkModalOpen(true)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Create Link</Button>
                            </div>
                            <div className="space-y-3">
                                {paymentLinks.map(link => (
                                    <div key={link.id} className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:border-indigo-200 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{link.description}</p>
                                            <p className="text-xs text-zinc-500">{link.tenant} • Created {new Date(link.created).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <p className="text-sm font-bold text-zinc-900">£{link.amount}</p>
                                            {link.status === 'Paid' ? (
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Paid</span>
                                            ) : (
                                                <button className="text-indigo-600 hover:text-indigo-800" title="Copy Link">
                                                    <LinkIcon className="w-4 h-4"/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeIncomeView === 'recurring' && (
                        <div className="p-4 space-y-6">
                             {/* Review Queue for Recurring Payments */}
                             {recurringExpenses.some(r => r.status === 'Review Needed') && (
                                 <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                     <div className="flex items-center mb-3">
                                         <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                                         <h3 className="text-sm font-semibold text-yellow-900">Review Needed</h3>
                                     </div>
                                     <div className="space-y-2">
                                         {recurringExpenses.filter(r => r.status === 'Review Needed').map(rec => (
                                             <div key={rec.id} className="bg-white p-3 rounded-md border border-yellow-200 flex justify-between items-center">
                                                 <div>
                                                     <p className="text-sm font-medium text-zinc-900">{rec.vendor} - {rec.description}</p>
                                                     <p className="text-xs text-zinc-500">Amount changed: £{rec.amount.toFixed(2)} ({rec.lastStatus})</p>
                                                 </div>
                                                 <div className="flex gap-2">
                                                     <Button size="sm" variant="outline" className="text-xs">Reject Change</Button>
                                                     <Button size="sm" className="text-xs">Approve</Button>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}
                             
                             <div>
                                 <div className="flex justify-between items-center mb-4">
                                     <div>
                                        <h3 className="text-sm font-semibold text-zinc-900">Active Commitments</h3>
                                        <p className="text-xs text-zinc-500">Recurring outflows (Direct Debits, Standing Orders).</p>
                                     </div>
                                     <div className="flex gap-2">
                                        <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-md border border-zinc-200">Total: £{recurringExpenses.reduce((a,b) => a + b.amount, 0).toLocaleString()} / mo</span>
                                        <Button size="sm" variant="outline" onClick={() => setIsRecurringPaymentModalOpen(true)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add New</Button>
                                     </div>
                                 </div>
                                 <div className="overflow-hidden border border-zinc-200 rounded-lg">
                                     <table className="min-w-full divide-y divide-zinc-100">
                                        <thead className="bg-zinc-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Vendor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Next Due</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-zinc-100">
                                            {recurringExpenses.map(rec => (
                                                <tr key={rec.id} className="hover:bg-zinc-50">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-zinc-900">{rec.vendor}</p>
                                                        <p className="text-xs text-zinc-500">{rec.description}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-600 flex items-center">
                                                        <CalendarDaysIcon className="w-4 h-4 mr-1.5 text-zinc-400"/>
                                                        {new Date(rec.nextDue).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">£{rec.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            rec.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                                            rec.status === 'Review Needed' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {rec.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm">
                                                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs mr-3">Edit</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                     </table>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Widgets */}
            <div className="space-y-6">
                 {/* Payment Methods Health */}
                 <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center">
                        <CreditCardIcon className="w-4 h-4 mr-2 text-indigo-500"/> Auto-Pay Health
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">Direct Debit / Card</span>
                        <span className="text-sm font-bold text-green-600">65%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2 mb-4">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-zinc-500">35% of rent collected via manual transfer. Convert tenants to auto-pay to reduce arrears.</p>
                 </div>

                 <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center">
                        <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-500"/> Smart Arrears Chasing
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-600">Stage 1: Polite Reminder</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-600">Stage 2: Formal Notice (+7d)</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-600">Stage 3: Legal Escalation</span>
                            <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">Manual</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => setIsWorkflowModalOpen(true)}>Configure Workflows</Button>
                 </div>
            </div>
        </div>
      )}

      {/* --- EXPENSES & CONTROLS TAB --- */}
      {activeTab === 'expenses' && (
          <div className="animate-slide-up space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-lg font-semibold text-zinc-900">Expense Management</h2>
                 <Button onClick={() => {setEditingExpense(null); setIsExpenseFormOpen(true)}} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Log Expense</Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                        <h3 className="text-sm font-medium text-zinc-900">Expense Log</h3>
                    </div>
                    <table className="min-w-full divide-y divide-zinc-100">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Merchant/Desc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-zinc-100">
                            {expenses.map(e => (
                                <tr key={e.id} className="hover:bg-zinc-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 font-medium">{e.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500"><span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md text-xs">{e.category}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">£{e.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {e.amount < 100 ? (
                                            <span className="flex items-center text-green-600 text-xs"><CheckCircleIcon className="w-3 h-3 mr-1"/> Auto-Approved</span>
                                        ) : (
                                            <span className="flex items-center text-yellow-600 text-xs"><ClockIcon className="w-3 h-3 mr-1"/> Pending Review</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button onClick={() => {setEditingExpense(e); setIsExpenseFormOpen(true)}} className="text-zinc-400 hover:text-zinc-600 mr-2"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => {if(window.confirm('Delete?')) deleteExpense(e.id)}} className="text-zinc-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>

                 {/* Smart Controls */}
                 <div className="space-y-6">
                     <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
                         <h3 className="text-sm font-semibold text-zinc-900 mb-4">Auto-Approval Rules</h3>
                         <div className="space-y-3 text-sm">
                             <div className="flex items-center justify-between p-2 border rounded-md border-zinc-100 bg-zinc-50">
                                 <span className="text-zinc-700">Amount &lt; £100</span>
                                 <span className="text-green-600 text-xs font-bold">ON</span>
                             </div>
                             <div className="flex items-center justify-between p-2 border rounded-md border-zinc-100 bg-zinc-50">
                                 <span className="text-zinc-700">Vendor: British Gas</span>
                                 <span className="text-green-600 text-xs font-bold">ON</span>
                             </div>
                             <div className="flex items-center justify-between p-2 border rounded-md border-zinc-100 bg-zinc-50">
                                 <span className="text-zinc-700">Cat: Emergency Repairs</span>
                                 <span className="text-red-400 text-xs font-bold">OFF</span>
                             </div>
                         </div>
                     </div>
                     <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
                         <h3 className="text-sm font-semibold text-zinc-900 mb-2">Invoice Matching</h3>
                         <p className="text-xs text-zinc-500 mb-4">Upload an invoice PDF and AI will match it to a maintenance ticket.</p>
                         <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 cursor-pointer transition-colors">
                             <DocumentTextIcon className="w-8 h-8 mb-2"/>
                             <span className="text-xs font-medium">Drop invoice here</span>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {/* --- REPORTING TAB --- */}
      {activeTab === 'reporting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Landlord Statements</h3>
                  <p className="text-sm text-zinc-500 mb-6">Generate consolidated PDF statements for all property owners.</p>
                  <Button className="w-full" leftIcon={<DocumentTextIcon className="w-5 h-5"/>}>Generate Monthly Run</Button>
              </div>
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">NRL Tax Report</h3>
                  <p className="text-sm text-zinc-500 mb-6">Calculate withholding tax for non-resident landlords (HMRC compliant).</p>
                  <Button variant="outline" className="w-full" leftIcon={<CalculatorIcon className="w-5 h-5"/>}>Run Tax Calculation</Button>
              </div>
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Accounting Sync</h3>
                  <p className="text-sm text-zinc-500 mb-6">Last sync: 2 hours ago. Connected to Xero.</p>
                  <Button variant="secondary" className="w-full" leftIcon={<ArrowPathIcon className="w-5 h-5"/>}>Sync Now</Button>
              </div>
              <div className="lg:col-span-3 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-zinc-100">
                      <h3 className="font-semibold text-zinc-900">Audit Trail</h3>
                  </div>
                  <div className="p-4 bg-zinc-50 font-mono text-xs text-zinc-600 space-y-1 h-40 overflow-y-auto">
                      <p>2024-11-15 10:42:12 - USER_ADMIN approved Invoice #9921 (£120.00)</p>
                      <p>2024-11-15 09:15:00 - SYSTEM auto-reconciled Rent Payment for Unit 4B</p>
                      <p>2024-11-14 14:20:11 - SYSTEM sent Arrears Notice (Stage 1) to Bob Builder</p>
                      <p>2024-11-14 11:00:00 - USER_ADMIN updated Property 123 Main St valuation</p>
                  </div>
              </div>
          </div>
      )}

      {/* --- FORECASTING TAB --- */}
      {activeTab === 'forecasting' && (
          <div className="animate-slide-up space-y-6">
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Portfolio Health & Rent Reviews</h3>
                  <div className="overflow-x-auto">
                      <table className="min-w-full">
                          <thead>
                              <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                                  <th className="pb-3">Property</th>
                                  <th className="pb-3">Current Yield</th>
                                  <th className="pb-3">Market Rent (AI Est.)</th>
                                  <th className="pb-3">Health Score</th>
                                  <th className="pb-3 text-right">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                              {portfolioHealthData.map((item) => (
                                  <tr key={item.id}>
                                      <td className="py-4 text-sm font-medium text-zinc-900">{item.name}</td>
                                      <td className="py-4 text-sm text-zinc-600">{item.yield}%</td>
                                      <td className="py-4 text-sm text-zinc-600">£{item.projectedRent.toLocaleString()}</td>
                                      <td className="py-4">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              item.status === 'Excellent' || item.status === 'Good' ? 'bg-green-100 text-green-700' : 
                                              item.status === 'In Review' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                          }`}>
                                              {item.status}
                                          </span>
                                      </td>
                                      <td className="py-4 text-right">
                                          {item.reviewDue === 'Overdue' && item.status !== 'In Review' ? (
                                              <Button 
                                                size="sm" 
                                                className="text-xs bg-red-600 hover:bg-red-700 text-white"
                                                onClick={() => { setRentReviewProperty(item); setIsRentReviewModalOpen(true); }}
                                              >
                                                  Start Review
                                              </Button>
                                          ) : (
                                              <span className="text-xs text-zinc-400">Due {item.reviewDue}</span>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODALS --- */}
      
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

      {/* Arrears Modal */}
      <Modal isOpen={isArrearsModalOpen} onClose={() => setIsArrearsModalOpen(false)} title="Outstanding Arrears">
          <div className="space-y-4">
              <p className="text-sm text-zinc-500">Detailed breakdown of overdue rent payments across the portfolio.</p>
              <table className="min-w-full text-sm divide-y divide-zinc-100">
                  <thead>
                      <tr>
                          <th className="text-left py-2">Tenant / Unit</th>
                          <th className="text-left py-2">Days Overdue</th>
                          <th className="text-right py-2">Amount</th>
                          <th className="text-right py-2">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                      <tr>
                          <td className="py-3">Bob Builder (Unit 4B)</td>
                          <td className="py-3 text-orange-600 font-medium">12 Days</td>
                          <td className="py-3 text-right">£450.00</td>
                          <td className="py-3 text-right"><Button size="sm" variant="outline" className="text-xs">Send Reminder</Button></td>
                      </tr>
                      <tr>
                          <td className="py-3">Biz Corp (Unit 7)</td>
                          <td className="py-3 text-red-600 font-bold">45 Days</td>
                          <td className="py-3 text-right">£400.00</td>
                          <td className="py-3 text-right"><Button size="sm" variant="danger" className="text-xs">Escalate</Button></td>
                      </tr>
                  </tbody>
              </table>
              <div className="flex justify-end pt-4">
                  <Button onClick={() => setIsArrearsModalOpen(false)}>Close</Button>
              </div>
          </div>
      </Modal>

      {/* Workflow Config Modal */}
      <Modal isOpen={isWorkflowModalOpen} onClose={() => setIsWorkflowModalOpen(false)} title="Arrears Automation Workflows">
          <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-md">
                  <div>
                      <h4 className="text-sm font-medium text-zinc-900">Auto-Chase Emails</h4>
                      <p className="text-xs text-zinc-500">Send polite reminders at +1 day and +3 days.</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-green-400 cursor-pointer"></label>
                  </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-md">
                  <div>
                      <h4 className="text-sm font-medium text-zinc-900">Late Fee Application</h4>
                      <p className="text-xs text-zinc-500">Automatically apply £50 fee at +7 days overdue.</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-green-400 cursor-pointer"></label>
                  </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-md">
                  <div>
                      <h4 className="text-sm font-medium text-zinc-900">Legal Escalation Trigger</h4>
                      <p className="text-xs text-zinc-500">Notify legal team at +30 days overdue.</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-zinc-300 cursor-pointer"></label>
                  </div>
              </div>
              <div className="flex justify-end pt-4">
                  <Button onClick={() => setIsWorkflowModalOpen(false)}>Save Configuration</Button>
              </div>
          </div>
      </Modal>

      {/* Create Payment Link Modal */}
      <Modal isOpen={isPaymentLinkModalOpen} onClose={() => setIsPaymentLinkModalOpen(false)} title="Create Payment Link">
          <form onSubmit={handleCreatePaymentLink} className="space-y-4">
              <Input label="Description" name="description" placeholder="e.g., Replacement Fob Key" required />
              <Input label="Amount (£)" name="amount" type="number" placeholder="0.00" required />
              <Select 
                label="Tenant" 
                name="tenant" 
                options={tenants.map(t => ({ value: t.name, label: t.name }))}
                placeholder="Select Tenant"
              />
              <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsPaymentLinkModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Generate Link</Button>
              </div>
          </form>
      </Modal>

      {/* Create Recurring Payment Modal */}
      <Modal isOpen={isRecurringPaymentModalOpen} onClose={() => setIsRecurringPaymentModalOpen(false)} title="Setup Recurring Payment">
          <form onSubmit={handleCreateRecurringPayment} className="space-y-4">
              <Input label="Vendor / Payee" name="vendor" placeholder="e.g., Council Tax" required />
              <Input label="Reference / Description" name="description" placeholder="e.g., Property 123 Tax" required />
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Amount (£)" name="amount" type="number" placeholder="0.00" required />
                  <Select label="Frequency" name="frequency" options={[{value: 'Weekly', label: 'Weekly'}, {value: 'Monthly', label: 'Monthly'}, {value: 'Quarterly', label: 'Quarterly'}, {value: 'Annually', label: 'Annually'}]} />
              </div>
              <Input label="First Payment Date" name="nextDue" type="date" required />
              <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRecurringPaymentModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Commitment</Button>
              </div>
          </form>
      </Modal>

      {/* Rent Review Modal */}
      <Modal isOpen={isRentReviewModalOpen} onClose={() => setIsRentReviewModalOpen(false)} title={`Rent Review: ${rentReviewProperty?.name}`}>
          <form onSubmit={handleRentReviewSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                  <div className="p-3 bg-zinc-50 rounded border border-zinc-200 text-center">
                      <span className="block text-xs text-zinc-500 uppercase font-bold">Current Rent</span>
                      <span className="text-lg font-semibold text-zinc-900">£{rentReviewProperty?.currentRent}</span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded border border-indigo-100 text-center">
                      <span className="block text-xs text-indigo-600 uppercase font-bold">Market Estimate (AI)</span>
                      <span className="text-lg font-semibold text-indigo-900">£{rentReviewProperty?.projectedRent}</span>
                  </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded text-sm text-green-800">
                  <strong>Insight:</strong> Market rent is approx {(rentReviewProperty?.projectedRent - rentReviewProperty?.currentRent) > 0 ? `£${rentReviewProperty?.projectedRent - rentReviewProperty?.currentRent} higher` : 'lower'} than current. Recommended increase: 5-8%.
              </div>
              <Input label="Proposed New Rent (£)" name="newRent" type="number" defaultValue={rentReviewProperty?.projectedRent} />
              <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsRentReviewModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Start Review Process</Button>
              </div>
          </form>
      </Modal>

    </div>
  );
};

export default FinancialsPage;
