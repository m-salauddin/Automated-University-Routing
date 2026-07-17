/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
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
  Utensils,
  CalendarX,
  Loader2,
  ShieldBan,
  Info,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowLeftRight,
  PowerOff,
  CheckCheck,
  Pencil,
  MoreVertical,
  Undo2,
  Redo2,
  Users,
  Download,
  Upload,
  FileSpreadsheet,
  Database,
  Camera,
  FileDown,
  FileUp,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { store } from "@/store";
import {
  generateClassKey,
  normalizeTime,
  resetAll,
  markOff,
  markOn,
} from "@/store/classOffSlice";
import { setIsLocked, setRoutineList, setIsLoading } from "@/store/routineSlice";
import DataLoader from "@/components/ui/data-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { generateRoutine, getRoutine, updateRoutineEntry, swapRoutineEntries, cancelClass, reactivateClass, updateCancelMessage, rollbackRoutine } from "@/services/routine";
import { DataManagementDialog } from "./DataManagementDialog";
import { createLog } from "@/services/logs";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomSelect } from "@/components/ui/custom-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type HistoryAction =
  | {
    type: "SWAP";
    payload: { id1: number; id2: number; course1: string; course2: string };
    description: string;
  }
  | {
    type: "UPDATE";
    payload: { id: number; fromDayId: number; fromSlotId: number; toDayId: number; toSlotId: number; course: string };
    description: string;
  }
  | {
    type: "GENERATE";
    payload: { departmentId: number; semesterId?: number; ignoreWarnings?: boolean };
    description: string;
  };


interface CancellationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string | undefined;
  onConfirm: (reason: string) => void;
  title?: string;
  confirmLabel?: string;
  initialReason?: string;
}

function CancellationModal({
  isOpen,
  onOpenChange,
  courseName,
  onConfirm,
  title = "Cancel Class",
  confirmLabel = "Confirm Cancellation",
  initialReason = "",
}: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const LIMIT = 100;

  useEffect(() => {
    if (isOpen) {
      setReason(initialReason || "");
    }
  }, [isOpen, initialReason]);

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
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling{" "}
              <strong>{courseName}</strong>. This will be visible to
              students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
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
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={handleCloseClick}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmClick}
              disabled={!reason.trim()}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


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
  is_cancelled?: boolean;
  cancel_message?: string | null;
  course_type?: string;
};

export type TimeSlot = {
  id: number;
  start_time: string;
  end_time: string;
};

type ClassSession = {
  id: number;
  dayId: number;
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
  course_type?: string;
};

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const BREAK_INSERT_INDEX = 4;


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

const checkIsLab = (s: ClassSession) => {
  if (s.course_type) {
    return s.course_type.toLowerCase() === "lab";
  }
  return isLabClass(s.course, undefined, s.room);
};

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


// Page toolbar — simple stagger, fast
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 8, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

// Modal open/close — snappy scale + opacity
const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut", staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

// Modal inner items — fast fade-up
const modalItemVariants: Variants = {
  hidden: { y: 8, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.12, ease: "easeOut" },
  },
};

const EMPTY_OBJ = {};


const DAY_NAME_TO_ID: Record<string, number> = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

interface RoutineTableProps {
  schedule: { day: string; semester: string; slots: (ClassSession[] | null)[] }[];
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
  printHeader?: React.ReactNode;
  refreshRoutine: (silent?: boolean) => Promise<void>;
  setLocalRoutineList: React.Dispatch<React.SetStateAction<APIRoutineItem[]>>;
  isRoutineLocked: boolean;
  onCancelClass?: (session: ClassSession) => void;
  onReactivateClass?: (session: ClassSession) => void;
  onUpdateCancelMessage?: (session: ClassSession) => void;
  onHistoryAction?: (action: HistoryAction) => void;
  selectedTeacher?: string;
}

interface LazyDropdownProps {
  isRoutineLocked: boolean;
  isSubmitting: boolean;
  session: ClassSession;
  setSelectedSwapSource: React.Dispatch<React.SetStateAction<ClassSession | null>>;
  onCancelClass?: (session: ClassSession) => void;
  onReactivateClass?: (session: ClassSession) => void;
  onUpdateCancelMessage?: (session: ClassSession) => void;
  isClassOffToday: boolean;
  isMulti?: boolean;
}

