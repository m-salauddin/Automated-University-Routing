import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      <div className="border rounded-md">
        <div className="h-12 border-b bg-muted/50 px-4 flex items-center gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
            {[...Array(5)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
