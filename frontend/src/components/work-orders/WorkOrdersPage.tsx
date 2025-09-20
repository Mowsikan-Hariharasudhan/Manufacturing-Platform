import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, CheckCircle, Clock, User, Wrench, Plus } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface WorkOrder {
  id: string;
  woNumber: string;
  operation: string;
  moNumber: string;
  product: string;
  operator: string;
  workCenter: string;
  status: "not-started" | "in-progress" | "paused" | "completed";
  estimatedTime: number;
  actualTime: number;
  startTime?: string;
  endTime?: string;
  comments: string;
  priority: "low" | "medium" | "high";
}

const WorkOrdersPage = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: "1",
      woNumber: "WO-2024-001",
      operation: "Cutting Wood",
      moNumber: "MO-2024-001",
      product: "Wooden Table",
      operator: "John Smith",
      workCenter: "Cutting Station",
      status: "completed",
      estimatedTime: 120,
      actualTime: 110,
      startTime: "09:00",
      endTime: "10:50",
      comments: "Completed ahead of schedule",
      priority: "high"
    },
    {
      id: "2",
      woNumber: "WO-2024-002",
      operation: "Assembly",
      moNumber: "MO-2024-001",
      product: "Wooden Table",
      operator: "Sarah Johnson",
      workCenter: "Assembly Line A",
      status: "in-progress",
      estimatedTime: 180,
      actualTime: 90,
      startTime: "11:00",
      comments: "Assembly proceeding smoothly",
      priority: "high"
    },
    {
      id: "3",
      woNumber: "WO-2024-003",
      operation: "Quality Check",
      moNumber: "MO-2024-001",
      product: "Wooden Table",
      operator: "Mike Wilson",
      workCenter: "QC Station",
      status: "not-started",
      estimatedTime: 30,
      actualTime: 0,
      comments: "",
      priority: "medium"
    },
    {
      id: "4",
      woNumber: "WO-2024-004",
      operation: "Fabric Cutting",
      moNumber: "MO-2024-002",
      product: "Office Chair",
      operator: "Lisa Chen",
      workCenter: "Cutting Station",
      status: "paused",
      estimatedTime: 90,
      actualTime: 45,
      startTime: "14:00",
      comments: "Paused for material delivery",
      priority: "medium"
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not-started": return <Clock className="h-4 w-4" />;
      case "in-progress": return <Play className="h-4 w-4" />;
      case "paused": return <Pause className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not-started": return "text-muted-foreground";
      case "in-progress": return "text-primary";
      case "paused": return "text-warning";
      case "completed": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const updateWorkOrderStatus = (id: string, newStatus: WorkOrder['status']) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status: newStatus } : wo
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Work Orders</h1>
          <p className="text-muted-foreground">Manage individual operations and tasks within manufacturing orders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Work Order</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="operation">Operation</Label>
                <Input id="operation" placeholder="Enter operation name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moNumber">Manufacturing Order</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select MO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MO-2024-001">MO-2024-001 (Wooden Table)</SelectItem>
                    <SelectItem value="MO-2024-002">MO-2024-002 (Office Chair)</SelectItem>
                    <SelectItem value="MO-2024-003">MO-2024-003 (Desk Lamp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Operator</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john-smith">John Smith</SelectItem>
                    <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="mike-wilson">Mike Wilson</SelectItem>
                    <SelectItem value="lisa-chen">Lisa Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workCenter">Work Center</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work center" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cutting-station">Cutting Station</SelectItem>
                    <SelectItem value="assembly-a">Assembly Line A</SelectItem>
                    <SelectItem value="qc-station">QC Station</SelectItem>
                    <SelectItem value="paint-booth">Paint Booth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input id="estimatedTime" type="number" placeholder="Enter estimated time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea id="comments" placeholder="Enter any comments or instructions..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Work Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO Number</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>MO Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Work Center</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.woNumber}</TableCell>
                  <TableCell>{wo.operation}</TableCell>
                  <TableCell>{wo.moNumber}</TableCell>
                  <TableCell>{wo.product}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {wo.operator}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      {wo.workCenter}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(wo.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(wo.status)}
                        {wo.status.replace('-', ' ')}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{wo.actualTime}m / {wo.estimatedTime}m</div>
                      {wo.startTime && (
                        <div className="text-muted-foreground">
                          {wo.startTime} {wo.endTime && `- ${wo.endTime}`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      wo.priority === "high" ? "text-destructive" :
                      wo.priority === "medium" ? "text-warning" : "text-muted-foreground"
                    }>
                      {wo.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {wo.status === "not-started" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateWorkOrderStatus(wo.id, "in-progress")}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {wo.status === "in-progress" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateWorkOrderStatus(wo.id, "paused")}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateWorkOrderStatus(wo.id, "completed")}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {wo.status === "paused" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateWorkOrderStatus(wo.id, "in-progress")}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrdersPage;