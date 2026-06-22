import { useEffect, useState } from 'react'
import { MdWavingHand } from 'react-icons/md'
import Card from '../../components/common/Card'
import ErrorState from '../../components/common/ErrorState'
import DashboardSkeleton from './components/DashboardSkeleton'
import KpiCard from './components/KpiCard'
import RecentPaymentsTable from './components/RecentPaymentsTable'
import QuickActions from './components/QuickActions'
import CollectionAuditModal from './components/CollectionAuditModal'
import { getDashboardData } from '../../services/api/dashboardService'
import { authService } from '../../services/api/authService'
import { formatCurrency, formatDate, getDayPeriod } from '../../utils/format'

function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [metrics, setMetrics] = useState([])
    const [recentPayments, setRecentPayments] = useState([])
    const [allPayments, setAllPayments] = useState([])
    const [quickActions, setQuickActions] = useState([])
    const [userName, setUserName] = useState('User')

    const [auditModalOpen, setAuditModalOpen] = useState(false)
    const [auditTitle, setAuditTitle] = useState('')
    const [auditFilterMode, setAuditFilterMode] = useState('all')

    const loadDashboard = async () => {
        setLoading(true)
        setError('')

        try {
            // Get user info
            const user = await authService.getMe()
            if (user && (user.name || user.fullName || user.username)) {
                setUserName(user.name || user.fullName || user.username)
            }

            // Get dashboard data
            const data = await getDashboardData()

            setMetrics(data.metrics)
            setRecentPayments(data.recentPayments)
            setAllPayments(data.allPayments || [])
            setQuickActions(data.quickActions)
        } catch (err) {
            console.error('Error loading dashboard data:', err)
            setError('Unable to load dashboard data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
    }, [])

    const handleKpiClick = (metric) => {
        if (metric.key === 'collection') {
            setAuditTitle("Today's Collection Audit")
            setAuditFilterMode('today')
            setAuditModalOpen(true)
        } else if (metric.key === 'month_collection') {
            setAuditTitle("This Month's Collection Audit")
            setAuditFilterMode('month')
            setAuditModalOpen(true)
        } else if (metric.key === 'paid') {
            setAuditTitle("All Paid Installments")
            setAuditFilterMode('all')
            setAuditModalOpen(true)
        }
    }

    const todayCollection = metrics.find((metric) => metric.key === 'collection')?.value || 0

    const greeting = `${getDayPeriod()}, ${userName}`
    const today = formatDate(new Date())

    if (loading) {
        return <DashboardSkeleton />
    }

    if (error) {
        return <ErrorState message={error} onRetry={loadDashboard} />
    }

    return (
        <div className="space-y-6 relative">
            {/* Simple Hero Section */}
            <Card className="bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-sm border border-indigo-100/50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-1 px-3 py-1 bg-indigo-100/50 dark:bg-indigo-500/10 rounded-full">
                            <MdWavingHand size={18} className="text-amber-500 origin-bottom-right animate-[wave_2s_ease-in-out_infinite]" /> 
                            <span className="text-sm font-semibold tracking-wide">Welcome back</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{greeting}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-lg text-sm sm:text-base leading-relaxed">
                            Here is a quick overview of your finance business. You have successfully collected <strong className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md font-bold border border-emerald-200 dark:border-emerald-800/50">{formatCurrency(todayCollection)}</strong> today.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 text-center md:text-right border border-slate-100 dark:border-slate-700 shadow-sm min-w-[160px]">
                        <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">Today's Date</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{today}</p>
                    </div>
                </div>
            </Card>

            {/* Quick Actions at the top for beginners to know what to do */}
            <div className="min-w-0">
                <QuickActions actions={quickActions} />
            </div>

            {/* KPI Metrics - show all metrics requested */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {metrics.map((metric) => {
                    const isClickable = ['collection', 'month_collection', 'paid'].includes(metric.key)
                    return (
                        <KpiCard 
                            key={metric.id} 
                            metric={metric} 
                            onClick={isClickable ? () => handleKpiClick(metric) : undefined} 
                        />
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div className="min-w-0">
                <RecentPaymentsTable payments={recentPayments} />
            </div>

            {/* Collection Audit Modal */}
            <CollectionAuditModal 
                isOpen={auditModalOpen}
                onClose={() => setAuditModalOpen(false)}
                title={auditTitle}
                filterMode={auditFilterMode}
                payments={allPayments}
            />
        </div>
    )
}

export default DashboardPage
