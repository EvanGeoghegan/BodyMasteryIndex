import { Home, Dumbbell, Copy, Trophy, Calendar, BarChart3, Pill } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'templates', label: 'Templates', icon: Copy },
    { id: 'records', label: 'Records', icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-dark-secondary border-t border-dark-border">
      <div className="grid grid-cols-5 gap-2 py-3 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-3 px-2 transition-colors rounded-lg ${
                isActive 
                  ? 'text-accent-red bg-accent-red/10' 
                  : 'text-text-secondary hover:text-accent-light-red hover:bg-dark-elevated'
              }`}
            >
              <Icon className="mb-1" size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
