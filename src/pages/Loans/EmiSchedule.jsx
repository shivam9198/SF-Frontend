import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import api from '../../services/api/axios';
import { formatCurrency, formatDate, formatName, formatPaidDate } from '../../utils/format';

const EmiSchedulePage = () => {
    const params = useParams();
    const actualLoanId = params.loanId || params.id;
    const navigate = useNavigate();
    const location = useLocation();

    const passedState = location.state || {};

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [staffMap, setStaffMap] = useState({});

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setIsLoading(true);

                // Fetch staff/users to resolve collectedBy ObjectIDs
                let fetchedStaffMap = {};
                try {
                    const usersRes = await api.get('/users');
                    const usersList = usersRes.data?.users || usersRes.data || [];
                    usersList.forEach(u => {
                        fetchedStaffMap[u._id] = u.name || u.username || u.fullName || u.email;
                    });
                } catch (e) {
                    try {
                        const staffRes = await api.get('/staff');
                        const staffList = staffRes.data?.staff || staffRes.data || [];
                        staffList.forEach(s => {
                            fetchedStaffMap[s._id] = s.name || s.username || s.fullName || s.email;
                        });
                    } catch (err) {
                        console.error('Failed to fetch staff list', err);
                    }
                }
                setStaffMap(fetchedStaffMap);

                const response = await api.get(`/loans/${actualLoanId}/installments`);
                
                let installmentsArray = [];
                const resData = response.data?.data || response.data;
                
                if (resData && Array.isArray(resData.installments)) {
                    installmentsArray = resData.installments;
                } else if (Array.isArray(resData)) {
                    installmentsArray = resData;
                } else if (resData && typeof resData === 'object') {
                    // Try to find any array property
                    const arrayProp = Object.values(resData).find(val => Array.isArray(val));
                    if (arrayProp) installmentsArray = arrayProp;
                }

                if (installmentsArray.length > 0) {
                    setData({
                        totalInstallments: installmentsArray.length,
                        paidInstallments: installmentsArray.filter(i => i.status === 'Paid').length,
                        pendingInstallments: installmentsArray.filter(i => i.status === 'Pending').length,
                        overdueInstallments: installmentsArray.filter(i => i.status === 'Overdue').length,
                        installments: installmentsArray.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate) || (a.emiNumber || 0) - (b.emiNumber || 0))
                    });
                    setError(null);
                } else if (passedState.schedule && passedState.schedule.length > 0) {
                    setData({
                        totalInstallments: passedState.schedule.length,
                        paidInstallments: passedState.schedule.filter(i => i.status === 'Paid').length,
                        pendingInstallments: passedState.schedule.filter(i => i.status === 'Pending').length,
                        overdueInstallments: passedState.schedule.filter(i => i.status === 'Overdue').length,
                        installments: passedState.schedule
                    });
                    setError(null);
                } else {
                    setData({ installments: [] });
                }
            } catch (err) {
                console.error("API Error:", err);
                if (passedState.schedule && passedState.schedule.length > 0) {
                    setData({
                        totalInstallments: passedState.schedule.length,
                        paidInstallments: passedState.schedule.filter(i => i.status === 'Paid').length,
                        pendingInstallments: passedState.schedule.filter(i => i.status === 'Pending').length,
                        overdueInstallments: passedState.schedule.filter(i => i.status === 'Overdue').length,
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
    }, [actualLoanId, passedState.schedule]);

    const stats = useMemo(() => {
        if (!data || !data.installments) return null;
        
        const totalAmount = data.installments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const paidAmount = data.installments.filter(i => i.status === 'Paid').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const outstandingBalance = data.installments.filter(i => i.status !== 'Paid').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        
        const remainingCount = data.totalInstallments - data.paidInstallments;
        const progressPercent = data.totalInstallments > 0 ? Math.round((data.paidInstallments / data.totalInstallments) * 100) : 0;
        
        return {
            totalAmount,
            paidAmount,
            outstandingBalance,
            remainingCount,
            progressPercent
        };
    }, [data]);

    if (isLoading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader /></div>;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    if (!data) return null;

    const installments = data.installments || [];

    const getCollectedByName = (collectedBy) => {
        if (!collectedBy) return '-';
        if (typeof collectedBy === 'object') return formatName(collectedBy);
        return formatName(staffMap[collectedBy] || collectedBy);
    };

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
                <StatCard title="Total EMI" value={data.totalInstallments || 0} icon={<FiClock className="text-sky-500" />} color="sky" />
                <StatCard title="Paid EMI" value={data.paidInstallments || 0} icon={<FiCheckCircle className="text-emerald-500" />} color="emerald" />
                <StatCard title="Pending EMI" value={data.pendingInstallments || 0} icon={<FiAlertCircle className="text-amber-500" />} color="amber" />
                <StatCard title="Overdue EMI" value={data.overdueInstallments || 0} icon={<FiXCircle className="text-red-500" />} color="red" />
            </div>

            {/* Progress and Financial Summary */}
            {stats && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                    <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Payment Progress</h2>
                    
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                        <span className="text-slate-700 dark:text-slate-300">{data.paidInstallments} / {data.totalInstallments} Paid</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{stats.progressPercent}% Completed</span>
                    </div>
                    
                    <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div 
                            style={{ width: `${stats.progressPercent}%` }} 
                            className="h-full bg-emerald-500 transition-all duration-500"
                        ></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Remaining EMI Count</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.remainingCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Remaining Amount</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(stats.outstandingBalance)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding Balance</p>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(stats.outstandingBalance)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Installment Records</h2>

                {installments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-4 font-medium">EMI No.</th>
                                    <th className="px-4 py-4 font-medium">Due Date</th>
                                    <th className="px-4 py-4 font-medium">EMI Amount</th>
                                    <th className="px-4 py-4 font-medium">Status</th>
                                    <th className="px-4 py-4 font-medium">Paid Date</th>
                                    <th className="px-4 py-4 font-medium">Collected By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {installments.map((row, idx) => {
                                    // Row highlights
                                    let rowClass = "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50";
                                    if (row.status === 'Paid') {
                                        rowClass = "bg-emerald-50/30 hover:bg-emerald-50/60 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20";
                                    } else if (row.status === 'Overdue') {
                                        rowClass = "bg-red-50/50 hover:bg-red-50/80 dark:bg-red-900/10 dark:hover:bg-red-900/20";
                                    }

                                    const customBadgeClass = 
                                        row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                                        row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                                        row.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : '';

                                    return (
                                        <tr key={row._id || row.id || idx} className={rowClass}>
                                            <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">#{row.emiNumber}</td>
                                            <td className="px-4 py-4">{formatDate(row.dueDate)}</td>
                                            <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{formatCurrency(row.amount)}</td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${customBadgeClass || 'bg-slate-100 text-slate-700'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {row.status === 'Paid' ? formatPaidDate(row.paidOn) : '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                {row.status === 'Paid' ? getCollectedByName(row.collectedBy) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
