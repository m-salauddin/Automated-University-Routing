/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Lock, ShieldAlert } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";

import { setAuthenticated, setUserData } from "@/store/authSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/auth";

const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotOpen, setIsForgotOpen] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!rememberMe) {
      toast.error("Validation Error", {
        description: "You must check 'Remember me' to login.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(data);

      if (result.success) {
        const { accessToken, user } = result.data;

        let decodedToken: any = {};
        try {
          decodedToken = jwtDecode(accessToken);
        } catch (e) {
          console.error("Token decode failed", e);
        }

        dispatch(setAuthenticated(true));

        const finalUsername =
          user?.username || decodedToken?.username || data.username;
        const rawRole = user?.role || decodedToken?.role || "student";
        const finalRole = String(rawRole).toLowerCase();

        dispatch(
          setUserData({
            username: finalUsername,
            role: finalRole as any,
            email: user?.email || "",
            department_name:
              user?.["department name"] || user?.department_name || "",
            department_id: user?.department_id || null,
            semester_name: user?.semester_name || null,
            student_id: user?.student_id || null,
          })
        );

        toast.success("Login successful!", {
          description: `Welcome back, ${finalUsername}`,
          duration: 3000,
        });

          const redirectPath = searchParams.get("redirect");
          router.push(redirectPath || "/dashboard/analytics");
      } else {
        toast.error("Login Failed", {
          description: result.message || "Invalid credentials provided.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("System Error", {
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Animation Variants ---
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

  const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  return (
    <div
      className={clsx(
        "min-h-screen flex items-center justify-center font-lexend",
        "bg-gray-50 md:px-10 px-4",
        "dark:bg-black",
        "transition-all relative"
      )}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className={clsx(
          "relative w-full max-w-sm flex flex-col items-center rounded-xl p-5 sm:p-8 pt-14",
          "bg-white border border-gray-200 text-zinc-900 shadow-xl",
          "dark:bg-[#111113] dark:border-zinc-800 dark:text-gray-100",
          "shadow-2xl"
        )}
      >
        <div
          className={clsx(
            "absolute -top-8 left-1/2 -translate-x-1/2 px-8 py-2 rounded-lg font-medium text-xl sm:text-2xl text-center tracking-wide shadow-lg",
            "bg-black text-white",
            "dark:bg-white dark:text-black"
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
              "bg-gray-100 text-black",
              "dark:bg-zinc-900 dark:text-white"
            )}
          >
            <User className="w-8 h-8" />
          </div>
        </motion.div>
        <form
          className="w-full space-y-4 mt-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              className={clsx(
                "text-sm font-medium",
                "text-zinc-700 dark:text-zinc-300"
              )}
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative mt-1.5">
              <input
                id="username"
                type="text"
                placeholder="username"
                autoComplete="username"
                {...register("username")}
                className={clsx(
                  "pl-10 h-11 rounded-md shadow-sm w-full outline-none transition-all border",
                  "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-black focus:ring-1 focus:ring-black",
                  "dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-zinc-500 dark:border-zinc-700 dark:focus:border-white dark:focus:ring-white"
                )}
              />
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.username && (
              <motion.p
                className="text-red-600 dark:text-red-400 text-xs mt-1 ml-1 mb-0 font-medium"
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
                "text-sm font-medium",
                "text-zinc-700 dark:text-zinc-300"
              )}
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={clsx(
                  "pl-10 pr-10 h-11 rounded-md shadow-sm w-full outline-none transition-all border",
                  "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-black focus:ring-1 focus:ring-black",
                  "dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-zinc-500 dark:border-zinc-700 dark:focus:border-white dark:focus:ring-white"
                )}
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <button
                type="button"
                className="absolute right-3 top-3.5 cursor-pointer text-gray-400 hover:text-black dark:hover:text-white transition"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                className="text-red-600 dark:text-red-400 text-xs mt-1 ml-1 mb-0 font-medium"
                initial="hidden"
                animate="visible"
                variants={errorVariant}
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="data-[state=checked]:bg-black data-[state=checked]:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black border-gray-300 dark:border-zinc-600"
              />
              <span
                className={clsx(
                  "text-xs font-medium",
                  "text-zinc-600 dark:text-zinc-400"
                )}
              >
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className={clsx(
                "text-xs font-bold relative cursor-pointer group",
                "text-zinc-900",
                "dark:text-white"
              )}
            >
              Forgot password?
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-zinc-900 dark:bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className={clsx(
              "w-full h-11 mt-4 cursor-pointer font-bold text-md rounded-lg transition-all shadow-md flex items-center justify-center",
              "bg-black text-white hover:bg-zinc-800",
              "dark:bg-white dark:text-black dark:hover:bg-zinc-200",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <motion.span
                className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </motion.div>

      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-md font-lexend bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-0 overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={modalContentVariants}
            className="flex flex-col items-center text-center p-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4"
            >
              <ShieldAlert className="w-8 h-8 text-black dark:text-white" />
            </motion.div>

            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Reset Password
              </DialogTitle>
            </DialogHeader>

            <DialogDescription className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
              For security reasons, self-service password reset is disabled.
              Please contact your <strong>System Administrator</strong> to
              request a reset.
            </DialogDescription>

            <div className="mt-8 w-full">
              <Button
                onClick={() => setIsForgotOpen(false)}
                className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors font-bold"
              >
                Understood
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
