import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiPhone, FiMail, FiCalendar, FiCreditCard, FiBriefcase, FiShield, FiUser } from 'react-icons/fi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ErrorState from '../../components/common/ErrorState';
import { rolePermissions, staffService } from '../../services/api/staffService';
import ProfileSkeleton from './components/ProfileSkeleton';

function StaffProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStaff = async () => {
        try {
            setIsLoading(true);
            const data = await staffService.getStaffById(id);
            setStaff(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load staff profile');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [id]);

    if (isLoading) return <ProfileSkeleton />;
    if (error) return <ErrorState message={error} onRetry={fetchStaff} />;
    if (!staff) return null;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate('/staff')} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        <FiArrowLeft />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{staff.name}</h1>
                            <Badge variant={staff.status === 'Active' ? 'success' : 'warning'}>{staff.status}</Badge>
                        </div>
                        <p className="mt-1 text-base text-slate-600 dark:text-slate-300">Staff ID: {staff.id}</p>
                    </div>
                </div>
                <Button onClick={() => navigate(`/staff/${staff.id}/edit`)} className="gap-2">
                    <FiEdit2 /> Edit Staff
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard title="Payments Collected" value={staff.paymentsCollected} icon={<FiCreditCard />} tone="emerald" />
                <StatCard title="Loans Managed" value={staff.loansManaged} icon={<FiBriefcase />} tone="sky" />
                <StatCard title="Role" value={staff.role} icon={staff.role === 'Admin' ? <FiShield /> : <FiUser />} tone="amber" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                    <Card className="rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Basic Information</h2>
                        <div className="mt-5 space-y-4">
                            <Info icon={<FiPhone />} label="Phone Number" value={staff.phone} />
                            <Info icon={<FiMail />} label="Email" value={staff.email} />
                            <Info icon={<FiCalendar />} label="Joining Date" value={new Date(staff.joiningDate).toLocaleDateString('en-IN')} />
                            <Info icon={<FiShield />} label="Password" value="---" />
                        </div>
                    </Card>

                    <Card className="rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Role Permissions</h2>
                        <div className="mt-4 space-y-2">
                            {rolePermissions[staff.role].map((permission) => (
                                <div key={permission} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                                    {permission}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="rounded-2xl lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                    <div className="mt-5 space-y-4">
                        {staff.recentActivity.length > 0 ? (
                            staff.recentActivity.map((activity) => (
                                <div key={activity.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-base font-bold text-slate-900 dark:text-white">{activity.action}</p>
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {new Date(activity.date).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{activity.detail}</p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
                                No recent activity
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, tone }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    };

    return (
        <Card className="rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${tones[tone]}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

function Info({ icon, label, value }) {
    return (
        <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="mt-0.5 text-sky-600 dark:text-sky-300">{icon}</div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 break-words font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

export default StaffProfilePage;
