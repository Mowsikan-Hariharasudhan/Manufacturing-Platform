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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, FileText, Package, Wrench, Eye, Copy } from "lucide-react";

interface BOMComponent {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  supplier?: string;
}

interface BOMOperation {
  id: string;
  operation: string;
  workCenter: string;
  setupTime: number;
  runTime: number;
  costPerHour: number;
  totalCost: number;
}

interface BOM {
  id: string;
  bomNumber: string;
  product: string;
  version: string;
  status: "draft" | "active" | "obsolete";
  description: string;
  quantity: number;
  unit: string;
  totalMaterialCost: number;
  totalOperationCost: number;
  totalCost: number;
  createdDate: string;
  lastModified: string;
  components: BOMComponent[];
  operations: BOMOperation[];
}

const BOMPage = () => {
  const [boms, setBoms] = useState<BOM[]>([
    {
      id: "1",
      bomNumber: "BOM-WT-001",
      product: "Wooden Table",
      version: "v1.2",
      status: "active",
      description: "Standard wooden dining table with 4 legs",
      quantity: 1,
      unit: "piece",
      totalMaterialCost: 85.50,
      totalOperationCost: 67.50,
      totalCost: 153.00,
      createdDate: "2024-08-15",
      lastModified: "2024-09-10",
      components: [
        { id: "1", material: "Pine Wood Board", quantity: 4, unit: "pieces", costPerUnit: 12.50, totalCost: 50.00 },
        { id: "2", material: "Metal Screws", quantity: 1, unit: "box", costPerUnit: 8.00, totalCost: 8.00 },
        { id: "3", material: "Wood Stain", quantity: 0.5, unit: "liter", costPerUnit: 15.00, totalCost: 7.50 },
        { id: "4", material: "Table Legs", quantity: 4, unit: "pieces", costPerUnit: 5.00, totalCost: 20.00 }
      ],
      operations: [
        { id: "1", operation: "Cutting", workCenter: "Cutting Station", setupTime: 15, runTime: 45, costPerHour: 25.00, totalCost: 25.00 },
        { id: "2", operation: "Assembly", workCenter: "Assembly Line A", setupTime: 10, runTime: 60, costPerHour: 30.00, totalCost: 35.00 },
        { id: "3", operation: "Finishing", workCenter: "Paint Booth", setupTime: 5, runTime: 20, costPerHour: 30.00, totalCost: 12.50 }
      ]
    },
    {
      id: "2",
      bomNumber: "BOM-OC-001",
      product: "Office Chair",
      version: "v1.0",
      status: "active",
      description: "Ergonomic office chair with adjustable height",
      quantity: 1,
      unit: "piece",
      totalMaterialCost: 125.00,
      totalOperationCost: 95.00,
      totalCost: 220.00,
      createdDate: "2024-09-01",
      lastModified: "2024-09-15",
      components: [
        { id: "1", material: "Chair Base", quantity: 1, unit: "piece", costPerUnit: 35.00, totalCost: 35.00 },
        { id: "2", material: "Fabric", quantity: 2, unit: "meters", costPerUnit: 25.00, totalCost: 50.00 },
        { id: "3", material: "Foam Padding", quantity: 1, unit: "set", costPerUnit: 20.00, totalCost: 20.00 },
        { id: "4", material: "Hardware Kit", quantity: 1, unit: "set", costPerUnit: 20.00, totalCost: 20.00 }
      ],
      operations: [
        { id: "1", operation: "Frame Assembly", workCenter: "Assembly Line B", setupTime: 20, runTime: 90, costPerHour: 30.00, totalCost: 55.00 },
        { id: "2", operation: "Upholstery", workCenter: "Upholstery Station", setupTime: 15, runTime: 75, costPerHour: 28.00, totalCost: 42.00 }
      ]
    }
  ]);

  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBOMs = boms.filter(bom => {
    const matchesSearch = bom.bomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bom.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "draft": return "text-warning";
      case "obsolete": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const viewBOM = (bom: BOM) => {
    setSelectedBOM(bom);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bill of Materials (BOM)</h1>
          <p className="text-muted-foreground">Define recipes and material requirements for your products</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create BOM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Bill of Materials</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wooden-table">Wooden Table</SelectItem>
                    <SelectItem value="office-chair">Office Chair</SelectItem>
                    <SelectItem value="desk-lamp">Desk Lamp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input id="version" placeholder="e.g., v1.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Base Quantity</Label>
                <Input id="quantity" type="number" placeholder="Enter quantity" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter BOM description..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create BOM
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total BOMs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active BOMs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {boms.filter(bom => bom.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft BOMs</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {boms.filter(bom => bom.status === "draft").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg BOM Cost</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(boms.reduce((acc, bom) => acc + bom.totalCost, 0) / boms.length).toFixed(0)}
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
                placeholder="Search BOMs..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* BOMs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bill of Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BOM Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Base Qty</TableHead>
                <TableHead>Material Cost</TableHead>
                <TableHead>Operation Cost</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBOMs.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">{bom.bomNumber}</TableCell>
                  <TableCell>{bom.product}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{bom.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(bom.status)}>
                      {bom.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bom.quantity} {bom.unit}</TableCell>
                  <TableCell>${bom.totalMaterialCost.toFixed(2)}</TableCell>
                  <TableCell>${bom.totalOperationCost.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${bom.totalCost.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {bom.lastModified}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => viewBOM(bom)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
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

      {/* BOM Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBOM?.bomNumber} - {selectedBOM?.product}
            </DialogTitle>
          </DialogHeader>
          {selectedBOM && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedBOM.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Base Quantity</Label>
                  <p className="text-sm">{selectedBOM.quantity} {selectedBOM.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm">{selectedBOM.version}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedBOM.status)}>
                    {selectedBOM.status}
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="components" className="w-full">
                <TabsList>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="operations">Operations</TabsTrigger>
                  <TabsTrigger value="costing">Cost Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="components">
                  <Card>
                    <CardHeader>
                      <CardTitle>Material Components</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Cost/Unit</TableHead>
                            <TableHead>Total Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBOM.components.map((component) => (
                            <TableRow key={component.id}>
                              <TableCell className="font-medium">{component.material}</TableCell>
                              <TableCell>{component.quantity}</TableCell>
                              <TableCell>{component.unit}</TableCell>
                              <TableCell>${component.costPerUnit.toFixed(2)}</TableCell>
                              <TableCell>${component.totalCost.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2">
                            <TableCell colSpan={4} className="font-medium">Total Material Cost</TableCell>
                            <TableCell className="font-bold">${selectedBOM.totalMaterialCost.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="operations">
                  <Card>
                    <CardHeader>
                      <CardTitle>Manufacturing Operations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operation</TableHead>
                            <TableHead>Work Center</TableHead>
                            <TableHead>Setup Time (min)</TableHead>
                            <TableHead>Run Time (min)</TableHead>
                            <TableHead>Cost/Hour</TableHead>
                            <TableHead>Total Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBOM.operations.map((operation) => (
                            <TableRow key={operation.id}>
                              <TableCell className="font-medium">{operation.operation}</TableCell>
                              <TableCell>{operation.workCenter}</TableCell>
                              <TableCell>{operation.setupTime}</TableCell>
                              <TableCell>{operation.runTime}</TableCell>
                              <TableCell>${operation.costPerHour.toFixed(2)}</TableCell>
                              <TableCell>${operation.totalCost.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2">
                            <TableCell colSpan={5} className="font-medium">Total Operation Cost</TableCell>
                            <TableCell className="font-bold">${selectedBOM.totalOperationCost.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="costing">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Material Cost:</span>
                          <span className="font-medium">${selectedBOM.totalMaterialCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operation Cost:</span>
                          <span className="font-medium">${selectedBOM.totalOperationCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Total BOM Cost:</span>
                          <span className="font-bold text-lg">${selectedBOM.totalCost.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Materials</span>
                            <span>{((selectedBOM.totalMaterialCost / selectedBOM.totalCost) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{width: `${(selectedBOM.totalMaterialCost / selectedBOM.totalCost) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Operations</span>
                            <span>{((selectedBOM.totalOperationCost / selectedBOM.totalCost) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-secondary h-2 rounded-full" 
                              style={{width: `${(selectedBOM.totalOperationCost / selectedBOM.totalCost) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BOMPage;