"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  ArrowLeft,
  Search,
  MoreVertical,
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addSemester, updateSemester, deleteSemester } from "@/services/semesters";
import { createCourse, updateCourse, deleteCourse } from "@/services/courses";
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

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
}

function CustomSelect({ value, onChange, options, placeholder = "Select option", id }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef} id={id}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground hover:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring transition-all cursor-pointer"
      >
        <span className={selectedOption ? "text-foreground font-medium" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("h-4 w-4 opacity-50 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg focus:outline-none"
          >
            <div className="p-1">
              {options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                    option.value === value && "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  // Semester CRUD States
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [isDeleteSemModalOpen, setIsDeleteSemModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [deletingSemId, setDeletingSemId] = useState<number | null>(null);
  const [newSemName, setNewSemName] = useState("");
  const [newSemOrder, setNewSemOrder] = useState("");
  const [isSavingSem, setIsSavingSem] = useState(false);

  // Course CRUD States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [credits, setCredits] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [courseType, setCourseType] = useState("Theory");
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Helper Memo for Teachers List
  const teachers = useMemo(() => {
    return users.filter((u) => u.role?.toUpperCase() === "TEACHER");
  }, [users]);

  // Semester Action Handlers
  const openAddSem = () => {
    setEditingSem(null);
    setNewSemName("");
    setNewSemOrder("");
    setIsSemModalOpen(true);
  };

  const openEditSem = (sem: Semester) => {
    setEditingSem(sem);
    setNewSemName(sem.name);
    setNewSemOrder(sem.order.toString());
    setIsSemModalOpen(true);
  };

  const openDeleteSem = (id: number) => {
    setDeletingSemId(id);
    setIsDeleteSemModalOpen(true);
  };

  const handleSaveSemester = async () => {
    if (!newSemName.trim() || !newSemOrder.trim()) {
      toast.error("Name and Order are required");
      return;
    }
    const orderNum = parseInt(newSemOrder);
    if (isNaN(orderNum)) {
      toast.error("Order must be a valid number");
      return;
    }

    setIsSavingSem(true);
    try {
      let res;
      if (editingSem) {
        res = await updateSemester(editingSem.id, { name: newSemName, order: orderNum });
      } else {
        res = await addSemester({ name: newSemName, order: orderNum });
      }

      if (res.success) {
        toast.success(editingSem ? "Semester updated successfully" : "Semester added successfully");
        setIsSemModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to save semester");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSavingSem(false);
    }
  };

  const handleConfirmDeleteSemester = async () => {
    if (!deletingSemId) return;
    setIsSavingSem(true);
    try {
      const res = await deleteSemester(deletingSemId);
      if (res.success) {
        toast.success("Semester deleted successfully");
        setIsDeleteSemModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete semester");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSavingSem(false);
    }
  };

  // Course Action Handlers
  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseCode("");
    setCourseName("");
    setRoomNumber("");
    setCredits("");
    setSelectedSemesterId(semesters[0]?.id ? String(semesters[0].id) : "");
    setSelectedTeacherId(teachers[0]?.id ? String(teachers[0].id) : "");
    setCourseType("Theory");
    setIsCourseModalOpen(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseCode(course.course_code);
    setCourseName(course.course_name);
    setRoomNumber(course.room_number || "");
    setCredits(course.credits.toString());
    setSelectedSemesterId(course.semester ? String(course.semester) : "");
    setSelectedTeacherId(course.teacher ? String(course.teacher) : "");
    const currentCT = String(course.course_type || course.course_type_name || "").toLowerCase().trim();
    setCourseType(currentCT === "lab" || currentCT === "2" ? "Lab" : "Theory");
    setIsCourseModalOpen(true);
  };

  const openDeleteCourse = (id: number) => {
    setDeletingCourseId(id);
    setIsDeleteCourseModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseCode.trim() || !courseName.trim() || !credits.trim() || !selectedSemesterId) {
      toast.error("Code, Name, Credits, and Semester are required");
      return;
    }
    const creditsNum = parseFloat(credits);
    if (isNaN(creditsNum)) {
      toast.error("Credits must be a valid number");
      return;
    }

    setIsSavingCourse(true);
    try {
      const isNoTeacher = !selectedTeacherId || selectedTeacherId === "none";
      const teacherObj = isNoTeacher ? null : teachers.find((t) => String(t.id) === selectedTeacherId);
      const semObj = semesters.find((s) => String(s.id) === selectedSemesterId);

      const payload = {
        course_code: courseCode,
        course_name: courseName,
        room_number: roomNumber,
        credits: creditsNum,
        department: department.id,
        department_name: department.name,
        semester: parseInt(selectedSemesterId),
        semester_name: semObj?.name || "",
        teacher: isNoTeacher ? null : parseInt(selectedTeacherId),
        teacher_name: teacherObj?.name || "",
        course_type: courseType,
      };

      let res;
      if (editingCourse) {
        res = await updateCourse(editingCourse.id, payload);
      } else {
        res = await createCourse(payload);
      }

      if (res.success) {
        toast.success(editingCourse ? "Course updated successfully" : "Course created successfully");
        setIsCourseModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to save course");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleConfirmDeleteCourse = async () => {
    if (!deletingCourseId) return;
    setIsSavingCourse(true);
    try {
      const res = await deleteCourse(deletingCourseId);
      if (res.success) {
        toast.success("Course deleted successfully");
        setIsDeleteCourseModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete course");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSavingCourse(false);
    }
  };

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
        <Card className="bg-card border border-border/80 shadow-sm">
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

        <Card className="bg-card border border-border/80 shadow-sm">
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

        <Card className="bg-card border border-border/80 shadow-sm">
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

      <div className="space-y-8 pt-2">
        {/* Batches & Semesters Section (Now at the top) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                Batches / Semesters
              </h3>
            </div>
            <Button
              size="sm"
              onClick={openAddSem}
              className="gap-1.5 h-8 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Semester
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {batches.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed rounded-xl bg-muted/20">
                <GraduationCap className="h-8 w-8 text-muted-foreground/60 mb-2 stroke-[1.5]" />
                <p className="text-xs text-muted-foreground font-medium">No active batches</p>
              </div>
            ) : (
              batches.map((batch) => {
                const semObj = semesters.find(
                  (s) => s.name.toLowerCase().trim() === batch.name.toLowerCase().trim()
                );
                return (
                  <div
                    key={batch.name}
                    className="p-4 bg-muted/40 hover:bg-muted/65 dark:bg-muted/25 dark:hover:bg-muted/35 border border-border/50 rounded-xl flex flex-col gap-2 transition-all relative group"
                  >
                    <div className="font-medium text-sm text-foreground flex items-center justify-between">
                      <span>{batch.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] py-0.5 px-2 font-normal bg-card">
                          Active
                        </Badge>
                        {semObj && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => openEditSem(semObj)}
                              >
                                <Edit2 className="mr-2 w-3.5 h-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                                onClick={() => openDeleteSem(semObj.id)}
                              >
                                <Trash2 className="mr-2 w-3.5 h-3.5 text-red-500 dark:text-red-400" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
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
                );
              })
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-border/40" />

        {/* Department Courses Section (Now at the bottom) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                Department Courses
              </h3>
              <Badge variant="secondary" className="font-semibold text-xs py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {deptCourses.length} {deptCourses.length === 1 ? "course" : "courses"}
              </Badge>
            </div>

            {/* Local Course Search & Add Course Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button
                size="sm"
                onClick={openAddCourse}
                className="gap-1.5 h-9 text-xs font-semibold shrink-0 animate-none"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Course
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-xl bg-muted/20">
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
                    String(u.department) === String(department.id) ||
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
                    className="p-4 bg-muted/30 border border-border/40 hover:border-border rounded-xl flex flex-col gap-3 transition-all relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md">
                            {course.course_code}
                          </span>
                          <Badge
                            className={cn(
                              "text-[9px] font-semibold py-0 px-2 rounded-md",
                              (() => {
                                const ct = String(course.course_type || course.course_type_name || "").toLowerCase().trim();
                                return ct === "lab" || ct === "2" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400";
                              })()
                            )}
                          >
                            {course.course_type_name || (String(course.course_type) === "2" ? "Lab" : String(course.course_type) === "1" ? "Theory" : course.course_type) || "Theory"}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground leading-snug pt-1">
                          {course.course_name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted-foreground/5 px-2 py-0.5 rounded-md">
                          {course.semester_name || "No Semester"}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => openEditCourse(course)}
                            >
                              <Edit2 className="mr-2 w-3.5 h-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                              onClick={() => openDeleteCourse(course.id)}
                            >
                              <Trash2 className="mr-2 w-3.5 h-3.5 text-red-500 dark:text-red-400" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 border-t border-border/30 pt-3 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{studentCount} Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span>{course.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 border-t border-border/10 pt-2 mt-0.5">
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

      {/* Semester Add/Edit Modal */}
      <Dialog open={isSemModalOpen} onOpenChange={setIsSemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSem ? "Edit Semester" : "Add New Semester"}
            </DialogTitle>
            <DialogDescription>
              {editingSem ? "Modify details of the semester." : "Create a new global semester."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="semName">Semester Name *</Label>
              <Input
                id="semName"
                value={newSemName}
                onChange={(e) => setNewSemName(e.target.value)}
                placeholder="e.g. 1st, 2nd, 3rd"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="semOrder">Order *</Label>
              <Input
                id="semOrder"
                type="number"
                value={newSemOrder}
                onChange={(e) => setNewSemOrder(e.target.value)}
                placeholder="e.g. 1, 2, 3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSemModalOpen(false)}
              disabled={isSavingSem}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSemester}
              disabled={isSavingSem}
              className="gap-2 min-w-[100px]"
            >
              {isSavingSem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingSem ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Semester Delete Dialog */}
      <Dialog open={isDeleteSemModalOpen} onOpenChange={setIsDeleteSemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Semester</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this semester? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSemModalOpen(false)}
              disabled={isSavingSem}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteSemester}
              disabled={isSavingSem}
              className="gap-2 bg-red-600 hover:bg-red-500 text-white min-w-[100px]"
            >
              {isSavingSem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Add/Edit Modal */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? "Modify details of the course." : "Create a new course assigned to this department."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CSE1101"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Operating System"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. B319"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credits">Credits *</Label>
              <Input
                id="credits"
                type="number"
                step="0.25"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="semester">Semester *</Label>
              <CustomSelect
                value={selectedSemesterId}
                onChange={setSelectedSemesterId}
                options={semesters.map((sem) => ({ value: String(sem.id), label: sem.name }))}
                placeholder="Select Semester"
                id="semester"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teacher">Teacher</Label>
              <CustomSelect
                value={selectedTeacherId}
                onChange={setSelectedTeacherId}
                options={[
                  { value: "none", label: "No Teacher Assigned" },
                  ...teachers.map((t) => ({ value: String(t.id), label: t.name })),
                ]}
                placeholder="No Teacher Assigned"
                id="teacher"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="courseType">Course Type *</Label>
              <CustomSelect
                value={courseType}
                onChange={setCourseType}
                options={[
                  { value: "Theory", label: "Theory" },
                  { value: "Lab", label: "Lab" },
                ]}
                placeholder="Select Course Type"
                id="courseType"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCourseModalOpen(false)}
              disabled={isSavingCourse}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCourse}
              disabled={isSavingCourse}
              className="gap-2 min-w-[100px]"
            >
              {isSavingCourse && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingCourse ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Delete Dialog */}
      <Dialog open={isDeleteCourseModalOpen} onOpenChange={setIsDeleteCourseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteCourseModalOpen(false)}
              disabled={isSavingCourse}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteCourse}
              disabled={isSavingCourse}
              className="gap-2 bg-red-600 hover:bg-red-500 text-white min-w-[100px]"
            >
              {isSavingCourse && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
