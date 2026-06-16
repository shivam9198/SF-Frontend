import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiDownload, FiShare2, FiCheckCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Logo from '../../components/common/Logo';
import api from '../../services/api/axios';
import { formatCurrency } from '../../utils/format';

const PaymentDetailsPage = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [payment, setPayment] = useState(null);
    const [loan, setLoan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { payment: statePayment, autoPrint } = location.state || {};

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                
                if (statePayment) {
                    setPayment(statePayment);
                    
                    // Fetch real loan info from backend
                    if (statePayment.rawLoanId) {
                        try {
                            const loanRes = await api.get(`/loans/${statePayment.rawLoanId}`);
                            const loanData = loanRes.data?.loan || loanRes.data;
                            setLoan(loanData);
                        } catch (err) {
                            console.warn("Failed to fetch full loan details", err);
                            // Fallback minimal loan info from statePayment
                            setLoan({
                                customerId: 'N/A',
                                phone: statePayment.customerPhone || 'N/A',
                                productName: 'N/A',
                                months: 'N/A'
                            });
                        }
                    }
                    setError(null);
                } else {
                    // Fallback if accessed directly without state (e.g. page refresh)
                    setError('Payment details not found. Please access this page from the Payments list.');
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch payment details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [paymentId, statePayment]);

    useEffect(() => {
        if (!isLoading && payment && autoPrint) {
            setTimeout(() => window.print(), 500);
        }
    }, [isLoading, payment, autoPrint]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        const text = `Receipt ${payment.id}: ${payment.customerName} paid ${formatCurrency(payment.amount)} for loan ${payment.loanId}.`;
        if (navigator.share) {
            await navigator.share({ title: 'Payment Receipt', text });
            return;
        }
        await navigator.clipboard.writeText(text);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '-';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader /></div>;
    }

    if (error) {
        return <ErrorState message={error} title="Payment Not Found" onRetry={() => navigate('/payments')} />;
    }

    if (!payment || !loan) return null;

    return (
        <div className="space-y-6 pb-12">
            {/* Header / Actions - Hidden when printing */}
            <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/payments')}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Payment Receipt</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {payment.id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="gap-2" onClick={handleShare}>
                        <FiShare2 /> Share
                    </Button>
                    <Button onClick={handlePrint} className="gap-2">
                        <FiPrinter /> Print
                    </Button>
                </div>
            </div>

            {/* Receipt Container */}
            <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-8 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 print:shadow-none print:border-none print:p-0 print:dark:bg-white print:dark:text-black">
                
                {/* Receipt Header */}
                <div className="border-b border-slate-200 pb-6 dark:border-slate-700 print:border-slate-300 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Logo className="h-12 w-12" />
                        <div>
                            <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400 print:text-sky-700">Sfurti Finance</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 print:text-slate-600">EMI Collection Receipt</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white print:text-black">Receipt No: {payment.id}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 print:text-slate-600 mt-1">Date: {formatDate(payment.paymentDate)}</p>
                    </div>
                </div>

                {/* Success Banner */}
                <div className="my-8 flex flex-col items-center justify-center py-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 print:bg-emerald-50">
                    <FiCheckCircle className="text-emerald-500 mb-3" size={48} />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-black">Payment Successful</h3>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(payment.amount)}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2">
                    {/* Customer Info */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 print:text-slate-500">Customer Details</h4>
                        <div className="space-y-2 text-sm">
                            <p className="flex justify-between md:block"><span className="text-slate-500 md:hidden">Name: </span><span className="font-semibold text-slate-900 dark:text-white print:text-black">{typeof payment.customerName === 'object' ? (payment.customerName.fullName || payment.customerName.name || 'Unknown') : payment.customerName}</span></p>
                            <p className="flex justify-between md:block"><span className="text-slate-500 md:hidden">Phone: </span><span className="text-slate-600 dark:text-slate-300 print:text-slate-700">{typeof loan.phone === 'object' ? loan.phone.toString() : (loan.phone || payment.customerPhone || (typeof loan.customerId === 'object' ? loan.customerId.phone : '') || 'N/A')}</span></p>
                            <p className="flex justify-between md:block"><span className="text-slate-500 md:hidden">Customer ID: </span><span className="text-slate-600 dark:text-slate-300 print:text-slate-700">{(typeof loan.customerId === 'object' ? (loan.customerId.id || loan.customerId._id) : loan.customerId) || (typeof loan.customer === 'object' ? (loan.customer.customerId || loan.customer.id || loan.customer._id) : loan.customer) || 'N/A'}</span></p>
                        </div>
                    </div>

                    {/* Loan Info */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 print:text-slate-500">Loan Details</h4>
                        <div className="space-y-2 text-sm">
                            <p className="flex justify-between md:block"><span className="text-slate-500 md:hidden">Loan ID: </span><span className="font-semibold text-slate-900 dark:text-white print:text-black">{payment.loanId}</span></p>
                            <p className="flex justify-between md:block"><span className="text-slate-500 md:hidden">Product: </span><span className="text-slate-600 dark:text-slate-300 print:text-slate-700">{loan.productName || 'N/A'}</span></p>
                            <p className="flex justify-between md:block"><span className="text-slate-500 md:hidden">EMI Number: </span><span className="text-slate-600 dark:text-slate-300 print:text-slate-700">#{payment.emiNumber} {loan.months ? `of ${loan.months}` : ''}</span></p>
                        </div>
                    </div>
                </div>

                {/* Transaction Info */}
                <div className="border-t border-slate-200 pt-6 dark:border-slate-700 print:border-slate-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 print:text-slate-500">Transaction Info</h4>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 print:text-slate-600 mb-1">Payment Method</p>
                            <p className="font-medium text-slate-900 dark:text-white print:text-black">{payment.paymentMethod}</p>
                        </div>
                        {payment.referenceNumber && (
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 print:text-slate-600 mb-1">Reference No.</p>
                                <p className="font-medium text-slate-900 dark:text-white print:text-black">{payment.referenceNumber}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 print:text-slate-600 mb-1">Collected By</p>
                            <p className="font-medium text-slate-900 dark:text-white print:text-black">{payment.collectedBy}</p>
                        </div>
                        {payment.notes && (
                            <div className="col-span-2">
                                <p className="text-slate-500 dark:text-slate-400 print:text-slate-600 mb-1">Notes</p>
                                <p className="text-slate-900 dark:text-slate-300 print:text-black">{payment.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center text-xs text-slate-400 print:text-slate-500">
                    <p>This is a computer-generated receipt and does not require a physical signature.</p>
                    <p className="mt-1">Thank you for choosing Sfurti Finance.</p>
                </div>

            </div>
        </div>
    );
};

export default PaymentDetailsPage;
