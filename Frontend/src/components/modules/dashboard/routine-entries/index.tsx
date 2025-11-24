"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ShieldBan,
  Info,
  ChevronLeft,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  generateClassKey,
  normalizeTime,
  resetAll,
} from "@/store/classOffSlice";
import DataLoader from "@/components/ui/data-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateRoutine } from "@/services/routine";
import { toast } from "sonner";

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

// UPDATED: Added helper to match the abbreviated day format stored by the teacher page
const abbreviateDay = (day: string) => {
  return day ? day.substring(0, 3) : "";
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};

const dialogContainerVariants: Variants = {
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

const dialogItemVariants: Variants = {
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

export default function AdminRoutinePage({ routineList }: Props) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { role, isLoading: isAuthLoading } = useSelector(
    (s: RootState) => s.auth
  );
  const availabilityMap = useSelector(
    (s: RootState) => s.teacherAvailability?.map || EMPTY_OBJ
  );
  const classOffMap = useSelector(
    (s: RootState) => s.classOff.offMap || EMPTY_OBJ
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [generationVersion, setGenerationVersion] = useState(0);
  const isFirstRender = useRef(true);

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

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

  useEffect(() => {
    const delay = 1500;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setGenerationVersion((prev) => prev + 1);
  }, [routineList]);

  const departments = useMemo(() => {
    const depts = Array.from(
      new Set(routineList.map((item) => item.department_name))
    );
    return depts.sort();
  }, [routineList]);

  const semesters = useMemo(() => {
    let filteredList = routineList;
    if (selectedDept) {
      filteredList = routineList.filter(
        (item) => item.department_name === selectedDept
      );
    }
    const sems = Array.from(
      new Set(filteredList.map((item) => item.semester_name))
    );
    return sems.sort();
  }, [routineList, selectedDept]);

  useEffect(() => {
    if (departments.length > 0 && !selectedDept) {
      setSelectedDept(departments[0]);
    }
  }, [departments, selectedDept]);

  useEffect(() => {
    if (
      semesters.length > 0 &&
      (!selectedSemester || !semesters.includes(selectedSemester))
    ) {
      setSelectedSemester(semesters[0]);
    }
  }, [semesters, selectedSemester]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateRoutine();
      if (result.success) {
        dispatch(resetAll());
        toast.success("Routine generated successfully!");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to generate routine");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentRoutineSchedule = useMemo(() => {
    const schedule = DAYS_ORDER.map((day) => ({
      day,
      slots: Array(9).fill(null) as (ClassSession | null)[],
    }));

    const filtered = routineList.filter((item) => {
      if (!selectedDept || !selectedSemester) return false;

      const matchDept = item.department_name === selectedDept;
      const matchSem = item.semester_name === selectedSemester;

      let matchSearch = true;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        matchSearch =
          item.course_name.toLowerCase().includes(q) ||
          item.course_code.toLowerCase().includes(q) ||
          item.teacher_name.toLowerCase().includes(q) ||
          item.room_number.toLowerCase().includes(q);
      }

      return matchDept && matchSem && matchSearch;
    });

    filtered.forEach((item) => {
      const dayRow = schedule.find((d) => d.day === item.day);
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

    return {
      label: selectedDept || "Select Department",
      subLabel: selectedSemester
        ? `${selectedSemester} Semester`
        : "Select Semester",
      credits: 0,
      schedule,
      isEmpty: filtered.length === 0,
    };
  }, [routineList, selectedDept, selectedSemester, debouncedSearch]);

  const isMatch = useMemo(() => {
    return (session: ClassSession | null) => {
      if (!session || !debouncedSearch) return false;
      const query = debouncedSearch.toLowerCase();
      return (
        session.course.toLowerCase().includes(query) ||
        session.teacher.toLowerCase().includes(query) ||
        session.room.toLowerCase().includes(query)
      );
    };
  }, [debouncedSearch]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-background">
        <DataLoader />
      </div>
    );
  }

  if (role !== "admin") {
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

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          * {
            border-color: transparent !important;
            box-shadow: none !important;
          }
          table,
          th,
          td {
            border: 1px solid black !important;
            border-collapse: collapse !important;
          }
          #print-container-wrapper {
            border: none !important;
            background: transparent !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen font-lexend w-full max-w-[1600px] mx-auto bg-background text-foreground p-5 overflow-x-hidden print:p-0 print:max-w-none print:bg-white print:text-black"
      >
        <div className="space-y-8 print:space-y-0 print:w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
            <div className="space-y-2">
              <motion.div variants={itemVariants}>
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
                >
                  Admin Panel
                </Badge>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
              >
                {currentRoutineSchedule.label}
              </motion.h1>
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <p className="text-muted-foreground font-medium">
                  Class Routine{" "}
                  <span className="text-foreground/40 mx-1">•</span>{" "}
                  <span className="text-foreground font-semibold">
                    {currentRoutineSchedule.subLabel}
                  </span>
                </p>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 bg-primary/90 hover:bg-primary"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                )}
                {isGenerating ? "Generating..." : "Generate Routine"}
              </Button>

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
              <div className="flex items-center gap-3 px-3 bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all flex-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="h-10 border-none shadow-none bg-transparent! focus-visible:ring-0 focus:ring-0 px-0 font-medium">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 px-3 bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all flex-1">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                >
                  <SelectTrigger className="h-10 border-none shadow-none bg-transparent! focus-visible:ring-0 focus:ring-0 px-0 font-medium">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem} Semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="lg:col-span-4 bg-card border rounded-xl p-1.5 shadow-sm"
            >
              <div className="flex items-center gap-3 px-3 h-full bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search course, teacher..."
                  className="border-none font-lexend shadow-none bg-transparent! focus-visible:ring-0 h-10 px-0 text-sm"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          <div className="hidden print:flex flex-col print:mt-0 bg-white items-center justify-center mb-2 pt-0 text-center w-full font-serif text-black">
            <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
              {currentRoutineSchedule.label}
            </h1>
            <div className="border-2 border-black! border-double px-8 py-0.5 mb-2">
              <h2 className="text-base font-bold uppercase text-black tracking-wide">
                Class Routine{" "}
                {currentRoutineSchedule.subLabel &&
                  `– ${currentRoutineSchedule.subLabel}`}
              </h2>
            </div>
          </div>

          {currentRoutineSchedule.isEmpty ? (
            <motion.div
              variants={itemVariants}
              className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-xl bg-muted/5"
            >
              <div className="rounded-full p-6 mb-6 bg-muted/20">
                <CalendarX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                No Schedule Found
              </h2>
              <p className="text-muted-foreground max-w-[400px] text-base leading-relaxed">
                No classes match the selected department and semester filters.
              </p>
            </motion.div>
          ) : (
            <motion.div
              id="print-container-wrapper"
              variants={itemVariants}
              className="rounded-xl font-lexend bg-card/50 shadow-sm overflow-hidden w-full grid grid-cols-1 print:rounded-none print:shadow-none print:bg-transparent print:overflow-visible"
            >
              <div className="overflow-x-auto w-full print:overflow-visible">
                <Table className="w-full overflow-hidden min-w-[1000px] print:min-w-0 print:w-full border-collapse text-sm print:border-collapse !print:border-black">
                  <TableHeader>
                    <TableRow className="border-b border-border/60 hover:bg-transparent print:border-black print:border-b">
                      {/* Fixed Day/Time Header */}
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
                    key={`${selectedDept}-${selectedSemester}-${generationVersion}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <AnimatePresence mode="popLayout">
                      {currentRoutineSchedule.schedule.map((dayRow) => (
                        <motion.tr
                          key={dayRow.day}
                          variants={itemVariants}
                          className="border-b border-border/60 hover:bg-muted/5 !print:border-black print:border-b print:h-auto"
                        >
                          {/* Day Column */}
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

                            // UPDATED: Use abbreviateDay() for the day to match the key stored by the Teacher page
                            // Teacher page stores: "Sun" | "Mon" | etc.
                            // API here gives: "Sunday" | "Monday" | etc.
                            const key =
                              session && teacherKey
                                ? generateClassKey(
                                    session.department,
                                    session.semester,
                                    abbreviateDay(session.day), // FIXED: Match format
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
                                    ? "bg-foreground/5 print:bg-transparent"
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
                                          ? "bg-background border-foreground shadow-md ring-1 ring-foreground/10"
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
