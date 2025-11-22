import { motion, SVGMotionProps } from "framer-motion";

interface LogoProps extends SVGMotionProps<SVGSVGElement> {
  className?: string;
}

const Logo = ({ className, ...props }: LogoProps) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -10, scaleX: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      scaleX: 1,
      transition: {
        delay: i * 0.15 + 0.3,
        stiffness: 120,
        damping: 12,
      },
    }),
  };

  return (
    <motion.svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`z-10 ${className || ""}`}
      initial="hidden"
      animate="visible"
      {...props}
    >
      <motion.rect
        x="10"
        y="10"
        width="80"
        height="100"
        rx="12"
        className="fill-background stroke-muted-foreground/20"
        strokeWidth="2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.rect
        x="20"
        y="22"
        width="30"
        height="6"
        rx="3"
        className="fill-zinc-300 dark:fill-zinc-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      <motion.circle
        cx="80"
        cy="25"
        r="3"
        className="fill-zinc-300 dark:fill-zinc-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
      <motion.circle
        cx="72"
        cy="25"
        r="3"
        className="fill-blue-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      />

      <motion.rect
        custom={1}
        variants={itemVariants}
        x="20"
        y="42"
        width="60"
        height="8"
        rx="4"
        fill="url(#grad-amber)"
      />
      <motion.rect
        custom={2}
        variants={itemVariants}
        x="20"
        y="56"
        width="40"
        height="8"
        rx="4"
        fill="url(#grad-teal)"
      />
      <motion.rect
        custom={3}
        variants={itemVariants}
        x="20"
        y="70"
        width="55"
        height="8"
        rx="4"
        fill="url(#grad-berry)"
      />
      <motion.rect
        custom={4}
        variants={itemVariants}
        x="20"
        y="84"
        width="45"
        height="8"
        rx="4"
        fill="url(#grad-indigo)"
      />

      <motion.rect
        x="10"
        width="80"
        height="2"
        className="fill-primary"
        initial={{ y: 12, opacity: 0 }}
        animate={{
          y: [12, 108],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          y: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          },
          opacity: {
            duration: 0.3,
          },
        }}
        style={{ filter: "url(#clean-glow)" }}
      />

      <defs>
        <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FBBF24" /> {/* amber-400 */}
          <stop offset="100%" stopColor="#F97316" /> {/* orange-500 */}
        </linearGradient>

        <linearGradient id="grad-teal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2DD4BF" /> {/* teal-400 */}
          <stop offset="100%" stopColor="#10B981" /> {/* emerald-500 */}
        </linearGradient>

        <linearGradient id="grad-berry" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F472B6" /> {/* pink-400 */}
          <stop offset="100%" stopColor="#A855F7" /> {/* purple-500 */}
        </linearGradient>

        <linearGradient id="grad-indigo" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818CF8" /> {/* indigo-400 */}
          <stop offset="100%" stopColor="#3B82F6" /> {/* blue-500 */}
        </linearGradient>

        <filter id="clean-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </motion.svg>
  );
};

export default Logo;
