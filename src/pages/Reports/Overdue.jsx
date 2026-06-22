import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiDownload, FiPhoneCall, FiCalendar, FiUsers, FiEye, FiCreditCard, FiFileText } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { overdueService } from '../../services/api/overdueService';
import { formatCurrency, formatDate, formatName } from '../../utils/format';

const OverduePage = () => {
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const accData = await overdueService.getOverdueAccounts();
                setAccounts(accData);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch overdue data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredAccounts = useMemo(() => {
        let result = [...accounts];

        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(a =>
                (a.customerName && a.customerName.toLowerCase().includes(term)) ||
                (a.phone && a.phone.toLowerCase().includes(term)) ||
                (a.loanId && a.loanId.toLowerCase().includes(term)) ||
                (a.customerId && a.customerId.toLowerCase().includes(term))
            );
        }

        return result.sort((a, b) => b.daysOverdue - a.daysOverdue);
    }, [accounts, searchTerm]);

    const summary = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);

        return accounts.reduce((acc, account) => {
            const dueDate = new Date(account.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            acc.pendingAmount += account.amount;
            if (dueDate.getTime() === today.getTime()) acc.dueToday += 1;
            if (dueDate >= today && dueDate <= weekEnd) acc.dueThisWeek += 1;
            return acc;
        }, {
            totalCustomers: accounts.length,
            pendingAmount: 0,
            dueToday: 0,
            dueThisWeek: 0,
        });
    }, [accounts]);

    const handleClearFilters = () => {
        setSearchTerm('');
    };

    const handleExport = () => {
        const rows = [
            ['Customer Name', 'Phone Number', 'Loan', 'EMI Amount', 'Due Date', 'Days Late', 'Outstanding Amount'],
            ...filteredAccounts.map((account) => [
                formatName(account.customerName),
                account.phone,
                account.loanId,
                account.amount,
                account.dueDate,
                account.daysOverdue,
                account.outstandingAmount || account.amount,
            ]),
        ];
        const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'overdue-list.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const columns = [
        {
            key: 'customerName', label: 'Customer Name', render: (r) => (
                <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{formatName(r.customerName)}</p>
                    <p className="text-sm text-slate-500">{r.loanId} • EMI {r.emiNumber}</p>
                </div>
            )
        },
        {
            key: 'phone', label: 'Phone Number', render: (r) => (
                <a href={`tel:${r.phone}`} className="text-base font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
                    {r.phone}
                </a>
            )
        },
        {
            key: 'amount', label: 'EMI Amount', render: (r) => (
                <span className="text-base font-semibold text-slate-900 dark:text-white">{formatCurrency(r.amount)}</span>
            )
        },
        { key: 'dueDate', label: 'Due Date', render: (r) => formatDate(r.dueDate) },
        {
            key: 'daysOverdue', label: 'Days Late', render: (r) => (
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">{r.daysOverdue} days</span>
            )
        },
        {
            key: 'outstandingAmount', label: 'Outstanding Amount', render: (r) => (
                <span className="text-base font-bold text-red-600 dark:text-red-400">{formatCurrency(r.outstandingAmount || r.amount)}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
                <div className="flex min-w-[260px] flex-wrap items-center gap-2">
                    <ActionButton onClick={() => window.location.href = `tel:${r.phone}`} title="Call Customer" icon={<FiPhoneCall />} tone="emerald" />
                    <ActionButton onClick={() => navigate(`/customers/${r.customerId}`)} title="View Customer" icon={<FiEye />} />
                    <ActionButton onClick={() => navigate(`/loans/${r.rawLoanId}`)} title="View Loan" icon={<FiFileText />} />
                    <ActionButton onClick={() => navigate('/payments/new')} title="Record Payment" icon={<FiCreditCard />} tone="sky" />
                </div>
            )
        }
    ];

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader /></div>;
    if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Overdue EMI Tracker</h1>
                    <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                        Find customers with pending EMI and collect payments quickly.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="gap-2" onClick={handleExport}>
                        <FiDownload /> Export List
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard title="Total Overdue Customers" value={summary.totalCustomers} icon={<FiUsers />} color="amber" />
                <KpiCard title="Total Pending Amount" value={formatCurrency(summary.pendingAmount)} icon={<FiCreditCard />} color="red" />
                <KpiCard title="Due Today" value={summary.dueToday} icon={<FiCalendar />} color="sky" />
                <KpiCard title="Due This Week" value={summary.dueThisWeek} icon={<FiCalendar />} color="emerald" />
            </div>

            {/* Main Content */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">

                {/* Search & Filters */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-lg">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <FiSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Search customer, phone or loan number"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </div>
                    {searchTerm && (
                        <Button variant="ghost" onClick={handleClearFilters} className="text-base">
                            Clear Search
                        </Button>
                    )}
                </div>

                {/* Table */}
                {filteredAccounts.length === 0 ? (
                    <EmptyState
                        title="No overdue EMI found"
                        description={searchTerm ? "Try another customer name, phone number or loan number." : "All EMI payments are up to date."}
                        action={searchTerm ? <Button onClick={handleClearFilters}>Clear Search</Button> : null}
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <Table columns={columns} data={filteredAccounts} />
                        </div>

                        {/* Mobile Cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredAccounts.map(acc => (
                                <div key={acc.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{formatName(acc.customerName)}</h3>
                                            <a href={`tel:${acc.phone}`} className="text-base font-semibold text-emerald-700 dark:text-emerald-400">{acc.phone}</a>
                                        </div>
                                        <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                            {acc.daysOverdue} days late
                                        </span>
                                    </div>
                                    <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                                        <Info label="EMI Amount" value={formatCurrency(acc.amount)} />
                                        <Info label="Due Date" value={formatDate(acc.dueDate)} />
                                        <Info label="Outstanding" value={formatCurrency(acc.outstandingAmount || acc.amount)} danger />
                                        <Info label="Loan" value={acc.loanId} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button className="text-sm justify-center gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = `tel:${acc.phone}`}>
                                            <FiPhoneCall /> Call
                                        </Button>
                                        <Button variant="secondary" className="text-sm justify-center gap-2" onClick={() => navigate('/payments/new')}>
                                            <FiCreditCard /> Payment
                                        </Button>
                                        <Button variant="secondary" className="text-sm justify-center gap-2" onClick={() => navigate(`/customers/${acc.customerId}`)}>Customer</Button>
                                        <Button variant="secondary" className="text-sm justify-center gap-2" onClick={() => navigate(`/loans/${acc.rawLoanId}`)}>Loan</Button>
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
    };

    return (
        <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${colorStyles[color]}`}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold opacity-80" title={title}>{title}</p>
                <div className="text-2xl opacity-80">{icon}</div>
            </div>
            <h3 className="text-3xl font-bold">{value}</h3>
        </div>
    );
}

function ActionButton({ title, icon, onClick, tone = 'slate' }) {
    const tones = {
        emerald: 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30',
        sky: 'text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/30',
        slate: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
    };

    return (
        <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${tones[tone]}`} title={title}>
            {icon}
            <span>{title}</span>
        </button>
    );
}

function Info({ label, value, danger = false }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`mt-1 text-base font-bold ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{value}</p>
        </div>
    );
}

export default OverduePage;
