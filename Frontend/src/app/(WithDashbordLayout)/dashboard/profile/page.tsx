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
import { Badge } from "@/components/ui/badge";

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

export default function ProfilePage() {
  const { username, role } = useAuth();

  const profileData = {
    fullName: "Shuvo Chandra Debnath",
    studentId: "23151010",
    username: username || "shuvo_cd",
    email: "shuvo.debnath@university.edu",
    department: "Computer Science & Engineering",
    role: role || "student",
    batch: "25th Batch",
    enrollmentYear: "Fall 2023",
    avatarUrl:
      "https://generated.vusercontent.net/photos/rs:fill:400:400/g:ce/vi:kv:1/cid:v1:7397223c-cf9f-43b9-ab60-90df54559553",
  };

  return (
    <motion.div
      className="w-full mx-auto p-5 font-lexend max-w-[1600px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-8">
        {/* --- Header Style --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div className="space-y-2">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
              >
                Student Profile
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
              <p className="text-muted-foreground font-medium text-lg">
                {profileData.department}{" "}
                <span className="text-foreground/40 mx-1">•</span>{" "}
                <span className="text-foreground font-semibold">
                  {profileData.fullName.split(" ")[0]}
                </span>
              </p>
            </motion.div>
          </div>

          {/* --- Edit Profile --- */}

          {/* <motion.div variants={itemVariants}>
            <Button
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hidden md:flex"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </motion.div> */}
        </div>


        <div className="grid gap-6 xl:grid-cols-[350px_1fr]">
          {/* -- Left Column: Identity Card -- */}
          <motion.div
            variants={itemVariants}
            className="h-full flex gap-6 flex-col"
          >
            <Card className="border-primary/20 bg-background shadow-lg overflow-hidden relative">
              {/* -- Dynamic Background -- */}
              <motion.div
                className="absolute inset-x-0 top-0 h-32 bg-linear-to-br from-primary/20 via-blue-500/20 to-purple-500/20 blur-2xl opacity-60"
                initial={{ scaleY: 0, originY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <CardContent className="pt-12 flex flex-col items-center text-center relative z-10">
                {/* -- Gradient Border -- */}
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
                    <AvatarImage
                      src={profileData.avatarUrl}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-5xl dark:bg-[#0e0e0e] text-muted-foreground">
                      {profileData.fullName.charAt(0)}
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
                    <Badge
                      variant="outline"
                      className="rounded-full px-4 py-1 font-medium text-foreground border-border bg-muted/30"
                    >
                      {profileData.batch}
                    </Badge>
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
                    <IdCard className="w-4 h-4 text-primary" /> Student ID
                  </span>
                  <span className="font-mono font-semibold text-foreground tracking-wide">
                    {profileData.studentId}
                  </span>
                </motion.div>
                <motion.div
                  className="flex justify-between items-center px-6 py-4 hover:bg-muted/20 transition-colors"
                  variants={itemVariants}
                >
                  <span className="text-muted-foreground flex items-center gap-3 font-medium">
                    <GraduationCap className="w-4 h-4 text-primary" /> Dept Code
                  </span>
                  <span className="font-semibold text-right truncate max-w-[150px] text-foreground">
                    CSE
                  </span>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* -- Right Column: Detailed Info -- */}
          <motion.div variants={itemVariants} className="flex-1 h-full">
            <Card className="border-primary/20 bg-background shadow-lg h-full">
              <CardHeader >
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your personal details and academic records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
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
                      Student ID
                    </Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.studentId}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 font-mono font-medium text-foreground text-base h-11"
                      />
                    </div>
                  </motion.div>
                </div>

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

                <motion.div className="space-y-3" variants={itemVariants}>
                  <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                    Department
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      readOnly
                      value={profileData.department}
                      className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 text-foreground text-base h-11"
                    />
                  </div>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2">
                  <motion.div className="space-y-3" variants={itemVariants}>
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

                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                      Enrollment Year
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profileData.enrollmentYear}
                        className="pl-9 bg-muted/30 border-border/60 focus-visible:ring-0 text-foreground text-base h-11"
                      />
                    </div>
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
