import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Role } from "@/config/navigation";
import { useState } from "react";

const DEFAULT_ROLE: Role = 'hr_manager';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userRole: Role = DEFAULT_ROLE;

  return (
    <div className="min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar userRole={userRole} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="md:ml-64 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
