import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiChevronRight, FiFilter, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import api from '../../services/api/axios';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

function LoansPage() {
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/loans');
                const rawLoans = response.data.loans || response.data;
                const processedLoans = await Promise.all((Array.isArray(rawLoans) ? rawLoans : []).map(async loan => {
                    let customerObj = loan.customer;
                    if (!customerObj && loan.customerId && typeof loan.customerId === 'object') {
                        customerObj = loan.customerId;
                    }

                    let realInstallments = [];
                    try {
                        const instRes = await api.get(`/loans/${loan._id || loan.id}/installments`);
                        const resData = instRes.data?.data || instRes.data;
                        realInstallments = Array.isArray(resData) ? resData : (resData?.installments || []);
                    } catch (e) {
                        console.error('Failed to fetch installments for loan', loan._id || loan.id);
                    }

                    let totalEmis = loan.emiPlan || loan.totalEmis || 1;
                    let paidEmis = loan.paidEmis || 0;
                    let outstandingBalance = loan.outstandingBalance ?? ((loan.loanAmount || 0) - (paidEmis * (loan.monthlyEmi || 0)));

                    if (realInstallments.length > 0) {
                        totalEmis = realInstallments.length;
                        paidEmis = realInstallments.filter(e => e.status === 'Paid').length;
                        outstandingBalance = realInstallments.filter(e => e.status !== 'Paid').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                    }

                    return { 
                        ...loan, 
                        customer: customerObj,
                        trueTotalEmis: totalEmis,
                        truePaidEmis: paidEmis,
                        trueOutstandingBalance: outstandingBalance
                    };
                }));
                setLoans(processedLoans);
                setError(null);
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || 'Failed to load loans';
                setError(errorMsg);
                showToast('error', errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoans();
    }, []);

    const filteredLoans = useMemo(() => {
        if (!searchTerm) return loans;
        const lower = searchTerm.toLowerCase();
        return loans.filter(loan =>
            (loan.customer?.fullName || loan.customer?.name || loan.customerName || '').toLowerCase().includes(lower) ||
            (loan.customer?.phone || loan.phone || '').includes(searchTerm) ||
            (loan._id || loan.id || '').toLowerCase().includes(lower) ||
            (loan.productName || '').toLowerCase().includes(lower)
        );
    }, [loans, searchTerm]);

    const columns = [
        {
            key: 'id',
            label: 'Loan ID',
            render: (loan) => (
                <span className="font-medium text-sky-600 dark:text-sky-400">
                    {loan._id ? `LOAN-${String(loan._id).slice(-6).toUpperCase()}` : loan.id}
                </span>
            )
        },
        {
            key: 'customer',
            label: 'Customer Details',
            render: (loan) => {
                const fullName = loan.customer?.fullName || loan.customer?.name || loan.customerName || 'Unknown Customer';
                const phone = loan.customer?.phone || loan.phone || 'N/A';
                const customerId = loan.customer?._id || loan.customer?.id || (typeof loan.customerId === 'string' ? loan.customerId : null);
                const displayCusId = customerId ? `CUS-${String(customerId).slice(-6).toUpperCase()}` : 'N/A';
                return (
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">{fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{displayCusId} • {phone}</p>
                    </div>
                );
            }
        },
        {
            key: 'product',
            label: 'Product',
            render: (loan) => (
                <div>
                    <p className="font-medium text-slate-900 dark:text-white">{loan.productName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(loan.productPrice || loan.price || 0)}</p>
                </div>
            )
        },
        {
            key: 'status',
            label: 'EMI Progress',
            render: (loan) => {
                const total = loan.trueTotalEmis ?? loan.emiPlan ?? loan.totalEmis ?? 1;
                const paid = loan.truePaidEmis ?? loan.paidEmis ?? 0;
                const percent = Math.min(100, Math.round((paid / total) * 100));
                return (
                    <div className="w-full max-w-[120px]">
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-400">{paid}/{total} Paid</span>
                            <span className="font-medium text-slate-900 dark:text-white">{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                style={{ width: `${percent}%` }}
                                className={`h-full ${percent === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                            ></div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'outstanding',
            label: 'Remaining Balance',
            render: (loan) => {
                const paid = loan.truePaidEmis ?? loan.paidEmis ?? 0;
                const outstanding = loan.trueOutstandingBalance ?? loan.outstandingBalance ?? ((loan.loanAmount || 0) - (paid * (loan.monthlyEmi || 0)));
                return (
                    <span className={`font-medium ${outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(Math.max(0, outstanding))}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: '',
            render: (loan) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => navigate(`/loans/${loan._id || loan.id}`)}
                        className="flex h-8 items-center gap-1 rounded-full px-3 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/30 transition-colors"
                    >
                        View Details <FiChevronRight />
                    </button>
                </div>
            )
        }
    ];

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

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Loans & Customers</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage all customer loans and view EMI details.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => navigate('/loans/new')} className="gap-2">
                        <FiPlus /> Create New Loan
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                <div className="relative flex-1 sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FiSearch />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Customer Name, Phone, or Loan ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Table */}
            {filteredLoans.length > 0 ? (
                <>
                    <div className="hidden md:block">
                        <Table columns={columns} data={filteredLoans} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredLoans.map(loan => {
                            const total = loan.trueTotalEmis ?? loan.emiPlan ?? loan.totalEmis ?? 1;
                            const paid = loan.truePaidEmis ?? loan.paidEmis ?? 0;
                            const percent = Math.min(100, Math.round((paid / total) * 100));
                            const outstanding = loan.trueOutstandingBalance ?? loan.outstandingBalance ?? ((loan.loanAmount || 0) - (paid * (loan.monthlyEmi || 0)));
                            const displayId = loan._id ? `LOAN-${String(loan._id).slice(-6).toUpperCase()}` : loan.id;
                            const customerId = loan.customer?._id || loan.customer?.id || (typeof loan.customerId === 'string' ? loan.customerId : null);
                            const displayCusId = customerId ? `CUS-${String(customerId).slice(-6).toUpperCase()}` : 'N/A';

                            return (
                                <div key={loan._id || loan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="overflow-hidden pr-2">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{loan.customer?.fullName || loan.customer?.name || loan.customerName || 'Unknown Customer'}</h3>
                                            <p className="text-xs text-slate-500 truncate">{displayId} • {displayCusId} • {loan.customer?.phone || loan.phone || 'N/A'}</p>
                                        </div>
                                        <Badge variant={outstanding <= 0 ? 'success' : 'primary'} className="shrink-0">
                                            {outstanding <= 0 ? 'Completed' : 'Active'}
                                        </Badge>
                                    </div>
                                    <div className="mb-4">
                                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{loan.productName}</p>
                                        <p className="text-sm text-slate-500">{formatCurrency(loan.productPrice || loan.price || 0)}</p>
                                    </div>
                                    <div className="mb-4">
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="text-slate-600 dark:text-slate-400">{paid}/{total} Paid</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{percent}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div style={{ width: `${percent}%` }} className={`h-full ${percent === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <div className="text-sm">
                                            <span className="text-slate-500">Balance: </span>
                                            <span className={`font-semibold ${outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {formatCurrency(Math.max(0, outstanding))}
                                            </span>
                                        </div>
                                        <button onClick={() => navigate(`/loans/${loan._id || loan.id}`)} className="flex h-8 items-center gap-1 rounded-full px-3 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/30 transition-colors">
                                            View <FiChevronRight />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 border-dashed py-16 text-center dark:border-slate-700">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <FiSearch size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No loans found</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        We couldn't find any loans matching your search criteria.
                    </p>
                    {searchTerm && (
                        <Button variant="ghost" className="mt-4" onClick={() => setSearchTerm('')}>
                            Clear Search
                        </Button>
                    )}
                </div>
            )}

            {toastElement}
        </div>
    );
}

export default LoansPage;
