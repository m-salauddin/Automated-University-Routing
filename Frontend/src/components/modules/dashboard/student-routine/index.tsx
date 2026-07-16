"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Printer,
  User,
  Users,
  MapPin,
  GraduationCap,
  Utensils,
  CalendarX,
  Loader2,
  ShieldAlert,
  Info,
  ShieldBan,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { generateClassKey, normalizeTime } from "@/store/classOffSlice";
import DataLoader from "@/components/ui/data-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export type APIRoutineItem = {
  id: number;
  day: number | string;
  day_name: string;
  start_time: string;
  end_time: string;
  course_name: string;
  course_code: string;
  teacher_name: string;
  department_name: string;
  semester_name: string;
  room_number: string;
  group_name?: string | null;
};

export type TimeSlot = {
  id: number;
  start_time: string;
  end_time: string;
};

type ClassSession = {
  course: string;
  teacher: string;
  room: string;
  teacherId?: string;
  originalTime?: string;
  department: string;
  semester: string;
  day: string;
  is_cancelled?: boolean;
  cancel_message?: string | null;
  group_name?: string | null;
};

type DayRow = {
  day: string;
  slots: (ClassSession[] | null)[];
};

type RoutineData = {
  label: string;
  session: string;
  credits: number;
  schedule: DayRow[];
};

const BREAK_INSERT_INDEX = 4;

