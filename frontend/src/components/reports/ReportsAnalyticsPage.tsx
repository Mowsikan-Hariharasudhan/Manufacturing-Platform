import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Factory, 
  Users, 
  BarChart3,
  Download,
  Calendar,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { ANALYTICS_DATA } from '@/data/staticData';

const ReportsAnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedChart, setSelectedChart] = useState('performance');

  const { 
    productionMetrics, 
    performanceData, 
    trendData, 
    qualityMetrics, 
    costAnalysis, 
    resourceUtilization, 
    topProducts, 
    monthlyProduction 
  } = ANALYTICS_DATA;

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const MetricCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatPercentage = (value) => `${value}%`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Manufacturing performance insights and key metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={productionMetrics.totalOrdersThisMonth}
          icon={Package}
          trend="up"
          trendValue={12.5}
          color="blue"
        />
        <MetricCard
          title="Completed Orders"
          value={productionMetrics.completedOrdersThisMonth}
          icon={CheckCircle}
          trend="up"
          trendValue={8.3}
          color="green"
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(productionMetrics.totalRevenueThisMonth)}
          icon={DollarSign}
          trend="up"
          trendValue={15.7}
          color="emerald"
        />
        <MetricCard
          title="Efficiency Rate"
          value={formatPercentage(productionMetrics.efficiencyRate)}
          icon={Zap}
          trend="up"
          trendValue={3.2}
          color="yellow"
        />
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="On-Time Delivery"
          value={formatPercentage(productionMetrics.onTimeDeliveryRate)}
          icon={Clock}
          trend="up"
          trendValue={2.1}
          color="indigo"
        />
        <MetricCard
          title="Capacity Utilization"
          value={formatPercentage(productionMetrics.capacityUtilization)}
          icon={Factory}
          trend="down"
          trendValue={1.8}
          color="purple"
        />
        <MetricCard
          title="Quality Score"
          value={formatPercentage(qualityMetrics.qualityScore)}
          icon={Award}
          trend="up"
          trendValue={1.5}
          color="pink"
        />
        <MetricCard
          title="Defect Rate"
          value={formatPercentage(productionMetrics.defectRate)}
          icon={AlertTriangle}
          trend="down"
          trendValue={0.5}
          color="red"
        />
      </div>

      {/* Charts and Analysis */}
      <Tabs value={selectedChart} onValueChange={setSelectedChart} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate().toString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [value, name === 'completed' ? 'Completed' : 'Planned']}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="#10B981" name="Completed" />
                    <Bar dataKey="planned" fill="#6B7280" name="Planned" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate().toString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`${value}%`, 'Efficiency']}
                    />
                    <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Production Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyProduction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.8}
                    name="Completed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cancelled" 
                    stackId="1" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.8}
                    name="Cancelled"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Efficiency'
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    name="Orders"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    name="Revenue"
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#F59E0B" 
                    strokeWidth={2} 
                    name="Efficiency %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resourceUtilization.map((resource, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{resource.resource}</span>
                      <span className="text-gray-600">{resource.utilization}%</span>
                    </div>
                    <Progress value={resource.utilization} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Efficiency: {resource.efficiency}%</span>
                      <span>Capacity: {resource.capacity}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceUtilization} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="resource" type="category" width={120} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Efficiency']} />
                    <Bar dataKey="efficiency" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topProducts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="product"
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{product.product}</p>
                      <p className="text-xs text-gray-600">Qty: {product.quantity} units</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(product.revenue)}</p>
                      <Badge variant={product.margin > 30 ? "default" : "secondary"} className="text-xs">
                        {product.margin}% margin
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Materials', value: costAnalysis.materialCosts },
                        { name: 'Labor', value: costAnalysis.laborCosts },
                        { name: 'Overhead', value: costAnalysis.overheadCosts },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(costAnalysis.materialCosts)}</p>
                    <p className="text-sm text-gray-600">Material Costs</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(costAnalysis.laborCosts)}</p>
                    <p className="text-sm text-gray-600">Labor Costs</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(costAnalysis.overheadCosts)}</p>
                    <p className="text-sm text-gray-600">Overhead Costs</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">${costAnalysis.costPerUnit}</p>
                    <p className="text-sm text-gray-600">Cost per Unit</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Cost Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Production Costs:</span>
                      <span className="font-semibold">{formatCurrency(costAnalysis.totalCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Units Produced:</span>
                      <span className="font-semibold">{productionMetrics.completedOrdersThisMonth}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Average Cost per Unit:</span>
                      <span className="font-bold">${costAnalysis.costPerUnit}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalyticsPage;