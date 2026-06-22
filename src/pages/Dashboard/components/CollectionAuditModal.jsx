import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';
import { formatCurrency, formatId, formatName, formatPaidDate } from '../../../utils/format';

function CollectionAuditModal({ isOpen, onClose, title, payments, filterMode }) {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const filteredPayments = useMemo(() => {
        if (!payments) return [];
        return payments.filter(p => {
            if (filterMode === 'today') {
                if (!p.date) return false;
                return p.date.startsWith(todayStr);
            }
            if (filterMode === 'month') {
                if (!p.date) return false;
                const pDateObj = new Date(p.date);
                return pDateObj.getMonth() === currentMonth && pDateObj.getFullYear() === currentYear;
            }
            return true;
        });
    }, [payments, filterMode, todayStr, currentMonth, currentYear]);

    const { totalAmount, modeSummary, staffSummary } = useMemo(() => {
        let total = 0;
        const modes = { Cash: 0, UPI: 0, 'Bank Transfer': 0, Card: 0 };
        const staff = {};

        filteredPayments.forEach(p => {
            total += p.amount;

            // Mode summary
            const method = p.method || 'Cash';
            if (modes[method] !== undefined) {
                modes[method] += p.amount;
            } else {
                modes[method] = p.amount;
            }

            // Staff summary
            const staffName = formatName(p.collectedBy || 'System');
            if (!staff[staffName]) {
                staff[staffName] = { count: 0, amount: 0 };
            }
            staff[staffName].count += 1;
            staff[staffName].amount += p.amount;
        });

        return { totalAmount: total, modeSummary: modes, staffSummary: Object.entries(staff) };
    }, [filteredPayments]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <MdClose size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Summaries */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Total Collection Summary</h3>
                            <p className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-4">{formatCurrency(totalAmount)}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-indigo-600/80 dark:text-indigo-400/80">Total Transactions</p>
                                    <p className="font-semibold text-indigo-900 dark:text-indigo-100">{filteredPayments.length}</p>
                                </div>
                                {Object.entries(modeSummary).filter(([_, amt]) => amt > 0).map(([mode, amt]) => (
                                    <div key={mode}>
                                        <p className="text-indigo-600/80 dark:text-indigo-400/80">{mode} Collection</p>
                                        <p className="font-semibold text-indigo-900 dark:text-indigo-100">{formatCurrency(amt)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Staff Collection Summary</h3>
                            <div className="space-y-3">
                                {staffSummary.map(([staffName, data]) => (
                                    <div key={staffName} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{staffName}</p>
                                            <p className="text-xs text-slate-500">{data.count} Payment{data.count !== 1 ? 's' : ''}</p>
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(data.amount)}</p>
                                    </div>
                                ))}
                                {staffSummary.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">No collections found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Transaction Details</h3>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
                                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Customer</th>
                                        <th className="px-4 py-3 font-medium">Customer ID</th>
                                        <th className="px-4 py-3 font-medium">Loan ID</th>
                                        <th className="px-4 py-3 font-medium">EMI No.</th>
                                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                                        <th className="px-4 py-3 font-medium">Mode</th>
                                        <th className="px-4 py-3 font-medium">Paid Date</th>
                                        <th className="px-4 py-3 font-medium">Collected By</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                                    {filteredPayments.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{formatName(p.customer)}</td>
                                            <td className="px-4 py-3">{formatId(p.customerDisplayId || p.customerId || '-')}</td>
                                            <td className="px-4 py-3">{p.loanId}</td>
                                            <td className="px-4 py-3">EMI #{p.emiNumber}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(p.amount)}</td>
                                            <td className="px-4 py-3">{p.method}</td>
                                            <td className="px-4 py-3">{formatPaidDate(p.paidOn)}</td>
                                            <td className="px-4 py-3">{formatName(p.collectedBy)}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                                    Paid
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPayments.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="px-4 py-8 text-center text-slate-500">No transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    , document.body);
}

export default CollectionAuditModal;
