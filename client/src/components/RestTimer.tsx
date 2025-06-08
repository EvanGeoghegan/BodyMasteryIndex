import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pause, RotateCcw, X } from "lucide-react";

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime?: number; // in seconds
}

export default function RestTimer({ isOpen, onClose, initialTime = 150 }: RestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeRemaining(initialTime);
      setIsRunning(true);
    }
  }, [isOpen, initialTime]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Could add notification sound here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeRemaining(initialTime);
    setIsRunning(false);
  };

  const handleClose = () => {
    setIsRunning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-secondary border border-dark-border max-w-sm w-full mx-4">
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Rest Timer</h3>
          <div className="text-6xl font-bold text-accent-green mb-6">
            {formatTime(timeRemaining)}
          </div>
          <div className="space-y-3">
            <Button
              onClick={toggleTimer}
              className="w-full bg-accent-green hover:bg-green-500 text-dark-primary font-semibold py-3"
              disabled={timeRemaining === 0}
            >
              <Pause className="mr-2" size={16} />
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="w-full bg-dark-elevated hover:bg-dark-border text-text-primary border-dark-border"
            >
              <RotateCcw className="mr-2" size={16} />
              Reset
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full text-text-secondary hover:text-text-primary"
            >
              <X className="mr-2" size={16} />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
