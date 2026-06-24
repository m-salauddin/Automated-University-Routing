"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Department = { id: number; name: string };
type Semester = { id: number; name: string; order: number };
type Course = {
  id: number;
  course_code: string;
  course_name: string;
  room_number: string;
  credits: number;
  course_type: string;
  course_type_name?: string | null;
  teacher: number | null;
  teacher_name: string | null;
  department: number;
  department_name: string | null;
  semester: number;
  semester_name: string | null;
};
type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name: string;
  role: string;
  department?: number | string | null;
  department_name: string | null;
  semester?: number | string | null;
  semester_name: string | null;
};

interface DepartmentDetailPageProps {
  department: Department;
  semesters: Semester[];
  courses: Course[];
  users: User[];
}

export default function DepartmentDetailPage({
  department,
  semesters = [],
  courses = [],
  users = [],
}: DepartmentDetailPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const batches = useMemo(() => {
    if (!department) return [];
    const uniqueSems = new Set<string>();

    courses.forEach((c: Course) => {
      const matchDept =
        String(c.department) === String(department.id) ||
        (c.department_name &&
          c.department_name.toLowerCase().trim() === department.name.toLowerCase().trim());
      if (matchDept && c.semester_name) {
        uniqueSems.add(c.semester_name);
      }
    });

    users.forEach((u: User) => {
      const matchRole = u.role?.toUpperCase() === "STUDENT";
      const matchDept =
        (u.department !== undefined && u.department !== null && String(u.department) === String(department.id)) ||
        (u.department_name &&
          u.department_name.toLowerCase().trim() === department.name.toLowerCase().trim());
      if (matchRole && matchDept && u.semester_name) {
        uniqueSems.add(u.semester_name);
      }
    });

    return Array.from(uniqueSems).map((semName: string) => {
      const studentCount = users.filter((u: User) => {
        const matchRole = u.role?.toUpperCase() === "STUDENT";
        const matchDept =
          (u.department !== undefined && u.department !== null && String(u.department) === String(department.id)) ||
          (u.department_name &&
            u.department_name.toLowerCase().trim() === department.name.toLowerCase().trim());
        const matchSem = u.semester_name && u.semester_name.toLowerCase().trim() === semName.toLowerCase().trim();
        return matchRole && matchDept && matchSem;
      }).length;

      const courseCount = courses.filter((c: Course) => {
        const matchDept =
          String(c.department) === String(department.id) ||
          (c.department_name &&
            c.department_name.toLowerCase().trim() === department.name.toLowerCase().trim());
        const matchSem = c.semester_name && c.semester_name.toLowerCase().trim() === semName.toLowerCase().trim();
        return matchDept && matchSem;
      }).length;

      return {
        name: semName,
        studentCount,
        courseCount,
      };
    });
  }, [department, courses, users]);

  const deptCourses = useMemo(() => {
    if (!department) return [];
    return courses.filter((c: Course) => {
      return (
        String(c.department) === String(department.id) ||
        (c.department_name &&
          c.department_name.toLowerCase().trim() === department.name.toLowerCase().trim())
      );
    });
  }, [department, courses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return deptCourses;
    const lowerQuery = searchQuery.toLowerCase().trim();
    return deptCourses.filter(
      (c) =>
        c.course_name.toLowerCase().includes(lowerQuery) ||
        c.course_code.toLowerCase().includes(lowerQuery) ||
        (c.teacher_name && c.teacher_name.toLowerCase().includes(lowerQuery))
    );
  }, [deptCourses, searchQuery]);

  const totalStudentsCount = useMemo(() => {
    return users.filter((u: User) => {
      const matchRole = u.role?.toUpperCase() === "STUDENT";
      const matchDept =
        (u.department !== undefined && u.department !== null && String(u.department) === String(department.id)) ||
        (u.department_name &&
          u.department_name.toLowerCase().trim() === department.name.toLowerCase().trim());
      return matchRole && matchDept;
    }).length;
  }, [department, users]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-lexend text-foreground pb-20">
      {/* Header section with back button */}
      <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Department Detail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {department.name}
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/admin/academic-config")}
          className="h-10 w-10 border border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              Total Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{batches.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{deptCourses.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudentsCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Left Column: Batches & Semesters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Batches / Semesters
            </h3>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {batches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed rounded-xl bg-muted/20">
                <GraduationCap className="h-8 w-8 text-muted-foreground/60 mb-2 stroke-[1.5]" />
                <p className="text-xs text-muted-foreground font-medium">No active batches</p>
              </div>
            ) : (
              batches.map((batch) => (
                <div
                  key={batch.name}
                  className="p-3 bg-muted/40 hover:bg-muted/65 dark:bg-muted/25 dark:hover:bg-muted/35 border border-border/50 rounded-xl flex flex-col gap-2 transition-all"
                >
                  <div className="font-medium text-sm text-foreground flex items-center justify-between">
                    <span>{batch.name}</span>
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 font-normal bg-card">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-1 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      {batch.studentCount} {batch.studentCount === 1 ? "student" : "students"}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                      {batch.courseCount} {batch.courseCount === 1 ? "course" : "courses"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Courses */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                Department Courses
              </h3>
              <Badge variant="secondary" className="font-semibold text-xs py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {deptCourses.length} {deptCourses.length === 1 ? "course" : "courses"}
              </Badge>
            </div>

            {/* Local Course Search */}
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-xl bg-muted/20">
                <BookOpen className="h-10 w-10 text-muted-foreground/60 mb-2 stroke-[1.5]" />
                <p className="text-sm text-muted-foreground font-medium">No courses found</p>
                <p className="text-xs text-muted-foreground/75 mt-1 max-w-[240px]">
                  {searchQuery.trim()
                    ? "Try refining your search query."
                    : "Add courses to this department from the course management dashboard."}
                </p>
              </div>
            ) : (
              filteredCourses.map((course: Course) => {
                const studentCount = users.filter((u: User) => {
                  const matchRole = u.role?.toUpperCase() === "STUDENT";
                  const matchDept =
                    (u.department !== undefined && u.department !== null && String(u.department) === String(department.id)) ||
                    (u.department_name &&
                      u.department_name.toLowerCase().trim() === department.name.toLowerCase().trim());
                  const matchSem =
                    u.semester_name &&
                    course.semester_name &&
                    u.semester_name.toLowerCase().trim() === course.semester_name.toLowerCase().trim();
                  return matchRole && matchDept && matchSem;
                }).length;

                return (
                  <motion.div
                    layout
                    key={course.id}
                    className="p-4 bg-muted/30 border border-border/40 hover:border-border rounded-xl flex flex-col gap-3 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md">
                            {course.course_code}
                          </span>
                          <Badge
                            className={cn(
                              "text-[10px] font-semibold py-0 px-2 rounded-md",
                              (() => {
                                const ct = String(course.course_type || course.course_type_name || "").toLowerCase().trim();
                                return ct === "lab" || ct === "2";
                              })()
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                            )}
                          >
                            {course.course_type_name || (String(course.course_type) === "2" ? "Lab" : String(course.course_type) === "1" ? "Theory" : course.course_type) || "Theory"}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                          {course.course_name}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground bg-muted-foreground/5 px-2.5 py-1 rounded-md sm:self-start">
                        {course.semester_name || "No Semester"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border/30 pt-3 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{studentCount} Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span>{course.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                        <div className="p-0.5 bg-muted-foreground/10 rounded-full shrink-0">
                          <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                        </div>
                        <span className="truncate">
                          {course.teacher_name || "No Teacher"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
