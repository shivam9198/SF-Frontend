import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiSave, FiX, FiCheckCircle, FiXCircle, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { loanService } from '../../services/api/loanService';
import { customerService } from '../../services/api/customerService';
import api from '../../services/api/axios';
import { formatName } from '../../utils/format';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

const AddLoanPage = () => {
    const navigate = useNavigate();

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const searchRef = useRef(null);

    // Customer Search State
    const [customerSearch, setCustomerSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        shopName: '',
        productName: '',
        brand: '',
        imeiNumber: '',
        color: '',
        modelNumber: '',
        price: '',
        loginCharge: 500, // Fixed 500
        downPayment: '',
        months: 12,
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    // Calculated State
    const [monthlyEmi, setMonthlyEmi] = useState(0);

    // Track unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return (
            selectedCustomer !== null ||
            formData.shopName !== '' ||
            formData.productName !== '' ||
            formData.price !== '' ||
            formData.downPayment !== ''
        );
    }, [selectedCustomer, formData]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Outside click handler for search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live EMI Calculation
    useEffect(() => {
        const calculate = async () => {
            if (formData.price && formData.downPayment) {
                const emi = await loanService.calculateEMI(
                    formData.price,
                    formData.loginCharge,
                    formData.downPayment,
                    formData.months
                );
                setMonthlyEmi(emi);
            } else {
                setMonthlyEmi(0);
            }
        };
        // Debounce calculation slightly
        const timer = setTimeout(calculate, 300);
        return () => clearTimeout(timer);
    }, [formData.price, formData.loginCharge, formData.downPayment, formData.months]);

    // Handle Customer Search
    useEffect(() => {
        const search = async () => {
            if (customerSearch.length > 2 && !selectedCustomer) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const response = await api.get('/customers');
                    const allCustomers = response.data.customers || response.data;
                    const term = customerSearch.toLowerCase().trim();
                    const filtered = allCustomers.filter(c => {
                        const customerId = c._id || c.id || '';
                        const displayId = customerId ? `CUS-${String(customerId).slice(-6).toUpperCase()}` : '';
                        return (
                            (c.fullName || c.name || '').toLowerCase().includes(term) ||
                            (c.phone || '').toLowerCase().includes(term) ||
                            String(customerId).toLowerCase().includes(term) ||
                            displayId.toLowerCase().includes(term)
                        );
                    });
                    setSearchResults(filtered);
                } catch (err) {
                    console.error('Search failed', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [customerSearch, selectedCustomer]);

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(`${formatName(customer.fullName || customer.name)} (${customer.phone})`);
        setShowResults(false);
    };

    const clearCustomerSelection = () => {
        setSelectedCustomer(null);
        setCustomerSearch('');
    };

    const handleChange = (e) => {
        const { id, value } = e.target;

        if (id === 'price' || id === 'loginCharge' || id === 'downPayment') {
            const num = String(value).replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [id]: num }));
        } else if (id === 'imeiNumber') {
            const num = String(value).replace(/\D/g, '').slice(0, 15);
            setFormData(prev => ({ ...prev, [id]: num }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const showToastMsg = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Validations
    const validateForm = () => {
        if (!selectedCustomer) {
            showToastMsg('error', 'Please select a customer.');
            return false;
        }
        if (!formData.productName.trim()) {
            showToastMsg('error', 'Product Name is required.');
            return false;
        }
        if (formData.imeiNumber.length !== 15) {
            showToastMsg('error', 'IMEI Number must be exactly 15 digits.');
            return false;
        }
        if (!formData.price || Number(formData.price) <= 0) {
            showToastMsg('error', 'Valid Product Price is required.');
            return false;
        }
        if (formData.downPayment === '' || Number(formData.downPayment) < 0) {
            showToastMsg('error', 'Valid Down Payment is required.');
            return false;
        }
        if (Number(formData.downPayment) > Number(formData.price)) {
            showToastMsg('error', 'Down Payment cannot exceed Product Price.');
            return false;
        }
        if (!formData.months || Number(formData.months) <= 0) {
            showToastMsg('error', 'Valid EMI Plan is required.');
            return false;
        }
        if (!formData.purchaseDate) {
            showToastMsg('error', 'Purchase Date is required.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                customerId: selectedCustomer._id || selectedCustomer.id,
                productName: formData.productName,
                imeiNumber: formData.imeiNumber,
                productPrice: Number(formData.price),
                loginCharge: Number(formData.loginCharge),
                downPayment: Number(formData.downPayment),
                emiPlan: Number(formData.months),
                purchaseDate: formData.purchaseDate
            };

            const response = await api.post('/loans', payload);
            const newLoan = response.data.loan || response.data;

            showToastMsg('success', 'Loan created successfully');

            setTimeout(() => {
                navigate(`/loans/${newLoan._id || newLoan.id}`);
            }, 1500);

        } catch (err) {
            showToastMsg('error', err.response?.data?.message || err.message || 'Failed to create loan');
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (hasUnsavedChanges && !window.confirm('Reset all fields?')) return;
        setFormData({
            shopName: '', productName: '', brand: '', imeiNumber: '',
            color: '', modelNumber: '', price: '', loginCharge: 500,
            downPayment: '', months: 12, purchaseDate: new Date().toISOString().split('T')[0]
        });
        clearCustomerSelection();
    };

    const remainingAmount = Number(formData.price || 0) + Number(formData.loginCharge || 0) - Number(formData.downPayment || 0);

    return (
        <div className="relative min-h-[calc(100vh-8rem)] pb-24">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => {
                        if (!hasUnsavedChanges || window.confirm('Discard unsaved changes?')) {
                            navigate(-1);
                        }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <FiArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create New Loan</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Enter purchase details and configure the EMI plan.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-7xl">
                <div className="flex flex-col xl:flex-row gap-6">

                    {/* Left Column: Form Sections */}
                    <div className="flex-1 space-y-6">

                        {/* Section 1: Customer Selection */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">1. Customer Selection</h2>
                            <div className="relative" ref={searchRef}>
                                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-2 font-medium">Search Customer *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <FiSearch />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by Name, Phone, or ID..."
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            if (selectedCustomer) setSelectedCustomer(null);
                                        }}
                                        disabled={selectedCustomer !== null}
                                    />
                                    {selectedCustomer && (
                                        <button
                                            type="button"
                                            onClick={clearCustomerSelection}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-500"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Autocomplete Dropdown */}
                                {showResults && customerSearch.length > 2 && (
                                    <div className="absolute z-20 mt-1 w-full rounded-2xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                        {isSearching ? (
                                            <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            <ul className="max-h-60 overflow-auto">
                                                {searchResults.map(customer => (
                                                    <li
                                                        key={customer._id || customer.id}
                                                        onClick={() => handleSelectCustomer(customer)}
                                                        className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium text-slate-900 dark:text-white">{formatName(customer.fullName || customer.name)}</span>
                                                            <span className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded">{customer._id ? `CUS-${String(customer._id).slice(-6).toUpperCase()}` : customer.id}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {customer.phone} • {customer.address?.city || customer.city || '-'}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-slate-500">
                                                No customers found. <button type="button" onClick={() => navigate('/customers/new')} className="text-sky-600 hover:underline">Add New Customer</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2 & 3: Shop & Product Details */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">2. Product Details</h2>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Input label="Shop Name *" id="shopName" value={formData.shopName} onChange={handleChange} placeholder="e.g. Mobile World" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input label="Product Name *" id="productName" value={formData.productName} onChange={handleChange} placeholder="e.g. Samsung Galaxy S23" />
                                </div>
                                <div>
                                    <Input label="Brand" id="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Samsung" />
                                </div>
                                <div>
                                    <Input label="Model Number" id="modelNumber" value={formData.modelNumber} onChange={handleChange} placeholder="e.g. SM-S911B" />
                                </div>
                                <div>
                                    <Input label="IMEI Number *" id="imeiNumber" value={formData.imeiNumber} onChange={handleChange} placeholder="15-digit IMEI" maxLength={15} />
                                    {formData.imeiNumber && formData.imeiNumber.length !== 15 && <p className="mt-1 text-xs text-amber-500">Must be exactly 15 digits</p>}
                                </div>
                                <div>
                                    <Input label="Color" id="color" value={formData.color} onChange={handleChange} placeholder="e.g. Phantom Black" />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Finance Details */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">3. Finance Details</h2>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <Input label="Product Price (MRP) *" id="price" value={formData.price} onChange={handleChange} placeholder="₹ 0" />
                                </div>
                                <div>
                                    <Input label="Down Payment *" id="downPayment" value={formData.downPayment} onChange={handleChange} placeholder="₹ 0" />
                                </div>
                                <div>
                                    <Input label="Login Charge *" id="loginCharge" value={formData.loginCharge} disabled={true} placeholder="₹ 500" />
                                </div>
                                <div>
                                    <Select
                                        label="EMI Plan *"
                                        id="months"
                                        value={formData.months}
                                        onChange={handleChange}
                                        options={[
                                            { value: 6, label: '6 Months' },
                                            { value: 8, label: '8 Months' },
                                            { value: 12, label: '12 Months' }
                                        ]}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input label="Purchase Date *" id="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Live EMI Calculator */}
                    <div className="xl:w-[400px] shrink-0">
                        <div className="sticky top-6 rounded-3xl border border-sky-100 bg-sky-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live EMI Calculator</h2>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                                    <FiDollarSign size={20} />
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Product Price</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(formData.price)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Login Charge</span>
                                    <span className="font-medium text-slate-900 dark:text-white">+ {formatCurrency(formData.loginCharge)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Down Payment</span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">- {formatCurrency(formData.downPayment)}</span>
                                </div>

                                <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Remaining Amount</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(Math.max(0, remainingAmount))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Plan Duration</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{formData.months} Months</span>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
                                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Monthly EMI</p>
                                    <p className="text-center text-3xl font-bold text-sky-600 dark:text-sky-400">
                                        {formatCurrency(monthlyEmi)}
                                    </p>
                                </div>

                                {/* EMI Preview */}
                                {monthlyEmi > 0 && formData.purchaseDate && (
                                    <div className="mt-6">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Schedule Preview</p>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((month) => {
                                                const d = new Date(formData.purchaseDate);
                                                d.setMonth(d.getMonth() + month);
                                                return (
                                                    <div key={month} className="flex justify-between text-xs p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                                                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                            <FiCalendar size={12} /> Month {month}
                                                        </span>
                                                        <span className="font-medium text-slate-900 dark:text-white">{d.toLocaleDateString()}</span>
                                                    </div>
                                                );
                                            })}
                                            {formData.months > 3 && (
                                                <div className="text-center text-xs text-slate-400 mt-2 italic">...and {formData.months - 3} more months</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/80 bg-white/80 p-4 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80 md:pl-64">
                    <div className="mx-auto flex flex-wrap sm:flex-nowrap items-center justify-end gap-3 sm:gap-4">
                        <Button type="button" variant="ghost" onClick={handleReset} className="w-full sm:w-auto text-slate-600 dark:text-slate-300">
                            Reset
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || monthlyEmi <= 0}
                            className="w-full sm:w-auto min-w-[140px] flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : <><FiSave /> Create Loan</>}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Toasts */}
            {toast && (
                <div className={`fixed right-4 top-4 z-50 flex animate-bounce items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            )}
        </div>
    );
};

export default AddLoanPage;
