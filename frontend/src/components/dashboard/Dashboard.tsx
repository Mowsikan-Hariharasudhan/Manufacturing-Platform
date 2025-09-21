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
import { 
  STATIC_MANUFACTURING_ORDERS, 
  getOrdersSummary,
  filterOrdersByStatus,
  searchOrders,
  type ManufacturingOrder as StaticManufacturingOrder 
} from "@/data/staticData";

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

  // Load manufacturing orders from static data
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        
        // Transform static data to match frontend interface
        const transformedOrders: ManufacturingOrder[] = STATIC_MANUFACTURING_ORDERS.map((order: StaticManufacturingOrder) => ({
          id: order.mo_id,
          orderNumber: order.mo_number,
          product: order.finished_product,
          quantity: order.quantity_to_produce,
          unit: order.unit_of_measure,
          status: (order.status === 'in_progress' ? 'in-progress' : order.status) as OrderStatus,
          assignee: order.assigned_to_name,
          startDate: order.scheduled_start_date ? new Date(order.scheduled_start_date).toLocaleDateString() : '',
          dueDate: order.scheduled_end_date ? new Date(order.scheduled_end_date).toLocaleDateString() : '',
          progress: order.completion_percentage,
          componentStatus: order.componentStatus,
        }));
        setOrders(transformedOrders);
        
        // Simulate loading time for better UX
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to load manufacturing orders:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load manufacturing orders",
        });
        // Fallback to empty array on error
        setOrders([]);
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
      // Generate new ID for the order
      const newId = `mo-${Date.now()}`;
      const newOrder: ManufacturingOrder = {
        ...orderData,
        id: newId,
      };
      
      // Add to local state instead of API call
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      toast({
        title: "Success",
        description: "Manufacturing order created successfully",
      });
      
      setShowCreateOrder(false);
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

      {/* KPI Cards */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Orders"
            value={totalOrders}
            change="+12% from last month"
            changeType="positive"
            icon={Package}
          />
          <KPICard
            title="In Progress"
            value={inProgressOrders}
            change="+5% from last week"
            changeType="positive"
            icon={Clock}
          />
          <KPICard
            title="Completed"
            value={completedOrders}
            change="Same as last week"
            changeType="neutral"
            icon={CheckCircle}
          />
          <KPICard
            title="Delayed"
            value={delayedOrders}
            change="-8% from last month"
            changeType="positive"
            icon={AlertTriangle}
          />
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