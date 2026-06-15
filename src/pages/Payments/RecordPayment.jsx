import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiX, FiCheckCircle, FiXCircle, FiCreditCard, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import { customerService } from '../../services/api/customerService';
import { loanService } from '../../services/api/loanService';
import { paymentService } from '../../services/api/paymentService';
import api from '../../services/api/axios';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

const RecordPaymentPage = () => {
    const navigate = useNavigate();

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const searchRef = useRef(null);

    // Step 1: Customer Search
    const [customerSearch, setCustomerSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Step 2: Loan Selection
    const [customerLoans, setCustomerLoans] = useState([]);
    const [isLoadingLoans, setIsLoadingLoans] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    // Step 3: EMI Selection
    const [emiSchedule, setEmiSchedule] = useState([]);
    const [isLoadingEmis, setIsLoadingEmis] = useState(false);
    const [selectedEmi, setSelectedEmi] = useState(null);

    // Step 4: Payment Details
    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        amountPaid: '',
        paymentMethod: 'Cash',
        referenceNumber: '',
        notes: '',
        collectedBy: 'Current Staff'
    });

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Customer Search logic
    useEffect(() => {
        const search = async () => {
            if (customerSearch.length > 2 && !selectedCustomer) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const allCustomers = await customerService.getCustomers();
                    const filtered = allCustomers.filter(c =>
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.phone.includes(customerSearch) ||
                        c.id.toLowerCase().includes(customerSearch.toLowerCase())
                    );
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

    // Fetch Loans when Customer Selected
    useEffect(() => {
        const fetchLoans = async () => {
            if (selectedCustomer) {
                setIsLoadingLoans(true);
                try {
                    const allLoans = await loanService.getAllLoans();
                    const cLoans = allLoans.filter(l => l.customerId === selectedCustomer.id);
                    setCustomerLoans(cLoans);

                    // Auto-select if only 1 loan
                    if (cLoans.length === 1) {
                        handleSelectLoan(cLoans[0]);
                    }
                } catch (error) {
                    showToastMsg('error', 'Failed to fetch customer loans');
                } finally {
                    setIsLoadingLoans(false);
                }
            } else {
                setCustomerLoans([]);
                setSelectedLoan(null);
            }
        };
        fetchLoans();
    }, [selectedCustomer]);

    // Fetch EMIs when Loan Selected
    useEffect(() => {
        const fetchEmis = async () => {
            if (selectedLoan) {
                setIsLoadingEmis(true);
                try {
                    const res = await api.get(`/loans/${selectedLoan._id || selectedLoan.id}/installments`);
                    const resData = res.data?.data || res.data;
                    const fetchedSchedule = Array.isArray(resData) ? resData : (resData?.installments || []);
                    setEmiSchedule(fetchedSchedule);

                    // Auto-select earliest pending/overdue EMI
                    const earliestPending = fetchedSchedule.find(s => s.status !== 'Paid');
                    if (earliestPending) {
                        handleSelectEmi(earliestPending);
                    }
                } catch (error) {
                    showToastMsg('error', 'Failed to fetch EMI schedule');
                } finally {
                    setIsLoadingEmis(false);
                }
            } else {
                setEmiSchedule([]);
                setSelectedEmi(null);
            }
        };
        fetchEmis();
    }, [selectedLoan]);

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(`${customer.name} (${customer.phone})`);
        setShowResults(false);
        // Reset subsequent steps
        setSelectedLoan(null);
        setSelectedEmi(null);
        setFormData(prev => ({ ...prev, amountPaid: '' }));
    };

    const clearCustomerSelection = () => {
        setSelectedCustomer(null);
        setCustomerSearch('');
        setCustomerLoans([]);
        setSelectedLoan(null);
        setEmiSchedule([]);
        setSelectedEmi(null);
        setFormData(prev => ({ ...prev, amountPaid: '' }));
    };

    const handleSelectLoan = (loan) => {
        setSelectedLoan(loan);
        setSelectedEmi(null);
        setFormData(prev => ({ ...prev, amountPaid: '' }));
    };

    const handleSelectEmi = (emi) => {
        setSelectedEmi(emi);
        setFormData(prev => ({ ...prev, amountPaid: emi.amount.toString() }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'amountPaid') {
            const num = String(value).replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [id]: num }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const showToastMsg = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const validateForm = () => {
        if (!selectedCustomer || !selectedLoan || !selectedEmi) {
            showToastMsg('error', 'Please select customer, loan, and EMI.');
            return false;
        }
        if (!formData.amountPaid || Number(formData.amountPaid) <= 0) {
            showToastMsg('error', 'Valid Amount Paid is required.');
            return false;
        }
        if (!formData.paymentDate) {
            showToastMsg('error', 'Payment Date is required.');
            return false;
        }
        if (['UPI', 'Bank Transfer'].includes(formData.paymentMethod) && !formData.referenceNumber.trim()) {
            showToastMsg('error', 'Reference Number is required for digital payments.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const paymentData = {
                customerName: selectedCustomer.name,
                loanId: selectedLoan.id,
                emiNumber: selectedEmi.emiNumber,
                amount: Number(formData.amountPaid),
                paymentDate: formData.paymentDate,
                paymentMethod: formData.paymentMethod,
                referenceNumber: formData.referenceNumber,
                notes: formData.notes,
                collectedBy: formData.collectedBy
            };

            const newPayment = await paymentService.createPayment(paymentData);

            showToastMsg('success', 'Payment recorded successfully!');

            setTimeout(() => {
                navigate(`/payments/${newPayment.id}`);
            }, 1500);

        } catch (err) {
            showToastMsg('error', err.message || 'Failed to record payment.');
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Reset all fields?')) {
            clearCustomerSelection();
            setFormData({
                paymentDate: new Date().toISOString().split('T')[0],
                amountPaid: '',
                paymentMethod: 'Cash',
                referenceNumber: '',
                notes: '',
                collectedBy: 'Current Staff'
            });
        }
    };

    // Live Summary Calculations
    const remainingBalance = selectedLoan
        ? Math.max(0, selectedLoan.outstandingBalance - Number(formData.amountPaid || 0))
        : 0;

    // Filter to only pending or overdue
    const activeEmis = emiSchedule.filter(e => e.status !== 'Paid');

    return (
        <div className="relative min-h-[calc(100vh-8rem)] pb-24">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <FiArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Record Payment (भुगतान जमा करें)</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Collect EMI payment from a customer. (ग्राहक से किश्त लें)
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-7xl">
                <div className="flex flex-col xl:flex-row gap-6">

                    {/* Left Column: Form Sections */}
                    <div className="flex-1 space-y-6">

                        {/* Step 1: Customer Search */}
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">1. Customer (ग्राहक) Selection</h2>
                            <div className="relative" ref={searchRef}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <FiSearch />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search Name or Phone (नाम या नंबर खोजें)..."
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-4 text-base font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            if (selectedCustomer) clearCustomerSelection();
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

                                {showResults && customerSearch.length > 2 && (
                                    <div className="absolute z-20 mt-1 w-full rounded-2xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                        {isSearching ? (
                                            <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            <ul className="max-h-60 overflow-auto">
                                                {searchResults.map(customer => (
                                                    <li
                                                        key={customer.id}
                                                        onClick={() => handleSelectCustomer(customer)}
                                                        className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium text-slate-900 dark:text-white">{customer.name}</span>
                                                            <span className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded">{customer.id}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {customer.phone}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-slate-500">
                                                No customers found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Loan Selection */}
                        {selectedCustomer && (
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">2. Loan (उधार) Selection</h2>
                                {isLoadingLoans ? (
                                    <div className="py-4"><Loader /></div>
                                ) : customerLoans.length === 0 ? (
                                    <div className="text-sm text-slate-500 py-2">This customer has no active loans. (कोई उधार नहीं)</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {customerLoans.map(loan => (
                                            <div
                                                key={loan.id}
                                                onClick={() => handleSelectLoan(loan)}
                                                className={`cursor-pointer rounded-2xl border p-4 transition-all ${selectedLoan?.id === loan.id
                                                    ? 'border-sky-500 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-900/10 shadow-sm'
                                                    : 'border-slate-200 hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-700'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{loan.productName}</span>
                                                    {selectedLoan?.id === loan.id && <FiCheckCircle className="text-sky-600 dark:text-sky-400" />}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                                    <p>Loan ID: {loan.id}</p>
                                                    <p className="text-sm font-semibold">Outstanding (बकाया): {formatCurrency(loan.outstandingBalance)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: EMI Selection */}
                        {selectedLoan && (
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">3. Pending EMIs (बकाया किश्त)</h2>
                                {isLoadingEmis ? (
                                    <div className="py-4"><Loader /></div>
                                ) : activeEmis.length === 0 ? (
                                    <div className="text-sm text-emerald-600 bg-emerald-50 p-4 rounded-xl dark:bg-emerald-900/20 dark:text-emerald-400">
                                        All EMIs are paid for this loan. (सभी किश्त जमा हैं)
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                                        {activeEmis.map(emi => (
                                            <div
                                                key={emi.emiNumber}
                                                onClick={() => handleSelectEmi(emi)}
                                                className={`cursor-pointer rounded-2xl border p-3 transition-all ${selectedEmi?.emiNumber === emi.emiNumber
                                                    ? 'border-sky-500 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-900/10 shadow-sm'
                                                    : 'border-slate-200 hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-700'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold text-slate-900 dark:text-white">EMI #{emi.emiNumber}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emi.status === 'Overdue'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                        }`}>{emi.status}</span>
                                                </div>
                                                <div className="text-base font-bold text-slate-900 dark:text-white my-1">
                                                    {formatCurrency(emi.amount)}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <FiCalendar size={10} /> Due: {new Date(emi.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Payment Details */}
                        {selectedEmi && (
                            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">4. Payment Details (भुगतान विवरण)</h2>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <Input label="Payment Date (तारीख) *" id="paymentDate" type="date" value={formData.paymentDate} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <Input label="Amount Paid (जमा राशि) *" id="amountPaid" value={formData.amountPaid} onChange={handleChange} placeholder="₹ 0" />
                                        {Number(formData.amountPaid) !== selectedEmi.amount && Number(formData.amountPaid) > 0 && (
                                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Note: Amount differs from exact EMI amount.</p>
                                        )}
                                    </div>
                                    <div>
                                        <Select
                                            label="Payment Method (माध्यम) *"
                                            id="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'Cash', label: 'Cash (नकद)' },
                                                { value: 'UPI', label: 'UPI' },
                                                { value: 'Bank Transfer', label: 'Bank Transfer' }
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label={`Reference Number ${['UPI', 'Bank Transfer'].includes(formData.paymentMethod) ? '*' : '(Optional)'}`}
                                            id="referenceNumber"
                                            value={formData.referenceNumber}
                                            onChange={handleChange}
                                            placeholder="Txn ID, UTR, etc."
                                            disabled={formData.paymentMethod === 'Cash'}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input label="Notes (Optional)" id="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional comments..." />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Live Summary Panel */}
                    <div className="xl:w-[360px] shrink-0">
                        <div className="sticky top-6 rounded-3xl border border-sky-100 bg-sky-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment Summary</h2>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                                    <FiCreditCard size={20} />
                                </div>
                            </div>

                            {!selectedCustomer ? (
                                <div className="text-sm text-slate-500 text-center py-8">Select a customer to begin.</div>
                            ) : (
                                <div className="space-y-4 text-sm">
                                    <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-slate-600 dark:text-slate-400">Customer</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{selectedCustomer.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Loan ID</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{selectedLoan ? selectedLoan.id : '-'}</span>
                                        </div>
                                    </div>

                                    {selectedEmi && (
                                        <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-slate-600 dark:text-slate-400">EMI No.</span>
                                                <span className="font-medium text-slate-900 dark:text-white">#{selectedEmi.emiNumber}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-slate-600 dark:text-slate-400">EMI Amount</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(selectedEmi.amount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Paying Amount</span>
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(formData.amountPaid)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {selectedLoan && (
                                        <div className="pt-2">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-slate-600 dark:text-slate-400">Previous Balance</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(selectedLoan.outstandingBalance)}</span>
                                            </div>
                                            <div className="flex justify-between items-center rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">New Balance</span>
                                                <span className="font-bold text-lg text-sky-600 dark:text-sky-400">{formatCurrency(remainingBalance)}</span>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/80 bg-white/95 p-4 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95 md:pl-64">
                    <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 sm:gap-4">
                        <Button type="button" variant="ghost" onClick={handleReset} className="text-slate-600 dark:text-slate-300 text-lg px-6 py-3">
                            Reset
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="text-lg px-6 py-3">
                            Cancel (रद्द करें)
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !selectedEmi || Number(formData.amountPaid) <= 0}
                            className="min-w-[200px] flex justify-center items-center gap-2 text-xl px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isSubmitting ? 'Processing...' : 'Save (जमा करें)'}
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

export default RecordPaymentPage;
