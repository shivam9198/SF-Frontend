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
            className={`group flex flex-col justify-between overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl h-full !p-4 sm:!p-5 ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500/50' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 break-words line-clamp-2">{metric.label}</p>
                    <p className="mt-1 sm:mt-2 text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white break-words" title={isCurrency ? formatCurrency(metric.value) : metric.key === 'rate' ? `${metric.value}%` : metric.value}>
                        {isCurrency ? formatCurrency(metric.value) : metric.key === 'rate' ? `${metric.value}%` : metric.value}
                    </p>
                </div>
                <div className="shrink-0 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
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
