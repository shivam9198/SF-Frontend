import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6'];

const PaymentDonut = ({ data }) => {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
            <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Payment Method Breakdown</h3>
            <div className="h-[250px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDonut;
