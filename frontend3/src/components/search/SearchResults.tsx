import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, Users } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  status: string;
  owner: User;
  members: User[];
  deadline?: string;
  createdAt: string;
}

interface TaskAssignee {
  user: User;
  role: 'primary' | 'secondary';
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project: { _id: string; title: string };
  assignees: TaskAssignee[];
  deadline?: string;
  createdBy: User;
  createdAt: string;
}

interface SearchResults {
  projects: Project[];
  tasks: Task[];
}

interface SearchResultsProps {
  results: SearchResults;
  loading: boolean;
  query: string;
}

export function SearchResults({ results, loading, query }: SearchResultsProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
      case 'todo':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Enter a search query to find projects and tasks</p>
      </div>
    );
  }

  if (results.projects.length === 0 && results.tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No results found for "{query}"</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Projects Section */}
      {results.projects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Projects ({results.projects.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.projects.map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Owner: {project.owner.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                  </div>

                  {project.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(project.deadline)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {results.tasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tasks ({results.tasks.length})
          </h3>
          <div className="space-y-3">
            {results.tasks.map((task) => (
              <Card
                key={task._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${task.project._id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        in {task.project.title}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {task.assignees.length > 0 ? (
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <Avatar key={assignee.user._id} className="h-6 w-6 border-2 border-background">
                              <AvatarImage
                                src={assignee.user.avatar}
                                alt={assignee.user.name}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(assignee.user.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="text-xs">Unassigned</span>
                        </div>
                      )}
                    </div>

                    {task.deadline && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(task.deadline)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
