import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SessionProvider } from './context/SessionContext'
import AppLayout from './components/layout/AppLayout'
import AppRoutes from './routes/AppRoutes'
import Login from './pages/Auth/Login'

function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <AppLayout>
                    <AppRoutes />
                  </AppLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default App
