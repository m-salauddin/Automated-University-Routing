import { BarChart3, Calendar, Layers, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 max-w-full overflow-x-hidden p-4 font-lexend md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 rounded-sm" />
            <Skeleton className="h-8 w-56 sm:w-72" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex h-10 w-full md:w-[300px] items-center justify-between gap-3 rounded-md border bg-background/60 px-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground/70" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3 w-3 rounded-sm" />
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, width: "w-20" },
            { icon: Layers, width: "w-16" },
            { icon: BarChart3, width: "w-24" },
            { icon: Calendar, width: "w-20" },
          ].map(({ icon: Icon, width }, i) => (
            <div key={i} className="rounded-xl border bg-card/70 p-4 shadow-sm h-32 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <div className="h-8 w-8 rounded-md border bg-background/60 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className={`h-3 ${width}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2 rounded-xl border bg-card/70 p-4 shadow-sm h-[420px] flex flex-col justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
          <div className="xl:col-span-3 rounded-xl border bg-card/70 p-4 shadow-sm h-[420px] flex flex-col justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
