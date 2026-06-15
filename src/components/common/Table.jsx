function Table({ columns, data, className = '' }) {
    return (
        <div className={`overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-soft dark:border-slate-700/90 dark:bg-slate-900 ${className}`}>
            <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className="px-4 py-3 font-medium uppercase tracking-wide">
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/80">
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                            {columns.map((column) => (
                                <td key={column.key} className="px-4 py-4 text-slate-700 dark:text-slate-200">
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table
