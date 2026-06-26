export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 font-lexend animate-pulse">
      {/* Page header skeleton */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-32 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Stats Cards grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-5 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3.5 w-32 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid skeleton */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Large list/grid container */}
        <div className="md:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-zinc-100 dark:border-zinc-800/80">
            <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-1/4 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
                  </div>
                </div>
                <div className="h-6 w-20 rounded bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Small side panel container */}
        <div className="md:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6 space-y-6">
          <div className="h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-2/3 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
