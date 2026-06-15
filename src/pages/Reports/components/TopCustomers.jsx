import React from 'react';
import { FiUser } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/format';

const TopCustomers = ({ data }) => {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
            <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Top Customers</h3>
            <div className="space-y-4">
                {data && data.length > 0 ? (
                    data.map((customer, idx) => (
                        <div key={customer.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                    <FiUser />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                                    <p className="text-sm text-slate-500">{customer.totalLoans} loans</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(customer.totalPaid)}</p>
                                <p className="text-sm text-slate-500">Collected</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-sm text-slate-500 py-4">No customer data</div>
                )}
            </div>
        </div>
    );
};

export default TopCustomers;
