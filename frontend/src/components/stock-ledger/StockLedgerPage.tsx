import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, TrendingUp, TrendingDown, AlertTriangle, Edit, Trash2 } from "lucide-react";

interface StockMovement {
  id: string;
  date: string;
  product: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  unit: string;
  reference: string;
  description: string;
  balanceAfter: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: "raw-material" | "finished-goods" | "work-in-progress";
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  lastMovement: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

const StockLedgerPage = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Pine Wood Board",
      sku: "PWB-001",
      category: "raw-material",
      currentStock: 150,
      unit: "pieces",
      minStock: 50,
      maxStock: 300,
      costPerUnit: 12.50,
      lastMovement: "2024-09-18",
      status: "in-stock"
    },
    {
      id: "2",
      name: "Metal Screws",
      sku: "MS-001",
      category: "raw-material",
      currentStock: 25,
      unit: "boxes",
      minStock: 30,
      maxStock: 100,
      costPerUnit: 8.00,
      lastMovement: "2024-09-17",
      status: "low-stock"
    },
    {
      id: "3",
      name: "Wooden Table",
      sku: "WT-001",
      category: "finished-goods",
      currentStock: 15,
      unit: "pieces",
      minStock: 5,
      maxStock: 50,
      costPerUnit: 125.00,
      lastMovement: "2024-09-19",
      status: "in-stock"
    },
    {
      id: "4",
      name: "Wood Stain",
      sku: "WS-001",
      category: "raw-material",
      currentStock: 0,
      unit: "liters",
      minStock: 10,
      maxStock: 30,
      costPerUnit: 15.00,
      lastMovement: "2024-09-15",
      status: "out-of-stock"
    }
  ]);

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    {
      id: "1",
      date: "2024-09-19",
      product: "Wooden Table",
      type: "out",
      quantity: 5,
      unit: "pieces",
      reference: "MO-2024-001",
      description: "Production completion",
      balanceAfter: 15
    },
    {
      id: "2",
      date: "2024-09-18",
      product: "Pine Wood Board",
      type: "in",
      quantity: 50,
      unit: "pieces",
      reference: "PO-2024-015",
      description: "Purchase order delivery",
      balanceAfter: 150
    },
    {
      id: "3",
      date: "2024-09-17",
      product: "Metal Screws",
      type: "out",
      quantity: 10,
      unit: "boxes",
      reference: "MO-2024-001",
      description: "Material consumption",
      balanceAfter: 25
    },
    {
      id: "4",
      date: "2024-09-16",
      product: "Pine Wood Board",
      type: "out",
      quantity: 25,
      unit: "pieces",
      reference: "MO-2024-001",
      description: "Material consumption",
      balanceAfter: 100
    }
  ]);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock": return "text-success";
      case "low-stock": return "text-warning";
      case "out-of-stock": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in": return <TrendingUp className="h-4 w-4 text-success" />;
      case "out": return <TrendingDown className="h-4 w-4 text-destructive" />;
      case "adjustment": return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const totalValue = products.reduce((acc, product) => acc + (product.currentStock * product.costPerUnit), 0);
  const lowStockItems = products.filter(p => p.status === "low-stock").length;
  const outOfStockItems = products.filter(p => p.status === "out-of-stock").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Ledger</h1>
          <p className="text-muted-foreground">Track inventory movements and material availability</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input id="productName" placeholder="Enter product name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Enter SKU" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw-material">Raw Material</SelectItem>
                      <SelectItem value="finished-goods">Finished Goods</SelectItem>
                      <SelectItem value="work-in-progress">Work in Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialStock">Initial Stock</Label>
                  <Input id="initialStock" type="number" placeholder="Enter initial stock" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPerUnit">Cost per Unit ($)</Label>
                  <Input id="costPerUnit" type="number" step="0.01" placeholder="Enter cost per unit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input id="minStock" type="number" placeholder="Enter minimum stock level" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">Maximum Stock</Label>
                  <Input id="maxStock" type="number" placeholder="Enter maximum stock level" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsProductDialogOpen(false)}>
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Record Movement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Stock Movement</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Movement Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" placeholder="Enter quantity" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input id="reference" placeholder="Enter reference (MO, PO, etc.)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Enter description" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsMovementDialogOpen(false)}>
                  Record Movement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockItems}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="raw-material">Raw Material</SelectItem>
                    <SelectItem value="finished-goods">Finished Goods</SelectItem>
                    <SelectItem value="work-in-progress">Work in Progress</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Cost/Unit</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Movement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.currentStock} {product.unit}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.minStock} / {product.maxStock}
                      </TableCell>
                      <TableCell>${product.costPerUnit.toFixed(2)}</TableCell>
                      <TableCell>${(product.currentStock * product.costPerUnit).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(product.status)}>
                          {product.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.lastMovement}
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
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell className="font-medium">{movement.product}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          <Badge variant="outline">
                            {movement.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={movement.type === "out" ? "text-destructive" : "text-success"}>
                          {movement.type === "out" ? "-" : "+"}
                          {movement.quantity} {movement.unit}
                        </span>
                      </TableCell>
                      <TableCell>{movement.reference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.description}
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.balanceAfter} {movement.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockLedgerPage;