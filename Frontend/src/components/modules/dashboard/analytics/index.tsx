/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Settings,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
  LucideIcon,
  Users,
  User,
  LayoutDashboard,
  FlaskConical,
  Library,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Sector,
  Legend,
  Label,
} from "recharts";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Badge } from "@/components/ui/badge";

// --- TYPES & INTERFACES ---

export type APIRoutineItem = {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  course_name: string;
  course_code: string;
  credits: number;
  teacher_name: string;
  department_name: string;
  semester_name: string;
  room_number: string;
};

interface ComputedMetrics {
  totalClasses: number;
  totalFree: number;
  labClasses: number;
  theoryClasses: number;
  perDay: { day: string; classes: number; free: number }[];
  workloadData: { day: string; hours: number }[];
  credits: number;
  uniqueCourses: number;
  distributionData: { name: string; count: number }[];
  roomUsageData: { name: string; Theory: number; Lab: number; Total: number }[];
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface ShadcnSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

interface MetricCardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  trend: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "neutral";
  icon?: LucideIcon;
  isCounter?: boolean;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color?: string;
    fill?: string;
  }>;
  label?: string;
}

// --- ANIMATION VARIANTS ---
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
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};

// --- CUSTOM ACTIVE SHAPE RENDERER ---
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="var(--background)"
        strokeWidth={4}
      />
    </g>
  );
};

// --- SHADCN-STYLE COMPONENTS ---

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden w-full ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = "",
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold leading-none tracking-tight text-zinc-950 dark:text-zinc-50">
        {title}
      </h3>
      {action}
    </div>
    {subtitle && (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    )}
  </div>
);

