"use client";

import * as React from "react";
import { useState, useMemo } from "react";
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
  Check,
  X,
  Printer,
  Award,
  FolderOpen,
  Filter,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course, COURSE_DATA } from "./curriculam-data";

// --- PAGE LOAD ANIMATION VARIANTS ---
const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const pageItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};

// --- TABLE ROW ANIMATION VARIANTS ---
const tableContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const rowVariants: Variants = {
  hidden: {
    x: -20,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      bounce: 0.4,
      duration: 0.8,
    },
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
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  semesterFilter: string;
  setSemesterFilter: (val: string) => void;
  creditFilter: string;
  setCreditFilter: (val: string) => void;
  marksFilter: string;
  setMarksFilter: (val: string) => void;
  resetFilters: () => void;
  handleColumnToggle: (val: string) => void;
  columns: { key: string; label: string }[];
  visibleCols: Record<string, boolean>;
}

const FilterPanel = ({
  searchQuery,
  setSearchQuery,
  semesterFilter,
  setSemesterFilter,
  creditFilter,
  setCreditFilter,
  marksFilter,
  setMarksFilter,
  resetFilters,
  handleColumnToggle,
  columns,
  visibleCols,
}: FilterPanelProps) => (
  <div className="flex flex-col gap-6 py-6 px-4">
    <FilterItem label="Search">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="pl-8 h-9 bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
          {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(
            (sem) => (
              <SelectItem key={sem} value={sem}>
                {sem} Semester
              </SelectItem>
            )
          )}
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
          <SelectItem value="1">1 Credit</SelectItem>
          <SelectItem value="2">2 Credits</SelectItem>
          <SelectItem value="3">3 Credits</SelectItem>
          <SelectItem value="4">4 Credits</SelectItem>
        </SelectContent>
      </Select>
    </FilterItem>

    <FilterItem label="Marks">
      <Select value={marksFilter} onValueChange={setMarksFilter}>
        <SelectTrigger className="w-full h-9 bg-background">
          <SelectValue placeholder="All Marks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Marks</SelectItem>
          <SelectItem value="100">100 Marks</SelectItem>
          <SelectItem value="50">50 Marks</SelectItem>
          <SelectItem value="25">25 Marks</SelectItem>
        </SelectContent>
      </Select>
    </FilterItem>

    <div className="my-2 border-t" />

    <FilterItem label="Visible Columns">
      <Select onValueChange={handleColumnToggle}>
        <SelectTrigger className="w-full h-9 bg-background text-muted-foreground">
          <SelectValue placeholder="Toggle Columns" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((col) => (
            <SelectItem key={col.key} value={col.key}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    visibleCols[col.key]
                      ? "bg-primary border-primary"
                      : "opacity-40"
                  )}
                >
                  <Check
                    className={cn(
                      "h-3 w-3 text-primary-foreground",
                      !visibleCols[col.key] && "hidden"
                    )}
                  />
                </div>
                <span className="capitalize">{col.label}</span>
              </div>
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
);

