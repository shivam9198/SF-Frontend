import React, { useState, useEffect, useContext } from 'react';
import { MdPerson, MdEmail, MdPhone, MdBadge, MdDateRange, MdShield } from 'react-icons/md';
import { authService } from '../../services/api/authService';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/format';

const formatUserId = (id) => {
    if (!id) return '-';
    const idStr = String(id);
    if (idStr.startsWith('USR-')) return idStr;
    return `USR-${idStr.slice(-6).toUpperCase()}`;
};

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await authService.getMe();
            setProfile(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !profile) {
        return <ErrorState message={error || 'Profile not found'} onRetry={loadProfile} />;
    }

    const displayName = profile.name || profile.fullName || profile.username || 'User';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-1 sm:px-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            </div>

            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
                {/* Header Section */}
                <div className="bg-slate-50 px-5 py-6 dark:bg-slate-800/50 sm:px-10 sm:py-8">
                    <div className="flex flex-row items-center gap-4 text-left sm:gap-6">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-2xl font-bold text-white shadow-lg shadow-sky-600/20 sm:h-24 sm:w-24 sm:rounded-3xl sm:text-4xl">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                                {displayName}
                            </h2>
                            <p className="mt-0.5 font-medium capitalize text-sky-600 dark:text-sky-400 sm:mt-1 sm:text-base text-sm">
                                {profile.role || 'Staff'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="px-5 py-6 sm:px-10 sm:py-8">
                    <div className="grid gap-6 sm:gap-8 sm:grid-cols-2">
                        {/* Info Group */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:mb-0 sm:text-sm">
                                Personal Information
                            </h3>

                            <InfoItem icon={<MdPerson />} label="Full Name" value={displayName} />
                            <InfoItem icon={<MdEmail />} label="Email Address" value={profile.email} isLink href={`mailto:${profile.email}`} />
                            <InfoItem icon={<MdPhone />} label="Phone Number" value={profile.phone || profile.phoneNumber} />
                        </div>

                        {/* Account Group */}
                        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:mb-0 sm:text-sm">
                                Account Details
                            </h3>

                            <InfoItem icon={<MdBadge />} label="User ID" value={formatUserId(profile._id || profile.id)} />
                            <InfoItem icon={<MdShield />} label="Account Status" value={
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                    {profile.status || 'Active'}
                                </span>
                            } />
                            <InfoItem icon={<MdDateRange />} label="Joined Date" value={formatDate(profile.createdAt || new Date())} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function InfoItem({ icon, label, value, isLink, href }) {
    if (!value) return null;

    return (
        <div className="flex items-center sm:items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:mt-0.5 sm:rounded-2xl">
                {React.cloneElement(icon, { className: "text-[20px]" })}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">{label}</p>
                {isLink ? (
                    <a
                        href={href}
                        className="mt-0.5 block w-full break-all text-sm font-semibold text-sky-600 transition hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300 sm:break-words sm:text-base sm:font-medium"
                    >
                        {value}
                    </a>
                ) : (
                    <div className="mt-0.5 block w-full break-words text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base sm:font-medium">
                        {value}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;