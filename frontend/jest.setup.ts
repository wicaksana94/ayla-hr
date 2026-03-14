import '@testing-library/jest-dom';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  auth: () => new Promise((resolve) => resolve({ userId: 'test-user-id' })),
  useUser: () => ({
    user: {
      id: 'test-user-id',
      fullName: 'Test User',
      username: 'testuser',
      primaryEmailAddress: {
        emailAddress: 'test@example.com',
      },
    },
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  }),
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Menu: () => null,
  Bell: () => null,
  Globe: () => null,
  ChevronDown: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
  LogOut: () => null,
  Check: () => null,
  Languages: () => null,
  LayoutDashboard: () => null,
  Users: () => null,
  Building2: () => null,
  Briefcase: () => null,
  Calendar: () => null,
  Settings: () => null,
  Clock: () => null,
  BarChart3: () => null,
  UserCog: () => null,
  Plus: () => null,
}));
