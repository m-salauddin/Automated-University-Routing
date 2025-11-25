"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Search,
  GraduationCap,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Tag,
  X,
  Printer,
  FolderOpen,
  Filter,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  User,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- DATA TYPE ---
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

// --- HELPERS ---
const getInitials = (name: string) => {
  if (!name) return "";
  return name.match(/[A-Z]/g)?.join("") || name.substring(0, 3).toUpperCase();
};

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

const tableContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
};

// --- EXTRACTED COMPONENTS ---

const FilterItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider pl-0.5 flex items-center gap-1">
      {label}
    </span>
    {children}
  </div>
);

interface FilterPanelProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  semesterFilter: string;
  setSemesterFilter: (val: string) => void;
  creditFilter: string;
  setCreditFilter: (val: string) => void;
  teacherFilter: string;
  setTeacherFilter: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  resetFilters: () => void;
  availableSemesters: string[];
  availableCredits: number[];
  availableTeachers: string[];
  availableDepts: string[];
  availableTypes: string[];
}

const FilterPanel = React.memo(
  ({
    inputValue,
    setInputValue,
    semesterFilter,
    setSemesterFilter,
    creditFilter,
    setCreditFilter,
    teacherFilter,
    setTeacherFilter,
    deptFilter,
    setDeptFilter,
    typeFilter,
    setTypeFilter,
    resetFilters,
    availableSemesters,
    availableCredits,
    availableTeachers,
    availableDepts,
    availableTypes,
  }: FilterPanelProps) => (
    <div className="flex flex-col gap-6 py-6 px-4">
      <FilterItem label="Search">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by Code or Name..."
            className="pl-8 h-9 bg-background"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </FilterItem>

      <FilterItem label="Semester">
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-full h-9 bg-background">
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Semesters</SelectItem>
            {availableSemesters.map((sem) => (
              <SelectItem key={sem} value={sem}>
                {sem} Semester
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterItem>

      <FilterItem label="Credits">
        <Select value={creditFilter} onValueChange={setCreditFilter}>
          <SelectTrigger className="w-full h-9 bg-background">
            <SelectValue placeholder="All Credits" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Credits</SelectItem>
            {availableCredits.map((c) => (
              <SelectItem key={c} value={c.toString()}>
                {c} Credit{c > 1 && "s"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterItem>

      <FilterItem label="Teacher">
        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
          <SelectTrigger className="w-full h-9 bg-background">
            <SelectValue placeholder="All Teachers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Teachers</SelectItem>
            {availableTeachers.map((t) => (
              <SelectItem key={t} value={t}>
                {getInitials(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterItem>

      <FilterItem label="Department">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full h-9 bg-background">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Departments</SelectItem>
            {availableDepts.map((d) => (
              <SelectItem key={d} value={d}>
                {getInitials(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterItem>

      <FilterItem label="Course Type">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full h-9 bg-background">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {availableTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterItem>

      <div className="mt-2"></div>

      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline" onClick={resetFilters} className="w-full">
            Reset All
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button className="w-full mt-2 sm:mt-0">Done</Button>
        </SheetClose>
      </SheetFooter>
    </div>
  )
);
FilterPanel.displayName = "FilterPanel";

interface AutomatedRoutineCoursesProps {
  courses: Course[];
}

export default function AutomatedRoutineCourses({
  courses = [],
}: AutomatedRoutineCoursesProps) {
  // -- State --
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [creditFilter, setCreditFilter] = useState("All");
  const [teacherFilter, setTeacherFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Course;
    direction: "asc" | "desc";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // -- Debounce Effect for Search --
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue]);

  // -- Dynamic Filters Data --
  const {
    availableSemesters,
    availableCredits,
    availableTeachers,
    availableDepts,
    availableTypes,
  } = useMemo(() => {
    if (!Array.isArray(courses))
      return {
        availableSemesters: [],
        availableCredits: [],
        availableTeachers: [],
        availableDepts: [],
        availableTypes: [],
      };

    return {
      availableSemesters: Array.from(
        new Set(courses.map((c) => c.semester_name))
      ).sort(),
      availableCredits: Array.from(new Set(courses.map((c) => c.credits))).sort(
        (a, b) => a - b
      ),
      availableTeachers: Array.from(
        new Set(courses.map((c) => c.teacher_name))
      ).sort(),
      availableDepts: Array.from(
        new Set(courses.map((c) => c.department_name))
      ).sort(),
      availableTypes: Array.from(
        new Set(courses.map((c) => c.course_type))
      ).sort(),
    };
  }, [courses]);

  // -- Handlers (Memoized for React.memo compatibility) --
  const handleSearchChange = useCallback((val: string) => {
    setInputValue(val);
  }, []);

  const handleSemesterChange = useCallback((val: string) => {
    setSemesterFilter(val);
    setCurrentPage(1);
  }, []);

  const handleCreditChange = useCallback((val: string) => {
    setCreditFilter(val);
    setCurrentPage(1);
  }, []);

  const handleTeacherChange = useCallback((val: string) => {
    setTeacherFilter(val);
    setCurrentPage(1);
  }, []);

  const handleDeptChange = useCallback((val: string) => {
    setDeptFilter(val);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((val: string) => {
    setTypeFilter(val);
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setInputValue("");
    setSearchQuery("");
    setSemesterFilter("All");
    setCreditFilter("All");
    setTeacherFilter("All");
    setDeptFilter("All");
    setTypeFilter("All");
    setSortConfig(null);
    setCurrentPage(1);
  }, []);

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

  // -- Table Key Generation --
  const tableAnimationKey = JSON.stringify({
    searchQuery,
    semesterFilter,
    creditFilter,
    teacherFilter,
    deptFilter,
    typeFilter,
    page: currentPage,
    size: pageSize,
    sort: sortConfig?.key,
    sortDir: sortConfig?.direction,
  });

  const filteredData = useMemo(() => {
    if (!Array.isArray(courses)) {
      return [];
    }

    let data = [...courses];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.course_name?.toLowerCase().includes(lowerQuery) ||
          c.course_code?.toLowerCase().includes(lowerQuery)
      );
    }

    if (semesterFilter !== "All") {
      data = data.filter((c) => c.semester_name === semesterFilter);
    }
    if (creditFilter !== "All") {
      data = data.filter((c) => c.credits === Number(creditFilter));
    }
    if (teacherFilter !== "All") {
      data = data.filter((c) => c.teacher_name === teacherFilter);
    }
    if (deptFilter !== "All") {
      data = data.filter((c) => c.department_name === deptFilter);
    }
    if (typeFilter !== "All") {
      data = data.filter((c) => c.course_type === typeFilter);
    }

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
    courses,
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
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);


  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full min-w-0 max-w-full mx-auto p-4 md:p-6 space-y-6 font-lexend text-foreground overflow-x-hidden print:p-0 print:max-w-none"
      >
        {/* -- Header Section -- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden mb-8">
          <div className="space-y-2 w-full">
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
              Course Curriculum
            </motion.h1>

            <motion.div
              variants={pageItemVariants}
              className="flex flex-wrap items-center gap-3"
            >
              <p className="text-muted-foreground ">Manage All Courses</p>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-foreground font-bold uppercase">
                Total: {Array.isArray(courses) ? courses.length : 0}
              </span>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-[1300px]:hidden h-6 text-[10px] px-2 gap-1"
                  >
                    <Filter className="h-3 w-3" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[400px] overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle>Filters & View</SheetTitle>
                    <SheetDescription>
                      Customize your course table view.
                    </SheetDescription>
                  </SheetHeader>

                  <FilterPanel
                    inputValue={inputValue}
                    setInputValue={handleSearchChange}
                    semesterFilter={semesterFilter}
                    setSemesterFilter={handleSemesterChange}
                    creditFilter={creditFilter}
                    setCreditFilter={handleCreditChange}
                    teacherFilter={teacherFilter}
                    setTeacherFilter={handleTeacherChange}
                    deptFilter={deptFilter}
                    setDeptFilter={handleDeptChange}
                    typeFilter={typeFilter}
                    setTypeFilter={handleTypeChange}
                    resetFilters={resetFilters}
                    availableSemesters={availableSemesters}
                    availableCredits={availableCredits}
                    availableTeachers={availableTeachers}
                    availableDepts={availableDepts}
                    availableTypes={availableTypes}
                  />
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>

          <motion.div
            variants={pageItemVariants}
            className="flex gap-2 shrink-0"
          >
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hidden md:flex"
            >
              <Printer className="h-4 w-4" /> Print List
            </Button>
          </motion.div>
        </div>

        {/* -- Print Header -- */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold mb-2">Course Curriculum Report</h1>
          <p className="text-sm text-muted-foreground">
            Generated Report • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* -- Main Content Card -- */}
        <motion.div variants={pageItemVariants}>
          <Card className="w-full overflow-hidden dark:bg-[#111113] border shadow-sm print:border-none print:shadow-none print:overflow-visible">
            <CardHeader className="p-4 bg-muted/30 border-b hidden min-[1300px]:block print:hidden">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-end">
                  {/* -- Desktop Filters Grid -- */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
                    <FilterItem label="Search">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search code/name..."
                          className="pl-8 h-9 bg-background text-xs"
                          value={inputValue}
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                      </div>
                    </FilterItem>

                    <FilterItem label="Semester">
                      <Select
                        value={semesterFilter}
                        onValueChange={handleSemesterChange}
                      >
                        <SelectTrigger className="w-full h-9 bg-background text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Semesters</SelectItem>
                          {availableSemesters.map((sem) => (
                            <SelectItem key={sem} value={sem}>
                              {sem} Semester
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FilterItem>

                    <FilterItem label="Credits">
                      <Select
                        value={creditFilter}
                        onValueChange={handleCreditChange}
                      >
                        <SelectTrigger className="w-full h-9 bg-background text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Credits</SelectItem>
                          {availableCredits.map((c) => (
                            <SelectItem key={c} value={c.toString()}>
                              {c} Credit{c > 1 && "s"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FilterItem>

                    <FilterItem label="Teacher">
                      <Select
                        value={teacherFilter}
                        onValueChange={handleTeacherChange}
                      >
                        <SelectTrigger className="w-full h-9 bg-background text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Teachers</SelectItem>
                          {availableTeachers.map((t) => (
                            <SelectItem key={t} value={t}>
                              {getInitials(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FilterItem>

                    <FilterItem label="Department">
                      <Select
                        value={deptFilter}
                        onValueChange={handleDeptChange}
                      >
                        <SelectTrigger className="w-full h-9 bg-background text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Depts</SelectItem>
                          {availableDepts.map((d) => (
                            <SelectItem key={d} value={d}>
                              {getInitials(d)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FilterItem>

                    <FilterItem label="Type">
                      <Select
                        value={typeFilter}
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger className="w-full h-9 bg-background text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Types</SelectItem>
                          {availableTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FilterItem>
                  </div>

                  {/* -- Desktop Reset Button -- */}
                  <div className="flex gap-3 items-end shrink-0 justify-end">
                    {(inputValue ||
                      semesterFilter !== "All" ||
                      creditFilter !== "All" ||
                      teacherFilter !== "All" ||
                      deptFilter !== "All" ||
                      typeFilter !== "All") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 mb-0.5"
                        onClick={resetFilters}
                      >
                        <X className="h-3.5 w-3.5" /> Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* -- Table Content -- */}
            <CardContent className="p-0 grid grid-cols-1">
              <div className="w-full overflow-x-auto print:overflow-visible">
                <Table className="min-w-[1000px] overflow-hidden">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[110px] h-10">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                          Code
                        </div>
                      </TableHead>

                      <TableHead className="min-w-[250px] h-10">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                          Course Name
                        </div>
                      </TableHead>

                      <TableHead className="w-20 h-10">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          Room
                        </div>
                      </TableHead>

                      <TableHead className="w-[100px] h-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => handleSort("credits")}
                        >
                          <GraduationCap className="w-3.5 h-3.5 mr-2" />
                          Credits
                          <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                        </Button>
                      </TableHead>

                      <TableHead className="w-[100px] h-10">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                          Type
                        </div>
                      </TableHead>

                      <TableHead className="w-[100px] h-10">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          Teacher
                        </div>
                      </TableHead>

                      <TableHead className="w-20 h-10">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          Dept
                        </div>
                      </TableHead>

                      <TableHead className="w-[100px] h-10">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          Sem
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <motion.tbody
                    key={tableAnimationKey}
                    variants={tableContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="[&_tr:last-child]:border-0"
                  >
                    {paginatedData.length > 0 ? (
                      paginatedData.map((course) => (
                        <motion.tr
                          layout
                          key={course.id}
                          variants={rowVariants}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group whitespace-nowrap print:whitespace-normal"
                        >
                          <TableCell className="p-3 font-mono font-medium text-primary/90">
                            {course.course_code}
                          </TableCell>

                          <TableCell className="p-3 font-medium text-wrap max-w-[250px]">
                            {course.course_name}
                          </TableCell>

                          <TableCell className="p-3 text-muted-foreground">
                            {course.room_number}
                          </TableCell>

                          <TableCell className="p-3">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  course.credits >= 3
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                )}
                              />
                              {course.credits}
                            </div>
                          </TableCell>

                          <TableCell className="p-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-normal capitalize",
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

                          <TableCell className="p-3 font-medium text-muted-foreground">
                            {getInitials(course.teacher_name)}
                          </TableCell>

                          <TableCell className="p-3 text-muted-foreground">
                            {getInitials(course.department_name)}
                          </TableCell>

                          <TableCell className="p-3">
                            <Badge
                              variant="secondary"
                              className="font-normal bg-muted text-muted-foreground hover:bg-muted"
                            >
                              {course.semester_name}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-64 text-center">
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
                  </motion.tbody>
                </Table>
              </div>
            </CardContent>

            {/* -- Pagination Footer -- */}
            {paginatedData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-background/50 print:hidden">
                <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 text-sm text-muted-foreground">
                  <span>Rows:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
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

                <div className="text-sm font-medium order-3 sm:order-2">
                  Page {currentPage} of {totalPages || 1}
                </div>

                <div className="flex items-center gap-1 order-2 sm:order-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={pageItemVariants}>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full lg:hidden print:hidden gap-2 mt-4"
          >
            <Printer className="h-4 w-4" /> Print List
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}
