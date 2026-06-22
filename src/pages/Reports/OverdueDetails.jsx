import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPhoneCall, FiMessageSquare, FiDollarSign, FiClock, FiFileText } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { overdueService } from '../../services/api/overdueService';
import { formatCurrency } from '../../utils/format';

const OverdueDetailsPage = () => {
    const { loanId } = useParams();
    const navigate = useNavigate();
    
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Note form state
    const [newNote, setNewNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    // Follow-up form state
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpType, setFollowUpType] = useState('Call');
    const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await overdueService.getOverdueDetails(loanId);
                setDetails(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch overdue details');
            } finally {
                setIsLoading(false);
            }
        };

        if (loanId) fetchDetails();
    }, [loanId]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        
        setIsSubmittingNote(true);
        try {
            const addedNote = await overdueService.addRecoveryNote(loanId, newNote);
            setDetails(prev => ({
                ...prev,
                notes: [addedNote, ...prev.notes]
            }));
            setNewNote('');
        } catch (err) {
            alert('Failed to add note');
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleAddFollowUp = async (e) => {
        e.preventDefault();
        if (!followUpDate) return;

        setIsSubmittingFollowUp(true);
        try {
            const addedFollowUp = await overdueService.createFollowUp(loanId, { date: followUpDate, type: followUpType, status: 'Pending' });
            setDetails(prev => ({
                ...prev,
                followUps: [addedFollowUp, ...prev.followUps]
            }));
            setFollowUpDate('');
        } catch (err) {
            alert('Failed to create follow-up');
        } finally {
            setIsSubmittingFollowUp(false);
        }
    };

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader /></div>;
    if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    if (!details) return null;

    const { loan, overdueEmis, totalOverdueAmount, daysOverdue, riskLevel, notes, followUps, recentPayments } = details;

    const getRiskColor = (risk) => {
        switch(risk) {
            case 'Low Risk': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
            case 'Medium Risk': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
            case 'High Risk': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
            case 'Critical': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/overdue')}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Customer Overdue Profile</h1>
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${getRiskColor(riskLevel)}`}>
                                {riskLevel}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {loan.customerName} • {loanId}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => navigate(`/customers/${loan.customerId}`)} className="hidden sm:flex gap-2">
                        View Customer
                    </Button>
                    <Button onClick={() => navigate('/payments/new')} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
                        <FiDollarSign /> Collect Payment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Details & Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Overdue Alert Banner */}
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Total Overdue Amount</p>
                            <p className="text-4xl font-bold text-red-700 dark:text-red-300 mt-1">{formatCurrency(totalOverdueAmount)}</p>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{daysOverdue} Days Past Due • {overdueEmis.length} Missed EMIs</p>
                        </div>
                        <button onClick={() => window.location.href = `tel:${loan.phone}`} className="h-14 w-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition">
                            <FiPhoneCall size={24} />
                        </button>
                    </div>

                    {/* Customer & Loan Quick Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiUsers className="text-sky-500" /> Customer Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Name</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{loan.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Phone</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{loan.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Customer ID</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{loan.customerId}</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiFileText className="text-sky-500" /> Loan Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Product</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{loan.productName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">EMI Amount</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(loan.monthlyEmi)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total EMIs</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{loan.months}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Missed EMIs Table */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Missed EMI History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="pb-3 font-medium">EMI No.</th>
                                        <th className="pb-3 font-medium">Due Date</th>
                                        <th className="pb-3 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {overdueEmis.map(emi => (
                                        <tr key={emi.emiNumber}>
                                            <td className="py-3 font-medium text-slate-900 dark:text-white">#{emi.emiNumber}</td>
                                            <td className="py-3 text-slate-600 dark:text-slate-300">{new Date(emi.dueDate).toLocaleDateString()}</td>
                                            <td className="py-3 text-right font-bold text-red-600 dark:text-red-400">{formatCurrency(emi.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Right Column: Actions, Notes & Timeline */}
                <div className="space-y-6">
                    
                    {/* Add Recovery Note */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiMessageSquare /> Add Recovery Note
                        </h3>
                        <form onSubmit={handleAddNote}>
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="E.g., Customer promised to pay by Friday..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                rows={3}
                            />
                            <div className="mt-3 flex gap-2">
                                <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setNewNote('Customer promised to pay tomorrow.')}>Promise to Pay</Button>
                                <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setNewNote('Customer phone switched off.')}>Not Reachable</Button>
                            </div>
                            <Button type="submit" disabled={isSubmittingNote || !newNote.trim()} className="w-full mt-4 justify-center">
                                {isSubmittingNote ? 'Saving...' : 'Save Note'}
                            </Button>
                        </form>
                    </div>

                    {/* Schedule Follow-up */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiClock /> Schedule Follow-up
                        </h3>
                        <form onSubmit={handleAddFollowUp} className="space-y-4">
                            <Input 
                                type="date" 
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <Select 
                                value={followUpType}
                                onChange={(e) => setFollowUpType(e.target.value)}
                                options={[
                                    { value: 'Call', label: 'Call Customer' },
                                    { value: 'Field Visit', label: 'Field Visit' },
                                    { value: 'Legal Notice', label: 'Send Legal Notice' }
                                ]}
                            />
                            <Button type="submit" disabled={isSubmittingFollowUp || !followUpDate} variant="secondary" className="w-full justify-center">
                                {isSubmittingFollowUp ? 'Scheduling...' : 'Set Reminder'}
                            </Button>
                        </form>
                    </div>

                    {/* Timeline / History */}
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 h-max max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 sticky top-0 bg-white dark:bg-slate-900 py-2">Recovery Timeline</h3>
                        
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                            
                            {followUps.map(f => (
                                <div key={f.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-amber-100 text-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <FiClock size={16} />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Scheduled {f.type}</div>
                                        </div>
                                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">Due: {new Date(f.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}

                            {notes.map(note => (
                                <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-sky-100 text-sky-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <FiMessageSquare size={16} />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{note.text}</div>
                                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-2 flex justify-between">
                                            <span>{new Date(note.date).toLocaleDateString()}</span>
                                            <span>{note.staff}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {notes.length === 0 && followUps.length === 0 && (
                                <div className="text-center text-sm text-slate-500 py-4">No recovery notes yet.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OverdueDetailsPage;
