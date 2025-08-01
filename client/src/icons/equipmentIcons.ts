import {
  Dumbbell,
  Weight,
  Settings,
  Cable,
  CircleDot,
  Flame,
  Shield
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// This is now a mapping from string → Component
export const equipmentIcons: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  barbell: Weight,
  machine: Settings,
  cable: Cable,
  bodyweight: CircleDot,
  resistance: Flame,
  band: Shield
};
