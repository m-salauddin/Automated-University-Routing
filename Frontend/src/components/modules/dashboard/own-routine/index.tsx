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
  ArrowUpDown,
  Loader2,
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
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { cancelClass, requestSwap, respondSwap } from "@/services/routine";
import { getAllUsers } from "@/services/users";

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
  is_cancelled?: boolean;
  cancel_message?: string | null;
  is_temporary_proxy?: boolean;
  is_temporary_mutual?: boolean;
  date?: string;
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
  department: string; 
  teacherId: string;
  is_cancelled: boolean;
  cancel_message: string | null;
  is_temporary_proxy?: boolean;
  is_temporary_mutual?: boolean;
  date?: string;
};

interface OwnRoutinePageProps {
  routineList: APIRoutineItem[];
}


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
      setReason(""); 
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

  
  const [rows, setRows] = useState<RoutineRowState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);

  
  const [day, setDay] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [roomFilter, setRoomFilter] = useState<string>("All");
  const [semesterFilter, setSemesterFilter] = useState<string>("All");

  
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

  
  const [pendingCancellation, setPendingCancellation] = useState<{
    id: number;
    teacherId: string;
    startTimeRaw: string;
    courseName: string;
    department: string;
    semester: string;
    day: string;
  } | null>(null);

  const [visibleCols, setVisibleCols] = useState<
    Record<string, boolean>
  >({
    day: true,
    time: true,
    course: true,
    type: true,
    status: true,
    room: true,
    semester: true,
  });

  // Swap Request States
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedRowForSwap, setSelectedRowForSwap] = useState<RoutineRowState | null>(null);
  const [swapType, setSwapType] = useState<"PROXY" | "MUTUAL">("PROXY");
  const [targetTeacherId, setTargetTeacherId] = useState<string>("");
  const [targetRoutineId, setTargetRoutineId] = useState<string>("");
  const [swapDate, setSwapDate] = useState<string>("");
  const [swapReason, setSwapReason] = useState<string>("");
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);
  const [teachersList, setTeachersList] = useState<any[]>([]);

  // Respond to Swap States
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [respondRequestId, setRespondRequestId] = useState<string>("");
  const [respondAction, setRespondAction] = useState<"ACCEPT" | "REJECT">("ACCEPT");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await getAllUsers();
        if (res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter((u: any) => u.role?.toUpperCase() === "TEACHER");
          setTeachersList(filtered);
        }
      } catch (err) {
        console.error("Failed to load teachers for swap:", err);
      }
    };
    fetchTeachers();
  }, []);

  const openSwapRequestModal = (row: RoutineRowState) => {
    setSelectedRowForSwap(row);
    setSwapType("PROXY");
    setTargetTeacherId("");
    setTargetRoutineId("");
    setSwapDate(new Date().toISOString().split("T")[0]);
    setSwapReason("");
    setIsSwapModalOpen(true);
  };

  const handleSendSwapRequest = async () => {
    if (!selectedRowForSwap || !targetTeacherId || !swapDate) {
      toast.error("Teacher and Swap Date are required");
      return;
    }
    if (swapType === "MUTUAL" && !targetRoutineId.trim()) {
      toast.error("Target Routine ID is required for MUTUAL swaps");
      return;
    }

    setIsSubmittingSwap(true);
    try {
      const res = await requestSwap({
        swap_type: swapType,
        target_teacher_id: parseInt(targetTeacherId),
        requester_routine_id: selectedRowForSwap.id,
        target_routine_id: swapType === "MUTUAL" ? parseInt(targetRoutineId) : null,
        swap_date: swapDate,
        reason: swapReason,
      });

      if (res.success) {
        toast.success("Swap request sent successfully!");
        setIsSwapModalOpen(false);
      } else {
        toast.error(res.message || "Failed to submit swap request");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  const handleRespondToSwap = async () => {
    if (!respondRequestId.trim()) {
      toast.error("Request ID is required");
      return;
    }

    setIsSubmittingResponse(true);
    try {
      const res = await respondSwap({
        request_id: parseInt(respondRequestId),
        action: respondAction,
      });

      if (res.success) {
        toast.success(`Swap request ${respondAction.toLowerCase()}ed successfully!`);
        setIsRespondDialogOpen(false);
        setRespondRequestId("");
        window.location.reload();
      } else {
        toast.error(res.message || "Failed to respond to swap request");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {})
  );

  
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
          day: abbreviateDay(item.day_name),
          time: formatTimeRange(item.start_time, item.end_time),
          startTimeRaw: item.start_time,
          course: item.course_code,
          fullCourseName: item.course_name,
          type: isLab ? "Lab" : "Theory",
          room: item.room_number,
          semester: item.semester_name,
          department: item.department_name,
          teacherId: item.teacher_name,
          is_cancelled: Boolean(item.is_cancelled),
          cancel_message: item.cancel_message || null,
          is_temporary_proxy: Boolean(item.is_temporary_proxy),
          is_temporary_mutual: Boolean(item.is_temporary_mutual),
          date: item.date || "",
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
      const currentStatus = r.is_cancelled ? "off" : "on";

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
        "id" | "teacherId" | "fullCourseName" | "startTimeRaw" | "department"
      >
    | "status"
  )[] = ["day", "time", "course", "type", "status", "room", "semester"];

  
  const submitCancellation = async (reason: string) => {
    if (!pendingCancellation) return;

    try {
      const res = await cancelClass(pendingCancellation.id, reason);
      if (res.success) {
        toast.warning(`${pendingCancellation.courseName} class has been cancelled`);
        setRows((prev) =>
          prev.map((r) =>
            r.id === pendingCancellation.id
              ? { ...r, is_cancelled: true, cancel_message: reason }
              : r
          )
        );
      } else {
        toast.error(res.message || "Failed to cancel class");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while cancelling class");
    } finally {
      setIsReasonModalOpen(false);
      setPendingCancellation(null);
    }
  };

  
  
  const DaySelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Day
      </span>
      <CustomSelect
        value={day}
        onChange={setDay}
        options={days.map((d) => ({ value: d, label: d }))}
        placeholder="Select Day"
      />
    </div>
  );
  const TypeSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <BookOpen className="w-3 h-3" /> Type
      </span>
      <CustomSelect
        value={typeFilter}
        onChange={setTypeFilter}
        options={[
          { value: "All", label: "All Types" },
          { value: "Theory", label: "Theory" },
          { value: "Lab", label: "Lab" },
        ]}
        placeholder="All Types"
      />
    </div>
  );
  const StatusSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <SlidersHorizontal className="w-3 h-3" /> Status
      </span>
      <CustomSelect
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: "All", label: "All Status" },
          { value: "on", label: "Active (On)" },
          { value: "off", label: "Cancelled (Off)" },
        ]}
        placeholder="All Status"
      />
    </div>
  );
  const RoomSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <MapPin className="w-3 h-3" /> Room
      </span>
      <CustomSelect
        value={roomFilter}
        onChange={setRoomFilter}
        options={[
          { value: "All", label: "All Rooms" },
          ...uniqueRooms.map((r) => ({ value: r, label: r })),
        ]}
        placeholder="All Rooms"
      />
    </div>
  );
  const SemesterSelect = () => (
    <div className="space-y-1 w-full">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
        <GraduationCap className="w-3 h-3" /> Semester
      </span>
      <CustomSelect
        value={semesterFilter}
        onChange={setSemesterFilter}
        options={[
          { value: "All", label: "All Semesters" },
          ...uniqueSemesters.map((s) => ({ value: s, label: s })),
        ]}
        placeholder="All Semesters"
      />
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

    const key = generateClassKey(
      row.department,
      row.semester,
      row.day,
      row.teacherId,
      row.startTimeRaw
    );
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
          department: row.department,
          semester: row.semester,
          day: row.day,
        });
        setIsReasonModalOpen(true);
      } else {
        dispatch(
          markOn({
            department: row.department,
            semester: row.semester,
            day: row.day,
            teacherId: row.teacherId,
            startTime: row.startTimeRaw,
          })
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
                      ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20"
                      : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20"
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
                row[key]
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {currentStatus === "on" ? (
                <>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={handleStatusChange}
                  >
                    <PowerOff className="size-4 mr-2 text-red-500" /> Cancel Class
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => openSwapRequestModal(row)}
                  >
                    <ArrowUpDown className="size-4 mr-2" /> Request Class Swap
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  className="opacity-50 cursor-not-allowed"
                  disabled
                >
                  <PowerOff className="size-4 mr-2" /> Class Cancelled
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }

  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  
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
      <motion.div variants={itemVariants} className="flex gap-2">
        <Button
          onClick={() => {
            setRespondRequestId("");
            setRespondAction("ACCEPT");
            setIsRespondDialogOpen(true);
          }}
          variant="outline"
          className="gap-2 border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground print:hidden h-10"
        >
          <ArrowUpDown className="h-4 w-4 text-purple-500" /> Respond to Swap
        </Button>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hidden md:flex h-10"
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

      {}
      <CancellationModal
        isOpen={isReasonModalOpen}
        onOpenChange={setIsReasonModalOpen}
        courseName={pendingCancellation?.courseName}
        onConfirm={submitCancellation}
      />

      {/* Swap Request Modal */}
      <Dialog open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-purple-500" />
              Request Class Swap
            </DialogTitle>
            <DialogDescription>
              Submit a temporary PROXY or MUTUAL swap request for{" "}
              <strong>{selectedRowForSwap?.course}</strong> (Day: {selectedRowForSwap?.day}, Time: {selectedRowForSwap?.time}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="swapType" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Swap Type *
              </Label>
              <CustomSelect
                value={swapType}
                onChange={(val) => setSwapType(val as "PROXY" | "MUTUAL")}
                options={[
                  { value: "PROXY", label: "PROXY (Another teacher takes your class)" },
                  { value: "MUTUAL", label: "MUTUAL (Exchange classes with another teacher)" },
                ]}
                placeholder="Select Swap Type"
                id="swapType"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="targetTeacher" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Target Teacher *
              </Label>
              <CustomSelect
                value={targetTeacherId}
                onChange={setTargetTeacherId}
                options={teachersList.map((t) => ({ value: String(t.id), label: t.name || t.username }))}
                placeholder="Select Teacher"
                id="targetTeacher"
              />
            </div>

            {swapType === "MUTUAL" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label htmlFor="targetRoutineId" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Target Routine Entry ID *
                </Label>
                <Input
                  id="targetRoutineId"
                  type="number"
                  placeholder="e.g. 1207"
                  value={targetRoutineId}
                  onChange={(e) => setTargetRoutineId(e.target.value)}
                  className="h-10"
                />
                <p className="text-[10px] text-muted-foreground">
                  Provide the ID of the routine slot you wish to exchange with (can be queried from the target teacher).
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="swapDate" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Swap Date *
              </Label>
              <Input
                id="swapDate"
                type="date"
                value={swapDate}
                onChange={(e) => setSwapDate(e.target.value)}
                className="h-10 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="swapReason" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Reason
              </Label>
              <Textarea
                id="swapReason"
                placeholder="e.g. Medical Emergency, Official Meeting..."
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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

      {/* Respond to Swap Dialog */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-blue-500" />
              Respond to Swap Request
            </DialogTitle>
            <DialogDescription>
              Accept or Reject a pending temporary class swap request received from another faculty member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="respondRequestId" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Swap Request ID *
              </Label>
              <Input
                id="respondRequestId"
                type="number"
                placeholder="Enter Swap Request ID (e.g. 1)"
                value={respondRequestId}
                onChange={(e) => setRespondRequestId(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="respondAction" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Action *
              </Label>
              <CustomSelect
                value={respondAction}
                onChange={(val) => setRespondAction(val as "ACCEPT" | "REJECT")}
                options={[
                  { value: "ACCEPT", label: "ACCEPT (Approve the class swap)" },
                  { value: "REJECT", label: "REJECT (Decline the class swap)" },
                ]}
                placeholder="Select Action"
                id="respondAction"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRespondDialogOpen(false)}
              disabled={isSubmittingResponse}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespondToSwap}
              disabled={isSubmittingResponse}
              className={cn(
                "min-w-[120px] h-10 gap-1.5 font-semibold text-white",
                respondAction === "ACCEPT" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
              )}
            >
              {isSubmittingResponse && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {respondAction === "ACCEPT" ? "Accept Request" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
