/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState, useMemo, useEffect, startTransition } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Search,
  GraduationCap,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Tag,
  Printer,
  FolderOpen,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  User,
  Building2,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  RotateCcw,
  ShieldBan,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { createCourse, updateCourse, deleteCourse } from "@/services/courses";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// --- TYPES ---
export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  room_number: string;
  credits: number;
  course_type: string;
  teacher: number;
  teacher_name: string;
  department: number;
  department_name: string;
  semester: number;
  semester_name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Semester {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
  username: string;
}

// --- ZOD SCHEMA ---
const courseSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
  course_name: z.string().min(1, "Course name is required"),
  room_number: z.string().min(1, "Room number is required"),
  credits: z.coerce.number().min(0.5, "Minimum 0.5 credits"),
  course_type: z.string().min(1, "Course type is required"),
  teacher: z.string().min(1, "Teacher is required"),
  department: z.string().min(1, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
});

type FormValues = z.infer<typeof courseSchema>;

// --- ANIMATION VARIANTS ---
const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};
const pageItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

// --- HELPERS ---
const getInitials = (name: string) => {
  if (!name) return "";
  return name.match(/[A-Z]/g)?.join("") || name.substring(0, 3).toUpperCase();
};

interface AutomatedRoutineCoursesProps {
  courses: Course[];
  departments: Department[];
  semesters: Semester[];
  teachers: User[];
}

