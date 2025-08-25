import { useState, useEffect } from "react";
import { Home, Trophy, Dumbbell, UtensilsCrossed, BarChart3, Calendar, Cog, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

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

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-20 z-40 transition-all duration-300",
        isScrolled
          ? "bg-dark-secondary/80 backdrop-blur-lg border-t border-dark-border"
          : "bg-dark-secondary border-t border-dark-border"
      )}
    >
      <div className="relative h-full max-w-md mx-auto">
        {/* Animated active background pill */}
        <div className="absolute inset-y-2 left-2 right-2 pointer-events-none">
          <motion.div
            layoutId="nav-active-bg"
            className="h-16 rounded-2xl bg-dark-elevated/60 border border-dark-border"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            // Position under the active item via CSS grid trick below
            style={{
              gridColumn: `${Math.max(navLinks.findIndex(n => n.id === activeTab) + 1, 1)} / span 1`,
            }}
          />
        </div>

        {/* Scrollable row */}
        <div className="grid grid-flow-col auto-cols-[minmax(64px,1fr)] overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x h-full px-2 gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center text-center rounded-2xl",
                  "transition-colors duration-200"
                )}
              >
                <motion.div
                  className={cn(
                    "flex items-center justify-center w-10 h-10",
                    isActive ? "text-accent-red" : "text-text-secondary"
                  )}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <motion.span
                  className={cn("text-[11px] mt-1", isActive ? "text-accent-red" : "text-text-disabled")}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0.75, y: isActive ? 0 : 2 }}
                  transition={{ duration: 0.18 }}
                >
                  {link.label}
                </motion.span>

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
