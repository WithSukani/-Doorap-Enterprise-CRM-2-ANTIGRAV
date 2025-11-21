
import React, { useState } from 'react';
import { RentPayment, Expense, Property, Tenant, Landlord } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import { 
    PlusCircleIcon, ArrowUpRightIcon, ArrowDownLeftIcon, 
    CreditCardIcon, DocumentTextIcon,
    BanknotesIcon, LinkIcon
} from '../icons/HeroIcons';
import RentPaymentForm from '../forms/RentPaymentForm';
import ExpenseForm from '../forms/ExpenseForm';

// --- Mock Data ---
const MOCK_BANK_TRANSACTIONS = [
    { id: 'tx_1', date: new Date().toISOString(), description: 'FPS CREDIT FROM A. WONDERLAND', amount: 1200, type: 'credit', status: 'matched', matchId: 'ten1' },
    { id: 'tx_2', date: new Date(Date.now() - 86400000).toISOString(), description: 'DIRECT DEBIT BGAS SERVICES', amount: -45.50, type: 'debit', status: 'auto-categorized', category: 'Utilities' },
    { id: 'tx_3', date: new Date(Date.now() - 172800000).toISOString(), description: 'FPS CREDIT FROM B. BUILDER', amount: 950, type: 'credit', status: 'matched', matchId: 'ten2' },
    { id: 'tx_4', date: new Date(Date.now() - 259200000).toISOString(), description: 'PLUMBPERFECT LTD INV-992', amount: -120.00, type: 'debit', status: 'pending', matchId: 'exp1' },
    { id: 'tx_5', date: new Date(Date.now() - 345600000).toISOString(), description: 'UNKNOWN CREDIT REF 99281', amount: 500, type: 'credit', status: 'unreconciled' },
];

const STRIPE_DATA = {
    available: 2450.00,
    pending: 850.00,
    inTransit: 1200.00,
    nextPayout: new Date(Date.now() + 86400000).toISOString(),
};

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
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-lg shadow-lg text-white relative overflow-hidden h-full flex flex-col justify-between">
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
  properties, tenants
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expenses'>('dashboard');
  
  const [isRentFormOpen, setIsRentFormOpen] = useState(false);
  const [editingRentPayment, setEditingRentPayment] = useState<RentPayment | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Financials & Banking" 
        subtitle="Track income, expenses, and treasury in real-time."
        actions={
            <div className="flex gap-2">
                <Button onClick={handleAddExpense} variant="secondary" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Log Expense</Button>
                <Button onClick={handleAddRentPayment} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Log Rent</Button>
            </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-zinc-200 mb-6 bg-white px-2 rounded-t-lg">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {['dashboard', 'income', 'expenses'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`${
                        activeTab === tab
                            ? 'border-zinc-900 text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                    {tab}
                </button>
            ))}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StatWidget title="Total Revenue (MTD)" value="£14,250" trend="+8.2%" icon={<BanknotesIcon/>} color="bg-green-500" />
                      <StatWidget title="Total Expenses (MTD)" value="£3,840" trend="-2.1%" icon={<ArrowDownLeftIcon/>} color="bg-red-500" />
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                      <h3 className="font-bold text-zinc-900 mb-4">Recent Transactions</h3>
                      <div className="space-y-3">
                          {MOCK_BANK_TRANSACTIONS.map(tx => (
                              <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-zinc-50 rounded border border-transparent hover:border-zinc-100">
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-600'}`}>
                                          {tx.type === 'credit' ? <ArrowDownLeftIcon className="w-4 h-4"/> : <ArrowUpRightIcon className="w-4 h-4"/>}
                                      </div>
                                      <div>
                                          <p className="text-sm font-medium text-zinc-900">{tx.description}</p>
                                          <p className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString()} • {tx.status}</p>
                                      </div>
                                  </div>
                                  <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-zinc-900'}`}>
                                      {tx.amount > 0 ? '+' : ''}£{Math.abs(tx.amount).toFixed(2)}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="space-y-6">
                  <div className="h-64">
                    <StripeTreasuryCard />
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                      <h3 className="font-bold text-zinc-900 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                          <Button size="sm" variant="outline" className="w-full justify-start" leftIcon={<LinkIcon className="w-4 h-4"/>}>Create Payment Link</Button>
                          <Button size="sm" variant="outline" className="w-full justify-start" leftIcon={<DocumentTextIcon className="w-4 h-4"/>}>Reconcile Transactions</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'income' && (
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
    </div>
  );
};

export default FinancialsPage;
