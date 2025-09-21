import { 
  Package, 
  ClipboardList, 
  Wrench, 
  BarChart3, 
  FileText,
  Home,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, isCollapsed: externalCollapsed, onToggleCollapse }: SidebarProps) => {
  // Use external collapsed state if provided, otherwise default to false
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : false;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "manufacturing-orders", label: "Manufacturing Orders", icon: Package },
    { id: "work-orders", label: "Work Orders", icon: ClipboardList },
    { id: "work-centers", label: "Work Centers", icon: Wrench },
    { id: "stock-ledger", label: "Stock Ledger", icon: BarChart3 },
    { id: "bom", label: "Bill of Materials", icon: FileText },
    { id: "reports", label: "Reports & Analytics", icon: TrendingUp },
  ];

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 h-full flex flex-col shadow-sm",
      isCollapsed ? "w-16" : "w-64"
    )}>
     
      
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 transition-all duration-200",
                    isCollapsed ? "px-2" : "px-3",
                    activeSection === item.id 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;