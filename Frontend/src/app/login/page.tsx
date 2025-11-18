"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/context/auth-context";

const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthenticated, setUsername: setCtxUsername, setRole } = useAuth();
  const [role, setRoleLocal] = useState<UserRole>("student");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Persist auth using context (and localStorage under the hood)
    setAuthenticated(true);
    setCtxUsername(data.username);
    setRole(role);

    setIsLoading(false);

    toast.success("Login successful!", {
      description: `Welcome back, ${data.username} (${role})`,
      duration: 3000,
    });

    setTimeout(() => {
      router.push("/dashboard/analytics");
    }, 500);
  };

  const cardVariants = {
    hidden: { scale: 0.96, opacity: 0, y: 16 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
      },
    },
  };
  const logoVariants = {
    animate: { y: [0, -6, 0], transition: { duration: 2.2, repeat: Infinity } },
  };
  const errorVariant = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div
      className={clsx(
        "min-h-screen flex items-center justify-center",
        "bg-linear-to-br from-teal-50 via-blue-100 md:px-10 px-4 to-teal-200",
        "dark:bg-linear-to-br dark:from-gray-900 dark:via-slate-900 dark:to-teal-900",
        "transition-all relative"
      )}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className={clsx(
          "relative w-full max-w-sm flex flex-col items-center rounded-xl p-5 sm:p-8 pt-14",
          "bg-white/90 border border-teal-200 text-zinc-800 shadow-lg",
          "dark:bg-slate-900 dark:border-slate-800 dark:text-gray-100",
          "shadow-2xl"
        )}
      >
        <div
          className={clsx(
            "absolute -top-8 left-1/2 -translate-x-1/2 px-8 py-2 rounded-lg font-script text-xl sm:text-2xl text-center tracking-wide shadow-lg",
            "bg-teal-400 text-teal-900",
            "dark:bg-teal-600 dark:text-white"
          )}
        >
          Sign In
        </div>
        <motion.div
          className="mt-5 mb-5"
          variants={logoVariants}
          animate="animate"
        >
          <div
            className={clsx(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
              "bg-teal-100 text-teal-600",
              "dark:bg-slate-800 dark:text-teal-400"
            )}
          >
            <User className="w-10 h-10" />
          </div>
        </motion.div>
        <form
          className="w-full space-y-4 mt-2 font-lexend"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              className={clsx("text-md", "text-teal-700 dark:text-teal-200")}
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative mt-1">
              <input
                id="username"
                type="text"
                placeholder="username"
                autoComplete="username"
                {...register("username")}
                className={clsx(
                  "pl-10 h-11 rounded-md mt-1 shadow-sm w-full outline-none",
                  "bg-white text-gray-800 placeholder:text-gray-400 border-teal-200",
                  "dark:bg-slate-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-slate-700"
                )}
              />
              <User className="absolute left-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.username && (
              <motion.p
                className="text-rose-500 text-xs mt-1 ml-1 mb-0"
                initial="hidden"
                animate="visible"
                variants={errorVariant}
              >
                {errors.username.message}
              </motion.p>
            )}
          </div>
          <div>
            <label
              className={clsx(
                "font-mono text-md",
                "text-teal-700 dark:text-teal-200"
              )}
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                className={clsx(
                  "pl-10 pr-10 h-11 rounded-md mt-1 shadow-sm font-mono w-full outline-none",
                  "bg-white text-gray-800 placeholder:text-gray-400 border-teal-200",
                  "dark:bg-slate-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-slate-700"
                )}
              />
              <Lock className="absolute left-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <button
                type="button"
                className="absolute right-3 top-4.5 cursor-pointer text-gray-400 hover:text-teal-600 transition"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                className="text-rose-500 text-xs mt-1 ml-1 mb-0"
                initial="hidden"
                animate="visible"
                variants={errorVariant}
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2">
              <Checkbox id="remember" />
              <span
                className={clsx("text-xs", "text-gray-500 dark:text-gray-400")}
              >
                Remember me
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Role</span>
              <Select value={role} onValueChange={(v) => setRoleLocal(v as UserRole)}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <a
              href="#"
              className={clsx(
                "text-xs font-bold transition-colors",
                "text-teal-700 hover:text-sky-700",
                "dark:text-sky-400 dark:hover:text-teal-200"
              )}
            >
              Forgot password?
            </a>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className={clsx(
              "w-full h-11 mt-2 font-lexend cursor-pointer font-bold text-lg rounded-lg transition-all shadow-xl flex items-center justify-center",
              "bg-linear-to-r from-teal-300 to-sky-400 text-teal-900 hover:from-teal-400 hover:to-sky-500",
              "dark:bg-linear-to-r transition-colors duration-150  dark:from-teal-600 dark:to-sky-700 dark:text-white dark:hover:from-teal-800 dark:hover:to-sky-900",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <motion.span
                className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
 
