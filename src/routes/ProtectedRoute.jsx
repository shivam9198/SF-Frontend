import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';

function ProtectedRoute({ allowedRoles, children }) {
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.some(role => role.toLowerCase() === user.role?.toLowerCase())) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
}

export default ProtectedRoute;
