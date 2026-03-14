import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  Calendar, 
  Settings,
  UserCog,
  Clock,
  BarChart3
} from "lucide-react";

export type Role = "admin" | "hr_manager" | "manager" | "employee";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "hr_manager", "manager", "employee"] },
      { name: "My Leave", href: "/dashboard/my-leave", icon: Clock, roles: ["admin", "hr_manager", "manager", "employee"] },
    ],
  },
  {
    title: "HR Management",
    items: [
      { name: "Employees", href: "/dashboard/employees", icon: Users, roles: ["admin", "hr_manager"] },
      { name: "Departments", href: "/dashboard/departments", icon: Building2, roles: ["admin", "hr_manager"] },
      { name: "Positions", href: "/dashboard/positions", icon: Briefcase, roles: ["admin", "hr_manager"] },
      { name: "Leave Requests", href: "/dashboard/leaves", icon: Calendar, roles: ["admin", "hr_manager", "manager"] },
      { name: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["admin", "hr_manager"] },
    ],
  },
  {
    title: "Settings",
    items: [
      { name: "Profile", href: "/dashboard/profile", icon: UserCog, roles: ["admin", "hr_manager", "manager", "employee"] },
      { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin", "hr_manager"] },
    ],
  },
];

export function getNavigationByRole(userRole: Role): NavItem[] {
  const allowedItems: NavItem[] = [];
  
  navigationConfig.forEach((group) => {
    group.items.forEach((item) => {
      if (item.roles.includes(userRole)) {
        allowedItems.push(item);
      }
    });
  });
  
  return allowedItems;
}
