import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Home, Dumbbell, Apple, Calendar, Trophy, BarChart3, Copy, Settings } from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  details: string[];
  tips?: string[];
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: "Welcome to Body Mastery Index",
      description: "Your complete offline fitness tracking companion",
      icon: Home,
      details: [
        "Track workouts, nutrition, and progress completely offline",
        "All data stays on your device for privacy",
        "Works anywhere - gym, home, or on the go",
        "No internet connection required"
      ],
      tips: ["Swipe or use arrow keys to navigate the bottom tabs"]
    },
    {
      id: 1,
      title: "Dashboard - Your Daily Overview",
      description: "See your fitness progress at a glance",
      icon: Home,
      details: [
        "View today's motivational quote",
        "Quick workout creation and access to last workout",
        "Protein and water tracking circles (click to navigate to nutrition)",
        "Weekly assessment tracking for consistent progress"
      ],
      tips: ["Click the protein/water circles to log nutrition quickly"]
    },
    {
      id: 2,
      title: "Workout - Log Your Training",
      description: "Create and track strength, cardio, and core exercises",
      icon: Dumbbell,
      details: [
        "Add strength exercises with sets, reps, and weights",
        "Track cardio with duration and distance",
        "Log core exercises with time or reps",
        "Built-in rest timer between sets",
        "Complete sets with satisfaction checkmarks"
      ],
      tips: ["Use templates for quick workout setup", "Rest timer helps maintain proper recovery"]
    },
    {
      id: 3,
      title: "Nutrition - Fuel Your Progress",
      description: "Track supplements, protein, and hydration daily",
      icon: Apple,
      details: [
        "Log daily supplement intake with timing",
        "Track protein goals with custom amounts",
        "Monitor water intake with quick buttons",
        "Undo recent entries if needed",
        "Visual progress bars show daily targets"
      ],
      tips: ["Set daily goals in Settings", "Use quick-add buttons for efficiency"]
    },
    {
      id: 4,
      title: "Calendar - Visualize Consistency",
      description: "See your workout patterns and rest days",
      icon: Calendar,
      details: [
        "Color-coded workout types (blue: strength, green: cardio, yellow: core)",
        "Red borders indicate multiple consecutive rest days",
        "Click any date to see workout details",
        "Track streaks and consistency patterns"
      ],
      tips: ["Consistency beats intensity - aim for regular activity"]
    },
    {
      id: 5,
      title: "Records - Track Personal Bests",
      description: "Monitor strength progress and achievements",
      icon: Trophy,
      details: [
        "Log maximum weights for key exercises",
        "View predicted 1-rep max calculations",
        "Get progressive overload recommendations",
        "Track strength gains over time"
      ],
      tips: ["Update personal bests after successful heavy sessions"]
    },
    {
      id: 6,
      title: "Progress - Analyze Your Journey",
      description: "Comprehensive analytics and trends",
      icon: BarChart3,
      details: [
        "Workout volume and frequency charts",
        "Cardio distance and duration tracking",
        "Body weight progression",
        "Weekly assessment results",
        "Nutrition adherence patterns"
      ],
      tips: ["Review weekly to identify patterns and adjust training"]
    },
    {
      id: 7,
      title: "Templates - Quick Workout Setup",
      description: "Save and reuse your favorite workouts",
      icon: Copy,
      details: [
        "Create templates from completed workouts",
        "Pre-built templates for common routines",
        "Categorize by workout type and muscle groups",
        "One-click workout creation"
      ],
      tips: ["Build templates for your regular training split"]
    },
    {
      id: 8,
      title: "Settings - Customize Your Experience",
      description: "Personalize goals and preferences",
      icon: Settings,
      details: [
        "Set daily protein and water goals",
        "Configure assessment exercises (push-ups, pull-ups)",
        "Track current and target body weight",
        "Export data for backup",
        "Reset data if needed"
      ],
      tips: ["Set realistic goals you can achieve consistently"]
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    localStorage.setItem('bmi_tutorial_completed', 'true');
    onClose();
  };

  const completeTutorial = () => {
    localStorage.setItem('bmi_tutorial_completed', 'true');
    onClose();
  };

  const currentStepData = tutorialSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-dark-secondary border-dark-border text-text-primary">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-accent-red font-montserrat">
              {currentStepData.title}
            </DialogTitle>
            <Button
              onClick={skipTutorial}
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-accent-red"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-accent-red'
                    : index < currentStep
                    ? 'bg-accent-red/50'
                    : 'bg-dark-border'
                }`}
              />
            ))}
          </div>

          {/* Icon and Description */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center">
                <Icon className="text-accent-red" size={32} />
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-text-primary">Key Features:</h4>
            <ul className="space-y-2">
              {currentStepData.details.map((detail, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 bg-accent-red rounded-full mt-2 flex-shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          {currentStepData.tips && (
            <div className="bg-dark-primary rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-accent-red text-sm">💡 Pro Tips:</h4>
              {currentStepData.tips.map((tip, index) => (
                <p key={index} className="text-xs text-text-secondary leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-text-secondary disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </Button>

            <span className="text-xs text-text-secondary">
              {currentStep + 1} of {tutorialSteps.length}
            </span>

            {currentStep === tutorialSteps.length - 1 ? (
              <Button
                onClick={completeTutorial}
                className="bg-accent-red hover:bg-accent-red/90 text-white"
                size="sm"
              >
                Get Started
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-accent-red"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}