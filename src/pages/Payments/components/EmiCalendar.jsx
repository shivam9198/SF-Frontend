import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/format';

const EmiCalendar = ({ schedule }) => {
    // Determine initial month based on schedule (first pending or overdue, else today)
    const [currentDate, setCurrentDate] = useState(() => {
        const firstActive = schedule.find(e => e.status !== 'Paid');
        return firstActive ? new Date(firstActive.dueDate) : new Date();
    });

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Calendar logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getEmisForDay = (day) => {
        return schedule.filter(e => {
            const date = new Date(e.dueDate);
            return date.getDate() === day &&
                   date.getMonth() === currentDate.getMonth() &&
                   date.getFullYear() === currentDate.getFullYear();
        });
    };

    const colorMap = {
        Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-700/90 overflow-hidden shadow-soft">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 md:px-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{monthYearString}</h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition">
                        <FiChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition">
                        <FiChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 md:p-6 overflow-x-auto">
                <div className="min-w-[500px]">
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {blanks.map(blank => (
                            <div key={`blank-${blank}`} className="h-20 sm:h-28 md:h-32 rounded-xl bg-slate-50 dark:bg-slate-800/30"></div>
                        ))}
                        {days.map(day => {
                            const dayEmis = getEmisForDay(day);
                            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                            
                            return (
                                <div key={day} className={`h-20 sm:h-28 md:h-32 p-1.5 sm:p-2 rounded-xl border ${isToday ? 'border-sky-400 dark:border-sky-500 bg-sky-50/50 dark:bg-sky-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'} relative flex flex-col`}>
                                    <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {day}
                                    </span>
                                    <div className="mt-1 flex-1 overflow-y-auto space-y-1 no-scrollbar">
                                        {dayEmis.map(emi => (
                                            <div key={emi.emiNumber} className={`text-xs p-1 sm:p-1.5 rounded-lg border ${colorMap[emi.status]}`}>
                                                <div className="font-semibold truncate">{formatCurrency(emi.amount)}</div>
                                                <div className="text-[9px] sm:text-[10px] truncate">{emi.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmiCalendar;
