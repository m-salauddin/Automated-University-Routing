import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-zinc-50/50 p-4 lg:p-8 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full md:w-[300px] rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
        <Skeleton className="xl:col-span-2 h-[420px] rounded-xl" />
        <Skeleton className="xl:col-span-3 h-[420px] rounded-xl" />
      </div>
    </div>
  );
}
