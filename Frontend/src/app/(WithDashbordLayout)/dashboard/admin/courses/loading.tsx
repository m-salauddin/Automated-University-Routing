import {
  BookOpen,
  Building2,
  Calendar,
  GraduationCap,
  Hash,
  MapPin,
  MoreVertical,
  Search,
  Tag,
  User,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

const filters = ["w-24", "w-20", "w-28", "w-20", "w-16"];
const tableRows = [
  ["w-20", "w-52", "w-10", "w-12", "w-16", "w-12", "w-10", "w-16"],
  ["w-24", "w-64", "w-12", "w-10", "w-14", "w-14", "w-12", "w-20"],
  ["w-20", "w-48", "w-10", "w-12", "w-16", "w-12", "w-10", "w-16"],
  ["w-24", "w-60", "w-12", "w-10", "w-14", "w-14", "w-12", "w-20"],
];

function FilterSkeleton({ width }: { width: string }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-14 rounded-sm" />
      <div className="flex h-10 items-center justify-between gap-3 rounded-md border bg-background px-3">
        <Skeleton className={`h-3.5 ${width}`} />
        <Skeleton className="h-3 w-3 rounded-sm" />
      </div>
    </div>
  );
}

function CourseCardSkeleton({ index }: { index: number }) {
  return (
    <div className="rounded-lg border bg-card/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className={index % 2 === 0 ? "h-5 w-20" : "h-5 w-24"} />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className={index % 2 === 0 ? "h-4 w-4/5" : "h-4 w-3/5"} />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[MapPin, GraduationCap, User, Calendar].map((Icon, itemIndex) => (
          <div
            key={itemIndex}
            className="flex min-w-0 items-center gap-2 rounded-md border bg-background/60 px-3 py-2"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <Skeleton className="h-3.5 w-full max-w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full max-w-full overflow-x-hidden p-4 font-lexend md:p-6">
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-6 w-28 rounded-sm" />
            <Skeleton className="h-9 w-full max-w-72 md:h-10" />
            <Skeleton className="h-4 w-full max-w-[420px]" />
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <div className="col-span-2 flex h-10 items-center gap-2 rounded-md border bg-background/70 px-3 sm:col-span-1 sm:w-34">
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-full rounded-md sm:w-32" />
            <Skeleton className="h-10 w-full rounded-md sm:w-28" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[BookOpen, User, Building2].map((Icon, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border bg-card/70 p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/60">
                <Icon className="h-4 w-4 text-muted-foreground/70" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-20 rounded-sm" />
                <Skeleton className={index === 1 ? "h-5 w-16" : "h-5 w-24"} />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b bg-muted/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <div className="space-y-2 sm:col-span-2 xl:col-span-1">
                <Skeleton className="h-3 w-12 rounded-sm" />
                <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3">
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <Skeleton className="h-3.5 w-28 max-w-full" />
                </div>
              </div>

              {filters.map((width, index) => (
                <FilterSkeleton key={index} width={width} />
              ))}
            </div>
          </div>

          <div className="space-y-3 p-3 lg:hidden">
            {[...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} index={index} />
            ))}
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-[86px_minmax(180px,1.5fr)_72px_86px_90px_86px_76px_86px_44px] items-center border-b bg-muted/35 px-3">
              {[
                { icon: Hash, width: "w-10", align: "justify-start" },
                { icon: BookOpen, width: "w-24", align: "justify-start" },
                { icon: MapPin, width: "w-10", align: "justify-center" },
                { icon: GraduationCap, width: "w-14", align: "justify-center" },
                { icon: Tag, width: "w-12", align: "justify-start" },
                { icon: User, width: "w-14", align: "justify-center" },
                { icon: Building2, width: "w-10", align: "justify-center" },
                { icon: Calendar, width: "w-12", align: "justify-center" },
                { icon: MoreVertical, width: "w-4", align: "justify-end" },
              ].map(({ icon: Icon, width, align }, index) => (
                <div
                  key={index}
                  className={`flex h-12 items-center gap-2 px-2 ${align}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <Skeleton className={`h-3.5 ${width}`} />
                </div>
              ))}
            </div>

            {tableRows.map((widths, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[86px_minmax(180px,1.5fr)_72px_86px_90px_86px_76px_86px_44px] items-center border-b px-3 last:border-b-0"
              >
                <div className="flex h-[68px] items-center px-2">
                  <Skeleton className={`h-4 ${widths[0]}`} />
                </div>
                <div className="flex h-[68px] min-w-0 items-center px-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className={`h-4 max-w-full ${widths[1]}`} />
                    <Skeleton className="h-3 w-32 opacity-80" />
                  </div>
                </div>
                <div className="flex h-[68px] items-center justify-center px-2">
                  <Skeleton className={`h-4 ${widths[2]}`} />
                </div>
                <div className="flex h-[68px] items-center justify-center gap-2 px-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className={`h-4 ${widths[3]}`} />
                </div>
                <div className="flex h-[68px] items-center px-2">
                  <Skeleton className={`h-6 ${widths[4]} rounded-full`} />
                </div>
                <div className="flex h-[68px] items-center justify-center px-2">
                  <Skeleton className={`h-4 ${widths[5]}`} />
                </div>
                <div className="flex h-[68px] items-center justify-center px-2">
                  <Skeleton className={`h-4 ${widths[6]}`} />
                </div>
                <div className="flex h-[68px] items-center justify-center px-2">
                  <Skeleton className={`h-6 ${widths[7]} rounded-full`} />
                </div>
                <div className="flex h-[68px] items-center justify-end px-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-stretch gap-3 border-t bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-36" />
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
              <div className="flex items-center gap-1">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-8 w-8 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
