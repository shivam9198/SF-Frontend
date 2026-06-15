function Button({ children, type = 'button', variant = 'primary', className = '', ...rest }) {
    const styles = {
        primary: 'inline-flex items-center justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-sky-700',
        secondary: 'inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        ghost: 'inline-flex items-center justify-center rounded-3xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
    }

    return (
        <button type={type} className={`${styles[variant] || styles.primary} ${className}`} {...rest}>
            {children}
        </button>
    )
}

export default Button
