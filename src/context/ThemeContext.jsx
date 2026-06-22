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

        const frame = window.requestAnimationFrame(() => {
            document.documentElement.classList.add('theme-ready')
        })

        return () => window.cancelAnimationFrame(frame)
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        window.localStorage.setItem(THEME_KEY, theme)
    }, [theme])

    const setThemeWithAnimation = (nextTheme) => {
        document.documentElement.classList.add('theme-switching')
        window.setTimeout(() => {
            document.documentElement.classList.remove('theme-switching')
        }, 280)

        setTheme(nextTheme)
    }

    const value = useMemo(
        () => ({
            theme,
            setTheme: setThemeWithAnimation,
            toggleTheme: () => setThemeWithAnimation(theme === 'dark' ? 'light' : 'dark'),
        }),
        [theme],
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
