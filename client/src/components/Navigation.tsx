import { useState, useEffect } from "react";
import { Home, Dumbbell, UtensilsCrossed, BarChart3, Calendar, Cog, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the props that this component will accept
interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navLinks = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "workout",
    label: "Workout",
    icon: <Dumbbell className="w-6 h-6" />,
  },
  {
  id: "templates",
  label: "Templates",
  icon: <LayoutTemplate className="w-6 h-6" />,
},
  {
    id: "macros",
    label: "Macros",
    icon: <UtensilsCrossed className="w-6 h-6" />,
  },
  {
    id: "progress",
    label: "Progress",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Cog className="w-6 h-6" />,
  },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      <div className="flex justify-around items-center h-full max-w-2xl mx-auto px-2">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onTabChange(link.id)}
            className={cn(
              "flex flex-col items-center justify-center text-center w-16 transition-colors duration-200",
              activeTab === link.id
                ? "text-accent-red"
                : "text-text-disabled hover:text-text-secondary"
            )}
          >
            {link.icon}
            <span className="text-xs mt-1 font-medium">{link.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
