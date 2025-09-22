import { KanbanColumn } from "./KanbanColumn";
import { TaskStatus } from "@/lib/stores/task-store";

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

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  members: Member[];
}

export function KanbanBoard({ projectId, tasks, members }: KanbanBoardProps) {
  const columns: { status: TaskStatus; title: string }[] = [
    { status: "todo", title: "To Do" },
    { status: "inprogress", title: "In Progress" },
    { status: "done", title: "Done" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(({ status, title }) => (
        <KanbanColumn
          key={status}
          title={title}
          status={status}
          tasks={tasks.filter(task => task.status === status)}
          projectId={projectId}
          members={members}
        />
      ))}
    </div>
  );
}