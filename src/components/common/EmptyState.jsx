function EmptyState({ title = 'No records found', description = 'Try updating filters or adding new entries.', action }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Empty</p>
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    )
}

export default EmptyState
