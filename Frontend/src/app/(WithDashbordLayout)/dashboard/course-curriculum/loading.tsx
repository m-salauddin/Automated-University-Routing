import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-full mx-auto p-4 md:p-6 space-y-6 font-lexend overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 rounded-sm" />
          <Skeleton className="h-9 w-56 md:w-72" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-1 w-1 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-md hidden md:block" />
      </div>

      {/* Table card */}
      <div className="border rounded-xl shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 bg-muted/30 border-b">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Search */}
            <div className="col-span-2 xl:col-span-1 space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            {/* Filters */}
            {["Semester", "Credits", "Marks"].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="hidden lg:flex items-center h-11 border-b bg-muted/30 px-4 gap-4">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 flex-1 max-w-48" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-16" />
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-4 h-14 gap-4">
              <Skeleton className={`h-4 ${i % 2 === 0 ? "w-20" : "w-24"}`} />
              <Skeleton className={`h-4 flex-1 max-w-xs ${i % 3 === 0 ? "w-3/5" : "w-4/5"}`} />
              <Skeleton className="h-4 w-10 hidden lg:block" />
              <Skeleton className="h-5 w-16 rounded-full hidden lg:block" />
              <Skeleton className="h-4 w-10 hidden lg:block" />
              <Skeleton className="h-5 w-14 rounded-full hidden lg:block" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t p-4 bg-background/50">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
