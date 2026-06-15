function Select({ label, id, options = [], className = '', ...rest }) {
    return (
        <label className="block text-sm text-slate-700 dark:text-slate-200">
            {label && <span className="mb-2 block text-sm font-medium">{label}</span>}
            <select
                id={id}
                className={`w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-slate-800 ${className}`}
                {...rest}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    )
}

export default Select
