// Static dummy data for all frontend pages and components
// This replaces API calls with static data for development/demo purposes

export interface ManufacturingOrder {
  mo_id: string;
  id: string;
  mo_number: string;
  orderNumber: string;
  finished_product: string;
  productName: string;
  quantity_to_produce: number;
  quantity: number;
  quantity_produced: number;
  status: 'planned' | 'in_progress' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_start_date: string;
  startDate: string;
  scheduled_end_date: string;
  dueDate: string;
  assigned_to_name: string;
  assignee: string;
  notes: string;
  created_at: string;
  completion_percentage: number;
  progress: number;
  unit_of_measure: string;
  unit: string;
  componentStatus: string;
}

// Analytics and Reports Data Interfaces
export interface AnalyticsData {
  productionMetrics: ProductionMetrics;
  performanceData: PerformanceData[];
  trendData: TrendData[];
  qualityMetrics: QualityMetrics;
  costAnalysis: CostAnalysis;
  resourceUtilization: ResourceUtilization[];
  topProducts: TopProduct[];
  monthlyProduction: MonthlyProduction[];
}

export interface ProductionMetrics {
  totalOrdersThisMonth: number;
  completedOrdersThisMonth: number;
  onTimeDeliveryRate: number;
  averageProductionTime: number;
  totalRevenueThisMonth: number;
  efficiencyRate: number;
  defectRate: number;
  capacityUtilization: number;
}

export interface PerformanceData {
  date: string;
  completed: number;
  planned: number;
  efficiency: number;
}

export interface TrendData {
  month: string;
  orders: number;
  revenue: number;
  efficiency: number;
}

export interface QualityMetrics {
  defectRate: number;
  qualityScore: number;
  reworkRate: number;
  customerSatisfaction: number;
}

export interface CostAnalysis {
  materialCosts: number;
  laborCosts: number;
  overheadCosts: number;
  totalCosts: number;
  costPerUnit: number;
}

export interface ResourceUtilization {
  resource: string;
  utilization: number;
  capacity: number;
  efficiency: number;
}

export interface TopProduct {
  product: string;
  quantity: number;
  revenue: number;
  margin: number;
}

export interface MonthlyProduction {
  month: string;
  planned: number;
  completed: number;
  cancelled: number;
}

export interface BOM {
  bom_id: string;
  id: string;
  bom_code: string;
  bom_name: string;
  finished_product: string;
  version: string;
  status: 'active' | 'draft' | 'obsolete';
  created_at: string;
  components: BOMComponent[];
}

export interface BOMComponent {
  component_id: string;
  product_name: string;
  product_code: string;
  quantity_required: number;
  unit_of_measure: string;
  cost_per_unit: number;
  total_cost: number;
}

