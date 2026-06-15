import { useNavigate } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import Button from '../../components/common/Button';

function SessionExpiredPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-700 dark:bg-slate-900">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300">
                    <FiClock size={30} />
                </div>
                <h1 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">Session Expired</h1>
                <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                    You were logged out after inactivity. Continue to start a new session.
                </p>
                <Button className="mt-6 w-full" onClick={() => navigate('/login')}>Login Again</Button>
            </div>
        </div>
    );
}

export default SessionExpiredPage;
