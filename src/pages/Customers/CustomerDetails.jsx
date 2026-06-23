import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiPhone, FiMapPin, FiFileText, FiSave, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import api from '../../services/api/axios';
import { formatName } from '../../utils/format';

const formatId = (id) => {
    if (!id) return '';
    return `CUS-${String(id).slice(-6).toUpperCase()}`;
};

const documentTypeOptions = [
    { value: 'Aadhaar', label: 'Aadhaar Card' },
    { value: 'PAN', label: 'PAN Card' },
    { value: 'DL', label: 'Driving License' },
    { value: 'Voter ID', label: 'Voter ID' }
];

const normalizeDocumentType = (value) => {
    const mappings = {
        'PAN Card': 'PAN',
        'Driving License': 'DL'
    };

    return mappings[value] || value;
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
                if (err.response && err.response.status === 404) {
                    setError('Customer not found');
                } else {
                    setError(err.response?.data?.message || err.message || 'Failed to load customer');
                }
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

    if (!customer) return <ErrorState message="Customer not found" onRetry={() => navigate('/customers')} />;

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
            kycDocumentType: normalizeDocumentType(customer.kycDocumentType || '')
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
                kycDocumentType: normalizeDocumentType(formData.kycDocumentType)
            };
            const res = await api.put(`/customers/${customer._id}`, payload);
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
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{formatName(customer.fullName)}</h1>
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
                <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                    <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-white">Edit Customer Details</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
                            options={documentTypeOptions}
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
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                    {/* Left Column: Contact & Location Info */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
                                <FiPhone className="text-sky-500" /> Contact Details
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Full Address</p>
                                <div className="font-medium text-slate-900 dark:text-white flex items-start gap-2 mt-1">
                                    <FiMapPin className="mt-1 text-slate-400 shrink-0" />
                                    <span>
                                        {customer.address?.street ? `${customer.address.street}, ` : ''}
                                        {customer.address?.city}, {customer.address?.state} - {customer.address?.pincode}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: KYC & System Info */}
                    <div className="space-y-6">
                        {/* KYC Info */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
                                <FiFileText className="text-emerald-500" /> KYC Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Document Type</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{customer.kycDocumentType}</p>
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

                        {/* System Info */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
                                <FiCalendar className="text-purple-500" /> System Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Created Date</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Last Updated</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
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

export default CustomerDetailsPage;
