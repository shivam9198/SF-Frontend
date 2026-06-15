function StaffSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                ))}
            </div>
            <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </div>
    );
}

export default StaffSkeleton;
