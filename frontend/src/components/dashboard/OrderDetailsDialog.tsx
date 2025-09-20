import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "./StatusBadge";
import { ManufacturingOrder } from "./OrdersTable";
import { Calendar, User, Package, Target, Clock } from "lucide-react";

interface OrderDetailsDialogProps {
  order: ManufacturingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog = ({ order, open, onOpenChange }: OrderDetailsDialogProps) => {
  if (!order) return null;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-success";
    if (progress >= 70) return "bg-warning";
    if (progress >= 40) return "bg-info";
    return "bg-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Manufacturing Order Details
          </DialogTitle>
          <DialogDescription>
            View complete details for {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Order Number</span>
              </div>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status</span>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <Separator />

          {/* Product Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                <p className="text-base">{order.product}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-base">{order.quantity} units</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schedule & Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                </div>
                <p className="text-base">{order.assignee}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                </div>
                <p className="text-base">{order.startDate}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                </div>
                <p className="text-base">{order.dueDate}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Progress Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Progress Tracking</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Progress</span>
                <span className="text-sm text-muted-foreground">{order.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${getProgressColor(order.progress)}`}
                  style={{ width: `${order.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>
              Edit Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;