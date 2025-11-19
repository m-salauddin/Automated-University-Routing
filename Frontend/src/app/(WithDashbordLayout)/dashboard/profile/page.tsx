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
  Calendar, // Added for Batch/Enrollment Year
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Animation Variants
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


export default function ProfilePage() {
  const { username, role } = useAuth();

  // Enhanced mock data with more detail
  const profileData = {
    fullName: "Shuvo Chandra Debnath",
    studentId: "23151010",
    username: username || "shuvo_cd",
    email: "shuvo.debnath@university.edu",
    department: "Computer Science & Engineering",
    role: role || "student",
    batch: "25th Batch",
    enrollmentYear: "Fall 2023", // New field
    avatarUrl:
      "https://generated.vusercontent.net/photos/rs:fill:400:400/g:ce/vi:kv:1/cid:v1:7397223c-cf9f-43b9-ab60-90df54559553", // More modern avatar
  };

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto p-4 lg:p-8 font-lexend"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-6">
        {/* -- Header Section -- */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground text-lg">
            Dive into your personal and academic world.
          </p>
        </motion.div>

        <Separator className="my-2" />

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          {/* -- Left Column: Identity Card (Enhanced) -- */}
          <motion.div
            variants={itemVariants}
            className="h-full flex gap-6 flex-col"
          >
            <Card className="border-primary/20 bg-background shadow-lg overflow-hidden relative">
              {/* -- Dynamic Background Element -- */}
              <motion.div
                className="absolute inset-x-0 top-0 h-24 bg-linear-to-br from-primary/30 to-blue-500/30 blur-xl opacity-60"
                initial={{ scaleY: 0, originY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <CardContent className="pt-4 flex flex-col items-center text-center relative z-10">
                {/* -- Profile Image with Gradient Border -- */}
                <motion.div
                  className="relative mb-6 p-1.5 rounded-full bg-linear-to-br from-indigo-500 to-primary/80"
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
                    <AvatarImage
                      src={profileData.avatarUrl}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-5xl bg-muted text-muted-foreground">
                      {profileData.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <div className="space-y-6 mb-6">
                  <motion.h2
                    className="text-2xl font-bold tracking-tight text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {profileData.fullName}
                  </motion.h2>
                  <motion.div
                    className="flex flex-wrap justify-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Badge
                      variant="default" // Changed to default for more prominence
                      className="rounded-sm px-3 font-medium capitalize text-primary-foreground bg-primary/90 shadow-sm"
                    >
                      {profileData.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-sm px-3 font-medium text-muted-foreground border-primary/40 bg-primary/10"
                    >
                      {profileData.batch}
                    </Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-background shadow-lg px-6 overflow-hidden relative">
              <div className="w-full space-y-4 text-sm text-left">
                <motion.div
                  className="flex justify-between items-center px-3 py-2.5 bg-muted/30 rounded-lg border border-border/50"
                  variants={itemVariants}
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-primary" /> ID
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {profileData.studentId}
                  </span>
                </motion.div>
                <motion.div
                  className="flex justify-between items-center px-3 py-2.5 bg-muted/30 rounded-lg border border-border/50"
                  variants={itemVariants}
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> Dept
                  </span>
                  <span
                    className="font-semibold text-right truncate max-w-[150px] text-foreground"
                    title={profileData.department}
                  >
                    {profileData.department.split(" ")[0]}{" "}
                    {/* Display "Computer" for brevity */}
                  </span>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* -- Right Column: Detailed Info -- */}
          <motion.div variants={itemVariants} className="flex-1">
            <Card className="border-primary/20 bg-background shadow-lg h-full">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-foreground">
                  Account Details
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Essential personal details linked to your university identity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Identity Section */}
                <div className="grid gap-8 sm:grid-cols-2">
                  <motion.div className="space-y-2.5" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary/70" /> Full Name
                    </Label>
                    <Input
                      readOnly
                      value={profileData.fullName}
                      className="bg-muted/40 border-border/60 focus-visible:ring-0 font-medium text-foreground text-base h-10"
                    />
                  </motion.div>

                  <motion.div className="space-y-2.5" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-primary/70" /> Student
                      ID
                    </Label>
                    <Input
                      readOnly
                      value={profileData.studentId}
                      className="bg-muted/40 border-border/60 focus-visible:ring-0 font-mono font-medium text-foreground text-base h-10"
                    />
                  </motion.div>
                </div>

                <Separator className="opacity-50" />

                {/* Academic Section */}
                <div className="grid gap-8 sm:grid-cols-2">
                  <motion.div className="space-y-2.5" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      <AtSign className="h-3.5 w-3.5 text-primary/70" />{" "}
                      Username
                    </Label>
                    <Input
                      readOnly
                      value={profileData.username}
                      className="bg-muted/40 border-border/60 focus-visible:ring-0 text-muted-foreground text-base h-10"
                    />
                  </motion.div>

                  <motion.div className="space-y-2.5" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary/70" /> Email
                      Address
                    </Label>
                    <Input
                      readOnly
                      value={profileData.email}
                      className="bg-muted/40 border-border/60 focus-visible:ring-0 text-muted-foreground text-base h-10"
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2.5 sm:col-span-2"
                    variants={itemVariants}
                  >
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary/70" />{" "}
                      Department
                    </Label>
                    <Input
                      readOnly
                      value={profileData.department}
                      className="bg-muted/40 border-border/60 focus-visible:ring-0 text-muted-foreground text-base h-10"
                    />
                  </motion.div>

                  <motion.div className="space-y-2.5" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-primary/70" /> Role
                    </Label>
                    <Input
                      readOnly
                      value={profileData.role.toUpperCase()}
                      className="bg-muted/40 border-border/60 focus-visible:ring-0 text-muted-foreground text-base h-10"
                    />
                  </motion.div>

                  <motion.div className="space-y-2.5" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary/70" />{" "}
                      Enrollment Year
                    </Label>
                    <Input
                      readOnly
                      value={profileData.enrollmentYear}
                      className="bg-muted/40 border-border/60 focus-visible:ring-0 text-muted-foreground text-base h-10"
                    />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
