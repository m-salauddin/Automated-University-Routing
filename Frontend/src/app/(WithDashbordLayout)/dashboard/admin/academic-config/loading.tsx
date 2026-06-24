import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 max-w-5xl mx-auto p-4 sm:p-6 space-y-8 pb-20 font-lexend">
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <Building2 className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <Skeleton className="h-6 w-32 rounded-sm" />
          </div>
          <div className="flex h-8 w-24 items-center justify-center gap-1.5 rounded-md border bg-background/60">
            <Plus className="h-3.5 w-3.5 text-muted-foreground/70" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card/70 p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-10 font-mono" />
                <div className="h-8 w-8 rounded-md border bg-background/60 flex items-center justify-center">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <Calendar className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <Skeleton className="h-6 w-28 rounded-sm" />
          </div>
          <div className="flex h-8 w-24 items-center justify-center gap-1.5 rounded-md border bg-background/60">
            <Plus className="h-3.5 w-3.5 text-muted-foreground/70" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card/70 p-4 flex flex-col items-center gap-2 shadow-sm">
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <Clock className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <Skeleton className="h-6 w-28 rounded-sm" />
          </div>
          <div className="flex h-8 w-24 items-center justify-center gap-1.5 rounded-md border bg-background/60">
            <Plus className="h-3.5 w-3.5 text-muted-foreground/70" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card/70 shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="h-8 w-8 rounded-md border bg-background/60 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border/50" />

      {/* Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <MapPin className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <Skeleton className="h-6 w-20 rounded-sm" />
          </div>
          <div className="flex h-8 w-24 items-center justify-center gap-1.5 rounded-md border bg-background/60">
            <Plus className="h-3.5 w-3.5 text-muted-foreground/70" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card/70 p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 font-mono" />
                <div className="h-8 w-8 rounded-md border bg-background/60 flex items-center justify-center">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
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

