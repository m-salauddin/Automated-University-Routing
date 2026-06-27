"use client";

import React, { useState, useMemo, useEffect } from "react";
console.log("Department Routine client component loaded v6");
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  ShieldBan,
  ChevronLeft,
  ArrowUpDown,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { generateClassKey, normalizeTime } from "@/store/classOffSlice";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { requestSwap } from "@/services/routine";
import { getAllUsers } from "@/services/users";

export type APIRoutineItem = {
  id: number;
  day: number | string;
  day_name: string;
  start_time: string;
  end_time: string;
  course_name: string;
  course_code: string;
  course_type?: string;
  credits?: number;
  teacher_id?: number;
  teacher_name: string;
  department_name: string;
  semester_name: string;
  room_number: string;
  group_name?: string | null;
  is_cancelled?: boolean;
  cancel_message?: string | null;
};

export type TimeSlot = {
  id: number;
  start_time: string;
  end_time: string;
};

type ClassSession = {
  id?: number;
  course: string;
  teacher: string;
  room: string;
  teacherId?: string;
  teacherNumericId?: number;
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

// Mapping from normalized teacher names to their database integer IDs
// Modify these database IDs if they change on the backend.
const TEACHER_ID_MAP: Record<string, number> = {
  taniasultana: 2,
  santaislam: 5,
  shatabdebala: 6,
  nilakhan: 7,
  mdraselmia: 8,
  adilanuzhat: 9,
  taniaakter: 10,
  osmangoni: 11,
  sharifahamed: 12,
  ummefarhana: 13,
  nurmohammad: 14,
  farzanatasnim: 15,
};

const EMPTY_OBJ = {};

interface Props {
  routineList: APIRoutineItem[];
  timeSlots: TimeSlot[];
}

export default function DepartmentRoutinePage({ routineList, timeSlots }: Props) {
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

  const [selectedSemester, setSelectedSemester] = useState<string>("all");
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

  const role = auth?.role?.toLowerCase();
  const isAllowed = role === "teacher" || role === "admin";

  // Swap Request States
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedRowForSwap, setSelectedRowForSwap] = useState<any>(null);
  const [swapType, setSwapType] = useState<"PROXY" | "MUTUAL">("PROXY");
  const [targetTeacherId, setTargetTeacherId] = useState<string>("");
  const [targetRoutineId, setTargetRoutineId] = useState<string>("");
  const [requesterRoutineId, setRequesterRoutineId] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [swapDate, setSwapDate] = useState<string>("");
  const [swapReason, setSwapReason] = useState<string>("");
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);
  const [teachersList, setTeachersList] = useState<any[]>([]);

  useEffect(() => {
    if (role !== "teacher") return;

    const fetchTeachers = async () => {
      try {
        const res = await getAllUsers();
        let fetchedTeachers: any[] = [];

        if (res.success) {
          let dataArray = [];
          if (Array.isArray(res.data)) {
            dataArray = res.data;
          } else if (res.data && typeof res.data === "object" && Array.isArray(res.data.results)) {
            dataArray = res.data.results;
          }
          fetchedTeachers = dataArray.filter((u: any) => u.role?.toUpperCase() === "TEACHER");
        }

        if (fetchedTeachers.length > 0) {
          setTeachersList(fetchedTeachers);
          return;
        }

        // Fallback: extract unique teachers from routineList (use teacher_id from API)
        const uniqueTeachersMap = new Map();
        routineList.forEach((item: any) => {
          if (item.teacher_name) {
            const nameKey = item.teacher_name.toLowerCase();
            // Prefer the numeric teacher_id from the API response; fall back to TEACHER_ID_MAP
            const mappedId =
              item.teacher_id ??
              TEACHER_ID_MAP[nameKey] ??
              item.teacher_name;
            uniqueTeachersMap.set(nameKey, {
              id: mappedId,
              name: item.teacher_name,
              username: item.teacher_name,
              role: "TEACHER",
            });
          }
        });
        fetchedTeachers = Array.from(uniqueTeachersMap.values());
        setTeachersList(fetchedTeachers);
      } catch (err: any) {
        console.error("Failed to load teachers for swap:", err);
      }
    };

    fetchTeachers();
  }, [role, routineList]);



  // Calculate target teacher's classes for MUTUAL swap
  const targetTeacherClasses = useMemo(() => {
    if (swapType !== "MUTUAL" || !targetTeacherId || !teachersList.length) {
      return [];
    }
    const targetTeacher = teachersList.find((t) => String(t.id) === targetTeacherId);
    const targetUsername = targetTeacher ? (targetTeacher.username || targetTeacher.name) : "";
    if (!targetUsername) return [];

    return routineList.filter((item: any) => {
      return (
        item.teacher_name &&
        item.teacher_name.toLowerCase() === targetUsername.toLowerCase()
      );
    });
  }, [targetTeacherId, swapType, teachersList, routineList]);

  // Calculate logged-in teacher's own classes for swap requester dropdown
  const myClasses = useMemo(() => {
    if (!routineList || !auth?.username) return [];
    return routineList.filter(
      (item: any) =>
        item.teacher_name?.toLowerCase() === auth.username.toLowerCase() ||
        item.teacher?.toLowerCase() === auth.username.toLowerCase()
    );
  }, [routineList, auth?.username]);


  const handleSendSwapRequest = async () => {
    if (!selectedRowForSwap || !swapDate) {
      toast.error("Swap Date is required");
      return;
    }
    if (!requesterRoutineId) {
      toast.error(swapType === "PROXY" ? "Requester class is missing" : "Please select Your Class to swap");
      return;
    }
    if (!targetTeacherId) {
      toast.error("Please select a Target Teacher");
      return;
    }

    setIsSubmittingSwap(true);
    try {
      let targetTeacherParam: string | number = parseInt(targetTeacherId);
      if (isNaN(targetTeacherParam)) {
        if (typeof targetTeacherId === "string" && targetTeacherId.trim().length > 0) {
          targetTeacherParam = targetTeacherId;
        } else {
          toast.error(`Invalid target teacher. ${swapType === "MUTUAL" ? "Swap" : "Proxy"} request requires a target teacher.`);
          setIsSubmittingSwap(false);
          return;
        }
      }

      const swapPayload: any = {
        swap_type: swapType,
        target_teacher_id: targetTeacherParam,
        requester_routine_id: parseInt(requesterRoutineId),
        swap_date: swapDate,
        reason: swapReason,
      };
      if (swapType === "MUTUAL" && selectedRowForSwap?.id) {
        swapPayload.target_routine_id = selectedRowForSwap.id;
      }

      const res = await requestSwap(swapPayload);

      if (res.success) {
        toast.success(`${swapType === "MUTUAL" ? "Swap" : "Proxy"} request sent successfully!`);
        setIsSwapModalOpen(false);
      } else {
        toast.error(res.message || `Failed to submit ${swapType === "MUTUAL" ? "swap" : "proxy"} request`);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmittingSwap(false);
    }
  };

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
        dayRow.slots[slotIndex] = {
          id: item.id,
          course: item.course_code,
          teacher: item.teacher_name,
          room: item.room_number,
          teacherId: item.teacher_name,
          teacherNumericId: item.teacher_id,
          originalTime: item.start_time,
          department: item.department_name,
          semester: item.semester_name,
          day: item.day_name,
        };
      }
    });

    Object.keys(grouped).forEach((semesterName) => {
      const uniqueCount = semesterUniqueCourses[semesterName].size;
      grouped[semesterName].credits = uniqueCount * 3.0;
    });

    return grouped;
  }, [routineList, sortedTimeSlots]);

  const teacherSemesters = useMemo(() => {
    const semesters = new Set<string>();
    if (role === "teacher" && auth?.username) {
      const currentTeacher = auth.username.toLowerCase();
      routineList.forEach((item) => {
        if (
          item.teacher_name &&
          item.teacher_name.toLowerCase() === currentTeacher
        ) {
          semesters.add(item.semester_name);
        }
      });
    }
    return semesters;
  }, [routineList, role, auth?.username]);

  const semesterOptions = useMemo(() => {
    const list = Object.keys(formattedRoutineData)
      .map((key) => ({
        id: key,
        label: formattedRoutineData[key].label,
        hasClasses: teacherSemesters.has(key),
      }))
      .sort((a, b) => {
        const numA = parseInt(a.id) || 999;
        const numB = parseInt(b.id) || 999;
        return numA - numB;
      });
    if (list.length > 0) {
      list.unshift({
        id: "all",
        label: "All Semesters",
        hasClasses: false,
      });
    }
    return list;
  }, [formattedRoutineData, teacherSemesters]);

  const activeSemesterId = useMemo(() => {
    if (selectedSemester === "all") return "all";
    if (selectedSemester && formattedRoutineData[selectedSemester])
      return selectedSemester;
    return "all";
  }, [selectedSemester, formattedRoutineData]);

  const myClassesInSemester = useMemo(() => {
    return myClasses.filter((c: any) => c.semester_name === activeSemesterId);
  }, [myClasses, activeSemesterId]);

  const otherTeachers = useMemo(() => {
    if (!teachersList || !auth?.username) return [];
    const currentUsername = auth.username.toLowerCase();
    return teachersList.filter((t: any) => {
      const usernameNorm = t.username?.toLowerCase() || "";
      const nameNorm = t.name?.toLowerCase() || "";
      return usernameNorm !== currentUsername && nameNorm !== currentUsername;
    });
  }, [teachersList, auth?.username]);

  const currentRoutine = useMemo(() => {
    if (activeSemesterId === "all") {
      const keys = Object.keys(formattedRoutineData).sort((a, b) => {
        const numA = parseInt(a) || 999;
        const numB = parseInt(b) || 999;
        return numA - numB;
      });
      return keys.length > 0 ? formattedRoutineData[keys[0]] : null;
    }
    return formattedRoutineData[activeSemesterId];
  }, [activeSemesterId, formattedRoutineData]);

  const sortedSemesterKeys = useMemo(() => {
    return Object.keys(formattedRoutineData).sort((a, b) => {
      const numA = parseInt(a) || 999;
      const numB = parseInt(b) || 999;
      return numA - numB;
    });
  }, [formattedRoutineData]);

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

  const allSemestersSchedule = useMemo(() => {
    if (activeSemesterId !== "all") return [];

    const scheduleRows: {
      day: string;
      semester: string;
      slots: (ClassSession | null)[];
    }[] = [];

    const slotStartTimes = sortedTimeSlots.map((ts) => normalizeTime(ts.start_time));

    DAYS_ORDER.forEach((day) => {
      // Check if this day has any classes scheduled across any semester in the routineList
      const dayHasAnyClasses = routineList.some((item) => item.day_name === day);

      if (dayHasAnyClasses) {
        sortedSemesterKeys.forEach((semKey) => {
          const semesterData = formattedRoutineData[semKey];
          if (!semesterData) return;

          const rowSlots = Array(sortedTimeSlots.length).fill(null) as (ClassSession | null)[];
          const semesterDayRow = semesterData.schedule.find((d) => d.day === day);

          if (semesterDayRow) {
            scheduleRows.push({
              day,
              semester: semKey,
              slots: semesterDayRow.slots,
            });
          } else {
            scheduleRows.push({
              day,
              semester: semKey,
              slots: rowSlots,
            });
          }
        });
      }
    });

    return scheduleRows;
  }, [activeSemesterId, sortedSemesterKeys, formattedRoutineData, routineList, sortedTimeSlots]);

  const pageGroups = useMemo(() => {
    if (activeSemesterId !== "all") return [];
    const groups: typeof allSemestersSchedule[] = [[], [], []];
    allSemestersSchedule.forEach((row) => {
      const day = row.day.toLowerCase();
      if (day === "sunday" || day === "monday") {
        groups[0].push(row);
      } else if (day === "tuesday" || day === "wednesday") {
        groups[1].push(row);
      } else {
        groups[2].push(row);
      }
    });
    return groups.filter((g) => g.length > 0);
  }, [allSemestersSchedule, activeSemesterId]);

  const renderTable = (
    scheduleToRender: any[],
    isPrint: boolean,
    isAllSemesters: boolean
  ) => {
    return (
      <Table className="w-full overflow-hidden min-w-[1000px] print:min-w-0 print:w-full border border-border/60 border-collapse text-sm print:border-collapse !print:border-black">
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
              <span className="absolute top-2 right-2 text-[10px] font-bold print:text-black print:text-[10px] print:top-[2px] print:right-[2px]">
                Time
              </span>
              <span className="absolute bottom-2 left-2 text-[10px] font-bold print:text-black print:text-[10px] print:bottom-[2px] print:left-[2px]">
                Day
              </span>
            </TableCell>

            {isAllSemesters && (
              <TableCell className="w-20 min-w-20 text-center font-bold bg-muted/40 border-r border-border/60 text-xs uppercase print:bg-white print:text-black !print:border-r !print:border-black print:w-16 print:min-w-0">
                Semester
              </TableCell>
            )}

            {sortedTimeSlots.map((slot, idx) => {
              const hasClass = scheduleToRender.some((dayRow) => dayRow.slots[idx] !== null);
              const isBreak = isBreakSlot(slot);
              if (isBreak) {
                if (!hasClass) {
                  return (
                    <TableCell
                      key={slot.id}
                      className="w-10 min-w-10 bg-foreground text-background text-center align-middle p-0 print:bg-white print:text-black print:w-6 print:min-w-0 border-r border-border/60 !print:border-r !print:border-black"
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-widest -rotate-90 whitespace-nowrap text-background print:text-black print-break-text-no-class">
                          BREAK
                        </span>
                      </div>
                    </TableCell>
                  );
                } else {
                  return (
                    <TableCell
                      key={slot.id}
                      className="bg-foreground text-background text-center align-middle p-0 print:bg-white print:text-black border-r border-border/60 !print:border-r !print:border-black min-w-[100px]"
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-widest text-background whitespace-nowrap print:text-black">
                          BREAK
                        </span>
                      </div>
                    </TableCell>
                  );
                }
              }
              return (
                <TableCell
                  key={slot.id}
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
              );
            })}
          </TableRow>
        </TableHeader>

        {isAllSemesters ? (
          DAYS_ORDER.map((dayName) => {
            const dayRows = scheduleToRender.filter(
              (rowItem) => rowItem.day.toLowerCase() === dayName.toLowerCase()
            );
            if (dayRows.length === 0) return null;

            return (
              <motion.tbody
                key={dayName}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={cn(isPrint ? "print:break-inside-avoid !print:break-inside-avoid" : "")}
              >
                <AnimatePresence mode="popLayout">
                  {dayRows.map((rowItem, rowIndex) => {
                    const isFirstRowOfDay = rowIndex === 0;
                    const rowSpan = dayRows.length;

                    return (
                      <motion.tr
                        key={`${rowItem.day}-${rowItem.semester}`}
                        variants={itemVariants}
                        className="border-b border-border/60 hover:bg-muted/5 !print:border-black print:border-b print:h-auto"
                      >
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

                        <TableCell className="font-bold text-xs text-center border-r border-border/60 bg-muted/10 print:bg-white print:text-black !print:border-r !print:border-black">
                          {rowItem.semester}
                        </TableCell>

                        {rowItem.slots.map((session: any, index: number) => {
                          const slot = sortedTimeSlots[index];
                          if (isBreakSlot(slot) && !session) {
                            return (
                              <TableCell
                                key={index}
                                className="p-0 h-px align-middle border-r border-border/60 relative overflow-hidden bg-muted/20 print:bg-gray-200 !print:border-r !print:border-black"
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
                          }

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
                            teacherKey && startTimeRaw && key ? classOffMap[key] : undefined;

                          const isClassOffToday = Boolean(classOffData?.status);
                          const cancellationReason = classOffData?.reason || "No reason provided.";
                          const isTeacherOff =
                            (!!teacherKey && availabilityMap[teacherKey] === false) || isClassOffToday;

                          const highlighted = isMatch(session);
                          const isLab = session ? isLabClass(session.course, undefined, session.room) : false;

                          const semesterKey = rowItem.semester;

                          return (
                            <TableCell
                              key={index}
                              onClick={() => {
                                if (session) {
                                  if (isClassOffToday) {
                                    setViewReasonModal({
                                      isOpen: true,
                                      course: session.course,
                                      teacher: session.teacher,
                                      reason: cancellationReason,
                                    });
                                  } else if (role === "teacher" && teacherSemesters.has(semesterKey)) {
                                    const isOwnClass =
                                      session.teacher?.toLowerCase() === auth?.username?.toLowerCase();

                                    if (isOwnClass) {
                                      setSelectedRowForSwap(session);
                                      setSwapType("PROXY");
                                      setTargetTeacherId("");
                                      setTargetRoutineId("");
                                      setRequesterRoutineId(String(session.id));
                                      setSwapDate(format(new Date(), "yyyy-MM-dd"));
                                      setSwapReason("");
                                      setIsCalendarOpen(false);
                                      setIsSwapModalOpen(true);
                                    } else {
                                      let targetTeacherIdVal = "";

                                      if (session.teacherNumericId) {
                                        targetTeacherIdVal = String(session.teacherNumericId);
                                      } else {
                                        const normalizeStr = (str: string) =>
                                          str ? str.toLowerCase().replace(/[\s-_]/g, "") : "";

                                        const targetTeacherObj = teachersList.find((t) => {
                                          const usernameNorm = normalizeStr(t.username);
                                          const nameNorm = normalizeStr(t.name);
                                          const sessionTeacherNorm = normalizeStr(session.teacher);

                                          if (
                                            usernameNorm === sessionTeacherNorm ||
                                            nameNorm === sessionTeacherNorm
                                          ) {
                                            return true;
                                          }

                                          const tInitials = getTeacherInitials(
                                            t.name || t.username
                                          ).toLowerCase();
                                          const sInitials = getTeacherInitials(
                                            session.teacher
                                          ).toLowerCase();
                                          return tInitials === sInitials;
                                        });
                                        targetTeacherIdVal = targetTeacherObj ? String(targetTeacherObj.id) : "";
                                      }

                                      setSelectedRowForSwap(session);
                                      setSwapType("MUTUAL");
                                      setTargetTeacherId(targetTeacherIdVal);
                                      setTargetRoutineId(String(session.id));
                                      setRequesterRoutineId("");
                                      setSwapDate(format(new Date(), "yyyy-MM-dd"));
                                      setSwapReason("");
                                      setIsCalendarOpen(false);
                                      setIsSwapModalOpen(true);
                                    }
                                  }
                                }
                              }}
                              className={cn(
                                "p-2.5 h-px align-middle border-r border-border/60 transition-colors duration-200 !print:border-r !print:border-black print:p-0.5",
                                isClassOffToday ||
                                  (role === "teacher" && session && teacherSemesters.has(semesterKey))
                                  ? "cursor-pointer hover:border-indigo-400 hover:bg-muted/10"
                                  : "cursor-default",
                                highlighted
                                  ? "bg-emerald-100/50 dark:bg-emerald-950/20 print:bg-transparent"
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
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-1 py-0.2 rounded border border-violet-200/50 dark:border-violet-800/40">
                                          Lab
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-1 py-0.2 rounded border border-teal-200/50 dark:border-teal-800/40">
                                          Theory
                                        </span>
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
                                    </div>
                                  </div>
                                  <div className="hidden print:flex flex-col items-center justify-center text-center text-black h-full w-full leading-tight py-1">
                                    <span className="font-bold text-[11px]">
                                      {session.course}, T-{getTeacherInitials(session.teacher)}
                                    </span>
                                    <span className="font-bold text-[11px]">{session.room}</span>
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
            );
          })
        ) : (
          <motion.tbody
            key={activeSemesterId}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <AnimatePresence mode="popLayout">
              {scheduleToRender.map((dayRow) => (
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
                  {dayRow.slots.map((session: any, index: number) => {
                    const slot = sortedTimeSlots[index];
                    if (isBreakSlot(slot) && !session) {
                      return (
                        <TableCell
                          key={index}
                          className="p-0 h-px align-middle border-r border-border/60 relative overflow-hidden bg-muted/20 print:bg-gray-200 !print:border-r !print:border-black"
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
                    }

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
                      teacherKey && startTimeRaw && key ? classOffMap[key] : undefined;

                    const isClassOffToday = Boolean(classOffData?.status);
                    const cancellationReason = classOffData?.reason || "No reason provided.";
                    const isTeacherOff =
                      (!!teacherKey && availabilityMap[teacherKey] === false) || isClassOffToday;

                    const highlighted = isMatch(session);
                    const isLab = session ? isLabClass(session.course, undefined, session.room) : false;

                    return (
                      <TableCell
                        key={index}
                        onClick={() => {
                          if (session) {
                            if (isClassOffToday) {
                              setViewReasonModal({
                                isOpen: true,
                                course: session.course,
                                teacher: session.teacher,
                                reason: cancellationReason,
                              });
                            } else if (role === "teacher" && teacherSemesters.has(activeSemesterId)) {
                              const isOwnClass =
                                session.teacher?.toLowerCase() === auth?.username?.toLowerCase();

                              if (isOwnClass) {
                                setSelectedRowForSwap(session);
                                setSwapType("PROXY");
                                setTargetTeacherId("");
                                setTargetRoutineId("");
                                setRequesterRoutineId(String(session.id));
                                setSwapDate(format(new Date(), "yyyy-MM-dd"));
                                setSwapReason("");
                                setIsCalendarOpen(false);
                                setIsSwapModalOpen(true);
                              } else {
                                let targetTeacherIdVal = "";

                                if (session.teacherNumericId) {
                                  targetTeacherIdVal = String(session.teacherNumericId);
                                } else {
                                  const normalizeStr = (str: string) =>
                                    str ? str.toLowerCase().replace(/[\s-_]/g, "") : "";

                                  const targetTeacherObj = teachersList.find((t) => {
                                    const usernameNorm = normalizeStr(t.username);
                                    const nameNorm = normalizeStr(t.name);
                                    const sessionTeacherNorm = normalizeStr(session.teacher);

                                    if (
                                      usernameNorm === sessionTeacherNorm ||
                                      nameNorm === sessionTeacherNorm
                                    ) {
                                      return true;
                                    }

                                    const tInitials = getTeacherInitials(
                                      t.name || t.username
                                    ).toLowerCase();
                                    const sInitials = getTeacherInitials(
                                      session.teacher
                                    ).toLowerCase();
                                    return tInitials === sInitials;
                                  });
                                  targetTeacherIdVal = targetTeacherObj ? String(targetTeacherObj.id) : "";
                                }

                                setSelectedRowForSwap(session);
                                setSwapType("MUTUAL");
                                setTargetTeacherId(targetTeacherIdVal);
                                setTargetRoutineId(String(session.id));
                                setRequesterRoutineId("");
                                setSwapDate(format(new Date(), "yyyy-MM-dd"));
                                setSwapReason("");
                                setIsCalendarOpen(false);
                                setIsSwapModalOpen(true);
                              }
                            }
                          }
                        }}
                        className={cn(
                          "p-2.5 h-px align-middle border-r border-border/60 transition-colors duration-200 !print:border-r !print:border-black print:p-0.5",
                          isClassOffToday ||
                            (role === "teacher" && session && teacherSemesters.has(activeSemesterId))
                            ? "cursor-pointer hover:border-indigo-400 hover:bg-muted/10"
                            : "cursor-default",
                          highlighted
                            ? "bg-emerald-100/50 dark:bg-emerald-950/20 print:bg-transparent"
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
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-1 py-0.2 rounded border border-violet-200/50 dark:border-violet-800/40">
                                    Lab
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-1 py-0.2 rounded border border-teal-200/50 dark:border-teal-800/40">
                                    Theory
                                  </span>
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
                              </div>
                            </div>
                            <div className="hidden print:flex flex-col items-center justify-center text-center text-black h-full w-full leading-tight py-1">
                              <span className="font-bold text-[11px]">
                                {session.course}, T-{getTeacherInitials(session.teacher)}
                              </span>
                              <span className="font-bold text-[11px]">{session.room}</span>
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
        )}
      </Table>
    );
  };

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

  if (!isAllowed) {
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
            This page is exclusively for teachers and admins. It seems you do not
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
            ? "There is no schedule data available for this department yet."
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
            width: 100% !important;
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
              page-break-after: always !important;
              break-after: page !important;
              box-sizing: border-box !important;
              padding: 0 !important;
            }
            .print-page-container:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
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
            font-size: 7.5px !important;
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
                Routine for {auth.department_name || "Department"}
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
              <div className="flex items-center gap-2 px-2 min-w-[200px] w-full sm:w-auto">
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-[150px]">
                  {role === "student" ? (
                    <span className="text-sm font-semibold text-foreground px-1">
                      {currentRoutine?.label || activeSemesterId}
                    </span>
                  ) : (
                    <CustomSelect
                      value={activeSemesterId}
                      onChange={setSelectedSemester}
                      options={semesterOptions.map((opt) => ({
                        value: opt.id,
                        label: opt.hasClasses ? (
                          <span className="flex items-center gap-2">
                            <span>{opt.label}</span>
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                              my
                            </span>
                          </span>
                        ) : (
                          opt.label
                        ),
                      }))}
                      placeholder="Select Semester"
                    />
                  )}
                </div>
              </div>

              <div className="flex font-lexend items-center justify-between px-4 py-2 bg-muted/30 rounded-lg min-w-[140px] w-full sm:w-auto">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Credits
                </span>
                <span className="ml-2 text-primary font-bold">
                  {activeSemesterId === "all"
                    ? Object.values(formattedRoutineData).reduce((sum, r) => sum + r.credits, 0)
                    : (currentRoutine?.credits > 0 ? currentRoutine.credits : "N/A")}
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
          </div>          {activeSemesterId === "all" ? (
            <>
              {/* Screen view: single table */}
              <div className="w-full print:hidden">
                <motion.div
                  id="print-container-wrapper"
                  variants={itemVariants}
                  className="rounded-xl font-lexend bg-card/50 shadow-sm overflow-hidden w-full grid grid-cols-1 print:rounded-none print:shadow-none print:bg-transparent print:overflow-visible"
                >
                  <div className="overflow-x-auto w-full print:overflow-visible">
                    {renderTable(allSemestersSchedule, false, true)}
                  </div>
                </motion.div>
              </div>

              {/* Print view: split tables */}
              <div className="hidden print:block print:w-full print:gap-0">
                {pageGroups.map((groupSchedule, groupIdx) => (
                  <div key={groupIdx} className="print-page-container w-full">
                    {groupIdx === 0 && (
                      <div className="hidden print:flex flex-col print:mt-0 bg-white items-center justify-center mb-3 pt-0 text-center w-full font-serif text-black">
                        <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
                          Department of {auth.department_name || "Department"}
                        </h1>
                        <div className="border-2 border-black! border-double px-8 py-0.5 mb-2 print-header-border">
                          <h2 className="text-base font-bold uppercase text-black tracking-wide">
                            Class Routine
                          </h2>
                        </div>
                        <div className="w-full flex border! border-black! font-bold text-xs mt-3 print-header-table">
                          <div className="bg-gray-200 border-r! border-black! px-6 py-1">
                            Semester
                          </div>
                          <div className="flex-1 text-center py-1 border-r! border-black!">
                            All Semesters
                          </div>
                          <div className="bg-gray-200 border-r! border-black! px-6 py-1">
                            Total Credit
                          </div>
                          <div className="px-10 py-1 text-center">
                            {Object.values(formattedRoutineData).reduce((sum, r) => sum + r.credits, 0)}
                          </div>
                        </div>
                      </div>
                    )}
                    <motion.div
                      id="print-container-wrapper"
                      variants={itemVariants}
                      className="rounded-xl font-lexend bg-card/50 shadow-sm overflow-hidden w-full grid grid-cols-1 print:rounded-none print:shadow-none print:bg-transparent print:overflow-visible"
                    >
                      <div className="overflow-x-auto w-full print:overflow-visible">
                        {renderTable(groupSchedule, true, true)}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="print-page-container w-full">
              <div className="hidden print:flex flex-col print:mt-0 bg-white items-center justify-center mb-3 pt-0 text-center w-full font-serif text-black">
                <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
                  Department of {auth.department_name || "Department"}
                </h1>
                <div className="border-2 border-black! border-double px-8 py-0.5 mb-2 print-header-border">
                  <h2 className="text-base font-bold uppercase text-black tracking-wide">
                    Class Routine
                  </h2>
                </div>
                <div className="w-full flex border! border-black! font-bold text-xs mt-3 print-header-table">
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
                  {renderTable(currentRoutine.schedule, false, false)}
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

      {/* Swap Request Modal */}
      <Dialog open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen}>
        <DialogContent
          className="sm:max-w-md w-full font-lexend"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest('[data-slot="popover-content"]') ||
              target.closest('.rdp') ||
              target.closest('[data-radix-popper-content-wrapper]')
            ) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest('[data-slot="popover-content"]') ||
              target.closest('.rdp') ||
              target.closest('[data-radix-popper-content-wrapper]')
            ) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-purple-500" />
              Request Class Swap
            </DialogTitle>
            <DialogDescription>
              {swapType === "PROXY"
                ? "Submit a temporary PROXY request to ask another teacher to take your class."
                : "Submit a temporary MUTUAL swap request with another teacher&apos;s class."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-sm">
            {/* Swap Type */}
            <div className="space-y-1">
              <Label className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                Swap Type
              </Label>
              <Input
                value={swapType === "PROXY" ? "PROXY (Teacher proxy request)" : "MUTUAL (Exchange classes)"}
                disabled
                className="h-10 bg-muted/30 cursor-not-allowed font-medium text-foreground text-xs sm:text-sm"
              />
            </div>

            {/* Your Class */}
            <div className="space-y-1">
              <Label className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                Your Class *
              </Label>
              {swapType === "PROXY" ? (
                <Input
                  value={`${selectedRowForSwap?.course} - ${selectedRowForSwap?.day} (${selectedRowForSwap?.originalTime ? formatTimeSlotLabel(selectedRowForSwap.originalTime) : ""})`}
                  disabled
                  className="h-10 bg-muted/30 cursor-not-allowed font-medium text-foreground text-xs sm:text-sm"
                />
              ) : myClassesInSemester.length === 0 ? (
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-muted-foreground text-xs bg-muted/20">
                  <span>No scheduled classes found for you in this semester.</span>
                </div>
              ) : (
                <CustomSelect
                  value={requesterRoutineId}
                  onChange={setRequesterRoutineId}
                  options={myClassesInSemester.map((item: any) => ({
                    value: String(item.id),
                    label: `${item.course_code} - ${item.day_name} (${formatTimeSlotLabel(item.start_time)} - ${formatTimeSlotLabel(item.end_time)})`,
                  }))}
                  placeholder="Select Your Class"
                  id="requesterRoutineId"
                />
              )}
            </div>

            {/* Target Teacher */}
            <div className="space-y-1">
              <Label className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                Target Teacher *
              </Label>
              {swapType === "PROXY" ? (
                otherTeachers.length === 0 ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-muted-foreground text-xs bg-muted/20">
                    <span>No other teachers found in department.</span>
                  </div>
                ) : (
                  <CustomSelect
                    value={targetTeacherId}
                    onChange={setTargetTeacherId}
                    options={otherTeachers.map((t: any) => ({
                      value: String(t.id),
                      label: t.name || t.username,
                    }))}
                    placeholder="Select Target Teacher"
                    id="targetTeacherId"
                  />
                )
              ) : (
                <Input
                  value={
                    teachersList.find((t) => String(t.id) === targetTeacherId)?.name ||
                    teachersList.find((t) => String(t.id) === targetTeacherId)?.username ||
                    selectedRowForSwap?.teacher ||
                    ""
                  }
                  disabled
                  className="h-10 bg-muted/30 cursor-not-allowed font-medium text-foreground text-xs sm:text-sm"
                />
              )}
            </div>

            {/* Swap Date - using Popover */}
            <div className="space-y-1">
              <Label htmlFor="swapDate" className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                Swap Date *
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left font-medium text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-purple-500" />
                      {swapDate ? format(new Date(swapDate), "PPP") : "Select Date"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100] pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={swapDate ? new Date(swapDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setSwapDate(format(date, "yyyy-MM-dd"));
                        setIsCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="rounded-md border bg-card"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Target Class to Swap With - Show only if MUTUAL */}
            {swapType === "MUTUAL" && (
              <div className="space-y-1 sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                  Target Class to Swap With
                </Label>
                <Input
                  value={`${selectedRowForSwap?.course} - ${selectedRowForSwap?.day} (${selectedRowForSwap?.originalTime ? formatTimeSlotLabel(selectedRowForSwap.originalTime) : ""})`}
                  disabled
                  className="h-10 bg-muted/30 cursor-not-allowed font-medium text-foreground text-xs sm:text-sm"
                />
              </div>
            )}

            {/* Reason Textarea - Span full width */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="swapReason" className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                Reason
              </Label>
              <Textarea
                id="swapReason"
                placeholder="e.g. Medical Emergency, Official Meeting..."
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="h-14 py-1.5 resize-none text-xs sm:text-sm min-h-[56px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsSwapModalOpen(false)}
              disabled={isSubmittingSwap}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendSwapRequest}
              disabled={isSubmittingSwap}
              className="bg-purple-600 hover:bg-purple-500 text-white min-w-[120px] h-10 gap-1.5 font-semibold"
            >
              {isSubmittingSwap && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
