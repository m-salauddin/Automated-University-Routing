import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  User,
  Plus,
  Filter,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 max-w-full overflow-x-hidden p-4 font-lexend md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-2 w-full">
            <div>
              <Skeleton className="h-5 w-28 rounded-sm" />
            </div>
            <Skeleton className="h-9 w-60 rounded-sm md:h-10" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:shrink-0">
            <div className="flex h-10 w-full md:w-28 items-center justify-center gap-1.5 rounded-md border bg-background/60">
              <Filter className="h-4 w-4 text-muted-foreground/70" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex h-10 w-full md:w-32 items-center justify-center gap-1.5 rounded-md border bg-background/60">
              <Plus className="h-4 w-4 text-muted-foreground/70" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Routine Schedule Grid */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full grid grid-cols-1">
          <div className="overflow-x-auto w-full">
            <div className="min-w-[800px] divide-y">
              {/* Table Header: Days / Time slots */}
              <div className="grid grid-cols-[100px_repeat(5,minmax(140px,1fr))] items-center bg-muted/35 px-4 h-12">
                <div className="flex items-center gap-1.5 font-semibold text-muted-foreground/80">
                  <Calendar className="h-3.5 w-3.5" />
                  <Skeleton className="h-3.5 w-10" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                ))}
              </div>

              {/* Sunday */}
              <div className="grid grid-cols-[100px_repeat(5,minmax(140px,1fr))] items-stretch px-4 py-3 gap-3">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-14" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
                <div className="flex items-center justify-center opacity-40">
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-12" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
                <div className="flex items-center justify-center opacity-40">
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </div>

              {/* Monday */}
              <div className="grid grid-cols-[100px_repeat(5,minmax(140px,1fr))] items-stretch px-4 py-3 gap-3">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center justify-center opacity-40">
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-14" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
                <div className="flex items-center justify-center opacity-40">
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-12" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
                <div className="flex items-center justify-center opacity-40">
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>

              {/* Tuesday */}
              <div className="grid grid-cols-[100px_repeat(5,minmax(140px,1fr))] items-stretch px-4 py-3 gap-3">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-14" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
                <div className="flex items-center justify-center opacity-40">
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16 font-mono" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-12" />
                    <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
                <div className="flex items-center justify-center opacity-40">
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
