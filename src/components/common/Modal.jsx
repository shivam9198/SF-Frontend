function Modal({ title, open, onClose, children, actions }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
            <div className="w-full max-w-xl rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-700/90 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                    <button type="button" onClick={onClose} className="text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                        Close
                    </button>
                </div>
                <div className="mt-4">{children}</div>
                {actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
            </div>
        </div>
    )
}

export default Modal