// --- MAIN COMPONENT ---
export default function AutomatedRoutineCourses({
  courses = [],
  departments = [],
  semesters = [],
  teachers = [],
}: AutomatedRoutineCoursesProps) {
  const user = useSelector((state: RootState) => state.auth);

  if (user?.role !== "admin") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-[80vh] w-full flex flex-col font-lexend items-center justify-center gap-6 text-center px-4"
      >
        <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-900/40 shadow-sm">
          <ShieldBan className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <div className="space-y-3 max-w-[500px]">
          <h2 className="sm:text-2xl text-xl font-bold tracking-tight text-foreground">
            Access Restricted
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base leading-relaxed">
            This page is exclusively for administrators. It seems you do not
            have the required permissions to view this content.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4" /> Go Back
        </Button>
      </motion.div>
    );
  }

  const router = useRouter();

  // --- LOCAL STATE ---
  const [coursesList, setCoursesList] = useState<Course[]>(courses);

  useEffect(() => {
    setCoursesList(courses);
  }, [courses]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [creditFilter, setCreditFilter] = useState("All");
  const [teacherFilter, setTeacherFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Course;
    direction: "asc" | "desc";
  } | null>(null);

  // Modals & Action States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // --- DERIVED LISTS FOR FILTER DROPDOWNS ---
  const { uniqueTeachers, uniqueDepts, uniqueSemesters, availableCredits } =
    useMemo(() => {
      const teachersMap = new Map();
      const deptsMap = new Map();
      const semsMap = new Map();
      const creditsSet = new Set<number>();

      courses.forEach((c) => {
        teachersMap.set(c.teacher, c.teacher_name);
        deptsMap.set(c.department, c.department_name);
        semsMap.set(c.semester, c.semester_name);
        creditsSet.add(c.credits);
      });

      return {
        uniqueTeachers: Array.from(teachersMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        uniqueDepts: Array.from(deptsMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        uniqueSemesters: Array.from(semsMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.id - b.id),
        availableCredits: Array.from(creditsSet).sort((a, b) => a - b),
      };
    }, [courses]);

  // --- FORM HOOKS ---
  const form = useForm<FormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      course_code: "",
      course_name: "",
      room_number: "",
      credits: 3,
      course_type: "",
      teacher: "",
      department: "",
      semester: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  // --- MODAL HANDLERS ---
  const openAddCourse = () => {
    setEditingCourse(null);
    setIsSaving(false);
    reset({
      course_code: "",
      course_name: "",
      room_number: "",
      credits: 3,
      course_type: "",
      teacher: "",
      department: "",
      semester: "",
    });
    setIsEditModalOpen(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsSaving(false);
    reset({
      course_code: course.course_code,
      course_name: course.course_name,
      room_number: course.room_number,
      credits: course.credits,
      course_type: course.course_type,
      teacher: String(course.teacher),
      department: String(course.department),
      semester: String(course.semester),
    });
    setIsEditModalOpen(true);
  };

  const openDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    setIsDeleting(false);
    setIsDeleteModalOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSemesterFilter("All");
    setCreditFilter("All");
    setTeacherFilter("All");
    setDeptFilter("All");
    setTypeFilter("All");
    setPage(1);
  };

  // --- SUBMIT HANDLERS ---
  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);

    const teacherObj = teachers.find((t) => String(t.id) === data.teacher);
    const deptObj = departments.find((d) => String(d.id) === data.department);
    const semObj = semesters.find((s) => String(s.id) === data.semester);

    try {
      if (editingCourse) {
        // --- UPDATE ---
        const payload = {
          course_type: data.course_type,
          course_code: data.course_code,
          course_name: data.course_name,
          room_number: data.room_number,
          department: Number(data.department),
          semester: Number(data.semester),
          credits: Number(data.credits),
          teacher: Number(data.teacher),
        };

        const result = await updateCourse(editingCourse.id, payload);

        if (result.success) {
          setCoursesList((prev) =>
            prev.map((c) =>
              c.id === editingCourse.id
                ? ({
                    ...c,
                    ...payload,
                    teacher_name: teacherObj?.name || c.teacher_name,
                    department_name: deptObj?.name || c.department_name,
                    semester_name: semObj?.name || c.semester_name,
                  } as Course)
                : c
            )
          );

          setIsEditModalOpen(false);
          toast.success("Course updated successfully");
          startTransition(() => router.refresh());
        } else {
          toast.error(result.message);
        }
      } else {
        // --- CREATE ---
        const payload = {
          course_code: data.course_code,
          course_name: data.course_name,
          room_number: data.room_number,
          credits: Number(data.credits),
          course_type: data.course_type,
          teacher: Number(data.teacher),
          teacher_name: teacherObj?.name || "",
          department: Number(data.department),
          department_name: deptObj?.name || "",
          semester: Number(data.semester),
          semester_name: semObj?.name || "",
        };

        const result = await createCourse(payload);

        if (result.success) {
          const newCourse = result.data
            ? ({ ...payload, ...result.data } as Course)
            : null;
          if (newCourse) setCoursesList((prev) => [newCourse, ...prev]);

          setIsEditModalOpen(false);
          toast.success("Course created successfully");
          startTransition(() => router.refresh());
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      const result = await deleteCourse(deletingCourse.id);
      if (result.success) {
        setCoursesList((prev) =>
          prev.filter((c) => c.id !== deletingCourse.id)
        );
        setIsDeleteModalOpen(false);
        toast.success("Course deleted successfully");
        startTransition(() => router.refresh());
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = useMemo(() => {
    let data = [...coursesList];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.course_name.toLowerCase().includes(lowerQuery) ||
          c.course_code.toLowerCase().includes(lowerQuery)
      );
    }
    if (semesterFilter !== "All")
      data = data.filter((c) => c.semester_name === semesterFilter);
    if (creditFilter !== "All")
      data = data.filter((c) => c.credits === Number(creditFilter));
    if (teacherFilter !== "All")
      data = data.filter((c) => c.teacher_name === teacherFilter);
    if (deptFilter !== "All")
      data = data.filter((c) => c.department_name === deptFilter);
    if (typeFilter !== "All")
      data = data.filter((c) => c.course_type === typeFilter);

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [
    coursesList,
    searchQuery,
    semesterFilter,
    creditFilter,
    teacherFilter,
    deptFilter,
    typeFilter,
    sortConfig,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page, pageSize]);

  const handleSort = (key: keyof Course) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const isFiltered = useMemo(() => {
    return (
      searchQuery !== "" ||
      deptFilter !== "All" ||
      semesterFilter !== "All" ||
      creditFilter !== "All" ||
      teacherFilter !== "All" ||
      typeFilter !== "All"
    );
  }, [
    searchQuery,
    deptFilter,
    semesterFilter,
    creditFilter,
    teacherFilter,
    typeFilter,
  ]);

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full font-lexend min-w-0 max-w-full mx-auto p-4 md:p-6 space-y-6 overflow-x-hidden print:hidden"
      >
        {/* -- Header Section -- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden mb-6">
          <div className="space-y-2 w-full lg:w-auto">
            <motion.div variants={pageItemVariants}>
              <Badge
                variant="outline"
                className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
              >
                Admin Panel
              </Badge>
            </motion.div>
            <motion.h1
              variants={pageItemVariants}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              Course Management
            </motion.h1>
            <motion.p
              variants={pageItemVariants}
              className="text-muted-foreground"
            >
              Manage university courses, assign teachers, and organize schedule.
            </motion.p>
          </div>

          <motion.div
            variants={pageItemVariants}
            className="flex flex-wrap gap-2 w-full lg:w-auto"
          >
            <Badge
              variant="secondary"
              className="h-10 px-4 flex items-center justify-center gap-2 text-sm font-normal bg-background border whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{filteredData.length} Courses</span>
            </Badge>
            <Button
              onClick={openAddCourse}
              className="gap-2 grow sm:grow-0"
            >
              <Plus className="h-4 w-4" /> Add Course
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2 h-10 border-primary/20 hover:bg-primary/5 hover:text-primary grow sm:grow-0"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </motion.div>
        </div>

        {/* -- Print Only Header -- */}
        <div className="hidden print:block mb-4 text-center">
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-sm text-muted-foreground">
            Generated Report - Total Courses: {filteredData.length}
          </p>
        </div>

        {/* -- Main Content Card -- */}
        <motion.div variants={pageItemVariants}>
          <Card className="w-full overflow-hidden dark:bg-[#111113] border shadow-sm print:border-none print:shadow-none print:overflow-visible">
            {/* -- Filters Header -- */}
            <CardHeader className="p-4 bg-muted/30 border-b hidden min-[1300px]:block print:hidden">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-end">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
                    {/* Search */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pl-0.5">
                        Search
                      </span>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          className="pl-8 h-9 bg-background text-xs"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Filters */}
                    {[
                      {
                        label: "Semester",
                        value: semesterFilter,
                        set: setSemesterFilter,
                        options: uniqueSemesters.map((s) => s.name),
                      },
                      {
                        label: "Credits",
                        value: creditFilter,
                        set: setCreditFilter,
                        options: availableCredits.map(String),
                      },
                      {
                        label: "Teacher",
                        value: teacherFilter,
                        set: setTeacherFilter,
                        options: uniqueTeachers.map((t) => t.name),
                      },
                      {
                        label: "Dept",
                        value: deptFilter,
                        set: setDeptFilter,
                        options: uniqueDepts.map((d) => d.name),
                      },
                      {
                        label: "Type",
                        value: typeFilter,
                        set: setTypeFilter,
                        options: ["Theory", "Lab", "Project"],
                      },
                    ].map((filter, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pl-0.5">
                          {filter.label}
                        </span>
                        <Select
                          value={filter.value}
                          onValueChange={(val) => {
                            filter.set(val);
                            setPage(1);
                          }}
                        >
                          <SelectTrigger className="w-full h-9 bg-background text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">
                              All {filter.label}
                            </SelectItem>
                            {filter.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {filter.label === "Teacher" ||
                                filter.label === "Dept"
                                  ? getInitials(opt)
                                  : opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {isFiltered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-none"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="h-9 gap-2 mb-0.5 border-dashed text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardHeader>

            {/* -- Table Content -- */}
            <CardContent className="p-0 grid grid-cols-1">
              <div className="w-full overflow-x-auto print:overflow-visible">
                <Table className="min-w-[1000px] overflow-hidden print:min-w-0 print:w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent print:border-b-black/70 print:h-auto">
                      <TableHead className="w-[110px] h-10 print:h-auto print:py-1 print:text-xs">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-muted-foreground print:hidden" />
                          Code
                        </div>
                      </TableHead>

                      <TableHead className="min-w-[350px] h-10 print:h-auto print:py-1 print:text-xs print:min-w-0">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground print:hidden" />
                          Course Name
                        </div>
                      </TableHead>

                      <TableHead className="w-20 h-10 print:h-auto print:py-1 print:text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground print:hidden" />
                          Room
                        </div>
                      </TableHead>

                      <TableHead className="w-[100px] h-10 print:h-auto print:py-1 print:text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 w-full justify-center font-medium text-muted-foreground hover:text-foreground print:h-auto print:p-0"
                          onClick={() => handleSort("credits")}
                        >
                          <GraduationCap className="w-3.5 h-3.5 mr-2 print:hidden" />
                          Credits
                          <ArrowUpDown className="ml-1 h-3 w-3 opacity-50 print:hidden" />
                        </Button>
                      </TableHead>

                      <TableHead className="w-[100px] h-10 print:h-auto print:py-1 print:text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground print:hidden" />
                          Type
                        </div>
                      </TableHead>

                      <TableHead className="w-[100px] h-10 print:h-auto print:py-1 print:text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground print:hidden" />
                          Teacher
                        </div>
                      </TableHead>

                      <TableHead className="w-20 h-10 print:h-auto print:py-1 print:text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground print:hidden" />
                          Dept
                        </div>
                      </TableHead>

                      <TableHead className="w-[100px] h-10 print:h-auto print:py-1 print:text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground print:hidden" />
                          Sem
                        </div>
                      </TableHead>

                      <TableHead className="w-[50px] h-10 text-right print:hidden">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="[&_tr:last-child]:border-0">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((course) => (
                        <TableRow
                          key={course.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group whitespace-nowrap print:whitespace-normal print:border-black/70"
                        >
                          <TableCell className="p-3 font-mono font-medium text-primary/90 print:p-1 print:text-xs">
                            {course.course_code}
                          </TableCell>

                          <TableCell className="p-3 font-medium text-wrap max-w-[350px] print:p-1 print:text-xs print:max-w-none">
                            {course.course_name}
                          </TableCell>

                          <TableCell className="p-3 text-muted-foreground text-center print:p-1 print:text-xs print:text-black">
                            {course.room_number}
                          </TableCell>

                          <TableCell className="p-3 print:p-1 print:text-xs">
                            <div className="flex items-center justify-center gap-1.5">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full print:hidden",
                                  course.credits >= 3
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                )}
                              />
                              {course.credits}
                            </div>
                          </TableCell>

                          <TableCell className="p-3 print:p-1 print:text-xs">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-normal capitalize print:border-0 print:p-0 print:text-black",
                                course.course_type === "Theory"
                                  ? "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5"
                                  : course.course_type === "Lab"
                                  ? "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5"
                                  : "border-slate-500/30 text-slate-600 dark:text-slate-400 bg-slate-500/5"
                              )}
                            >
                              {course.course_type}
                            </Badge>
                          </TableCell>

                          <TableCell className="p-3 font-medium text-muted-foreground text-center print:p-1 print:text-xs print:text-black">
                            {getInitials(course.teacher_name)}
                          </TableCell>

                          <TableCell className="p-3 text-muted-foreground text-center print:p-1 print:text-xs print:text-black">
                            {getInitials(course.department_name)}
                          </TableCell>

                          <TableCell className="p-3 text-center print:p-1 print:text-xs">
                            <Badge
                              variant="secondary"
                              className="font-normal bg-muted text-muted-foreground hover:bg-muted print:bg-transparent print:text-black print:p-0"
                            >
                              {course.semester_name}
                            </Badge>
                          </TableCell>

                          {/* ACTION CELL */}
                          <TableCell className="p-3 text-right print:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => openEditCourse(course)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Update
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteCourse(course)}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                            <div className="h-12 w-12 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                              <FolderOpen className="h-6 w-6 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-1">
                              No courses found
                            </h3>
                            <p className="text-sm opacity-60 max-w-xs mx-auto mb-4">
                              Try adjusting your filters.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resetFilters}
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {/* -- Pagination Footer -- */}
            {paginatedData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-background/50 print:hidden">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  Showing {paginatedData.length} of {filteredData.length}{" "}
                  courses
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <span className="text-xs text-muted-foreground">Rows:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 30, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1 order-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages || totalPages === 0}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* --- ADD/EDIT MODAL --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] w-full max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-thin">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Modify the details of the existing course."
                : "Fill in the details to create a new course curriculum."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Course Code */}
            <div className="space-y-2">
              <Label>
                Course Code <span className="text-red-500">*</span>
              </Label>
              <Input
                {...form.register("course_code")}
                placeholder="e.g. CSE 3601"
              />
              {errors.course_code && (
                <p className="text-xs text-red-500">
                  {errors.course_code.message}
                </p>
              )}
            </div>

            {/* Course Name */}
            <div className="space-y-2">
              <Label>
                Course Name <span className="text-red-500">*</span>
              </Label>
              <Input
                {...form.register("course_name")}
                placeholder="e.g. Operating System"
              />
              {errors.course_name && (
                <p className="text-xs text-red-500">
                  {errors.course_name.message}
                </p>
              )}
            </div>

            {/* Room Number */}
            <div className="space-y-2">
              <Label>
                Room Number <span className="text-red-500">*</span>
              </Label>
              <Input
                {...form.register("room_number")}
                placeholder="e.g. B319"
              />
              {errors.room_number && (
                <p className="text-xs text-red-500">
                  {errors.room_number.message}
                </p>
              )}
            </div>

            {/* Credits */}
            <div className="space-y-2">
              <Label>
                Credits <span className="text-red-500">*</span>
              </Label>
              <Input
                {...form.register("credits")}
                type="number"
                step="0.25"
                placeholder="e.g. 3.0"
              />
              {errors.credits && (
                <p className="text-xs text-red-500">{errors.credits.message}</p>
              )}
            </div>

            {/* Department - Populated via API */}
            <div className="space-y-2">
              <Label>
                Department <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && (
                <p className="text-xs text-red-500">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Semester - Populated via API */}
            <div className="space-y-2">
              <Label>
                Semester <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="semester"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Sem" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.semester && (
                <p className="text-xs text-red-500">
                  {errors.semester.message}
                </p>
              )}
            </div>

            {/* Teacher - Populated via API */}
            <div className="space-y-2">
              <Label>
                Teacher <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="teacher"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.teacher && (
                <p className="text-xs text-red-500">{errors.teacher.message}</p>
              )}
            </div>

            {/* Course Type */}
            <div className="space-y-2">
              <Label>
                Course Type <span className="text-red-500">*</span>
              </Label>
              <Input
                {...form.register("course_type")}
                placeholder="e.g. Theory"
              />
              {errors.course_type && (
                <p className="text-xs text-red-500">
                  {errors.course_type.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="min-w-[100px]"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCourse ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <ShieldBan className="h-6 w-6" />
              <DialogTitle>Confirm Deletion</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-foreground">
                {deletingCourse?.course_code} - {deletingCourse?.course_name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -- PRINT VIEW (Visible only in print) -- */}
      <div className="hidden print:block w-full font-lexend p-0">
        {/* Print Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-black text-white flex items-center justify-center rounded-md font-bold text-lg">
                U
              </div>
              <h1 className="text-2xl font-bold text-black tracking-tight">
                University Course Management
              </h1>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Course Curriculum Report
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated on {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2">
              <p className="text-sm font-bold text-black">
                Total Courses: {filteredData.length}
              </p>
              <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                {semesterFilter !== "All" && (
                  <p>Semester: {semesterFilter}</p>
                )}
                {deptFilter !== "All" && <p>Dept: {deptFilter}</p>}
                {teacherFilter !== "All" && <p>Teacher: {teacherFilter}</p>}
                {semesterFilter === "All" &&
                  deptFilter === "All" &&
                  teacherFilter === "All" && <p>Filters: None</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Print Table */}
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="p-2 text-left font-bold border border-gray-300 w-[80px]">
                Code
              </th>
              <th className="p-2 text-left font-bold border border-gray-300">
                Course Name
              </th>
              <th className="p-2 text-center font-bold border border-gray-300 w-[60px]">
                Room
              </th>
              <th className="p-2 text-center font-bold border border-gray-300 w-[50px]">
                Cr.
              </th>
              <th className="p-2 text-center font-bold border border-gray-300 w-[70px]">
                Type
              </th>
              <th className="p-2 text-center font-bold border border-gray-300 w-[60px]">
                Teacher
              </th>
              <th className="p-2 text-center font-bold border border-gray-300 w-[60px]">
                Dept
              </th>
              <th className="p-2 text-center font-bold border border-gray-300 w-[80px]">
                Semester
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((course, index) => (
              <tr
                key={course.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-1.5 border border-gray-300 font-mono font-semibold">
                  {course.course_code}
                </td>
                <td className="p-1.5 border border-gray-300">
                  {course.course_name}
                </td>
                <td className="p-1.5 border border-gray-300 text-center">
                  {course.room_number}
                </td>
                <td className="p-1.5 border border-gray-300 text-center font-medium">
                  {course.credits}
                </td>
                <td className="p-1.5 border border-gray-300 text-center">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider",
                      course.course_type === "Theory"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : course.course_type === "Lab"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    )}
                  >
                    {course.course_type}
                  </span>
                </td>
                <td className="p-1.5 border border-gray-300 text-center">
                  {getInitials(course.teacher_name)}
                </td>
                <td className="p-1.5 border border-gray-300 text-center">
                  {getInitials(course.department_name)}
                </td>
                <td className="p-1.5 border border-gray-300 text-center">
                  {course.semester_name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Print Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-[10px] text-gray-500">
          <p>Confidential Report • For Internal Use Only</p>
          <p>University Course Management System</p>
        </div>
      </div>
    </>
  );
}
