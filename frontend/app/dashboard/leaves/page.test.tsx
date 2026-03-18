import { render, screen, fireEvent } from '@testing-library/react';
import { Leave } from '@/lib/api/leaves';

// Mock the toast hook
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Mock clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null }),
}));

// Mock leaves API
jest.mock('@/lib/api/leaves', () => ({
  getLeaves: jest.fn(),
  getLeaveTypes: jest.fn(),
  updateLeaveStatus: jest.fn(),
}));

import { getLeaves, getLeaveTypes, updateLeaveStatus } from '@/lib/api/leaves';
import LeavesPage from '@/app/dashboard/leaves/page';

const mockLeave: Leave = {
  id: 1,
  user_id: 1,
  leave_type: 'sick',
  start_date: '2026-04-01',
  end_date: '2026-04-01',
  total_days: 1,
  reason: 'Test reason',
  attachment: 'https://uploadthing.com/files/test.jpg',
  status: 'pending',
  approved_by: null,
  approved_at: null,
};

const mockLeaveTypes = [
  { id: 1, name: 'Sick Leave', code: 'sick', is_paid: true, annual_limit: 10, is_active: true },
];

describe('Leaves Page - Download Attachment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getLeaves as jest.Mock).mockResolvedValue({ data: [mockLeave] });
    (getLeaveTypes as jest.Mock).mockResolvedValue(mockLeaveTypes);
  });

  it('should render leave requests table', async () => {
    render(<LeavesPage />);
    
    await screen.findByText('Leave Requests');
    expect(screen.getByText('User #1')).toBeInTheDocument();
    expect(screen.getByText('Sick Leave')).toBeInTheDocument();
  });

  it('should open modal when clicking a row', async () => {
    render(<LeavesPage />);
    
    const row = await screen.findByText('User #1');
    fireEvent.click(row);
    
    expect(screen.getByText('Leave Request Details')).toBeInTheDocument();
    expect(screen.getByText('Test reason')).toBeInTheDocument();
  });

  it('should show download link when attachment exists', async () => {
    render(<LeavesPage />);
    
    const row = await screen.findByText('User #1');
    fireEvent.click(row);
    
    const downloadLink = screen.getByText(/📎 Download Attachment/i);
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', 'https://uploadthing.com/files/test.jpg');
    expect(downloadLink).toHaveAttribute('download');
  });

  it('should not show download section when attachment is null', async () => {
    (getLeaves as jest.Mock).mockResolvedValue({
      data: [{ ...mockLeave, attachment: null }],
    });
    
    render(<LeavesPage />);
    
    const row = await screen.findByText('User #1');
    fireEvent.click(row);
    
    expect(screen.queryByText(/Download Attachment/i)).not.toBeInTheDocument();
  });

  it('should display correct leave details in modal', async () => {
    render(<LeavesPage />);
    
    const row = await screen.findByText('User #1');
    fireEvent.click(row);
    
    expect(screen.getByText('User #1')).toBeInTheDocument();
    expect(screen.getByText('2026-04-01 to 2026-04-01')).toBeInTheDocument();
    expect(screen.getByText('(1 day)')).toBeInTheDocument();
    expect(screen.getByText('Sick Leave')).toBeInTheDocument();
    expect(screen.getByText('Test reason')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
