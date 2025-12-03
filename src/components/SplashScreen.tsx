import { useState, useEffect } from 'react';
import { SpiralAnimation } from './SpiralAnimation';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 4000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  // Allow clicking to skip
  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black cursor-pointer"
          onClick={handleSkip}
        >
          <SpiralAnimation />
          
          {/* Logo overlay */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider">
              stackd
            </h1>
            <p className="mt-2 text-white/60 text-sm">
              Stack Your Earnings
            </p>
          </motion.div>

          {/* Skip hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs"
          >
            Tap to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
