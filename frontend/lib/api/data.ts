const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ============ Employees ============

export interface Employee {
  id: number;
  clerk_id: string;
  email: string;
  name: string;
  role: string;
  department_id: number | null;
  position_id: number | null;
  language: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
}

export async function getEmployees(params?: {
  department_id?: number;
  position_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Employee>> {
  const searchParams = new URLSearchParams();
  if (params?.department_id) searchParams.set('department_id', String(params.department_id));
  if (params?.position_id) searchParams.set('position_id', String(params.position_id));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  
  const res = await fetch(`${API_BASE}/api/employees?${searchParams}`, { 
    cache: 'no-store' 
  });
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function getEmployee(id: number): Promise<Employee> {
  const res = await fetch(`${API_BASE}/api/employees/${id}`, { 
    cache: 'no-store' 
  });
  if (!res.ok) throw new Error('Failed to fetch employee');
  return res.json();
}

export async function createEmployee(data: {
  clerk_id: string;
  email: string;
  name: string;
  role?: string;
  department_id?: number;
  position_id?: number;
}): Promise<Employee> {
  const res = await fetch(`${API_BASE}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create employee');
  return res.json();
}

export async function updateEmployee(id: number, data: Partial<{
  name: string;
  email: string;
  role: string;
  department_id: number;
  position_id: number;
  is_active: boolean;
}>): Promise<Employee> {
  const res = await fetch(`${API_BASE}/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update employee');
  return res.json();
}

export async function deleteEmployee(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/employees/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete employee');
}

// ============ Departments ============

export interface Department {
  id: number;
  name: string;
  code: string | null;
}

export async function getDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE}/api/departments`, { 
    cache: 'no-store' 
  });
  if (!res.ok) throw new Error('Failed to fetch departments');
  return res.json();
}

export async function createDepartment(data: {
  name: string;
  code: string;
}): Promise<Department> {
  const res = await fetch(`${API_BASE}/api/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create department');
  return res.json();
}

export async function updateDepartment(id: number, data: {
  name?: string;
  code?: string;
}): Promise<Department> {
  const res = await fetch(`${API_BASE}/api/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update department');
  return res.json();
}

export async function deleteDepartment(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/departments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete department');
}

// ============ Positions ============

export interface Position {
  id: number;
  name: string;
  department_id: number | null;
  level: number | null;
  access_level: string | null;
}

export async function getPositions(params?: {
  department_id?: number;
  page?: number;
  limit?: number;
}): Promise<{ data: Position[]; page: number; limit: number }> {
  const searchParams = new URLSearchParams();
  if (params?.department_id) searchParams.set('department_id', String(params.department_id));
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  
  const res = await fetch(`${API_BASE}/api/positions?${searchParams}`, { 
    cache: 'no-store' 
  });
  if (!res.ok) throw new Error('Failed to fetch positions');
  return res.json();
}

export async function createPosition(data: {
  name: string;
  department_id?: number;
  level?: number;
  access_level?: string;
}): Promise<Position> {
  const res = await fetch(`${API_BASE}/api/positions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create position');
  return res.json();
}

export async function deletePosition(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/positions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete position');
}
