import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Table from '../../components/common/Table';
import api from '../../services/api/axios';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

const EmiSchedulePage = () => {
    const params = useParams();
    const actualLoanId = params.loanId || params.id;
    const navigate = useNavigate();
    const location = useLocation();

    const passedState = location.state || {};

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setIsLoading(true);

                console.log("Loan ID Used:", actualLoanId);

                const response = await api.get(`/loans/${actualLoanId}/installments`);
                console.log("Installments Response:", response.data);

                const resData = response.data?.data || response.data;

                if (resData && Array.isArray(resData.installments)) {
                    setData({
                        totalInstallments: resData.totalInstallments || resData.installments.length,
                        paidInstallments: resData.paidInstallments || resData.installments.filter(i => i.status === 'Paid').length,
                        pendingInstallments: resData.pendingInstallments || resData.installments.filter(i => i.status === 'Pending').length,
                        overdueInstallments: resData.overdueInstallments || resData.installments.filter(i => i.status === 'Overdue').length,
                        installments: resData.installments
                    });
                    setError(null);
                } else if (Array.isArray(resData)) {
                    setData({
                        totalInstallments: resData.length,
                        paidInstallments: resData.filter(i => i.status === 'Paid').length,
                        pendingInstallments: resData.filter(i => i.status === 'Pending').length,
                        overdueInstallments: resData.filter(i => i.status === 'Overdue').length,
                        installments: resData
                    });
                    setError(null);
                } else {
                    if (passedState.schedule && passedState.schedule.length > 0) {
                        setData({
                            totalInstallments: passedState.stats?.totalEmis || passedState.schedule.length,
                            paidInstallments: passedState.stats?.paidEmis || passedState.schedule.filter(i => i.status === 'Paid').length,
                            pendingInstallments: passedState.stats?.pendingEmis || passedState.schedule.filter(i => i.status === 'Pending').length,
                            overdueInstallments: passedState.stats?.overdueEmis || passedState.schedule.filter(i => i.status === 'Overdue').length,
                            installments: passedState.schedule
                        });
                        setError(null);
                    } else {
                        setData(resData);
                    }
                }
            } catch (err) {
                console.error("API Error:", err);

                if (passedState.schedule && passedState.schedule.length > 0) {
                    setData({
                        totalInstallments: passedState.stats?.totalEmis || passedState.schedule.length,
                        paidInstallments: passedState.stats?.paidEmis || passedState.schedule.filter(i => i.status === 'Paid').length,
                        pendingInstallments: passedState.stats?.pendingEmis || passedState.schedule.filter(i => i.status === 'Pending').length,
                        overdueInstallments: passedState.stats?.overdueEmis || passedState.schedule.filter(i => i.status === 'Overdue').length,
                        installments: passedState.schedule
                    });
                    setError(null);
                } else {
                    setError(err.response?.data?.message || err.message || 'Failed to load EMI schedule');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (actualLoanId) {
            fetchSchedule();
        }
    }, [actualLoanId, passedState.schedule, passedState.stats]);

    if (isLoading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader /></div>;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    if (!data) return null;

    const installments = data.installments || [];

    const columns = [
        { key: 'emiNumber', label: 'EMI No.', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">#{row.emiNumber}</span> },
        { key: 'dueDate', label: 'Due Date', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-' },
        { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(row.amount)}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge variant={row.status === 'Paid' ? 'success' : row.status === 'Overdue' ? 'warning' : 'primary'}>
                    {row.status}
                </Badge>
            )
        },
        { key: 'paidDate', label: 'Paid Date', render: (row) => row.paidDate ? new Date(row.paidDate).toLocaleDateString() : '-' },
        { key: 'collectedBy', label: 'Collected By', render: (row) => row.collectedBy || '-' }
    ];

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">EMI Installments</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Schedule for Loan: <span className="font-medium text-slate-700 dark:text-slate-300">{actualLoanId ? actualLoanId.slice(-6).toUpperCase() : ''}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard title="Total Installments" value={data.totalInstallments || 0} icon={<FiClock className="text-sky-500" />} color="sky" />
                <StatCard title="Paid Installments" value={data.paidInstallments || 0} icon={<FiCheckCircle className="text-emerald-500" />} color="emerald" />
                <StatCard title="Pending Installments" value={data.pendingInstallments || 0} icon={<FiAlertCircle className="text-amber-500" />} color="amber" />
                <StatCard title="Overdue Installments" value={data.overdueInstallments || 0} icon={<FiXCircle className="text-red-500" />} color="red" />
            </div>

            {/* Data Table / Mobile Cards */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Installment Records</h2>

                {installments.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table columns={columns} data={installments} />
                        </div>
                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {installments.map((inst, idx) => (
                                <div key={inst._id || inst.id || idx} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-semibold text-slate-900 dark:text-white">EMI #{inst.emiNumber}</span>
                                        <Badge variant={inst.status === 'Paid' ? 'success' : inst.status === 'Overdue' ? 'warning' : 'primary'}>
                                            {inst.status}
                                        </Badge>
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(inst.amount)}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">Due Date</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">Paid Date</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{inst.paidDate ? new Date(inst.paidDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                        <div className="col-span-2 mt-1">
                                            <p className="text-slate-500 dark:text-slate-400">Collected By</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{inst.collectedBy || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                        <FiClock className="mb-4 text-slate-300" size={48} />
                        <p>No installments found for this loan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

function StatCard({ title, value, icon, color }) {
    const colors = { sky: 'text-sky-600 dark:text-sky-400', emerald: 'text-emerald-600 dark:text-emerald-400', amber: 'text-amber-600 dark:text-amber-400', red: 'text-red-600 dark:text-red-400' };
    return <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-700/90 dark:bg-slate-900"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">{icon}</div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p></div><h3 className={`mt-2 text-2xl font-bold ${colors[color] || 'text-slate-900 dark:text-white'}`}>{value}</h3></div>;
}

export default EmiSchedulePage;