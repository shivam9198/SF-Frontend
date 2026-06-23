import { useContext } from 'react'
import { MdPersonAdd, MdAttachMoney, MdReceiptLong, MdBarChart, MdPeople, MdWarning } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import { AuthContext } from '../../../context/AuthContext'

const actionIcons = {
    Add: MdPersonAdd,
    Create: MdAttachMoney,
    Record: MdReceiptLong,
    View: MdBarChart,
    Overdue: MdWarning,
    Customers: MdPeople,
}

function QuickActions({ actions }) {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

    const visibleActions = actions.filter((action) => !action.adminOnly || user.role === 'Admin')

    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quick Actions</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Common tasks that help move the business forward.</p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/customers')}>
                    <span className="hidden sm:inline">View Customers</span>
                    <span className="sm:hidden">View All</span>
                </Button>
            </div>
            <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {visibleActions.map((action) => {
                    const Icon = actionIcons[action.action] || MdBarChart
                    return (
                        <div 
                            key={action.id} 
                            onClick={() => navigate(action.path)}
                            className="group cursor-pointer rounded-3xl border border-slate-200/80 bg-slate-50 p-4 transition hover:bg-slate-100 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900 dark:hover:bg-slate-800 flex flex-col items-center text-center gap-3"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200 group-hover:scale-110 transition-transform">
                                <Icon size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{action.title}</p>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

export default QuickActions
