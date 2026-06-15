import React from 'react';
import { FiAward } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/format';

const StaffLeaderboard = ({ data }) => {
    return (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Staff Leaderboard</h3>
            <div className="space-y-4">
                {data && data.length > 0 ? (
                    data.map((staff, idx) => (
                        <div key={staff.name} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                    idx === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                    idx === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400' :
                                    idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500' :
                                    'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400'
                                }`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{staff.name}</p>
                                    <p className="text-xs text-slate-500">{staff.count} Collections</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(staff.amount)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-sm text-slate-500 py-4">No staff data</div>
                )}
            </div>
        </div>
    );
};

export default StaffLeaderboard;
