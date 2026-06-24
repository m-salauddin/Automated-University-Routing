import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 lg:p-6">
      <div className="border rounded-lg shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="p-6 border-b flex items-start justify-between gap-4 print:hidden">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md shrink-0" />
        </div>

        {/* Table header row */}
        <div className="hidden sm:flex items-center h-11 bg-muted/30 border-b px-4 gap-6">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {[
            ["w-16", "w-24", "w-20", "w-16"],
            ["w-20", "w-32", "w-16", "w-20"],
            ["w-14", "w-28", "w-24", "w-14"],
          ].map((widths, i) => (
            <div key={i} className="flex items-center h-14 px-4 gap-6">
              <Skeleton className={`h-4 ${widths[0]}`} />
              <Skeleton className={`h-4 ${widths[1]}`} />
              <Skeleton className={`h-4 ${widths[2]}`} />
              <Skeleton className={`h-4 ${widths[3]}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
