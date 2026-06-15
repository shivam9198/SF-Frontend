import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

function NotFoundPage() {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">404</p>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
            <p className="mt-2 max-w-md text-base text-slate-600 dark:text-slate-300">
                This page is not available. Please use the menu or return to dashboard.
            </p>
            <Link to="/dashboard" className="mt-6">
                <Button>Go to Dashboard</Button>
            </Link>
        </div>
    );
}

export default NotFoundPage;
