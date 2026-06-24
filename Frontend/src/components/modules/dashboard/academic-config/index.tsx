/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useState, useEffect, startTransition, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Clock,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  CalendarClock,
  Loader2,
  ShieldBan,
  ChevronLeft,
  MapPin,
  BookOpen,
  Users,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  addNewDepartment,
  deleteDepartment,
  updateDepartment,
} from "@/services/departments";
import { Checkbox } from "@/components/ui/checkbox";
import {
  addSemester,
  deleteSemester,
  updateSemester,
} from "@/services/semesters";
import {
  createTimeSlot,
  deleteTimeSlot,
  updateTimeSlot,
} from "@/services/time-slots";
import {
  createRoom,
  updateRoom,
  deleteRoom,
} from "@/services/rooms";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";

type Department = { id: number; name: string };
type Semester = { id: number; name: string; order: number };
type TimeSlot = {
  id: number;
  start_time: string;
  end_time: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const isSlotBreak = (slot: TimeSlot) => {
  if (!slot) return false;

  return Boolean(slot.is_lunch_break);
};

const sortTimeSlotsHelper = (slots: TimeSlot[]): TimeSlot[] => {
  const getMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hStr, mStr] = timeStr.split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (h >= 1 && h <= 5) h += 12;
    return h * 60 + m;
  };
  return [...slots].sort((a, b) => getMinutes(a.start_time) - getMinutes(b.start_time));
};

type Room = {
  id: number;
  room_number: string;
  capacity: number;
  room_type: number;
  department: number | null;
  department_name: string | null;
};

type Course = {
  id: number;
  course_code: string;
  course_name: string;
  room_number: string;
  credits: number;
  course_type: string;
  course_type_name?: string | null;
  teacher: number | null;
  teacher_name: string | null;
  department: number;
  department_name: string | null;
  semester: number;
  semester_name: string | null;
};

type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name: string;
  role: string;
  department?: number | string | null;
  department_name: string | null;
  semester?: number | string | null;
  semester_name: string | null;
};

interface AcademicSettingsPageProps {
  departments: Department[];
  semesters: Semester[];
  timeSlots: TimeSlot[];
  rooms: Room[];
  courses: Course[];
  users: User[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.2 },
  },
};

const formContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
      delayChildren: 0.1,
    },
  },
};

