import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import masterExerciseList from "@/lib/exercises.json";

interface ExerciseOption {
  id: string;
  name: string;
  category: string;
  equipment?: string[];
}

interface ExerciseComboboxProps {
  value: string;
  onSelect: (value: string) => void;
  filter?: "strength" | "cardio" | "core" | "sports"; // Optional prop to filter by
}

export default function ExerciseCombobox({ value, onSelect, filter }: ExerciseComboboxProps) {
  const [open, setOpen] = useState(false);

  // Filter the master list based on the workout type if provided
  const filteredExercises = filter
    ? masterExerciseList.filter((exercise) => exercise.category === filter)
    : masterExerciseList;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent text-text-primary font-medium text-lg border-none outline-none p-0 h-auto hover:bg-transparent"
        >
          {value ? value : "Select exercise..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0 bg-dark-secondary border-dark-border">
        <Command>
          <CommandInput placeholder="Search exercise..." className="text-text-primary" />
          <CommandList>
            <CommandEmpty>No exercise found.</CommandEmpty>
            <CommandGroup>
              {filteredExercises.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={exercise.name}
                  onSelect={(currentValue) => {
                    onSelect(currentValue === value ? "" : exercise.name);
                    setOpen(false);
                  }}
                  className="text-text-primary hover:!bg-accent-red/20 aria-selected:!bg-accent-red"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === exercise.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {exercise.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
