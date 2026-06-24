import {
  User,
  Mail,
  Building2,
  Shield,
  AtSign,
  IdCard,
  GraduationCap,
  Calendar,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="skeleton-sweep w-full min-w-0 mx-auto p-5 font-lexend max-w-[1600px]">
      <div className="flex flex-col gap-8">
        {/* Banner header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 rounded-sm" />
            <Skeleton className="h-9 w-64 md:h-10 rounded-sm" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[350px_1fr]">
          {/* Left Column */}
          <div className="h-full flex gap-6 flex-col">
            {/* Avatar Card */}
            <div className="rounded-lg border bg-card/70 shadow-lg overflow-hidden relative p-4 pt-12 flex flex-col items-center text-center">
              {/* Blur overlay */}
              <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-br from-primary/20 via-blue-500/20 to-purple-500/20 blur-2xl opacity-60" />
              
              {/* Avatar circle wrapper */}
              <div className="relative mb-6 p-1.5 rounded-full bg-background shadow-sm ring-1 ring-border z-10">
                <Skeleton className="h-40 w-40 rounded-full" />
                <span className="absolute bottom-2 right-4 h-5 w-5 rounded-full border-4 border-background bg-green-500/50"></span>
              </div>

              <div className="space-y-6 mb-6 w-full z-10">
                <div className="space-y-2 flex flex-col items-center">
                  <Skeleton className="h-6 w-44 rounded-sm" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>

            {/* Detail list card */}
            <div className="rounded-lg border bg-card/70 shadow-lg overflow-hidden divide-y divide-border/50 text-sm">
              <div className="flex justify-between items-center px-6 py-4">
                <span className="text-muted-foreground flex items-center gap-3 font-medium">
                  <IdCard className="w-4 h-4 text-primary/70" /> Username
                </span>
                <Skeleton className="h-4 w-20 font-mono" />
              </div>
              <div className="flex justify-between items-center px-6 py-4">
                <span className="text-muted-foreground flex items-center gap-3 font-medium">
                  <GraduationCap className="w-4 h-4 text-primary/70" /> Department
                </span>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 h-full">
            <div className="rounded-lg border bg-card/70 shadow-lg h-full p-6">
              {/* Card Header */}
              <div className="space-y-1.5 pb-6 border-b">
                <div className="text-xl text-foreground flex items-center gap-2 font-semibold">
                  <User className="w-5 h-5 text-primary/70" />
                  <Skeleton className="h-6 w-48 rounded-sm" />
                </div>
                <Skeleton className="h-4 w-80" />
              </div>

              {/* Card Content fields */}
              <div className="space-y-8 pt-8">
                {/* Row 1: Full Name & ID */}
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-20 rounded-sm" />
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <div className="pl-9 h-11 flex items-center bg-muted/30 border border-border/60 rounded-md">
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24 rounded-sm" />
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <div className="pl-9 h-11 flex items-center bg-muted/30 border border-border/60 rounded-md">
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Username & Email */}
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-20 rounded-sm" />
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <div className="pl-9 h-11 flex items-center bg-muted/30 border border-border/60 rounded-md">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24 rounded-sm" />
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <div className="pl-9 h-11 flex items-center bg-muted/30 border border-border/60 rounded-md">
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Department */}
                <div className="grid gap-8">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24 rounded-sm" />
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <div className="pl-9 h-11 flex items-center bg-muted/30 border border-border/60 rounded-md">
                        <Skeleton className="h-4 w-72 max-w-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 4: Role & Semester */}
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-12 rounded-sm" />
                    <div className="relative">
                      <Shield className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <div className="pl-9 h-11 flex items-center bg-muted/30 border border-border/60 rounded-md">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-3 w-16 rounded-sm" />
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                      <div className="pl-9 h-11 flex items-center bg-muted/30 border border-border/60 rounded-md">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

