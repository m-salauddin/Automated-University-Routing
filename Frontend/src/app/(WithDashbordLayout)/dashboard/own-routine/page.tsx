"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { motion} from "framer-motion";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
} from "lucide-react";
import { useDispatch } from "react-redux";
import { setTeacherStatus } from "@/store/teacherAvailabilitySlice";
import DataLoader from "@/components/ui/data-loader";

const SLOT_TIMINGS: Record<number, string> = {
  0: "08:30 AM - 09:50 AM",
  1: "10:00 AM - 11:20 AM",
  2: "11:30 AM - 12:50 PM",
  3: "01:30 PM - 02:50 PM",
  4: "03:00 PM - 04:20 PM",
  5: "04:30 PM - 05:50 PM",
  6: "06:00 PM - 07:20 PM",
  7: "07:30 PM - 08:50 PM",
  8: "09:00 PM - 10:20 PM",
};

const getSlotTime = (index: number) => SLOT_TIMINGS[index] || "Unknown Time";

type APIRoutineItem = {
  day: string;
  semester: string;
  course: string;
  type: string;
  room: string;
  slot_index: number;
};

type APIResponse = {
  teacher_info: {
    id: string;
    initials: string;
    total_sessions: number;
    semesters_involved: string[];
  };
  schedule: APIRoutineItem[];
};

type RoutineRow = {
  id: number;
  day: string;
  time: string;
  course: string;
  type: string;
  room: string;
  semester: string;
  status: "on" | "off";
  teacherId: string;
};

// --- Animations Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 10 },
  },
};

