function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Hero Skeleton */}
            <div className="animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700 h-[160px] w-full" />
            
            {/* Quick Actions Skeleton */}
            <div className="animate-pulse space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-700/80 dark:bg-slate-900">
                 <div className="h-6 w-1/4 rounded-full bg-slate-200 dark:bg-slate-700" />
                 <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-700" />
                    ))}
                 </div>
            </div>

            {/* KPIs Skeleton */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-700" />
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="animate-pulse h-[340px] rounded-3xl bg-slate-200 dark:bg-slate-700 w-full" />
        </div>
    )
}

export default DashboardSkeleton
