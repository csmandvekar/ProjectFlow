import { useEffect, useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import useProjectStore from "@/lib/stores/project-store";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ProjectDeadline {
  date: Date;
  projects: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export default function Calendar() {
  const { projects, fetchProjects } = useProjectStore();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [projectDeadlines, setProjectDeadlines] = useState<ProjectDeadline[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        await fetchProjects();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading projects",
          description: error.message || "Failed to load projects",
        });
      }
    };

    loadProjects();
  }, [fetchProjects, toast]);

  useEffect(() => {
    // Group projects by deadline date
    const deadlines = projects
      .filter(project => project.deadline)
      .reduce<Record<string, ProjectDeadline>>((acc, project) => {
        if (!project.deadline) return acc;
        
        const date = format(new Date(project.deadline), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = {
            date: new Date(project.deadline),
            projects: []
          };
        }
        
        acc[date].projects.push({
          id: project._id,
          title: project.title,
          status: project.status
        });
        
        return acc;
      }, {});

    setProjectDeadlines(Object.values(deadlines));
  }, [projects]);

  // Function to get projects for a specific date
  const getProjectsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return projectDeadlines.find(
      d => format(d.date, 'yyyy-MM-dd') === dateStr
    )?.projects || [];
  };

  // Function to check if a date has any projects
  const hasProjects = (date: Date) => {
    return getProjectsForDate(date).length > 0;
  };

  // Get projects for selected date
  const selectedDateProjects = selectedDate ? getProjectsForDate(selectedDate) : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Calendar</h1>
        <p className="text-muted-foreground">
          View project deadlines and milestones
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="p-4 flex-1">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasDeadline: (date) => hasProjects(date),
            }}
            modifiersStyles={{
              hasDeadline: {
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
              },
            }}
          />
        </Card>

        <Card className="p-4 lg:w-80">
          <h2 className="font-semibold mb-4">
            {selectedDate ? (
              <>Deadlines for {format(selectedDate, 'MMMM d, yyyy')}</>
            ) : (
              'Select a date'
            )}
          </h2>
          {selectedDateProjects.length > 0 ? (
            <div className="space-y-3">
              {selectedDateProjects.map(project => (
                <div
                  key={project.id}
                  className="p-3 rounded-md bg-muted/50 border border-border/50"
                >
                  <h3 className="font-medium text-sm">{project.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Status: {project.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No project deadlines for this date
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
