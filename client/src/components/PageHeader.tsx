import { ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <header className="bg-dark-secondary shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top,0px)+2rem)] pb-4">
        <div className="flex items-center gap-x-3">
          {icon}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-text-primary font-heading leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-text-secondary text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="w-14 h-14 bg-dark-elevated rounded-full flex items-center justify-center overflow-hidden border-2 border-dark-border flex-shrink-0">
          <img
            src="/assets/icon.png"
            alt="Body Mastery Index Icon"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
