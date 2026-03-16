import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyLeavePage from '@/app/dashboard/my-leave/page';

// Mock the API
const mockLeaveTypes = [
  { id: 1, code: 'annual', is_paid: true, annual_limit: 12, is_active: true },
  { id: 2, code: 'sick', name: 'Cuti Sakit', is_paid: true, annual_limit: 10, is_active: true },
  { id: 3, code: 'maternity', name: 'Cuti Melahirkan', is_paid: true, annual_limit: 90, is_active: true },
  { id: 4, code: 'marriage', name: 'Cuti Pernikahan', is_paid: true, annual_limit: 3, is_active: true },
  { id: 5, code: 'bereavement', name: 'Cuti Kematian', is_paid: true, annual_limit: 3, is_active: true },
  { id: 6, code: 'baptism', name: 'Cuti Baptis/Sunatan', is_paid: true, annual_limit: 2, is_active: true },
  { id: 7, code: 'paid_leave', name: 'Cuti Berbayar', is_paid: true, annual_limit: 5, is_active: true },
  { id: 8, code: 'unpaid_leave', name: 'Cuti Tidak Berbayar', is_paid: false, annual_limit: 0, is_active: true },
];

const mockLeaves = [
  {
    id: 1,
    user_id: 1,
    leave_type: 'annual',
    start_date: '2026-03-01',
    end_date: '2026-03-03',
    total_days: 3,
    reason: 'Family vacation',
    status: 'approved' as const,
    approved_by: 2,
    approved_at: '2026-03-01T10:00:00Z',
  },
];

// Mock global fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('MyLeavePage', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders leave balance cards with correct data', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaveTypes,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLeaves, page: 1, limit: 10 }),
      });

    render(<MyLeavePage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Cuti Tahunan')).toBeInTheDocument();
      expect(screen.getByText('Cuti Sakit')).toBeInTheDocument();
    });

    // Check balance cards show correct values
    expect(screen.getByText('12')).toBeInTheDocument(); // annual
    expect(screen.getByText('10')).toBeInTheDocument(); // sick
  });

  it('displays leave type dropdown with all options', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaveTypes,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], page: 1, limit: 10 }),
      });

    render(<MyLeavePage />);

    await waitFor(() => {
      expect(screen.getByText('Leave Type')).toBeInTheDocument();
    });

    // Click the select to open dropdown
    const selectTrigger = screen.getByText('Leave Type').closest('button') || 
      screen.getAllByRole('combobox')[0];
    
    await userEvent.click(selectTrigger);

    // Check all leave types are in the dropdown
    await waitFor(() => {
      expect(screen.getByText('Cuti Tahunan')).toBeInTheDocument();
      expect(screen.getByText('Cuti Sakit')).toBeInTheDocument();
      expect(screen.getByText('Cuti Melahkanirkan')).toBeInTheDocument();
      expect(screen.getByText('Cuti Pernikahan')).toBeInTheDocument();
      expect(screen.getByText('Cuti Kematian')).toBeInTheDocument();
      expect(screen.getByText('Cuti Baptis/Sunatan')).toBeInTheDocument();
      expect(screen.getByText('Cuti Berbayar')).toBeInTheDocument();
      expect(screen.getByText('Cuti Tidak Berbayar')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<MyLeavePage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], page: 1, limit: 10 }),
      });

    render(<MyLeavePage />);

    // Should still render even if leave types fail
    await waitFor(() => {
      expect(screen.getByText('My Leave')).toBeInTheDocument();
    });
  });

  it('shows unpaid leave as infinity symbol', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaveTypes,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], page: 1, limit: 10 }),
      });

    render(<MyLeavePage />);

    await waitFor(() => {
      expect(screen.getByText('∞')).toBeInTheDocument();
    });
  });
});
