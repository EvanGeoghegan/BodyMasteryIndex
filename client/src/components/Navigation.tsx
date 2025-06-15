import { Home, Dumbbell, Copy, Trophy, Calendar, BarChart3, Apple, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'supplements', label: 'Nutrition', icon: Apple },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'records', label: 'Records', icon: Trophy },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: Copy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-dark-secondary border-t border-dark-border">
      <div className="relative">
        {/* Left scroll indicator */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
            <button
              onClick={() => scroll('left')}
              className="bg-dark-secondary/90 backdrop-blur-sm p-1 rounded-r-md shadow-lg border-r border-dark-border"
            >
              <ChevronLeft size={16} className="text-accent-red" />
            </button>
          </div>
        )}
        
        {/* Right scroll indicator */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <button
              onClick={() => scroll('right')}
              className="bg-dark-secondary/90 backdrop-blur-sm p-1 rounded-l-md shadow-lg border-l border-dark-border"
            >
              <ChevronRight size={16} className="text-accent-red" />
            </button>
          </div>
        )}

        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 py-3 px-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center py-2 px-3 transition-colors rounded-lg whitespace-nowrap min-w-[72px] ${
                    isActive 
                      ? 'text-accent-red bg-accent-red/10' 
                      : 'text-text-secondary hover:text-accent-light-red hover:bg-dark-elevated'
                  }`}
                >
                  <Icon className="mb-1" size={18} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
