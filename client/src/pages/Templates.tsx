import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, LayoutTemplate, Edit } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import { storage } from "@/lib/storage";
import { Template, InsertTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TemplatesProps {
  onUseTemplate: (template: Template) => void;
}

export default function Templates({ onUseTemplate }: TemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<InsertTemplate>({
    name: "",
    description: "",
    category: "",
    type: "strength",
    estimatedDuration: 60,
    exercises: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const loadedTemplates = storage.getTemplates();
    setTemplates(loadedTemplates);
  };

  const openCreateDialog = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      type: "strength",
      estimatedDuration: 60,
      exercises: [],
    });
    setEditingTemplate(null);
    setShowCreateDialog(true);
  };

  const openEditDialog = (template: Template) => {
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category || "",
      type: template.type || "strength",
      estimatedDuration: template.estimatedDuration || 60,
      exercises: template.exercises,
    });
    setEditingTemplate(template);
    setShowCreateDialog(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTemplate) {
        storage.updateTemplate(editingTemplate.id, formData);
        toast({
          title: "Success",
          description: "Template updated successfully!",
        });
      } else {
        storage.createTemplate(formData);
        toast({
          title: "Success",
          description: "Template created successfully!",
        });
      }

      loadTemplates();
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (template: Template) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        storage.deleteTemplate(template.id);
        loadTemplates();
        toast({
          title: "Success",
          description: "Template deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        });
      }
    }
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        { name: "", sets: 3, suggestedWeight: 0, suggestedReps: 10, type: "strength" }
      ]
    });
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updatedExercises = formData.exercises.map((exercise, i) =>
      i === index ? { ...exercise, [field]: value } : exercise
    );
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const removeExercise = (index: number) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: updatedExercises });
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary pt-[env(safe-area-inset-top,32px)] p-2 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left side: Page Icon + Title */}
          <div className="flex items-center">
            <LayoutTemplate className="text-accent-red mr-4" size={28} />
            <div>
              <div className="mt-4">
              <h2 className="text-xl font-bold text-text-primary font-heading">
                Workout Templates
              </h2>
              <p className="text-text-secondary mt-1">Start your session quickly.</p>
            </div>
            </div>
          </div>

          {/* Right side: App Logo */}
          <div className="w-14 h-14 bg-dark-elevated rounded-full flex items-center justify-center overflow-hidden border-2 border-dark-border flex-shrink-0">
            <img
              src="/assets/icon.png"
              alt="Body Mastery Index Icon"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">No templates found</p>
            <Button
              onClick={openCreateDialog}
              className="bg-accent-green hover:bg-green-500 text-dark-primary"
            >
              Create Your First Template
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => onUseTemplate(template)}
              onEdit={() => openEditDialog(template)}
              onDelete={() => handleDelete(template)}
            />
          ))
        )}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-dark-secondary border border-dark-border max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-text-primary font-heading">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-text-secondary text-sm font-medium mb-2 block">
                Template Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-dark-elevated text-text-primary border-dark-border"
                placeholder="e.g., Push Day"
              />
            </div>

            <div>
              <label className="text-text-secondary text-sm font-medium mb-2 block">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-dark-elevated text-text-primary border-dark-border"
                placeholder="Brief description of the workout"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm font-medium mb-2 block">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-dark-elevated text-text-primary border-dark-border"
                  placeholder="e.g., Push, Pull, Legs"
                />
              </div>
              <div>
                <label className="text-text-secondary text-sm font-medium mb-2 block">
                  Duration (min)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                  className="bg-dark-elevated text-text-primary border-dark-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm font-medium mb-2 block">
                  Template Type
                </label>
                <Select value={formData.type || "strength"} onValueChange={(value: "strength" | "cardio" | "core"| "sports") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-dark-elevated text-text-primary border-dark-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-secondary border-dark-border">
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-text-secondary text-sm font-medium">
                  Exercises
                </label>
                <Button
                  onClick={addExercise}
                  size="sm"
                  className="bg-accent-red hover:bg-accent-light-red text-white"
                >
                  <Plus size={14} />
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="bg-dark-elevated p-3 rounded border border-dark-border">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        placeholder="Exercise name"
                        className="bg-dark-primary text-text-primary border-dark-border text-sm"
                      />
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                        placeholder="Sets"
                        className="bg-dark-primary text-text-primary border-dark-border text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Select value={exercise.type || "strength"} onValueChange={(value: "strength" | "cardio") => updateExercise(index, 'type', value)}>
                        <SelectTrigger className="bg-dark-primary text-text-primary border-dark-border text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(0, 15%, 10%)', color: 'white' }}>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="cardio">Cardio</SelectItem>
                        </SelectContent>
                      </Select>


                    </div>

                    {exercise.type === "cardio" ? (
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          value={exercise.suggestedDuration || ''}
                          onChange={(e) => updateExercise(index, 'suggestedDuration', parseFloat(e.target.value) || 0)}
                          placeholder="Duration (min)"
                          className="bg-dark-primary text-text-primary border-dark-border text-sm"
                        />
                        <Input
                          type="number"
                          value={exercise.suggestedDistance || ''}
                          onChange={(e) => updateExercise(index, 'suggestedDistance', parseFloat(e.target.value) || 0)}
                          placeholder="Distance"
                          className="bg-dark-primary text-text-primary border-dark-border text-sm"
                        />
                        <Button
                          onClick={() => removeExercise(index)}
                          size="sm"
                          variant="outline"
                          className="border-dark-border text-text-secondary hover:text-accent-red"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          value={exercise.suggestedWeight || ''}
                          onChange={(e) => updateExercise(index, 'suggestedWeight', parseFloat(e.target.value) || 0)}
                          placeholder="Weight"
                          className="bg-dark-primary text-text-primary border-dark-border text-sm"
                        />
                        <Input
                          type="number"
                          value={exercise.suggestedReps || ''}
                          onChange={(e) => updateExercise(index, 'suggestedReps', parseInt(e.target.value) || 0)}
                          placeholder="Reps"
                          className="bg-dark-primary text-text-primary border-dark-border text-sm"
                        />
                        <Button
                          onClick={() => removeExercise(index)}
                          size="sm"
                          variant="outline"
                          className="border-dark-border text-text-secondary hover:text-accent-red"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={() => setShowCreateDialog(false)}
                variant="outline"
                className="flex-1 border-dark-border text-text-secondary hover:text-text-primary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-accent-navy hover:bg-accent-light-navy text-white"
              >
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
