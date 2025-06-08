import { Home, Dumbbell, Copy, Trophy } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'templates', label: 'Templates', icon: Copy },
    { id: 'records', label: 'Records', icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-dark-secondary border-t border-dark-border">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive 
                  ? 'text-accent-navy' 
                  : 'text-text-secondary hover:text-accent-light-navy'
              }`}
            >
              <Icon className="text-xl mb-1" size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
