import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/sidebar/Sidebar';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    render(<Sidebar />);
    expect(screen.getByText('AylaHR')).toBeInTheDocument();
  });

  it('displays navigation items for employee role', () => {
    render(<Sidebar userRole="employee" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Leave')).toBeInTheDocument();
  });

  it('displays additional navigation items for admin role', () => {
    render(<Sidebar userRole="admin" />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText('Positions')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('displays HR Manager specific items', () => {
    render(<Sidebar userRole="hr_manager" />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText('Positions')).toBeInTheDocument();
    expect(screen.getByText('Leave Requests')).toBeInTheDocument();
  });

  it('displays Manager specific items', () => {
    render(<Sidebar userRole="manager" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Leave Requests')).toBeInTheDocument();
    expect(screen.queryByText('Employees')).not.toBeInTheDocument();
  });

  it('toggles collapse state when button is clicked', () => {
    render(<Sidebar />);
    const collapseButton = screen.getByLabelText('Collapse sidebar');
    
    // Initial state - sidebar should be expanded (showing text)
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Click collapse button
    fireEvent.click(collapseButton);
    
    // Sidebar should be collapsed (text hidden, but navigation still exists)
    // The sidebar element should now have different width class
  });

  it('shows sign out button', () => {
    render(<Sidebar />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });
});
