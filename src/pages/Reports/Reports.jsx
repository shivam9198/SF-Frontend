import React, { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiCreditCard, FiBriefcase, FiCalendar, FiUsers, FiAward } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Table from '../../components/common/Table';
import { reportService } from '../../services/api/reportService';
import { formatCurrency } from '../../utils/format';
import CollectionChart from './components/CollectionChart';
import PaymentDonut from './components/PaymentDonut';

const ReportSection = ({ title, icon: Icon, children }) => (
    <section className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {children}
    </section>
);

const StatCard = ({ label, value, type = 'number', highlight = false }) => (
    <div className={`rounded-xl p-5 ${highlight ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
        <p className={`text-sm font-medium ${highlight ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>{label}</p>
        <p className={`mt-2 text-2xl font-bold ${highlight ? 'text-sky-700 dark:text-sky-300' : 'text-slate-900 dark:text-white'}`}>
            {type === 'currency' ? formatCurrency(value) : value}
        </p>
    </div>
);

const ReportsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [
                collection, 
                loan, 
                emi, 
                customer, 
                staff,
                collectionAnalytics,
                paymentAnalytics
            ] = await Promise.all([
                reportService.getCollectionReport(),
                reportService.getLoanReport(),
                reportService.getEmiReport(),
                reportService.getCustomerReport(),
                reportService.getStaffReport(),
                reportService.getCollectionAnalytics(),
                reportService.getPaymentAnalytics()
            ]);

            setData({
                collection,
                loan,
                emi,
                customer,
                staff,
                collectionAnalytics,
                paymentAnalytics
            });
        } catch (err) {
            setError(err.message || 'Failed to load reports.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const exportReport = () => {
        window.print();
    };

    if (error) {
        return <ErrorState message={error} onRetry={fetchData} />;
    }

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader /></div>;
    }

    const staffColumns = [
        { key: 'name', label: 'Staff Name' },
        { key: 'collectedEmis', label: 'EMIs Collected' },
        { key: 'collectionAmount', label: 'Collection Amount', render: (row) => formatCurrency(row.collectionAmount) },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
                    <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                        Real-time system data reporting and analytics.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" className="gap-2" onClick={exportReport}>
                        <FiFileText /> Export PDF
                    </Button>
                </div>
            </div>

            {/* 1. Collection Report */}
            <ReportSection title="1. Collection Report" icon={FiCreditCard}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <StatCard label="Today's Collection" value={data.collection.today} type="currency" />
                    <StatCard label="This Week Collection" value={data.collection.thisWeek} type="currency" />
                    <StatCard label="This Month Collection" value={data.collection.thisMonth} type="currency" highlight />
                    <StatCard label="Total Collection" value={data.collection.total} type="currency" />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <CollectionChart data={data.collectionAnalytics} />
                    </div>
                    <div>
                        <PaymentDonut data={data.paymentAnalytics} />
                    </div>
                </div>
            </ReportSection>

            {/* 2. Loan Report */}
            <ReportSection title="2. Loan Report" icon={FiBriefcase}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Total Loans" value={data.loan.totalLoans} />
                    <StatCard label="Active Loans" value={data.loan.activeLoans} />
                    <StatCard label="Closed Loans" value={data.loan.closedLoans} />
                    <StatCard label="Total Loan Amount" value={data.loan.totalLoanAmount} type="currency" />
                    <StatCard label="Outstanding Amount" value={data.loan.outstandingAmount} type="currency" highlight />
                </div>
            </ReportSection>

            {/* 3. EMI Report */}
            <ReportSection title="3. EMI Report" icon={FiCalendar}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total EMIs" value={data.emi.totalEmis} />
                    <StatCard label="Paid EMIs" value={data.emi.paidEmis} />
                    <StatCard label="Pending EMIs" value={data.emi.pendingEmis} />
                    <StatCard label="Overdue EMIs" value={data.emi.overdueEmis} highlight />
                </div>
            </ReportSection>

            {/* 4. Customer Report */}
            <ReportSection title="4. Customer Report" icon={FiUsers}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard label="Total Customers" value={data.customer.totalCustomers} />
                    <StatCard label="Customers With Active Loans" value={data.customer.customersWithActiveLoans} />
                    <StatCard label="Customers With Overdue EMIs" value={data.customer.customersWithOverdueEmis} highlight />
                </div>
            </ReportSection>

            {/* 5. Staff Collection Report */}
            <ReportSection title="5. Staff Collection Report" icon={FiAward}>
                <div className="mb-6">
                    <StatCard label="Total Staff Members" value={data.staff.totalStaff} />
                </div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Staff Collection Performance</h3>
                {data.staff.staffStats.length > 0 ? (
                    <Table columns={staffColumns} data={data.staff.staffStats} className="rounded-2xl" />
                ) : (
                    <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500 dark:bg-slate-800/50">
                        No staff collection data found.
                    </div>
                )}
            </ReportSection>
        </div>
    );
};

export default ReportsPage;
