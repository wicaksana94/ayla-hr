const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ayla-hr.onrender.com';

export interface Leave {
  id: number;
  user_id: number | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  attachment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: number | null;
  approved_at: string | null;
}

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  is_paid: boolean;
  annual_limit: number;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
}

// Leave Types
export async function getLeaveTypes(): Promise<LeaveType[]> {
  const res = await fetch(`${API_BASE}/api/leave-types`, { 
    cache: 'no-store' 
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to fetch leave types');
  }
  return res.json();
}

// Leaves - List
export async function getLeaves(params?: { 
  user_id?: number; 
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Leave>> {
  const searchParams = new URLSearchParams();
  if (params?.user_id) searchParams.set('user_id', String(params.user_id));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  
  const res = await fetch(`${API_BASE}/api/leaves?${searchParams}`, { 
    cache: 'no-store' 
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to fetch leaves');
  }
  return res.json();
}

// Create Leave Request
export async function createLeave(data: {
  user_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days?: number;
  reason?: string;
  attachment?: string;
}): Promise<Leave> {
  const res = await fetch(`${API_BASE}/api/leaves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to create leave request');
  }
  return res.json();
}

// Update Leave Status (Approve/Reject)
export async function updateLeaveStatus(
  id: number, 
  status: 'approved' | 'rejected',
  approvedBy: number
): Promise<Leave> {
  const res = await fetch(`${API_BASE}/api/leaves/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, approved_by: approvedBy }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to update leave status');
  }
  return res.json();
}
