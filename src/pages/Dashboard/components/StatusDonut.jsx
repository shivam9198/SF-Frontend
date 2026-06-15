import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import Card from '../../../components/common/Card'
import Badge from '../../../components/common/Badge'

const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444']

function StatusDonut({ data }) {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="min-h-[420px]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">EMI Status Breakdown</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Paid, pending and overdue collections at a glance.</p>
                </div>
                <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-800 dark:bg-slate-800 dark:text-slate-100">Total {total}</Badge>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_0.95fr]">
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={110} paddingAngle={4}>
                                {data.map((entry, index) => (
                                    <Cell key={entry.name} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: 20, borderColor: '#cbd5e1' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full">
                    <div className="space-y-3">
                        {data.map((entry, index) => (
                            <div key={entry.name} className="rounded-3xl border border-slate-200/90 bg-slate-50 p-4 dark:border-slate-700/80 dark:bg-slate-950">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.name}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.value}% of portfolio</p>
                                    </div>
                                    <div className="h-3 w-12 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default StatusDonut
