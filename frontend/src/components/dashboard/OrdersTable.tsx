import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge, { OrderStatus } from "./StatusBadge";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  unit?: string;
  status: OrderStatus;
  assignee: string;
  startDate: string;
  dueDate: string;
  progress: number;
  componentStatus?: string;
}

interface OrdersTableProps {
  orders: ManufacturingOrder[];
  onOrderSelect: (order: ManufacturingOrder) => void;
}

const OrdersTable = ({ orders, onOrderSelect }: OrdersTableProps) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-success";
    if (progress >= 70) return "bg-warning";
    if (progress >= 40) return "bg-info";
    return "bg-muted-foreground";
  };

  return (
    <div className="border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <input type="checkbox" className="rounded border-gray-300" />
            </TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Finished Product</TableHead>
            <TableHead>Component Status</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onOrderSelect(order)}
            >
              <TableCell>
                <input type="checkbox" className="rounded border-gray-300" />
              </TableCell>
              <TableCell className="font-medium">
                {order.orderNumber}
              </TableCell>
              <TableCell>{order.startDate}</TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {order.componentStatus || "Available"}
                </span>
              </TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.unit || "Units"}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;