const formatTimeSlotLabel = (timeStr: string) => {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  if (h >= 1 && h <= 5) {
    h += 12;
  }
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${mStr}`;
};

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];


const getTeacherInitials = (name: string) => {
  if (!name) return "";
  const capitals = name.match(/[A-Z]/g);
  if (capitals && capitals.length > 0) return capitals.join("");
  return name
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

const abbreviateDay = (day: string) => {
  return day ? day.substring(0, 3) : "";
};

const isBreakSlot = (slot: any) => {
  if (!slot) return false;

  const hasBreakProp =
    "is_lunch_break" in slot ||
    "is_launch_break" in slot ||
    "islaunchbreak" in slot;

  if (hasBreakProp) {
    return Boolean(slot.is_lunch_break || slot.is_launch_break || slot.islaunchbreak);
  }

  const time = slot.start_time;
  const isTimeMatch = time && (time.startsWith("01:15") || time.startsWith("13:15") || time.startsWith("1:15"));
  return Boolean(isTimeMatch);
};

const isLabClass = (courseCode: string, courseName?: string, roomNumber?: string) => {
  if (!courseCode) return false;
  const codeLower = courseCode.trim().toLowerCase();
  const nameLower = (courseName || "").toLowerCase();
  const roomLower = (roomNumber || "").toLowerCase();

  if (codeLower.endsWith("l") || codeLower.includes("lab") || codeLower.includes("sessional") || codeLower.includes("practical") || codeLower.includes("work")) {
    return true;
  }
  if (nameLower.includes("lab") || nameLower.includes("laboratory") || nameLower.includes("sessional") || nameLower.includes("practical")) {
    return true;
  }
  if (roomLower.includes("lab") || roomLower.includes("laboratory") || roomLower.includes("computer center")) {
    return true;
  }

  const match = courseCode.match(/\d+/);
  if (match) {
    const numStr = match[0];
    const lastDigit = parseInt(numStr.charAt(numStr.length - 1), 10);
    return lastDigit % 2 === 0;
  }
  return false;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};

const dialogContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
      duration: 0.2,
    },
  },
};

const dialogItemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const EMPTY_OBJ = {};

interface Props {
  routineList: APIRoutineItem[];
  timeSlots: TimeSlot[];
  studentSemesterProp?: string | null;
}

export default function DepartmentRoutinePage({ routineList, timeSlots, studentSemesterProp }: Props) {
  const sortedTimeSlots = useMemo(() => {
    const getMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const [hStr, mStr] = timeStr.split(":");
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (h >= 1 && h <= 5) h += 12;
      return h * 60 + m;
    };
    return [...timeSlots].sort((a, b) => getMinutes(a.start_time) - getMinutes(b.start_time));
  }, [timeSlots]);

  const auth = useSelector((s: RootState) => s.auth) as any;



  const availabilityMap = useSelector(
    (s: RootState) => s.teacherAvailability?.map || EMPTY_OBJ
  );
  const classOffMap = useSelector(
    (s: RootState) => s.classOff.offMap || EMPTY_OBJ
  );



  const [selectedSemester] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [viewReasonModal, setViewReasonModal] = useState<{
    isOpen: boolean;
    course: string;
    teacher: string;
    reason: string;
  }>({
    isOpen: false,
    course: "",
    teacher: "",
    reason: "",
  });

  const [colWidths, setColWidths] = useState<{ [key: string]: number }>({});
  const [rowHeights, setRowHeights] = useState<{ [key: string]: number }>({});

  const startColResize = useCallback((e: React.MouseEvent, colKey: string, defaultWidth: number, minWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const cellElement = e.currentTarget.parentElement as HTMLElement;
    if (!cellElement) return;

    const startWidth = cellElement.offsetWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + deltaX);
      cellElement.style.width = `${newWidth}px`;
      cellElement.style.minWidth = `${newWidth}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      const finalWidth = cellElement.offsetWidth;
      setColWidths((prev) => ({
        ...prev,
        [colKey]: finalWidth
      }));
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const startRowResize = useCallback((e: React.MouseEvent, rowKey: string, defaultHeight: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const trElement = e.currentTarget.closest("tr") as HTMLElement;
    if (!trElement) return;

    const startHeight = trElement.offsetHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(60, startHeight + deltaY);
      trElement.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      const finalHeight = trElement.offsetHeight;
      setRowHeights((prev) => ({
        ...prev,
        [rowKey]: finalHeight
      }));
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const isStudent = auth?.role?.toLowerCase() === "student";
  const studentSemester = studentSemesterProp || auth?.semester_name;

  const formattedRoutineData = useMemo(() => {
    const grouped: Record<string, RoutineData> = {};
    const semesterUniqueCourses: Record<string, Set<string>> = {};
    const slotStartTimes = sortedTimeSlots.map((ts) => normalizeTime(ts.start_time));


    routineList.forEach((item) => {
      if (!grouped[item.semester_name]) {
        grouped[item.semester_name] = {
          label: `${item.semester_name} Semester`,
          session: "Spring 2024",
          credits: 0,
          schedule: DAYS_ORDER.map((day) => ({
            day,
            slots: Array(sortedTimeSlots.length).fill(null),
          })),
        };
        semesterUniqueCourses[item.semester_name] = new Set();
      }
    });


    routineList.forEach((item) => {
      const semesterGroup = grouped[item.semester_name];
      if (!semesterGroup) return;

      semesterUniqueCourses[item.semester_name].add(item.course_code);

      const dayRow = semesterGroup.schedule.find((d) => d.day === item.day_name);
      if (!dayRow) return;

      const normalizedApiTime = normalizeTime(item.start_time);
      const slotIndex = slotStartTimes.indexOf(normalizedApiTime);

      if (slotIndex !== -1 && slotIndex < sortedTimeSlots.length) {
        const session: ClassSession = {
          course: item.course_code,
          teacher: item.teacher_name,
          room: item.room_number,
          teacherId: item.teacher_name,
          originalTime: item.start_time,
          department: item.department_name,
          semester: item.semester_name,
          day: item.day_name,
          is_cancelled: (item as any).is_cancelled ?? false,
          cancel_message: (item as any).cancel_message ?? null,
          group_name: item.group_name ?? null,
        };
        if (dayRow.slots[slotIndex] === null) {
          dayRow.slots[slotIndex] = [session];
        } else {
          dayRow.slots[slotIndex]!.push(session);
        }
      }
    });


    Object.keys(grouped).forEach((semesterName) => {
      const uniqueCount = semesterUniqueCourses[semesterName].size;
      grouped[semesterName].credits = uniqueCount * 3.0;
    });

    return grouped;
  }, [routineList, sortedTimeSlots]);

  const semesterOptions = useMemo(() => {
    return Object.keys(formattedRoutineData)
      .map((key) => ({
        id: key,
        label: formattedRoutineData[key].label,
      }))
      .sort((a, b) => {
        const numA = parseInt(a.id) || 999;
        const numB = parseInt(b.id) || 999;
        return numA - numB;
      });
  }, [formattedRoutineData]);


  const activeSemesterId = useMemo(() => {
    if (selectedSemester && formattedRoutineData[selectedSemester])
      return selectedSemester;
    if (isStudent && studentSemester && formattedRoutineData[studentSemester])
      return studentSemester;
    return semesterOptions.length > 0 ? semesterOptions[0].id : "";
  }, [
    selectedSemester,
    formattedRoutineData,
    semesterOptions,
    isStudent,
    studentSemester,
  ]);

  const currentRoutine = useMemo(
    () => formattedRoutineData[activeSemesterId],
    [activeSemesterId, formattedRoutineData]
  );

  const hasAccess = useMemo(() => {
    if (!isStudent) return true;
    if (!studentSemester) return true;
    return activeSemesterId === studentSemester;
  }, [isStudent, activeSemesterId, studentSemester]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);


  const validTeacherShortNames = useMemo(() => {
    const uniqueShortNames = new Set<string>();
    routineList.forEach((item) => {
      const short = getTeacherInitials(item.teacher_name).toLowerCase();
      if (short) uniqueShortNames.add(short);
    });
    return uniqueShortNames;
  }, [routineList]);

  const isMatch = useMemo(() => {
    return (session: ClassSession | null) => {
      if (!session || !debouncedSearch) return false;

      const query = debouncedSearch.toLowerCase().trim();
      const sessionTeacherShortName = getTeacherInitials(
        session.teacher
      ).toLowerCase();

      const isSearchingForTeacherShortName = validTeacherShortNames.has(query);

      if (isSearchingForTeacherShortName) {
        return sessionTeacherShortName === query;
      }

      return (
        session.course.toLowerCase().includes(query) ||
        session.teacher.toLowerCase().includes(query) ||
        session.room.toLowerCase().includes(query) ||
        sessionTeacherShortName === query
      );
    };
  }, [debouncedSearch, validTeacherShortNames]);




  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || auth?.isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!currentRoutine) {
    const isEmpty = routineList.length === 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex font-lexend flex-col items-center justify-center text-center p-8"
      >
        <div
          className={cn(
            "rounded-full p-6 mb-6",
            isEmpty
              ? "bg-red-50 dark:bg-red-900/10"
              : "bg-blue-50 dark:bg-blue-900/10"
          )}
        >
          {isEmpty ? (
            <CalendarX className="w-8 h-8 text-red-400 dark:text-red-500" />
          ) : (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          )}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          {isEmpty ? "No Routine Found" : "Processing Data"}
        </h2>
        <p className="text-muted-foreground max-w-[400px] text-base leading-relaxed">
          {isEmpty
            ? "There is no schedule data available for this semester yet."
            : "Please wait while we finalize the display."}
        </p>
        {isEmpty && (
          <Button
            variant="outline"
            className="mt-8 font-medium"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        )}
      </motion.div>
    );
  }

  if (auth?.role?.toLowerCase() !== "student") {
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
            This page is exclusively for students. It seems you do not
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

  return (
    <>
      <style jsx global>{`
        @media print {
          :root,
          .dark,
          body,
          html {
            --background: 0 0% 100% !important;
            --foreground: 0 0% 3.9% !important;
            --card: 0 0% 100% !important;
            --card-foreground: 0 0% 3.9% !important;
            --popover: 0 0% 100% !important;
            --popover-foreground: 0 0% 3.9% !important;
            --primary: 0 0% 9% !important;
            --primary-foreground: 0 0% 98% !important;
            --secondary: 0 0% 96.1% !important;
            --secondary-foreground: 0 0% 9% !important;
            --muted: 0 0% 96.1% !important;
            --muted-foreground: 0 0% 45.1% !important;
            --accent: 0 0% 96.1% !important;
            --accent-foreground: 0 0% 9% !important;
            --destructive: 0 84.2% 60.2% !important;
            --destructive-foreground: 0 0% 98% !important;
            --border: 0 0% 100% !important;
            --input: 0 0% 89.8% !important;
            --ring: 0 0% 3.9% !important;
            color-scheme: light !important;
          }
          @page {
            size: landscape;
            margin: 5mm;
          }
          /* Hide sidebar, header, nav entirely */
          [data-slot="sidebar"],
          [data-slot="sidebar-container"],
          [data-slot="sidebar-gap"],
          [data-slot="sidebar-inner"],
          header,
          nav {
            display: none !important;
          }

          /* Reset outer layout wrappers to plain block */
          html,
          body,
          main,
          [data-slot="sidebar-inset"],
          [data-slot="sidebar-wrapper"] {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: unset !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          body {
            background-color: white !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
          }
          /* Remove borders/outlines/shadows from ALL elements by default to remove layout frames */
          * {
            border: none !important;
            border-width: 0 !important;
            outline: none !important;
            box-shadow: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          /* Restore borders ONLY for the table and its cells */
          table,
          th,
          td {
            border: 1px solid black !important;
            border-color: black !important;
            border-collapse: collapse !important;
          }
          table {
            table-layout: fixed !important;
            width: calc(100% - 2px) !important;
            margin: 0 auto !important;
          }
          tbody {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-page-container {
            display: block !important;
            width: 100% !important;
          }
          @media print {
            .print-page-container {
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
              height: calc(100vh - 10mm) !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              box-sizing: border-box !important;
              padding: 0 !important;
            }
          }
          th, td {
            padding: 2px 2px !important;
            height: auto !important;
          }
          thead td, thead th {
            height: 40px !important;
          }
          th span, td span, td div, th div {
            font-size: 9.5px !important;
            line-height: 1.2 !important;
          }

          .print-header-border {
            border: 2px double black !important;
            border-color: black !important;
          }

          .print-header-table {
            border: 1px solid black !important;
            border-color: black !important;
            width: calc(100% - 2px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          /* Ensure clear text and transparent backgrounds for print */
          table, th, td, tr, div, span, p {
            background-color: transparent !important;
            color: black !important;
          }

          /* Keep print-specific background colors if defined, like the break column */
          .print\\:bg-gray-200, .bg-gray-200 {
            background-color: #e5e7eb !important;
          }

          svg line {
            stroke: black !important;
          }

          #print-container-wrapper {
            box-shadow: none !important;
            background-color: transparent !important;
          }
          .print-break-text-no-class {
            font-size: 5.5px !important;
            font-weight: 500 !important;
            letter-spacing: 0.5px !important;
          }
        }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen font-lexend w-full max-w-[1600px] mx-auto bg-background text-foreground p-5 overflow-x-hidden print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white print:text-black print:overflow-visible"
      >
        <div className="space-y-8 print:space-y-0 print:w-full print:max-w-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
            <div className="space-y-2">
              <motion.div variants={itemVariants}>
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
                >
                  Session {currentRoutine.session}
                </Badge>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
              >
                Routine for {auth.department_name || "N/A"}
              </motion.h1>
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <p className="text-muted-foreground font-medium">
                  Class Routine{" "}
                  <span className="text-foreground/40 mx-1">•</span>{" "}
                  <span className="text-foreground font-semibold">
                    {currentRoutine.label}
                  </span>
                </p>
              </motion.div>
            </div>
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hidden md:flex"
              >
                <Printer className="h-4 w-4" /> Print View
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 mb-5 lg:grid-cols-12 gap-4 print:hidden">
            <motion.div
              variants={itemVariants}
              className="lg:col-span-8 flex justify-between flex-col sm:flex-row gap-3 bg-card border rounded-xl p-1.5 shadow-sm"
            >
              { }
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border border-transparent transition-all">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {currentRoutine.label}
                </span>
              </div>

              <div className="flex font-lexend items-center justify-between px-4 py-2 bg-muted/30 rounded-lg min-w-[140px]">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Credits
                </span>
                <span className="ml-2 text-primary">
                  {currentRoutine.credits > 0 ? currentRoutine.credits : "N/A"}
                </span>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="lg:col-span-4 bg-card border rounded-xl p-1.5 shadow-sm"
            >
              <div className="flex items-center gap-3 px-3 h-full bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search course, teacher (e.g., SI)..."
                  className="border-none font-lexend shadow-none bg-transparent! focus-visible:ring-0 h-10 px-0 text-sm"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          {!hasAccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              variants={itemVariants}
              className="rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 p-12 flex flex-col items-center justify-center text-center print:hidden"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4 text-amber-600 dark:text-amber-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                Access Restricted
              </h3>
              <p className="text-amber-700 dark:text-amber-400 max-w-md">
                As a student, you are only authorized to view the routine for
                your assigned semester (<strong>{studentSemester}</strong>).
              </p>
            </motion.div>
          ) : (<div className="print-page-container w-full">
            <div className="hidden print:flex flex-col print:mt-0 bg-white items-center justify-center mb-3 pt-0 text-center w-full font-serif text-black">
              <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
                Department of Computer Science & Engineering
              </h1>
              <div className="border-2 border-black! border-double px-8 py-0.5 mb-2 print-header-border">
                <h2 className="text-base font-bold uppercase text-black tracking-wide">
                  Class Routine
                </h2>
              </div>
            </div>

            <motion.div
              id="print-container-wrapper"
              variants={itemVariants}
              className="rounded-xl font-lexend bg-card/50 shadow-sm overflow-hidden w-full grid grid-cols-1 print:rounded-none print:shadow-none print:bg-transparent print:overflow-visible"
            >
              <div className="overflow-x-auto w-full print:overflow-visible">
                <Table className="w-full overflow-hidden min-w-[1000px] print:min-w-0 print:w-full border border-border/60 border-collapse text-sm print:border-collapse !print:border-black table-fixed">
                  <TableHeader>
                    <TableRow className="border-b border-border/60 hover:bg-transparent print:border-black print:border-b">
                      <TableCell
                        className="p-0 w-[90px] min-w-[90px] h-[60px] border-r border-border/60 relative bg-muted/40 print:bg-white !print:border-r !print:border-black print:w-20 print:min-w-0"
                        style={{ width: colWidths["day"] || 90, minWidth: colWidths["day"] || 90 }}
                      >
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          preserveAspectRatio="none"
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="100%"
                            y2="100%"
                            className="stroke-border/60 print:stroke-black"
                            strokeWidth="1"
                          />
                        </svg>
                        <span className="absolute top-2 right-2 text-[10px] font-bold print:text-black print:text-[10px] print:top-[2px] print:right-[2px]">
                          Time
                        </span>
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold print:text-black print:text-[10px] print:bottom-[2px] print:left-[2px]">
                          Day
                        </span>
                        <div
                          onMouseDown={(e) => startColResize(e, "day", 90, 70)}
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                        />
                      </TableCell>
                      {sortedTimeSlots.map((slot, idx) => {
                        const hasClass = currentRoutine?.schedule?.some(dayRow => dayRow.slots[idx] !== null);
                        const isBreak = isBreakSlot(slot);
                        const defaultColWidth = isBreak ? 100 : 180;
                        const colWidth = colWidths[slot.id] || defaultColWidth;

                        if (isBreak) {
                          if (!hasClass) {
                            return (
                              <TableCell
                                key={slot.id}
                                className="w-10 min-w-10 bg-foreground text-background text-center align-middle p-0 print:bg-white print:text-black print:w-6 print:min-w-0 border-r border-border/60 !print:border-r !print:border-black relative"
                                style={{ width: colWidth, minWidth: colWidth }}
                              >
                                <div className="h-full flex items-center justify-center">
                                  <span className="text-xs font-black uppercase tracking-widest -rotate-90 whitespace-nowrap text-background print:text-black print-break-text-no-class">
                                    BREAK
                                  </span>
                                </div>
                                <div
                                  onMouseDown={(e) => startColResize(e, String(slot.id), defaultColWidth, 40)}
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                                />
                              </TableCell>
                            );
                          } else {
                            return (
                              <TableCell
                                key={slot.id}
                                className="bg-foreground text-background text-center align-middle p-0 print:bg-white print:text-black border-r border-border/60 !print:border-r !print:border-black min-w-[100px] relative"
                                style={{ width: colWidth, minWidth: colWidth }}
                              >
                                <div className="h-full flex items-center justify-center">
                                  <span className="text-xs font-black uppercase tracking-widest text-background whitespace-nowrap print:text-black">
                                    BREAK
                                  </span>
                                </div>
                                <div
                                  onMouseDown={(e) => startColResize(e, String(slot.id), defaultColWidth, 40)}
                                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                                />
                              </TableCell>
                            );
                          }
                        }
                        return (
                          <TableCell
                            key={slot.id}
                            className={cn(
                              "text-center align-middle h-[60px] border-r border-border/60 last:border-r-0 p-0 !print:border-r !print:border-black print:last:border-r-0 print:h-auto relative",
                              "min-w-[100px] bg-muted/10 print:bg-white print:min-w-0"
                            )}
                            style={{ width: colWidth, minWidth: colWidth }}
                          >
                            <div className="flex flex-col items-center justify-center h-full w-full px-1">
                              <span className="font-bold text-xs whitespace-nowrap print:text-[11px] print:font-bold print:text-black">
                                {formatTimeSlotLabel(slot.start_time)}
                                <span className="mx-1">-</span>
                                {formatTimeSlotLabel(slot.end_time)}
                              </span>
                            </div>
                            <div
                              onMouseDown={(e) => startColResize(e, String(slot.id), defaultColWidth, 180)}
                              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <motion.tbody
                    key={activeSemesterId}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <AnimatePresence mode="popLayout">                      {currentRoutine.schedule.map((dayRow) => {
                      const rowHasGroup = dayRow.slots.some((s) => s && s.some(sess => sess.group_name));
                      return (
                        <motion.tr
                          key={dayRow.day}
                          variants={itemVariants}
                          className="border-b border-border/60 hover:bg-muted/5 !print:border-black print:border-b print:h-auto"
                          style={{ height: rowHeights[dayRow.day] || 85 }}
                        >
                          <TableCell className="font-bold text-xs uppercase tracking-wider p-0 align-middle text-center bg-muted/20 border-r border-border/60 !print:border-r !print:border-black print:bg-white print:text-black print:font-bold relative">
                            <div className="flex items-center justify-center h-full w-full py-4 print:py-2">
                              <span className="writing-mode-vertical lg:writing-mode-horizontal lg:rotate-0 print:rotate-0 print:text-[12px]">
                                {dayRow.day.slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                            <div
                              onMouseDown={(e) => startRowResize(e, dayRow.day, 85)}
                              className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/50 hover:h-1.5 transition-all z-30"
                            />
                          </TableCell>
                          {dayRow.slots.map((sessionList, index) => {
                            const slot = sortedTimeSlots[index];
                            const sessions = sessionList && sessionList.length > 0 ? sessionList : null;
                            const firstSession = sessions ? sessions[0] : null;
                            const isMulti = sessions ? sessions.length > 1 : false;

                            if (isBreakSlot(slot) && !sessions) {
                              return (
                                <TableCell key={index} className="p-0 h-px align-middle border-r border-border/60 relative overflow-hidden bg-muted/20 print:bg-gray-200 !print:border-r !print:border-black">
                                  <div
                                    className="absolute inset-0 opacity-10 print:hidden"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
                                      backgroundSize: "4px 4px",
                                    }}
                                  />
                                  <div className="h-full w-full flex items-center justify-center relative z-10 print:hidden">
                                    <Utensils className="w-3 h-3 text-foreground/40" />
                                  </div>
                                </TableCell>
                              );
                            }

                            // Compute cell-level states based on all sessions
                            const anyHighlighted = sessions ? sessions.some(s => isMatch(s)) : false;
                            const anyTeacherOff = sessions ? sessions.some(s => {
                              const tKey = s.teacherId ?? s.teacher;
                              const sTime = s.originalTime || "";
                              const cKey = tKey && sTime ? generateClassKey(s.department, s.semester, abbreviateDay(s.day), tKey, sTime) : "";
                              const offData = cKey ? classOffMap[cKey] : undefined;
                              return (offData?.status) || s.is_cancelled || (availabilityMap[tKey] === false);
                            }) : false;

                            return (
                              <TableCell
                                key={index}
                                onClick={() => {
                                  // For single-session cancelled cells, show reason on click
                                  if (firstSession && !isMulti) {
                                    const tKey = firstSession.teacherId ?? firstSession.teacher;
                                    const sTime = firstSession.originalTime || "";
                                    const cKey = tKey && sTime ? generateClassKey(firstSession.department, firstSession.semester, abbreviateDay(firstSession.day), tKey, sTime) : "";
                                    const offData = cKey ? classOffMap[cKey] : undefined;
                                    const isOff = Boolean(offData?.status) || Boolean(firstSession.is_cancelled);
                                    if (isOff) {
                                      setViewReasonModal({
                                        isOpen: true,
                                        course: firstSession.course,
                                        teacher: firstSession.teacher,
                                        reason: offData?.reason || firstSession.cancel_message || "No reason provided.",
                                      });
                                    }
                                  }
                                }}
                                className={cn(
                                  "h-px align-middle border-r border-border/60 transition-colors duration-200 !print:border-r !print:border-black p-2",
                                  "print:p-0.5",
                                  "cursor-default",
                                  anyHighlighted
                                    ? "bg-emerald-100/50 dark:bg-emerald-900/20 print:bg-transparent"
                                    : "bg-transparent print:bg-white"
                                )}
                              >
                                {sessions ? (
                                  <>
                                    {(() => {
                                      if (isMulti) {
                                        const isMultiHighlight = sessions.some(s => isMatch(s));
                                        const isMultiTeacherOff = sessions.some(s => {
                                          const tKey = s.teacherId ?? s.teacher;
                                          const sTime = s.originalTime || "";
                                          const cKey = tKey && sTime ? generateClassKey(s.department, s.semester, abbreviateDay(s.day), tKey, sTime) : "";
                                          const offData = cKey ? classOffMap[cKey] : undefined;
                                          return (offData?.status) || s.is_cancelled || (availabilityMap[tKey] === false);
                                        });
                                        const isMultiLab = sessions.every(s => isLabClass(s.course, undefined, s.room));
                                        const isMultiTheory = sessions.every(s => !isLabClass(s.course, undefined, s.room));

                                        const containerBgClass = isMultiTeacherOff
                                          ? "bg-red-50/50 border-red-500 ring-2 ring-red-400/40 dark:bg-red-950/10 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                                          : isMultiHighlight
                                            ? "bg-background border-emerald-500 shadow-md"
                                            : isMultiLab
                                              ? "bg-violet-50/40 border-violet-200 dark:bg-violet-950/20 dark:border-violet-800/30 hover:border-violet-400/40 hover:shadow-md"
                                              : isMultiTheory
                                                ? "bg-teal-50/40 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800/30 hover:border-teal-400/40 hover:shadow-md"
                                                : "bg-slate-50/45 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800/30 hover:border-slate-400/40 hover:shadow-md";

                                        return (
                                          <div className={cn(
                                            "print:hidden w-full rounded-md border flex flex-row p-0.5 shadow-sm relative justify-between items-stretch h-full min-h-[69px] gap-1",
                                            "transition-all duration-200",
                                            containerBgClass
                                          )}>
                                            {sessions.map((session, sIdx) => {
                                              const teacherKey = session.teacherId ?? session.teacher;
                                              const startTimeRaw = session.originalTime || "";
                                              const key = teacherKey && startTimeRaw
                                                ? generateClassKey(session.department, session.semester, abbreviateDay(session.day), teacherKey, startTimeRaw)
                                                : "";
                                              const classOffData = key ? classOffMap[key] : undefined;
                                              const isClassOffToday = Boolean(classOffData?.status) || Boolean(session.is_cancelled);
                                              const cancellationReason = classOffData?.reason || session.cancel_message || "No reason provided.";
                                              const isTeacherOff = (!!teacherKey && availabilityMap[teacherKey] === false) || isClassOffToday;
                                              const isLab = isLabClass(session.course, undefined, session.room);

                                              return (
                                                <React.Fragment key={`${session.course}-${session.teacher}-${session.room}`}>
                                                  <div
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (isClassOffToday) {
                                                        setViewReasonModal({ isOpen: true, course: session.course, teacher: session.teacher, reason: cancellationReason });
                                                      }
                                                    }}
                                                    className={cn(
                                                      "relative flex-1 flex flex-col justify-between rounded px-1.5 py-1.5 transition-colors duration-200 min-w-0 select-none group/item",
                                                      isClassOffToday && "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                                                    )}
                                                  >
                                                    <div className="flex flex-col gap-0.5 items-start w-full">
                                                      <div className={cn(
                                                        "text-[9px] font-black tracking-tighter text-foreground truncate w-full block",
                                                        isClassOffToday && "opacity-70 line-through"
                                                      )}>
                                                        {session.course}
                                                      </div>
                                                    </div>
                                                    <div className="flex flex-col items-start gap-0.5 w-full mt-1">
                                                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium truncate max-w-full">
                                                        <User className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                                        <span className="truncate">{getTeacherInitials(session.teacher)}</span>
                                                      </div>
                                                      <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/80 truncate max-w-full">
                                                        <MapPin className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                                        <span className="truncate">{session.room}</span>
                                                      </div>
                                                      {session.group_name && (
                                                        <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground/80 truncate max-w-full">
                                                          <Users className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                                          <span className="truncate">{session.group_name.replace("Group ", "")}</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  {sIdx < sessions.length - 1 && (
                                                    <div className="w-[1px] bg-border/40 self-stretch my-1 shrink-0" />
                                                  )}
                                                </React.Fragment>
                                              );
                                            })}
                                          </div>
                                        );
                                      }

                                      const session = sessions[0];
                                      const teacherKey = session.teacherId ?? session.teacher;
                                      const startTimeRaw = session.originalTime || "";
                                      const key = teacherKey && startTimeRaw
                                        ? generateClassKey(session.department, session.semester, abbreviateDay(session.day), teacherKey, startTimeRaw)
                                        : "";
                                      const classOffData = key ? classOffMap[key] : undefined;
                                      const isClassOffToday = Boolean(classOffData?.status) || Boolean(session.is_cancelled);
                                      const cancellationReason = classOffData?.reason || session.cancel_message || "No reason provided.";
                                      const isTeacherOff = (!!teacherKey && availabilityMap[teacherKey] === false) || isClassOffToday;
                                      const highlighted = isMatch(session);
                                      const isLab = isLabClass(session.course, undefined, session.room);

                                      return (
                                        <div
                                          key={`${session.course}-${session.teacher}-${session.room}`}
                                          onClick={(e) => {
                                            if (isClassOffToday) {
                                              setViewReasonModal({ isOpen: true, course: session.course, teacher: session.teacher, reason: cancellationReason });
                                            }
                                          }}
                                          className={cn(
                                            "h-full w-full rounded-md border flex flex-col justify-between p-2 shadow-sm group print:hidden",
                                            "transition-colors duration-200",
                                            isClassOffToday && "cursor-pointer",
                                            isTeacherOff
                                              ? "bg-red-50/50 border-red-500 ring-2 ring-red-400/40 dark:bg-red-950/10 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                                              : highlighted
                                                ? "bg-background border-emerald-500 shadow-md"
                                                : isLab
                                                  ? "bg-violet-50/40 border-violet-200 dark:bg-violet-950/20 dark:border-violet-800/30 hover:border-violet-400/40 hover:shadow-md"
                                                  : "bg-teal-50/40 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800/30 hover:border-teal-400/40 hover:shadow-md"
                                          )}
                                        >
                                          <div className="flex justify-between items-start w-full gap-1">
                                            <span className="text-xs font-extrabold tracking-tight leading-tight text-foreground">
                                              {session.course}
                                            </span>
                                            {isLab ? (
                                              <span className={cn(
                                                "text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded border",
                                                isTeacherOff
                                                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/40"
                                                  : "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/40"
                                              )}>Lab</span>
                                            ) : (
                                              <span className={cn(
                                                "text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded border",
                                                isTeacherOff
                                                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/40"
                                                  : "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200/50 dark:border-teal-800/40"
                                              )}>Theory</span>
                                            )}
                                          </div>
                                          <div className="flex flex-col gap-0.5 mt-1">
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                              <User className="w-3 h-3 opacity-70" />
                                              <span>{getTeacherInitials(session.teacher)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
                                              <MapPin className="w-3 h-3 opacity-70" />
                                              <span>{session.room}</span>
                                            </div>
                                            {session.group_name ? (
                                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/80">
                                                <Users className="w-3 h-3 opacity-70" />
                                                <span>{session.group_name}</span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/80 invisible select-none pointer-events-none" aria-hidden="true">
                                                <Users className="w-3 h-3 opacity-0" />
                                                <span>Placeholder</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                    {/* Print: stack text entries */}
                                    <div className="hidden print:flex flex-col items-center justify-center text-center text-black h-full w-full leading-tight py-0.5 gap-0.5">
                                      {sessions.map((session, sIdx) => {
                                        const teacherKey = session.teacherId ?? session.teacher;
                                        const sTime = session.originalTime || "";
                                        const cKey = teacherKey && sTime ? generateClassKey(session.department, session.semester, abbreviateDay(session.day), teacherKey, sTime) : "";
                                        const offData = cKey ? classOffMap[cKey] : undefined;
                                        const isTeacherOff = (offData?.status) || session.is_cancelled || (availabilityMap[teacherKey] === false);
                                        return (
                                          <div key={`print-${session.course}-${session.room}`} className={cn(
                                            "w-full text-center",
                                            sessions.length > 1 && sIdx < sessions.length - 1 && "border-b border-black/20 pb-0.5 mb-0.5"
                                          )}>
                                            <span className="font-bold text-[11px] block">
                                              {session.course}, T-{getTeacherInitials(session.teacher)}
                                            </span>
                                            <span className="font-bold text-[11px] block">
                                              {session.room}{session.group_name ? ` - ${session.group_name}` : ""}
                                            </span>
                                            {isTeacherOff && (
                                              <span className="text-[8px] font-black uppercase mt-0.5 print-cancelled-label block">
                                                (Cancelled)
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-border print:hidden" />
                                  </div>
                                )}
                              </TableCell>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                    </AnimatePresence>
                  </motion.tbody>
                </Table>
              </div>
            </motion.div>
          </div>
          )}
          <div className="text-center mt-6 print:hidden sm:hidden">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="w-full gap-2"
            >
              <Printer className="h-4 w-4" /> Print Schedule
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog
        open={viewReasonModal.isOpen}
        onOpenChange={(open) =>
          setViewReasonModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent>
          <AnimatePresence mode="wait">
            {viewReasonModal.isOpen && (
              <motion.div
                variants={dialogContainerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1"
              >
                <motion.div variants={dialogItemVariants}>
                  <DialogHeader>
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                      <Info className="h-5 w-5" />
                      <DialogTitle>Class Cancelled</DialogTitle>
                    </div>
                    <DialogDescription className="text-foreground text-base">
                      <span className="font-semibold">
                        {viewReasonModal.course}
                      </span>{" "}
                      with{" "}
                      <span className="font-semibold">
                        {viewReasonModal.teacher}
                      </span>{" "}
                      has been cancelled for today.
                    </DialogDescription>
                  </DialogHeader>
                </motion.div>

                <motion.div variants={dialogItemVariants}>
                  <div className="bg-muted/50 p-4 rounded-md border mt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                      Teacher&apos;s Reason
                    </p>
                    <p className="text-sm italic text-foreground/90 whitespace-pre-wrap break-all">
                      &quot;{viewReasonModal.reason}&quot;
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
