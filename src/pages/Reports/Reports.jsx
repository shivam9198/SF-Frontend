import React, { useState, useEffect } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Table from '../../components/common/Table';
import { reportService } from '../../services/api/reportService';
import KpiSection from './components/KpiSection';
import CollectionChart from './components/CollectionChart';
import PaymentDonut from './components/PaymentDonut';
import TopCustomers from './components/TopCustomers';
import { formatCurrency, formatDate } from '../../utils/format';

const ReportsPage = () => {
    const [dateFilter, setDateFilter] = useState('This Month');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [overview, collection, payment, topCustomers, recentCollections, pendingPayments] = await Promise.all([
                reportService.getAnalyticsOverview(dateFilter),
                reportService.getCollectionAnalytics(dateFilter),
                reportService.getPaymentAnalytics(dateFilter),
                reportService.getTopCustomers(dateFilter),
                reportService.getRecentCollections(dateFilter),
                reportService.getPendingPayments()
            ]);

            setData({
                overview,
                collection,
                payment,
                topCustomers,
                recentCollections,
                pendingPayments
            });
        } catch (err) {
            setError(err.message || 'Failed to load reports.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateFilter]);

    const exportReport = (type) => {
        if (!data) return;
        if (type === 'pdf') {
            window.print();
            return;
        }

        const rows = [
            ['Report', dateFilter],
            ['Total Collection', formatCurrency(data.overview.totalCollection)],
            ['Active Customers', data.overview.activeCustomers],
            ['Active Loans', data.overview.activeLoans],
            ['Total Pending Amount', formatCurrency(data.overview.outstandingAmount)],
        ];

        const csv = rows.map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sfurti-report-excel.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    if (error) {
        return <ErrorState message={error} onRetry={fetchData} />;
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
                    <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                        Simple view of collections, customers, loans and pending payments.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-40">
                        <Select 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            options={[
                                { value: 'Today', label: 'Today' },
                                { value: 'This Week', label: 'This Week' },
                                { value: 'This Month', label: 'This Month' },
                                { value: 'This Year', label: 'This Year' },
                                { value: 'All Time', label: 'All Time' },
                            ]}
                        />
                    </div>
                    <Button variant="secondary" className="gap-2" onClick={() => exportReport('pdf')}>
                        <FiFileText /> Export PDF
                    </Button>
                    <Button variant="secondary" className="gap-2" onClick={() => exportReport('excel')}>
                        <FiDownload /> Export Excel
                    </Button>
                </div>
            </div>

            {/* Content Skeletons or Data */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center"><Loader /></div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Top KPI Section */}
                    <KpiSection data={data.overview} />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <CollectionChart data={data.collection} />
                            <RecentCollections data={data.recentCollections} />
                        </div>

                        <div className="space-y-6">
                            <PaymentDonut data={data.payment} />
                            <TopCustomers data={data.topCustomers} />
                        </div>
                    </div>

                    <PendingPayments data={data.pendingPayments} />
                </div>
            ) : (
                <div className="flex h-64 items-center justify-center text-slate-500">No reports available</div>
            )}
        </div>
    );
};

function RecentCollections({ data }) {
    const columns = [
        { key: 'customerName', label: 'Customer Name' },
        { key: 'loanId', label: 'Loan' },
        { key: 'emiNumber', label: 'EMI' },
        { key: 'amount', label: 'Amount', render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.amount)}</span> },
        { key: 'paymentDate', label: 'Payment Date', render: (row) => formatDate(row.paymentDate) },
        { key: 'paymentMethod', label: 'Method' },
    ];

    return (
        <section>
            <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Recent Collections</h2>
            {data.length > 0 ? (
                <Table columns={columns} data={data} className="rounded-2xl" />
            ) : (
                <EmptyBlock message="No collections found for this period." />
            )}
        </section>
    );
}

function PendingPayments({ data }) {
    const columns = [
        { key: 'customerName', label: 'Customer Name' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'loanId', label: 'Loan' },
        { key: 'amount', label: 'EMI Amount', render: (row) => formatCurrency(row.amount) },
        { key: 'dueDate', label: 'Due Date', render: (row) => formatDate(row.dueDate) },
        { key: 'status', label: 'Status', render: (row) => (
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${row.status === 'Overdue' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                {row.status}
            </span>
        )},
    ];

    return (
        <section>
            <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Pending Payments</h2>
            {data.length > 0 ? (
                <Table columns={columns} data={data} className="rounded-2xl" />
            ) : (
                <EmptyBlock message="No pending payments found." />
            )}
        </section>
    );
}

function EmptyBlock({ message }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-base font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {message}
        </div>
    );
}

export default ReportsPage;
