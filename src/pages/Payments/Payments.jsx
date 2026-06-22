import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiDownload, FiSearch, FiEye, FiPrinter, FiDollarSign, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api/axios';
import { formatCurrency, formatId, formatName, formatPaidDate } from '../../utils/format';

const PaymentsPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('All');
    const [dateRange, setDateRange] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setIsLoading(true);

                // Fetch users for collectedBy mapping
                let fetchedUsersMap = {};
                try {
                    const usersRes = await api.get('/users');
                    const usersList = usersRes.data?.users || usersRes.data || [];
                    usersList.forEach(u => {
                        fetchedUsersMap[u._id] = u.name || u.username || u.fullName || u.email;
                    });
                } catch (userErr) {
                    console.error('Failed to fetch users', userErr);
                }

                const loansResponse = await api.get('/loans');
                const loansData = loansResponse.data?.loans || loansResponse.data?.data || loansResponse.data;
                const loansList = Array.isArray(loansData) ? loansData : [];

                const promises = loansList.map(async (loan) => {
                    try {
                        const id = loan._id || loan.id;
                        const res = await api.get(`/loans/${id}/installments`);
                        const data = res.data?.data || res.data;
                        const insts = Array.isArray(data) ? data : (data?.installments || []);

                        let customerObj = loan.customer;
                        if (!customerObj && loan.customerId && typeof loan.customerId === 'object') {
                            customerObj = loan.customerId;
                        }
                        const cName = customerObj?.fullName || customerObj?.name || loan.customerName || 'Unknown';
                        const cPhone = customerObj?.phone || loan.phone || 'N/A';
                        const customerId = customerObj?._id || customerObj?.id || (typeof loan.customerId === 'string' ? loan.customerId : loan.customerId?._id || loan.customerId?.id);
                        const displayLoanId = loan._id ? `LOAN-${String(loan._id).slice(-6).toUpperCase()}` : (loan.id || id);

                        // Only return paid installments as 'payments'
                        return insts.filter(inst => inst.status === 'Paid').map(inst => {
                            const rawId = inst._id || inst.id;
                            const shortId = rawId ? `PAY-${String(rawId).slice(-6).toUpperCase()}` : `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                            const paidOn = inst.paidOn || null;
                            let collectorName = inst.collectedBy;
                            if (typeof collectorName === 'object' && collectorName !== null) {
                                collectorName = collectorName.name || collectorName.username || collectorName.fullName || collectorName._id;
                            } else if (fetchedUsersMap[collectorName]) {
                                collectorName = fetchedUsersMap[collectorName];
                            } else if (typeof collectorName === 'string' && collectorName.length === 24) {
                                collectorName = 'Staff'; // Fallback if backend fetch fails
                            }

                            return {
                                ...inst,
                                id: shortId,
                                rawId: rawId,
                                loanId: displayLoanId,
                                rawLoanId: id,
                                customerName: cName,
                                customerPhone: cPhone,
                                customerDisplayId: customerId,
                                paymentMethod: inst.paymentMode || inst.paymentMethod || 'Cash', // default
                                paidOn,
                                paymentDate: paidOn,
                                collectedBy: collectorName || 'System',
                            };
                        });
                    } catch (e) {
                        console.error(`Failed to fetch installments for loan ${loan._id || loan.id}`, e);
                        return [];
                    }
                });

                const results = await Promise.all(promises);
                const paidInstallments = results.flat().sort((a, b) => new Date(b.paidOn || 0) - new Date(a.paidOn || 0));
                setPayments(paidInstallments);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch payments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // Summary Calculations
    const summary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();

        const todayPayments = payments.filter(p => p.paymentDate && p.paymentDate.startsWith(today));
        const monthPayments = payments.filter(p => p.paymentDate && new Date(p.paymentDate).getMonth() === currentMonth);

        const todayTotal = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const monthTotal = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
            todayCollection: todayTotal,
            monthCollection: monthTotal,
            todayCount: todayPayments.length,
            monthCount: monthPayments.length
        };
    }, [payments]);

    const filteredPayments = useMemo(() => {
        let result = [...payments];

        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(p =>
                String(p.id || '').toLowerCase().includes(term) ||
                String(p.customerName || '').toLowerCase().includes(term) ||
                String(p.customerDisplayId || '').toLowerCase().includes(term) ||
                formatId(p.customerDisplayId).toLowerCase().includes(term) ||
                String(p.loanId || '').toLowerCase().includes(term)
            );
        }

        if (filterMethod !== 'All') {
            result = result.filter(p => p.paymentMethod === filterMethod);
        }

        if (dateRange) {
            const today = new Date().toISOString().split('T')[0];
            if (dateRange === 'Today') {
                result = result.filter(p => p.paymentDate && p.paymentDate.startsWith(today));
            }
            // Add more ranges as needed
        }

        return result;
    }, [payments, searchTerm, filterMethod, dateRange]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterMethod('All');
        setDateRange('');
    };

    const handleExport = () => {
        const rows = [
            ['Payment ID', 'Customer', 'Loan', 'EMI', 'Amount', 'Date', 'Method', 'Collected By'],
            ...filteredPayments.map((payment) => [
                payment.id,
                formatName(payment.customerName),
                payment.loanId,
                payment.emiNumber,
                payment.amount,
                formatPaidDate(payment.paidOn),
                payment.paymentMethod,
                formatName(payment.collectedBy),
            ]),
        ];
        const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'payments.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const columns = [
        { key: 'id', label: 'Payment ID', render: (r) => <span className="font-semibold text-sky-600 dark:text-sky-400">{r.id}</span> },
        { key: 'customerName', label: 'Customer', render: (r) => <span className="font-medium text-slate-900 dark:text-white">{formatName(r.customerName)}</span> },
        { key: 'customerId', label: 'Customer ID', render: (r) => <span className="text-slate-500 dark:text-slate-400">{formatId(r.customerDisplayId)}</span> },
        {
            key: 'loan', label: 'Loan / EMI', render: (r) => (
                <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{r.loanId}</p>
                    <p className="text-xs text-slate-500">EMI #{r.emiNumber}</p>
                </div>
            )
        },
        { key: 'amount', label: 'Amount', render: (r) => <span className="font-medium">{formatCurrency(r.amount)}</span> },
        { key: 'paymentDate', label: 'Date', render: (r) => formatPaidDate(r.paidOn) },
        {
            key: 'method', label: 'Method', render: (r) => {
                const colors = {
                    'Cash': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                    'UPI': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
                    'Bank Transfer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                };
                return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors[r.paymentMethod] || 'bg-slate-100 text-slate-700'}`}>{r.paymentMethod}</span>;
            }
        },
        { key: 'collectedBy', label: 'Collected By', render: (r) => <span className="text-sm text-slate-600 dark:text-slate-400">{formatName(r.collectedBy)}</span> },
        {
            key: 'actions',
            label: '',
            render: (r) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/payments/${r.id}`, { state: { payment: r, autoPrint: false } })} className="p-1.5 text-slate-400 hover:text-sky-600 transition" title="View Receipt">
                        <FiEye size={18} />
                    </button>
                    <button onClick={() => navigate(`/payments/${r.id}`, { state: { payment: r, autoPrint: true } })} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition" title="Print Receipt">
                        <FiPrinter size={18} />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader /></div>;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Payment Collection</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage EMI collections, track payment history and generate receipts.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" className="gap-2" onClick={handleExport}>
                        <FiDownload /> Export Payments
                    </Button>
                    <Button onClick={() => navigate('/payments/new')} className="gap-2">
                        <FiPlus /> Record Payment
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard title="Today's Collection" value={formatCurrency(summary.todayCollection)} icon={<FiDollarSign />} color="emerald" />
                <KpiCard title="This Month" value={formatCurrency(summary.monthCollection)} icon={<FiTrendingUp />} color="sky" />
                <KpiCard title="Payments Today" value={`${summary.todayCount} Payments`} icon={<FiCheckCircle />} color="purple" />
                <KpiCard title="Payments This Month" value={`${summary.monthCount} Payments`} icon={<FiCheckCircle />} color="amber" />
            </div>

            {/* Main Content */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                {/* Search & Filters */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1 max-w-md relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <FiSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Customer, Loan ID, or Payment ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            options={[
                                { value: 'All', label: 'All Methods' },
                                { value: 'Cash', label: 'Cash' },
                                { value: 'UPI', label: 'UPI' },
                                { value: 'Bank Transfer', label: 'Bank Transfer' }
                            ]}
                        />
                        <Select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            options={[
                                { value: '', label: 'All Dates' },
                                { value: 'Today', label: 'Paid Today' },
                                { value: 'This Week', label: 'This Week' },
                                { value: 'This Month', label: 'This Month' }
                            ]}
                        />
                        {(searchTerm || filterMethod !== 'All' || dateRange) && (
                            <Button variant="ghost" onClick={handleClearFilters} className="text-sm">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                {filteredPayments.length === 0 ? (
                    <EmptyState
                        title="No payments found"
                        description="Try adjusting your filters or search term."
                        action={<Button onClick={handleClearFilters}>Clear Filters</Button>}
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <Table columns={columns} data={filteredPayments} />
                        </div>

                        {/* Mobile Cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredPayments.map(payment => (
                                <div key={payment.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{formatName(payment.customerName)}</h3>
                                            <p className="text-sm text-slate-500">{payment.loanId} • EMI #{payment.emiNumber}</p>
                                        </div>
                                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                                            {payment.id}
                                        </span>
                                    </div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {payment.paymentMethod}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                                        <span>Date: {formatPaidDate(payment.paidOn)}</span>
                                        <span>By: {formatName(payment.collectedBy)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="flex-1 text-xs justify-center gap-1" onClick={() => navigate(`/payments/${payment.id}`, { state: { payment, autoPrint: false } })}>
                                            <FiEye /> View Receipt
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

function KpiCard({ title, value, icon, color }) {
    const colorStyles = {
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
        sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 border-sky-100 dark:border-sky-800/50',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800/50',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800/50',
    };

    return (
        <div className={`flex flex-col gap-3 rounded-2xl border p-4 ${colorStyles[color]} transition-transform hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">{title}</p>
                <div className="opacity-80">{icon}</div>
            </div>
            <h3 className="text-xl font-bold">{value}</h3>
        </div>
    );
}

export default PaymentsPage;
