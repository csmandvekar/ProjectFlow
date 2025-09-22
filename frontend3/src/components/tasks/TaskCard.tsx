import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, generateAvatarUrl, getInitials } from "@/lib/utils";
import { TaskStatus } from "@/lib/stores/task-store";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TaskAssignee {
  user: User;
  role: 'primary' | 'secondary';
  assignedBy: User;
  assignedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignees: TaskAssignee[];
  deadline?: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "done";

  return (
    <Card className="bg-background border-border/50">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-foreground line-clamp-2">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit task</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {task.assignees.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {task.assignees.map((assignee) => (
                    <Avatar
                      key={assignee.user._id}
                      className={`h-6 w-6 border-2 border-background ${
                        assignee.role === 'primary' ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <AvatarImage
                        src={assignee.user.avatar || generateAvatarUrl(assignee.user.name)}
                        alt={assignee.user.name}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(assignee.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">
                    {task.assignees.length === 1
                      ? task.assignees[0].user.name
                      : `${task.assignees[0].user.name} +${task.assignees.length - 1}`}
                  </span>
                  {task.assignees.length === 1 && (
                    <span className="text-[10px] text-muted-foreground/80">
                      {task.assignees[0].role}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>

          {task.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                {formatDate(task.deadline)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}