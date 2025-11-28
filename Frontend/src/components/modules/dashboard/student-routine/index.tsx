/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Printer,
  User,
  MapPin,
  GraduationCap,
  Utensils,
  CalendarX,
  Loader2,
  ShieldAlert,
  Info,
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

export type APIRoutineItem = {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  course_name: string;
  course_code: string;
  teacher_name: string;
  department_name: string;
  semester_name: string;
  room_number: string;
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
};

type DayRow = {
  day: string;
  slots: (ClassSession | null)[];
};

type RoutineData = {
  label: string;
  session: string;
  credits: number;
  schedule: DayRow[];
};

const timeSlots = [
  "8.45-9.35",
  "9.40-10.30",
  "10.35-11.25",
  "11.30-12.20",
  "12.25-1.15",
  "Break",
  "2.00-2.45",
  "2.45-3.30",
  "3.30-4.15",
];

const LUNCH_SLOT_INDEX = 5;

const TIME_TO_SLOT_INDEX: Record<string, number> = {
  [normalizeTime("08:45:00")]: 0,
  [normalizeTime("09:40:00")]: 1,
  [normalizeTime("10:35:00")]: 2,
  [normalizeTime("11:30:00")]: 3,
  [normalizeTime("12:25:00")]: 4,
  [normalizeTime("14:00:00")]: 6,
  [normalizeTime("14:45:00")]: 7,
  [normalizeTime("15:30:00")]: 8,
};

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

// --- HELPERS ---
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
}

