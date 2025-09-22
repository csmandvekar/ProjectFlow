import { useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Card } from "@/components/ui/card";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: {
    _id: string;
    name: string;
  } | null;
}

interface Member {
  user: {
    _id: string;
    name: string;
  };
}

interface ProjectStatsProps {
  tasks: Task[];
  members: Member[];
}

export function ProjectStats({ tasks, members }: ProjectStatsProps) {
  // Calculate task status distribution
  const statusCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inprogress: tasks.filter(t => t.status === 'inprogress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  // Calculate completion percentage
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0
    ? Math.round((statusCounts.done / totalTasks) * 100)
    : 0;

  // Calculate priority distribution
  const priorityCounts = {
    low: tasks.filter(t => t.priority === 'low').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    high: tasks.filter(t => t.priority === 'high').length
  };

  // Calculate member workload
  const memberWorkload = members.map(member => ({
    name: member.user.name,
    tasks: tasks.filter(t => t.assignee?._id === member.user._id).length
  }));

  // Status chart data
  const statusChartData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [statusCounts.todo, statusCounts.inprogress, statusCounts.done],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',  // yellow
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(34, 197, 94, 0.8)',  // green
        ],
        borderColor: [
          'rgba(234, 179, 8, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Priority chart data
  const priorityChartData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(234, 179, 8, 0.8)',  // yellow
          'rgba(239, 68, 68, 0.8)',  // red
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Member workload chart data
  const workloadChartData = {
    labels: memberWorkload.map(m => m.name),
    datasets: [
      {
        label: 'Assigned Tasks',
        data: memberWorkload.map(m => m.tasks),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const workloadOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Member Workload',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Completion Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Task Status</h3>
        <div className="flex items-center justify-center">
          <div className="w-48 h-48">
            <Doughnut 
              data={statusChartData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">Project Completion</p>
          <p className="text-2xl font-bold">{completionPercentage}%</p>
        </div>
      </Card>

      {/* Priority Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Task Priority</h3>
        <div className="flex items-center justify-center">
          <div className="w-48 h-48">
            <Doughnut 
              data={priorityChartData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* Member Workload */}
      <Card className="p-6 md:col-span-2">
        <div className="h-[300px]">
          <Bar options={workloadOptions} data={workloadChartData} />
        </div>
      </Card>
    </div>
  );
}
