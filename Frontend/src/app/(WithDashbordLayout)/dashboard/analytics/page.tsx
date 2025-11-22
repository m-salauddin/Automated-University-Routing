"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Clock,
  Settings,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
  LucideIcon,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { routineData } from "../students-routine/students-routine-data";

interface ComputedMetrics {
  totalClasses: number;
  totalFree: number;
  perDay: { day: string; classes: number; free: number }[];
  credits: number;
  uniqueCourses: number;
  teacherCounts: { name: string; count: number }[];
}

// --- COMPONENT PROPS INTERFACES ---

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
}

interface MetricCardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  trend: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "neutral";
  icon?: LucideIcon;
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

// --- SHADCN-STYLE COMPONENTS ---

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${className}`}
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
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-w-[180px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none  disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-[#111113] dark:placeholder:text-zinc-400"
      >
        <span>
          {options.find((o) => o.value === value)?.label || "Select..."}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute z-50 top-[calc(100%+4px)] w-full min-w-32 overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
            <div className="p-1">
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`relative flex w-full cursor-pointer mb-2 text-nowrap select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ${
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
        </>
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
}) => {
  const isPositive = trendDirection === "up";

  return (
    <Card className="p-6 dark:bg-[#111113]! hover:shadow-md transition-all duration-200 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
        {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
      </div>
      <div className="flex flex-col mt-2">
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {value}
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs">
          <span
            className={`flex items-center font-medium ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-500"
                : "text-rose-500 dark:text-rose-400"
            }`}
          >
            {isPositive ? (
              <ArrowUp className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3" />
            )}
            {trend}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">{trendLabel}</span>
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-400 mt-1.5 dark:text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
};

// --- CHART & VISUAL HELPERS (Outside render) ---

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#facc15", "#a855f7"];

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
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

export default function AutomatedRoutineDashboard() {
  const [semesterId, setSemesterId] = useState<string>("8th");
  const [activePieIndex, setActivePieIndex] = useState<number>(0);

  // REFS FOR SCROLLING LEGEND
  const legendRefs = useRef<(HTMLDivElement | null)[]>([]);

  const semester = useMemo(() => routineData[semesterId] || null, [semesterId]);

  const computed: ComputedMetrics = useMemo(() => {
    if (!semester)
      return {
        totalClasses: 0,
        totalFree: 0,
        perDay: [],
        credits: 0,
        uniqueCourses: 0,
        teacherCounts: [],
      };

    const activeDays = semester.schedule.filter(
      (d) => d.day !== "Fri" && d.day !== "Sat"
    );

    const perDay = activeDays.map((d) => {
      const classes = d.slots.filter(Boolean).length;
      const free = d.slots.length - classes;
      return { day: d.day, classes, free };
    });

    const totalClasses = perDay.reduce((a, b) => a + b.classes, 0);
    const totalFree = perDay.reduce((a, b) => a + b.free, 0);

    const courseSet = new Set<string>();
    const teacherMap = new Map<string, number>();

    activeDays.forEach((d) => {
      d.slots.forEach((s) => {
        if (s) {
          courseSet.add(s.course);
          teacherMap.set(s.teacher, (teacherMap.get(s.teacher) ?? 0) + 1);
        }
      });
    });

    const teacherCounts = Array.from(teacherMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalClasses,
      totalFree,
      perDay,
      credits: semester.credits,
      uniqueCourses: courseSet.size,
      teacherCounts,
    };
  }, [semester]);

  // --- AUTO-SCROLL EFFECT (Uncommented and fixed) ---
  useEffect(() => {
    // Only scroll if the index is valid and the ref exists
    if (legendRefs.current[activePieIndex]) {
      legendRefs.current[activePieIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activePieIndex]);

  // Chart Colors
  const chartColorPrimary = "#6366f1";
  const chartColorSecondary = "#10b981";

  // Logic for the Center Label of the Donut Chart
  const activeItem = computed.teacherCounts[activePieIndex] ||
    computed.teacherCounts[0] || { name: "N/A", count: 0 };
  const activePercent =
    computed.totalClasses > 0
      ? Math.round((activeItem.count / computed.totalClasses) * 100)
      : 0;

  return (
    <>
      {/* Inject Font */}
      <style jsx global>{`
        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(
            113,
            113,
            122,
            0.3
          ); /* zinc-500 with opacity */
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(113, 113, 122, 0.5);
        }
      `}</style>

      <motion.div
        className="min-h-screen bg-zinc-50/50 p-6 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50 md:p-8 font-['Lexend']"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.header
          className="flex flex-col gap-4 mb-8 md:flex-row md:items-center justify-between"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Academic overview and analytics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ShadcnSelect
              value={semesterId}
              onChange={setSemesterId}
              options={Object.values(routineData).map((s) => ({
                value: s.id,
                label: s.label,
              }))}
            />
          </div>
        </motion.header>

        {/* METRICS GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          <MetricCard
            title="Total Classes"
            value={computed.totalClasses}
            trend="5.5%"
            trendDirection="up"
            trendLabel="vs last week"
            icon={BookOpen}
          />
          <MetricCard
            title="Credits Earned"
            value={computed.credits}
            trend="2.5%"
            trendDirection="up"
            trendLabel="average pace"
            icon={GraduationCap}
          />
          <MetricCard
            title="Active Courses"
            value={computed.uniqueCourses}
            trend="Same"
            trendDirection="neutral"
            trendLabel="as previous"
            icon={Settings}
          />
          <MetricCard
            title="Study Slots"
            value={computed.totalFree}
            trend="12%"
            trendDirection="down"
            trendLabel="less free time"
            icon={Clock}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          variants={itemVariants}
        >
          {/* --- FACULTY LOAD --- */}
          <Card className="lg:col-span-1 dark:bg-[#111113]! flex flex-col h-[420px]">
            <CardHeader
              title="Faculty Load"
              subtitle="Distribution by instructor"
              className="pb-2"
            />
            <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="relative h-[180px] w-full shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={computed.teacherCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="count"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                    >
                      {computed.teacherCounts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="transparent"
                          // Added: Dim cells that are not active for bidirectional feedback
                          fillOpacity={activePieIndex === index ? 1 : 0.4}
                          className="transition-all duration-300 hover:opacity-100"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {activePercent}%
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 max-w-20 text-center truncate">
                    {activeItem.name.split(" ")[1] || activeItem.name}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-2 min-h-0 relative">
                <AnimatePresence>
                  {computed.teacherCounts.length > 0 ? (
                    computed.teacherCounts.map((teacher, index) => {
                      const percent =
                        computed.totalClasses > 0
                          ? Math.round(
                              (teacher.count / computed.totalClasses) * 100
                            )
                          : 0;
                      const isActive = activePieIndex === index;

                      return (
                        <div
                          key={teacher.name}
                          ref={(el) => {
                            legendRefs.current[index] = el;
                          }}
                          onMouseEnter={() => setActivePieIndex(index)}
                          className="relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group"
                        >
                          {/* Sliding Background Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="faculty-list-active"
                              className="absolute inset-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}

                          {/* Content */}
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
                              {teacher.name}
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
                              {teacher.count}
                            </span>
                            <span className="text-xs font-medium text-emerald-500 w-10 text-right">
                              +{percent}%
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
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* --- Line Chart --- */}
          <Card className="lg:col-span-2 dark:bg-[#111113]! flex flex-col h-[420px]">
            <CardHeader
              title="Daily Workload"
              subtitle="Classes vs Free Time breakdown"
            />
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={computed.perDay.map((d) => ({
                    name: d.day,
                    Classes: d.classes,
                    Free: d.free,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.15}
                    stroke="currentColor"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Classes"
                    stroke={chartColorPrimary}
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: chartColorPrimary,
                      strokeWidth: 2,
                      stroke: "var(--background)",
                    }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Free"
                    stroke={chartColorSecondary}
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: chartColorSecondary,
                      strokeWidth: 2,
                      stroke: "var(--background)",
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* CHARTS SECTION 2 */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          {/* Area Chart */}
          <Card className="h-[350px] dark:bg-[#111113]! flex flex-col">
            <CardHeader
              title="Session Intensity"
              subtitle="Volume of classes throughout the week"
            />
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={computed.perDay.map((d) => ({
                    name: d.day,
                    Classes: d.classes,
                  }))}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="areaClasses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartColorPrimary}
                        stopOpacity={0.3}
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
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Classes"
                    stroke={chartColorPrimary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#areaClasses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* --- Bar Chart --- */}
          <Card className="h-[350px] dark:bg-[#111113]! flex flex-col">
            <CardHeader
              title="Schedule Composition"
              subtitle="Stacked view of engagement"
            />
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={computed.perDay.map((d) => ({
                    name: d.day,
                    Classes: d.classes,
                    Free: d.free,
                  }))}
                  barSize={32}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    strokeOpacity={0.15}
                    stroke="currentColor"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 12 }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="Classes"
                    stackId="a"
                    fill={chartColorPrimary}
                    radius={[0, 0, 2, 2]}
                  />
                  <Bar
                    dataKey="Free"
                    stackId="a"
                    fill={chartColorSecondary}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
