function Card({ children, className = '', ...props }) {
    return (
        <section 
            className={`rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-soft transition-colors duration-300 dark:border-slate-700/80 dark:bg-slate-900 ${className}`}
            {...props}
        >
            {children}
        </section>
    )
}

export default Card
