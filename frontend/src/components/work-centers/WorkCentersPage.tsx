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
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Activity, Clock, DollarSign, Settings } from "lucide-react";

interface WorkCenter {
  id: string;
  name: string;
  type: "machine" | "manual" | "quality";
  status: "active" | "maintenance" | "inactive";
  capacity: number;
  currentUtilization: number;
  costPerHour: number;
  location: string;
  operator: string;
  description: string;
  maintenanceSchedule: string;
  efficiency: number;
}

const WorkCentersPage = () => {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([
    {
      id: "1",
      name: "Assembly Line A",
      type: "manual",
      status: "active",
      capacity: 8,
      currentUtilization: 6,
      costPerHour: 25.50,
      location: "Floor 1, Section A",
      operator: "John Smith",
      description: "Primary assembly line for furniture production",
      maintenanceSchedule: "Weekly",
      efficiency: 92
    },
    {
      id: "2",
      name: "CNC Machine 01",
      type: "machine",
      status: "active",
      capacity: 1,
      currentUtilization: 1,
      costPerHour: 45.00,
      location: "Floor 2, Machine Shop",
      operator: "Sarah Johnson",
      description: "High precision CNC cutting machine",
      maintenanceSchedule: "Monthly",
      efficiency: 88
    },
    {
      id: "3",
      name: "Quality Control Station",
      type: "quality",
      status: "active",
      capacity: 3,
      currentUtilization: 2,
      costPerHour: 30.00,
      location: "Floor 1, Section C",
      operator: "Mike Wilson",
      description: "Final quality inspection and testing",
      maintenanceSchedule: "Bi-weekly",
      efficiency: 95
    },
    {
      id: "4",
      name: "Paint Booth B",
      type: "machine",
      status: "maintenance",
      capacity: 2,
      currentUtilization: 0,
      costPerHour: 35.00,
      location: "Floor 1, Paint Section",
      operator: "Lisa Chen",
      description: "Automated paint application booth",
      maintenanceSchedule: "Weekly",
      efficiency: 85
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredWorkCenters = workCenters.filter(wc => {
    const matchesSearch = wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wc.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || wc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "maintenance": return "text-warning";
      case "inactive": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "machine": return <Settings className="h-4 w-4" />;
      case "manual": return <Activity className="h-4 w-4" />;
      case "quality": return <Clock className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const calculateUtilizationPercentage = (current: number, capacity: number) => {
    return capacity > 0 ? (current / capacity) * 100 : 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Work Centers</h1>
          <p className="text-muted-foreground">Manage your production facilities and resources</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Work Center
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Work Center</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter work center name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machine">Machine</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="quality">Quality Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" placeholder="Enter capacity" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerHour">Cost per Hour ($)</Label>
                <Input id="costPerHour" type="number" step="0.01" placeholder="Enter cost per hour" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Primary Operator</Label>
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
                <Label htmlFor="maintenanceSchedule">Maintenance Schedule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter description..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Add Work Center
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Centers</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workCenters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Centers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {workCenters.filter(wc => wc.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(workCenters.reduce((acc, wc) => acc + calculateUtilizationPercentage(wc.currentUtilization, wc.capacity), 0) / workCenters.length)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workCenters.reduce((acc, wc) => acc + wc.capacity, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search work centers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Cost/Hour</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkCenters.map((wc) => (
                <TableRow key={wc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(wc.type)}
                      {wc.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {wc.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(wc.status)}>
                      {wc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {wc.currentUtilization}/{wc.capacity}
                      </div>
                      <Progress 
                        value={calculateUtilizationPercentage(wc.currentUtilization, wc.capacity)} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {wc.costPerHour.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{wc.efficiency}%</span>
                      <Progress value={wc.efficiency} className="h-2 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wc.location}
                  </TableCell>
                  <TableCell>{wc.operator}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wc.maintenanceSchedule}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default WorkCentersPage;