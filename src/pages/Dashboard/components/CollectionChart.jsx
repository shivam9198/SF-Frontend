import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import Card from '../../../components/common/Card'
import { formatCurrency } from '../../../utils/format'

function CollectionChart({ data }) {
    return (
        <Card className="min-h-[420px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Monthly Collection</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">See your collection progress versus the previous month.</p>
                </div>
                <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    Latest month: {formatCurrency(data[data.length - 1].current)}
                </div>
            </div>
            <div className="mt-6 h-[320px] sm:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="collectionGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: 24, borderColor: '#cbd5e1' }} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ marginTop: -12 }} />
                        <Area type="monotone" dataKey="current" stroke="#0ea5e9" fill="url(#collectionGradient)" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="previous" stroke="#9333ea" strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}

export default CollectionChart
