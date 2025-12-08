
import React, { useState, useMemo } from 'react';
import {
    MaintenanceStatus, Property, Tenant, MaintenanceRequest, Reminder, Document, CommunicationLog, RentPayment, Expense, Task, Vacancy, Applicant, Inspection, UserProfile, DocumentTemplate, MaintenancePriority, TaskStatus, EmergencyItem
} from '../../types';
import PageHeader from '../PageHeader';
import {
    BuildingOffice2Icon, UsersIcon, WrenchScrewdriverIcon,
    CurrencyDollarIconSolid, BanknotesIcon, HomeModernIcon, IconProps,
    CheckCircleIcon, PlusCircleIcon, ExclamationTriangleIcon, ChartPieIcon,
    ArrowTrendingUpIcon, ArrowDownLeftIcon, ArrowUpRightIcon, FireIcon, ArrowRightIcon
} from '../icons/HeroIcons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<IconProps>;
    trend?: string;
    trendUp?: boolean;
    subValue?: string;
    color?: 'default' | 'green' | 'red' | 'blue' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, subValue, color = 'default' }) => {
    const colorClasses = {
        default: 'bg-white border-zinc-200',
        green: 'bg-green-50 border-green-100',
        red: 'bg-red-50 border-red-100',
        blue: 'bg-blue-50 border-blue-100',
        indigo: 'bg-indigo-50 border-indigo-100',
    };

    const iconColorClasses = {
        default: 'text-zinc-600 bg-zinc-100',
        green: 'text-green-600 bg-white',
        red: 'text-red-600 bg-white',
        blue: 'text-blue-600 bg-white',
        indigo: 'text-indigo-600 bg-white',
    };

    return (
        <div className={`${colorClasses[color]} p-5 rounded-xl border shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-zinc-500">{title}</p>
                <div className={`p-2 rounded-lg ${iconColorClasses[color]}`}>
                    {React.cloneElement(icon, { className: 'w-5 h-5' })}
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</p>
                {subValue && <p className="text-xs text-zinc-500 mt-1">{subValue}</p>}
                {trend && (
                    <div className="flex items-center mt-2">
                        {trendUp ? <ArrowUpRightIcon className="w-3 h-3 text-green-600 mr-1" /> : <ArrowDownLeftIcon className="w-3 h-3 text-red-600 mr-1" />}
                        <p className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            {trend}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface DashboardPageProps {
    properties: Property[];
    tenants: Tenant[];
    maintenanceRequests: MaintenanceRequest[];
    reminders: Reminder[];
    documents: Document[];
    communicationLogs: CommunicationLog[];
    rentPayments: RentPayment[];
    expenses: Expense[];
    tasks: Task[];
    vacancies: Vacancy[];
    applicants: Applicant[];
    inspections: Inspection[];
    userProfile: UserProfile;
    documentTemplates: DocumentTemplate[];
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    emergencies?: EmergencyItem[];
}

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
    const { properties, tenants, maintenanceRequests, rentPayments, expenses, tasks, addTask, updateTask, userProfile, emergencies = [] } = props;
    const navigate = useNavigate();

    const [newTaskTitle, setNewTaskTitle] = useState('');

    // --- Financial Calculations ---
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getMonthlyTotal = (items: { date: string, amount: number }[], month: number, year: number) => {
        return items.filter(item => {
            const d = new Date(item.date);
            return d.getMonth() === month && d.getFullYear() === year;
        }).reduce((sum, item) => sum + item.amount, 0);
    };

    const currentMonthIncome = getMonthlyTotal(rentPayments, currentMonth, currentYear);
    const lastMonthIncome = getMonthlyTotal(rentPayments, lastMonth, lastMonthYear);
    const currentMonthExpenses = getMonthlyTotal(expenses, currentMonth, currentYear);
    const lastMonthExpenses = getMonthlyTotal(expenses, lastMonth, lastMonthYear);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : undefined;
        const percent = ((current - previous) / previous) * 100;
        return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
    };

    const incomeTrend = calculateTrend(currentMonthIncome, lastMonthIncome);
    const expenseTrend = calculateTrend(currentMonthExpenses, lastMonthExpenses);
    const incomeTrendUp = currentMonthIncome >= lastMonthIncome;
    const expenseTrendUp = currentMonthExpenses >= lastMonthExpenses; // Usually high expense trend is "bad" but we'll stick to visual arrow direction for now

    const totalRentCollected = rentPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRentCollected - totalExpenses;

    // Yield Calculation
    const totalPortfolioValue = properties.reduce((sum, p) => sum + (p.value || 0), 0);
    const monthlyRentRoll = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const annualRentRunRate = monthlyRentRoll * 12;
    const portfolioYield = totalPortfolioValue > 0 ? (annualRentRunRate / totalPortfolioValue) * 100 : 0;

    // --- Operational Metrics ---
    const activeMaintenance = maintenanceRequests.filter(mr => mr.status !== MaintenanceStatus.COMPLETED && mr.status !== MaintenanceStatus.CANCELLED && mr.status !== MaintenanceStatus.PAID);
    const urgentMaintenance = activeMaintenance.filter(mr => mr.priority === MaintenancePriority.URGENT || mr.priority === MaintenancePriority.HIGH);
    const propertiesWithTenants = new Set(tenants.map(t => t.propertyId)).size;
    const occupancyRate = properties.length > 0 ? (propertiesWithTenants / properties.length) * 100 : 0;
    const expiringLeasesCount = tenants.filter(t => t.leaseEndDate && new Date(t.leaseEndDate) < new Date(new Date().setDate(new Date().getDate() + 60))).length;

    // --- Tasks Logic ---
    const today = new Date().toISOString().split('T')[0];
    const dailyTasks = tasks.filter(t => {
        if (t.status === TaskStatus.COMPLETED) return true;
        const isDue = t.dueDate ? t.dueDate <= today : t.createdAt.startsWith(today);
        return isDue;
    }).sort((a, b) => (a.status === TaskStatus.COMPLETED ? 1 : -1));

    const handleToggleTask = (task: Task) => {
        updateTask({
            ...task,
            status: task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED
        });
    };

    const handleQuickAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask({
            id: `task_${Date.now()}`,
            title: newTaskTitle,
            status: TaskStatus.PENDING,
            priority: MaintenancePriority.MEDIUM,
            createdAt: new Date().toISOString(),
            dueDate: today,
        });
        setNewTaskTitle('');
    };

    const activeEmergencies = emergencies.filter(e => e.status === 'Open');

    // Chart Data Generation
    const generateChartData = () => {
        const months = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.getMonth();
            const year = d.getFullYear();
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                income: getMonthlyTotal(rentPayments, month, year),
                expense: getMonthlyTotal(expenses, month, year)
            });
        }
        return months;
    };

    const chartData = generateChartData();

    return (
        <div className="animate-fade-in space-y-8">
            <PageHeader title="Dashboard" subtitle={`Welcome back, ${userProfile.name}. Here is your financial and operational overview.`} />

            {/* 0. Dori Emergency Alert */}
            {activeEmergencies.length > 0 && (
                <div className="bg-red-600 rounded-xl shadow-lg p-4 text-white flex items-center justify-between animate-pulse cursor-pointer" onClick={() => navigate('/dori')}>
                    <div className="flex items-center">
                        <div className="bg-white/20 p-2 rounded-full mr-4">
                            <FireIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Emergency Active</h3>
                            <p className="text-sm text-red-100">{activeEmergencies.length} critical issue(s) require immediate attention via Dori.</p>
                        </div>
                    </div>
                    <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 border-none">View Emergency Center</Button>
                </div>
            )}

            {/* 1. Financial Performance Row (CEO View) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Net Income (YTD)"
                    value={`£${netIncome.toLocaleString()}`}
                    icon={<BanknotesIcon className="text-green-600" />}
                    color="green"
                    trend={incomeTrend}
                    trendUp={incomeTrendUp}
                />
                <StatCard
                    title="Gross Revenue"
                    value={`£${totalRentCollected.toLocaleString()}`}
                    icon={<CurrencyDollarIconSolid className="text-indigo-600" />}
                    color="indigo"
                    subValue={`Proj. Annual: £${annualRentRunRate.toLocaleString()}`}
                />
                <StatCard
                    title="Total Expenses"
                    value={`£${totalExpenses.toLocaleString()}`}
                    icon={<ArrowTrendingUpIcon className="text-red-600" />}
                    color="red"
                    trend={expenseTrend}
                    trendUp={!expenseTrendUp} // For expenses, "up" is usually bad, but arrow direction logic in StatCard renders UpRight for true. If expense goes up, trendUp=true -> green up arrow. We probably want expense up to be RED.
                // StatCard logic: trendUp ? GreenArrow : RedArrow.
                // If expenses go DOWN (trendUp=false), we want Green.
                // If expenses go UP (trendUp=true), we want Red.
                // Let's look at StatCard: trendUp ? text-green : text-red.
                // If expenseTrendUp (Expenses > LastMonth), we want RED. So trendUp should be FALSE?
                // Wait: 
                // trendUp=true => Green Arrow Up.
                // trendUp=false => Red Arrow Down.
                // If Expenses Up -> Red Arrow Up? Not supported by current StatCard. Current is Up=Green, Down=Red.
                // Minimal change: Just use raw comparison. If expenses go down, it shows Red Arrow Down (which implies "bad" color but "good" direction?). 
                // Actually usually "Expense Down" is Green.
                // Users question was just about the numbers. I'll stick to a neutral interpreting or just use standard logic.
                // Let's pass `expenseTrendUp` as is for now. Or better:
                // The user saw +4.2% (Red). So it was hardcoded trendUp={false}.
                // I'll calculate it properly.

                />
                <StatCard
                    title="Portfolio Yield"
                    value={`${portfolioYield.toFixed(2)}%`}
                    icon={<ChartPieIcon className="text-blue-600" />}
                    color="blue"
                    subValue={`Value: £${(totalPortfolioValue / 1000000).toFixed(1)}M`}
                />
            </div>

            {/* 2. Operational Metrics (Secondary Row) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 font-medium">Occupancy</p>
                        <p className="text-lg font-bold text-zinc-900">{occupancyRate.toFixed(0)}%</p>
                    </div>
                    <HomeModernIcon className="w-8 h-8 text-zinc-200" />
                </div>
                <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 font-medium">Active Tenants</p>
                        <p className="text-lg font-bold text-zinc-900">{tenants.length}</p>
                    </div>
                    <UsersIcon className="w-8 h-8 text-zinc-200" />
                </div>
                <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 font-medium">Maintenance</p>
                        <p className="text-lg font-bold text-zinc-900">{activeMaintenance.length} <span className="text-xs text-zinc-400 font-normal">Open</span></p>
                    </div>
                    <WrenchScrewdriverIcon className="w-8 h-8 text-zinc-200" />
                </div>
                <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 font-medium">Total Units</p>
                        <p className="text-lg font-bold text-zinc-900">{properties.length}</p>
                    </div>
                    <BuildingOffice2Icon className="w-8 h-8 text-zinc-200" />
                </div>
            </div>

            {/* 3. Tasks & Action Grid (Middle Layer) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Daily Tasks Widget */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col h-[400px]">
                    <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                        <div>
                            <h3 className="font-bold text-zinc-900">Daily Tasks</h3>
                            <p className="text-xs text-zinc-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                        </div>
                        <span className="bg-zinc-900 text-white text-xs font-bold px-2 py-1 rounded-md">{dailyTasks.filter(t => t.status !== TaskStatus.COMPLETED).length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {dailyTasks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                <CheckCircleIcon className="w-10 h-10 mb-2 opacity-20" />
                                <p className="text-sm">All caught up!</p>
                            </div>
                        ) : (
                            dailyTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => handleToggleTask(task)}
                                    className={`group flex items-start p-3 rounded-lg cursor-pointer transition-all ${task.status === TaskStatus.COMPLETED ? 'opacity-50 hover:bg-zinc-50' : 'hover:bg-zinc-50 border border-transparent hover:border-zinc-200'}`}
                                >
                                    <div className={`mt-0.5 mr-3 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.status === TaskStatus.COMPLETED ? 'bg-green-500 border-green-500' : 'bg-white border-zinc-300 group-hover:border-zinc-400'
                                        }`}>
                                        {task.status === TaskStatus.COMPLETED && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${task.status === TaskStatus.COMPLETED ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                                            {task.title}
                                        </p>
                                        {task.dueDate && (
                                            <p className="text-[10px] text-zinc-400 mt-0.5">Due: {task.dueDate}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-zinc-100 bg-zinc-50 rounded-b-xl">
                        <form onSubmit={handleQuickAddTask} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a task..."
                                className="flex-1 bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                            />
                            <Button type="submit" size="sm" disabled={!newTaskTitle.trim()} className="w-10 px-0 flex items-center justify-center">
                                <PlusCircleIcon className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Action Required Section */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden h-[400px]">
                    <div className="p-4 border-b border-zinc-100 bg-red-50/30 flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-500" />
                        <h3 className="font-bold text-zinc-900 text-sm">Attention Needed</h3>
                    </div>
                    <div className="divide-y divide-zinc-100 overflow-y-auto h-[340px]">
                        {urgentMaintenance.length === 0 && expiringLeasesCount === 0 && (
                            <div className="p-6 text-center text-zinc-400 text-xs">
                                No urgent alerts.
                            </div>
                        )}
                        {urgentMaintenance.map(req => (
                            <div key={req.id} className="p-3 hover:bg-zinc-50 flex justify-between items-center transition-colors cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 line-clamp-1">{req.issueTitle}</p>
                                    <p className="text-xs text-zinc-500">Urgent Maintenance</p>
                                </div>
                                <Button size="sm" variant="outline" className="text-xs py-1 h-7">View</Button>
                            </div>
                        ))}
                        {expiringLeasesCount > 0 && (
                            <div className="p-3 hover:bg-zinc-50 flex justify-between items-center transition-colors cursor-pointer border-l-2 border-yellow-400">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">{expiringLeasesCount} Expiring Leases</p>
                                    <p className="text-xs text-zinc-500">Review renewals</p>
                                </div>
                                <Button size="sm" variant="outline" className="text-xs py-1 h-7">View</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Cash Flow Chart (Bottom Layer) */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Cash Flow</h3>
                        <p className="text-sm text-zinc-500">Income vs Expenses over time</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center text-xs text-zinc-500"><div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Income</span>
                        <span className="flex items-center text-xs text-zinc-500"><div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div> Expense</span>
                    </div>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                            <CartesianGrid vertical={false} stroke="#f4f4f5" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={0} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
