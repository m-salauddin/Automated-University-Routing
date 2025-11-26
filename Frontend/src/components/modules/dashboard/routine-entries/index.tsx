/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  BookOpen,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  X,
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
  DialogClose,
} from "@/components/ui/dialog";
import { generateRoutine } from "@/services/routine";
import { toast } from "sonner";

// --- TYPES ---
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
};

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const BREAK_INSERT_INDEX = 4;

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

const formatTimeSlotLabel = (timeStr: string) => {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${mStr} ${ampm}`;
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
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

// Modal specific animations
const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

const modalItemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const EMPTY_OBJ = {};

// --- MEMOIZED SUB-COMPONENT FOR TABLE ROWS ---
interface RoutineTableProps {
  schedule: { day: string; semester: string; slots: (ClassSession | null)[] }[];
  timeSlots: TimeSlot[];
  isMatch: (session: ClassSession | null) => boolean;
  isAllSemestersMode: boolean;
  classOffMap: any;
  availabilityMap: any;
  onCellClick: (data: {
    course: string;
    teacher: string;
    reason: string;
  }) => void;
  generationVersion: number;
}

const MemoizedRoutineTable = React.memo(
  ({
    schedule,
    timeSlots,
    isMatch,
    isAllSemestersMode,
    classOffMap,
    availabilityMap,
    onCellClick,
    generationVersion,
  }: RoutineTableProps) => {
    return (
      <Table className="w-full overflow-hidden min-w-[1000px] print:min-w-0 print:w-full border-collapse text-sm print:border-collapse !print:border-black">
        <TableHeader>
          <TableRow className="border-b border-border/60 hover:bg-transparent print:border-black print:border-b">
            {/* Fixed Day Header */}
            <TableCell className="p-0 w-[90px] min-w-[90px] h-[60px] border-r border-border/60 relative bg-muted/40 print:bg-white !print:border-r !print:border-black print:w-16 print:min-w-0">
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

            {isAllSemestersMode && (
              <TableCell className="w-20 min-w-20 text-center font-bold bg-muted/40 border-r border-border/60 !print:border-r !print:border-black text-xs uppercase">
                Sem
              </TableCell>
            )}

            {timeSlots.map((slot, i) => (
              <React.Fragment key={slot.id}>
                {i === BREAK_INSERT_INDEX && (
                  <TableCell className="w-10 min-w-10 bg-foreground text-background text-center align-middle p-0 print:bg-white print:text-black print:w-6 print:min-w-0 border-r border-border/60 !print:border-r !print:border-black">
                    <div className="h-full flex items-center justify-center print:hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest -rotate-90 whitespace-nowrap text-background">
                        Break
                      </span>
                    </div>
                    <div className="hidden print:flex h-full w-full items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest -rotate-90 whitespace-nowrap text-black">
                        Break
                      </span>
                    </div>
                  </TableCell>
                )}

                <TableCell
                  className={cn(
                    "text-center align-middle h-[60px] border-r border-border/60 last:border-r-0 p-0 !print:border-r !print:border-black print:last:border-r-0 print:h-auto",
                    "min-w-[100px] bg-muted/10 print:bg-white print:min-w-0"
                  )}
                >
                  <div className="flex flex-col items-center justify-center h-full w-full px-1">
                    <span className="font-bold text-xs whitespace-nowrap print:text-[11px] print:font-bold print:text-black">
                      {formatTimeSlotLabel(slot.start_time)}
                      <span className="mx-1">-</span>
                      {formatTimeSlotLabel(slot.end_time)}
                    </span>
                  </div>
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <motion.tbody
          key={generationVersion}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <AnimatePresence mode="popLayout">
            {schedule.map((rowItem, rowIndex) => {
              // --- ROWSPAN LOGIC ---
              const isFirstRowOfDay =
                rowIndex === 0 || rowItem.day !== schedule[rowIndex - 1].day;

              let rowSpan = 1;
              if (isFirstRowOfDay) {
                for (let i = rowIndex + 1; i < schedule.length; i++) {
                  if (schedule[i].day === rowItem.day) {
                    rowSpan++;
                  } else {
                    break;
                  }
                }
              }

              return (
                <motion.tr
                  key={`${rowItem.day}-${rowItem.semester}`}
                  variants={itemVariants}
                  className="border-b border-border/60 hover:bg-muted/5 !print:border-black print:border-b print:h-auto"
                >
                  {/* Day Column */}
                  {isFirstRowOfDay && (
                    <TableCell
                      rowSpan={rowSpan}
                      className="font-bold text-xs uppercase tracking-wider p-0 align-middle text-center bg-muted/20 border-r border-border/60 !print:border-r !print:border-black print:bg-white print:text-black print:font-bold"
                    >
                      <div className="flex items-center justify-center h-full w-full py-4 print:py-2">
                        <span className="writing-mode-vertical lg:writing-mode-horizontal lg:rotate-0 print:rotate-0 print:text-[12px]">
                          {rowItem.day.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Semester Column */}
                  {isAllSemestersMode && (
                    <TableCell className="font-bold text-xs text-center border-r border-border/60 bg-muted/10 !print:border-r !print:border-black print:bg-white print:text-black">
                      {rowItem.semester}
                    </TableCell>
                  )}

                  {/* Dynamic Columns */}
                  {rowItem.slots.map((session, index) => {
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

                    const isClassOffToday = Boolean(classOffData?.status);
                    const cancellationReason =
                      classOffData?.reason || "No reason provided.";
                    const isTeacherOff =
                      (!!teacherKey && availabilityMap[teacherKey] === false) ||
                      isClassOffToday;

                    const highlighted = isMatch(session);

                    return (
                      <React.Fragment key={index}>
                        {index === BREAK_INSERT_INDEX && (
                          <TableCell className="p-0 align-middle border-r border-border/60 relative overflow-hidden bg-muted/20 print:bg-gray-200 !print:border-r !print:border-black">
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
                            <div className="hidden print:flex h-full w-full items-center justify-center relative z-10">
                              <Utensils className="w-3 h-3 text-black" />
                            </div>
                          </TableCell>
                        )}

                        <TableCell
                          onClick={() => {
                            if (session && isClassOffToday) {
                              onCellClick({
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
                                      {getTeacherInitials(session.teacher)}
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
                      </React.Fragment>
                    );
                  })}
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </motion.tbody>
      </Table>
    );
  }
);
MemoizedRoutineTable.displayName = "MemoizedRoutineTable";

// --- MAIN COMPONENT ---
interface Props {
  routineList: APIRoutineItem[];
  timeSlots: TimeSlot[];
}

export default function AdminRoutinePage({ routineList, timeSlots }: Props) {
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
  const [isRoutineLocked, setIsRoutineLocked] = useState(false);

  // --- LOCK CONFIRMATION STATE ---
  const [lockConfirmModal, setLockConfirmModal] = useState<{
    isOpen: boolean;
    type: "lock" | "unlock";
  }>({
    isOpen: false,
    type: "lock",
  });
  const [lockConfirmInput, setLockConfirmInput] = useState("");

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
    const timer = setTimeout(() => setDebouncedSearch(inputValue), 150);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setGenerationVersion((prev) => prev + 1);
  }, [routineList, timeSlots]);

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
    const sortedSems = sems.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    return ["All Semesters", ...sortedSems];
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
      setSelectedSemester(
        semesters.includes("All Semesters") ? "All Semesters" : semesters[0]
      );
    }
  }, [semesters, selectedSemester]);

  const handleGenerate = async () => {
    if (isRoutineLocked) return;

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

  // --- LOCK/UNLOCK HANDLERS ---
  const initiateLockAction = () => {
    if (isRoutineLocked) {
      setLockConfirmModal({ isOpen: true, type: "unlock" });
      setLockConfirmInput("");
    } else {
      setLockConfirmModal({ isOpen: true, type: "lock" });
      setLockConfirmInput("");
    }
  };

  const handleConfirmLockAction = () => {
    const type = lockConfirmModal.type;
    const input = lockConfirmInput.trim();

    if (type === "lock" && input === "lock") {
      setIsRoutineLocked(true);
      toast.success("Routine locked. Generation is now disabled.");
      setLockConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } else if (type === "unlock" && input === "unlock") {
      setIsRoutineLocked(false);
      toast.success("Routine unlocked. Generation enabled.");
      setLockConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleCellClick = useCallback(
    (data: { course: string; teacher: string; reason: string }) => {
      setViewReasonModal({
        isOpen: true,
        ...data,
      });
    },
    []
  );

  // --- DYNAMIC SCHEDULE GENERATION ---
  const currentRoutineSchedule = useMemo(() => {
    const isAllSemesters = selectedSemester === "All Semesters";

    const targetSemesters = isAllSemesters
      ? semesters.filter((s) => s !== "All Semesters")
      : [selectedSemester];

    const scheduleRows: {
      day: string;
      semester: string;
      slots: (ClassSession | null)[];
    }[] = [];

    const slotStartTimes = timeSlots.map((ts) => normalizeTime(ts.start_time));
    const uniqueCourses = new Set<string>();

    DAYS_ORDER.forEach((day) => {
      targetSemesters.forEach((sem) => {
        const rowSlots = Array(timeSlots.length).fill(
          null
        ) as (ClassSession | null)[];

        const itemsForCell = routineList.filter((item) => {
          if (!selectedDept) return false;

          const matchDept = item.department_name === selectedDept;
          const matchSem = item.semester_name === sem;
          const matchDay = item.day === day;

          return matchDept && matchSem && matchDay;
        });

        let hasContent = false;

        itemsForCell.forEach((item) => {
          const normalizedApiTime = normalizeTime(item.start_time);
          const slotIndex = slotStartTimes.indexOf(normalizedApiTime);

          if (slotIndex !== -1) {
            rowSlots[slotIndex] = {
              course: item.course_code,
              teacher: item.teacher_name,
              room: item.room_number,
              teacherId: item.teacher_name,
              originalTime: item.start_time,
              department: item.department_name,
              semester: item.semester_name,
              day: item.day,
            };
            uniqueCourses.add(item.course_code);
            hasContent = true;
          }
        });

        if (hasContent) {
          scheduleRows.push({
            day,
            semester: sem,
            slots: rowSlots,
          });
        }
      });
    });

    const totalCredits = uniqueCourses.size * 3.0;

    return {
      label: selectedDept || "Select Department",
      subLabel:
        selectedSemester === "All Semesters"
          ? "All Semesters"
          : `${selectedSemester} Semester`,
      totalCredits: totalCredits,
      schedule: scheduleRows,
      isEmpty: scheduleRows.length === 0,
      isAllSemestersMode: isAllSemesters,
    };
  }, [routineList, selectedDept, selectedSemester, semesters, timeSlots]);

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
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start md:items-end gap-6 print:hidden">
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
              {/* LOCK/UNLOCK TRIGGER BUTTON */}
              <Button
                onClick={initiateLockAction}
                variant={isRoutineLocked ? "destructive" : "outline"}
                className="gap-2 border-primary/20"
              >
                {isRoutineLocked ? (
                  <>
                    <Unlock className="h-4 w-4" /> Unlock
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Lock
                  </>
                )}
              </Button>

              {!isRoutineLocked && (
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
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              )}

              <Button
                onClick={() => window.print()}
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hidden md:flex"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center mb-5 gap-4 print:hidden">
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 bg-card border rounded-xl p-1.5 shadow-sm w-full lg:w-fit"
            >
              {/* Department Select */}
              <div className="flex items-center gap-3 px-3 bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all flex-1 min-w-[150px]">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="h-10 border-none shadow-none bg-transparent! focus-visible:ring-0 focus:ring-0 px-0 font-medium w-full">
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

              {/* Semester Select */}
              <div className="flex items-center gap-3 px-3 bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all flex-1 min-w-[150px]">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                >
                  <SelectTrigger className="h-10 border-none shadow-none bg-transparent! focus-visible:ring-0 focus:ring-0 px-0 font-medium w-full">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem === "All Semesters" ? (
                          <span>All Semesters</span>
                        ) : (
                          `${sem} Semester`
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Total Credits */}
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border border-transparent transition-all flex-1 min-w-[150px] justify-center sm:justify-start">
                <div>
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 leading-none whitespace-nowrap">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                    Total Credits
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {currentRoutineSchedule.totalCredits.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Search Input */}
            <motion.div
              variants={itemVariants}
              className="flex-1 min-w-[200px] bg-card border rounded-xl p-1.5 shadow-sm"
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

          {/* Print Header */}
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
            <div className="flex justify-between w-full px-4 mb-2 font-bold text-xs uppercase border-b border-black">
              <span>Semester: {currentRoutineSchedule.subLabel}</span>
              <span>
                Total Credit: {currentRoutineSchedule.totalCredits.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Main Content */}
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
                {/* --- MEMOIZED TABLE RENDERED HERE --- */}
                <MemoizedRoutineTable
                  schedule={currentRoutineSchedule.schedule}
                  timeSlots={timeSlots}
                  isMatch={isMatch}
                  isAllSemestersMode={currentRoutineSchedule.isAllSemestersMode}
                  classOffMap={classOffMap}
                  availabilityMap={availabilityMap}
                  onCellClick={handleCellClick}
                  generationVersion={generationVersion}
                />
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

      {/* --- CANCELLATION INFO MODAL --- */}
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
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-1"
              >
                <motion.div variants={modalItemVariants}>
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

                <motion.div variants={modalItemVariants}>
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

      {/* --- LOCK CONFIRMATION MODAL --- */}
      <Dialog
        open={lockConfirmModal.isOpen}
        onOpenChange={(open) =>
          setLockConfirmModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <AnimatePresence mode="wait">
            {lockConfirmModal.isOpen && (
              <motion.div
                key={lockConfirmModal.type}
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  "bg-background border rounded-lg shadow-xl w-full flex flex-col overflow-hidden",
                  lockConfirmModal.type === "lock"
                    ? "border-red-500/30"
                    : "border-emerald-500/30"
                )}
              >
                {/* Custom Header Area */}
                <motion.div
                  variants={modalItemVariants}
                  className={cn(
                    "p-6 pb-4 flex items-start gap-4 border-b",
                    lockConfirmModal.type === "lock"
                      ? "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
                      : "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full shrink-0",
                      lockConfirmModal.type === "lock"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                    )}
                  >
                    {lockConfirmModal.type === "lock" ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-xl">
                      {lockConfirmModal.type === "lock"
                        ? "Lock Routine?"
                        : "Unlock Routine?"}
                    </DialogTitle>
                    <DialogDescription className="text-base leading-snug text-muted-foreground/90">
                      {lockConfirmModal.type === "lock" ? (
                        <span>
                          Locking will <strong>disable generation</strong> for
                          everyone. This is usually done after the final routine
                          is set.
                        </span>
                      ) : (
                        <span>
                          Unlocking will <strong>enable generation</strong>. Use
                          this if you need to regenerate the routine.
                        </span>
                      )}
                    </DialogDescription>
                  </div>
                </motion.div>

                {/* Input Area */}
                <div className="p-6 space-y-4 bg-card">
                  <motion.div
                    variants={modalItemVariants}
                    className="space-y-3"
                  >
                    <label className="text-sm font-medium text-foreground flex justify-between">
                      <span>Confirmation Required</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Type{" "}
                        <span className="font-mono font-bold">
                          &quot;{lockConfirmModal.type}&quot;
                        </span>{" "}
                        below
                      </span>
                    </label>
                    <Input
                      value={lockConfirmInput}
                      onChange={(e) => setLockConfirmInput(e.target.value)}
                      placeholder={`Type "${lockConfirmModal.type}" to confirm`}
                      className={cn(
                        "font-mono text-base h-11 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all",
                        lockConfirmModal.type === "lock"
                          ? "focus-visible:border-red-500 bg-red-50/30 dark:bg-red-900/5"
                          : "focus-visible:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/5"
                      )}
                    />
                  </motion.div>
                </div>

                {/* Footer Area */}
                <motion.div
                  variants={modalItemVariants}
                  className="p-6 pt-2 bg-card flex justify-end gap-3"
                >
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setLockConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false,
                      }))
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmLockAction}
                    disabled={lockConfirmInput !== lockConfirmModal.type}
                    className={cn(
                      "min-w-[100px] font-semibold transition-all duration-300",
                      lockConfirmModal.type === "lock"
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none"
                    )}
                  >
                    {lockConfirmModal.type === "lock"
                      ? "Lock Now"
                      : "Unlock Now"}
                  </Button>
                </motion.div>

                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
