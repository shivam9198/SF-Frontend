import Button from './Button'

function ErrorState({ message = 'Something went wrong while loading.', title = 'Unable to load data', onRetry }) {
    return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-slate-900 dark:border-rose-500/20 dark:bg-slate-900 dark:text-slate-100">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Load error</p>
            <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
            <div className="mt-6 flex justify-center">
                <Button variant="secondary" onClick={onRetry}>
                    Retry
                </Button>
            </div>
        </div>
    )
}

export default ErrorState
