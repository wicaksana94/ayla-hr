'use client';

import { useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-xl font-bold">AylaHR</span>
          </div>
          <div className="flex items-center space-x-4">
            <SignedOut>
              <Link href="/sign-in">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Sign In
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Human Resources,<br />
            <span className="text-primary">Simplified</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern HR platform to manage employees, departments, positions, 
            and leave requests all in one place.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <SignedOut>
              <Link href="/sign-in">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-lg">
                  Get Started
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-6 py-3 border border-input rounded-md hover:bg-accent text-lg">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Employee Management</h3>
              <p className="text-muted-foreground">
                Manage employee data, departments, and positions with ease.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Leave Management</h3>
              <p className="text-muted-foreground">
                Handle annual, sick, paid, and unpaid leaves with date pickers.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Strict access control for Admin, HR, Manager, and Employees.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 AylaHR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
