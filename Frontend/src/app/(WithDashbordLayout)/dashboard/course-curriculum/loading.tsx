import {
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  Tag,
  Hash,
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

const tableRows = [
  ["w-16", "w-64", "w-8", "w-20", "w-10", "w-16"],
  ["w-20", "w-48", "w-8", "w-24", "w-8", "w-12"],
  ["w-16", "w-72", "w-8", "w-20", "w-10", "w-14"],
  ["w-20", "w-56", "w-8", "w-20", "w-8", "w-16"],
  ["w-16", "w-64", "w-8", "w-24", "w-10", "w-12"],
  ["w-18", "w-80", "w-8", "w-20", "w-8", "w-14"],
];

function CourseCurriculumCardSkeleton({ index }: { index: number }) {
  return (
    <div className="rounded-lg border bg-card/70 p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 font-mono" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className={index % 2 === 0 ? "h-4 w-4/5" : "h-4 w-3/5"} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase text-muted-foreground/85 font-bold tracking-wider">Credits</span>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase text-muted-foreground/85 font-bold tracking-wider">Semester</span>
          <Skeleton className="h-4 w-12 rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase text-muted-foreground/85 font-bold tracking-wider">Marks</span>
          <Skeleton className="h-3.5 w-8 font-mono" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 max-w-full overflow-x-hidden p-4 font-lexend md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-2 w-full">
            <div>
              <Skeleton className="h-5 w-36 rounded-sm" />
            </div>
            <Skeleton className="h-9 w-60 rounded-sm md:h-10" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-32" />
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>

          <div className="flex gap-2 shrink-0 hidden md:flex">
            <div className="flex h-10 items-center gap-2 rounded-md border bg-background/70 px-4">
              <Printer className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Filters bar */}
          <div className="border-b bg-muted/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {/* Search */}
              <div className="space-y-2 sm:col-span-2 xl:col-span-1">
                <Skeleton className="h-3 w-12 rounded-sm" />
                <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3">
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <Skeleton className="h-3.5 w-28 max-w-full" />
                </div>
              </div>
              {/* Semester */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-sm" />
                <div className="flex h-10 items-center justify-between gap-2 rounded-md border bg-background px-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                  <Skeleton className="h-3 w-3 rounded-sm" />
                </div>
              </div>
              {/* Credits */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-14 rounded-sm" />
                <div className="flex h-10 items-center justify-between gap-2 rounded-md border bg-background px-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-3 rounded-sm" />
                </div>
              </div>
              {/* Marks */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-14 rounded-sm" />
                <div className="flex h-10 items-center justify-between gap-2 rounded-md border bg-background px-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  <Skeleton className="h-3 w-3 rounded-sm" />
                </div>
              </div>
              {/* Columns */}
              <div className="space-y-2 sm:col-span-2 xl:col-span-1">
                <Skeleton className="h-3 w-14 rounded-sm" />
                <div className="flex h-10 items-center justify-between gap-2 rounded-md border bg-background px-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                  <Skeleton className="h-3 w-3 rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Cards for mobile view */}
          <div className="space-y-3 p-3 lg:hidden">
            {[...Array(4)].map((_, index) => (
              <CourseCurriculumCardSkeleton key={index} index={index} />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-[130px_minmax(250px,1fr)_130px_150px_130px_140px] items-center border-b bg-muted/35 px-4 h-12">
              {[
                { icon: Hash, label: "Code", width: "w-10", align: "justify-start" },
                { icon: BookOpen, label: "Course Name", width: "w-28", align: "justify-start" },
                { icon: GraduationCap, label: "Credits", width: "w-14", align: "justify-start" },
                { icon: Calendar, label: "Semester", width: "w-16", align: "justify-start" },
                { icon: Award, label: "Marks", width: "w-12", align: "justify-start" },
                { icon: Tag, label: "Type", width: "w-10", align: "justify-start" },
              ].map(({ icon: Icon, width, align }, index) => (
                <div key={index} className={`flex items-center gap-2 ${align}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <Skeleton className={`h-3.5 ${width}`} />
                </div>
              ))}
            </div>

            {tableRows.map((widths, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[130px_minmax(250px,1fr)_130px_150px_130px_140px] items-center border-b px-4 h-[60px] last:border-b-0"
              >
                <div className="flex items-center">
                  <Skeleton className={`h-4 font-mono ${widths[0]}`} />
                </div>
                <div className="flex items-center min-w-0">
                  <Skeleton className={`h-4 max-w-full ${widths[1]}`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
                  <Skeleton className={`h-4 ${widths[2]}`} />
                </div>
                <div className="flex items-center">
                  <Skeleton className={`h-5 ${widths[3]} rounded-full`} />
                </div>
                <div className="flex items-center">
                  <Skeleton className={`h-4 font-mono ${widths[4]}`} />
                </div>
                <div className="flex items-center">
                  <Skeleton className={`h-6 ${widths[5]} rounded-full`} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-stretch gap-3 border-t bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-36" />
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
              <div className="flex items-center gap-1">
                {[ChevronLeft, ChevronRight].map((Icon, idx) => (
                  <div key={idx} className="flex h-8 w-8 items-center justify-center rounded-md border bg-background/60">
                    <Icon className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

