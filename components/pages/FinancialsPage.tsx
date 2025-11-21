
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
    LinkIcon, CalendarDaysIcon, UserGroupIcon, XMarkIcon, GlobeAltIcon
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

// Stripe specific transactions (Cleaner, richer data)
const STRIPE_TREASURY_TRANSACTIONS = [
    { id: 'stx_1', date: new Date().toISOString(), description: 'Transfer from Stripe Balance', amount: 2450.00, type: 'credit', status: 'settled' },
    { id: 'stx_2', date: new Date(Date.now() - 3600000).toISOString(), description: 'Card Payment - Alice Wonderland (Rent)', amount: 1200.00, type: 'credit', status: 'settled', fee: 25.00 },
    { id: 'stx_3', date: new Date(Date.now() - 86400000).toISOString(), description: 'Card Payment - Bob Builder (Rent)', amount: 950.00, type: 'credit', status: 'settled', fee: 20.50 },
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

  // Simulate if the user has connected stripe (mock check against profile would go here)
  // For demo purposes, we'll assume true if specific condition or toggle in settings
  const isStripeConnected = true; 

  // --- AGGREGATIONS & HELPERS ---

  // 1. Calculate Agency Revenue (Management Fees)
  const calculateManagementFee = (propertyId: string, rentAmount: number) => {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return 0;
      if (property.managementFeeType === 'Fixed') {
          return property.managementFeeValue || 0;
      } else {
          // Percentage
          const percent = property.managementFeeValue || 10; // Default