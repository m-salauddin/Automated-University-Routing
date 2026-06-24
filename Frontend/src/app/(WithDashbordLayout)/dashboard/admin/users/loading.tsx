import {
  User,
  Mail,
  Shield,
  Hash,
  MoreVertical,
  UserPlus,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

const tableRows = [
  ["w-16", "w-32", "w-20", "w-44", "w-16"],
  ["w-20", "w-28", "w-16", "w-40", "w-20"],
  ["w-16", "w-36", "w-24", "w-48", "w-16"],
  ["w-20", "w-32", "w-20", "w-44", "w-20"],
  ["w-16", "w-28", "w-16", "w-40", "w-16"],
  ["w-18", "w-36", "w-24", "w-48", "w-20"],
  ["w-16", "w-32", "w-20", "w-44", "w-16"],
  ["w-20", "w-28", "w-16", "w-40", "w-20"],
];

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 max-w-full overflow-x-hidden p-4 font-lexend md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-2 w-full">
            <div>
              <Skeleton className="h-5 w-24 rounded-sm" />
            </div>
            <Skeleton className="h-9 w-60 rounded-sm md:h-10" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="flex gap-2 shrink-0 hidden md:flex">
            <div className="flex h-10 items-center gap-2 rounded-md border bg-background/70 px-4">
              <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["w-20", "w-24", "w-16", "w-28"].map((width, i) => (
            <Skeleton key={i} className={`h-9 ${width} rounded-full shrink-0`} />
          ))}
        </div>

        {/* Users Table Card */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-[100px_minmax(200px,1.5fr)_minmax(200px,1.5fr)_140px_60px] items-center border-b bg-muted/35 px-4 h-12">
            {[
              { icon: Hash, label: "ID", width: "w-8" },
              { icon: User, label: "Name", width: "w-16" },
              { icon: Mail, label: "Email / Username", width: "w-28" },
              { icon: Shield, label: "Role", width: "w-12" },
            ].map(({ icon: Icon, width }, index) => (
              <div key={index} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <Skeleton className={`h-3.5 ${width}`} />
              </div>
            ))}
            <div className="flex justify-end">
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y">
            {tableRows.map((widths, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-1 gap-2 p-4 lg:grid-cols-[100px_minmax(200px,1.5fr)_minmax(200px,1.5fr)_140px_60px] lg:items-center lg:p-0 lg:px-4 lg:h-[68px] hover:bg-muted/5"
              >
                {/* ID Column */}
                <div className="flex items-center">
                  <Skeleton className={`h-4 font-mono ${widths[0]}`} />
                </div>

                {/* Name / Avatar Column */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted/60 shrink-0 flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground/70" />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Skeleton className={`h-4 ${widths[1]}`} />
                    <Skeleton className={`h-3 ${widths[2]}`} />
                  </div>
                </div>

                {/* Email Column */}
                <div className="flex items-center">
                  <Skeleton className={`h-4 ${widths[3]}`} />
                </div>

                {/* Role Column */}
                <div className="flex items-center">
                  <Skeleton className={`h-6 ${widths[4]} rounded-full`} />
                </div>

                {/* Actions Column */}
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

