import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import useProjectStore from "@/lib/stores/project-store";
import { format } from "date-fns";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const { toast } = useToast();
  const { createProject, loading } = useProjectStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd'), // Default to 1 week from now
    status: "active" as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onClose();
      setFormData({
        title: "",
        description: "",
        deadline: format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd'),
        status: "active" as const
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create project",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-surface border-border">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Title</label>
            <Input
              placeholder="Enter project title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-surface/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-surface/50 border-border/50 min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Deadline</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
              className="bg-surface/50 border-border/50"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}