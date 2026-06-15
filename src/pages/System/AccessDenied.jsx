import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import Button from '../../components/common/Button';

function AccessDeniedPage() {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/40 dark:bg-amber-900/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-300">
                <FiLock size={28} />
            </div>
            <h1 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
            <p className="mt-2 max-w-md text-base text-slate-600 dark:text-slate-300">
                Your current role does not have permission to open this page.
            </p>
            <Link to="/dashboard" className="mt-6">
                <Button>Go to Dashboard</Button>
            </Link>
        </div>
    );
}

export default AccessDeniedPage;
