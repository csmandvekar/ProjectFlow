import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import useProjectStore, { ProjectStatus } from "@/lib/stores/project-store";
import useAuthStore from "@/lib/stores/auth-store";

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  deadline?: string;
  owner: Member;
}

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const { updateProject } = useProjectStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active" as ProjectStatus,
    deadline: "",
  });

  const isOwner = user?._id === project.owner._id;

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || "",
        status: project.status,
        deadline: project.deadline ? format(new Date(project.deadline), "yyyy-MM-dd") : "",
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare update data based on user role
    const updateData = isOwner
      ? formData // Owner can update all fields
      : { status: formData.status }; // Non-owners can only update status

    if (isOwner && !formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Title is required",
        description: "Please enter a project title",
      });
      return;
    }

    setLoading(true);
    try {
      await updateProject(project._id, updateData);
      toast({
        title: isOwner ? "Project updated" : "Project status updated",
        description: isOwner 
          ? "Your changes have been saved successfully."
          : "The project status has been updated successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isOwner ? "Failed to update project" : "Failed to update status",
        description: error.response?.data?.message || error.message || "There was an error updating the project.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-surface border-border">
        <DialogHeader>
          <DialogTitle>
            {isOwner ? "Edit Project" : "Update Project Status"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isOwner && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Project title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-surface/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Project description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-surface/50 border-border/50 min-h-[100px]"
                />
              </div>
            </>
          )}

          <div className={isOwner ? "grid grid-cols-2 gap-4" : "space-y-2"}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isOwner && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="bg-surface/50 border-border/50"
                />
              </div>
            )}
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                isOwner ? "Save changes" : "Update status"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}