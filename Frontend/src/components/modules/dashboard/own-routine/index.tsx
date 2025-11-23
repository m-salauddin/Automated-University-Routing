"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconGripVertical } from "@tabler/icons-react";
import {
  Printer,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  X,
  Calendar,
  BookOpen,
  SlidersHorizontal,
  LayoutList,
  Filter,
  MapPin,
  GraduationCap,
  PowerOff,
  FolderOpen,
  CheckCheck,
  ShieldBan,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { markOff, markOn, generateClassKey } from "@/store/classOffSlice";
import type { RootState } from "@/store";
import DataLoader from "@/components/ui/data-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

type TeacherInfo = {
  id: string;
  initials: string;
  name: string;
  total_sessions: number;
  semesters_involved: string[];
};

type RoutineRowState = {
  id: number;
  day: string;
  time: string;
  startTimeRaw: string;
  course: string;
  fullCourseName: string;
  type: string;
  room: string;
  semester: string;
  teacherId: string;
};

interface OwnRoutinePageProps {
  routineList: APIRoutineItem[];
}

// --- HELPERS ---
const formatTime12Hour = (timeStr: string) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minutes} ${suffix}`;
};

const formatTimeRange = (start: string, end: string) => {
  return `${formatTime12Hour(start)} - ${formatTime12Hour(end)}`;
};

const abbreviateDay = (day: string) => {
  return day.substring(0, 3);
};

const days = ["All", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EMPTY_OBJ = {};

// --- ANIMATIONS ---
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

const modalContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const modalItemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { stiffness: 300, damping: 24 },
  },
};

// --- ISOLATED COMPONENT: CANCELLATION MODAL ---
interface CancellationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string | undefined;
  onConfirm: (reason: string) => void;
}

function CancellationModal({
  isOpen,
  onOpenChange,
  courseName,
  onConfirm,
}: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const LIMIT = 100;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason(""); // Clear text on close
    }
    onOpenChange(open);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= LIMIT) {
      setReason(text);
    }
  };

  const handleCloseClick = () => {
    setReason("");
    onOpenChange(false);
  };

  const handleConfirmClick = () => {
    onConfirm(reason);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              variants={modalContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              <motion.div variants={modalItemVariants}>
                <DialogHeader>
                  <DialogTitle>Cancel Class</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for cancelling{" "}
                    <strong>{courseName}</strong>. This will be visible to
                    students.
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

              <motion.div variants={modalItemVariants} className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="reason"
                    className="flex justify-between text-xs font-medium"
                  >
                    <span>Reason</span>
                    <span
                      className={cn(
                        "text-muted-foreground",
                        reason.length === LIMIT && "text-red-500"
                      )}
                    >
                      {reason.length}/{LIMIT} characters
                    </span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Sick leave, Emergency meeting..."
                    value={reason}
                    onChange={handleTextChange}
                    className="h-32 resize-none break-all whitespace-pre-wrap"
                  />
                </div>
              </motion.div>

              <motion.div variants={modalItemVariants}>
                <DialogFooter className="sm:justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseClick}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmClick}
                    disabled={!reason.trim()}
                  >
                    Confirm Cancellation
                  </Button>
                </DialogFooter>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// --- ISOLATED COMPONENT: DRAG HANDLE ---
function DragHandle({
  attributes,
  listeners,
}: {
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: Record<string, unknown>;
}) {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
    >
      <IconGripVertical className="size-4" />
    </button>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function OwnRoutinePage({ routineList }: OwnRoutinePageProps) {
  const dispatch = useDispatch();
  const {
    role,
    username,
    department_name,
    isLoading: isAuthLoading,
  } = useSelector((s: RootState) => s.auth);

  const availabilityMap = useSelector(
    (s: RootState) => s.teacherAvailability?.map || EMPTY_OBJ
  );
  const classOffMap = useSelector(
    (s: RootState) => s.classOff.offMap || EMPTY_OBJ
  );

  // State
  const [rows, setRows] = useState<RoutineRowState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);

  // Filters
  const [day, setDay] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [roomFilter, setRoomFilter] = useState<string>("All");
  const [semesterFilter, setSemesterFilter] = useState<string>("All");

  // Modal State
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [pendingCancellation, setPendingCancellation] = useState<{
    id: number;
    teacherId: string;
    startTimeRaw: string;
    courseName: string;
  } | null>(null);

  const [visibleCols, setVisibleCols] = useState<
    Record<
      | keyof Omit<
          RoutineRowState,
          "id" | "teacherId" | "fullCourseName" | "startTimeRaw"
        >
      | "status",
      boolean
    >
  >({
    day: true,
    time: true,
    course: true,
    type: true,
    status: true,
    room: true,
    semester: true,
  });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {})
  );

  // --- Effect: Process Data ---
  useEffect(() => {
    if (!routineList) {
      setIsLoading(false);
      return;
    }

    try {
      const uniqueSemesters = Array.from(
        new Set(routineList.map((item) => item.semester_name))
      ).sort();

      const firstItem = routineList[0];
      if (firstItem) {
        const initials =
          firstItem.teacher_name
            .match(/([A-Z])/g)
            ?.slice(0, 2)
            .join("") || "TCH";

        setTeacherInfo({
          id: firstItem.teacher_name,
          name: firstItem.teacher_name,
          initials: initials,
          total_sessions: routineList.length,
          semesters_involved: uniqueSemesters,
        });
      }

      const mappedRows: RoutineRowState[] = routineList.map((item) => {
        const isLab =
          item.course_code.endsWith("L") ||
          item.course_name.toLowerCase().includes("lab");

        return {
          id: item.id,
          day: abbreviateDay(item.day),
          time: formatTimeRange(item.start_time, item.end_time),
          startTimeRaw: item.start_time,
          course: item.course_code,
          fullCourseName: item.course_name,
          type: isLab ? "Lab" : "Theory",
          room: item.room_number,
          semester: item.semester_name,
          teacherId: item.teacher_name,
        };
      });

      setRows(mappedRows);
    } catch (error) {
      console.error("Error processing routine data:", error);
      toast.error("Failed to process routine data.");
    } finally {
      setIsLoading(false);
    }
  }, [routineList]);

  // --- Computations ---
  const uniqueRooms = useMemo(() => {
    const rooms = new Set(rows.map((r) => r.room));
    return Array.from(rooms).sort();
  }, [rows]);

  const uniqueSemesters = useMemo(() => {
    const sems = new Set(rows.map((r) => r.semester));
    return Array.from(sems).sort();
  }, [rows]);

  const processedRows = useMemo(() => {
    return rows.filter((r) => {
      const key = generateClassKey(r.teacherId, r.startTimeRaw);
      const offRecord = classOffMap[key];
      const isOffSlot = Boolean(offRecord?.status);
      const isTeacherOff = availabilityMap[r.teacherId] === false;
      const currentStatus = isOffSlot || isTeacherOff ? "off" : "on";

      const matchDay = day === "All" || r.day === day;
      const matchType = typeFilter === "All" || r.type === typeFilter;
      const matchStatus =
        statusFilter === "All" || currentStatus === statusFilter;
      const matchRoom = roomFilter === "All" || r.room === roomFilter;
      const matchSemester =
        semesterFilter === "All" || r.semester === semesterFilter;

      return matchDay && matchType && matchStatus && matchRoom && matchSemester;
    });
  }, [
    rows,
    day,
    typeFilter,
    statusFilter,
    roomFilter,
    semesterFilter,
    classOffMap,
    availabilityMap,
  ]);

  const pageSizeOptions = [5, 10, 20, 50] as const;
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showAllForPrint, setShowAllForPrint] = useState<boolean>(false);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const paged = showAllForPrint
    ? processedRows
    : processedRows.slice(
        (page - 1) * pageSize,
        Math.min((page - 1) * pageSize + pageSize, processedRows.length)
      );

  useEffect(() => {
    const nextTotal = Math.max(1, Math.ceil(processedRows.length / pageSize));
    if (page > nextTotal) setPage(nextTotal);
    if (page < 1) setPage(1);
  }, [processedRows.length, pageSize, page]);

  useEffect(() => {
    setPage(1);
  }, [day, typeFilter, statusFilter, roomFilter, semesterFilter]);

  useEffect(() => {
    const before = () => setShowAllForPrint(true);
    const after = () => setShowAllForPrint(false);
    if (typeof window !== "undefined") {
      window.addEventListener("beforeprint", before);
      window.addEventListener("afterprint", after);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeprint", before);
        window.removeEventListener("afterprint", after);
      }
    };
  }, []);

  const handleColumnToggle = (key: string) => {
    setVisibleCols((prev) => ({
      ...prev,
      [key as keyof typeof visibleCols]: !prev[key as keyof typeof visibleCols],
    }));
  };

  const resetFilters = () => {
    setDay("All");
    setTypeFilter("All");
    setStatusFilter("All");
    setRoomFilter("All");
    setSemesterFilter("All");
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    setRows((prev) => {
      const oldIndex = prev.findIndex((r) => r.id === active.id);
      const newIndex = prev.findIndex((r) => r.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const columnsOrder: (
    | keyof Omit<
        RoutineRowState,
        "id" | "teacherId" | "fullCourseName" | "startTimeRaw"
      >
    | "status"
  )[] = ["day", "time", "course", "type", "status", "room", "semester"];

  // --- Handlers ---
  const submitCancellation = (reason: string) => {
    if (!pendingCancellation) return;

    dispatch(
      markOff({
        teacherId: pendingCancellation.teacherId,
        startTime: pendingCancellation.startTimeRaw,
        reason: reason,
      })
    );

    toast.warning(`${pendingCancellation.courseName} marked as OFF`);
    setIsReasonModalOpen(false);
    setPendingCancellation(null);
  };

  // --- Filter Components ---
  const DaySelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Day
      </span>
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger className="w-full h-9 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  const TypeSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <BookOpen className="w-3 h-3" /> Type
      </span>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full h-9 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Types</SelectItem>
          <SelectItem value="Theory">Theory</SelectItem>
          <SelectItem value="Lab">Lab</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
  const StatusSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <SlidersHorizontal className="w-3 h-3" /> Status
      </span>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full h-9 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Status</SelectItem>
          <SelectItem value="on">Active (On)</SelectItem>
          <SelectItem value="off">Cancelled (Off)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
  const RoomSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <MapPin className="w-3 h-3" /> Room
      </span>
      <Select value={roomFilter} onValueChange={setRoomFilter}>
        <SelectTrigger className="w-full h-9 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Rooms</SelectItem>
          {uniqueRooms.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  const SemesterSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <GraduationCap className="w-3 h-3" /> Semester
      </span>
      <Select value={semesterFilter} onValueChange={setSemesterFilter}>
        <SelectTrigger className="w-full h-9 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Semesters</SelectItem>
          {uniqueSemesters.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  const ColumnSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <LayoutList className="w-3 h-3" /> Columns
      </span>
      <Select value="" onValueChange={handleColumnToggle}>
        <SelectTrigger className="w-full h-9 bg-background text-muted-foreground">
          <SelectValue placeholder="Customize View" />
        </SelectTrigger>
        <SelectContent align="end">
          {columnsOrder.map((key) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    visibleCols[key]
                      ? "bg-primary border-primary"
                      : "opacity-40"
                  )}
                >
                  <Check
                    className={cn(
                      "h-3 w-3 text-primary-foreground",
                      !visibleCols[key] && "hidden"
                    )}
                  />
                </div>
                <span className="capitalize">{key}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // --- Row Component ---
  function DraggableRow({ row }: { row: RoutineRowState }) {
    const {
      setNodeRef,
      attributes,
      listeners,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: row.id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      position: "relative",
      zIndex: isDragging ? 50 : "auto",
    };

    const key = generateClassKey(row.teacherId, row.startTimeRaw);
    const offRecord = classOffMap[key];
    const isOffSlot = Boolean(offRecord?.status);
    const isTeacherOff = availabilityMap[row.teacherId] === false;
    const currentStatus = isOffSlot || isTeacherOff ? "off" : "on";

    const handleStatusChange = () => {
      if (currentStatus === "on") {
        setPendingCancellation({
          id: row.id,
          teacherId: row.teacherId,
          startTimeRaw: row.startTimeRaw,
          courseName: row.course,
        });
        setIsReasonModalOpen(true);
      } else {
        dispatch(
          markOn({ teacherId: row.teacherId, startTime: row.startTimeRaw })
        );
        toast.success(`${row.course} is now ON`);
      }
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        className={cn(
          "whitespace-nowrap transition-colors",
          isDragging &&
            "opacity-70 bg-muted/50 shadow-lg ring-1 ring-primary/10"
        )}
        data-teacher-id={row.teacherId}
      >
        <TableCell className="w-8 print:hidden p-3">
          <DragHandle attributes={attributes} listeners={listeners ?? {}} />
        </TableCell>
        {columnsOrder.map((key) =>
          visibleCols[key] ? (
            <TableCell
              key={key}
              className={cn("p-3", key === "course" && "font-medium")}
            >
              {key === "course" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer border-dotted border-muted-foreground/50 flex items-center gap-1.5 w-fit">
                        {row.course}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{row.fullCourseName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : key === "type" ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-md px-2.5 py-0.5 font-medium border shadow-sm",
                    row.type === "Lab"
                      ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20"
                      : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20"
                  )}
                >
                  {row.type}
                </Badge>
              ) : key === "status" ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-md px-2.5 py-0.5 font-medium border shadow-sm flex w-fit items-center gap-1.5",
                    currentStatus === "on"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      currentStatus === "on"
                        ? "bg-emerald-500"
                        : "bg-rose-500 animate-pulse"
                    )}
                  />
                  {currentStatus === "on" ? "Active" : "Cancelled"}
                </Badge>
              ) : (
                (row)[key]
              )}
            </TableCell>
          ) : null
        )}
        <TableCell className="w-8 text-right print:hidden p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={cn(
                  currentStatus === "on"
                    ? "text-red-500 focus:text-red-500"
                    : "text-emerald-500 focus:text-emerald-500"
                )}
                onClick={handleStatusChange}
              >
                {currentStatus === "on" ? (
                  <>
                    <PowerOff className="size-4 mr-2 text-red-500" /> Mark as
                    Off
                  </>
                ) : (
                  <>
                    <CheckCheck className="size-4 mr-2 text-emerald-500" /> Mark
                    as On
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }

  // --- AUTH LOADING STATE ---
  if (isAuthLoading || isLoading) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-background">
        <DataLoader />
      </div>
    );
  }

  // --- ROLE CHECK & BEAUTIFUL ERROR UI ---
  if (role !== "teacher") {
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
            This page is exclusively for faculty members. It seems you do not
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

  if (!teacherInfo && rows.length === 0)
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center text-muted-foreground">
        <p>No routine data available.</p>
      </div>
    );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full font-lexend max-w-full overflow-x-hidden mx-auto p-5 space-y-4 print:overflow-visible"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden mb-8">
        <div className="space-y-2">
          <motion.div variants={itemVariants}>
            <Badge
              variant="outline"
              className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
            >
              Teacher Portal
            </Badge>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          >
            Department of {department_name || "N/A"}
          </motion.h1>
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-3"
          >
            <p className="text-muted-foreground font-medium ">
              Class Routine <span className="text-foreground/40 mx-1">•</span>{" "}
              <span className="text-foreground font-semibold">
                {teacherInfo ? teacherInfo.name : username}
              </span>
            </p>
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
                    Customize your routine table view.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6 px-4">
                  <DaySelect />
                  <TypeSelect />
                  <StatusSelect />
                  <RoomSelect />
                  <SemesterSelect />
                  <div className="my-2 border-t" />
                  <ColumnSelect />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="w-full"
                    >
                      Reset All
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="w-full mt-2 sm:mt-0">Done</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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

      <div className="hidden print:flex flex-col items-center justify-center mb-6 pt-2 text-center w-full font-serif text-black">
        <h1 className="text-2xl font-bold text-black mb-3 font-lexend tracking-tight">
          Department of Computer Science & Engineering
        </h1>
        <div className="px-8 py-1">
          <h2 className="font-lexend text-black tracking-wide">
            {teacherInfo ? teacherInfo.name : username}&apos;s Class Routine
          </h2>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="w-full overflow-hidden dark:bg-[#111113] border shadow-sm print:border-none print:shadow-none print:overflow-visible">
          <CardHeader className="p-4 min-[1300px]:block bg-muted/30 border-b hidden print:hidden">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-end">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full xl:w-auto flex-1">
                  <DaySelect />
                  <TypeSelect />
                  <StatusSelect />
                  <RoomSelect />
                  <SemesterSelect />
                </div>
                <div className="flex gap-3 items-end shrink-0 w-full xl:w-auto justify-end xl:justify-start">
                  <div className="min-w-[150px]">
                    <ColumnSelect />
                  </div>
                  {(day !== "All" ||
                    typeFilter !== "All" ||
                    statusFilter !== "All" ||
                    roomFilter !== "All" ||
                    semesterFilter !== "All") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="h-9 gap-2"
                    >
                      <X className="h-3.5 w-3.5" /> Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 print:block">
              <div className="w-full overflow-x-auto print:overflow-visible">
                <div className="min-w-[800px] print:min-w-0 print:w-full">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-10 print:hidden"></TableHead>
                          {columnsOrder.map((key) =>
                            visibleCols[key] ? (
                              <TableHead
                                key={key}
                                className="capitalize select-none h-10"
                              >
                                <span className="flex items-center gap-1">
                                  {key}
                                </span>
                              </TableHead>
                            ) : null
                          )}
                          <TableHead className="w-12 print:hidden text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedRows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              className="h-64 text-center"
                            >
                              <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                                <div className="h-12 w-12 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                                  <FolderOpen className="h-6 w-6 opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-1">
                                  No courses found
                                </h3>
                                <p className="text-sm opacity-60 max-w-xs mx-auto mb-4">
                                  We couldn&apos;t find any courses matching
                                  your current filters.
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
                        ) : (
                          <SortableContext
                            items={paged.map((r) => r.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {paged.map((row) => (
                              <DraggableRow key={row.id} row={row} />
                            ))}
                          </SortableContext>
                        )}
                      </TableBody>
                    </Table>
                  </DndContext>
                </div>
              </div>
            </div>
            {processedRows.length > 0 && !showAllForPrint && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-background/50 print:hidden">
                <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 text-sm text-muted-foreground">
                  <span>Rows:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map((opt) => (
                        <SelectItem key={opt} value={String(opt)}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm font-medium order-3 sm:order-2">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-1 order-2 sm:order-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Button
        variant="outline"
        onClick={() => window.print()}
        className="w-full lg:hidden print:hidden gap-2 mt-4"
      >
        <Printer className="h-4 w-4" /> Print Schedule
      </Button>

      {/* --- ISOLATED MODAL COMPONENT --- */}
      <CancellationModal
        isOpen={isReasonModalOpen}
        onOpenChange={setIsReasonModalOpen}
        courseName={pendingCancellation?.courseName}
        onConfirm={submitCancellation}
      />
    </motion.div>
  );
}
