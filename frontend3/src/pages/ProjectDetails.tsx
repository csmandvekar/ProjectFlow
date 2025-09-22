import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useProjectStore from "@/lib/stores/project-store";
import useTaskStore from "@/lib/stores/task-store";
import useAuthStore from "@/lib/stores/auth-store";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useToast } from "@/components/ui/use-toast";
import { AddTeamMemberButton } from "@/components/projects/AddTeamMemberButton";
import { ProjectStats } from "@/components/projects/ProjectStats";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, fetchProject, error: projectError } = useProjectStore();
  const { tasks, fetchTasks, error: taskError } = useTaskStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjectData = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        await fetchProject(id);
        await fetchTasks(id);
      } catch (error: any) {
        console.error("Error loading project data:", error);
        const errorMessage = error.response?.data?.message || error.message;
        
        toast({
          variant: "destructive",
          title: "Error loading project",
          description: errorMessage || "Failed to load project details",
        });

        // If project not found, navigate to 404
        if (error.response?.status === 404) {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [id, fetchProject, fetchTasks, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return null; // The useEffect will handle navigation
  }

  // Debug log project members
  console.log('Project members:', {
    currentProject,
    members: currentProject.members,
    user,
    combinedMembers: [
      ...(!currentProject.members.some(m => m.user._id === user?._id) && user
        ? [{
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              avatar: user.avatar
            },
            role: 'member',
            joinedAt: new Date().toISOString()
          }]
        : []),
      ...currentProject.members
    ]
  });

  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] bg-background">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentProject.title}</h1>
            {currentProject.description && (
              <p className="mt-2 text-muted-foreground">{currentProject.description}</p>
            )}
          </div>
          <AddTeamMemberButton
            projectId={currentProject._id}
            currentMembers={Array.isArray(currentProject.members) ? currentProject.members : []}
            onMemberAdded={() => fetchProject(currentProject._id)}
          />
        </div>
      </div>

      <ProjectStats 
        tasks={tasks}
        members={currentProject.members}
      />

      <KanbanBoard 
        projectId={currentProject._id} 
        tasks={tasks} 
        members={[
          // Add current user as a member if they're not already in the list
          ...(!currentProject.members.some(m => m.user._id === user?._id) && user
            ? [{
                user: {
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar
                },
                role: 'member',
                joinedAt: new Date().toISOString()
              }]
            : []),
          ...currentProject.members
        ]}
      />
    </div>
  );
}