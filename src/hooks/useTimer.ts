import { useState, useEffect, useCallback } from "react";

export interface TimerState {
  sector: number; // 0-3 (top, right, bottom, left)
  timeRemaining: number; // seconds
}

export function useTimer(isActive: boolean, cycleDuration: number = 10) {
  const [timer, setTimer] = useState<TimerState>({
    sector: 0,
    timeRemaining: cycleDuration,
  });

  useEffect(() => {
    if (!isActive) {
      setTimer({ sector: 0, timeRemaining: cycleDuration });
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => {
        const newRemaining = prev.timeRemaining - 0.1;
        
        if (newRemaining <= 0) {
          // Move to next sector
          return {
            sector: (prev.sector + 1) % 4,
            timeRemaining: cycleDuration,
          };
        }
        
        return {
          ...prev,
          timeRemaining: newRemaining,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, cycleDuration]);

  const getSectorName = useCallback((sector: number): string => {
    const names = ["Top", "Right", "Bottom", "Left"];
    return names[sector];
  }, []);

  return {
    ...timer,
    sectorName: getSectorName(timer.sector),
  };
}
