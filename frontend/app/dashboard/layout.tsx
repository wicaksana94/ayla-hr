import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Role } from "@/config/navigation";

// Default role - in production, this would come from your database
const DEFAULT_ROLE: Role = 'employee';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  // TODO: Replace with actual API call to get user role from database
  // For now, use default role
  const userRole: Role = DEFAULT_ROLE;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar userRole={userRole} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        {/* Page Content */}
        <main className="flex-1 bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