const formItemVariants: Variants = {
  hidden: {
    y: 15,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const TimePicker = ({ label, value, onChange }: TimePickerProps) => {
  const [hStr, mStr] = (value || "09:00").split(":");
  let h = parseInt(hStr);
  const m = mStr || "00";
  const initialPeriod = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  const [hour, setHour] = useState(h.toString());
  const [minute, setMinute] = useState(m);
  const [period, setPeriod] = useState<"AM" | "PM">(initialPeriod);

  const updateTime = (newH: string, newM: string, newP: string) => {
    let hourInt = parseInt(newH);
    if (newP === "PM" && hourInt !== 12) hourInt += 12;
    if (newP === "AM" && hourInt === 12) hourInt = 0;
    const formattedH = hourInt.toString().padStart(2, "0");
    onChange(`${formattedH}:${newM}:00`);
  };

  const handleHourChange = (val: string) => {
    setHour(val);
    updateTime(val, minute, period);
  };
  const handleMinuteChange = (val: string) => {
    setMinute(val);
    updateTime(hour, val, period);
  };
  const handlePeriodChange = (val: "AM" | "PM") => {
    setPeriod(val);
    updateTime(hour, minute, val);
  };

  return (
    <motion.div variants={formItemVariants} className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={hour} onValueChange={handleHourChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <SelectItem key={h} value={h.toString()}>
                {h.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground font-bold hidden sm:inline">
          :
        </span>
        <Select value={minute} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
              <SelectItem key={m} value={m.toString().padStart(2, "0")}>
                {m.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};


const SLOT_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
];

export default function AcademicSettingsPage({
  departments: initialDepartments,
  semesters: initialSemesters,
  timeSlots: initialTimeSlots,
  rooms: initialRooms,
  courses = [],
  users = [],
}: AcademicSettingsPageProps) {
  const user = useSelector((state: RootState) => state.auth);



  const router = useRouter();


  const [departmentsList, setDepartmentsList] =
    useState<Department[]>(initialDepartments);

  const departmentsDependency = useMemo(
    () => JSON.stringify(initialDepartments),
    [initialDepartments]
  );

  useEffect(() => {
    setDepartmentsList(initialDepartments);
  }, [departmentsDependency, initialDepartments]);


  const [semestersList, setSemestersList] =
    useState<Semester[]>(initialSemesters);

  const semestersDependency = useMemo(
    () => JSON.stringify(initialSemesters),
    [initialSemesters]
  );

  useEffect(() => {
    setSemestersList(initialSemesters);
  }, [semestersDependency, initialSemesters]);


  const [timeSlotsList, setTimeSlotsList] =
    useState<TimeSlot[]>(() => sortTimeSlotsHelper(initialTimeSlots));

  const timeSlotsDependency = useMemo(
    () => JSON.stringify(initialTimeSlots),
    [initialTimeSlots]
  );

  useEffect(() => {
    setTimeSlotsList(sortTimeSlotsHelper(initialTimeSlots));
  }, [timeSlotsDependency, initialTimeSlots]);

  const [roomsList, setRoomsList] = useState<Room[]>(initialRooms);

  const roomsDependency = useMemo(
    () => JSON.stringify(initialRooms),
    [initialRooms]
  );

  useEffect(() => {
    setRoomsList(initialRooms);
  }, [roomsDependency, initialRooms]);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSemModalOpen, setIsDeleteSemModalOpen] = useState(false);
  const [isDeleteSlotModalOpen, setIsDeleteSlotModalOpen] = useState(false);
  const [isDeleteRoomModalOpen, setIsDeleteRoomModalOpen] = useState(false);



  const [roomDeptFilter, setRoomDeptFilter] = useState("All");
  const [roomTypeFilter, setRoomTypeFilter] = useState("All");

  const filteredRooms = useMemo(() => {
    return roomsList.filter((room: Room) => {
      const matchDept =
        roomDeptFilter === "All" ||
        (room.department !== null && String(room.department) === roomDeptFilter);
      const matchType =
        roomTypeFilter === "All" ||
        String(room.room_type) === roomTypeFilter;
      return matchDept && matchType;
    });
  }, [roomsList, roomDeptFilter, roomTypeFilter]);

  const roomsDepartments = useMemo(() => {
    const referencedDeptIds = new Set(
      roomsList
        .map((r: Room) => r.department)
        .filter((deptId): deptId is number => deptId !== null)
    );
    return departmentsList.filter((dept: Department) => referencedDeptIds.has(dept.id));
  }, [departmentsList, roomsList]);


  const [isLoading, setIsLoading] = useState(false);

  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingDeptId, setDeletingDeptId] = useState<number | null>(null);
  const [deletingSemId, setDeletingSemId] = useState<number | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  const [newDeptName, setNewDeptName] = useState("");
  const [newSemName, setNewSemName] = useState("");
  const [newSemOrder, setNewSemOrder] = useState("");
  const [newSlotStart, setNewSlotStart] = useState("09:00:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:00:00");
  const [newSlotIsLaunchBreak, setNewSlotIsLaunchBreak] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("");
  const [newRoomType, setNewRoomType] = useState("1");
  const [newRoomDept, setNewRoomDept] = useState("");

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    if (hour >= 1 && hour <= 5) {
      hour += 12;
    }
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${suffix}`;
  };


  const openAddDept = () => {
    setEditingDept(null);
    setNewDeptName("");
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setNewDeptName(dept.name);
    setIsDeptModalOpen(true);
  };

  const openDeleteDept = (id: number) => {
    setDeletingDeptId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    if (!newDeptName.trim()) {
      toast.error("Department name cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      let res;
      if (editingDept) {
        setDepartmentsList((prev) =>
          prev.map((d) =>
            d.id === editingDept.id ? { ...d, name: newDeptName } : d
          )
        );
        res = await updateDepartment(editingDept.id, { name: newDeptName });
      } else {
        res = await addNewDepartment({ name: newDeptName });
      }

      if (res.success) {
        toast.success(
          editingDept
            ? `Department updated to "${newDeptName}"`
            : `Department "${newDeptName}" added successfully`
        );
        setIsDeptModalOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setDepartmentsList(initialDepartments);
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDeptId) return;

    setIsLoading(true);
    const previousList = [...departmentsList];
    setDepartmentsList((prev) => prev.filter((d) => d.id !== deletingDeptId));

    try {
      const res = await deleteDepartment(deletingDeptId);

      if (res.success) {
        toast.success("Department deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingDeptId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setDepartmentsList(previousList);
        toast.error(res.message || "Failed to delete department");
      }
    } catch (err) {
      setDepartmentsList(previousList);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsLoading(false);
    }
  };


  const openAddSem = () => {
    setEditingSem(null);
    setNewSemName("");
    setNewSemOrder("");
    setIsSemModalOpen(true);
  };

  const openEditSem = (sem: Semester) => {
    setEditingSem(sem);
    setNewSemName(sem.name);
    setNewSemOrder(sem.order.toString());
    setIsSemModalOpen(true);
  };

  const openDeleteSem = (id: number) => {
    setDeletingSemId(id);
    setIsDeleteSemModalOpen(true);
  };

  const handleSaveSemester = async () => {
    if (!newSemName.trim() || !newSemOrder.trim()) {
      toast.error("Name and Order are required");
      return;
    }

    const orderInt = parseInt(newSemOrder);
    if (isNaN(orderInt)) {
      toast.error("Order must be a number");
      return;
    }

    setIsLoading(true);

    try {
      let res;
      if (editingSem) {
        setSemestersList((prev) =>
          prev.map((s) =>
            s.id === editingSem.id
              ? { ...s, name: newSemName, order: orderInt }
              : s
          )
        );
        res = await updateSemester(editingSem.id, {
          name: newSemName,
          order: orderInt,
        });
      } else {
        res = await addSemester({
          name: newSemName,
          order: orderInt,
        });
      }

      if (res.success) {
        toast.success(
          editingSem
            ? `Semester updated to "${newSemName}"`
            : `Semester "${newSemName}" added successfully`
        );
        setIsSemModalOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setSemestersList(initialSemesters);
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSemester = async () => {
    if (!deletingSemId) return;

    setIsLoading(true);
    const previousList = [...semestersList];
    setSemestersList((prev) => prev.filter((s) => s.id !== deletingSemId));

    try {
      const res = await deleteSemester(deletingSemId);

      if (res.success) {
        toast.success("Semester deleted successfully");
        setIsDeleteSemModalOpen(false);
        setDeletingSemId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setSemestersList(previousList);
        toast.error(res.message || "Failed to delete semester");
      }
    } catch (err) {
      setSemestersList(previousList);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsLoading(false);
    }
  };


  const openAddSlot = () => {
    setEditingSlot(null);
    setNewSlotStart("09:00:00");
    setNewSlotEnd("10:00:00");
    setNewSlotIsLaunchBreak(false);
    setIsSlotModalOpen(true);
  };

  const openEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setNewSlotStart(slot.start_time);
    setNewSlotEnd(slot.end_time);
    setNewSlotIsLaunchBreak(Boolean(slot.is_lunch_break));
    setIsSlotModalOpen(true);
  };

  const openDeleteSlot = (id: number) => {
    setDeletingSlotId(id);
    setIsDeleteSlotModalOpen(true);
  };

  const handleSaveTimeSlot = async () => {
    if (!newSlotStart || !newSlotEnd) {
      toast.error("Start and End times are required");
      return;
    }

    setIsLoading(true);

    try {
      let res;
      const finalStart = newSlotStart;
      const finalEnd = newSlotEnd;

      const payload = {
        start_time: finalStart,
        end_time: finalEnd,
        is_lunch_break: newSlotIsLaunchBreak,
      };
      if (editingSlot) {

        setTimeSlotsList((prev) =>
          sortTimeSlotsHelper(
            prev.map((slot) =>
              slot.id === editingSlot.id
                ? {
                  ...slot,
                  start_time: finalStart,
                  end_time: finalEnd,
                  is_lunch_break: newSlotIsLaunchBreak,
                }
                : slot
            )
          )
        );
        res = await updateTimeSlot(editingSlot.id.toString(), payload);
      } else {
        res = await createTimeSlot(payload);
      }

      if (res.success) {
        toast.success(
          editingSlot
            ? `Time slot updated successfully`
            : `Time slot added successfully`
        );
        setIsSlotModalOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setTimeSlotsList(sortTimeSlotsHelper(initialTimeSlots));
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTimeSlot = async () => {
    if (!deletingSlotId) return;

    setIsLoading(true);
    const previousList = [...timeSlotsList];
    setTimeSlotsList((prev) => prev.filter((s) => s.id !== deletingSlotId));

    try {
      const res = await deleteTimeSlot(deletingSlotId.toString());

      if (res.success) {
        toast.success("Time slot deleted successfully");
        setIsDeleteSlotModalOpen(false);
        setDeletingSlotId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setTimeSlotsList(sortTimeSlotsHelper(previousList));
        toast.error(res.message || "Failed to delete time slot");
      }
    } catch (err) {
      setTimeSlotsList(previousList);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setNewRoomNumber("");
    setNewRoomCapacity("");
    setNewRoomType("1");
    setNewRoomDept("");
    setIsRoomModalOpen(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setNewRoomNumber(room.room_number);
    setNewRoomCapacity(room.capacity.toString());
    setNewRoomType(room.room_type.toString());
    setNewRoomDept(room.department ? room.department.toString() : "");
    setIsRoomModalOpen(true);
  };

  const openDeleteRoom = (id: number) => {
    setDeletingRoomId(id);
    setIsDeleteRoomModalOpen(true);
  };

  const handleSaveRoom = async () => {
    if (!newRoomNumber.trim() || !newRoomCapacity.trim()) {
      toast.error("Room number and capacity are required");
      return;
    }

    const capacityInt = parseInt(newRoomCapacity);
    if (isNaN(capacityInt)) {
      toast.error("Capacity must be a number");
      return;
    }

    setIsLoading(true);

    try {
      let res;
      const payload: Record<string, any> = {
        room_number: newRoomNumber,
        capacity: capacityInt,
        room_type: parseInt(newRoomType),
      };

      if (newRoomDept.trim() && newRoomDept !== "none") {
        payload.department = parseInt(newRoomDept);
      } else {
        payload.department = null;
      }

      if (editingRoom) {
        setRoomsList((prev) =>
          prev.map((r) =>
            r.id === editingRoom.id
              ? {
                ...r,
                room_number: newRoomNumber,
                capacity: capacityInt,
                room_type: parseInt(newRoomType),
                department: payload.department,
                department_name: payload.department
                  ? departmentsList.find((d) => d.id === payload.department)?.name || null
                  : null,
              }
              : r
          )
        );
        res = await updateRoom(editingRoom.id, payload);
      } else {
        res = await createRoom(payload);
      }

      if (res.success) {
        toast.success(
          editingRoom ? "Room updated successfully" : "Room added successfully"
        );
        setIsRoomModalOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setRoomsList(initialRooms);
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoomId) return;

    setIsLoading(true);
    const previousList = [...roomsList];
    setRoomsList((prev) => prev.filter((r) => r.id !== deletingRoomId));

    try {
      const res = await deleteRoom(deletingRoomId);

      if (res.success) {
        toast.success("Room deleted successfully");
        setIsDeleteRoomModalOpen(false);
        setDeletingRoomId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setRoomsList(previousList);
        toast.error(res.message || "Failed to delete room");
      }
    } catch (err) {
      setRoomsList(previousList);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsLoading(false);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (user?.role !== "admin") {
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8 font-lexend text-foreground pb-20"
      >
        { }
        <div className="flex flex-col gap-2">
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
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            Academic Settings
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground">
            Manage departments, semesters, and class time slots for the routine
            system.
          </motion.p>
        </div>

        { }
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Departments</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={openAddDept}
            >
              <Plus className="w-4 h-4" /> Add Dept
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {departmentsList.map((dept) => (
                <motion.div
                  key={dept.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card
                    className="group hover:shadow-md transition-all h-full cursor-pointer hover:border-primary/50 hover:bg-muted/5 select-none min-w-0"
                    onClick={() => {
                      router.push(`/dashboard/admin/academic-config/${dept.id}`);
                    }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        ID: {dept.id}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0 border border-border/60 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDept(dept);
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                             className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                             onClick={(e) => {
                               e.stopPropagation();
                               openDeleteDept(dept.id);
                             }}
                           >
                             <Trash2 className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" /> Delete
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold leading-snug">
                        {dept.name}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="w-full h-px bg-border/50" />

        { }
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Semesters</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-primary/20"
              onClick={openAddSem}
            >
              <Plus className="w-4 h-4" /> Add Sem
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {semestersList.map((sem) => (
                <motion.div
                  key={sem.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="flex flex-col items-center justify-center p-4 hover:bg-muted/50 transition-colors relative group h-full min-w-0">
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-6 w-6 p-0 border border-border/60 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditSem(sem)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                           <DropdownMenuItem
                             className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                             onClick={() => openDeleteSem(sem.id)}
                           >
                             <Trash2 className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" /> Delete
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-xs font-bold text-primary">
                      {sem.order}
                    </div>
                    <span className="font-bold text-lg text-center">
                      {sem.name}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Semester
                    </span>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="w-full h-px bg-border/50" />

        { }
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <CalendarClock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Time Slots</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-primary/20"
              onClick={openAddSlot}
            >
              <Plus className="w-4 h-4" /> Add Slot
            </Button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {timeSlotsList.map((slot) => (
                <motion.div
                  key={slot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="flex items-center justify-between p-3 dark:bg-[#111113] rounded-lg border hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                        <Badge
                          variant="outline"
                          className={`font-mono w-fit border ${SLOT_COLORS[(slot.id - 1) % SLOT_COLORS.length]}`}
                        >
                          Slot {slot.id}
                        </Badge>
                        <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                          {formatDisplayTime(slot.start_time)}{" "}
                          <span className="text-muted-foreground mx-1">-</span>{" "}
                          {formatDisplayTime(slot.end_time)}
                        </span>
                        {isSlotBreak(slot) && (
                          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-none text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 ml-2">
                            Break
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border border-border/60 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditSlot(slot)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                           <DropdownMenuItem
                             className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                             onClick={() => openDeleteSlot(slot.id)}
                           >
                             <Trash2 className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" /> Delete
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="w-full h-px bg-border/50" />

        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Rooms</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-lexend">
              {/* Department Dropdown */}
              <div className="w-[160px]">
                <Select value={roomDeptFilter} onValueChange={setRoomDeptFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Departments</SelectItem>
                    {roomsDepartments.map((dept: Department) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Type Dropdown */}
              <div className="w-[120px]">
                <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="1">Theory</SelectItem>
                    <SelectItem value="2">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              {(roomDeptFilter !== "All" || roomTypeFilter !== "All") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRoomDeptFilter("All");
                    setRoomTypeFilter("All");
                  }}
                  className="gap-2 h-9 border-destructive/20 hover:border-destructive/40 text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer font-semibold text-xs transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-primary/20 h-9 shrink-0 ml-auto md:ml-0"
                onClick={openAddRoom}
              >
                <Plus className="w-4 h-4" /> Add Room
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredRooms.map((room) => (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="group hover:shadow-md transition-all h-full min-w-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Capacity: {room.capacity}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0 border border-border/60 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditRoom(room)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                            onClick={() => openDeleteRoom(room.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="text-lg font-bold leading-snug">
                        Room {room.room_number}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold tracking-wider border ${room.room_type === 2
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25"
                            : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25"
                            }`}
                        >
                          {room.room_type === 2 ? "Lab" : "Theory"}
                        </Badge>
                        {room.department_name && (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-semibold border border-border/80 whitespace-normal leading-tight text-left bg-muted/20 text-muted-foreground"
                          >
                            {room.department_name}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[85vh] overflow-y-auto">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle>
                {editingDept ? "Edit Department" : "Add Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDept
                  ? "Update existing department details."
                  : "Create a new academic department."}
              </DialogDescription>
            </DialogHeader>
            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 py-4"
            >
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  placeholder="e.g. Computer Science & Engineering"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                />
              </motion.div>
            </motion.div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                onClick={handleSaveDepartment}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingDept ? "Update Changes" : "Save Changes"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this department? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDepartment}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isSemModalOpen} onOpenChange={setIsSemModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>
                {editingSem ? "Edit Semester" : "Add Semester"}
              </DialogTitle>
              <DialogDescription>
                Define a new semester level.
              </DialogDescription>
            </DialogHeader>
            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 py-4"
            >
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="sem-name">Semester Name</Label>
                <Input
                  id="sem-name"
                  placeholder="e.g. 1st"
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                />
              </motion.div>
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="sem-order">Order Sequence</Label>
                <Input
                  id="sem-order"
                  type="number"
                  placeholder="e.g. 1"
                  value={newSemOrder}
                  onChange={(e) => setNewSemOrder(e.target.value)}
                />
              </motion.div>
            </motion.div>
            <DialogFooter>
              <Button onClick={handleSaveSemester} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSem ? "Update Changes" : "Save Changes"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      { }
      <Dialog
        open={isDeleteSemModalOpen}
        onOpenChange={setIsDeleteSemModalOpen}
      >
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>Confirm Semester Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this semester? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteSemModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSemester}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? "Edit Time Slot" : "Add Time Slot"}
              </DialogTitle>
              <DialogDescription>
                Configure the start and end time for a class period.
              </DialogDescription>
            </DialogHeader>
            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 py-4"
            >
              <TimePicker
                label="Start Time"
                value={newSlotStart}
                onChange={setNewSlotStart}
              />
              <TimePicker
                label="End Time"
                value={newSlotEnd}
                onChange={setNewSlotEnd}
              />
              <div className="flex items-center space-x-2 pt-2 border-t border-border/40">
                <Checkbox
                  id="is-launch-break"
                  checked={newSlotIsLaunchBreak}
                  onCheckedChange={(checked) => setNewSlotIsLaunchBreak(!!checked)}
                />
                <Label htmlFor="is-launch-break" className="text-sm font-medium leading-none cursor-pointer">
                  Is Lunch/Launch Break Slot
                </Label>
              </div>
            </motion.div>
            <div className="bg-muted/50 p-3 rounded-md text-center text-sm mb-4">
              <span className="text-muted-foreground">Preview: </span>
              <span className="font-bold text-foreground">
                {formatDisplayTime(newSlotStart)} -{" "}
                {formatDisplayTime(newSlotEnd)}
              </span>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveTimeSlot} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSlot ? "Update Changes" : "Save Changes"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      { }
      <Dialog
        open={isDeleteSlotModalOpen}
        onOpenChange={setIsDeleteSlotModalOpen}
      >
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>Confirm Time Slot Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this time slot? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteSlotModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTimeSlot}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
        <DialogContent className="compact-scrollbar sm:max-w-[425px] w-[95vw] max-h-[85vh] overflow-y-auto">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? "Edit Room" : "Add Room"}
              </DialogTitle>
              <DialogDescription>
                {editingRoom
                  ? "Update existing room details."
                  : "Create a new academic room."}
              </DialogDescription>
            </DialogHeader>
            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 py-4"
            >
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="room-number">Room Number</Label>
                <Input
                  id="room-number"
                  placeholder="e.g. 402 or Lab 1"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                />
              </motion.div>
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="room-capacity">Capacity</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  placeholder="e.g. 50"
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(e.target.value)}
                />
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div variants={formItemVariants} className="space-y-2">
                  <Label htmlFor="room-type">Room Type</Label>
                  <Select value={newRoomType} onValueChange={setNewRoomType}>
                    <SelectTrigger id="room-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Theory</SelectItem>
                      <SelectItem value="2">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div variants={formItemVariants} className="space-y-2">
                  <Label htmlFor="room-dept">Department</Label>
                  <Select value={newRoomDept} onValueChange={setNewRoomDept}>
                    <SelectTrigger id="room-dept" className="w-full">
                      <SelectValue placeholder="Select Department (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / General</SelectItem>
                      {departmentsList.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>
            </motion.div>
            <DialogFooter>
              <Button onClick={handleSaveRoom} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingRoom ? "Update Changes" : "Save Changes"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteRoomModalOpen} onOpenChange={setIsDeleteRoomModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle>Confirm Room Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this room? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteRoomModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRoom}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>


    </>
  );
}
