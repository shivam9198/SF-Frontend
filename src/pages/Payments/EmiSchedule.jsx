import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiDownload, FiCreditCard, FiEye, FiList, FiCalendar } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api/axios';
import EmiCalendar from './components/EmiCalendar';
import { formatCurrency, formatId, formatName, formatPaidDate } from '../../utils/format';

const EmiSchedulePage = () => {
    const params = useParams();
    const { loanId } = params;
    const navigate = useNavigate();

    const [loan, setLoan] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'


    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [dateRange, setDateRange] = useState('');

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setIsLoading(true);
                let installmentsArray = [];

                if (loanId) {
                    const apiUrl = `/loans/${loanId}/installments`;
                    const loanUrl = `/loans/${loanId}`;

                    const [installmentsRes, loanRes] = await Promise.all([
                        api.get(apiUrl),
                        api.get(loanUrl)
                    ]);

                    const resData = installmentsRes.data?.data || installmentsRes.data;

                    if (resData && Array.isArray(resData.installments)) {
                        installmentsArray = resData.installments;
                    } else if (Array.isArray(resData)) {
                        installmentsArray = resData;
                    } else if (resData && typeof resData === 'object') {
                        const arrayProp = Object.values(resData).find(val => Array.isArray(val));
                        if (arrayProp) installmentsArray = arrayProp;
                    }

                    const loanData = loanRes.data?.data?.loan || loanRes.data?.loan || loanRes.data?.data || loanRes.data;

                    setLoan({
                        id: loanId,
                        customerName: loanData?.customer?.fullName || loanData?.customerName || 'Customer',
                        emiPlan: loanData?.emiPlan || loanData?.months,
                        monthlyEmi: loanData?.monthlyEmi
                    });
                } else {
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
                            const customerId = customerObj?._id || customerObj?.id || (typeof loan.customerId === 'string' ? loan.customerId : loan.customerId?._id || loan.customerId?.id);
                            const displayLoanId = loan._id ? `LOAN-${String(loan._id).slice(-6).toUpperCase()}` : (loan.id || id);

                            return insts.map(inst => ({
                                ...inst,
                                loanId: displayLoanId,
                                rawLoanId: id,
                                customerId,
                                customerName: cName
                            }));
                        } catch (e) {
                            console.error(`Failed to fetch installments for loan ${loan._id || loan.id}`, e);
                            return [];
                        }
                    });

                    const results = await Promise.all(promises);
                    installmentsArray = results.flat();

                    setLoan(null);
                }

                setSchedule(installmentsArray.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate) || (a.emiNumber || 0) - (b.emiNumber || 0)));
                setError(null);
            } catch (err) {
                console.error("API Error:", err);
                setError(err.response?.data?.message || err.message || 'Unable to load data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [loanId]);

    // Apply Filters
    const filteredSchedule = useMemo(() => {
        let result = [...schedule];

        // Search by EMI Number or Customer/Loan ID for global
        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(e =>
                e.emiNumber?.toString().includes(term) ||
                (e.customerName && e.customerName.toLowerCase().includes(term)) ||
                (e.loanId && e.loanId.toLowerCase().includes(term))
            );
        }

        // Filter by Status
        if (filterStatus !== 'All') {
            result = result.filter(e => e.status === filterStatus);
        }

        if (dateRange) {
            const currentMonth = new Date().getMonth();
            if (dateRange === 'This Month') {
                result = result.filter(e => new Date(e.dueDate).getMonth() === currentMonth);
            }
            // Add more ranges if needed
        }

        return result;
    }, [schedule, searchTerm, filterStatus, dateRange]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('All');
        setDateRange('');
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader /></div>;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    const columns = [
        ...(loanId ? [] : [
            { key: 'loanId', label: 'Loan ID', render: (r) => <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{r.loanId}</span> },
            { key: 'customerName', label: 'Customer', render: (r) => <span className="text-sm">{formatName(r.customerName)}</span> },
            { key: 'customerId', label: 'Customer ID', render: (r) => <span className="text-sm text-slate-500 dark:text-slate-400">{formatId(r.customerId)}</span> },
        ]),
        { key: 'emiNumber', label: 'EMI No.', render: (r) => <span className="font-semibold text-sky-600 dark:text-sky-400">#{r.emiNumber}</span> },
        { key: 'dueDate', label: 'Due Date', render: (r) => new Date(r.dueDate).toLocaleDateString() },
        { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
        {
            key: 'status',
            label: 'Status',
            render: (r) => {
                const colorMap = {
                    Paid: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200',
                    Pending: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-200',
                    Overdue: 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-200'
                };
                return (
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorMap[r.status] || colorMap.Pending}`}>
                        {r.status}
                    </span>
                );
            }
        },
        { key: 'paidDate', label: 'Paid Date', render: (r) => formatPaidDate(r.paidOn) },
        { key: 'collectedBy', label: 'Collected By', render: (r) => formatName(r.collectedBy) },
        {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/loans/${r.rawLoanId}`)} className="p-1.5 text-slate-400 hover:text-sky-600 transition" title="View Details">
                        <FiEye size={18} />
                    </button>
                    {loanId && r.status !== 'Paid' && (
                        <button onClick={() => navigate('/payments/new')} className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Record Payment">
                            <FiCreditCard size={18} />
                        </button>
                    )}
                    {r.status === 'Paid' && (
                        <button onClick={() => handleViewReceipt(r)} className="p-1.5 text-slate-400 hover:text-purple-600 transition" title="Download Receipt">
                            <FiDownload size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const handleViewReceipt = (emi) => {
        const payment = {
            id: `PAY-${String(emi._id).slice(-6).toUpperCase()}`,
            rawId: emi._id,
            loanId: emi.loanId,
            rawLoanId: emi.rawLoanId,
            customerName: emi.customerName,
            amount: emi.amount,
            paymentMethod: emi.paymentMethod || 'N/A',
            paidOn: emi.paidOn,
            paymentDate: emi.paidOn,
            emiNumber: emi.emiNumber,
            referenceNumber: emi.referenceNumber || 'N/A',
            collectedBy: emi.collectedBy || 'N/A',
            notes: emi.notes || ''
        };
        navigate(`/payments/${payment.id}`, { state: { payment } });
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {loanId && (
                        <button
                            onClick={() => navigate(`/loans/${loanId}`)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                            {loanId ? 'EMI Schedule' : 'Global EMI Schedule'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {loanId ? `Loan ID: ${loanId.slice(-6).toUpperCase()}` : 'Viewing all EMI schedules across all loans.'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition ${viewMode === 'list' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            <FiList /> List
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition ${viewMode === 'calendar' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            <FiCalendar /> Calendar
                        </button>
                    </div>
                    <Button variant="secondary" className="gap-2">
                        <FiDownload /> Export Schedule
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'calendar' ? (
                <EmiCalendar schedule={filteredSchedule} />
            ) : (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                    {/* Search & Filter Bar */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1 max-w-sm">
                            <Input
                                placeholder="Search EMI Number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={[
                                    { value: 'All', label: 'All Status' },
                                    { value: 'Paid', label: 'Paid' },
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'Overdue', label: 'Overdue' }
                                ]}
                            />
                            <Select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                options={[
                                    { value: '', label: 'All Dates' },
                                    { value: 'This Month', label: 'This Month' },
                                    { value: 'Next Month', label: 'Next Month' }
                                ]}
                            />
                            {(searchTerm || filterStatus !== 'All' || dateRange) && (
                                <Button variant="ghost" onClick={handleClearFilters} className="text-sm">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Table Area */}
                    {filteredSchedule.length === 0 ? (
                        <EmptyState
                            title="No EMI records found"
                            description="Try adjusting your filters or date range."
                            action={<Button onClick={handleClearFilters}>Clear Filters</Button>}
                        />
                    ) : (
                        <>
                            <div className="hidden md:block">
                                <Table columns={columns} data={filteredSchedule} />
                            </div>

                            {/* Mobile Cards View */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {filteredSchedule.map(emi => {
                                    const colorMap = {
                                        Paid: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200',
                                        Pending: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-200',
                                        Overdue: 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-200'
                                    };
                                    return (
                                        <div key={emi.emiNumber || Math.random()} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">EMI #{emi.emiNumber}</h3>
                                                    <p className="text-sm text-slate-500">Due: {new Date(emi.dueDate).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorMap[emi.status] || colorMap.Pending}`}>
                                                    {emi.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 space-y-1">
                                                <p className="font-medium text-slate-900 dark:text-white text-lg">{formatCurrency(emi.amount)}</p>
                                                {emi.status === 'Paid' ? (
                                                    <p>Paid on: {formatPaidDate(emi.paidOn)} by {formatName(emi.collectedBy)}</p>
                                                ) : (
                                                    <p className="text-slate-400 italic">Not paid yet</p>
                                                )}
                                            </div>
                                            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                                                <Button onClick={() => navigate(`/loans/${emi.rawLoanId}`)} variant="ghost" className="px-3 py-1">View Details</Button>
                                                {loanId && emi.status !== 'Paid' && (
                                                    <Button onClick={() => navigate('/payments/new')} variant="primary" className="px-3 py-1 text-xs">Record Payment</Button>
                                                )}
                                                {emi.status === 'Paid' && (
                                                    <Button onClick={() => handleViewReceipt(emi)} variant="secondary" className="px-3 py-1 text-xs gap-1">
                                                        <FiDownload /> Receipt
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmiSchedulePage;
