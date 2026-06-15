function Loader({ className = '' }) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600 dark:border-slate-700 dark:border-t-sky-400" />
        </div>
    )
}

export default Loader