const LazyClassActionsDropdown = ({
  isRoutineLocked,
  isSubmitting,
  session,
  setSelectedSwapSource,
  onCancelClass,
  onReactivateClass,
  onUpdateCancelMessage,
  isClassOffToday,
  isMulti = false,
}: LazyDropdownProps) => {
  const [isInteracted, setIsInteracted] = useState(false);

  const triggerButton = (
    <button
      draggable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        isMulti
          ? "absolute top-0.5 right-0.5 p-0.5 rounded opacity-0 group-hover/item:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 outline-none cursor-pointer shrink-0 z-10"
          : "ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 outline-none cursor-pointer"
      )}
      aria-label="Class actions"
    >
      <MoreVertical className={isMulti ? "w-2.5 h-2.5 text-muted-foreground" : "w-3 h-3 text-muted-foreground"} />
    </button>
  );

  if (isRoutineLocked || isSubmitting) return null;

  if (!isInteracted) {
    return (
      <div
        onMouseEnter={() => setIsInteracted(true)}
        onFocus={() => setIsInteracted(true)}
        className={isMulti ? "absolute top-0.5 right-0.5 z-10" : "shrink-0"}
      >
        {triggerButton}
      </div>
    );
  }

  return (
    <div className={isMulti ? "absolute top-0.5 right-0.5 z-10" : "shrink-0"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {triggerButton}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSwapSource(session);
            }}
          >
            <ArrowLeftRight className="size-4 mr-2" /> Swap / Move Class
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!isClassOffToday ? (
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onCancelClass?.(session);
              }}
            >
              <PowerOff className="size-4 mr-2 text-red-500" /> Cancel Class
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivateClass?.(session);
                }}
              >
                <CheckCheck className="size-4 mr-2" /> Activate Class
              </DropdownMenuItem>
              {session.is_cancelled && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCancelMessage?.(session);
                  }}
                >
                  <Pencil className="size-4 mr-2" /> Update Message
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

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
    printHeader,
    refreshRoutine,
    setLocalRoutineList,
    isRoutineLocked,
    onCancelClass,
    onReactivateClass,
    onUpdateCancelMessage,
    onHistoryAction,
    selectedTeacher = "All Teachers",
  }: RoutineTableProps) => {
    try {
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [swapConfirmModal, setSwapConfirmModal] = useState<{
        isOpen: boolean;
        source?: ClassSession;
        target?: ClassSession;
      }>({ isOpen: false });
      const [selectedSwapSource, setSelectedSwapSource] = useState<ClassSession | null>(null);

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

      // All drag state lives in refs — zero React re-renders during drag
      const ghostRef = useRef<HTMLDivElement | null>(null);
      const tableWrapperRef = useRef<HTMLDivElement | null>(null);
      const hoveredCellRef = useRef<HTMLElement | null>(null);
      const dragStateRef = useRef<{
        session: ClassSession | null;
        hoveredRowKey: string | null;
        hoveredCellIndex: number | null;
      }>({
        session: null,
        hoveredRowKey: null,
        hoveredCellIndex: null,
      });
      const dragScheduleRef = useRef<typeof schedule>([]);
      // Edge-scroll refs — track pointer Y position and the running RAF id
      const pointerYRef = useRef<number>(0);
      const scrollRafRef = useRef<number | null>(null);

      // Auto-scroll the page when pointer is within EDGE_ZONE px of the top/bottom
      const startEdgeScroll = useCallback(() => {
        const EDGE_ZONE = 80; // px from viewport edge to start scrolling
        const MAX_SPEED = 18; // max px per frame
        const loop = () => {
          const y = pointerYRef.current;
          const vh = window.innerHeight;
          let speed = 0;
          if (y < EDGE_ZONE) {
            // Near top — scroll up
            speed = -MAX_SPEED * (1 - y / EDGE_ZONE);
          } else if (y > vh - EDGE_ZONE) {
            // Near bottom — scroll down
            speed = MAX_SPEED * (1 - (vh - y) / EDGE_ZONE);
          }
          if (speed !== 0) window.scrollBy({ top: speed, behavior: 'instant' });
          scrollRafRef.current = requestAnimationFrame(loop);
        };
        scrollRafRef.current = requestAnimationFrame(loop);
      }, []);

      const pageGroups = useMemo(() => {
        if (!isAllSemestersMode) return [schedule];
        const groups: typeof schedule[] = [[], [], []];
        schedule.forEach((row) => {
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
      }, [schedule, isAllSemestersMode]);

      // Direct-DOM rollback animation — add CSS class, remove on animationend
      const triggerRollbackAnimation = useCallback((ids: number[]) => {
        ids.forEach(id => {
          const el = tableWrapperRef.current?.querySelector<HTMLElement>(`[data-session-id="${id}"]`);
          if (!el) return;
          el.classList.remove('card-rollback');
          // Force reflow so removing+re-adding the class restarts the animation
          void el.offsetWidth;
          el.classList.add('card-rollback');
          const cleanup = () => {
            el.classList.remove('card-rollback');
            el.removeEventListener('animationend', cleanup);
          };
          el.addEventListener('animationend', cleanup);
        });
      }, []);

      const handleDropOnCell = useCallback(async (targetRow: any, targetCellIndex: number, sourceSession: ClassSession) => {
        const targetSessionList = targetRow.slots[targetCellIndex];
        const targetDayName = targetRow.day;
        const targetDayId = DAY_NAME_TO_ID[targetDayName.toLowerCase()];
        const targetSlot = timeSlots[targetCellIndex];

        if (!targetDayId) {
          toast.error("Invalid day mapping.");
          return;
        }

        // Guard: drop onto the exact same cell -> Do nothing
        const isSameCell = sourceSession.dayId === targetDayId &&
          normalizeTime(sourceSession.originalTime || "") === normalizeTime(targetSlot.start_time) &&
          sourceSession.semester === targetRow.semester;

        if (isSameCell) {
          return;
        }

        if (!targetSessionList || targetSessionList.length === 0) {
          // Optimistically update the UI list instantly
          setLocalRoutineList(prev => prev.map(r => {
            if (r.id === sourceSession.id) {
              return {
                ...r,
                day: targetDayId,
                day_name: targetDayName,
                start_time: targetSlot.start_time,
                end_time: targetSlot.end_time
              };
            }
            return r;
          }));

          // Empty slot drop -> Manual update
          setIsSubmitting(true);
          const toastId = toast.loading("Updating routine entry...");
          try {
            const res = await updateRoutineEntry(sourceSession.id, targetDayId, targetSlot.id);
            if (res.success) {
              toast.success("Routine updated successfully!", { id: toastId });
              const sourceSlot = timeSlots.find(
                (s) => normalizeTime(s.start_time) === normalizeTime(sourceSession.originalTime || "")
              );
              if (sourceSlot) {
                onHistoryAction?.({
                  type: "UPDATE",
                  payload: {
                    id: sourceSession.id,
                    fromDayId: sourceSession.dayId,
                    fromSlotId: sourceSlot.id,
                    toDayId: targetDayId,
                    toSlotId: targetSlot.id,
                    course: sourceSession.course,
                  },
                  description: `Moved class ${sourceSession.course} from ${sourceSession.day} to ${targetRow.day} (${targetSlot.start_time})`,
                });
              }
              createLog(
                "Update",
                `Moved class ${sourceSession.course} (T: ${sourceSession.teacher}) from ${sourceSession.day} to ${targetRow.day} (${targetSlot.start_time})`
              );
              refreshRoutine(); // Show loading skeleton to refresh data
            } else {
              toast.error(res.message || "Failed to update routine", { id: toastId });
              refreshRoutine(); // Rollback & show loading skeleton
            }
          } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred", { id: toastId });
            refreshRoutine(); // Rollback & show loading skeleton
          } finally {
            setIsSubmitting(false);
          }
        } else {
          // Occupied slot drop -> Swap Instantly!
          const targetSession = targetSessionList[0];
          if (targetSession.id === sourceSession.id) return;

          // Optimistically update the UI list instantly by swapping source and target slots
          setLocalRoutineList(prev => {
            const sourceItem = prev.find(r => r.id === sourceSession.id);
            const targetItem = prev.find(r => r.id === targetSession.id);
            if (!sourceItem || !targetItem) return prev;

            return prev.map(r => {
              if (r.id === sourceSession.id) {
                return {
                  ...r,
                  day: targetItem.day,
                  day_name: targetItem.day_name,
                  start_time: targetItem.start_time,
                  end_time: targetItem.end_time
                };
              }
              if (r.id === targetSession.id) {
                return {
                  ...r,
                  day: sourceItem.day,
                  day_name: sourceItem.day_name,
                  start_time: sourceItem.start_time,
                  end_time: sourceItem.end_time
                };
              }
              return r;
            });
          });

          setIsSubmitting(true);
          const toastId = toast.loading("Swapping class times...");
          try {
            const res = await swapRoutineEntries(sourceSession.id, targetSession.id);
            if (res.success) {
              toast.success("Classes swapped successfully!", { id: toastId });
              onHistoryAction?.({
                type: "SWAP",
                payload: {
                  id1: sourceSession.id,
                  id2: targetSession.id,
                  course1: sourceSession.course,
                  course2: targetSession.course,
                },
                description: `Swapped class ${sourceSession.course} with ${targetSession.course}`,
              });
              createLog(
                "Swap",
                `Swapped class ${sourceSession.course} (T: ${sourceSession.teacher}, Day: ${sourceSession.day}) with ${targetSession.course} (T: ${targetSession.teacher}, Day: ${targetSession.day})`
              );
              refreshRoutine(); // Show loading skeleton to refresh data
            } else {
              toast.error(res.message || "Failed to swap class times", { id: toastId });
              await refreshRoutine(); // Rollback first — move cards back & show skeleton
              triggerRollbackAnimation([sourceSession.id, targetSession.id]);
            }
          } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred", { id: toastId });
            await refreshRoutine(); // Rollback first — move cards back & show skeleton
            triggerRollbackAnimation([sourceSession.id, targetSession.id]);
          } finally {
            setIsSubmitting(false);
          }
        }
      }, [timeSlots, refreshRoutine, setLocalRoutineList, triggerRollbackAnimation, onHistoryAction]);
      const pendingDragRef = useRef<{
        session: ClassSession | null;
        isLab: boolean;
        startX: number;
        startY: number;
        sourceEl: HTMLDivElement | null;
      }>({ session: null, isLab: false, startX: 0, startY: 0, sourceEl: null });

      const clearDragDom = useCallback(() => {
        hoveredCellRef.current?.removeAttribute('data-hovered');
        hoveredCellRef.current = null;
        tableWrapperRef.current?.removeAttribute('data-dragging-semester');
        // Clear source card attribute
        tableWrapperRef.current?.querySelector('[data-drag-source]')?.removeAttribute('data-drag-source');
        // Clear drag target classes
        const targets = tableWrapperRef.current?.querySelectorAll('[data-drag-target-valid]');
        targets?.forEach(el => el.removeAttribute('data-drag-target-valid'));
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        document.body.style.cursor = '';
        // Stop edge-scroll loop
        if (scrollRafRef.current !== null) {
          cancelAnimationFrame(scrollRafRef.current);
          scrollRafRef.current = null;
        }
      }, []);

      const commitDrag = useCallback((session: ClassSession, isLab: boolean, clientX: number, clientY: number, sourceEl: HTMLDivElement) => {
        dragStateRef.current.session = session;
        dragScheduleRef.current = schedule;
        dragStateRef.current.hoveredRowKey = null;
        dragStateRef.current.hoveredCellIndex = null;

        sourceEl.setAttribute('data-drag-source', '1');
        tableWrapperRef.current?.setAttribute('data-dragging-semester', session.semester);

        const cells = tableWrapperRef.current?.querySelectorAll(`[data-cell-semester="${session.semester}"]`);
        cells?.forEach(cell => cell.setAttribute('data-drag-target-valid', '1'));

        if (ghostRef.current) {
          const courseSpan = ghostRef.current.querySelector('[data-ghost-course]');
          const typeSpan = ghostRef.current.querySelector('[data-ghost-type]');
          const teacherSpan = ghostRef.current.querySelector('[data-ghost-teacher]');
          const roomSpan = ghostRef.current.querySelector('[data-ghost-room]');
          if (courseSpan) courseSpan.textContent = session.course;
          if (teacherSpan) teacherSpan.textContent = getTeacherInitials(session.teacher);
          if (roomSpan) roomSpan.textContent = session.room;
          if (typeSpan) {
            typeSpan.textContent = isLab ? 'Lab' : 'Theory';
            typeSpan.className = isLab
              ? "text-[9px] font-black uppercase tracking-wider px-1 rounded border shrink-0 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200/50"
              : "text-[9px] font-black uppercase tracking-wider px-1 rounded border shrink-0 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200/50";
          }
          ghostRef.current.style.display = 'flex';
          ghostRef.current.style.transform = `translate(calc(${clientX}px - 50%), calc(${clientY}px - 50%)) scale(1.06)`;
        }
        document.body.style.cursor = 'grabbing';
        // Start edge-scroll loop
        startEdgeScroll();
      }, [schedule]);

      // Window-level handlers — only attached once drag is committed
      const windowPointerMove = useCallback((e: PointerEvent) => {
        if (!dragStateRef.current.session) return;
        // Track pointer Y for edge-scroll RAF
        pointerYRef.current = e.clientY;
        if (ghostRef.current) {
          ghostRef.current.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%)) scale(1.06)`;
        }
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const cell = el?.closest('[data-cell-key]') as HTMLElement | null;
        if (cell !== hoveredCellRef.current) {
          hoveredCellRef.current?.removeAttribute('data-hovered');
          if (cell) {
            const sem = tableWrapperRef.current?.getAttribute('data-dragging-semester');
            if (sem && cell.getAttribute('data-cell-semester') === sem) {
              cell.setAttribute('data-hovered', '1');
              hoveredCellRef.current = cell;
              dragStateRef.current.hoveredRowKey = cell.dataset.cellKey ?? null;
              dragStateRef.current.hoveredCellIndex = cell.dataset.cellIndex != null ? parseInt(cell.dataset.cellIndex) : null;
            } else {
              hoveredCellRef.current = null;
              dragStateRef.current.hoveredRowKey = null;
              dragStateRef.current.hoveredCellIndex = null;
            }
          } else {
            hoveredCellRef.current = null;
            dragStateRef.current.hoveredRowKey = null;
            dragStateRef.current.hoveredCellIndex = null;
          }
        }
      }, []);

      const windowPointerUp = useCallback((e: PointerEvent) => {
        const src = dragStateRef.current.session;
        window.removeEventListener('pointermove', windowPointerMove);
        window.removeEventListener('pointerup', windowPointerUp);
        window.removeEventListener('pointercancel', windowPointerUp);
        pendingDragRef.current.session = null;
        pendingDragRef.current.sourceEl = null;
        if (!src) { clearDragDom(); return; }

        const rowKey = dragStateRef.current.hoveredRowKey;
        const cellIdx = dragStateRef.current.hoveredCellIndex;
        dragStateRef.current.session = null;
        dragStateRef.current.hoveredRowKey = null;
        dragStateRef.current.hoveredCellIndex = null;
        clearDragDom();

        if (rowKey == null || cellIdx == null) return;
        const targetRow = dragScheduleRef.current.find(
          (r) => `${r.day}-${r.semester}` === rowKey && r.semester === src.semester
        );
        if (!targetRow) return;
        handleDropOnCell(targetRow, cellIdx, src);
      }, [windowPointerMove, handleDropOnCell, clearDragDom]);

      // Window-level pending move — checks threshold before committing drag
      const windowPendingMove = useCallback((e: PointerEvent) => {
        const pending = pendingDragRef.current;
        if (!pending.session || !pending.sourceEl) return;
        const dx = e.clientX - pending.startX;
        const dy = e.clientY - pending.startY;
        if (Math.sqrt(dx * dx + dy * dy) < 4) return; // threshold not reached yet
        // Threshold crossed — commit drag and switch to drag handlers
        window.removeEventListener('pointermove', windowPendingMove);
        window.removeEventListener('pointerup', windowPendingCancel);
        window.removeEventListener('pointercancel', windowPendingCancel);
        commitDrag(pending.session, pending.isLab, e.clientX, e.clientY, pending.sourceEl);
        window.addEventListener('pointermove', windowPointerMove, { passive: true });
        window.addEventListener('pointerup', windowPointerUp);
        window.addEventListener('pointercancel', windowPointerUp);
      }, [commitDrag, windowPointerMove, windowPointerUp]);

      const windowPendingCancel = useCallback(() => {
        window.removeEventListener('pointermove', windowPendingMove);
        window.removeEventListener('pointerup', windowPendingCancel);
        window.removeEventListener('pointercancel', windowPendingCancel);
        pendingDragRef.current.session = null;
        pendingDragRef.current.sourceEl = null;
      }, [windowPendingMove]);

      const startPointerDrag = useCallback((e: React.PointerEvent<HTMLDivElement>, session: ClassSession, isLab: boolean) => {
        if (isSubmitting) return;
        // Only trigger on primary pointer (left mouse / first touch)
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        // Record pending drag start — do NOT capture pointer so scrolling stays free
        pendingDragRef.current = {
          session,
          isLab,
          startX: e.clientX,
          startY: e.clientY,
          sourceEl: e.currentTarget,
        };
        dragScheduleRef.current = schedule;
        // Attach pending-move listener — will commit drag once threshold crossed
        window.addEventListener('pointermove', windowPendingMove, { passive: true });
        window.addEventListener('pointerup', windowPendingCancel);
        window.addEventListener('pointercancel', windowPendingCancel);
      }, [isSubmitting, schedule, windowPendingMove, windowPendingCancel]);

      // Dummy no-op handlers kept on the card element for compatibility
      const onPointerMove = useCallback((_e: React.PointerEvent<HTMLDivElement>) => { }, []);
      const onPointerUp = useCallback((_e: React.PointerEvent<HTMLDivElement>) => { }, []);
      const onPointerCancel = useCallback((_e: React.PointerEvent<HTMLDivElement>) => { }, []);

      const confirmSwap = async () => {
        const { source, target } = swapConfirmModal;
        if (!source || !target) return;

        setSwapConfirmModal({ isOpen: false });

        // Optimistically update the UI list instantly
        setLocalRoutineList(prev => {
          const sourceItem = prev.find(r => r.id === source.id);
          const targetItem = prev.find(r => r.id === target.id);
          if (!sourceItem || !targetItem) return prev;

          return prev.map(r => {
            if (r.id === source.id) {
              return {
                ...r,
                day: targetItem.day,
                day_name: targetItem.day_name,
                start_time: targetItem.start_time,
                end_time: targetItem.end_time
              };
            }
            if (r.id === target.id) {
              return {
                ...r,
                day: sourceItem.day,
                day_name: sourceItem.day_name,
                start_time: sourceItem.start_time,
                end_time: sourceItem.end_time
              };
            }
            return r;
          });
        });

        setIsSubmitting(true);
        const toastId = toast.loading("Swapping class times...");
        try {
          const res = await swapRoutineEntries(source.id, target.id);
          if (res.success) {
            toast.success("Classes swapped successfully!", { id: toastId });
            onHistoryAction?.({
              type: "SWAP",
              payload: {
                id1: source.id,
                id2: target.id,
                course1: source.course,
                course2: target.course,
              },
              description: `Swapped class ${source.course} with ${target.course}`,
            });
            createLog(
              "Swap",
              `Swapped class ${source.course} (T: ${source.teacher}, Day: ${source.day}) with ${target.course} (T: ${target.teacher}, Day: ${target.day})`
            );
            refreshRoutine(); // Show loading skeleton to refresh data
          } else {
            toast.error(res.message || "Failed to swap class times", { id: toastId });
            await refreshRoutine(); // Rollback first — cards back to original & show skeleton
            triggerRollbackAnimation([source.id, target.id]);
          }
        } catch (err) {
          console.error(err);
          toast.error("An unexpected error occurred", { id: toastId });
          await refreshRoutine(); // Rollback first — cards back to original & show skeleton
          triggerRollbackAnimation([source.id, target.id]);
        } finally {
          setIsSubmitting(false);
        }
      };

      const renderTable = (groupSchedule: typeof schedule, isPrint: boolean) => {
        return (
          <Table className={cn(
            "w-full overflow-hidden min-w-[1000px] border border-border border-collapse text-sm table-fixed",
            isPrint ? "print:min-w-0 print:w-full print:border-collapse !print:border-black" : ""
          )}>
            <TableHeader>
              <TableRow className={cn(
                "border-b border-border hover:bg-transparent",
                isPrint ? "print:border-black print:border-b" : ""
              )}>
                <TableCell
                  className={cn(
                    "p-0 w-[90px] min-w-[90px] h-[60px] border-r border-border relative bg-muted/40",
                    isPrint ? "print:bg-white !print:border-r !print:border-black print:w-16 print:min-w-0" : ""
                  )}
                  style={isPrint ? {} : { width: colWidths["day"] || 90, minWidth: colWidths["day"] || 90 }}
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
                      className={cn("stroke-border", isPrint ? "print:stroke-black" : "")}
                      strokeWidth="1"
                    />
                  </svg>
                  <span className={cn(
                    "absolute top-2 right-2 text-[10px] font-bold",
                    isPrint ? "print:text-black print:text-[10px] print:top-[2px] print:right-[2px]" : ""
                  )}>
                    Time
                  </span>
                  <span className={cn(
                    "absolute bottom-2 left-2 text-[10px] font-bold",
                    isPrint ? "print:text-black print:text-[10px] print:bottom-[2px] print:left-[2px]" : ""
                  )}>
                    Day
                  </span>
                  {!isPrint && (
                    <div
                      onMouseDown={(e) => startColResize(e, "day", 90, 70)}
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                    />
                  )}
                </TableCell>

                {isAllSemestersMode && (
                  <TableCell
                    className={cn(
                      "w-12 min-w-[48px] text-center font-bold bg-muted/40 border-r border-border text-xs uppercase print-sem-cell relative",
                      isPrint ? "!print:border-r !print:border-black" : ""
                    )}
                    style={isPrint ? {} : { width: colWidths["semester"] || 48, minWidth: colWidths["semester"] || 48 }}
                  >
                    SEM
                    {!isPrint && (
                      <div
                        onMouseDown={(e) => startColResize(e, "semester", 48, 40)}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                      />
                    )}
                  </TableCell>
                )}

                {timeSlots.map((slot, idx) => {
                  const hasClass = groupSchedule.some(rowItem => rowItem.slots[idx] !== null);
                  const isBreak = isBreakSlot(slot);
                  const defaultColWidth = isBreak ? (hasClass ? 180 : 50) : 180;
                  const colWidth = colWidths[slot.id] || defaultColWidth;

                  if (isBreak) {
                    if (!hasClass) {
                      return (
                        <TableCell
                          key={slot.id}
                          className={cn(
                            "w-10 min-w-10 bg-foreground text-background text-center align-middle p-0 border-r border-border relative",
                            isPrint ? "print:bg-white print:text-black print:w-6 print:min-w-0 border-r border-border !print:border-r !print:border-black" : ""
                          )}
                          style={isPrint ? {} : { width: colWidth, minWidth: colWidth }}
                        >
                          <div className="h-full flex items-center justify-center">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest -rotate-90 whitespace-nowrap text-background print-break-text-no-class",
                              isPrint ? "print:text-black" : ""
                            )}>
                              BREAK
                            </span>
                          </div>
                          {!isPrint && (
                            <div
                              onMouseDown={(e) => startColResize(e, String(slot.id), defaultColWidth, 40)}
                              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                            />
                          )}
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell
                          key={slot.id}
                          className={cn(
                            "bg-foreground text-background text-center align-middle p-0 border-r border-border min-w-[100px] relative",
                            isPrint ? "print:bg-white print:text-black !print:border-r !print:border-black" : ""
                          )}
                          style={isPrint ? {} : { width: colWidth, minWidth: colWidth }}
                        >
                          <div className="h-full flex items-center justify-center">
                            <span className={cn(
                              "text-xs font-black uppercase tracking-widest text-background whitespace-nowrap",
                              isPrint ? "print:text-black" : ""
                            )}>
                              BREAK
                            </span>
                          </div>
                          {!isPrint && (
                            <div
                              onMouseDown={(e) => startColResize(e, String(slot.id), defaultColWidth, 40)}
                              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                            />
                          )}
                        </TableCell>
                      );
                    }
                  }
                  return (
                    <TableCell
                      key={slot.id}
                      className={cn(
                        "text-center align-middle h-[60px] border-r border-border last:border-r-0 p-0 min-w-[100px] bg-muted/10 relative",
                        isPrint ? "!print:border-r !print:border-black print:last:border-r-0 print:h-auto print:bg-white print:min-w-0" : ""
                      )}
                      style={isPrint ? {} : { width: colWidth, minWidth: colWidth }}
                    >
                      <div className="flex flex-col items-center justify-center h-full w-full px-1">
                        <span className={cn(
                          "font-bold text-xs whitespace-nowrap",
                          isPrint ? "print:text-[11px] print:font-bold print:text-black" : ""
                        )}>
                          {formatTimeSlotLabel(slot.start_time)}
                          <span className="mx-1">-</span>
                          {formatTimeSlotLabel(slot.end_time)}
                        </span>
                      </div>
                      {!isPrint && (
                        <div
                          onMouseDown={(e) => startColResize(e, String(slot.id), defaultColWidth, 180)}
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 hover:w-1.5 transition-all z-30"
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHeader>
            {DAYS_ORDER.map((dayName) => {
              const dayRows = groupSchedule.filter(
                (rowItem) =>
                  rowItem.day.toLowerCase() === dayName.toLowerCase()
              );
              if (dayRows.length === 0) return null;

              return (
                <tbody
                  key={dayName}
                  className={cn(isPrint ? "print:break-inside-avoid !print:break-inside-avoid" : "")}
                >
                  {dayRows.map((rowItem, rowIndex) => {
                    const isFirstRowOfDay = rowIndex === 0;
                    const rowSpan = dayRows.length;
                    const rowHasGroup = rowItem.slots.some((s) => s && s.some(sess => sess.group_name));

                    return (
                      <tr
                        key={`${rowItem.day}-${rowItem.semester}`}
                        className={cn(
                          "border-b border-border hover:bg-muted/5",
                          isPrint ? "!print:border-black print:border-b print:h-auto" : ""
                        )}
                        style={isPrint ? {} : { height: rowHeights[`${rowItem.day}-${rowItem.semester}`] || 85 }}
                      >
                        {/* Day Label (grouped by rowSpan) */}
                        {isFirstRowOfDay && (
                          <TableCell
                            rowSpan={rowSpan}
                            className={cn(
                              "font-bold text-xs uppercase tracking-wider p-0 align-middle text-center bg-muted/20 border-r border-border relative",
                              isPrint ? "!print:border-r !print:border-black print:bg-white print:text-black print:font-bold" : ""
                            )}
                          >
                            <div className={cn("flex items-center justify-center h-full w-full py-4", isPrint ? "print:py-2" : "")}>
                              <span className={cn(
                                "writing-mode-vertical lg:writing-mode-horizontal lg:rotate-0",
                                isPrint ? "print:rotate-0 print:text-[12px]" : ""
                              )}>
                                {rowItem.day.slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                            {!isPrint && !isAllSemestersMode && (
                              <div
                                onMouseDown={(e) => startRowResize(e, `${rowItem.day}-${rowItem.semester}`, 85)}
                                className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/50 hover:h-1.5 transition-all z-30"
                              />
                            )}
                          </TableCell>
                        )}

                        {/* Semester Label */}
                        {isAllSemestersMode && (
                          <TableCell className={cn(
                            "font-bold text-xs text-center border-r border-border bg-muted/10 print-sem-cell w-12 min-w-[48px] relative",
                            isPrint ? "!print:border-r !print:border-black print:bg-white print:text-black" : ""
                          )}>
                            {rowItem.semester}
                            {!isPrint && (
                              <div
                                onMouseDown={(e) => startRowResize(e, `${rowItem.day}-${rowItem.semester}`, 85)}
                                className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/50 hover:h-1.5 transition-all z-30"
                              />
                            )}
                          </TableCell>
                        )}

                        {/* Time Slots */}
                        {rowItem.slots.map((sessionList, index) => {
                          const slot = timeSlots[index];
                          const sessions = sessionList && sessionList.length > 0 ? sessionList : null;
                          const firstSession = sessions ? sessions[0] : null;
                          const isMulti = sessions ? sessions.length > 1 : false;

                          // Compute cell-level highlights/states based on all sessions
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
                                if (selectedSwapSource) {
                                  if (rowItem.semester === selectedSwapSource.semester) {
                                    handleDropOnCell(rowItem, index, selectedSwapSource);
                                    setSelectedSwapSource(null);
                                  }
                                  return;
                                }
                                // For single-session cancelled cells, show reason on click
                                if (firstSession && !isMulti) {
                                  const tKey = firstSession.teacherId ?? firstSession.teacher;
                                  const sTime = firstSession.originalTime || "";
                                  const cKey = tKey && sTime ? generateClassKey(firstSession.department, firstSession.semester, abbreviateDay(firstSession.day), tKey, sTime) : "";
                                  const offData = cKey ? classOffMap[cKey] : undefined;
                                  const isOff = Boolean(offData?.status) || Boolean(firstSession.is_cancelled);
                                  if (isOff) {
                                    onCellClick({
                                      course: firstSession.course,
                                      teacher: firstSession.teacher,
                                      reason: offData?.reason || firstSession.cancel_message || "No reason provided.",
                                    });
                                  }
                                }
                              }}
                              data-cell-key={`${rowItem.day}-${rowItem.semester}`}
                              data-cell-index={index}
                              data-cell-semester={rowItem.semester}
                              className={cn(
                                "h-px align-middle border-r border-border relative p-2",
                                isPrint ? "!print:border-r !print:border-black" : "",
                                (selectedSwapSource && rowItem.semester === selectedSwapSource.semester)
                                  ? "cursor-pointer hover:bg-primary/5 transition-colors"
                                  : "cursor-default",
                                anyHighlighted
                                  ? "bg-emerald-100/50 dark:bg-emerald-900/20" + (isPrint ? " print:bg-transparent" : "")
                                  : anyTeacherOff
                                    ? "bg-red-100/30 dark:bg-red-950/10" + (isPrint ? " print:bg-transparent" : "")
                                    : "bg-transparent" + (isPrint ? " print:bg-white" : "")
                              )}
                            >
                              {/* CSS-driven drag overlays */}
                              {!isPrint && (
                                <>
                                  <div className="drag-target-dashed absolute inset-0.5 rounded-lg border-2 border-dashed border-primary/45 bg-primary/5 pointer-events-none z-20 opacity-0 scale-95 transition-all duration-150" />
                                  <div className="drag-target-hovered absolute inset-0.5 rounded-lg border-2 border-solid border-primary bg-primary/15 shadow-md shadow-primary/20 pointer-events-none z-20 opacity-0 transition-all duration-150" />
                                </>
                              )}
                              {sessions ? (
                                <>
                                  {(() => {
                                    if (isMulti) {
                                      // Compute combined container states from all sessions
                                      const isMultiHighlight = sessions.some(s => isMatch(s));
                                      const isMultiTeacherOff = sessions.some(s => {
                                        const tKey = s.teacherId ?? s.teacher;
                                        const sTime = s.originalTime || "";
                                        const cKey = tKey && sTime ? generateClassKey(s.department, s.semester, abbreviateDay(s.day), tKey, sTime) : "";
                                        const offData = cKey ? classOffMap[cKey] : undefined;
                                        return (offData?.status) || s.is_cancelled || (availabilityMap[tKey] === false);
                                      });
                                      const isMultiLab = sessions.every(s => checkIsLab(s));
                                      const isMultiTheory = sessions.every(s => !checkIsLab(s));

                                      const containerBgClass = isMultiTeacherOff
                                        ? "bg-red-50/50 border-red-500 ring-2 ring-red-400/40 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                                        : isMultiHighlight
                                          ? "bg-background border-emerald-500 shadow-md"
                                          : isMultiLab
                                            ? "bg-violet-50/40 border-violet-200 dark:bg-violet-950/20 dark:border-violet-800/30 hover:border-violet-400/40 hover:shadow-md"
                                            : isMultiTheory
                                              ? "bg-teal-50/40 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800/30 hover:border-teal-400/40 hover:shadow-md"
                                              : "bg-slate-50/45 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800/30 hover:border-teal-400/40 hover:shadow-md";

                                      return (
                                        <div className={cn(
                                          "print:hidden w-full rounded-md border flex flex-row p-0.5 shadow-sm relative select-none justify-between items-stretch h-full min-h-[69px] gap-1",
                                          "transition-all duration-150",
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
                                            const highlighted = isMatch(session);
                                            const isLab = checkIsLab(session);

                                            return (
                                              <React.Fragment key={session.id}>
                                                <div
                                                  data-session-id={session.id}
                                                  data-drag-source={selectedSwapSource?.id === session.id ? "1" : undefined}
                                                  onPointerDown={(!isRoutineLocked && !isClassOffToday && !isSubmitting) ? (e) => startPointerDrag(e, session, isLab) : undefined}
                                                  onPointerMove={onPointerMove}
                                                  onPointerUp={onPointerUp}
                                                  onPointerCancel={onPointerCancel}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isClassOffToday) {
                                                      onCellClick({ course: session.course, teacher: session.teacher, reason: cancellationReason });
                                                    }
                                                  }}
                                                  className={cn(
                                                    "relative flex-1 flex flex-col justify-between rounded px-1.5 py-1.5 transition-colors duration-150 min-w-0 select-none group/item",
                                                    (!isRoutineLocked && !isClassOffToday && !isSubmitting) && "cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5"
                                                  )}
                                                >
                                                  <div className="flex flex-col gap-0.5 items-start w-full">
                                                    <div className="flex items-center justify-between gap-0.5 w-full max-w-full">
                                                      <div className={cn(
                                                        "text-[8.5px] font-bold tracking-[-0.05em] text-foreground truncate pr-3.5 w-full block",
                                                        isClassOffToday && "opacity-70 line-through"
                                                      )}>
                                                        {session.course}
                                                      </div>
                                                      <LazyClassActionsDropdown
                                                        isRoutineLocked={isRoutineLocked}
                                                        isSubmitting={isSubmitting}
                                                        session={session}
                                                        setSelectedSwapSource={setSelectedSwapSource}
                                                        onCancelClass={onCancelClass}
                                                        onReactivateClass={onReactivateClass}
                                                        onUpdateCancelMessage={onUpdateCancelMessage}
                                                        isClassOffToday={isClassOffToday}
                                                        isMulti={true}
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col items-start gap-0.5 w-full mt-1">
                                                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium truncate max-w-full">
                                                      {selectedTeacher !== "All Teachers" ? (
                                                        <><BookOpen className="w-2.5 h-2.5 opacity-70 shrink-0" /><span className="truncate">{session.semester}</span></>
                                                      ) : (
                                                        <><User className="w-2.5 h-2.5 opacity-70 shrink-0" /><span className="truncate">{getTeacherInitials(session.teacher)}</span></>
                                                      )}
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
                                    const isLab = checkIsLab(session);

                                    return (
                                      <motion.div
                                        key={session.id}
                                        data-session-id={session.id}
                                        data-drag-source={selectedSwapSource?.id === session.id ? "1" : undefined}
                                        onPointerDown={(!isRoutineLocked && !isClassOffToday && !isSubmitting) ? (e) => startPointerDrag(e, session, isLab) : undefined}
                                        onPointerMove={onPointerMove}
                                        onPointerUp={onPointerUp}
                                        onPointerCancel={onPointerCancel}
                                        className={cn(
                                          "h-full w-full rounded-md border flex flex-col justify-between p-2 shadow-sm group print:hidden relative select-none",
                                          "transition-colors duration-150",
                                          (!isRoutineLocked && !isClassOffToday && !isSubmitting) && "cursor-grab active:cursor-grabbing hover:shadow-md",
                                          isTeacherOff
                                            ? "bg-red-50/50 border-red-500 ring-2 ring-red-400/40 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                                            : highlighted
                                              ? "bg-background border-emerald-500 shadow-md"
                                              : isLab
                                                ? "bg-violet-50/40 border-violet-200 dark:bg-violet-950/20 dark:border-violet-800/30 hover:border-violet-400/40 hover:shadow-md"
                                                : "bg-teal-50/40 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800/30 hover:border-teal-400/40 hover:shadow-md"
                                        )}
                                      >
                                        <div className="flex justify-between items-start w-full gap-1">
                                          <div className="flex flex-col">
                                            <span className={cn(
                                              "text-xs font-extrabold tracking-tight leading-tight text-foreground",
                                              isClassOffToday && "opacity-70"
                                            )}>
                                              {session.course}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-0.5 shrink-0">
                                            {isLab ? (
                                              <span className={cn(
                                                "text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded border shrink-0",
                                                isTeacherOff
                                                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/40"
                                                  : "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/40"
                                              )}>Lab</span>
                                            ) : (
                                              <span className={cn(
                                                "text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded border shrink-0",
                                                isTeacherOff
                                                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/40"
                                                  : "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200/50 dark:border-teal-800/40"
                                              )}>Theory</span>
                                            )}
                                            <LazyClassActionsDropdown
                                              isRoutineLocked={isRoutineLocked}
                                              isSubmitting={isSubmitting}
                                              session={session}
                                              setSelectedSwapSource={setSelectedSwapSource}
                                              onCancelClass={onCancelClass}
                                              onReactivateClass={onReactivateClass}
                                              onUpdateCancelMessage={onUpdateCancelMessage}
                                              isClassOffToday={isClassOffToday}
                                              isMulti={false}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 mt-1 w-full text-left">
                                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            {selectedTeacher !== "All Teachers" ? (
                                              <><BookOpen className="w-3 h-3 opacity-70" /><span>{session.semester}</span></>
                                            ) : (
                                              <><User className="w-3 h-3 opacity-70" /><span>{getTeacherInitials(session.teacher)}</span></>
                                            )}
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
                                      </motion.div>
                                    );
                                  })()}
                                  {/* Print view for multi or single sessions */}
                                  <div className="hidden print:flex flex-col items-center justify-center text-center text-black h-full w-full leading-tight py-1 gap-0.5">
                                    {sessions.map((session, sIdx) => {
                                      const teacherKey = session.teacherId ?? session.teacher;
                                      const sTime = session.originalTime || "";
                                      const cKey = teacherKey && sTime ? generateClassKey(session.department, session.semester, abbreviateDay(session.day), teacherKey, sTime) : "";
                                      const offData = cKey ? classOffMap[cKey] : undefined;
                                      const isTeacherOff = (offData?.status) || session.is_cancelled || (availabilityMap[teacherKey] === false);
                                      return (
                                        <div key={session.id} className={cn(
                                          "w-full text-center",
                                          isMulti && sIdx < sessions.length - 1 && "border-b border-black/20 pb-0.5 mb-0.5"
                                        )}>
                                          <span className="font-bold text-[11px] block">
                                            {session.course}{selectedTeacher !== "All Teachers" ? ` (${session.semester.replace(" Semester", " Sem")})` : `, T-${getTeacherInitials(session.teacher)}`}
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
                              ) : isBreakSlot(slot) ? (
                                <>
                                  <div
                                    className="absolute inset-0 opacity-10 print:hidden"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
                                      backgroundSize: "4px 4px",
                                    }}
                                  />
                                  <div className="h-full w-full min-h-[48px] flex items-center justify-center relative z-10 print:hidden">
                                    <Utensils className="w-3 h-3 text-foreground/40" />
                                  </div>
                                </>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center min-h-[48px] print:min-h-0">
                                  <div className="w-1 h-1 rounded-full bg-border print:hidden" />
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </Table>
        );
      };

      return (
        <div className="w-full flex flex-col gap-6 print:gap-0 print:block">
          {/* Screen view: single table */}
          <div
            ref={tableWrapperRef}
            className="w-full print:hidden"
            data-dragging-semester={selectedSwapSource?.semester || undefined}
          >
            {renderTable(schedule, false)}
          </div>

          {/* Print view: split tables */}
          <div className="hidden print:block print:w-full print:gap-0">
            {pageGroups.map((groupSchedule, groupIdx) => (
              <div key={groupIdx} className="print-page-container w-full">
                {groupIdx === 0 && printHeader}
                {renderTable(groupSchedule, true)}
              </div>
            ))}
          </div>

          {/* Floating Swap Mode Bar */}
          {selectedSwapSource && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-background/80 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200 print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ArrowLeftRight className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">Swap/Move Mode</span>
                  <span className="text-sm font-bold text-foreground">
                    Selected: {selectedSwapSource.course}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Tap target slot for {selectedSwapSource.semester} Semester
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedSwapSource(null)}
                className="hover:bg-muted font-bold text-xs"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Swap Confirmation Modal */}
          <Dialog
            open={swapConfirmModal.isOpen}
            onOpenChange={(open) =>
              setSwapConfirmModal((prev) => ({ ...prev, isOpen: open }))
            }
          >
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                  Swap Class Times
                </DialogTitle>
                <DialogDescription className="text-base leading-snug">
                  You are about to permanently swap the scheduled slots of two classes in the database:
                </DialogDescription>
              </DialogHeader>

              {swapConfirmModal.source && swapConfirmModal.target && (
                <div className="py-4 space-y-4">
                  <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/20 dark:border-teal-800/20 dark:bg-teal-950/10 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Source Class</span>
                    <span className="text-base font-bold text-foreground">{swapConfirmModal.source.course}</span>
                    <span className="text-xs text-muted-foreground">
                      Teacher: {swapConfirmModal.source.teacher} ({getTeacherInitials(swapConfirmModal.source.teacher)})
                    </span>
                    <span className="text-xs font-semibold mt-1">
                      Current: {swapConfirmModal.source.day} @ {swapConfirmModal.source.originalTime}
                    </span>
                  </div>

                  <div className="flex justify-center items-center">
                    <div className="p-2 rounded-full bg-muted border animate-pulse text-muted-foreground">
                      <ArrowLeftRight className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/20 dark:border-violet-800/20 dark:bg-violet-950/10 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider">Target Class</span>
                    <span className="text-base font-bold text-foreground">{swapConfirmModal.target.course}</span>
                    <span className="text-xs text-muted-foreground">
                      Teacher: {swapConfirmModal.target.teacher} ({getTeacherInitials(swapConfirmModal.target.teacher)})
                    </span>
                    <span className="text-xs font-semibold mt-1">
                      Current: {swapConfirmModal.target.day} @ {swapConfirmModal.target.originalTime}
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSwapConfirmModal({ isOpen: false })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSwap}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold min-w-[120px]"
                >
                  Confirm Swap
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Ghost portal — rendered into document.body to escape transformed ancestors */}
          {typeof document !== 'undefined' && ReactDOM.createPortal(
            <div
              ref={ghostRef}
              style={{
                display: 'none',
                position: 'fixed',
                left: 0,
                top: 0,
                transform: 'translate(0, 0)',
                pointerEvents: 'none',
                zIndex: 9999,
                willChange: 'transform',
              }}
              className="w-[130px] rounded-md border-2 border-primary shadow-2xl shadow-primary/30 p-2 flex flex-col gap-1 backdrop-blur-md bg-background/90"
            >
              <div className="flex items-center justify-between gap-1">
                <span data-ghost-course="" className="text-xs font-extrabold tracking-tight text-foreground truncate">
                  -
                </span>
                <span data-ghost-type="" className="text-[9px] font-black uppercase tracking-wider px-1 rounded border shrink-0">
                  -
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <User className="w-3 h-3 shrink-0" />
                <span data-ghost-teacher="">-</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/80">
                <MapPin className="w-3 h-3 shrink-0" />
                <span data-ghost-room="">-</span>
              </div>
            </div>,
            document.body
          )}
        </div>
      );
    } catch (error) {
      console.error("MemoizedRoutineTable render error:", error);
      return (
        <div className="p-6 border border-red-500/30 rounded-xl bg-red-500/5 text-red-500 font-medium font-lexend text-center">
          <p className="text-lg font-bold mb-1">Failed to render routine table</p>
          <p className="text-xs opacity-80">{String(error)}</p>
        </div>
      );
    }
  }
);
MemoizedRoutineTable.displayName = "MemoizedRoutineTable";


interface Props {
  routineList: APIRoutineItem[];
  timeSlots: TimeSlot[];
  dbDepartments?: { id: number; name: string }[];
  dbSemesters?: { id: number; name: string; order: number }[];
}

export default function AdminRoutinePage({
  routineList,
  timeSlots,
  dbDepartments = [],
  dbSemesters = [],
}: Props) {
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

  const router = useRouter();
  const dispatch = useDispatch();

  const viewReasonDialogRef = useRef<{
    open: (data: { course: string; teacher: string; reason: string }) => void;
  } | null>(null);

  const { role, isLoading: isAuthLoading } = useSelector(
    (s: RootState) => s.auth
  );
  const availabilityMap = useSelector(
    (s: RootState) => s.teacherAvailability?.map || EMPTY_OBJ
  );
  const classOffMap = useSelector(
    (s: RootState) => s.classOff.offMap || EMPTY_OBJ
  );


  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const isRoutineLocked = useSelector((s: RootState) => s.routine.isLocked);

  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);
  const [isProcessingHistory, setIsProcessingHistory] = useState(false);

  const handleHistoryAction = useCallback((action: HistoryAction) => {
    setUndoStack((prev) => [...prev, action]);
    setRedoStack([]);
  }, []);

  // ── Data Management (Export / Import) ──────────────────────────────────────
  const [dataManagementOpen, setDataManagementOpen] = useState(false);



  const [lockConfirmModal, setLockConfirmModal] = useState<{
    isOpen: boolean;
    type: "lock" | "unlock";
  }>({
    isOpen: false,
    type: "lock",
  });
  const [lockConfirmInput, setLockConfirmInput] = useState("");

  const [generateModal, setGenerateModal] = useState<{
    isOpen: boolean;
    departmentId: number | undefined;
    semesterId: number | undefined;
    ignoreWarnings: boolean;
  }>({
    isOpen: false,
    departmentId: undefined,
    semesterId: undefined,
    ignoreWarnings: false,
  });

  const [generateResultModal, setGenerateResultModal] = useState<{
    isOpen: boolean;
    success: boolean;
    data: {
      status?: string;
      total_classes_required?: number;
      successful_classes?: number;
      dropped_classes?: number;
      shortage_details?: string[] | any[];
      message?: string;
    } | null;
    errorMsg?: string | null;
  }>({
    isOpen: false,
    success: false,
    data: null,
    errorMsg: null,
  });

  const openGenerateModal = () => {
    if (isRoutineLocked) return;
    setGenerateModal({
      isOpen: true,
      departmentId: selectedDeptId,
      semesterId: selectedSemesterId,
      ignoreWarnings: false,
    });
  };

  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [generationVersion, setGenerationVersion] = useState(0);
  const isFirstRender = useRef(true);
  const isFirstFetchRef = useRef(true);

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("All Teachers");

  const isFilterDirty = useMemo(() => {
    return (
      (selectedSemester && selectedSemester !== "All Semesters") ||
      (selectedTeacher && selectedTeacher !== "All Teachers") ||
      inputValue !== ""
    );
  }, [selectedSemester, selectedTeacher, inputValue]);

  const handleClearFilters = useCallback(() => {
    setSelectedSemester("All Semesters");
    setSelectedTeacher("All Teachers");
    setInputValue("");
  }, []);

  const localRoutineList = useSelector((s: RootState) => s.routine.routineList);

  const teachersList = useMemo(() => {
    if (!selectedDept) return ["All Teachers"];

    const teachers = new Set<string>();
    localRoutineList.forEach(item => {
      if (item.department_name === selectedDept && item.teacher_name) {
        teachers.add(item.teacher_name);
      }
    });

    return ["All Teachers", ...Array.from(teachers).sort()];
  }, [localRoutineList, selectedDept]);

  useEffect(() => {
    setSelectedTeacher("All Teachers");
  }, [selectedDept]);

  const setLocalRoutineList = useCallback((updater: React.SetStateAction<APIRoutineItem[]>) => {
    if (typeof updater === "function") {
      const currentState = (store.getState() as RootState).routine.routineList;
      dispatch(setRoutineList(updater(currentState)));
    } else {
      dispatch(setRoutineList(updater));
    }
  }, [dispatch]);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [cancellationMode, setCancellationMode] = useState<"cancel" | "update">("cancel");
  const [pendingCancellation, setPendingCancellation] = useState<{
    id: number;
    courseName: string;
    teacherId: string;
    startTimeRaw: string;
    department: string;
    semester: string;
    day: string;
    initialReason?: string;
  } | null>(null);

  const submitCancellation = async (reason: string) => {
    if (!pendingCancellation) return;

    try {
      const res = cancellationMode === "update"
        ? await updateCancelMessage(pendingCancellation.id, reason)
        : await cancelClass(pendingCancellation.id, reason);

      if (res.success) {
        if (cancellationMode === "update") {
          toast.success("Cancellation message updated successfully");
        } else {
          toast.warning(`${pendingCancellation.courseName} class has been cancelled`);
        }

        setLocalRoutineList((prev) =>
          prev.map((r) =>
            r.id === pendingCancellation.id
              ? { ...r, is_cancelled: true, cancel_message: reason }
              : r
          )
        );

        dispatch(
          markOff({
            department: pendingCancellation.department,
            semester: pendingCancellation.semester,
            day: pendingCancellation.day,
            teacherId: pendingCancellation.teacherId,
            startTime: pendingCancellation.startTimeRaw,
            reason: reason,
          })
        );
      } else {
        toast.error(res.message || (cancellationMode === "update" ? "Failed to update cancellation message" : "Failed to cancel class"));
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsReasonModalOpen(false);
      setPendingCancellation(null);
    }
  };

  const handleReactivate = useCallback(async (session: ClassSession) => {
    try {
      const res = await reactivateClass(session.id);
      if (res.success) {
        toast.success(`${session.course} is now active (ON)`);

        setLocalRoutineList((prev) =>
          prev.map((r) =>
            r.id === session.id
              ? { ...r, is_cancelled: false, cancel_message: null }
              : r
          )
        );

        dispatch(
          markOn({
            department: session.department,
            semester: session.semester,
            day: session.day,
            teacherId: session.teacherId || session.teacher,
            startTime: session.originalTime || "",
          })
        );
      } else {
        toast.error(res.message || "Failed to activate class");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  }, [dispatch]);

  const isLoadingRoutine = useSelector((s: RootState) => s.routine.isLoading);

  const setIsLoadingRoutine = useCallback((loading: boolean) => {
    dispatch(setIsLoading(loading));
  }, [dispatch]);

  useEffect(() => {
    setLocalRoutineList(routineList);
  }, [routineList]);



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
  }, [localRoutineList, sortedTimeSlots, selectedDept, selectedSemester, selectedTeacher]);

  const departments = useMemo(() => {
    if (dbDepartments.length > 0) {
      return Array.from(new Set(dbDepartments.map((d) => d.name))).sort();
    }
    const depts = Array.from(
      new Set(routineList.map((item) => item.department_name))
    );
    return depts.sort();
  }, [dbDepartments, routineList]);

  const semesters = useMemo(() => {
    if (dbSemesters.length > 0) {
      const sems = Array.from(new Set(dbSemesters.map((s) => s.name)));
      const sortedSems = sems.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
      return ["All Semesters", ...sortedSems];
    }
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
  }, [dbSemesters, routineList, selectedDept]);

  const selectedDeptId = useMemo(() => {
    const found = dbDepartments.find((d) => d.name === selectedDept);
    return found ? found.id : undefined;
  }, [dbDepartments, selectedDept]);

  const selectedSemesterId = useMemo(() => {
    if (selectedSemester === "All Semesters") return undefined;
    const found = dbSemesters.find((s) => s.name === selectedSemester);
    return found ? found.id : undefined;
  }, [dbSemesters, selectedSemester]);

  const refreshRoutine = useCallback(async (silent = false) => {
    if (selectedDeptId === undefined) return;
    if (!silent) setIsLoadingRoutine(true);
    try {
      const res = await getRoutine({
        department_id: selectedDeptId,
        semester_id: selectedSemesterId,
      });
      if (res.success && Array.isArray(res.data)) {
        setLocalRoutineList(res.data);
      } else {
        setLocalRoutineList([]);
      }
    } catch (err) {
      console.error("Failed to refresh routine:", err);
      toast.error("Failed to refresh routine data");
    } finally {
      if (!silent) setIsLoadingRoutine(false);
    }
  }, [selectedDeptId, selectedSemesterId]);

  const handleUndo = useCallback(async () => {
    if (undoStack.length === 0 || isProcessingHistory || isRoutineLocked) return;

    const action = undoStack[undoStack.length - 1];
    setIsProcessingHistory(true);
    const toastId = toast.loading(`Undoing: ${action.description}...`);

    try {
      let success = false;
      let errorMsg = "";

      if (action.type === "SWAP") {
        const res = await swapRoutineEntries(action.payload.id1, action.payload.id2);
        success = res.success;
        errorMsg = res.message || "Failed to undo swap";
      } else if (action.type === "UPDATE") {
        const res = await updateRoutineEntry(
          action.payload.id,
          action.payload.fromDayId,
          action.payload.fromSlotId
        );
        success = res.success;
        errorMsg = res.message || "Failed to undo move";
      } else if (action.type === "GENERATE") {
        const res = await rollbackRoutine({ department_id: action.payload.departmentId });
        success = res.success;
        errorMsg = res.message || "Failed to undo generation";
      }

      if (success) {
        toast.success(`Undone: ${action.description}`, { id: toastId });
        setUndoStack((prev) => prev.slice(0, -1));
        setRedoStack((prev) => [...prev, action]);
        await refreshRoutine();
      } else {
        toast.error(errorMsg, { id: toastId });
      }
    } catch (err) {
      console.error("Undo error:", err);
      toast.error("An error occurred while performing undo", { id: toastId });
    } finally {
      setIsProcessingHistory(false);
    }
  }, [undoStack, isProcessingHistory, isRoutineLocked, refreshRoutine]);

  const handleRedo = useCallback(async () => {
    if (redoStack.length === 0 || isProcessingHistory || isRoutineLocked) return;

    const action = redoStack[redoStack.length - 1];
    setIsProcessingHistory(true);
    const toastId = toast.loading(`Redoing: ${action.description}...`);

    try {
      let success = false;
      let errorMsg = "";

      if (action.type === "SWAP") {
        const res = await swapRoutineEntries(action.payload.id1, action.payload.id2);
        success = res.success;
        errorMsg = res.message || "Failed to redo swap";
      } else if (action.type === "UPDATE") {
        const res = await updateRoutineEntry(
          action.payload.id,
          action.payload.toDayId,
          action.payload.toSlotId
        );
        success = res.success;
        errorMsg = res.message || "Failed to redo move";
      } else if (action.type === "GENERATE") {
        const res = await generateRoutine({
          department_id: action.payload.departmentId,
          semester_id: action.payload.semesterId,
          ignore_warnings: action.payload.ignoreWarnings,
        });
        success = res.success;
        errorMsg = res.message || "Failed to redo generation";
      }

      if (success) {
        toast.success(`Redone: ${action.description}`, { id: toastId });
        setRedoStack((prev) => prev.slice(0, -1));
        setUndoStack((prev) => [...prev, action]);
        await refreshRoutine();
      } else {
        toast.error(errorMsg, { id: toastId });
      }
    } catch (err) {
      console.error("Redo error:", err);
      toast.error("An error occurred while performing redo", { id: toastId });
    } finally {
      setIsProcessingHistory(false);
    }
  }, [redoStack, isProcessingHistory, isRoutineLocked, refreshRoutine]);

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

  useEffect(() => {
    if (selectedDeptId === undefined) return;

    if (isFirstFetchRef.current) {
      isFirstFetchRef.current = false;
      const hasPreloadedDataForDept = routineList.length > 0 && routineList.every(
        (item) => item.department_name === selectedDept
      );
      if (hasPreloadedDataForDept) {
        return;
      }
    }

    const fetchUpdatedRoutine = async () => {
      setIsLoadingRoutine(true);
      try {
        const res = await getRoutine({
          department_id: selectedDeptId,
          semester_id: selectedSemesterId,
        });
        if (res.success && Array.isArray(res.data)) {
          setLocalRoutineList(res.data);
        } else {
          setLocalRoutineList([]);
        }
      } catch (err) {
        console.error("Failed to fetch routine:", err);
      } finally {
        setIsLoadingRoutine(false);
      }
    };

    fetchUpdatedRoutine();
  }, [selectedDeptId, selectedSemesterId]);

  const handleConfirmGenerate = useCallback(async () => {
    if (isRoutineLocked) return;
    if (generateModal.departmentId === undefined) {
      toast.error("Please select a valid department to generate routine.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateRoutine({
        department_id: generateModal.departmentId,
        semester_id: generateModal.semesterId,
        ignore_warnings: generateModal.ignoreWarnings,
      });

      if (result.success) {
        dispatch(resetAll());
        toast.success("Routine generated successfully!");

        setGenerateResultModal({
          isOpen: true,
          success: true,
          data: result.data || null,
          errorMsg: null
        });

        setUndoStack((prev) => [
          ...prev,
          {
            type: "GENERATE",
            payload: {
              departmentId: generateModal.departmentId as number,
              semesterId: generateModal.semesterId,
              ignoreWarnings: generateModal.ignoreWarnings,
            },
            description: `Generated routine for department`,
          },
        ]);
        setRedoStack([]);

        const targetDept = dbDepartments.find((d) => d.id === generateModal.departmentId);
        if (targetDept) {
          setSelectedDept(targetDept.name);
        }

        if (generateModal.semesterId === undefined) {
          setSelectedSemester("All Semesters");
        } else {
          const targetSem = dbSemesters.find((s) => s.id === generateModal.semesterId);
          if (targetSem) {
            setSelectedSemester(targetSem.name);
          }
        }

        const res = await getRoutine({
          department_id: generateModal.departmentId,
          semester_id: generateModal.semesterId,
        });
        if (res.success && Array.isArray(res.data)) {
          setLocalRoutineList(res.data);
        }

        setGenerateModal((prev) => ({ ...prev, isOpen: false }));
        router.refresh();
      } else {
        toast.error(result.message || "Failed to generate routine");
        setGenerateResultModal({
          isOpen: true,
          success: false,
          data: result.data || null,
          errorMsg: result.message || "Failed to generate routine"
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
      setGenerateResultModal({
        isOpen: true,
        success: false,
        data: null,
        errorMsg: "An unexpected error occurred. Please check console logs."
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isRoutineLocked, generateModal, dispatch, dbDepartments, dbSemesters, router]);


  const initiateLockAction = () => {
    if (isRoutineLocked) {
      setLockConfirmModal({ isOpen: true, type: "unlock" });
      setLockConfirmInput("");
    } else {
      setLockConfirmModal({ isOpen: true, type: "lock" });
      setLockConfirmInput("");
    }
  };

  const handleConfirmLockAction = useCallback(() => {
    const type = lockConfirmModal.type;
    const input = lockConfirmInput.trim();

    if (type === "lock" && input === "lock") {
      dispatch(setIsLocked(true));
      toast.success("Routine locked. Generation is now disabled.");
      setLockConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } else if (type === "unlock" && input === "unlock") {
      dispatch(setIsLocked(false));
      toast.success("Routine unlocked. Generation enabled.");
      setLockConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  }, [lockConfirmModal.type, lockConfirmInput, dispatch]);

  const handleCellClick = useCallback(
    (data: { course: string; teacher: string; reason: string }) => {
      viewReasonDialogRef.current?.open(data);
    },
    []
  );

  const handleCancelClass = useCallback((session: any) => {
    setPendingCancellation({
      id: session.id,
      courseName: session.course,
      teacherId: session.teacherId || session.teacher,
      startTimeRaw: session.originalTime || "",
      department: session.department,
      semester: session.semester,
      day: session.day,
    });
    setCancellationMode("cancel");
    setIsReasonModalOpen(true);
  }, []);

  const handleUpdateCancelMessage = useCallback((session: any) => {
    setPendingCancellation({
      id: session.id,
      courseName: session.course,
      teacherId: session.teacherId || session.teacher,
      startTimeRaw: session.originalTime || "",
      department: session.department,
      semester: session.semester,
      day: session.day,
      initialReason: session.cancel_message || "",
    });
    setCancellationMode("update");
    setIsReasonModalOpen(true);
  }, []);

  const handleReactivateClass = useCallback(async (session: any) => {
    await handleReactivate(session);
  }, [handleReactivate]);


  const currentRoutineSchedule = useMemo(() => {
    const isTeacherFiltered = selectedTeacher !== "All Teachers";
    const isAllSemesters = selectedSemester === "All Semesters";

    const scheduleRows: {
      day: string;
      semester: string;
      slots: (ClassSession[] | null)[];
    }[] = [];

    const slotStartTimes = sortedTimeSlots.map((ts) => normalizeTime(ts.start_time));
    const uniqueCourses = new Set<string>();

    if (isTeacherFiltered) {
      // Teacher mode: 1 row per day (with no semester column)
      DAYS_ORDER.forEach((day) => {
        // Get all classes of this teacher on this day
        const teacherClasses = localRoutineList.filter((item) => {
          if (!selectedDept) return false;
          const matchDept = item.department_name === selectedDept;
          const matchDay = item.day_name === day;
          const matchTeacher = item.teacher_name === selectedTeacher;
          return matchDept && matchDay && matchTeacher;
        });

        if (teacherClasses.length === 0) return; // Hide day if teacher has no classes

        const rowSlots = Array(sortedTimeSlots.length).fill(
          null
        ) as (ClassSession[] | null)[];

        teacherClasses.forEach((item) => {
          const normalizedApiTime = normalizeTime(item.start_time);
          const slotIndex = slotStartTimes.indexOf(normalizedApiTime);

          if (slotIndex !== -1) {
            const session: ClassSession = {
              id: item.id,
              dayId: typeof item.day === 'string' ? parseInt(item.day, 10) : item.day,
              course: item.course_code,
              teacher: item.teacher_name,
              room: item.room_number,
              teacherId: item.teacher_name,
              originalTime: item.start_time,
              department: item.department_name,
              semester: item.semester_name,
              day: item.day_name,
              is_cancelled: Boolean(item.is_cancelled),
              cancel_message: item.cancel_message || null,
              group_name: item.group_name || null,
              course_type: item.course_type,
            };
            if (rowSlots[slotIndex] === null) {
              rowSlots[slotIndex] = [session];
            } else {
              rowSlots[slotIndex]!.push(session);
            }
            uniqueCourses.add(item.course_code);
          }
        });

        scheduleRows.push({
          day,
          semester: "",
          slots: rowSlots,
        });
      });
    } else {
      // Normal mode: 1 row per semester under day
      const targetSemesters = isAllSemesters
        ? semesters.filter((s) => s !== "All Semesters")
        : [selectedSemester];

      DAYS_ORDER.forEach((day) => {
        // Check if this day has any classes scheduled for the selected department
        const dayHasAnyClasses = localRoutineList.some((item) => {
          if (!selectedDept) return false;
          return item.department_name === selectedDept && item.day_name === day;
        });

        targetSemesters.forEach((sem) => {
          const rowSlots = Array(sortedTimeSlots.length).fill(
            null
          ) as (ClassSession[] | null)[];

          const itemsForCell = localRoutineList.filter((item) => {
            if (!selectedDept) return false;

            const matchDept = item.department_name === selectedDept;
            const matchSem = item.semester_name === sem;
            const matchDay = item.day_name === day;

            return matchDept && matchSem && matchDay;
          });

          let hasContent = false;

          itemsForCell.forEach((item) => {
            const normalizedApiTime = normalizeTime(item.start_time);
            const slotIndex = slotStartTimes.indexOf(normalizedApiTime);

            if (slotIndex !== -1) {
              const session: ClassSession = {
                id: item.id,
                dayId: typeof item.day === 'string' ? parseInt(item.day, 10) : item.day,
                course: item.course_code,
                teacher: item.teacher_name,
                room: item.room_number,
                teacherId: item.teacher_name,
                originalTime: item.start_time,
                department: item.department_name,
                semester: item.semester_name,
                day: item.day_name,
                is_cancelled: Boolean(item.is_cancelled),
                cancel_message: item.cancel_message || null,
                group_name: item.group_name || null,
                course_type: item.course_type,
              };
              if (rowSlots[slotIndex] === null) {
                rowSlots[slotIndex] = [session];
              } else {
                rowSlots[slotIndex]!.push(session);
              }
              uniqueCourses.add(item.course_code);
              hasContent = true;
            }
          });

          const shouldPush = isAllSemesters ? dayHasAnyClasses : hasContent;

          if (shouldPush) {
            scheduleRows.push({
              day,
              semester: sem,
              slots: rowSlots,
            });
          }
        });
      });
    }

    const totalCredits = uniqueCourses.size * 3;

    return {
      label: selectedDept || "Select Department",
      subLabel: isTeacherFiltered
        ? `${selectedTeacher}'s Routine`
        : selectedSemester === "All Semesters"
          ? "All Semesters"
          : `${selectedSemester} Semester`,
      totalCredits: totalCredits,
      schedule: scheduleRows,
      isEmpty: scheduleRows.length === 0,
      isAllSemestersMode: !isTeacherFiltered && isAllSemesters,
    };
  }, [localRoutineList, selectedDept, selectedSemester, semesters, sortedTimeSlots, selectedTeacher]);

  const printHeader = useMemo(() => (
    <div className="hidden print:flex flex-col print:mt-0 bg-white items-center justify-center pt-0 text-center w-full font-serif text-black">
      <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
        Department of {currentRoutineSchedule.label}
        {currentRoutineSchedule.isAllSemestersMode && " (All Routine)"}
      </h1>
      {(!currentRoutineSchedule.isAllSemestersMode || selectedTeacher !== "All Teachers") ? (
        <>
          <div className="border-2 border-black! border-double px-8 py-0.5 mb-3 print-header-border">
            <h2 className="text-base font-bold uppercase text-black tracking-wide">
              {selectedTeacher !== "All Teachers" ? `${selectedTeacher}'s Class Routine` : "Class Routine"}
            </h2>
          </div>
          <table className="w-full border-collapse border border-black mb-6 text-xs text-black font-serif print-header-table">
            <tbody>
              <tr>
                <td className="bg-gray-200 font-bold text-center w-[15%] py-1.5">Semester</td>
                <td className="bg-white font-bold text-center w-[35%] py-1.5">
                  {currentRoutineSchedule.subLabel.replace(" Semester", "")}
                </td>
                <td className="bg-gray-200 font-bold text-center w-[25%] py-1.5">Total Credit</td>
                <td className="bg-white font-bold text-center w-[25%] py-1.5">
                  {currentRoutineSchedule.totalCredits}
                </td>
              </tr>
              {selectedTeacher !== "All Teachers" && (
                <tr>
                  <td className="bg-gray-200 font-bold text-center w-[15%] py-1.5">Teacher</td>
                  <td colSpan={3} className="bg-white font-bold text-center py-1.5 font-sans">
                    {selectedTeacher}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <div className="mb-6" />
      )}
    </div>
  ), [currentRoutineSchedule, selectedTeacher]);

  const validTeacherShortNames = useMemo(() => {
    const uniqueShortNames = new Set<string>();
    localRoutineList.forEach((item) => {
      const short = getTeacherInitials(item.teacher_name).toLowerCase();
      if (short) uniqueShortNames.add(short);
    });
    return uniqueShortNames;
  }, [localRoutineList]);

  const isMatch = useMemo(() => {
    return (session: ClassSession | null) => {
      if (!session || !debouncedSearch) return false;

      const query = debouncedSearch.toLowerCase().trim();
      const sessionTeacherShortName = getTeacherInitials(
        session.teacher || ""
      ).toLowerCase();

      const isSearchingForTeacherShortName = validTeacherShortNames.has(query);

      if (isSearchingForTeacherShortName) {
        return sessionTeacherShortName === query;
      }

      const courseName = (session.course || "").toLowerCase();
      const teacherName = (session.teacher || "").toLowerCase();
      const roomName = (session.room || "").toLowerCase();

      return (
        courseName.includes(query) ||
        teacherName.includes(query) ||
        roomName.includes(query) ||
        sessionTeacherShortName === query
      );
    };
  }, [debouncedSearch, validTeacherShortNames]);

  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
            width: calc(100% - 2px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-bottom: 24px !important;
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
            font-size: 8px !important;
            font-weight: 600 !important;
            letter-spacing: 0.5px !important;
          }
          .print-sem-cell {
            font-size: 8px !important;
            width: 35px !important;
            min-width: 35px !important;
            max-width: 35px !important;
          }
          .print-cancelled-label {
            color: #ef4444 !important;
          }
        }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen font-lexend w-full max-w-[1600px] mx-auto bg-background text-foreground p-5 overflow-x-hidden print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white print:text-black print:overflow-visible"
      >
        <div className="space-y-8 print:space-y-0 print:w-full">
          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 print:hidden">
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
                Department of {currentRoutineSchedule.label}
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
              { }
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

              <Button
                onClick={handleUndo}
                disabled={undoStack.length === 0 || isProcessingHistory || isRoutineLocked}
                variant="outline"
                className="gap-2 border-primary/20"
                title={undoStack.length > 0 ? `Undo: ${undoStack[undoStack.length - 1].description}` : "Undo"}
              >
                <Undo2 className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Undo</span>
              </Button>

              <Button
                onClick={handleRedo}
                disabled={redoStack.length === 0 || isProcessingHistory || isRoutineLocked}
                variant="outline"
                className="gap-2 border-primary/20"
                title={redoStack.length > 0 ? `Redo: ${redoStack[redoStack.length - 1].description}` : "Redo"}
              >
                <Redo2 className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Redo</span>
              </Button>

              {!isRoutineLocked && (
                <Button
                  onClick={openGenerateModal}
                  disabled={isGenerating}
                  className="gap-2 bg-primary/90 hover:bg-primary w-fit"
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
                onClick={() => setDataManagementOpen(true)}
                variant="outline"
                className="gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/60 hidden md:flex"
                title="Excel Export / Import / Sync"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden lg:inline">Data Tools</span>
              </Button>

              <Button
                onClick={() => window.print()}
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hidden md:flex"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
            </motion.div>
          </div>

          { }
          <div className="flex flex-wrap items-center mb-5 gap-4 print:hidden">
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 bg-card border rounded-xl p-1.5 shadow-sm w-full lg:w-fit"
            >
              { }
              <div className="flex-1 min-w-[220px]">
                <CustomSelect
                  value={selectedDept}
                  onChange={setSelectedDept}
                  options={departments.map((dept) => ({ value: dept, label: dept }))}
                  placeholder="Select Department"
                />
              </div>

              {/* Semester select filter */}
              <div className="flex-1 min-w-[150px]">
                <CustomSelect
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  options={semesters.map((sem) => ({
                    value: sem,
                    label: sem === "All Semesters" ? "All Semesters" : `${sem} Semester`
                  }))}
                  placeholder="Select Semester"
                />
              </div>

              {/* Teacher select filter */}
              <div className="flex-1 min-w-[180px]">
                <CustomSelect
                  value={selectedTeacher}
                  onChange={setSelectedTeacher}
                  options={teachersList.map((t) => ({ value: t, label: t }))}
                  placeholder="Select Teacher"
                />
              </div>

              { }
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border border-transparent transition-all flex-1 min-w-[150px] justify-center sm:justify-start">
                <div>
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 leading-none whitespace-nowrap">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                    Total Credits
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {currentRoutineSchedule.totalCredits}
                  </span>
                </div>
              </div>
            </motion.div>

            { }
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

            <AnimatePresence>
              {isFilterDirty && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="gap-2 text-muted-foreground hover:text-foreground text-xs font-semibold px-4 h-12 rounded-xl border border-dashed border-border hover:border-muted-foreground/30 w-full sm:w-auto transition-all"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          { }
          {isLoadingRoutine ? (
            <div className="skeleton-sweep rounded-xl overflow-hidden bg-card/35 font-lexend w-full grid grid-cols-1">
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[1000px] border border-border border-collapse text-sm">
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      {/* Time/Day corner cell */}
                      <TableCell className="p-0 w-[90px] min-w-[90px] h-[60px] border-r border-border relative bg-muted/40">
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          preserveAspectRatio="none"
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="100%"
                            y2="100%"
                            className="stroke-border"
                            strokeWidth="1"
                          />
                        </svg>
                        <span className="absolute top-2 right-2 text-[10px] font-bold text-muted-foreground/45">
                          Time
                        </span>
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold text-muted-foreground/45">
                          Day
                        </span>
                      </TableCell>

                      {currentRoutineSchedule.isAllSemestersMode && (
                        <TableCell className="w-20 min-w-20 text-center font-bold bg-muted/40 border-r border-border text-xs uppercase">
                          <Skeleton className="w-10 h-3.5 mx-auto" />
                        </TableCell>
                      )}

                      {sortedTimeSlots.map((slot) => {
                        const isBreak = isBreakSlot(slot);
                        if (isBreak) {
                          return (
                            <TableCell
                              key={slot.id}
                              className="w-10 min-w-10 bg-muted/5 text-center align-middle p-0 border-r border-border"
                            >
                              <div className="h-full flex items-center justify-center" />
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell
                            key={slot.id}
                            className="text-center align-middle h-[50px] border-r border-border last:border-r-0 p-0 min-w-[100px] bg-muted/5"
                          >
                            <div className="flex items-center justify-center w-full px-1">
                              <Skeleton className="w-16 h-3 mx-auto" />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {DAYS_ORDER.map((day, rowIndex) => (
                      <TableRow
                        key={day}
                        className="border-b border-border hover:bg-muted/5 h-[80px]"
                      >
                        {/* Day Label */}
                        <TableCell className="font-bold text-xs uppercase tracking-wider p-0 align-middle text-center bg-muted/10 border-r border-border w-[90px] min-w-[90px]">
                          <div className="flex items-center justify-center h-full w-full py-4">
                            <span>
                              {day.slice(0, 3).toUpperCase()}
                            </span>
                          </div>
                        </TableCell>

                        {currentRoutineSchedule.isAllSemestersMode && (
                          <TableCell className="font-bold text-xs text-center border-r border-border bg-muted/5">
                            <Skeleton className="w-8 h-3.5 mx-auto" />
                          </TableCell>
                        )}

                        {sortedTimeSlots.map((slot, cellIndex) => {
                          const isBreak = isBreakSlot(slot);
                          if (isBreak) {
                            return (
                              <TableCell
                                key={slot.id}
                                className="p-0 align-middle border-r border-border bg-muted/5"
                              >
                                <div className="h-full w-full flex items-center justify-center" />
                              </TableCell>
                            );
                          }

                          // Simulating random scheduled courses
                          const hasClass = (rowIndex + cellIndex) % 3 === 0;
                          return (
                            <TableCell
                              key={slot.id}
                              className="p-2 h-px align-middle border-r border-border last:border-r-0 min-w-[100px]"
                            >
                              {hasClass ? (
                                <div className="h-[55px] w-full rounded bg-muted/15 flex flex-col justify-center gap-2 p-2.5">
                                  <Skeleton className="h-2.5 w-14" />
                                  <Skeleton className="h-2 w-8" />
                                </div>
                              ) : null}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          ) : currentRoutineSchedule.isEmpty ? (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
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
              initial="hidden"
              animate="visible"
              className="rounded-xl font-lexend bg-card/50 shadow-sm overflow-hidden w-full grid grid-cols-1 print:rounded-none print:shadow-none print:bg-transparent print:overflow-visible"
            >
              <div className="overflow-x-auto w-full print:overflow-visible">
                { }
                <MemoizedRoutineTable
                  key={selectedTeacher}
                  schedule={currentRoutineSchedule.schedule}
                  timeSlots={sortedTimeSlots}
                  isMatch={isMatch}
                  isAllSemestersMode={currentRoutineSchedule.isAllSemestersMode}
                  classOffMap={classOffMap}
                  availabilityMap={availabilityMap}
                  onCellClick={handleCellClick}
                  generationVersion={generationVersion}
                  printHeader={printHeader}
                  refreshRoutine={refreshRoutine}
                  setLocalRoutineList={setLocalRoutineList}
                  isRoutineLocked={isRoutineLocked}
                  onCancelClass={handleCancelClass}
                  onReactivateClass={handleReactivateClass}
                  onUpdateCancelMessage={handleUpdateCancelMessage}
                  onHistoryAction={handleHistoryAction}
                  selectedTeacher={selectedTeacher}
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

      { }
      <ViewReasonDialog ref={viewReasonDialogRef} />

      {/* ── Data Management Dialog ── */}
      <DataManagementDialog
        isOpen={dataManagementOpen}
        onOpenChange={setDataManagementOpen}
        onSuccess={() => refreshRoutine(true)}
      />




      { }
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
                { }
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

                { }
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

                { }
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
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Generate Routine Modal */}
      <Dialog
        open={generateModal.isOpen}
        onOpenChange={(open) =>
          setGenerateModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[480px] p-0 overflow-visible border-0 bg-transparent shadow-none">
          <AnimatePresence mode="wait">
            {generateModal.isOpen && (
              <motion.div
                key="generate-routine-modal"
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-background border rounded-lg shadow-xl w-full flex flex-col overflow-visible border-primary/20"
              >
                <motion.div
                  variants={modalItemVariants}
                  className="p-6 pb-4 flex items-start gap-4 border-b bg-muted/20 border-border/65 rounded-t-lg"
                >
                  <div className="p-3 rounded-full shrink-0 bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-xl">
                      Generate Routine
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-snug text-muted-foreground/90">
                      Configure the parameters to generate a new class routine. Conflicting schedules will be resolved.
                    </DialogDescription>
                  </div>
                </motion.div>

                <div className="p-6 space-y-5 bg-card">


                  <motion.div variants={modalItemVariants} className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Target Department
                    </label>
                    <CustomSelect
                      value={generateModal.departmentId?.toString() ?? ""}
                      onChange={(val) =>
                        setGenerateModal((prev) => ({
                          ...prev,
                          departmentId: val ? parseInt(val, 10) : undefined,
                        }))
                      }
                      options={dbDepartments.map((dept) => ({
                        value: dept.id.toString(),
                        label: dept.name,
                      }))}
                      placeholder="Select Department"
                    />
                  </motion.div>

                  <motion.div variants={modalItemVariants} className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Target Semester
                    </label>
                    <CustomSelect
                      value={generateModal.semesterId?.toString() ?? "all"}
                      onChange={(val) =>
                        setGenerateModal((prev) => ({
                          ...prev,
                          semesterId: val === "all" ? undefined : parseInt(val, 10),
                        }))
                      }
                      options={[
                        { value: "all", label: "All Semesters" },
                        ...dbSemesters.map((sem) => ({
                          value: sem.id.toString(),
                          label: `${sem.name} Semester`,
                        })),
                      ]}
                      placeholder="All Semesters"
                    />
                  </motion.div>

                  <motion.div variants={modalItemVariants} className="flex items-center gap-2.5 pt-1">
                    <Checkbox
                      id="ignore-warnings-chk"
                      checked={generateModal.ignoreWarnings}
                      onCheckedChange={(checked) =>
                        setGenerateModal((prev) => ({
                          ...prev,
                          ignoreWarnings: checked as boolean,
                        }))
                      }
                    />
                    <label
                      htmlFor="ignore-warnings-chk"
                      className="text-sm font-medium text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors"
                    >
                      Ignore conflicts & warnings (Force generate)
                    </label>
                  </motion.div>
                </div>

                <motion.div
                  variants={modalItemVariants}
                  className="p-6 pt-2 bg-card flex justify-end gap-3 border-t border-border/50 rounded-b-lg"
                >
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setGenerateModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmGenerate}
                    disabled={isGenerating || !generateModal.departmentId}
                    className="gap-2 bg-primary/95 hover:bg-primary shadow-sm min-w-[110px]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <CancellationModal
        isOpen={isReasonModalOpen}
        onOpenChange={setIsReasonModalOpen}
        courseName={pendingCancellation?.courseName}
        onConfirm={submitCancellation}
        title={cancellationMode === "update" ? "Update Cancellation Message" : "Cancel Class"}
        confirmLabel={cancellationMode === "update" ? "Update Message" : "Confirm Cancellation"}
        initialReason={pendingCancellation?.initialReason}
      />

      {/* Generate Routine Result Modal */}
      <Dialog
        open={generateResultModal.isOpen}
        onOpenChange={(open) =>
          setGenerateResultModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl border bg-card text-card-foreground shadow-2xl font-lexend">
          {generateResultModal.isOpen && (
            <div className="space-y-6">
              <DialogHeader className="text-center flex flex-col items-center">
                <div className={cn(
                  "size-12 rounded-full flex items-center justify-center mb-3 animate-bounce",
                  generateResultModal.success 
                    ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/20" 
                    : "bg-red-500/10 text-red-500 dark:bg-red-950/20"
                )}>
                  {generateResultModal.success ? (
                    <CheckCircle2 className="size-7 stroke-[2.5]" />
                  ) : (
                    <AlertTriangle className="size-7 stroke-[2.5]" />
                  )}
                </div>
                <DialogTitle className="text-xl font-bold">
                  {generateResultModal.success ? "Routine Generated Successfully" : "Routine Generation Failed"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {generateResultModal.success 
                    ? "The automatic scheduler has successfully generated class slots." 
                    : "The scheduler encountered conflicts or resource constraints."}
                </DialogDescription>
              </DialogHeader>

              {/* Success Info Block */}
              {generateResultModal.success && generateResultModal.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/30 border rounded-xl p-3 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Required</span>
                      <span className="text-lg font-extrabold text-foreground mt-0.5">
                        {generateResultModal.data.total_classes_required ?? "-"}
                      </span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Successful</span>
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {generateResultModal.data.successful_classes ?? "-"}
                      </span>
                    </div>
                    <div className={cn(
                      "border rounded-xl p-3 flex flex-col justify-center",
                      (generateResultModal.data.dropped_classes ?? 0) > 0 
                        ? "bg-red-500/5 border-red-500/20" 
                        : "bg-muted/30"
                    )}>
                      <span className={cn(
                        "text-[10px] uppercase font-bold tracking-wider",
                        (generateResultModal.data.dropped_classes ?? 0) > 0 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-muted-foreground"
                      )}>Dropped</span>
                      <span className={cn(
                        "text-lg font-extrabold mt-0.5",
                        (generateResultModal.data.dropped_classes ?? 0) > 0 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-foreground"
                      )}>
                        {generateResultModal.data.dropped_classes ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-xl border border-border/80">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Scheduler Message
                    </p>
                    <p className="text-sm font-medium text-foreground/90">
                      {generateResultModal.data.message || "No status message returned."}
                    </p>
                  </div>

                  {Array.isArray(generateResultModal.data.shortage_details) && generateResultModal.data.shortage_details.length > 0 && (
                    <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5" />
                        Shortage / Conflict Warnings
                      </p>
                      <ul className="text-xs text-amber-600 dark:text-amber-300 list-disc pl-4 space-y-1">
                        {generateResultModal.data.shortage_details.map((detail: any, idx: number) => (
                          <li key={idx}>
                            {typeof detail === "object" ? JSON.stringify(detail) : String(detail)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Error Info Block */}
              {!generateResultModal.success && (
                <div className="space-y-4">
                  <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-widest mb-1.5">
                      Error Message
                    </p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-300">
                      {generateResultModal.errorMsg || "An unknown error occurred during generation."}
                    </p>
                  </div>

                  {generateResultModal.data && Array.isArray(generateResultModal.data.shortage_details) && generateResultModal.data.shortage_details.length > 0 && (
                    <div className="border border-red-500/10 bg-red-500/5 p-4 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5" />
                        Details of Resource Shortages
                      </p>
                      <ul className="text-xs text-red-600 dark:text-red-300 list-disc pl-4 space-y-1">
                        {generateResultModal.data.shortage_details.map((detail: any, idx: number) => (
                          <li key={idx}>
                            {typeof detail === "object" ? JSON.stringify(detail) : String(detail)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setGenerateResultModal((prev) => ({ ...prev, isOpen: false }))}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 rounded-xl"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ViewReasonDialogRef {
  open: (data: { course: string; teacher: string; reason: string }) => void;
}

const ViewReasonDialog = React.forwardRef<ViewReasonDialogRef, {}>((props, ref) => {
  const [state, setState] = useState<{
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

  React.useImperativeHandle(ref, () => ({
    open: (data) => {
      setState({
        isOpen: true,
        ...data,
      });
    },
  }));

  return (
    <Dialog
      open={state.isOpen}
      onOpenChange={(open) =>
        setState((prev) => ({ ...prev, isOpen: open }))
      }
    >
      <DialogContent className="sm:max-w-[425px]">
        {state.isOpen && (
          <div className="flex flex-col gap-1">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <Info className="h-5 w-5" />
                <DialogTitle>Class Cancelled</DialogTitle>
              </div>
              <DialogDescription className="text-foreground text-base">
                <span className="font-semibold">
                  {state.course}
                </span>{" "}
                with{" "}
                <span className="font-semibold">
                  {state.teacher}
                </span>{" "}
                has been cancelled for today.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/50 p-4 rounded-md border mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                Teacher&apos;s Reason
              </p>
              <p className="text-sm italic text-foreground/90 whitespace-pre-wrap break-all">
                &quot;{state.reason}&quot;
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

ViewReasonDialog.displayName = "ViewReasonDialog";