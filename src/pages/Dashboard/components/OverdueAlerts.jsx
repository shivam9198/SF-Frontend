import Button from '../../../components/common/Button'
import Card from '../../../components/common/Card'
import { formatCurrency } from '../../../utils/format'

function OverdueAlerts({ items }) {
    return (
        <Card>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Overdue Alerts</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Highest-risk accounts requiring attention.</p>
                </div>
                <span className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                    Action needed
                </span>
            </div>
            <div className="mt-6 space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-rose-200/80 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-slate-950">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.customer}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatCurrency(item.overdueAmount)} overdue</p>
                            </div>
                            <span className="rounded-3xl bg-rose-500 px-3 py-1 text-xs font-semibold text-white">{item.daysOverdue} days</span>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="secondary">View Details</Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default OverdueAlerts
