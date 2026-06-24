import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-24 rounded-sm" />
        <Skeleton className="h-8 w-56 sm:w-72" />
        <Skeleton className="h-4 w-80 sm:w-[480px]" />
      </div>

      {/* Departments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border/50" />

      {/* Semesters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border/50" />

      {/* Time Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border/50" />

      {/* Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <Skeleton className="h-5 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
