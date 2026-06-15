import { createContext, useEffect, useMemo, useState } from 'react'

export const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
    setTheme: () => { },
})

const THEME_KEY = 'emi-theme'

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        const stored = window.localStorage.getItem(THEME_KEY)
        if (stored === 'dark' || stored === 'light') {
            setTheme(stored)
            document.documentElement.classList.toggle('dark', stored === 'dark')
        }
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        window.localStorage.setItem(THEME_KEY, theme)
    }, [theme])

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
        }),
        [theme],
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
