import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiDownload, FiSearch, FiMoreVertical, FiEye, FiEdit2, FiTrash2, FiUsers, FiUserCheck, FiAlertCircle, FiUserPlus, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import api from '../../services/api/axios';
import { AuthContext } from '../../context/AuthContext';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

export function formatId(id) {
    if (!id) return '';
    return `CUS-${String(id).slice(-6).toUpperCase()}`;
}

const CustomersPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');
    const [toast, setToast] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) setSearchTerm(query);
    }, [searchParams]);

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const [customersRes, loansRes] = await Promise.all([
                api.get('/customers'),
                api.get('/loans').catch(() => ({ data: [] }))
            ]);
            
            const rawCustomers = customersRes.data || [];
            const rawLoans = loansRes.data?.loans || loansRes.data || [];
            
            const processedCustomers = rawCustomers.map(customer => {
                const customerLoans = rawLoans.filter(loan => {
                    const loanCustId = loan.customer?._id || loan.customer?.id || (typeof loan.customerId === 'string' ? loan.customerId : loan.customerId?._id);
                    return loanCustId === customer._id;
                });
                
                const loanCount = customerLoans.length;
                let totalOutstanding = 0;
                let hasActiveLoans = false;
                let hasOverdue = false;
                
                customerLoans.forEach(loan => {
                    const paid = loan.paidEmis || 0;
                    const outstanding = loan.outstandingBalance ?? ((loan.loanAmount || 0) - (paid * (loan.monthlyEmi || 0)));
                    
                    if (outstanding > 0) {
                        totalOutstanding += outstanding;
                        hasActiveLoans = true;
                    }
                    
                    if (loan.status === 'Overdue' || loan.hasOverdue || (loan.overdueAmount && loan.overdueAmount > 0) || (loan.schedule && loan.schedule.some(e => e.status === 'Overdue'))) {
                        hasOverdue = true;
                    }
                });
                
                let status = 'New';
                if (loanCount > 0) {
                    if (hasOverdue) {
                        status = 'Overdue';
                    } else if (hasActiveLoans) {
                        status = 'Active';
                    } else {
                        status = 'Completed';
                    }
                }
                
                return {
                    ...customer,
                    loans: loanCount,
                    totalOutstanding,
                    status
                };
            });
            
            console.log("Customers", rawCustomers);
            console.log("Loans", rawLoans);
            console.log("Matched Customers", processedCustomers);

            setCustomers(processedCustomers);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch customers');
            showToast('error', 'Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    };

    const initiateDelete = (id) => {
        if (user?.role !== 'admin') {
            showToast('error', 'Only admins can delete customers');
            return;
        }
        setCustomerToDelete(id);
        setDeleteConfirmText('');
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        try {
            setIsDeleting(true);
            await api.delete(`/customers/${customerToDelete}`);
            setCustomers(customers.filter(c => c._id !== customerToDelete));
            showToast('success', 'Customer deleted successfully');
            setDeleteModalOpen(false);
        } catch (err) {
            showToast('error', err.response?.data?.message || err.message || 'Failed to delete customer');
        } finally {
            setIsDeleting(false);
            setCustomerToDelete(null);
        }
    };

    // Calculate stats
    const stats = useMemo(() => {
        const total = customers.length;
        const active = customers.filter(c => (c.status || 'New') === 'Active').length;
        const overdue = customers.filter(c => (c.status || 'New') === 'Overdue').length;

        // Simple mock logic for "New This Month" based on dates (assuming current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newThisMonth = customers.filter(c => {
            const d = new Date(c.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        return { total, active, overdue, newThisMonth };
    }, [customers]);

    // Filtering and Sorting
    const filteredCustomers = useMemo(() => {
        let result = [...customers];

        // Search
        if (searchTerm) {
            const term = String(searchTerm).toLowerCase().trim();
            result = result.filter(c => {
                const safeName = String(c.fullName ?? "").toLowerCase();
                const safePhone = String(c.phone ?? "").toLowerCase();
                const safeDisplayId = formatId(c._id).toLowerCase();

                return safeName.includes(term) || safePhone.includes(term) || safeDisplayId.includes(term);
            });
        }

        // Filter
        if (filterStatus !== 'All') {
            result = result.filter(c => {
                const status = c.status || 'New';
                if (filterStatus === 'New Customers') return status === 'New';
                return status === filterStatus;
            });
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'A-Z') return (a.fullName || '').localeCompare(b.fullName || '');
            if (sortBy === 'Z-A') return (b.fullName || '').localeCompare(a.fullName || '');
            return 0;
        });

        return result;
    }, [customers, searchTerm, filterStatus, sortBy]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('All');
        setSortBy('Newest');
    };

    function formatId(id) {
        if (!id) return '';
        return `CUS-${id.slice(-6).toUpperCase()}`;
    }

    const handleExport = () => {
        const rows = [
            ['Customer ID', 'Name', 'Phone', 'City', 'Loans', 'Outstanding', 'Status'],
            ...filteredCustomers.map((customer) => [
                formatId(customer._id),
                customer.fullName,
                customer.phone,
                customer.address?.city || '',
                customer.loans || 0,
                customer.totalOutstanding || 0,
                customer.status || 'New',
            ]),
        ];
        const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'customers.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const columns = [
        { key: 'id', label: 'ID', render: (row) => <span className="font-semibold text-sky-600 dark:text-sky-400">{formatId(row._id)}</span> },
        { key: 'name', label: 'Customer', render: (row) => row.fullName },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City', render: (row) => row.address?.city || '-' },
        { key: 'loans', label: 'Loans', render: (row) => row.loans || 0 },
        { key: 'totalOutstanding', label: 'Outstanding', render: (row) => formatCurrency(row.totalOutstanding || 0) },
        {
            key: 'status',
            label: 'Status',
            render: (row) => {
                const status = row.status || 'New';
                const variants = {
                    Active: 'success',
                    Overdue: 'warning',
                    Completed: 'primary',
                    New: 'primary'
                };
                return <Badge variant={variants[status] || 'primary'}>{status}</Badge>;
            }
        },
        { key: 'createdAt', label: 'Joined', render: (row) => new Date(row.createdAt).toLocaleDateString() },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/customers/${row._id}`)} className="p-1.5 text-slate-400 hover:text-sky-600 transition" title="View Details">
                        <FiEye size={18} />
                    </button>
                    <button onClick={() => navigate(`/customers/${row._id}`)} className="p-1.5 text-slate-400 hover:text-amber-600 transition" title="Edit">
                        <FiEdit2 size={18} />
                    </button>
                    {user?.role === 'admin' && (
                        <button onClick={() => initiateDelete(row._id)} className="p-1.5 text-slate-400 hover:text-red-600 transition" title="Delete">
                            <FiTrash2 size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Customers</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage customer records, KYC details, and loan relationships.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="gap-2" onClick={handleExport}>
                        <FiDownload /> Export
                    </Button>
                    <Button onClick={() => navigate('/customers/new')} className="gap-2">
                        <FiPlus /> Add Customer
                    </Button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Customers" value={stats.total} icon={<FiUsers size={24} />} color="sky" />
                <StatCard title="Active Customers" value={stats.active} icon={<FiUserCheck size={24} />} color="emerald" />
                <StatCard title="Overdue Customers" value={stats.overdue} icon={<FiAlertCircle size={24} />} color="amber" />
                <StatCard title="New This Month" value={stats.newThisMonth} icon={<FiUserPlus size={24} />} color="purple" />
            </div>

            {/* Main Content Area */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                {/* Search & Filter Bar */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by Name, Phone, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        {/* Fake search icon overlay for now, usually would be inside Input */}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: 'All', label: 'All Status' },
                                { value: 'Active', label: 'Active' },
                                { value: 'Overdue', label: 'Overdue' },
                                { value: 'New Customers', label: 'New' },
                                { value: 'Completed', label: 'Completed' }
                            ]}
                        />
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            options={[
                                { value: 'Newest', label: 'Newest First' },
                                { value: 'Oldest', label: 'Oldest First' },
                                { value: 'A-Z', label: 'A-Z' },
                                { value: 'Z-A', label: 'Z-A' }
                            ]}
                        />
                        {(searchTerm || filterStatus !== 'All' || sortBy !== 'Newest') && (
                            <Button variant="ghost" onClick={handleClearFilters} className="text-sm">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table Area */}
                {isLoading ? (
                    <div className="flex py-12 items-center justify-center"><Loader /></div>
                ) : error ? (
                    <ErrorState message={error} onRetry={fetchCustomers} />
                ) : filteredCustomers.length === 0 ? (
                    <EmptyState
                        title="No customers found"
                        description="Adjust your filters or add a new customer."
                        action={<Button onClick={() => navigate('/customers/new')}>Add Customer</Button>}
                    />
                ) : (
                    <div className="hidden md:block">
                        <Table columns={columns} data={filteredCustomers} />
                    </div>
                )}

                {/* Mobile Cards View */}
                {!isLoading && !error && filteredCustomers.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredCustomers.map(customer => {
                            const status = customer.status || 'New';
                            return (
                                <div key={customer._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{customer.fullName}</h3>
                                            <p className="text-sm text-slate-500">{formatId(customer._id)}</p>
                                        </div>
                                        <Badge variant={status === 'Active' ? 'success' : status === 'Overdue' ? 'warning' : 'primary'}>
                                            {status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 space-y-1">
                                        <p>{customer.phone}</p>
                                        <p>{customer.address?.city || '-'}</p>
                                        <p>Outstanding: <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(customer.totalOutstanding || 0)}</span></p>
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                                        <Button variant="ghost" onClick={() => navigate(`/customers/${customer._id}`)} className="px-3 py-1">View</Button>
                                        <Button variant="ghost" onClick={() => navigate(`/customers/${customer._id}`)} className="px-3 py-1 text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/30">Edit</Button>
                                        {user?.role === 'admin' && (
                                            <Button variant="ghost" onClick={() => initiateDelete(customer._id)} className="px-3 py-1 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/30">Delete</Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity duration-300">
                    <div className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-slideIn">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                                <FiTrash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Customer</h3>
                        </div>
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                            This action cannot be undone.<br />
                            Deleting this customer may affect loans, EMI records and payment history.
                        </p>
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Type <strong className="text-slate-900 dark:text-white">DELETE</strong> to confirm
                            </label>
                            <Input
                                placeholder="DELETE"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                            <Button variant="ghost" onClick={() => {
                                setIsClosing(true);
                                setTimeout(() => {
                                    setDeleteModalOpen(false);
                                    setIsClosing(false);
                                    setCustomerToDelete(null);
                                }, 250);
                            }}>Cancel</Button>
                            <Button
                                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 border-0"
                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                onClick={confirmDelete}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Customer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            {toast && (
                <div className={`fixed right-4 top-4 z-50 flex animate-slideIn items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${toast.type === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            )
            }
        </div >
    );
};

function StatCard({ title, value, icon, color }) {
    const colors = {
        sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
            </div>
        </div>
    );
}

export default CustomersPage;
