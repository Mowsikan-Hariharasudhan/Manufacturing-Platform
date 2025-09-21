import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import ManufacturingOrdersPage from "@/components/manufacturing-orders/ManufacturingOrdersPage";
import WorkOrdersPage from "@/components/work-orders/WorkOrdersPage";
import WorkCentersPage from "@/components/work-centers/WorkCentersPage";
import StockLedgerPage from "@/components/stock-ledger/StockLedgerPage";
import BOMPage from "@/components/bom/BOMPage";
import ReportsAnalyticsPage from "@/components/reports/ReportsAnalyticsPage";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "manufacturing-orders":
        return <ManufacturingOrdersPage />;
      case "work-orders":
        return <WorkOrdersPage />;
      case "work-centers":
        return <WorkCentersPage />;
      case "stock-ledger":
        return <StockLedgerPage />;
      case "bom":
        return <BOMPage />;
      case "reports":
        return <ReportsAnalyticsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuToggle={handleMenuToggle} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleMenuToggle}
        />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
