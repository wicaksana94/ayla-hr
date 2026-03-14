import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Building2, 
  Briefcase, 
  Calendar, 
  Settings,
  Bell,
  Globe
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Users },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Departments", href: "/dashboard/departments", icon: Building2 },
  { name: "Positions", href: "/dashboard/positions", icon: Briefcase },
  { name: "Leave Requests", href: "/dashboard/leaves", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-xl font-bold">AylaHR</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-accent rounded-md">
                <Globe className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-accent rounded-md relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
