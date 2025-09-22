import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "../tasks/TaskCard";
import { TaskModal } from "../tasks/TaskModal";
import { useState } from "react";
import { TaskStatus } from "@/lib/stores/task-store";
import useTaskStore from "@/lib/stores/task-store";
import { useToast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Member {
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: User | null;
  deadline?: string;
}

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  projectId: string;
  members: Member[];
}

export function KanbanColumn({ title, status, tasks, projectId, members }: KanbanColumnProps) {
  // Debug log members
  console.log('KanbanColumn members:', {
    title,
    status,
    members,
    memberCount: members.length,
    memberNames: members.map(m => m.user.name)
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const { createTask, updateTask, deleteTask } = useTaskStore();
  const { toast } = useToast();

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      await createTask(projectId, {
        ...data,
        status // Ensure the task is created in this column's status
      });
      toast({
        title: "Task created",
        description: "New task has been created successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error.message || "There was an error creating the task.",
      });
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!editingTask) return;
    try {
      await updateTask(projectId, editingTask._id, data);
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: error.message || "There was an error updating the task.",
      });
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(projectId, taskId);
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: error.message || "There was an error deleting the task.",
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <span className="text-sm text-muted-foreground">({tasks.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add task</span>
          </Button>
        </div>

        <div className="flex flex-col gap-3 min-h-[200px]">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => handleDeleteTask(task._id)}
            />
          ))}
        </div>

        {/* Create Task Modal */}
        <TaskModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
          initialStatus={status}
          projectMembers={members}
        />

        {/* Edit Task Modal */}
        {editingTask && (
          <TaskModal
            open={!!editingTask}
            onClose={() => setEditingTask(undefined)}
            onSubmit={handleUpdateTask}
            initialStatus={editingTask.status}
            task={editingTask}
            projectMembers={members}
            isEditing
          />
        )}
      </div>
    </Card>
  );
}