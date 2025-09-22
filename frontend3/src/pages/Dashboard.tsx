import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { Plus, Search, Filter } from "lucide-react";
import useProjectStore from "@/lib/stores/project-store";
import { useToast } from "@/components/ui/use-toast";
import useAuthStore from "@/lib/stores/auth-store";

export default function Dashboard() {
  console.log('Dashboard rendering');
  
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { projects = [], loading, error, initialized, fetchProjects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    console.log('Dashboard effect running', { initialized, loading });
    
    const loadProjects = async () => {
      if (!initialized && !loading) {
        try {
          console.log('Fetching projects...');
          await fetchProjects();
        } catch (error: any) {
          console.error('Error loading projects:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to load projects"
          });
        }
      }
    };
    loadProjects();
  }, [initialized, loading, fetchProjects, toast]);

  // Ensure we're working with arrays even if the data is undefined
  const safeProjects = Array.isArray(projects) ? projects : [];
  
  // Debug log the project data
  console.log('Project data:', {
    rawProjects: projects,
    safeProjects,
    firstProject: safeProjects[0],
    firstProjectMembers: safeProjects[0]?.members
  });

  const filteredProjects = safeProjects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjects = safeProjects.filter(p => p.status === "active").length;
  const completedProjects = safeProjects.filter(p => p.status === "completed").length;
  const totalMembers = new Set(
    safeProjects.flatMap(p => 
      (Array.isArray(p.members) ? p.members : [])
        .filter(m => m && m.user && m.user._id)
        .map(m => m.user._id)
    )
  ).size;

  console.log('Dashboard state:', {
    loading,
    error,
    initialized,
    projectsCount: safeProjects.length,
    filteredCount: filteredProjects.length,
    showCreateModal
  });

  const content = loading ? (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    </div>
  ) : error ? (
    <div className="p-6">
      <div className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-xl">
        {error}
      </div>
    </div>
  ) : filteredProjects.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground">No projects found</h3>
      <p className="text-muted-foreground">
        {searchQuery ? "Try adjusting your search query." : "Create your first project to get started."}
      </p>
      {!searchQuery && (
        <Button 
          className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here's an overview of your projects.
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Active Projects</span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{activeProjects}</p>
        </div>
        <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-info"></div>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{completedProjects}</p>
        </div>
        <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-sm text-muted-foreground">Team Members</span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{totalMembers}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface/50 border-border/50"
          />
        </div>
        <Button variant="outline" size="sm" className="border-border/50 hover:bg-surface/50">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Content */}
      {content}

      {/* Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}