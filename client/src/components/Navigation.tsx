import React, { useState, useEffect, useRef } from "react";
import { Home, Trophy, Dumbbell, UtensilsCrossed, BarChart3, Calendar, Cog, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, animate } from "framer-motion";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navLinks = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "workout",   label: "Workout",   icon: Dumbbell },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "macros",    label: "Macros",    icon: UtensilsCrossed },
  { id: "progress",  label: "Progress",  icon: BarChart3 },
  { id: "records",   label: "Records",   icon: Trophy },
  { id: "calendar",  label: "Calendar",  icon: Calendar },
  { id: "settings",  label: "Settings",  icon: Cog },
];

// Animate horizontal scrolling for a given element
function animateScroll(
  el: HTMLElement,
  from: number,
  to: number,
  duration: number
) {
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.scrollLeft = from + (to - from) * progress;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

function snapToDashboard(el: HTMLElement) {
  const width = el.clientWidth;
  animateScroll(el, el.scrollLeft, width, 600);
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number | null>(null);

  const animateScroll = (el: HTMLElement, left: number) => {
    animate(el.scrollLeft, left, {
      duration: 0.3,
      ease: "easeOut",
      onUpdate: (v) => {
        el.scrollLeft = v;
      },
    });
  };

  const snapToActive = () => {
    const el = navRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLButtonElement>(`button[data-id="${activeTab}"]`);
    if (!item) return;
    const left = item.offsetLeft - el.clientWidth / 2 + item.clientWidth / 2;
    animateScroll(el, left);
  };

  const handleNavScroll = () => {
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      snapToActive();
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    snapToActive();
  }, [activeTab]);


  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-20 z-40 transition-all duration-300 pb-4",
        isScrolled
          ? "bg-dark-secondary/80 backdrop-blur-lg"
          : "bg-dark-secondary"
      )}
    >
      <div className="relative h-full max-w-md mx-auto">
        {/* Scrollable row */}
        <div
          ref={navRef}
          onScroll={handleNavScroll}
          className="grid grid-flow-col auto-cols-[minmax(48px,1fr)] overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x h-full px-2 gap-1"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                data-id={link.id}
                onClick={() => onTabChange(link.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center text-center rounded-2xl h-full",
                  "transition-colors duration-200"
                )}
              >
                <motion.div
                  className={cn(
                    "flex items-center justify-center",
                    isActive ? "text-accent-red" : "text-text-secondary"
                  )}
                >
                  <Icon className={isActive ? "w-8 h-8" : "w-6 h-6"} />
                </motion.div>
                {isActive && (
                  <motion.span
                    className="text-[11px] mt-0 text-accent-red"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {link.label}
                  </motion.span>
                )}

                {/* Active underline */}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-accent-red"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
