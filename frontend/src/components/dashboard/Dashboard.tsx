import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, AlertTriangle, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import KPICard from "./KPICard";
import OrdersFilter from "./OrdersFilter";
import OrdersTable, { ManufacturingOrder } from "./OrdersTable";
import OrderDetailsDialog from "./OrderDetailsDialog";
import CreateOrderDialog from "./CreateOrderDialog";
import { OrderStatus } from "./StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { manufacturingOrdersService } from "@/services/dataServices";

const Dashboard = () => {
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [selectedView, setSelectedView] = useState<"all" | "my">("all");
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const { toast } = useToast();

  // Load manufacturing orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await manufacturingOrdersService.getOrders();
        
        if (response.success) {
          // Transform backend data to match frontend interface
          const transformedOrders: ManufacturingOrder[] = response.data.map((order: any) => ({
            id: order.id.toString(),
            orderNumber: order.orderNumber || `MO-${order.id.toString().padStart(6, '0')}`,
            product: order.product?.name || order.productName || 'Unknown Product',
            quantity: order.quantity || 0,
            unit: order.unit || 'Units',
            status: order.status as OrderStatus,
            assignee: order.assignee || 'Unassigned',
            startDate: order.startDate ? new Date(order.startDate).toLocaleDateString() : '',
            dueDate: order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '',
            progress: order.progress || 0,
            componentStatus: order.componentStatus || 'Unknown',
          }));
          setOrders(transformedOrders);
        } else {
          throw new Error(response.message || 'Failed to load orders');
        }
      } catch (error) {
        console.error('Failed to load manufacturing orders:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load manufacturing orders",
        });
        // Fallback to empty array on error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [toast]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOrderSelect = (order: ManufacturingOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCreateOrder = () => {
    setShowCreateOrder(true);
  };

  const handleNewOrderCreate = async (orderData: Omit<ManufacturingOrder, 'id'>) => {
    try {
      // Transform frontend data to backend format
      const backendOrderData = {
        orderNumber: orderData.orderNumber,
        productName: orderData.product,
        quantity: orderData.quantity,
        unit: orderData.unit || 'Units',
        status: orderData.status,
        assignee: orderData.assignee,
        startDate: orderData.startDate,
        dueDate: orderData.dueDate,
        progress: orderData.progress || 0,
        componentStatus: orderData.componentStatus || 'Unknown',
      };

      const response = await manufacturingOrdersService.createOrder(backendOrderData);
      
      if (response.success) {
        // Transform backend response to frontend format
        const transformedOrder: ManufacturingOrder = {
          id: response.data.id.toString(),
          orderNumber: response.data.orderNumber || `MO-${response.data.id.toString().padStart(6, '0')}`,
          product: response.data.product?.name || response.data.productName || 'Unknown Product',
          quantity: response.data.quantity || 0,
          unit: response.data.unit || 'Units',
          status: response.data.status as OrderStatus,
          assignee: response.data.assignee || 'Unassigned',
          startDate: response.data.startDate ? new Date(response.data.startDate).toLocaleDateString() : '',
          dueDate: response.data.dueDate ? new Date(response.data.dueDate).toLocaleDateString() : '',
          progress: response.data.progress || 0,
          componentStatus: response.data.componentStatus || 'Unknown',
        };

        setOrders(prevOrders => [...prevOrders, transformedOrder]);
        toast({
          title: "Order Created",
          description: response.message || `Manufacturing order ${transformedOrder.orderNumber} has been created successfully.`,
        });
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Failed to create manufacturing order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create manufacturing order",
      });
    }
  };

  // Calculate KPIs
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const inProgressOrders = orders.filter(o => o.status === "in-progress").length;
  const delayedOrders = orders.filter(o => o.status === "delayed").length;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading manufacturing orders...</p>
          </div>
        </div>
      )}

      {/* Manufacturing Orders Section */}
      {!loading && (
        <div className="space-y-4">
          <OrdersFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onCreateOrder={handleCreateOrder}
            orders={orders}
            selectedView={selectedView}
            onViewChange={setSelectedView}
          />

          <OrdersTable
            orders={filteredOrders}
            onOrderSelect={handleOrderSelect}
          />
        </div>
      )}

      {/* Dialogs */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
      />
      
      <CreateOrderDialog
        open={showCreateOrder}
        onOpenChange={setShowCreateOrder}
        onCreateOrder={handleNewOrderCreate}
      />
    </div>
  );
};

export default Dashboard;