export default function AutomatedRoutineCourses() {
  // -- State --
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [creditFilter, setCreditFilter] = useState("All");
  const [marksFilter, setMarksFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Course;
    direction: "asc" | "desc";
  } | null>(null);

  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    code: true,
    name: true,
    credits: true,
    semester: true,
    marks: true,
    type: true,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // -- Handlers --
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSemesterChange = (val: string) => {
    setSemesterFilter(val);
    setCurrentPage(1);
  };

  const handleCreditChange = (val: string) => {
    setCreditFilter(val);
    setCurrentPage(1);
  };

  const handleMarksChange = (val: string) => {
    setMarksFilter(val);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSemesterFilter("All");
    setCreditFilter("All");
    setMarksFilter("All");
    setSortConfig(null);
    setCurrentPage(1);
  };

  const columns = useMemo(
    () => [
      { key: "code", label: "Code", icon: Hash },
      { key: "name", label: "Course Name", icon: BookOpen },
      { key: "credits", label: "Credits", icon: GraduationCap },
      { key: "semester", label: "Semester", icon: Calendar },
      { key: "marks", label: "Marks", icon: Award },
      { key: "type", label: "Type", icon: Tag },
    ],
    []
  );

  const filteredData = useMemo(() => {
    let data = [...COURSE_DATA];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.code.toLowerCase().includes(lowerQuery)
      );
    }

    if (semesterFilter !== "All") {
      data = data.filter((c) => c.semester === semesterFilter);
    }
    if (creditFilter !== "All") {
      data = data.filter((c) => c.credits === Number(creditFilter));
    }
    if (marksFilter !== "All") {
      data = data.filter((c) => c.marks === Number(marksFilter));
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
  }, [searchQuery, semesterFilter, creditFilter, marksFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const tableAnimationKey = `${searchQuery}-${semesterFilter}-${creditFilter}-${marksFilter}-${currentPage}-${pageSize}-${sortConfig?.key}-${sortConfig?.direction}`;

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

  const handleColumnToggle = (key: string) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
        }
      `}</style>

      {/* -- PAGE LOAD ANIMATION CONTAINER -- */}
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
                Course Curriculum
              </Badge>
            </motion.div>

            <motion.h1
              variants={pageItemVariants}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              Department of CSE
            </motion.h1>

            <motion.div
              variants={pageItemVariants}
              className="flex flex-wrap items-center gap-3"
            >
              <p className="text-muted-foreground ">All Course Offered</p>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-foreground font-bold uppercase">
                1st - 8th Semester
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

                  {/* -- Extracted Filter Panel for Mobile -- */}
                  <FilterPanel
                    searchQuery={searchQuery}
                    setSearchQuery={handleSearchChange}
                    semesterFilter={semesterFilter}
                    setSemesterFilter={handleSemesterChange}
                    creditFilter={creditFilter}
                    setCreditFilter={handleCreditChange}
                    marksFilter={marksFilter}
                    setMarksFilter={handleMarksChange}
                    resetFilters={resetFilters}
                    handleColumnToggle={handleColumnToggle}
                    columns={columns}
                    visibleCols={visibleCols}
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
              <Printer className="h-4 w-4" /> Print Catalog
            </Button>
          </motion.div>
        </div>

        {/* -- Print Header -- */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold mb-2">Academic Course Catalog</h1>
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
                  <div className="grid grid-cols-4 gap-3 w-full xl:w-auto flex-1">
                    {/* -- Desktop Filters -- */}
                    <FilterItem label="Search">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search courses..."
                          className="pl-8 h-9 bg-background"
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                      </div>
                    </FilterItem>

                    <FilterItem label="Semester">
                      <Select
                        value={semesterFilter}
                        onValueChange={handleSemesterChange}
                      >
                        <SelectTrigger className="w-full h-9 bg-background">
                          <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Semesters</SelectItem>
                          {[
                            "1st",
                            "2nd",
                            "3rd",
                            "4th",
                            "5th",
                            "6th",
                            "7th",
                            "8th",
                          ].map((sem) => (
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
                        <SelectTrigger className="w-full h-9 bg-background">
                          <SelectValue placeholder="All Credits" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Credits</SelectItem>
                          <SelectItem value="1">1 Credit</SelectItem>
                          <SelectItem value="2">2 Credits</SelectItem>
                          <SelectItem value="3">3 Credits</SelectItem>
                          <SelectItem value="4">4 Credits</SelectItem>
                        </SelectContent>
                      </Select>
                    </FilterItem>

                    <FilterItem label="Marks">
                      <Select
                        value={marksFilter}
                        onValueChange={handleMarksChange}
                      >
                        <SelectTrigger className="w-full h-9 bg-background">
                          <SelectValue placeholder="All Marks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Marks</SelectItem>
                          <SelectItem value="100">100 Marks</SelectItem>
                          <SelectItem value="50">50 Marks</SelectItem>
                          <SelectItem value="25">25 Marks</SelectItem>
                        </SelectContent>
                      </Select>
                    </FilterItem>
                  </div>

                  {/* -- Desktop Right Controls -- */}
                  <div className="flex gap-3 items-end shrink-0 w-full xl:w-auto justify-end xl:justify-start">
                    <div className="min-w-[150px]">
                      <FilterItem label="Columns">
                        <Select onValueChange={handleColumnToggle}>
                          <SelectTrigger className="w-full h-9 bg-background text-muted-foreground">
                            <SelectValue placeholder="Customize View" />
                          </SelectTrigger>
                          <SelectContent align="end">
                            {columns.map((col) => (
                              <SelectItem key={col.key} value={col.key}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "flex h-4 w-4 items-center justify-center rounded border",
                                      visibleCols[col.key]
                                        ? "bg-primary border-primary"
                                        : "opacity-40"
                                    )}
                                  >
                                    <Check
                                      className={cn(
                                        "h-3 w-3 text-primary-foreground",
                                        !visibleCols[col.key] && "hidden"
                                      )}
                                    />
                                  </div>
                                  <span className="capitalize">
                                    {col.label}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FilterItem>
                    </div>

                    {(searchQuery ||
                      semesterFilter !== "All" ||
                      creditFilter !== "All" ||
                      marksFilter !== "All") && (
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
                <Table className="min-w-[800px] overflow-hidden">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      {visibleCols.code && (
                        <TableHead className="w-[130px] h-10 print:w-auto print:px-2 print:text-xs">
                          <div className="flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                            Code
                          </div>
                        </TableHead>
                      )}

                      {visibleCols.name && (
                        <TableHead className="min-w-[300px] h-10 print:w-auto print:min-w-0 print:px-2 print:text-xs">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            Course Name
                          </div>
                        </TableHead>
                      )}

                      {visibleCols.credits && (
                        <TableHead className="w-[130px] h-10 print:w-auto print:px-2 print:text-xs">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground data-[active=true]:text-primary print:ml-0 print:h-auto print:p-0"
                            onClick={() => handleSort("credits")}
                            data-active={sortConfig?.key === "credits"}
                          >
                            <GraduationCap className="w-3.5 h-3.5 mr-2 print:mr-1" />
                            Credits
                            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50 print:hidden" />
                          </Button>
                        </TableHead>
                      )}

                      {visibleCols.semester && (
                        <TableHead className="w-[150px] h-10 print:w-auto print:px-2 print:text-xs">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            Semester
                          </div>
                        </TableHead>
                      )}

                      {visibleCols.marks && (
                        <TableHead className="w-[130px] h-10 print:w-auto print:px-2 print:text-xs">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground data-[active=true]:text-primary print:ml-0 print:h-auto print:p-0"
                            onClick={() => handleSort("marks")}
                            data-active={sortConfig?.key === "marks"}
                          >
                            <Award className="w-3.5 h-3.5 mr-2 print:mr-1" />
                            Marks
                            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50 print:hidden" />
                          </Button>
                        </TableHead>
                      )}

                      {visibleCols.type && (
                        <TableHead className="w-[140px] h-10 print:w-auto print:px-2 print:text-xs">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                            Type
                          </div>
                        </TableHead>
                      )}
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
                          {visibleCols.code && (
                            <TableCell className="p-3 font-mono font-medium text-primary/90 print:p-1 print:text-xs print:align-top">
                              {course.code}
                            </TableCell>
                          )}

                          {visibleCols.name && (
                            <TableCell className="p-3 font-medium print:p-1 print:text-xs print:align-top">
                              {course.name}
                            </TableCell>
                          )}

                          {visibleCols.credits && (
                            <TableCell className="p-3 print:p-1 print:text-xs print:align-top">
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
                          )}

                          {visibleCols.semester && (
                            <TableCell className="p-3 print:p-1 print:text-xs print:align-top">
                              <Badge
                                variant="secondary"
                                className="font-normal bg-muted text-muted-foreground hover:bg-muted print:bg-transparent print:text-black print:p-0 print:border-none"
                              >
                                {course.semester}
                              </Badge>
                            </TableCell>
                          )}

                          {visibleCols.marks && (
                            <TableCell className="p-3 print:p-1 print:text-xs print:align-top">
                              <span className="font-mono text-muted-foreground">
                                {course.marks}
                              </span>
                            </TableCell>
                          )}

                          {visibleCols.type && (
                            <TableCell className="p-3 print:p-1 print:text-xs print:align-top">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-normal capitalize",
                                  course.type === "Theory"
                                    ? "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5"
                                    : course.type === "Lab"
                                    ? "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5"
                                    : course.type === "Thesis"
                                    ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                                    : "border-slate-500/30 text-slate-600 dark:text-slate-400 bg-slate-500/5",
                                  "print:border-none print:bg-transparent print:text-black print:p-0"
                                )}
                              >
                                {course.type}
                              </Badge>
                            </TableCell>
                          )}
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
                              We couldn&apos;t find any courses matching your
                              current filters.
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
            <Printer className="h-4 w-4" /> Print Curriculum
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}
