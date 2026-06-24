import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  FileDown,
  Info,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

const tableRows = [
  ["w-16", "w-28", "w-36", "w-16"],
  ["w-16", "w-28", "w-40", "w-14"],
  ["w-16", "w-28", "w-32", "w-16"],
];

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 max-w-5xl mx-auto p-4 lg:p-6 font-lexend">
      <div className="rounded-lg border bg-card/70 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/10">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36 rounded-sm" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex h-10 w-32 shrink-0 items-center justify-center gap-2 rounded-md border bg-background/60 px-3 self-start sm:self-auto">
            <FileDown className="h-4 w-4 text-muted-foreground/70" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Preview content */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2 max-w-xs mx-auto">
            <Skeleton className="h-5 w-40 mx-auto" />
            <Skeleton className="h-4 w-28 mx-auto" />
          </div>

          {/* Routine Table */}
          <div className="rounded-md border overflow-hidden">
            {/* Table Head */}
            <div className="grid grid-cols-[1fr_1.5fr_2fr_1fr] items-center border-b bg-muted/30 px-4 h-11">
              {[
                { icon: Calendar, label: "Day", width: "w-8" },
                { icon: Clock, label: "Time", width: "w-10" },
                { icon: BookOpen, label: "Course", width: "w-14" },
                { icon: MapPin, label: "Room", width: "w-10" },
              ].map(({ icon: Icon, width }, index) => (
                <div key={index} className="flex items-center gap-2 px-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <Skeleton className={`h-3.5 ${width}`} />
                </div>
              ))}
            </div>

            {/* Table Rows */}
            <div className="divide-y bg-background/30">
              {tableRows.map((widths, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_2fr_1fr] items-center px-4 h-14">
                  <div className="px-2">
                    <Skeleton className={`h-4 ${widths[0]}`} />
                  </div>
                  <div className="px-2">
                    <Skeleton className={`h-4 font-mono ${widths[1]}`} />
                  </div>
                  <div className="px-2">
                    <Skeleton className={`h-4 font-medium ${widths[2]}`} />
                  </div>
                  <div className="px-2">
                    <Skeleton className={`h-4 ${widths[3]}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Tip */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground/60 mt-0.5" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

