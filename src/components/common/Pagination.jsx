function Pagination({ page = 1, totalPages = 1, onPageChange }) {
    return (
        <div className="flex items-center justify-between rounded-3xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-700 shadow-soft dark:border-slate-700/90 dark:bg-slate-900 dark:text-slate-200">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-2xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:border-slate-600"
            >
                Previous
            </button>
            <span>
                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
            </span>
            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-2xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:border-slate-600"
            >
                Next
            </button>
        </div>
    )
}

export default Pagination
