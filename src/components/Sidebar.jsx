import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { navItems } from '../constants/navItems'
import { MdClose, MdDarkMode, MdLightMode } from 'react-icons/md'
import { classNames } from '../utils/classNames'
import { AuthContext } from '../context/AuthContext'
import Logo from './common/Logo'
import { ThemeContext } from '../context/ThemeContext'

function Sidebar({ open, onClose }) {
    const { user } = useContext(AuthContext)
    const { theme, toggleTheme } = useContext(ThemeContext)
    const visibleItems = navItems.filter((item) => !item.adminOnly || user?.role?.toLowerCase() === 'admin')

    return (
        <>
            <div
                className={classNames(
                    'fixed inset-0 z-20 bg-slate-950/50 transition-opacity duration-300 lg:hidden print:hidden',
                    open ? 'opacity-100 visible' : 'opacity-0 invisible',
                )}
                onClick={onClose}
            />

            <aside
                className={classNames(
                    'fixed inset-y-0 left-0 z-30 flex w-full max-w-[280px] flex-col border-r border-slate-200/90 bg-slate-100 px-4 py-6 shadow-soft transition-transform duration-300 dark:border-slate-700/90 dark:bg-slate-950 lg:static lg:translate-x-0 lg:shadow-none print:hidden',
                    open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                )}
            >
                <div className="flex items-center justify-between gap-4 px-2 lg:hidden">
                    <div>
                        <span className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            <Logo className="h-9 w-9" />
                            Sfurti Finance
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <MdClose size={20} />
                    </button>
                </div>

                <div className="mt-6 hidden items-center gap-3 px-2 lg:flex">
                    <Logo className="h-12 w-12" />
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sfurti Finance</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Management system</p>
                    </div>
                </div>

                <nav className="mt-8 flex-1 overflow-y-auto px-1 pb-8">
                    <div className="space-y-1">
                        {visibleItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${isActive
                                            ? 'bg-slate-900 text-white shadow-soft dark:bg-slate-700'
                                            : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                        }`
                                    }
                                    onClick={onClose}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </div>
                </nav>

                <div className="px-1 lg:hidden">
                    <button
                        type="button"
                        onClick={() => {
                            toggleTheme()
                            onClose()
                        }}
                        className="group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        {theme === 'dark' ? (
                            <MdLightMode className="h-5 w-5 shrink-0" />
                        ) : (
                            <MdDarkMode className="h-5 w-5 shrink-0" />
                        )}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
