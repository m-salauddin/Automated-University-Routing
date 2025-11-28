/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  useState,
  useEffect,
  startTransition,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Printer,
  MoreVertical,
  Plus,
  Trash2,
  Pencil,
  Shield,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCog,
  ShieldBan,
  Mail,
  Building2,
  User as UserIcon,
  Eye,
  EyeOff,
  Users,
  Filter,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createUser, updateUser, deleteUser } from "@/services/users";

// --- TYPES ---
export type Department = {
  id: number;
  name: string;
};

export type Semester = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | string;
  department_name: string | null;
  department_id?: number | null;
  semester_name: string | null;
  semester_id?: number | null;
  date_joined: string;
};

interface UsersPageClientProps {
  initialUsers: User[];
  departments: Department[];
  semesters: Semester[];
}

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const pageItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

// --- ZOD SCHEMA ---
const userSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(1, "Username is required"),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
    department_id: z.string().optional(),
    semester_id: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (["TEACHER", "STUDENT"].includes(data.role) && !data.department_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Department is required",
        path: ["department_id"],
      });
    }
    if (data.role === "STUDENT" && !data.semester_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Semester is required",
        path: ["semester_id"],
      });
    }

    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type FormValues = z.infer<typeof userSchema>;

// --- HELPERS ---
const formatNameFromUsername = (username: string) => {
  if (!username) return "Unknown";
  try {
    const formatted = username.replace(/([A-Z])/g, " $1").trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch (e) {
    return username;
  }
};

const toPascalCase = (str: string) => {
  if (!str) return "";
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

const getRoleBadge = (role: string) => {
  // Added print styles to badges to remove background color and use black borders for ink saving
  switch (role) {
    case "ADMIN":
      return (
        <Badge
          variant="destructive"
          className="gap-1 shadow-sm print:bg-transparent print:text-black print:border-black print:border"
        >
          <ShieldBan className="h-3 w-3 print:hidden" /> Admin
        </Badge>
      );
    case "TEACHER":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-300 gap-1 shadow-sm border-blue-200 dark:border-blue-800 print:bg-transparent print:text-black print:border-black print:border"
        >
          <BookOpen className="h-3 w-3 print:hidden" /> Teacher
        </Badge>
      );
    case "STUDENT":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1 shadow-sm border-emerald-200 dark:border-emerald-800 print:bg-transparent print:text-black print:border-black print:border"
        >
          <GraduationCap className="h-3 w-3 print:hidden" /> Student
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

// --- MAIN COMPONENT ---
export default function UsersPageClient({
  initialUsers,
  departments,
  semesters,
}: UsersPageClientProps) {
  const router = useRouter();

  // --- STATE ---
  const [usersList, setUsersList] = useState<User[]>(initialUsers);

  // FIX: Add state for date to prevent hydration mismatch
  const [currentDate, setCurrentDate] = useState("");

  // FIX: Separated the effects.
  // 1. One for setting the client-side date (Fixes hydration error)
  useEffect(() => {
    setCurrentDate(new Date().toLocaleString());
  }, []);

  // 2. One for syncing users if the parent prop changes (Fixes "syncing state" error by isolating it)
  useEffect(() => {
    setUsersList(initialUsers);
  }, [initialUsers]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("TEACHER");
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Operation targets
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  // --- REACT HOOK FORM ---
  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      role: "STUDENT",
      department_id: "",
      semester_id: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const watchedFirstName = useWatch({ control, name: "first_name" });
  const watchedLastName = useWatch({ control, name: "last_name" });
  const watchedRole = useWatch({ control, name: "role" });
  const watchedPassword = useWatch({ control, name: "password" });

  // Auto-generate Username
  useEffect(() => {
    if (!editingUser) {
      const generated =
        toPascalCase(watchedFirstName || "") +
        toPascalCase(watchedLastName || "");
      setValue("username", generated);
    }
  }, [watchedFirstName, watchedLastName, editingUser, setValue]);

  // Auto-fill Confirm Password
  useEffect(() => {
    if (!editingUser && watchedPassword) {
      setValue("confirmPassword", watchedPassword);
    }
  }, [watchedPassword, editingUser, setValue]);

  // --- DYNAMIC FILTERS ---
  const uniqueDepartmentNames = useMemo(() => {
    const names = new Set<string>();
    usersList.forEach((user) => {
      if (user.role === roleFilter && user.department_name) {
        names.add(user.department_name);
      }
    });
    return Array.from(names).sort();
  }, [usersList, roleFilter]);

  const uniqueSemesterNames = useMemo(() => {
    const names = new Set<string>();
    usersList.forEach((user) => {
      if (user.role === "STUDENT" && user.semester_name) {
        names.add(user.semester_name);
      }
    });
    return Array.from(names).sort();
  }, [usersList]);


  // --- FILTER LOGIC ---
  const isFiltered = useMemo(() => {
    return searchQuery !== "" || deptFilter !== "All" || semFilter !== "All";
  }, [searchQuery, deptFilter, semFilter]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const uName = user.name || "";
      const uUser = user.username || "";

      const matchesSearch =
        uName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uUser.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = user.role === roleFilter;

      let matchesDept = true;
      if (roleFilter === "TEACHER" || roleFilter === "STUDENT") {
        if (deptFilter !== "All") {
          matchesDept = user.department_name === deptFilter;
        }
      }

      let matchesSem = true;
      if (roleFilter === "STUDENT") {
        if (semFilter !== "All") {
          matchesSem = user.semester_name === semFilter;
        }
      }

      return matchesSearch && matchesRole && matchesDept && matchesSem;
    });
  }, [usersList, searchQuery, roleFilter, deptFilter, semFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const displayUsers = pagedUsers;

  // --- MODAL HANDLERS ---
  const openAddUser = () => {
    setEditingUser(null);
    setIsSaving(false);
    reset({
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      role: "STUDENT",
      department_id: "",
      semester_id: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const openEditUser = useCallback(
    (user: User) => {
      setEditingUser(user);
      setIsSaving(false);

      let deptId = "";
      if (user.department_id) deptId = String(user.department_id);
      else if (user.department_name) {
        const found = departments.find((d) => d.name === user.department_name);
        if (found) deptId = String(found.id);
      }

      let semId = "";
      if (user.semester_id) semId = String(user.semester_id);
      else if (user.semester_name) {
        const found = semesters.find((s) => s.name === user.semester_name);
        if (found) semId = String(found.id);
      }

      reset({
        first_name: user.first_name || user.name.split(" ")[0] || "",
        last_name:
          user.last_name || user.name.split(" ").slice(1).join(" ") || "",
        email: user.email,
        username: user.username,
        role: user.role as "ADMIN" | "TEACHER" | "STUDENT",
        department_id: deptId,
        semester_id: semId,
        password: "",
        confirmPassword: "",
      });

      setIsEditModalOpen(true);
    },
    [reset, departments, semesters]
  );

  const openDeleteUser = useCallback((user: User) => {
    setDeletingUser(user);
    setIsDeleting(false);
    setIsDeleteModalOpen(true);
  }, []);

  const resetFilters = () => {
    setDeptFilter("All");
    setSemFilter("All");
    setSearchQuery("");
    setPage(1);
  };

  // --- SUBMIT HANDLER ---
  const onSubmit = async (data: FormValues) => {
    if (!editingUser && (!data.password || data.password.length < 6)) {
      toast.error("Password is required and must be 6+ chars");
      return;
    }

    setIsSaving(true);

    const basePayload = {
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      email: data.email,
      role: data.role,
    };

    try {
      if (editingUser) {
        // --- UPDATE ---
        const payload: any = {
          ...basePayload,
          department: data.department_id ? Number(data.department_id) : null,
          semester:
            data.role === "STUDENT" && data.semester_id
              ? Number(data.semester_id)
              : null,
        };

        const result = await updateUser(String(editingUser.id), payload);

        if (result.success && result.data) {
          const foundDept = departments.find(
            (d) => d.id === payload.department
          );
          const foundSem = semesters.find((s) => s.id === payload.semester);

          setUsersList((prev) =>
            prev.map((u) => {
              if (u.id === editingUser.id) {
                return {
                  ...u,
                  ...payload,
                  name: `${data.first_name} ${data.last_name}`,
                  department_id: payload.department,
                  department_name: foundDept
                    ? foundDept.name
                    : u.department_name,
                  semester_id: payload.semester,
                  semester_name: foundSem ? foundSem.name : u.semester_name,
                } as User;
              }
              return u;
            })
          );

          setIsEditModalOpen(false);
          toast.success("User updated successfully");
          startTransition(() => router.refresh());
        } else {
          toast.error(result.message || "Failed to update user");
          setIsSaving(false);
        }
      } else {
        // --- CREATE ---
        const payload: any = {
          ...basePayload,
          password: data.password,
          password2: data.confirmPassword,
          department_id: data.department_id ? Number(data.department_id) : null,
          semester_id:
            data.role === "STUDENT" && data.semester_id
              ? Number(data.semester_id)
              : null,
        };

        const result = await createUser(payload);

        if (result.success && result.data) {
          const foundDept = departments.find(
            (d) => d.id === payload.department_id
          );
          const foundSem = semesters.find((s) => s.id === payload.semester_id);

          const newUser: User = {
            ...result.data,
            name: `${data.first_name} ${data.last_name}`,
            department_id: payload.department_id,
            department_name: foundDept ? foundDept.name : null,
            semester_id: payload.semester_id,
            semester_name: foundSem ? foundSem.name : null,
          };

          setUsersList((prev) => [newUser, ...prev]);
          setIsEditModalOpen(false);
          toast.success("User created successfully!");
          startTransition(() => router.refresh());
        } else {
          toast.error(result.message || "Failed to create user");
          setIsSaving(false);
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const result = await deleteUser(String(deletingUser.id));
      if (result.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
        toast.success(`User ${deletingUser.username} deleted`);
        startTransition(() => router.refresh());
      } else {
        toast.error(result.message || "Failed to delete user");
        setIsDeleting(false);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during deletion");
      setIsDeleting(false);
    }
  };

  const tableContent = useMemo(
    () => (
      <div className="grid grid-cols-1 print:block">
        <div className="w-full overflow-x-auto print:overflow-visible">
          <div className="min-w-[1000px] print:min-w-0 print:w-full">
            {/* COMPACT PRINT: text-xs */}
            <Table className="print:text-xs">
              <TableHeader className="bg-muted/40 print:bg-transparent">
                <TableRow className="print:border-b-2 print:border-black">
                  <TableHead className="print:text-black print:font-bold">
                    <div className="flex items-center gap-2">
                      {/* ICON HIDDEN IN PRINT */}
                      <UserIcon className="size-3.5 text-muted-foreground print:hidden" />{" "}
                      User Profile
                    </div>
                  </TableHead>
                  <TableHead className="print:text-black print:font-bold">
                    <div className="flex items-center gap-2">
                      {/* ICON HIDDEN IN PRINT */}
                      <Mail className="size-3.5 text-muted-foreground print:hidden" />{" "}
                      Email
                    </div>
                  </TableHead>
                  {roleFilter !== "ADMIN" && (
                    <TableHead className="print:text-black print:font-bold">
                      <div className="flex items-center gap-2">
                        {/* ICON HIDDEN IN PRINT */}
                        <Building2 className="size-3.5 text-muted-foreground print:hidden" />{" "}
                        Department
                      </div>
                    </TableHead>
                  )}
                  {roleFilter === "STUDENT" && (
                    <TableHead className="print:text-black print:font-bold">
                      <div className="flex items-center gap-2">
                        {/* ICON HIDDEN IN PRINT */}
                        <GraduationCap className="size-3.5 text-muted-foreground print:hidden" />{" "}
                        Semester
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="print:text-black print:font-bold">
                    <div className="flex items-center gap-2">
                      {/* ICON HIDDEN IN PRINT */}
                      <Shield className="size-3.5 text-muted-foreground print:hidden" />{" "}
                      Role
                    </div>
                  </TableHead>
                  {/* ACTIONS HIDDEN IN PRINT */}
                  <TableHead className="text-right print:hidden">
                    <div className="flex items-center justify-end gap-2">
                      <UserCog className="size-3.5 text-muted-foreground" />{" "}
                      Actions
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0">
                {displayUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="size-8 opacity-20" />
                        <p>No users found for {roleFilter.toLowerCase()}s.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayUsers.map((user, index) => (
                    <TableRow
                      key={user.id ? `${user.id}-${index}` : `user-${index}`}
                      className="group border-b last:border-0 print:break-inside-avoid print:border-black/30"
                    >
                      {/* COMPACT CELL PADDING: print:py-1 */}
                      <TableCell className="print:py-1">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground print:text-black">
                            {!user.name || user.name === "N/A"
                              ? formatNameFromUsername(user.username)
                              : user.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono print:text-black/70">
                            @{user.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="print:py-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground print:text-black">
                          {user.email || "N/A"}
                        </div>
                      </TableCell>
                      {roleFilter !== "ADMIN" && (
                        <TableCell className="print:py-1 print:text-black">
                          {user.department_name || (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </TableCell>
                      )}
                      {roleFilter === "STUDENT" && (
                        <TableCell className="print:py-1 print:text-black">
                          {user.semester_name ? (
                            <Badge
                              variant="outline"
                              className="print:border-black print:text-black"
                            >
                              {user.semester_name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="print:py-1">
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="text-right print:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditUser(user)}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteUser(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    ),
    [displayUsers, roleFilter, openEditUser, openDeleteUser]
  );

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full font-lexend max-w-full mx-auto p-5 space-y-4 overflow-x-hidden print:overflow-visible print:p-0"
      >
        {/* --- PRINT ONLY HEADER --- */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-2">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
                University Admin Panel
              </h1>
              <h2 className="text-lg font-medium text-black/80">
                User Management Report
              </h2>
            </div>
            <div className="text-right text-xs font-mono text-black">
              {/* Use state currentDate here instead of direct new Date() to fix hydration error */}
              <p>Generated: {currentDate}</p>
              <p>
                Role: <span className="uppercase font-bold">{roleFilter}</span>{" "}
                | Count: {filteredUsers.length}
              </p>
              {deptFilter !== "All" && <p>Dept: {deptFilter}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden mb-6">
          {/* GROUPED HEADER ANIMATION TO REDUCE JANK */}
          <motion.div variants={pageItemVariants} className="space-y-2">
            <div>
              <Badge
                variant="outline"
                className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
              >
                Admin Panel
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage access, roles, and profiles for the university.
            </p>
          </motion.div>

          <motion.div variants={pageItemVariants} className="flex gap-3">
            <Badge
              variant="secondary"
              className="h-10 px-4 flex items-center justify-center gap-2 text-sm font-normal bg-background border whitespace-nowrap"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{filteredUsers.length} Users</span>
            </Badge>
            <Button onClick={openAddUser} className="gap-2 bg-primary">
              <Plus className="h-4 w-4" /> Add User
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2 h-10"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </motion.div>
        </div>

        {/* Added will-change-transform for GPU acceleration */}
        <motion.div
          variants={pageItemVariants}
          className="w-full min-w-0"
          style={{ willChange: "transform, opacity" }}
        >
          <Card className="w-full overflow-hidden border shadow-sm print:border-none print:shadow-none">
            <CardHeader className="p-4 bg-muted/30 border-b print:hidden">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Search
                  </span>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9 bg-background h-10"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // FIX: Reset page on search change immediately
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Role
                  </span>
                  <Select
                    value={roleFilter}
                    onValueChange={(val) => {
                      setRoleFilter(val);
                      // FIX: Reset filters and page immediately on role change
                      setDeptFilter("All");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full bg-background h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEACHER">Teachers</SelectItem>
                      <SelectItem value="STUDENT">Students</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(roleFilter === "TEACHER" || roleFilter === "STUDENT") && (
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Department
                    </span>
                    <Select
                      value={deptFilter}
                      onValueChange={(val) => {
                        setDeptFilter(val);
                        // FIX: Reset page on dept change immediately
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full bg-background h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Departments</SelectItem>
                        {uniqueDepartmentNames.map((name) => (
                          <SelectItem key={`dept-filter-${name}`} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {roleFilter === "STUDENT" && (
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Semester
                    </span>
                    <Select
                      value={semFilter}
                      onValueChange={(val) => {
                        setSemFilter(val);
                        // FIX: Reset page on sem change immediately
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full bg-background h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Semesters</SelectItem>
                        {uniqueSemesterNames.map((name) => (
                          <SelectItem key={`sem-filter-${name}`} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <AnimatePresence>
                  {isFiltered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-none"
                    >
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="h-10 gap-2 bg-background border-dashed text-muted-foreground hover:text-foreground px-4"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>
            <CardContent className="p-0">{tableContent}</CardContent>
            {/* Pagination Controls */}
            {pagedUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-background/50 print:hidden">
                <div className="text-sm text-muted-foreground">
                  Showing {pagedUsers.length} of {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-4">
                    <span className="text-xs text-muted-foreground">Rows:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(val) => {
                        setPageSize(Number(val));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 20, 50].map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
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
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage((p) => p + 1)}
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
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* --- ADD/EDIT USER MODAL --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] w-full max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-thin print:hidden">
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update user details."
                  : "Fill in the details to create a new account."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("first_name")}
                    placeholder="e.g. Rakibuzzaman"
                  />
                  {errors.first_name && (
                    <p className="text-xs text-red-500">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("last_name")}
                    placeholder="e.g. Khan Pathan"
                  />
                  {errors.last_name && (
                    <p className="text-xs text-red-500">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="user@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    {...register("username")}
                    className="font-mono text-muted-foreground"
                    placeholder="Generated or custom username"
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Fields - ONLY SHOW IN CREATE MODE */}
              {!editingUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <Label>
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Min 6 chars"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 relative">
                    <Label>
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      {/* Confirm password auto-fills via watcher but is editable */}
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        placeholder="******"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="space-y-2">
                  <Label>
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="TEACHER">Teacher</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <p className="text-xs text-red-500">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    className={
                      watchedRole === "ADMIN" ? "text-muted-foreground" : ""
                    }
                  >
                    Department{" "}
                    {watchedRole !== "ADMIN" && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Controller
                    control={control}
                    name="department_id"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={watchedRole === "ADMIN"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              watchedRole === "ADMIN" ? "N/A" : "Select Dept"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.department_id && (
                    <p className="text-xs text-red-500">
                      {errors.department_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    className={
                      watchedRole !== "STUDENT" ? "text-muted-foreground" : ""
                    }
                  >
                    Semester{" "}
                    {watchedRole === "STUDENT" && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Controller
                    control={control}
                    name="semester_id"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={watchedRole !== "STUDENT"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              watchedRole !== "STUDENT" ? "N/A" : "Select Sem"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((sem) => (
                            <SelectItem key={sem.id} value={String(sem.id)}>
                              {sem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.semester_id && (
                    <p className="text-xs text-red-500">
                      {errors.semester_id.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
                className="min-w-[100px] h-8"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md print:hidden">
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldBan className="h-6 w-6" />{" "}
                <DialogTitle>Confirm Deletion</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  {deletingUser?.name}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Delete
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
