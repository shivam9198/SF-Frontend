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
                    <main className="flex-1 pb-8 pt-4 print:p-0 print:m-0 overflow-x-hidden">
                        <div className="w-full bg-white px-4 py-6 shadow-soft transition-colors duration-300 dark:bg-slate-900 print:border-none print:bg-transparent print:shadow-none print:p-0 sm:mx-auto sm:max-w-[1440px] sm:rounded-3xl sm:border sm:border-slate-200/80 sm:px-6 sm:dark:border-slate-700/80 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default AppLayout
