import {
  Calendar,
  Clock,
  BookOpen,
  Tag,
  MessageSquare,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 max-w-3xl mx-auto p-4 lg:p-6 font-lexend">
      <div className="rounded-lg border bg-card/70 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="p-6 border-b space-y-3 bg-muted/10">
          <Skeleton className="h-6 w-40 rounded-sm" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Form body */}
        <div className="p-6 space-y-5">
          {/* Date + Time slot row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-10 rounded-sm" />
              <div className="flex h-10 items-center gap-2 rounded-md border bg-background/60 px-3">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded-sm" />
              <div className="flex h-10 items-center justify-between gap-2 rounded-md border bg-background/60 px-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-3 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Course + Section row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-14 rounded-sm" />
              <div className="flex h-10 items-center gap-2 rounded-md border bg-background/60 px-3">
                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-sm" />
              <div className="flex h-10 items-center gap-2 rounded-md border bg-background/60 px-3">
                <Tag className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          {/* Reason textarea */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-14 rounded-sm" />
            <div className="flex h-24 items-start gap-2 rounded-md border bg-background/60 p-3">
              <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/70" />
              <Skeleton className="h-4 w-48" />
            </div>
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

