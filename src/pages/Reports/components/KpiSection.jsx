import React from 'react';
import { FiUsers, FiBriefcase, FiCreditCard, FiCalendar } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/format';

const KpiCard = ({ title, value, icon: Icon, tone = 'sky' }) => {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 truncate">{title}</p>
                <p className="mt-1 sm:mt-3 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white truncate" title={String(value)}>
                    {value}
                </p>
            </div>
            <div className={`shrink-0 flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${tones[tone]}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
        </div>
    </div>
    );
};

const KpiSection = ({ data }) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard 
                title="Total Collection This Month" 
                value={formatCurrency(data.totalCollection)} 
                icon={FiCreditCard}
                tone="emerald"
            />
            <KpiCard 
                title="Active Customers" 
                value={data.activeCustomers} 
                icon={FiUsers}
                tone="sky"
            />
            <KpiCard 
                title="Active Loans" 
                value={data.activeLoans} 
                icon={FiBriefcase}
                tone="amber"
            />
            <KpiCard 
                title="Total Pending Amount" 
                value={formatCurrency(data.outstandingAmount)} 
                icon={FiCalendar}
                tone="red"
            />
        </div>
    );
};

export default KpiSection;
