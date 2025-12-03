import { useState, useEffect } from 'react';
import { SpiralAnimation } from './SpiralAnimation';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 4000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleEnter = () => {
    if (isReady) {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black"
        >
          <SpiralAnimation />
          
          {/* Enter button overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.button
              onClick={handleEnter}
              disabled={!isReady}
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: isReady ? 1 : 0.3,
                scale: isReady ? [1, 1.05, 1] : 1
              }}
              transition={{ 
                opacity: { duration: 0.3 },
                scale: { duration: 0.6, repeat: isReady ? Infinity : 0, repeatDelay: 1 }
              }}
              className={`text-4xl md:text-6xl font-bold text-white tracking-wider transition-all ${
                isReady ? 'cursor-pointer hover:text-white/80' : 'cursor-wait'
              }`}
            >
              enter
            </motion.button>
            
            {!isReady && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="mt-4 text-white/40 text-sm"
              >
                loading...
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