const days = ["All", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OwnRoutinePage() {
  const { role, username } = { role: "teacher", username: "John Doe" };
  const dispatch = useDispatch();

  // --- State ---
  const [rows, setRows] = useState<RoutineRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacherInfo, setTeacherInfo] = useState<APIResponse['teacher_info'] | null>(null);

  const [day, setDay] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [roomFilter, setRoomFilter] = useState<string>("All");
  const [semesterFilter, setSemesterFilter] = useState<string>("All");

  const [visibleCols, setVisibleCols] = useState<
      Record<keyof Omit<RoutineRow, "id" | "teacherId">, boolean>
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
      useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
      useSensor(KeyboardSensor, {})
  );

  // --- Data Fetching ---
  useEffect(() => {
    const fetchRoutineData = async () => {
      setIsLoading(true);
      try {
        // Simulate API Delay for Demo
        await new Promise(resolve => setTimeout(resolve, 2000));

        const data: APIResponse = {
          "teacher_info": {
            "id": "101",
            "initials": "MKN",
            "total_sessions": 15,
            "semesters_involved": ["6th", "7th", "8th"]
          },
          "schedule": [
            { "day": "Sun", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B317L", "slot_index": 1 },
            { "day": "Sun", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B317L", "slot_index": 2 },
            { "day": "Mon", "semester": "6th", "course": "CSE 3603", "type": "Theory", "room": "B316", "slot_index": 2 },
            { "day": "Mon", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B318L", "slot_index": 6 },
            { "day": "Mon", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B318L", "slot_index": 7 },
            { "day": "Tue", "semester": "6th", "course": "CSE 3603", "type": "Theory", "room": "B322", "slot_index": 0 },
            { "day": "Tue", "semester": "6th", "course": "CSE 3603", "type": "Theory", "room": "B322", "slot_index": 1 },
            { "day": "Wed", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B317L", "slot_index": 2 },
            { "day": "Wed", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B317L", "slot_index": 3 },
            { "day": "Wed", "semester": "7th", "course": "CSE 4700", "type": "Lab", "room": "B318L", "slot_index": 6 },
            { "day": "Wed", "semester": "7th", "course": "CSE 4700", "type": "Lab", "room": "B318L", "slot_index": 7 },
            { "day": "Thu", "semester": "7th", "course": "CSE 4700", "type": "Lab", "room": "B318L", "slot_index": 3 },
            { "day": "Thu", "semester": "7th", "course": "CSE 4700", "type": "Lab", "room": "B318L", "slot_index": 4 },
            { "day": "Thu", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B318L", "slot_index": 6 },
            { "day": "Thu", "semester": "8th", "course": "CSE 4800", "type": "Lab", "room": "B318L", "slot_index": 7 }
          ]
        };

        setTeacherInfo(data.teacher_info);

        const mappedRows: RoutineRow[] = data.schedule.map((item, index) => ({
          id: index + 1,
          day: item.day,
          time: getSlotTime(item.slot_index),
          course: item.course,
          type: item.type || "Lecture",
          room: item.room,
          semester: item.semester,
          status: "on",
          teacherId: data.teacher_info.id,
        }));

        setRows(mappedRows);
      } catch (error) {
        console.error("Failed to fetch routine:", error);
        toast.error("Failed to load routine data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineData();
  }, []);

  // --- Helper Computations ---
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
      const matchDay = day === "All" || r.day === day;
      const matchType = typeFilter === "All" || r.type === typeFilter;
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchRoom = roomFilter === "All" || r.room === roomFilter;
      const matchSemester = semesterFilter === "All" || r.semester === semesterFilter;
      return matchDay && matchType && matchStatus && matchRoom && matchSemester;
    });
  }, [day, typeFilter, statusFilter, roomFilter, semesterFilter, rows]);

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

  const columnsOrder: (keyof Omit<RoutineRow, "id" | "teacherId">)[] = [
    "day",
    "time",
    "course",
    "type",
    "status",
    "room",
    "semester",
  ];

  function DragHandle({ attributes, listeners }: { attributes: React.HTMLAttributes<HTMLElement>; listeners: Record<string, unknown>; }) {
    return (
        <button type="button" {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted">
          <IconGripVertical className="size-4" />
        </button>
    );
  }

  function DraggableRow({ row }: { row: RoutineRow }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: row.id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      position: "relative",
      zIndex: isDragging ? 50 : "auto",
    };
    const setStatus = (status: "on" | "off") => {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
      try {
        dispatch(setTeacherStatus({ teacherId: row.teacherId, isOn: status === "on" }));
      } catch (error) {
        console.error("Failed to update teacher status:", error);
      }
      const isOff = status === "off";
      toast[isOff ? "warning" : "success"](`${row.course} is now ${isOff ? "OFF" : "ON"}`);
    };

    return (
        <TableRow ref={setNodeRef} style={style} className={cn("whitespace-nowrap transition-colors", isDragging && "opacity-70 bg-muted/50 shadow-lg ring-1 ring-primary/10")} data-teacher-id={row.teacherId}>
          <TableCell className="w-8 print:hidden p-3"><DragHandle attributes={attributes} listeners={listeners ?? {}} /></TableCell>
          {columnsOrder.map((key) => visibleCols[key] ? (
              <TableCell key={key} className={cn("p-3", key === "course" && "font-medium")}>
                {key === "type" ? <Badge variant={row.type === "Lab" ? "secondary" : "default"}>{row.type}</Badge> :
                    key === "status" ? <Badge variant={row.status === "on" ? "default" : "destructive"}>{row.status === "on" ? "On" : "Off"}</Badge> :
                        row[key]}
              </TableCell>
          ) : null)}
          <TableCell className="w-8 text-right print:hidden p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400 hover:text-red-400" onClick={() => setStatus(row.status === "on" ? "off" : "on")}>
                  <PowerOff className="size-4 text-red-400" />{row.status === "on" ? "Mark as Off" : "Mark as On"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
    );
  }

  // --- Filters ---
  const DaySelect = () => (
      <div className="space-y-1 w-full">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Day</span>
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className="w-full h-9 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>{days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>
  );
  const TypeSelect = () => (
      <div className="space-y-1 w-full">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><BookOpen className="w-3 h-3" /> Type</span>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full h-9 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Types</SelectItem><SelectItem value="Theory">Theory</SelectItem><SelectItem value="Lab">Lab</SelectItem></SelectContent>
        </Select>
      </div>
  );
  const StatusSelect = () => (
      <div className="space-y-1 w-full">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><SlidersHorizontal className="w-3 h-3" /> Status</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full h-9 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Status</SelectItem><SelectItem value="on">Active (On)</SelectItem><SelectItem value="off">Cancelled (Off)</SelectItem></SelectContent>
        </Select>
      </div>
  );
  const RoomSelect = () => (
      <div className="space-y-1 w-full">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" /> Room</span>
        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger className="w-full h-9 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Rooms</SelectItem>{uniqueRooms.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>
  );
  const SemesterSelect = () => (
      <div className="space-y-1 w-full">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Semester</span>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-full h-9 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="All">All Semesters</SelectItem>{uniqueSemesters.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
  );
  const ColumnSelect = () => (
      <div className="space-y-1 w-full">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><LayoutList className="w-3 h-3" /> Columns</span>
        <Select value="" onValueChange={handleColumnToggle}>
          <SelectTrigger className="w-full h-9 bg-background text-muted-foreground"><SelectValue placeholder="Customize View" /></SelectTrigger>
          <SelectContent align="end">
            {columnsOrder.map((key) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-4 w-4 items-center justify-center rounded border", visibleCols[key] ? "bg-primary border-primary" : "opacity-40")}>
                      <Check className={cn("h-3 w-3 text-primary-foreground", !visibleCols[key] && "hidden")} />
                    </div>
                    <span className="capitalize">{key}</span>
                  </div>
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
  );

  if (role !== "teacher") return <div className="p-6"><Alert><AlertTitle>Access restricted</AlertTitle><AlertDescription>Teacher access only.</AlertDescription></Alert></div>;

  if (isLoading) {
    return (
        <div className="w-full h-[70vh] flex items-center justify-center bg-background">
          <DataLoader />
        </div>
    );
  }

  // Once loaded, show the full UI
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full font-lexend max-w-full overflow-x-hidden mx-auto p-5 space-y-4 print:overflow-visible"
    >
      {/* --- Header Section (Screen Only) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden mb-8">
        <div className="space-y-2">
          <motion.div variants={itemVariants}>
            <Badge
              variant="outline"
              className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
            >
              Faculty Member
            </Badge>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          >
            Department of CSE
          </motion.h1>
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-3"
          >
            <p className="text-muted-foreground font-medium ">
              Class Routine <span className="text-foreground/40 mx-1">•</span>{" "}
              <span className="text-foreground font-semibold">
                {teacherInfo ? teacherInfo.initials : username}
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
            <Printer className="h-4 w-4" />
            Print View
          </Button>
        </motion.div>
      </div>

      {/* --- Header Section (Print Only) --- */}
      <div className="hidden print:flex flex-col items-center justify-center mb-6 pt-2 text-center w-full font-serif text-black">
        <h1 className="text-2xl font-bold text-black mb-3 font-lexend tracking-tight">
          Department of Computer Science & Engineering
        </h1>
        <div className="px-8 py-1">
          <h2 className="font-lexend text-black tracking-wide">
            {teacherInfo ? teacherInfo.initials : username}&apos;s Class Routine
          </h2>
        </div>
      </div>

      {/* --- Main Content Card --- */}
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
                              className="h-32 text-center text-muted-foreground"
                            >
                              No classes found matching your filters.
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

            {/* --- Pagination --- */}
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
    </motion.div>
  );
}