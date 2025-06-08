import { Template } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface TemplateCardProps {
  template: Template;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  return (
    <div 
      onClick={onUse}
      className="bg-dark-secondary rounded-xl p-5 border border-dark-border hover:border-accent-green transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary">{template.name}</h3>
          <p className="text-text-secondary text-sm">{template.description}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-text-disabled text-xs">
              {template.exercises.length} exercises
            </span>
            {template.estimatedDuration && (
              <span className="text-text-disabled text-xs">
                ~{template.estimatedDuration} min
              </span>
            )}
            {template.category && (
              <span className="text-text-disabled text-xs bg-dark-elevated px-2 py-1 rounded">
                {template.category}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-accent-green p-1"
          >
            <Edit size={16} />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-accent-red p-1"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