export interface WorkOrder {
  wo_id: string;
  id: string;
  wo_number: string;
  operation_name: string;
  status: 'not-started' | 'in-progress' | 'paused' | 'completed';
  sequence_number: number;
  estimated_time_minutes: number;
  actual_time_minutes: number;
  work_center_name: string;
  assigned_to_name: string;
  mo_number: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface WorkCenter {
  work_center_id: string;
  id: string;
  work_center_name: string;
  work_center_code: string;
  capacity_per_hour: number;
  efficiency_percentage: number;
  status: 'active' | 'maintenance' | 'inactive';
  location: string;
  cost_per_hour: number;
}

export interface StockItem {
  product_id: string;
  id: string;
  product_name: string;
  product_code: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  unit_of_measure: string;
  cost_per_unit: number;
  location: string;
  last_updated: string;
}

// Static Manufacturing Orders Data
export const STATIC_MANUFACTURING_ORDERS: ManufacturingOrder[] = [
  {
    mo_id: "mo-001",
    id: "mo-001",
    mo_number: "MO-2025-001",
    orderNumber: "MO-2025-001",
    finished_product: "Office Chair Premium",
    productName: "Office Chair Premium",
    quantity_to_produce: 50,
    quantity: 50,
    quantity_produced: 35,
    status: "in-progress",
    priority: "high",
    scheduled_start_date: "2025-09-20T08:00:00Z",
    startDate: "2025-09-20T08:00:00Z",
    scheduled_end_date: "2025-09-25T17:00:00Z",
    dueDate: "2025-09-25T17:00:00Z",
    assigned_to_name: "John Smith",
    assignee: "John Smith",
    notes: "Rush order for Q4 office expansion",
    created_at: "2025-09-19T10:30:00Z",
    completion_percentage: 70,
    progress: 70,
    unit_of_measure: "Units",
    unit: "Units",
    componentStatus: "Available"
  },
  {
    mo_id: "mo-002",
    id: "mo-002",
    mo_number: "MO-2025-002",
    orderNumber: "MO-2025-002",
    finished_product: "Desk Lamp LED",
    productName: "Desk Lamp LED",
    quantity_to_produce: 100,
    quantity: 100,
    quantity_produced: 0,
    status: "planned",
    priority: "normal",
    scheduled_start_date: "2025-09-22T08:00:00Z",
    startDate: "2025-09-22T08:00:00Z",
    scheduled_end_date: "2025-09-28T17:00:00Z",
    dueDate: "2025-09-28T17:00:00Z",
    assigned_to_name: "Sarah Johnson",
    assignee: "Sarah Johnson",
    notes: "Standard production batch",
    created_at: "2025-09-19T14:15:00Z",
    completion_percentage: 0,
    progress: 0,
    unit_of_measure: "Units",
    unit: "Units",
    componentStatus: "Partial"
  },
  {
    mo_id: "mo-003",
    id: "mo-003",
    mo_number: "MO-2025-003",
    orderNumber: "MO-2025-003",
    finished_product: "Conference Table",
    productName: "Conference Table",
    quantity_to_produce: 10,
    quantity: 10,
    quantity_produced: 10,
    status: "completed",
    priority: "normal",
    scheduled_start_date: "2025-09-15T08:00:00Z",
    startDate: "2025-09-15T08:00:00Z",
    scheduled_end_date: "2025-09-20T17:00:00Z",
    dueDate: "2025-09-20T17:00:00Z",
    assigned_to_name: "Mike Wilson",
    assignee: "Mike Wilson",
    notes: "Custom order completed ahead of schedule",
    created_at: "2025-09-14T09:00:00Z",
    completion_percentage: 100,
    progress: 100,
    unit_of_measure: "Units",
    unit: "Units",
    componentStatus: "Complete"
  },
  {
    mo_id: "mo-004",
    id: "mo-004",
    mo_number: "MO-2025-004",
    orderNumber: "MO-2025-004",
    finished_product: "Bookshelf Unit",
    productName: "Bookshelf Unit",
    quantity_to_produce: 25,
    quantity: 25,
    quantity_produced: 12,
    status: "in-progress",
    priority: "urgent",
    scheduled_start_date: "2025-09-21T08:00:00Z",
    startDate: "2025-09-21T08:00:00Z",
    scheduled_end_date: "2025-09-26T17:00:00Z",
    dueDate: "2025-09-26T17:00:00Z",
    assigned_to_name: "Emily Davis",
    assignee: "Emily Davis",
    notes: "Priority order - customer deadline approaching",
    created_at: "2025-09-20T11:45:00Z",
    completion_percentage: 48,
    progress: 48,
    unit_of_measure: "Units",
    unit: "Units",
    componentStatus: "Available"
  },
  {
    mo_id: "mo-005",
    id: "mo-005",
    mo_number: "MO-2025-005",
    orderNumber: "MO-2025-005",
    finished_product: "Storage Cabinet",
    productName: "Storage Cabinet",
    quantity_to_produce: 30,
    quantity: 30,
    quantity_produced: 0,
    status: "planned",
    priority: "low",
    scheduled_start_date: "2025-09-25T08:00:00Z",
    startDate: "2025-09-25T08:00:00Z",
    scheduled_end_date: "2025-10-02T17:00:00Z",
    dueDate: "2025-10-02T17:00:00Z",
    assigned_to_name: "Robert Brown",
    assignee: "Robert Brown",
    notes: "Low priority batch for inventory build-up",
    created_at: "2025-09-21T16:20:00Z",
    completion_percentage: 0,
    progress: 0,
    unit_of_measure: "Units",
    unit: "Units",
    componentStatus: "Ordered"
  }
];

// Static BOMs Data
export const STATIC_BOMS: BOM[] = [
  {
    bom_id: "bom-001",
    id: "bom-001",
    bom_code: "BOM-OCP-001",
    bom_name: "Office Chair Premium BOM",
    finished_product: "Office Chair Premium",
    version: "v1.2",
    status: "active",
    created_at: "2025-08-15T10:00:00Z",
    components: [
      {
        component_id: "comp-001",
        product_name: "Chair Base - Plastic",
        product_code: "CHR-BASE-001",
        quantity_required: 1,
        unit_of_measure: "Units",
        cost_per_unit: 25.50,
        total_cost: 25.50
      },
      {
        component_id: "comp-002",
        product_name: "Chair Wheels",
        product_code: "CHR-WHL-001",
        quantity_required: 5,
        unit_of_measure: "Units",
        cost_per_unit: 3.75,
        total_cost: 18.75
      },
      {
        component_id: "comp-003",
        product_name: "Seat Cushion",
        product_code: "CHR-SEAT-001",
        quantity_required: 1,
        unit_of_measure: "Units",
        cost_per_unit: 45.00,
        total_cost: 45.00
      }
    ]
  },
  {
    bom_id: "bom-002",
    id: "bom-002",
    bom_code: "BOM-DLM-001",
    bom_name: "Desk Lamp LED BOM",
    finished_product: "Desk Lamp LED",
    version: "v1.0",
    status: "active",
    created_at: "2025-08-20T14:30:00Z",
    components: [
      {
        component_id: "comp-004",
        product_name: "LED Bulb 15W",
        product_code: "LED-15W-001",
        quantity_required: 1,
        unit_of_measure: "Units",
        cost_per_unit: 12.00,
        total_cost: 12.00
      },
      {
        component_id: "comp-005",
        product_name: "Lamp Base - Metal",
        product_code: "LMP-BASE-001",
        quantity_required: 1,
        unit_of_measure: "Units",
        cost_per_unit: 18.50,
        total_cost: 18.50
      }
    ]
  }
];

// Static Work Orders Data
export const STATIC_WORK_ORDERS: WorkOrder[] = [
  {
    wo_id: "wo-001",
    id: "wo-001",
    wo_number: "WO-2025-001",
    operation_name: "Chair Assembly",
    status: "in-progress",
    sequence_number: 1,
    estimated_time_minutes: 45,
    actual_time_minutes: 32,
    work_center_name: "Assembly Line A",
    assigned_to_name: "John Smith",
    mo_number: "MO-2025-001",
    started_at: "2025-09-21T08:30:00Z",
    completed_at: null
  },
  {
    wo_id: "wo-002",
    id: "wo-002",
    wo_number: "WO-2025-002",
    operation_name: "Quality Check",
    status: "not-started",
    sequence_number: 2,
    estimated_time_minutes: 15,
    actual_time_minutes: 0,
    work_center_name: "QC Station 1",
    assigned_to_name: "Sarah Johnson",
    mo_number: "MO-2025-001",
    started_at: null,
    completed_at: null
  },
  {
    wo_id: "wo-003",
    id: "wo-003",
    wo_number: "WO-2025-003",
    operation_name: "Packaging",
    status: "completed",
    sequence_number: 3,
    estimated_time_minutes: 20,
    actual_time_minutes: 18,
    work_center_name: "Packaging Station",
    assigned_to_name: "Mike Wilson",
    mo_number: "MO-2025-003",
    started_at: "2025-09-20T14:00:00Z",
    completed_at: "2025-09-20T14:18:00Z"
  }
];

// Static Work Centers Data
export const STATIC_WORK_CENTERS: WorkCenter[] = [
  {
    work_center_id: "wc-001",
    id: "wc-001",
    work_center_name: "Assembly Line A",
    work_center_code: "ASM-A-001",
    capacity_per_hour: 10,
    efficiency_percentage: 85,
    status: "active",
    location: "Floor 1 - Section A",
    cost_per_hour: 50.00
  },
  {
    work_center_id: "wc-002",
    id: "wc-002",
    work_center_name: "QC Station 1",
    work_center_code: "QC-001",
    capacity_per_hour: 15,
    efficiency_percentage: 92,
    status: "active",
    location: "Floor 1 - Section B",
    cost_per_hour: 35.00
  },
  {
    work_center_id: "wc-003",
    id: "wc-003",
    work_center_name: "Packaging Station",
    work_center_code: "PKG-001",
    capacity_per_hour: 20,
    efficiency_percentage: 88,
    status: "maintenance",
    location: "Floor 2 - Section A",
    cost_per_hour: 40.00
  }
];

// Static Stock/Inventory Data
export const STATIC_STOCK_ITEMS: StockItem[] = [
  {
    product_id: "prod-001",
    id: "prod-001",
    product_name: "Chair Base - Plastic",
    product_code: "CHR-BASE-001",
    current_stock: 150,
    reserved_stock: 50,
    available_stock: 100,
    unit_of_measure: "Units",
    cost_per_unit: 25.50,
    location: "Warehouse A - Shelf 1",
    last_updated: "2025-09-21T08:00:00Z"
  },
  {
    product_id: "prod-002",
    id: "prod-002",
    product_name: "Chair Wheels",
    product_code: "CHR-WHL-001",
    current_stock: 500,
    reserved_stock: 250,
    available_stock: 250,
    unit_of_measure: "Units",
    cost_per_unit: 3.75,
    location: "Warehouse A - Shelf 2",
    last_updated: "2025-09-21T08:00:00Z"
  },
  {
    product_id: "prod-003",
    id: "prod-003",
    product_name: "LED Bulb 15W",
    product_code: "LED-15W-001",
    current_stock: 200,
    reserved_stock: 100,
    available_stock: 100,
    unit_of_measure: "Units",
    cost_per_unit: 12.00,
    location: "Warehouse B - Shelf 3",
    last_updated: "2025-09-21T08:00:00Z"
  }
];

// Static Users for Assignee Dropdowns
export const STATIC_USERS = [
  { id: "user-001", name: "John Smith", role: "operator" },
  { id: "user-002", name: "Sarah Johnson", role: "manufacturing_manager" },
  { id: "user-003", name: "Mike Wilson", role: "operator" },
  { id: "user-004", name: "Emily Davis", role: "operator" },
  { id: "user-005", name: "Robert Brown", role: "inventory_manager" }
];

// Static Products for Dropdowns
export const STATIC_PRODUCTS = [
  { id: "prod-finished-001", name: "Office Chair Premium", code: "OCP-001" },
  { id: "prod-finished-002", name: "Desk Lamp LED", code: "DLM-001" },
  { id: "prod-finished-003", name: "Conference Table", code: "CT-001" },
  { id: "prod-finished-004", name: "Bookshelf Unit", code: "BSU-001" },
  { id: "prod-finished-005", name: "Storage Cabinet", code: "SC-001" }
];

// Helper functions for filtering and searching static data
export const filterOrdersByStatus = (status: string) => {
  if (status === 'all') return STATIC_MANUFACTURING_ORDERS;
  return STATIC_MANUFACTURING_ORDERS.filter(order => order.status === status);
};

export const filterOrdersByPriority = (priority: string) => {
  if (priority === 'all') return STATIC_MANUFACTURING_ORDERS;
  return STATIC_MANUFACTURING_ORDERS.filter(order => order.priority === priority);
};

export const searchOrders = (searchTerm: string) => {
  if (!searchTerm) return STATIC_MANUFACTURING_ORDERS;
  const term = searchTerm.toLowerCase();
  return STATIC_MANUFACTURING_ORDERS.filter(order => 
    order.mo_number.toLowerCase().includes(term) ||
    order.finished_product.toLowerCase().includes(term) ||
    order.assigned_to_name.toLowerCase().includes(term)
  );
};

// Summary statistics for dashboard
export const getOrdersSummary = () => {
  const total = STATIC_MANUFACTURING_ORDERS.length;
  const planned = STATIC_MANUFACTURING_ORDERS.filter(o => o.status === 'planned').length;
  const inProgress = STATIC_MANUFACTURING_ORDERS.filter(o => o.status === 'in-progress' || o.status === 'in_progress').length;
  const completed = STATIC_MANUFACTURING_ORDERS.filter(o => o.status === 'completed').length;
  const urgent = STATIC_MANUFACTURING_ORDERS.filter(o => o.priority === 'urgent').length;
  
  return {
    total_orders: total,
    planned_orders: planned,
    in_progress_orders: inProgress,
    completed_orders: completed,
    urgent_orders: urgent
  };
};

// Analytics and Reports Static Data
export const ANALYTICS_DATA: AnalyticsData = {
  productionMetrics: {
    totalOrdersThisMonth: 142,
    completedOrdersThisMonth: 128,
    onTimeDeliveryRate: 94.5,
    averageProductionTime: 4.2,
    totalRevenueThisMonth: 485600,
    efficiencyRate: 89.2,
    defectRate: 2.1,
    capacityUtilization: 78.5
  },
  performanceData: [
    { date: '2025-09-01', completed: 12, planned: 15, efficiency: 80 },
    { date: '2025-09-02', completed: 18, planned: 20, efficiency: 90 },
    { date: '2025-09-03', completed: 14, planned: 16, efficiency: 87.5 },
    { date: '2025-09-04', completed: 22, planned: 25, efficiency: 88 },
    { date: '2025-09-05', completed: 20, planned: 22, efficiency: 90.9 },
    { date: '2025-09-06', completed: 16, planned: 18, efficiency: 88.9 },
    { date: '2025-09-07', completed: 19, planned: 21, efficiency: 90.5 },
    { date: '2025-09-08', completed: 15, planned: 17, efficiency: 88.2 },
    { date: '2025-09-09', completed: 21, planned: 23, efficiency: 91.3 },
    { date: '2025-09-10', completed: 17, planned: 19, efficiency: 89.5 },
    { date: '2025-09-11', completed: 23, planned: 24, efficiency: 95.8 },
    { date: '2025-09-12', completed: 18, planned: 20, efficiency: 90 },
    { date: '2025-09-13', completed: 20, planned: 22, efficiency: 90.9 },
    { date: '2025-09-14', completed: 16, planned: 18, efficiency: 88.9 },
  ],
  trendData: [
    { month: 'Jan 2025', orders: 95, revenue: 320000, efficiency: 85.2 },
    { month: 'Feb 2025', orders: 110, revenue: 385000, efficiency: 87.8 },
    { month: 'Mar 2025', orders: 125, revenue: 425000, efficiency: 89.1 },
    { month: 'Apr 2025', orders: 118, revenue: 398000, efficiency: 86.5 },
    { month: 'May 2025', orders: 132, revenue: 448000, efficiency: 90.3 },
    { month: 'Jun 2025', orders: 140, revenue: 467000, efficiency: 91.2 },
    { month: 'Jul 2025', orders: 135, revenue: 455000, efficiency: 88.7 },
    { month: 'Aug 2025', orders: 145, revenue: 478000, efficiency: 92.1 },
    { month: 'Sep 2025', orders: 142, revenue: 485600, efficiency: 89.2 },
  ],
  qualityMetrics: {
    defectRate: 2.1,
    qualityScore: 96.8,
    reworkRate: 3.2,
    customerSatisfaction: 94.5
  },
  costAnalysis: {
    materialCosts: 285600,
    laborCosts: 125400,
    overheadCosts: 74600,
    totalCosts: 485600,
    costPerUnit: 28.75
  },
  resourceUtilization: [
    { resource: 'Assembly Line 1', utilization: 85.2, capacity: 100, efficiency: 92.3 },
    { resource: 'Assembly Line 2', utilization: 78.9, capacity: 100, efficiency: 89.1 },
    { resource: 'Welding Station', utilization: 92.1, capacity: 100, efficiency: 94.5 },
    { resource: 'Paint Booth', utilization: 67.8, capacity: 100, efficiency: 87.2 },
    { resource: 'Quality Control', utilization: 74.3, capacity: 100, efficiency: 96.1 },
    { resource: 'Packaging Area', utilization: 81.6, capacity: 100, efficiency: 93.7 }
  ],
  topProducts: [
    { product: 'Office Chair Premium', quantity: 45, revenue: 135000, margin: 32.5 },
    { product: 'Executive Desk', quantity: 28, revenue: 98000, margin: 28.7 },
    { product: 'Conference Table', quantity: 22, revenue: 88000, margin: 35.2 },
    { product: 'Filing Cabinet', quantity: 38, revenue: 57000, margin: 24.8 },
    { product: 'Bookshelf Unit', quantity: 35, revenue: 52500, margin: 29.1 }
  ],
  monthlyProduction: [
    { month: 'Jan', planned: 95, completed: 89, cancelled: 3 },
    { month: 'Feb', planned: 110, completed: 105, cancelled: 2 },
    { month: 'Mar', planned: 125, completed: 121, cancelled: 1 },
    { month: 'Apr', planned: 118, completed: 115, cancelled: 1 },
    { month: 'May', planned: 132, completed: 128, cancelled: 2 },
    { month: 'Jun', planned: 140, completed: 136, cancelled: 2 },
    { month: 'Jul', planned: 135, completed: 131, cancelled: 3 },
    { month: 'Aug', planned: 145, completed: 141, cancelled: 1 },
    { month: 'Sep', planned: 142, completed: 128, cancelled: 2 }
  ]
};