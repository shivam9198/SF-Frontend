import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSmartphone, FiUser, FiCalendar, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiList, FiXCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import api from '../../services/api/axios';
import { formatName } from '../../utils/format';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

const LoanDetailsPage = () => {
    const params = useParams();
    const actualLoanId = params.loanId || params.id;
    const navigate = useNavigate();

    const [loan, setLoan] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/loans/${actualLoanId}`);
                let loanData = response.data?.data?.loan || response.data?.loan || response.data?.data || response.data;

                // If customer is already a populated object in customerId, map it directly
                if (!loanData.customer && loanData.customerId && typeof loanData.customerId === 'object' && (loanData.customerId.fullName || loanData.customerId.name)) {
                    loanData.customer = loanData.customerId;
                }

                // Fetch specific customer details to ensure Customer Name is displayed
                if (!loanData.customer || (!loanData.customer.fullName && !loanData.customer.name)) {
                    let customerIdToFetch = null;
                    if (typeof loanData.customerId === 'string') {
                        customerIdToFetch = loanData.customerId;
                    } else if (loanData.customerId && typeof loanData.customerId === 'object') {
                        customerIdToFetch = loanData.customerId._id || loanData.customerId.id;
                    } else if (typeof loanData.customer === 'string') {
                        customerIdToFetch = loanData.customer;
                    } else if (loanData.customer && typeof loanData.customer === 'object') {
                        customerIdToFetch = loanData.customer._id || loanData.customer.id;
                    }

                    if (customerIdToFetch) {
                        try {
                            const customerRes = await api.get(`/customers/${customerIdToFetch}`);
                            loanData.customer = customerRes.data?.data?.customer || customerRes.data?.customer || customerRes.data?.data || customerRes.data;
                        } catch (e) {
                            console.error('Failed to fetch customer for loan details', e);
                        }
                    }
                }

                // Fetch strictly from the Backend Installments API
                let fetchedSchedule = response.data?.installments || loanData.installments || [];
                try {
                    const installmentsRes = await api.get(`/loans/${actualLoanId}/installments`);
                    const resData = installmentsRes.data?.data || installmentsRes.data;
                    const loanInstallments = Array.isArray(resData) ? resData : (resData?.installments || []);
                    if (loanInstallments.length > 0) {
                        fetchedSchedule = loanInstallments;
                    }
                } catch (e) {
                    console.error('Failed to fetch loan installments API, falling back to loan payload', e);
                }

                setLoan(loanData);
                // Sort schedule chronologically to pass the true backend representation downwards
                setSchedule(fetchedSchedule.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate) || (a.emiNumber || 0) - (b.emiNumber || 0)));
                setError(null);
            } catch (err) {
                const msg = err.response?.data?.message || err.message || 'Failed to fetch loan details';
                setError(msg);
                showToast('error', msg);
            } finally {
                setIsLoading(false);
            }
        };

        if (actualLoanId) {
            fetchDetails();
        }
    }, [actualLoanId]);

    // Derived Statistics
    const stats = useMemo(() => {
        let totalEmis = loan?.emiPlan || loan?.months || schedule.length || 0;
        const paid = loan?.paidEmis || 0;

        if (!schedule || !schedule.length) {
            return {
                totalEmis,
                paidEmis: paid,
                pendingEmis: Math.max(0, totalEmis - paid),
                overdueEmis: 0,
                collectionPercent: totalEmis > 0 ? Math.round((paid / totalEmis) * 100) : 0,
                outstandingBalance: loan?.outstandingBalance ?? Math.max(0, (loan?.loanAmount || 0) - (paid * (loan?.monthlyEmi || 0)))
            };
        }

        totalEmis = schedule.length; // Priority to real EMI data
        const paidEmis = schedule.filter(e => e.status === 'Paid').length;
        const pendingEmis = schedule.filter(e => e.status === 'Pending').length;
        const overdueEmis = schedule.filter(e => e.status === 'Overdue').length;

        const collectionPercent = totalEmis > 0 ? Math.round((paidEmis / totalEmis) * 100) : 0;
        const outstandingBalance = schedule.filter(e => e.status !== 'Paid').reduce((sum, e) => sum + (e.amount || 0), 0);

        return {
            totalEmis,
            paidEmis,
            pendingEmis,
            overdueEmis,
            collectionPercent,
            outstandingBalance
        };
    }, [schedule, loan]);

    const toastElement = toast && (
        <div className={`fixed right-4 top-4 z-50 flex animate-bounce items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
            <p className="text-sm font-medium">{toast.message}</p>
        </div>
    );

    if (isLoading) {
        return <><div className="flex h-64 items-center justify-center"><Loader /></div>{toastElement}</>;
    }

    if (error) {
        return <><ErrorState message={error} onRetry={() => window.location.reload()} />{toastElement}</>;
    }

    if (!loan || !stats) return toastElement;

    // Build timeline events
    const timelineEvents = [
        { title: 'Loan Created', date: loan.purchaseDate, type: 'success' },
        ...schedule
            .filter(e => e.status === 'Paid')
            .map(e => ({
                title: `EMI ${e.emiNumber} Paid`,
                date: e.paidOn,
                type: 'success'
            }))
    ];

    // Add current status to timeline
    const nextEmi = schedule.find(e => e.status !== 'Paid');
    if (nextEmi) {
        if (nextEmi.status === 'Overdue') {
            timelineEvents.push({ title: `EMI ${nextEmi.emiNumber} Overdue`, date: nextEmi.dueDate, type: 'danger' });
        } else {
            timelineEvents.push({ title: `Awaiting EMI ${nextEmi.emiNumber}`, date: nextEmi.dueDate, type: 'pending' });
        }
    } else if (schedule.length > 0) {
        timelineEvents.push({ title: 'Loan Completed', date: schedule[schedule.length - 1].paidOn, type: 'success' });
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/loans')}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Loan Details</h1>
                            {stats.overdueEmis > 0 ? (
                                <Badge variant="warning">Action Required</Badge>
                            ) : (stats.totalEmis > 0 && stats.paidEmis === stats.totalEmis) ? (
                                <Badge variant="primary">Completed</Badge>
                            ) : (
                                <Badge variant="success">Active</Badge>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Loan ID: <span className="font-medium text-slate-700 dark:text-slate-300">{loan._id ? `LOAN-${String(loan._id).slice(-6).toUpperCase()}` : loan.id}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => navigate(`/loans/${loan._id || loan.id}/emi-schedule`, { state: { loan, schedule, stats } })} className="gap-2 text-sm px-3 sm:px-4">
                        <FiList /> View EMI Schedule
                    </Button>
                </div>
            </div>

            {/* Status Overview Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard title="Total EMIs" value={stats.totalEmis} />
                <StatCard title="Paid EMIs" value={stats.paidEmis} valueColor="text-emerald-600 dark:text-emerald-400" />
                <StatCard title="Pending EMIs" value={stats.pendingEmis} valueColor="text-amber-600 dark:text-amber-400" />
                <StatCard title="Overdue EMIs" value={stats.overdueEmis} valueColor="text-red-600 dark:text-red-400" />
                <StatCard title="Collection %" value={`${stats.collectionPercent}%`} />
                <StatCard title="Outstanding" value={formatCurrency(stats.outstandingBalance)} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Loan Summary & Progress */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Loan Progress Visualization */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                        <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Loan Progress</h2>

                        <div className="mb-4 flex items-center justify-between text-sm font-medium">
                            <span className="text-slate-700 dark:text-slate-300">{loan.emiPlan || loan.months || 0} EMI Plan</span>
                            <span className="text-slate-500">{stats.collectionPercent}% Completed</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                style={{ width: `${stats.totalEmis > 0 ? (stats.paidEmis / stats.totalEmis) * 100 : 0}%` }}
                                className="bg-emerald-500 transition-all duration-500"
                            ></div>
                            <div
                                style={{ width: `${stats.totalEmis > 0 ? (stats.overdueEmis / stats.totalEmis) * 100 : 0}%` }}
                                className="bg-red-500 transition-all duration-500"
                            ></div>
                            {/* Pending area is inherently the background color */}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                                <span className="text-slate-600 dark:text-slate-400">{stats.paidEmis} Paid</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <span className="text-slate-600 dark:text-slate-400">{stats.pendingEmis} Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <span className="text-slate-600 dark:text-slate-400">{stats.overdueEmis} Overdue</span>
                            </div>
                        </div>
                    </div>

                    {/* Loan Summary Card */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                        <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Loan Summary</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <SummaryItem
                                    icon={<FiUser />}
                                    label="Customer Name"
                                    value={formatName(loan.customer?.fullName || loan.customer?.name || loan.customerName || 'Unknown Customer')}
                                    subValue={`${loan.customer?._id ? `CUS-${String(loan.customer._id).slice(-6).toUpperCase()}` : (loan.customerId ? `CUS-${String(typeof loan.customerId === 'object' ? (loan.customerId._id || loan.customerId.id) : loan.customerId).slice(-6).toUpperCase()}` : 'N/A')} • ${loan.customer?.phone || loan.phone || 'N/A'}`}
                                />
                                <SummaryItem icon={<FiSmartphone />} label="Product Name" value={loan.productName} subValue={`IMEI: ${loan.imeiNumber}`} />
                                <SummaryItem icon={<FiCalendar />} label="Purchase Date" value={loan.purchaseDate ? new Date(loan.purchaseDate).toLocaleDateString() : '-'} />
                            </div>
                            <div className="space-y-4">
                                <SummaryItem icon={<FiDollarSign />} label="Loan Details" value={`Amount: ${formatCurrency(loan.loanAmount || 0)}`} subValue={`Down: ${formatCurrency(loan.downPayment || 0)} | Login: ${formatCurrency(loan.loginCharge || 0)}`} />
                                <SummaryItem icon={<FiClock />} label="EMI Plan" value={`${loan.emiPlan || loan.months || 0} Months`} subValue={`${formatCurrency(loan.monthlyEmi || 0)} / month`} />
                                <SummaryItem icon={<FiAlertCircle />} label="Outstanding" value={formatCurrency(stats.outstandingBalance)} valueColor="text-amber-600 dark:text-amber-400 font-semibold" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Timeline */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                        <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Payment Status Timeline</h2>
                        <div className="space-y-6">
                            {timelineEvents.map((item, index) => (
                                <div key={index} className="flex gap-4 relative">
                                    {index !== timelineEvents.length - 1 && (
                                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                    )}
                                    <div className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-900">
                                        <div className={`h-3 w-3 rounded-full ${item.type === 'success' ? 'bg-emerald-500' :
                                            item.type === 'danger' ? 'bg-red-500 animate-pulse' :
                                                'bg-amber-400'
                                            }`}></div>
                                    </div>
                                    <div className="pb-1">
                                        <p className={`text-sm font-medium ${item.type === 'success' ? 'text-slate-900 dark:text-white' :
                                            item.type === 'danger' ? 'text-red-600 dark:text-red-400' :
                                                'text-amber-600 dark:text-amber-400'
                                            }`}>{item.title}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {item.date ? new Date(item.date).toLocaleDateString() : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {toastElement}
        </div>
    );
};

function StatCard({ title, value, valueColor = "text-slate-900 dark:text-white" }) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-700/90 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <h3 className={`text-xl font-bold ${valueColor}`}>{value}</h3>
        </div>
    );
}

function SummaryItem({ icon, label, value, subValue, valueColor = "text-slate-900 dark:text-white" }) {
    return (
        <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className={`text-sm font-medium break-words ${valueColor}`}>{value || '-'}</p>
                {subValue && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">{subValue}</p>}
            </div>
        </div>
    );
}

export default LoanDetailsPage;