export default function DepartmentRoutinePage({ routineList }: Props) {
  const availabilityMap = useSelector(
    (s: RootState) => s.teacherAvailability?.map || EMPTY_OBJ
  );
  const classOffMap = useSelector(
    (s: RootState) => s.classOff.offMap || EMPTY_OBJ
  );

  const [isLoading, setIsLoading] = useState(true);
  // Note: selectedSemester state is technically unused for filtering now
  // since we force a single view, but kept for logic consistency if needed.
  const [selectedSemester] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const auth = useSelector((s: RootState) => s.auth) as any;

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

  const isStudent = auth?.role?.toLowerCase() === "student";
  const studentSemester = auth?.semester_name;

  useEffect(() => {
    const delay = 1500;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, []);

  const formattedRoutineData = useMemo(() => {
    const grouped: Record<string, RoutineData> = {};
    const semesterUniqueCourses: Record<string, Set<string>> = {};

    // 1. Initialize Groups
    routineList.forEach((item) => {
      if (!grouped[item.semester_name]) {
        grouped[item.semester_name] = {
          label: `${item.semester_name} Semester`,
          session: "Spring 2024",
          credits: 0,
          schedule: DAYS_ORDER.map((day) => ({
            day,
            slots: Array(9).fill(null),
          })),
        };
        semesterUniqueCourses[item.semester_name] = new Set();
      }
    });

    // 2. Populate Slots
    routineList.forEach((item) => {
      const semesterGroup = grouped[item.semester_name];
      if (!semesterGroup) return;

      semesterUniqueCourses[item.semester_name].add(item.course_code);

      const dayRow = semesterGroup.schedule.find((d) => d.day === item.day);
      if (!dayRow) return;

      const normalizedApiTime = normalizeTime(item.start_time);
      const slotIndex = TIME_TO_SLOT_INDEX[normalizedApiTime];

      if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < 9) {
        dayRow.slots[slotIndex] = {
          course: item.course_code,
          teacher: item.teacher_name,
          room: item.room_number,
          teacherId: item.teacher_name,
          originalTime: item.start_time,
          department: item.department_name,
          semester: item.semester_name,
          day: item.day,
        };
      }
    });

    // 3. Calculate Credits
    Object.keys(grouped).forEach((semesterName) => {
      const uniqueCount = semesterUniqueCourses[semesterName].size;
      grouped[semesterName].credits = uniqueCount * 3.0;
    });

    return grouped;
  }, [routineList]);

  const semesterOptions = useMemo(() => {
    return Object.keys(formattedRoutineData).map((key) => ({
      id: key,
      label: formattedRoutineData[key].label,
    }));
  }, [formattedRoutineData]);

  // Determine which semester to show.
  // It prefers the student's assigned semester, otherwise defaults to the first available one.
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
    return activeSemesterId === studentSemester;
  }, [isStudent, activeSemesterId, studentSemester]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // --- SEARCH LOGIC ---
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

  if (isLoading)
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-background">
        <DataLoader />
      </div>
    );

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
          body {
            background-color: white !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          * {
            border-color: transparent !important;
          }
          table,
          th,
          td,
          tr {
            border-color: black !important;
            border-style: solid !important;
          }
          table {
            border: 1px solid black !important;
            border-collapse: collapse !important;
          }
          td,
          th {
            border: 1px solid black !important;
          }
          #print-container-wrapper {
            border: none !important;
            box-shadow: none !important;
            background-color: transparent !important;
          }
          div,
          span,
          p {
            background-color: transparent !important;
            color: black !important;
          }
          svg line {
            stroke: black !important;
          }
          * {
            box-shadow: none !important;
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
              {/* --- STATIC SEMESTER LABEL (Replaces Dropdown) --- */}
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
          ) : (
            <>
              <div className="hidden print:flex flex-col print:mt-0 bg-white items-center justify-center mb-2 pt-0 text-center w-full font-serif text-black">
                <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
                  Department of Computer Science & Engineering
                </h1>
                <div className="border-2 border-black! border-double px-8 py-0.5 mb-2">
                  <h2 className="text-base font-bold uppercase text-black tracking-wide">
                    Class Routine – {currentRoutine.session}
                  </h2>
                </div>
                <div className="w-full flex border! border-black! font-bold text-xs mt-3">
                  <div className="bg-gray-200 border-r! border-black! px-6 py-1">
                    Semester
                  </div>
                  <div className="flex-1 text-center py-1 border-r! border-black!">
                    {currentRoutine.label}
                  </div>
                  <div className="bg-gray-200 border-r! border-black! px-6 py-1">
                    Total Credit
                  </div>
                  <div className="px-10 py-1 text-center">
                    {currentRoutine.credits > 0 ? currentRoutine.credits : "-"}
                  </div>
                </div>
              </div>

              <motion.div
                id="print-container-wrapper"
                variants={itemVariants}
                className="rounded-xl font-lexend bg-card/50 shadow-sm overflow-hidden w-full grid grid-cols-1 print:rounded-none print:shadow-none print:bg-transparent print:overflow-visible"
              >
                <div className="overflow-x-auto w-full print:overflow-visible">
                  <Table className="w-full overflow-hidden min-w-[1000px] print:min-w-0 print:w-full border-collapse text-sm print:border-collapse !print:border-black">
                    <TableHeader>
                      <TableRow className="border-b border-border/60 hover:bg-transparent print:border-black print:border-b">
                        <TableCell className="p-0 w-[90px] min-w-[90px] h-[60px] border-r border-border/60 relative bg-muted/40 print:bg-white !print:border-r !print:border-black print:w-20 print:min-w-0">
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
                          <span className="absolute top-2 right-2 text-[10px] font-bold print:text-black print:text-[10px] print:top-1 print:right-1">
                            Time
                          </span>
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold print:text-black print:text-[10px] print:bottom-1 print:left-1">
                            Day
                          </span>
                        </TableCell>
                        {timeSlots.map((slot, i) => (
                          <TableCell
                            key={i}
                            className={cn(
                              "text-center align-middle h-[60px] border-r border-border/60 last:border-r-0 p-0 !print:border-r !print:border-black print:last:border-r-0 print:h-auto",
                              i === LUNCH_SLOT_INDEX
                                ? "w-10 min-w-10 bg-foreground text-background print:bg-white print:text-black print:w-6 print:min-w-0"
                                : "min-w-[100px] bg-muted/10 print:bg-white print:min-w-0"
                            )}
                          >
                            <div className="flex flex-col items-center justify-center h-full w-full px-1">
                              {i === LUNCH_SLOT_INDEX ? (
                                <div className="h-full flex items-center justify-center print:hidden">
                                  <span className="text-[10px] font-black uppercase tracking-widest -rotate-90 whitespace-nowrap text-background">
                                    Break
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold text-xs whitespace-nowrap print:text-[11px] print:font-bold print:text-black">
                                  {slot}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <motion.tbody
                      key={activeSemesterId}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <AnimatePresence mode="popLayout">
                        {currentRoutine.schedule.map((dayRow) => (
                          <motion.tr
                            key={dayRow.day}
                            variants={itemVariants}
                            className="border-b border-border/60 hover:bg-muted/5 !print:border-black print:border-b print:h-auto"
                          >
                            <TableCell className="font-bold text-xs uppercase tracking-wider p-0 align-middle text-center bg-muted/20 border-r border-border/60 !print:border-r !print:border-black print:bg-white print:text-black print:font-bold">
                              <div className="flex items-center justify-center h-full w-full py-4 print:py-2">
                                <span className="writing-mode-vertical lg:writing-mode-horizontal lg:rotate-0 print:rotate-0 print:text-[12px]">
                                  {dayRow.day.slice(0, 3).toUpperCase()}
                                </span>
                              </div>
                            </TableCell>
                            {dayRow.slots.map((session, index) => {
                              const teacherKey = session
                                ? session.teacherId ?? session.teacher
                                : undefined;

                              const startTimeRaw = session?.originalTime || "";

                              const key =
                                session && teacherKey
                                  ? generateClassKey(
                                      session.department,
                                      session.semester,
                                      abbreviateDay(session.day),
                                      teacherKey,
                                      startTimeRaw
                                    )
                                  : "";

                              const classOffData =
                                teacherKey && startTimeRaw && key
                                  ? classOffMap[key]
                                  : undefined;

                              const isClassOffToday = Boolean(
                                classOffData?.status
                              );
                              const cancellationReason =
                                classOffData?.reason || "No reason provided.";

                              const isTeacherOff =
                                (!!teacherKey &&
                                  availabilityMap[teacherKey] === false) ||
                                isClassOffToday;

                              const highlighted = isMatch(session);
                              const isLunch = index === LUNCH_SLOT_INDEX;

                              if (isLunch)
                                return (
                                  <TableCell
                                    key={index}
                                    className="p-0 align-middle border-r-0 relative overflow-hidden bg-muted/20 print:bg-gray-200 !print:border-r !print:border-black"
                                  >
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

                              return (
                                <TableCell
                                  key={index}
                                  onClick={() => {
                                    if (session && isClassOffToday) {
                                      setViewReasonModal({
                                        isOpen: true,
                                        course: session.course,
                                        teacher: session.teacher,
                                        reason: cancellationReason,
                                      });
                                    }
                                  }}
                                  className={cn(
                                    "p-1.5 align-middle border-r border-border/60 transition-colors duration-200 !print:border-r !print:border-black print:p-0.5",
                                    isClassOffToday
                                      ? "cursor-pointer"
                                      : "cursor-default",
                                    highlighted
                                      ? "bg-emerald-100/50 dark:bg-emerald-900/20 print:bg-transparent"
                                      : "bg-transparent print:bg-white"
                                  )}
                                >
                                  {session ? (
                                    <>
                                      <div
                                        className={cn(
                                          "h-full w-full rounded-md border flex flex-col justify-between p-2 shadow-sm group print:hidden",
                                          "transition-colors duration-200",
                                          isTeacherOff
                                            ? "bg-red-50/50 border-red-500 ring-2 ring-red-400/40 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                                            : highlighted
                                            ? "bg-background border-emerald-500 shadow-md"
                                            : "bg-card border-border/50 hover:border-foreground/20 hover:shadow-md"
                                        )}
                                      >
                                        <div className="flex justify-between items-start">
                                          <span className="text-xs font-extrabold tracking-tight leading-tight text-foreground">
                                            {session.course}
                                          </span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            <User className="w-3 h-3 opacity-70" />
                                            <span>
                                              {getTeacherInitials(
                                                session.teacher
                                              )}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
                                            <MapPin className="w-3 h-3 opacity-70" />
                                            <span>{session.room}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="hidden print:flex flex-col items-center justify-center text-center text-black h-full w-full leading-tight py-1">
                                        <span className="font-bold text-[11px]">
                                          {session.course}, T-
                                          {getTeacherInitials(session.teacher)}
                                        </span>
                                        <span className="font-bold text-[11px]">
                                          {session.room}
                                        </span>
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
                        ))}
                      </AnimatePresence>
                    </motion.tbody>
                  </Table>
                </div>
              </motion.div>
            </>
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
