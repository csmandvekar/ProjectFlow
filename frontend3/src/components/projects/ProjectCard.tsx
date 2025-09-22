import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectMenu } from "./ProjectMenu";
import { EditProjectModal } from "./EditProjectModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate, generateAvatarUrl, getInitials, isDatePast } from "@/lib/utils";

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

interface Project {
  _id: string;
  title: string;
  description?: string;
  status: StatusType;
  owner: User;
  members: Member[];
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const isOverdue = project.deadline && isDatePast(project.deadline) && project.status !== "completed";

  const handleViewProject = () => {
    navigate(`/projects/${project._id}`);
  };

  // Ensure members is always an array and has valid user objects
  const safeMembers = Array.isArray(project.members) 
    ? project.members.filter(member => member && member.user && typeof member.user === 'object')
    : [];

  return (
    <>
      <Card className="card-hover group bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col">
        <CardContent className="p-6 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description || "No description provided."}
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <StatusBadge status={project.status} />
              <ProjectMenu 
                projectId={project._id}
                ownerId={project.owner._id}
                onEdit={() => setIsEditModalOpen(true)} 
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-auto pt-4 border-t border-border/30">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1.5" />
              <span>{safeMembers.length} members</span>
            </div>
            {project.deadline && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" />
                <span className={isOverdue ? "text-destructive" : ""}>
                  Due {formatDate(project.deadline)}
                </span>
              </div>
            )}
          </div>

          {/* Members Preview */}
          {safeMembers.length > 0 && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm text-muted-foreground">Team:</span>
              <div className="flex -space-x-2">
                {safeMembers.slice(0, 3).map((member) => (
                  <Avatar key={member.user._id} className="h-7 w-7 border-2 border-card">
                    <AvatarImage 
                      src={member.user.avatar || (member.user.name ? generateAvatarUrl(member.user.name) : undefined)} 
                      alt={member.user.name || 'Team member'} 
                    />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {member.user.name ? getInitials(member.user.name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {safeMembers.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                    +{safeMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/30">
            <span className="text-xs text-muted-foreground">
              Updated {formatDate(project.updatedAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary group-hover:translate-x-1 transition-all duration-200"
              onClick={handleViewProject}
            >
              View Project
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}