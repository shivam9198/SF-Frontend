import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiPhone, FiMapPin, FiFileText, FiBriefcase, FiCreditCard, FiClock, FiActivity, FiSave, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import api from '../../services/api/axios';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

const formatId = (id) => {
    if (!id) return '';
    return `CUS-${String(id).slice(-6).toUpperCase()}`;
};

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/customers/${id}`);
                setCustomer(response.data.customer || response.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load customer');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCustomerDetails();
        }
    }, [id]);

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader /></div>;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    if (!customer) return null;

    const mockPayments = [
        { date: '2024-03-01', amount: 5000, status: 'Paid', method: 'UPI' },
        { date: '2024-02-01', amount: 5000, status: 'Paid', method: 'Bank Transfer' },
        { date: '2024-01-01', amount: 5000, status: 'Late', method: 'Cash' },
    ];

    const mockTimeline = [
        { date: '2024-03-05', action: 'Called customer regarding upcoming EMI.', user: 'Agent Amit' },
        { date: '2024-03-01', action: 'EMI Payment of ₹5,000 received via UPI.', user: 'System' },
        { date: '2024-02-15', action: 'Customer updated alternate phone number.', user: 'Agent Priya' },
        { date: customer.createdAt, action: 'Customer profile created and KYC verified.', user: 'System' },
    ];

    const startEditing = () => {
        setFormData({
            fullName: customer.fullName || '',
            phone: customer.phone || '',
            alternatePhone: customer.alternatePhone || '',
            aadhaar: customer.aadhaar || '',
            street: customer.address?.street || '',
            city: customer.address?.city || '',
            state: customer.address?.state || '',
            pincode: customer.address?.pincode || '',
            kycDocumentType: customer.kycDocumentType || 'Aadhaar'
        });
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'phone' || id === 'alternatePhone') {
            setFormData(prev => ({ ...prev, [id]: value.replace(/\D/g, '').slice(0, 10) }));
            return;
        }
        if (id === 'pincode') {
            setFormData(prev => ({ ...prev, [id]: value.replace(/\D/g, '').slice(0, 6) }));
            return;
        }
        if (id === 'aadhaar') {
            setFormData(prev => ({ ...prev, [id]: value.replace(/\D/g, '').slice(0, 12) }));
            return;
        }
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdate = async () => {
        try {
            setIsSubmitting(true);
            const payload = {
                fullName: formData.fullName,
                phone: formData.phone,
                alternatePhone: formData.alternatePhone,
                aadhaar: formData.aadhaar,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                kycDocumentType: formData.kycDocumentType
            };
            const res = await api.put(`/customers/${id}`, payload);
            setCustomer(res.data.customer || res.data);
            setIsEditing(false);
            showToast('success', 'Customer updated successfully');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to update customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/customers')}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{customer.fullName}</h1>
                            <Badge variant={customer.status === 'Active' ? 'success' : customer.status === 'Overdue' ? 'warning' : 'primary'}>
                                {customer.status || 'New'}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Customer ID: <span className="font-medium text-slate-700 dark:text-slate-300">{formatId(customer._id)}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isEditing && (
                        <Button variant="secondary" className="gap-2" onClick={startEditing}>
                            <FiEdit2 size={16} /> Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                    <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Edit Customer Details</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input label="Full Name *" id="fullName" value={formData.fullName} onChange={handleChange} />
                        <Input label="Phone Number *" id="phone" value={formData.phone} onChange={handleChange} maxLength={10} />
                        <Input label="Alternate Phone" id="alternatePhone" value={formData.alternatePhone} onChange={handleChange} maxLength={10} />
                        <Input label="Aadhaar Number *" id="aadhaar" value={formData.aadhaar} onChange={handleChange} maxLength={12} />
                        <Input label="Street Address *" id="street" value={formData.street} onChange={handleChange} />
                        <Input label="City *" id="city" value={formData.city} onChange={handleChange} />
                        <Input label="State *" id="state" value={formData.state} onChange={handleChange} />
                        <Input label="PIN Code *" id="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} />
                        <Select
                            label="Document Type *"
                            id="kycDocumentType"
                            value={formData.kycDocumentType}
                            onChange={handleChange}
                            options={[
                                { value: 'Aadhaar', label: 'Aadhaar Card' },
                                { value: 'PAN Card', label: 'PAN Card' },
                                { value: 'Driving License', label: 'Driving License' },
                                { value: 'Voter ID', label: 'Voter ID' }
                            ]}
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isSubmitting} className="gap-2">
                            <FiSave size={16} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Info Cards */}
                    <div className="space-y-6 lg:col-span-1">

                        {/* Contact Info */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
                                <FiPhone className="text-sky-500" /> Contact Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Primary Phone</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{customer.phone}</p>
                                </div>
                                {customer.alternatePhone && (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Alternate Phone</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{customer.alternatePhone}</p>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                                    <p className="font-medium text-slate-900 dark:text-white flex items-start gap-2 mt-1">
                                        <FiMapPin className="mt-1 text-slate-400 shrink-0" />
                                        <span>
                                            {customer.address?.street ? `${customer.address.street}, ` : ''}
                                            {customer.address?.city}, {customer.address?.state} - {customer.address?.pincode}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* KYC Info */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
                                <FiFileText className="text-emerald-500" /> KYC Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Document Type</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{customer.kycDocumentType || 'Aadhaar'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Document Number</p>
                                    <p className="font-medium tracking-wide text-slate-900 dark:text-white">{customer.aadhaar}</p>
                                </div>
                                {customer.kycDocumentImage && (
                                    <div className="pt-2">
                                        <Button variant="secondary" className="w-full text-xs" onClick={() => window.open(customer.kycDocumentImage, '_blank')}>
                                            View Document Preview
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Loans & Activity */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Loan Summary Grid */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <SummaryCard title="Total Loans" value={customer.loans} icon={<FiBriefcase />} color="sky" />
                            <SummaryCard title="Active Loans" value={customer.loans > 0 ? 1 : 0} icon={<FiActivity />} color="emerald" />
                            <SummaryCard title="Outstanding" value={formatCurrency(customer.totalOutstanding)} icon={<FiCreditCard />} color="amber" />
                            <SummaryCard title="Collection Rate" value="95%" icon={<FiFileText />} color="purple" />
                        </div>

                        {/* Recent Payments */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Recent Payments</h2>
                                <Button variant="ghost" className="text-sm">View All</Button>
                            </div>
                            <Table
                                columns={[
                                    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
                                    { key: 'amount', label: 'Amount', render: (r) => <span className="font-medium">{formatCurrency(r.amount)}</span> },
                                    { key: 'method', label: 'Method' },
                                    {
                                        key: 'status',
                                        label: 'Status',
                                        render: (r) => (
                                            <Badge variant={r.status === 'Paid' ? 'success' : 'warning'}>{r.status}</Badge>
                                        )
                                    }
                                ]}
                                data={mockPayments}
                            />
                        </div>

                        {/* Timeline Activity */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
                                <FiClock className="text-purple-500" /> Timeline Activity
                            </h2>
                            <div className="space-y-6">
                                {mockTimeline.map((item, index) => (
                                    <div key={index} className="flex gap-4 relative">
                                        {/* Timeline Line */}
                                        {index !== mockTimeline.length - 1 && (
                                            <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                        )}
                                        <div className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white dark:bg-slate-800 dark:ring-slate-900">
                                            <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.action}</p>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{item.user}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {toast && (
                <div className={`fixed right-4 top-4 z-50 flex animate-slideIn items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            )}
        </div>
    );
};

function SummaryCard({ title, value, icon, color }) {
    const colors = {
        sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-700/90 dark:bg-slate-900">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{value}</h3>
            </div>
        </div>
    );
}

export default CustomerDetailsPage;
