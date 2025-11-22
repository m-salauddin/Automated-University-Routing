/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  Shield,
  AtSign,
  IdCard,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";

// --- Animation Variants ---
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

function getInitials(name: string) {
  return name ? name.charAt(0).toUpperCase() : "U";
}

function getDepartmentCode(dept: string | null) {
  if (!dept) return "General";
  const d = dept.toLowerCase().trim();

  if (d === "computer science and engineering") return "CSE";
  if (
    d.includes("electrical") &&
    d.includes("engineering") &&
    (d.includes("electronics") || d.includes("eelectronics"))
  )
    return "EEE";
  if (
    (d.includes("sociology") || d.includes("socialogy")) &&
    d.includes("social science")
  )
    return "SSW";

  return dept;
}

export default function ProfilePage() {
  const auth = useSelector((s: RootState) => s.auth) as any;

  const profileData = {
    fullName: auth.username || "Unknown User",
    username: auth.username || "N/A",
    email: auth.email || "No email provided",

    department: getDepartmentCode(auth.department_name),
    fullDepartmentName: auth.department_name || "N/A",

    role: auth.role || "student",
    semester: auth.semesterName || auth.semester_name || "N/A",

    id:
      auth.department_id ||
      auth.user_id ||
      (auth.username ? auth.username.replace(/\D/g, "") : "N/A"),
  };

  const initial = getInitials(profileData.fullName);
  const isStudent = profileData.role === "student";

  return (
    <motion.div
      className="w-full mx-auto p-5 font-lexend max-w-[1600px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div className="space-y-2">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
              >
                {profileData.role} Profile
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              {profileData.fullName}
            </motion.h1>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <p className="text-muted-foreground font-medium">
                {profileData.fullDepartmentName}{" "}
                <span className="text-foreground/40 mx-1">•</span>{" "}
                <span className="text-foreground font-semibold">
                  {profileData.role.toUpperCase()}
                </span>
              </p>
            </motion.div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[350px_1fr]">
          <motion.div
            variants={itemVariants}
            className="h-full flex gap-6 flex-col"
          >
            <Card className="border-primary/20 bg-background shadow-lg overflow-hidden relative">
              <motion.div
                className="absolute inset-x-0 top-0 h-32 bg-linear-to-br from-primary/20 via-blue-500/20 to-purple-500/20 blur-2xl opacity-60"
                initial={{ scaleY: 0, originY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <CardContent className="pt-12 flex flex-col items-center text-center relative z-10">
                <motion.div
                  className="relative mb-6 p-1.5 rounded-full bg-background shadow-sm ring-1 ring-border"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <Avatar className="h-40 w-40 border-4 border-background shadow-xl">
                    <AvatarFallback className="text-6xl dark:bg-[#0e0e0e] bg-slate-100 text-foreground font-bold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-2 right-4 h-5 w-5 rounded-full border-4 border-background bg-green-500"></span>
                </motion.div>

                <div className="space-y-6 mb-6 w-full">
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        {profileData.fullName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {profileData.email}
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex flex-wrap justify-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Badge
                      variant="default"
                      className="rounded-full px-4 py-1 font-medium capitalize text-primary-foreground bg-primary/90 shadow-sm hover:bg-primary"
                    >
                      {profileData.role}
                    </Badge>
                    {isStudent && profileData.semester !== "N/A" && (
                      <Badge
                        variant="outline"
                        className="rounded-full px-4 py-1 font-medium text-foreground border-border bg-muted/30"
                      >
                        {profileData.semester}
                      </Badge>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 py-0 bg-background shadow-lg px-0 overflow-hidden relative">
              <div className="w-full text-sm text-left divide-y divide-border/50">
                <motion.div
                  className="flex justify-between items-center px-6 py-4 hover:bg-muted/20 transition-colors"
                  variants={itemVariants}
                >
                  <span className="text-muted-foreground flex items-center gap-3 font-medium">
                    <IdCard className="w-4 h-4 text-primary" /> Username
                  </span>
                  <span className="font-mono font-semibold text-foreground tracking-wide">
                    {profileData.username}
                  </span>
                </motion.div>
                <motion.div
                  className="flex justify-between items-center px-6 py-4 hover:bg-muted/20 transition-colors"
                  variants={itemVariants}
                >
                  <span className="text-muted-foreground flex items-center gap-3 font-medium">
                    <GraduationCap className="w-4 h-4 text-primary" /> Department
                  </span>
                  <span className="font-semibold text-right truncate max-w-[150px] text-foreground">
                    {profileData.department}
                  </span>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* -- Right Column: Detailed Info Form -- */}
          <motion.div variants={itemVariants} className="flex-1 h-full">
            <Card className="border-primary/20 bg-background shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your personal details and academic records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                {/* ROW 1: Full Name & ID */}
                <div className="grid gap-8 md:grid-cols-2">
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.fullName}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 font-medium text-foreground text-base h-11"
                      />
                    </div>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      {profileData.role === "teacher"
                        ? "Teacher ID"
                        : "Student ID"}
                    </Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.id}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 font-medium text-foreground text-base h-11"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* ROW 2: Username & Email Address */}
                <div className="grid gap-8 md:grid-cols-2">
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      Username
                    </Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.username}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 text-foreground text-base h-11"
                      />
                    </div>
                  </motion.div>

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.email}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 text-foreground text-base h-11"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* ROW 3: Department (Full Width) */}
                <div className="grid gap-8">
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      Department
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.fullDepartmentName}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 font-medium text-foreground text-base h-11"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* ROW 4: Role & Semester (Conditional) */}
                <div className="grid gap-8 md:grid-cols-2">
                  <motion.div
                    className={clsx("space-y-3")}
                    variants={itemVariants}
                  >
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      Role
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.role.toUpperCase()}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 text-foreground text-base h-11"
                      />
                    </div>
                  </motion.div>

                  {isStudent && (
                    <motion.div className="space-y-3" variants={itemVariants}>
                      <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                        Semester
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          readOnly
                          value={profileData.semester}
                          className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 text-foreground text-base h-11"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
