import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Role } from "@/config/navigation";

// Mock function to get user role - in production, this would come from your database/API
async function getUserRole(clerkId: string): Promise<Role> {
  // TODO: Replace with actual API call to backend
  // This is a mock implementation
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/${clerkId}/role`, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch(() => null);

  if (response?.ok) {
    const data = await response.json();
    return data.role as Role;
  }

  // Default role for now - in production this would be fetched from database
  return 'employee';
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  // Get user role - default to employee if not found
  let userRole: Role = 'employee';
  try {
    userRole = await getUserRole(userId);
  } catch {
    // Use default role if API fails
    console.log('Using default role: employee');
  }

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
