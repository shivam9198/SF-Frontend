import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Loader from '../components/common/Loader'
import ProtectedRoute from './ProtectedRoute'

const DashboardPage = lazy(() => import('../pages/Dashboard/Dashboard'))
const CustomersPage = lazy(() => import('../pages/Customers/Customers'))
const CustomerDetailsPage = lazy(() => import('../pages/Customers/CustomerDetails'))
const AddCustomerPage = lazy(() => import('../pages/Customers/AddCustomer'))
const LoansPage = lazy(() => import('../pages/Loans/Loans'))
const LoanDetailsPage = lazy(() => import('../pages/Loans/LoanDetails'))
const AddLoanPage = lazy(() => import('../pages/Loans/AddLoan'))
const LoanEmiSchedulePage = lazy(() => import('../pages/Loans/EmiSchedule'))
const EmiSchedulePage = lazy(() => import('../pages/Payments/EmiSchedule'))
const PaymentsPage = lazy(() => import('../pages/Payments/Payments'))
const RecordPaymentPage = lazy(() => import('../pages/Payments/RecordPayment'))
const PaymentDetailsPage = lazy(() => import('../pages/Payments/PaymentDetails'))
const OverduePage = lazy(() => import('../pages/Reports/Overdue'))
const OverdueDetailsPage = lazy(() => import('../pages/Reports/OverdueDetails'))
const ReportsPage = lazy(() => import('../pages/Reports/Reports'))
const StaffPage = lazy(() => import('../pages/Staff/Staff'))
const AddStaffPage = lazy(() => import('../pages/Staff/AddStaff'))
const StaffProfilePage = lazy(() => import('../pages/Staff/StaffProfile'))
const EditStaffPage = lazy(() => import('../pages/Staff/EditStaff'))
const AccessDeniedPage = lazy(() => import('../pages/System/AccessDenied'))
const NotFoundPage = lazy(() => import('../pages/System/NotFound'))
const ProfilePage = lazy(() => import('../pages/Profile/Profile'))

function AppRoutes() {
    return (
        <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><Loader /></div>}>
            <Routes>
                {/* Protected Routes for all authenticated users */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                <Route path="/customers/new" element={<ProtectedRoute><AddCustomerPage /></ProtectedRoute>} />
                <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailsPage /></ProtectedRoute>} />
                <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
                <Route path="/loans/new" element={<ProtectedRoute><AddLoanPage /></ProtectedRoute>} />
                <Route path="/loans/:loanId" element={<ProtectedRoute><LoanDetailsPage /></ProtectedRoute>} />
                <Route path="/loans/:loanId/emi-schedule" element={<ProtectedRoute><LoanEmiSchedulePage /></ProtectedRoute>} />
                <Route path="/emi-schedule" element={<ProtectedRoute><EmiSchedulePage /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
                <Route path="/payments/new" element={<ProtectedRoute><RecordPaymentPage /></ProtectedRoute>} />
                <Route path="/payments/:paymentId" element={<ProtectedRoute><PaymentDetailsPage /></ProtectedRoute>} />
                <Route path="/overdue" element={<ProtectedRoute><OverduePage /></ProtectedRoute>} />
                <Route path="/overdue/:loanId" element={<ProtectedRoute><OverdueDetailsPage /></ProtectedRoute>} />
                
                {/* Admin Only Routes */}
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin']}><ReportsPage /></ProtectedRoute>} />
                <Route path="/staff" element={<ProtectedRoute allowedRoles={['Admin']}><StaffPage /></ProtectedRoute>} />
                <Route path="/staff/new" element={<ProtectedRoute allowedRoles={['Admin']}><AddStaffPage /></ProtectedRoute>} />
                <Route path="/staff/:id" element={<ProtectedRoute allowedRoles={['Admin']}><StaffProfilePage /></ProtectedRoute>} />
                <Route path="/staff/:id/edit" element={<ProtectedRoute allowedRoles={['Admin']}><EditStaffPage /></ProtectedRoute>} />
                
                {/* System Routes */}
                <Route path="/access-denied" element={<AccessDeniedPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    )
}

export default AppRoutes

