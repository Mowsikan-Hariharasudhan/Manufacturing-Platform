import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type OrderStatus = "draft" | "confirmed" | "in-progress" | "to-close" | "not-assigned" | "late" | "planned" | "completed" | "delayed";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "draft":
        return {
          label: "Draft",
          className: "bg-muted text-muted-foreground border-muted-foreground/20"
        };
      case "confirmed":
        return {
          label: "Confirmed",
          className: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case "planned":
        return {
          label: "Planned",
          className: "bg-planned text-planned-foreground border-planned-foreground/20"
        };
      case "in-progress":
        return {
          label: "In Progress",
          className: "bg-in-progress text-in-progress-foreground border-in-progress-foreground/20"
        };
      case "to-close":
        return {
          label: "To Close",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200"
        };
      case "not-assigned":
        return {
          label: "Not Assigned",
          className: "bg-gray-100 text-gray-800 border-gray-200"
        };
      case "late":
        return {
          label: "Late",
          className: "bg-red-100 text-red-800 border-red-200"
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-completed text-completed-foreground border-completed-foreground/20"
        };
      case "delayed":
        return {
          label: "Delayed",
          className: "bg-delayed text-delayed-foreground border-delayed-foreground/20"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={cn(config.className, className)} variant="outline">
      {config.label}
    </Badge>
  );
};

export default StatusBadge;