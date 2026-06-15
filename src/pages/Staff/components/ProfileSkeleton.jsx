function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="h-80 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-80 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800 lg:col-span-2" />
            </div>
        </div>
    );
}

export default ProfileSkeleton;
