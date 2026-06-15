import Button from '../../../components/common/Button'
import Card from '../../../components/common/Card'
import { formatCurrency, formatDate } from '../../../utils/format'

function UpcomingDue({ items }) {
    return (
        <Card>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upcoming EMI Due</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Payments scheduled for the next week.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {items.length} due
                </span>
            </div>
            <div className="mt-6 space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/80 dark:bg-slate-950">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.customer}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Due on {formatDate(item.dueDate)}</p>
                            </div>
                            <span className="rounded-3xl bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                                {item.daysLeft} days left
                            </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <p className="font-semibold">{formatCurrency(item.amount)}</p>
                            <Button variant="ghost">View</Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default UpcomingDue
