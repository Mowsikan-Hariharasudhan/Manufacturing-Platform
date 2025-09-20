import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, List, LayoutGrid } from "lucide-react";
import { OrderStatus } from "./StatusBadge";

interface OrdersFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: OrderStatus | "all";
  onStatusChange: (status: OrderStatus | "all") => void;
  onCreateOrder: () => void;
  orders?: any[]; // For calculating counts
  selectedView?: "all" | "my";
  onViewChange?: (view: "all" | "my") => void;
}

const OrdersFilter = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onCreateOrder,
  orders = [],
  selectedView = "all",
  onViewChange = () => {},
}: OrdersFilterProps) => {
  // Calculate status counts
  const getStatusCount = (status: string) => {
    if (status === "all") return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  // Map wireframe statuses
  const statusOptions = [
    { value: "all" as const, label: "All", count: getStatusCount("all") },
    { value: "draft" as OrderStatus, label: "Draft", count: getStatusCount("draft") },
    { value: "confirmed" as OrderStatus, label: "Confirmed", count: getStatusCount("confirmed") },
    { value: "in-progress" as OrderStatus, label: "In-Progress", count: getStatusCount("in-progress") },
    { value: "to-close" as OrderStatus, label: "To Close", count: getStatusCount("to-close") },
    { value: "not-assigned" as OrderStatus, label: "Not Assigned", count: getStatusCount("not-assigned") },
    { value: "late" as OrderStatus, label: "Late", count: getStatusCount("late") },
  ];

  const myStatusOptions = [
    { value: "confirmed" as OrderStatus, label: "Confirmed", count: getStatusCount("confirmed") },
    { value: "in-progress" as OrderStatus, label: "In-Progress", count: getStatusCount("in-progress") },
    { value: "to-close" as OrderStatus, label: "To Close", count: getStatusCount("to-close") },
    { value: "late" as OrderStatus, label: "Late", count: getStatusCount("late") },
  ];

  return (
    <div className="space-y-4">
      {/* Top Section: New Order + Search + View Toggles */}
      <div className="flex items-center justify-between gap-4">
        <Button onClick={onCreateOrder} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Manufacturing Order
        </Button>

        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Bar"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Sections: All vs My */}
      <div className="space-y-3">
        {/* All Section */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={selectedView === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("all")}
            className="font-medium"
          >
            All
          </Button>
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(option.value)}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary" className="text-xs">
                {option.count}
              </Badge>
              {option.label}
            </Button>
          ))}
        </div>

        {/* My Section */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={selectedView === "my" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("my")}
            className="font-medium"
          >
            My
          </Button>
          {myStatusOptions.map((option) => (
            <Button
              key={`my-${option.value}`}
              variant={selectedStatus === option.value && selectedView === "my" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onViewChange("my");
                onStatusChange(option.value);
              }}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary" className="text-xs">
                {option.count}
              </Badge>
              {option.label}
            </Button>
          ))}
          <Badge variant="outline" className="ml-2 text-xs">
            9 Late
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default OrdersFilter;