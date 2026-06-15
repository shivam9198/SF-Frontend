function Badge({ children, variant = 'primary', className = '' }) {
    const styles = {
        primary: 'inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/50 dark:text-sky-200',
        success: 'inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
        warning: 'inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    }

    return <span className={`${styles[variant] || styles.primary} ${className}`}>{children}</span>
}

export default Badge
