import { memo } from 'react'
import { MdBarChart, MdPeople, MdSchedule, MdPayment, MdWarning, MdTrendingUp, MdTrendingDown } from 'react-icons/md'
import Card from '../../../components/common/Card'
import Badge from '../../../components/common/Badge'
import { formatCurrency } from '../../../utils/format'

const iconMap = {
    customers: MdPeople,
    loans: MdBarChart,
    active_loans: MdBarChart,
    collection: MdPayment,
    month_collection: MdPayment,
    pending: MdSchedule,
    overdue: MdWarning,
    outstanding: MdWarning,
    rate: MdBarChart,
}

function KpiCard({ metric, onClick }) {
    const Icon = iconMap[metric.key] || MdBarChart
    const isPositive = metric.trend === 'up'
    const isCurrency = ['collection', 'month_collection', 'outstanding'].includes(metric.key)

    return (
        <Card 
            className={`group flex flex-col justify-between overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl h-full !p-3 sm:!p-4 ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500/50' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 break-words line-clamp-2">{metric.label}</p>
                    <p className="mt-1 sm:mt-2 text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white break-words" title={isCurrency ? formatCurrency(metric.value) : metric.key === 'rate' ? `${metric.value}%` : metric.value}>
                        {isCurrency ? formatCurrency(metric.value) : metric.key === 'rate' ? `${metric.value}%` : metric.value}
                    </p>
                </div>
                <div className="shrink-0 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
                <Badge variant={isPositive ? 'success' : 'warning'}>
                    {isPositive ? <MdTrendingUp className="mr-1 inline" /> : <MdTrendingDown className="mr-1 inline" />}
                    {Math.abs(metric.change)}%
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">vs last month</span>
            </div>
        </Card>
    )
}

export default memo(KpiCard)
