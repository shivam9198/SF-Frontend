import { useMemo, useState } from 'react'
import Badge from '../../../components/common/Badge'
import Button from '../../../components/common/Button'
import EmptyState from '../../../components/common/EmptyState'
import { formatCurrency, formatDate } from '../../../utils/format'

const STATUS_VARIANT = {
    Received: 'success',
    Pending: 'warning',
    Failed: 'warning',
}

function RecentPaymentsTable({ payments }) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const rowsPerPage = 5

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return payments
        return payments.filter((payment) =>
            [payment.customer, payment.method, payment.status].some((value) =>
                value.toLowerCase().includes(query),
            ),
        )
    }, [payments, search])

    const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
    const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

    return (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Payments</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Latest transactions captured in the system.</p>
                </div>
                <input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                    }}
                    placeholder="Search payments"
                    className="w-full max-w-xs rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
            </div>

            {paginated.length === 0 ? (
                <div className="mt-8">
                    <EmptyState title="No payments found" description="Try a different search or check back later." />
                </div>
            ) : (
                <div className="mt-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
                        <thead className="border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 font-medium">Customer</th>
                                <th className="px-4 py-3 font-medium text-right sm:text-left">Amount</th>
                                <th className="hidden sm:table-cell px-4 py-3 font-medium">Date</th>
                                <th className="hidden md:table-cell px-4 py-3 font-medium">Method</th>
                                <th className="hidden sm:table-cell px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {paginated.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="px-4 py-4">
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{payment.customer}</p>
                                        <p className="sm:hidden text-xs text-slate-500 mt-1">{formatDate(payment.date)} • {payment.status}</p>
                                    </td>
                                    <td className="px-4 py-4 font-semibold text-right sm:text-left text-slate-900 dark:text-slate-100">{formatCurrency(payment.amount)}</td>
                                    <td className="hidden sm:table-cell px-4 py-4 text-slate-500 dark:text-slate-400">{formatDate(payment.date)}</td>
                                    <td className="hidden md:table-cell px-4 py-4 text-slate-500 dark:text-slate-400">{payment.method}</td>
                                    <td className="hidden sm:table-cell px-4 py-4">
                                        <Badge variant={STATUS_VARIANT[payment.status] || 'primary'}>{payment.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {paginated.length} of {filtered.length} payments
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        Page {page} of {pageCount}
                    </span>
                    <Button
                        variant="secondary"
                        onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                        disabled={page >= pageCount}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default RecentPaymentsTable
