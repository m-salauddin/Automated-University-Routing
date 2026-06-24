import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 font-lexend">
      {/* Avatar + name header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="space-y-3 text-center sm:text-left w-full">
          <Skeleton className="h-7 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-5 w-24 rounded-full mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-36 mx-auto sm:mx-0" />
        </div>
      </div>

      {/* Info card */}
      <div className="border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "w-12", value: "w-40" },
            { label: "w-10", value: "w-48" },
            { label: "w-16", value: "w-36" },
            { label: "w-14", value: "w-44" },
            { label: "w-20", value: "w-32" },
            { label: "w-18", value: "w-40" },
          ].map((sizes, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className={`h-3 ${sizes.label}`} />
              <Skeleton className={`h-10 w-full rounded-md`} />
            </div>
          ))}
        </div>
      </div>

      {/* Security / additional card */}
      <div className="border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-9 w-20 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
