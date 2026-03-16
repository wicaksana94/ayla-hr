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
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    Menu: () => React.createElement('div', { 'data-testid': 'menu-icon' }),
    Bell: () => React.createElement('div', { 'data-testid': 'bell-icon' }),
    Globe: () => React.createElement('div', { 'data-testid': 'globe-icon' }),
    ChevronDown: () => React.createElement('div', { 'data-testid': 'chevron-down' }),
    ChevronLeft: () => React.createElement('div', { 'data-testid': 'chevron-left' }),
    ChevronRight: () => React.createElement('div', { 'data-testid': 'chevron-right' }),
    LogOut: () => React.createElement('div', { 'data-testid': 'logout-icon' }),
    Check: () => React.createElement('div', { 'data-testid': 'check-icon' }),
    Languages: () => React.createElement('div', { 'data-testid': 'languages-icon' }),
    LayoutDashboard: () => React.createElement('div', { 'data-testid': 'dashboard-icon' }),
    Users: () => React.createElement('div', { 'data-testid': 'users-icon' }),
    Building2: () => React.createElement('div', { 'data-testid': 'building-icon' }),
    Briefcase: () => React.createElement('div', { 'data-testid': 'briefcase-icon' }),
    Calendar: () => React.createElement('div', { 'data-testid': 'calendar-icon' }),
    CalendarDays: () => React.createElement('div', { 'data-testid': 'calendar-days-icon' }),
    Settings: () => React.createElement('div', { 'data-testid': 'settings-icon' }),
    Clock: () => React.createElement('div', { 'data-testid': 'clock-icon' }),
    BarChart3: () => React.createElement('div', { 'data-testid': 'chart-icon' }),
    UserCog: () => React.createElement('div', { 'data-testid': 'usercog-icon' }),
    Plus: () => React.createElement('div', { 'data-testid': 'plus-icon' }),
    Loader2: () => React.createElement('div', { 'data-testid': 'loader-icon' }),
    X: () => React.createElement('div', { 'data-testid': 'x-icon' }),
    Search: () => React.createElement('div', { 'data-testid': 'search-icon' }),
    CheckCircle: () => React.createElement('div', { 'data-testid': 'check-circle-icon' }),
    XCircle: () => React.createElement('div', { 'data-testid': 'x-circle-icon' }),
  };
});

// Mock Radix UI components
jest.mock('@radix-ui/react-select', () => {
  const React = require('react');
  const MockSelect = ({
    children,
  }: {
    children: React.ReactNode;
  }) => React.createElement('div', { 'data-testid': 'select' }, children);
  
  return {
    Select: MockSelect,
    SelectTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement('button', { 'data-testid': 'select-trigger' }, children),
    SelectValue: ({ placeholder }: { placeholder?: string }) =>
      React.createElement('span', { 'data-testid': 'select-value' }, placeholder || ''),
    SelectContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'select-content' }, children),
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
      React.createElement('div', { 'data-testid': `select-item-${value}` }, children),
  };
});

jest.mock('@radix-ui/react-popover', () => {
  const React = require('react');
  return {
    Popover: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'popover' }, children),
    PopoverTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement('button', { 'data-testid': 'popover-trigger' }, children),
    PopoverContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'popover-content' }, children),
  };
});

jest.mock('@radix-ui/react-dialog', () => {
  const React = require('react');
  return {
    Dialog: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog' }, children),
    DialogTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement('button', { 'data-testid': 'dialog-trigger' }, children),
    DialogContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-content' }, children),
    DialogHeader: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-header' }, children),
    DialogFooter: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-footer' }, children),
    DialogTitle: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-title' }, children),
    DialogDescription: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-description' }, children),
  };
});

// Mock UI components
jest.mock('@/components/ui/card', () => {
  const React = require('react');
  return {
    Card: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'card' }, children),
    CardHeader: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'card-header' }, children),
    CardContent: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'card-content' }, children),
    CardTitle: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'card-title' }, children),
  };
});

jest.mock('@/components/ui/button', () => {
  const React = require('react');
  return {
    Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => 
      React.createElement('button', { ...props }, children),
  };
});

jest.mock('@/components/ui/input', () => {
  const React = require('react');
  return {
    Input: (props: any) => React.createElement('input', { ...props }),
  };
});

jest.mock('@/components/ui/calendar', () => {
  const React = require('react');
  return {
    Calendar: () => React.createElement('div', { 'data-testid': 'calendar' }),
  };
});

// Mock UI components at the import path
jest.mock('@/components/ui/select', () => {
  const React = require('react');
  return {
    Select: ({ children }: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'select' }, children),
    SelectTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement('button', { 'data-testid': 'select-trigger' }, children),
    SelectValue: ({ placeholder }: { placeholder?: string }) =>
      React.createElement('span', { 'data-testid': 'select-value' }, placeholder || ''),
    SelectContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'select-content' }, children),
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
      React.createElement('div', { 'data-testid': `select-item-${value}` }, children),
  };
});

jest.mock('@/components/ui/popover', () => {
  const React = require('react');
  return {
    Popover: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'popover' }, children),
    PopoverTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement('button', { 'data-testid': 'popover-trigger' }, children),
    PopoverContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'popover-content' }, children),
  };
});

jest.mock('@/components/ui/dialog', () => {
  const React = require('react');
  return {
    Dialog: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog' }, children),
    DialogTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement('button', { 'data-testid': 'dialog-trigger' }, children),
    DialogContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-content' }, children),
    DialogHeader: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-header' }, children),
    DialogFooter: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-footer' }, children),
    DialogTitle: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-title' }, children),
    DialogDescription: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-description' }, children),
  };
});
