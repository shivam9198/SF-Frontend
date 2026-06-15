import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import { MdDarkMode, MdLightMode, MdNotifications, MdMenu, MdSearch } from 'react-icons/md'
import { AuthContext } from '../context/AuthContext'
import Logo from './common/Logo'

function Navbar({ onMenuClick }) {
    const { theme, toggleTheme } = useContext(ThemeContext)
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition-colors duration-300 dark:border-slate-700/80 dark:bg-slate-950/95 print:hidden">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 lg:hidden"
                    >
                        <MdMenu size={22} />
                    </button>
                    <Link to="/dashboard" className="inline-flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        <Logo className="h-10 w-10" />
                        <span className="hidden sm:inline">Sfurti Finance</span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700 shadow-sm transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:max-w-md">
                    <MdSearch className="h-5 w-5 text-slate-500" />
                    <input
                        type="search"
                        placeholder="Search customers, loans, payments..."
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && event.currentTarget.value.trim()) {
                                navigate(`/customers?search=${encodeURIComponent(event.currentTarget.value.trim())}`)
                            }
                        }}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                        {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/overdue')}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        title="View overdue reminders"
                    >
                        <MdNotifications size={22} />
                    </button>

                    <div className="group relative">
                        <button
                            type="button"
                            className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">A</span>
                            <span className="hidden sm:inline">{user?.name}</span>
                        </button>
                        <div className="invisible absolute right-0 mt-2 w-44 rounded-3xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-soft opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                            {user?.role?.toLowerCase() === 'admin' ? (
                                <>
                                    <Link to="/settings" className="block rounded-2xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        My Profile
                                    </Link>
                                    <Link to="/settings" className="block rounded-2xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        Change Password
                                    </Link>
                                </>
                            ) : (
                                <Link to="/dashboard" className="block rounded-2xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    My Dashboard
                                </Link>
                            )}
                            <button type="button" onClick={logout} className="w-full text-left block rounded-2xl px-3 py-2 text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-800">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
