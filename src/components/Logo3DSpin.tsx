import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import stackdLogo from "@/assets/stackd-logo-new.png";

interface Logo3DSpinProps {
  className?: string;
  desktopSize?: number;
  mobileSize?: number;
  alt?: string;
}

const Logo3DSpin = ({
  className = "",
  desktopSize = 220,
  mobileSize = 160,
  alt = "stackd logo",
}: Logo3DSpinProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Motion value for shadow sync
  const rotateY = useMotionValue(0);
  
  // Transform rotateY to shadow offset (-40 to 40 maps to shadow shift)
  const shadowX = useTransform(rotateY, [-40, 0, 40], [12, 0, -12]);
  const shadowOpacity = useTransform(rotateY, [-40, 0, 40], [0.5, 0.35, 0.5]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  const size = isMobile ? mobileSize : desktopSize;

  // Static render for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ perspective: "1600px" }}
      >
        <img
          src={stackdLogo}
          alt={alt}
          width={size}
          height={size}
          style={{
            filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.35))",
            transform: "rotateX(8deg)",
          }}
        />
      </div>
    );
  }

  // Animation configuration based on device
  const config = isMobile
    ? {
        rotateY: [0, 28, -28, 0],
        rotateX: 8,
        scale: [1, 1.025, 1.025, 1],
        y: [0, -3, 0],
        duration: 7.5,
        repeatDelay: 1.6,
      }
    : {
        rotateY: [0, 40, -40, 0],
        rotateX: 10,
        scale: [1, 1.04, 1.04, 1],
        y: [0, -6, 0],
        duration: 6.5,
        repeatDelay: 1.2,
      };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ perspective: "1600px" }}
    >
      <motion.img
        src={stackdLogo}
        alt={alt}
        width={size}
        height={size}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
          rotateY,
        }}
        animate={
          isHovering && !isMobile
            ? {
                rotateY: 0,
                rotateX: config.rotateX,
                scale: 1.02,
                y: -4,
              }
            : {
                rotateY: config.rotateY,
                rotateX: config.rotateX,
                scale: config.scale,
                y: config.y,
              }
        }
        transition={
          isHovering && !isMobile
            ? {
                duration: 0.4,
                ease: "easeOut",
              }
            : {
                rotateY: {
                  duration: config.duration,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: config.repeatDelay,
                },
                rotateX: {
                  duration: 0,
                },
                scale: {
                  duration: config.duration,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: config.repeatDelay,
                },
                y: {
                  duration: config.duration * 0.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse",
                },
              }
        }
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
      />
      {/* Dynamic shadow layer */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: size * 0.7,
          height: size * 0.15,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)",
          filter: "blur(12px)",
          x: shadowX,
          opacity: shadowOpacity,
          bottom: isMobile ? -10 : -20,
        }}
        animate={
          isHovering && !isMobile
            ? { x: 0, opacity: 0.3, scale: 1.1 }
            : undefined
        }
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
};

export default Logo3DSpin;
