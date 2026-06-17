import { useState } from 'react'
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'

function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <div className="relative flex min-h-screen w-full overflow-hidden bg-transparent">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex flex-1 flex-col min-w-0">
                    <Navbar onMenuClick={() => setSidebarOpen((open) => !open)} />
                    <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8 print:p-0 print:m-0 overflow-x-hidden">
                        <div className="mx-auto w-full max-w-[1440px] rounded-3xl border border-slate-200/80 bg-white px-4 py-6 shadow-soft transition-colors duration-300 dark:border-slate-700/80 dark:bg-slate-900 sm:px-6 lg:px-8 print:border-none print:bg-transparent print:shadow-none print:p-0">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default AppLayout
