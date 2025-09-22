import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import useProjectStore from "@/lib/stores/project-store";
import useAuthStore from "@/lib/stores/auth-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectMenuProps {
  projectId: string;
  ownerId: string;
  onEdit: () => void;
}

export function ProjectMenu({ projectId, ownerId, onEdit }: ProjectMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteProject } = useProjectStore();
  const { user } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?._id === ownerId;

  const handleDelete = async () => {
    if (!isOwner) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only the project owner can delete this project.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
      navigate("/"); // Navigate back to dashboard
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete project",
        description: error.message || "There was an error deleting the project.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            {isOwner ? "Edit project" : "Update status"}
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete project
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}