const CardContent: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const ShadcnSelect: React.FC<ShadcnSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:min-w-[180px]" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-[#111113] dark:placeholder:text-zinc-400"
      >
        <span className="truncate mr-2">
          {options.find((o) => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+4px)] w-full min-w-[180px] overflow-hidden max-h-60 overflow-y-auto rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
          <div className="p-1">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`relative flex w-full cursor-pointer mb-1 text-nowrap select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ${
                  value === opt.value ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
              >
                {value === opt.value && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  subtitle,
  value,
  trend,
  trendLabel,
  trendDirection,
  icon: Icon,
  color,
}) => {
  const isPositive = trendDirection === "up";

  const trendColor = color
    ? color
    : isPositive
    ? "#10b981"
    : trendDirection === "down"
    ? "#f43f5e"
    : "#71717a";

  return (
    <Card className="p-6 dark:bg-[#111113]! hover:shadow-md transition-all duration-200 dark:hover:border-zinc-700 min-w-0">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">
          {title}
        </h3>
        {Icon && (
          <Icon
            className="h-4 w-4 shrink-0"
            style={{ color: color || "#a1a1aa" }}
          />
        )}
      </div>
      <div className="flex flex-col mt-2">
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center">
          <span>{value}</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
          <span
            className="flex items-center font-medium whitespace-nowrap"
            style={{ color: trendColor }}
          >
            {isPositive && <ArrowUp className="mr-1 h-3 w-3" />}
            {trendDirection === "down" && (
              <ArrowDown className="mr-1 h-3 w-3" />
            )}
            {trend}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 truncate">
            {trendLabel}
          </span>
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-400 mt-1.5 dark:text-zinc-500 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
};

// --- CHART & VISUAL HELPERS ---

const COLORS = [
  "#3b82f6",
  "#f97316",
  "#10b981",
  "#facc15",
  "#a855f7",
  "#ec4899",
  "#6366f1",
];

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50 relative">
        <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-zinc-500 dark:text-zinc-400">
              {entry.name}:
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN DASHBOARD ---

interface Props {
  routineList: any;
}

export default function AutomatedRoutineDashboard({ routineList }: Props) {
  const auth = useSelector((state: RootState) => state.auth);

  const isAdmin = auth?.role === "admin";
  const isTeacher = auth?.role === "teacher";

  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCharts(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const safeRoutineList = useMemo<APIRoutineItem[]>(() => {
    if (Array.isArray(routineList)) return routineList;
    if (
      routineList &&
      typeof routineList === "object" &&
      Array.isArray(routineList.data)
    ) {
      return routineList.data;
    }
    return [];
  }, [routineList]);

  const uniqueSemesters = useMemo(() => {
    const sems = Array.from(
      new Set(safeRoutineList.map((item) => item.semester_name))
    );
    return sems.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [safeRoutineList]);

  const uniqueTeachers = useMemo(() => {
    return Array.from(
      new Set(safeRoutineList.map((item) => item.teacher_name))
    ).sort();
  }, [safeRoutineList]);

  const [viewMode, setViewMode] = useState<"student" | "teacher">(() => {
    if (isTeacher) return "teacher";
    return "student";
  });

  const [selectedFilter, setSelectedFilter] = useState<string>(() => {
    if (isAdmin) {
      return uniqueSemesters.length > 0 ? uniqueSemesters[0] : "";
    } else if (isTeacher) {
      return (
        uniqueTeachers.find((t) => t === auth?.username) ||
        uniqueTeachers[0] ||
        ""
      );
    } else {
      return (
        auth?.semester_name ||
        (uniqueSemesters.length > 0 ? uniqueSemesters[0] : "")
      );
    }
  });

  const [activePieIndex, setActivePieIndex] = useState<number>(0);
  const legendRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTabChange = (mode: "student" | "teacher") => {
    setViewMode(mode);
    if (mode === "student") {
      setSelectedFilter(uniqueSemesters[0] || "");
    } else {
      setSelectedFilter(uniqueTeachers[0] || "");
    }
    setActivePieIndex(0);
  };

  const filteredData = useMemo(() => {
    if (!selectedFilter) return [];

    return safeRoutineList.filter((item) => {
      if (viewMode === "student") {
        return item.semester_name === selectedFilter;
      } else {
        return item.teacher_name === selectedFilter;
      }
    });
  }, [safeRoutineList, viewMode, selectedFilter]);

  const getMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return h * 60 + m;
  };

  const computed: ComputedMetrics = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalClasses: 0,
        totalFree: 0,
        labClasses: 0,
        theoryClasses: 0,
        perDay: [],
        workloadData: [],
        credits: 0,
        uniqueCourses: 0,
        distributionData: [],
        roomUsageData: [],
      };
    }

    const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const SLOTS_PER_DAY = 9;

    const dayGroups: Record<string, APIRoutineItem[]> = {};
    daysOrder.forEach((day) => (dayGroups[day] = []));

    filteredData.forEach((item) => {
      if (dayGroups[item.day]) {
        dayGroups[item.day].push(item);
      }
    });

    const perDay = daysOrder.map((day) => {
      const classes = dayGroups[day]?.length || 0;
      const free = Math.max(0, SLOTS_PER_DAY - classes);
      return { day: day.substring(0, 3), classes, free };
    });

    const workloadData = daysOrder.map((day) => {
      const items = dayGroups[day] || [];
      const totalMinutes = items.reduce((acc, item) => {
        const start = getMinutes(item.start_time);
        const end = getMinutes(item.end_time);
        return acc + (end - start);
      }, 0);
      return {
        day: day.substring(0, 3),
        hours: Number((totalMinutes / 60).toFixed(1)),
      };
    });

    const totalClasses = filteredData.length;
    const totalFree = perDay.reduce((acc, curr) => acc + curr.free, 0);

    let labClasses = 0;
    let theoryClasses = 0;

    const uniqueCourseCodes = new Set<string>();
    let totalCredits = 0;
    const courseCreditMap = new Map<string, number>();
    const roomMap = new Map<string, { theory: number; lab: number }>();

    filteredData.forEach((item) => {
      const code = item.course_code.trim().toUpperCase();
      const isLab = code.endsWith("L");

      if (isLab) {
        labClasses++;
      } else {
        theoryClasses++;
      }

      uniqueCourseCodes.add(item.course_code);
      if (!courseCreditMap.has(item.course_code)) {
        courseCreditMap.set(item.course_code, item.credits || 3);
      }

      const room = item.room_number ? item.room_number.trim() : "TBA";
      if (!roomMap.has(room)) {
        roomMap.set(room, { theory: 0, lab: 0 });
      }
      const currentRoomStats = roomMap.get(room)!;
      if (isLab) {
        currentRoomStats.lab++;
      } else {
        currentRoomStats.theory++;
      }
    });

    courseCreditMap.forEach((credits) => {
      totalCredits += credits;
    });

    const distMap = new Map<string, number>();
    filteredData.forEach((item) => {
      const key = viewMode === "student" ? item.teacher_name : item.course_code;
      distMap.set(key, (distMap.get(key) || 0) + 1);
    });

    const distributionData = Array.from(distMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const roomUsageData = Array.from(roomMap.entries())
      .map(([name, counts]) => ({
        name,
        Theory: counts.theory,
        Lab: counts.lab,
        Total: counts.theory + counts.lab,
      }))
      .sort((a, b) => b.Total - a.Total)
      .slice(0, 8);

    return {
      totalClasses,
      totalFree,
      labClasses,
      theoryClasses,
      perDay,
      workloadData,
      credits: totalCredits,
      uniqueCourses: uniqueCourseCodes.size,
      distributionData,
      roomUsageData,
    };
  }, [filteredData, viewMode]);

  useEffect(() => {
    if (activePieIndex !== null && legendRefs.current[activePieIndex]) {
      legendRefs.current[activePieIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activePieIndex]);

  const chartColorPrimary = "#6366f1";
  const chartColorSecondary = "#10b981";

  const activeItem = computed.distributionData[activePieIndex] ||
    computed.distributionData[0] || { name: "N/A", count: 0 };

  const activePercent =
    computed.totalClasses > 0
      ? Math.round((activeItem.count / computed.totalClasses) * 100)
      : 0;

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(113, 113, 122, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(113, 113, 122, 0.5);
        }
      `}</style>

      <motion.div
        className="min-h-screen w-full max-w-full overflow-x-hidden bg-zinc-50/50 p-4 lg:p-8 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50 font-['Lexend']"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants}>
          <Badge
            variant="outline"
            className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
          >
            Admin Panel
          </Badge>
        </motion.div>
        <motion.header
          className="flex flex-col gap-4 mb-8 md:flex-row md:items-center justify-between"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-2xl md:text-3xl mt-2 font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm md:text-base">
              Academic overview and analytics
            </p>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-[#111113] p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full md:w-auto">
            {isAdmin && (
              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => handleTabChange("student")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "student"
                      ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Students
                </button>
                <button
                  onClick={() => handleTabChange("teacher")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "teacher"
                      ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Teachers
                </button>
              </div>
            )}

            {isAdmin && (
              <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
            )}

            {isAdmin ? (
              <div className="w-full lg:w-auto min-w-[180px]">
                <ShadcnSelect
                  value={selectedFilter}
                  onChange={setSelectedFilter}
                  placeholder={
                    viewMode === "student"
                      ? "Select Semester"
                      : "Select Teacher"
                  }
                  options={
                    viewMode === "student"
                      ? uniqueSemesters.map((sem) => ({
                          value: sem,
                          label: `${sem} Semester`,
                        }))
                      : uniqueTeachers.map((teacher) => ({
                          value: teacher,
                          label: teacher,
                        }))
                  }
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto justify-center sm:justify-start">
                {isTeacher ? (
                  <User className="w-4 h-4 text-zinc-500" />
                ) : (
                  <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                )}
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                  {isTeacher ? selectedFilter : `${selectedFilter} Semester`}
                </span>
              </div>
            )}
          </div>
        </motion.header>

        {/* METRICS GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          <MetricCard
            title="Theory Classes"
            value={computed.theoryClasses}
            trend={`${
              computed.totalClasses
                ? Math.round(
                    (computed.theoryClasses / computed.totalClasses) * 100
                  )
                : 0
            }%`}
            trendDirection="neutral"
            trendLabel="of total classes"
            icon={Library}
            isCounter={true}
            color={COLORS[0]}
          />
          <MetricCard
            title="Lab Classes"
            value={computed.labClasses}
            trend={`${
              computed.totalClasses
                ? Math.round(
                    (computed.labClasses / computed.totalClasses) * 100
                  )
                : 0
            }%`}
            trendDirection="neutral"
            trendLabel="of total classes"
            icon={FlaskConical}
            isCounter={true}
            color={COLORS[4]}
          />
          <MetricCard
            title={
              viewMode === "student" ? "Credits Earned" : "Teaching Credits"
            }
            value={computed.credits}
            trend="Total"
            trendDirection="up"
            trendLabel={viewMode === "student" ? "this semester" : "load"}
            icon={GraduationCap}
            isCounter={true}
            color={COLORS[2]}
          />
          <MetricCard
            title="Active Courses"
            value={computed.uniqueCourses}
            trend="Count"
            trendDirection="neutral"
            trendLabel="unique subjects"
            icon={Settings}
            isCounter={true}
            color={COLORS[1]}
          />
        </motion.div>

        {/* ROW 2: Pie (Faculty/Course) + Bar (Schedule Composition) */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6"
          variants={itemVariants}
        >
          {/* --- PIE CHART (Left, col-span-2) --- */}
          <Card className="xl:col-span-2 dark:bg-[#111113]! flex flex-col h-[420px] min-w-0 overflow-hidden">
            <CardHeader
              title={viewMode === "student" ? "Faculty Load" : "Course Dist."}
              subtitle={
                viewMode === "student"
                  ? "Classes by Instructor"
                  : "Classes by Course"
              }
              className="pb-2"
            />
            <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="relative h-[180px] w-full shrink-0">
                <ResponsiveContainer width="99%" height="100%">
                  {showCharts ? (
                    <PieChart>
                      <Pie
                        data={computed.distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="count"
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        activeIndex={activePieIndex}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1500}
                        activeShape={renderActiveShape}
                      >
                        {computed.distributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="transparent"
                            fillOpacity={1}
                            className="transition-all duration-300"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  ) : (
                    <div />
                  )}
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {activePercent}%
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 max-w-20 text-center truncate px-1">
                      {activeItem.name.length > 15
                        ? activeItem.name.substring(0, 12) + "..."
                        : activeItem.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-2 min-h-0 relative">
                {computed.distributionData.length > 0 ? (
                  computed.distributionData.map((item, index) => {
                    const percent =
                      computed.totalClasses > 0
                        ? Math.round((item.count / computed.totalClasses) * 100)
                        : 0;
                    const isActive = activePieIndex === index;

                    return (
                      <div
                        key={item.name}
                        ref={(el) => {
                          legendRefs.current[index] = el;
                        }}
                        onMouseEnter={() => setActivePieIndex(index)}
                        className="relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="list-active"
                            className="absolute inset-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <div className="relative z-10 flex items-center gap-3 min-w-0">
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span
                            className={`text-sm font-medium truncate transition-colors ${
                              isActive
                                ? "dark:text-white text-black"
                                : "text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-zinc-300"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div className="relative z-10 flex items-center gap-3 shrink-0">
                          <span
                            className={`text-sm font-bold transition-colors ${
                              isActive
                                ? "dark:text-white"
                                : "text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            {item.count}
                          </span>
                          <span className="text-xs font-medium text-emerald-500 w-10 text-right">
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                    No active classes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* --- SCHEDULE COMPOSITION (Moved here, col-span-3) --- */}
          <Card className="xl:col-span-3 h-[420px] dark:bg-[#111113]! flex flex-col min-w-0 overflow-hidden">
            <CardHeader
              title="Schedule Composition"
              subtitle="Classes vs Free Slots per day"
            />
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="99%" height="100%">
                {showCharts ? (
                  <BarChart
                    key={`bar-${viewMode}`}
                    data={computed.perDay.map((d) => ({
                      name: d.day,
                      Classes: d.classes,
                      Free: d.free,
                    }))}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    barGap={8}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      strokeOpacity={0.1}
                      stroke="currentColor"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      dy={10}
                    >
                      <Label
                        value="Day"
                        offset={-5}
                        position="insideBottom"
                        fill="#71717a"
                        fontSize={12}
                      />
                    </XAxis>
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                    >
                      <Label
                        value="No. of Slots"
                        angle={-90}
                        position="insideLeft"
                        fill="#71717a"
                        fontSize={12}
                        style={{ textAnchor: "middle" }}
                      />
                    </YAxis>
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Bar
                      dataKey="Classes"
                      fill={chartColorPrimary}
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      animationDuration={800}
                      animationBegin={0}
                      animationEasing="ease-out"
                    />
                    <Bar
                      dataKey="Free"
                      fill={chartColorSecondary}
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      animationDuration={800}
                      animationBegin={0}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                ) : (
                  <div />
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* ROW 3: Daily Workload (Hours) & Class Room Usage */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          <Card className="dark:bg-[#111113]! flex flex-col h-[400px] min-w-0 overflow-hidden">
            <CardHeader
              title="Daily Workload (Hours)"
              subtitle="Total duration of classes per day"
            />
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="99%" height="100%">
                {showCharts ? (
                  <AreaChart
                    key={`workload-${viewMode}`}
                    data={computed.workloadData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="workloadGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={chartColorPrimary}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartColorPrimary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      strokeOpacity={0.15}
                      stroke="currentColor"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      unit="h"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke={chartColorPrimary}
                      strokeWidth={3}
                      fill="url(#workloadGradient)"
                      fillOpacity={1}
                      dot={{
                        r: 5,
                        fill: "transparent",
                        stroke: chartColorPrimary,
                        strokeWidth: 3,
                      }}
                      activeDot={{
                        r: 7,
                        fill: "transparent",
                        stroke: chartColorPrimary,
                        strokeWidth: 3,
                      }}
                      animationDuration={1500}
                      animationBegin={800}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                ) : (
                  <div />
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* --- CLASS ROOM USAGE (Right) --- */}
          <Card className="h-[400px] dark:bg-[#111113]! flex flex-col min-w-0 overflow-hidden">
            <CardHeader
              title="Class Room Usage"
              subtitle="Usage frequency by room (Theory vs Lab)"
            />
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="99%" height="100%">
                {showCharts ? (
                  <BarChart
                    key={`room-${viewMode}`}
                    data={computed.roomUsageData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                    barGap={0}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      strokeOpacity={0.1}
                      stroke="currentColor"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      width={50}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Bar
                      dataKey="Theory"
                      stackId="a"
                      fill={chartColorPrimary}
                      barSize={20}
                      animationDuration={1500}
                      animationBegin={800}
                      animationEasing="ease-out"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="Lab"
                      stackId="a"
                      fill={chartColorSecondary}
                      barSize={20}
                      animationDuration={1500}
                      animationBegin={800}
                      animationEasing="ease-out"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                ) : (
                  <div />
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
