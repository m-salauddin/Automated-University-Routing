import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-3xl mx-auto p-4 lg:p-6">
      <div className="border rounded-lg shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="p-6 border-b flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        {/* Form body */}
        <div className="p-6 space-y-6">
          {/* Date + Time slot row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Course + Section row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Reason textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
