import { Badge } from "@/components/ui/badge";
import { Circle, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "active" | "completed" | "on-hold" | "cancelled" | "todo" | "inprogress" | "done";

const statusConfig = {
  active: {
    label: "Active",
    icon: Circle,
    className: "bg-success/20 text-success border-success/20 status-pulse",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-info/20 text-info border-info/20",
  },
  "on-hold": {
    label: "On Hold",
    icon: Clock,
    className: "bg-warning/20 text-warning border-warning/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/20",
  },
  todo: {
    label: "To Do",
    icon: Circle,
    className: "bg-muted/50 text-muted-foreground border-muted",
  },
  inprogress: {
    label: "In Progress",
    icon: Clock,
    className: "bg-warning/20 text-warning border-warning/20",
  },
  done: {
    label: "Done",
    icon: CheckCircle,
    className: "bg-success/20 text-success border-success/20",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-1 text-xs font-medium border transition-all duration-200",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1.5" />}
      {config.label}
    </Badge>
  );
}