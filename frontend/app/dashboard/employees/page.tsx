'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel 
} from "@/components/ui/select";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';

interface Employee {
  id: number;
  clerk_id: string;
  email: string;
  name: string;
  role: string;
  department_id: number | null;
  position_id: number | null;
  manager_id: number | null;
  language: string;
  is_active: boolean;
}

interface Department {
  id: number;
  name: string;
  code: string | null;
}

interface Position {
  id: number;
  name: string;
  department_id: number | null;
}

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export default function EmployeesPage() {
  const { language } = useI18n();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    clerk_id: '',
    name: '',
    email: '',
    department_id: '',
    position_id: '',
    manager_id: '',
  });
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { 
        employees: { 
          title: 'Employees', subtitle: 'Manage employee data', addEmployee: 'Add Employee', search: 'Search employees...', 
          name: 'Name', email: 'Email', department: 'Department', position: 'Position', manager: 'Manager', status: 'Status', joinDate: 'Join Date', 
          actions: 'Actions', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirmDelete: 'Are you sure you want to delete', confirmDeleteDesc: 'This action cannot be undone.',
          noResults: 'No employees found', selectDepartment: 'Select Department', selectPosition: 'Select Position', selectManager: 'Select Manager', selectDepartmentFirst: 'Select Department First', clerkId: 'Clerk ID', loading: 'Loading...', noPositionAvailable: 'No positions available', addPosition: 'Add Position', noManager: 'No Manager'
        }
      },
      id: { 
        employees: { 
          title: 'Karyawan', subtitle: 'Kelola data karyawan', addEmployee: 'Tambah Karyawan', search: 'Cari karyawan...', 
          name: 'Nama', email: 'Email', department: 'Departemen', position: 'Posisi', manager: 'Manajer', status: 'Status', joinDate: 'Tanggal Masuk', 
          actions: 'Aksi', edit: 'Edit', delete: 'Hapus', save: 'Simpan', cancel: 'Batal', confirmDelete: 'Apakah Anda yakin ingin menghapus', confirmDeleteDesc: 'Tindakan ini tidak dapat dibatalkan.',
          noResults: 'Karyawan tidak ditemukan', selectDepartment: 'Pilih Departemen', selectPosition: 'Pilih Posisi', selectManager: 'Pilih Manajer', selectDepartmentFirst: 'Pilih Departemen Dulu', clerkId: 'Clerk ID', loading: 'Memuat...', noPositionAvailable: 'Tidak ada posisi', addPosition: 'Tambah Posisi', noManager: 'Tidak Ada Manajer'
        }
      }
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [empRes, deptRes, posRes] = await Promise.all([
        fetch(`${apiUrl}/api/employees`),
        fetch(`${apiUrl}/api/departments`),
        fetch(`${apiUrl}/api/positions`),
      ]);
      
      if (!empRes.ok) throw new Error('Failed to fetch employees');
      if (!deptRes.ok) throw new Error('Failed to fetch departments');
      if (!posRes.ok) throw new Error('Failed to fetch positions');
      
      const empData = await empRes.json();
      const deptData = await deptRes.json();
      const posData = await posRes.json();
      
      // Handle paginated or direct array response
      setEmployees(empData.data || empData || []);
      setDepartments(deptData || []);
      setPositions(posData.data || posData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDepartmentName = (deptId: number | null) => {
    if (!deptId) return '-';
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || '-';
  };

  const getPositionName = (posId: number | null) => {
    if (!posId) return '-';
    const pos = positions.find(p => p.id === posId);
    return pos?.name || '-';
  };

  const getManagerName = (mgrId: number | null) => {
    if (!mgrId) return '-';
    const mgr = employees.find(e => e.id === mgrId);
    return mgr?.name || '-';
  };

  const filteredEmployees = (employees || []).filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPositions = newEmployee.department_id 
    ? (positions || []).filter(p => p.department_id?.toString() === newEmployee.department_id)
    : [];

  const handleAddEmployee = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: newEmployee.clerk_id,
          name: newEmployee.name,
          email: newEmployee.email,
          department_id: newEmployee.department_id ? parseInt(newEmployee.department_id) : null,
          position_id: newEmployee.position_id ? parseInt(newEmployee.position_id) : null,
          manager_id: newEmployee.manager_id ? parseInt(newEmployee.manager_id) : null,
        }),
      });
      
      if (res.ok) {
        await fetchData();
        setIsAddDialogOpen(false);
        setNewEmployee({ clerk_id: '', name: '', email: '', department_id: '', position_id: '', manager_id: '' });
      }
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditEmployee = async () => {
    setIsSaving(true);
    if (!editingEmployee) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingEmployee.name,
          email: editingEmployee.email,
          department_id: editingEmployee.department_id,
          position_id: editingEmployee.position_id,
          manager_id: editingEmployee.manager_id,
          is_active: editingEmployee.is_active,
        }),
      });
      
      if (res.ok) {
        await fetchData();
        setEditingEmployee(null);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/employees/${deletingEmployee.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error: ${res.status}`); }
      await fetchData();
      setDeletingEmployee(null);
    } catch (err: any) { console.error('Error deleting employee:', err); setError(err.message); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('employees.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('employees.title')}</h1>
          <p className="text-muted-foreground">{t('employees.subtitle')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('employees.addEmployee')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('employees.addEmployee')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>{t('employees.name')}</label>
                <Input 
                  value={newEmployee.name} 
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label>{t('employees.email')}</label>
                <Input 
                  type="email"
                  value={newEmployee.email} 
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="john@aylahr.com"
                />
              </div>
              <div className="space-y-2">
                <label>{t('employees.department')}</label>
                <Select value={newEmployee.department_id || ''} onValueChange={(val) => setNewEmployee({...newEmployee, department_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('employees.selectDepartment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(departments || []).map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('employees.position')}</label>
                <Select value={newEmployee.position_id || ''} onValueChange={(val) => setNewEmployee({...newEmployee, position_id: val})} disabled={!newEmployee.department_id}>
                  <SelectTrigger>
                    <SelectValue placeholder={!newEmployee.department_id ? t('employees.selectDepartmentFirst') : t('employees.selectPosition')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(filteredPositions || []).length > 0 ? (
                      filteredPositions.map(pos => (
                        <SelectItem key={pos.id} value={pos.id.toString()}>{pos.name}</SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center">
                        <p className="text-sm text-muted-foreground mb-2">{t('employees.noPositionAvailable')}</p>
                        <Button variant="outline" size="sm" onClick={() => {
                          setIsAddDialogOpen(false);
                          window.location.href = `/dashboard/positions?dept=${newEmployee.department_id}`;
                        }}>
                          <Plus className="w-4 h-4 mr-1" /> {t('employees.addPosition')}
                        </Button>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('employees.manager')}</label>
                <Select 
                  value={newEmployee.manager_id || ''} 
                  onValueChange={(val) => setNewEmployee({...newEmployee, manager_id: val === 'none' ? '' : val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('employees.selectManager')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('employees.noManager') || 'Tanpa Manager'}</SelectItem>
                    {newEmployee.department_id && newEmployee.department_id !== '' && (() => {
                      const deptId = parseInt(newEmployee.department_id);
                      const deptEmployees = (employees || []).filter(e => e.department_id === deptId);
                      return (
                        <>
                          <SelectLabel>
                            {departments.find(d => d.id === deptId)?.name || 'Managers'}
                          </SelectLabel>
                          {deptEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.name} - {positions.find(p => p.id === emp.position_id)?.name || ''}
                            </SelectItem>
                          ))}
                          {deptEmployees.length === 0 && (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              {language === 'id' ? 'Belum ada karyawan di departemen ini' : 'No employees in this department'}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {!newEmployee.department_id && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        {language === 'id' ? 'Pilih departemen terlebih dahulu' : 'Select department first'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('employees.cancel')}</Button>
              <Button onClick={handleAddEmployee} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('employees.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('employees.search')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employees.name')}</TableHead>
                <TableHead>{t('employees.email')}</TableHead>
                <TableHead>{t('employees.department')}</TableHead>
                <TableHead>{t('employees.position')}</TableHead>
                <TableHead>{t('employees.manager')}</TableHead>
                <TableHead>{t('employees.status')}</TableHead>
                <TableHead className="text-right">{t('employees.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{getDepartmentName(employee.department_id)}</TableCell>
                    <TableCell>{getPositionName(employee.position_id)}</TableCell>
                    <TableCell>{getManagerName(employee.manager_id)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        employee.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {employee.is_active ? 'active' : 'inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingEmployee(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeletingEmployee(employee)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t('employees.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('employees.edit')} {editingEmployee?.name}</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>{t('employees.name')}</label>
                <Input 
                  value={editingEmployee.name} 
                  onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label>{t('employees.email')}</label>
                <Input 
                  value={editingEmployee.email} 
                  onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label>{t('employees.department')}</label>
                <Select 
                  value={editingEmployee.department_id?.toString() || ''} 
                  onValueChange={(val) => setEditingEmployee({...editingEmployee, department_id: parseInt(val)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('employees.position')}</label>
                <Select 
                  value={editingEmployee.position_id?.toString() || ''} 
                  onValueChange={(val) => setEditingEmployee({...editingEmployee, position_id: parseInt(val)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(pos => (
                      <SelectItem key={pos.id} value={pos.id.toString()}>{pos.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('employees.manager')}</label>
                <Select 
                  value={editingEmployee.manager_id?.toString() || ''} 
                  onValueChange={(val) => setEditingEmployee({...editingEmployee, manager_id: val ? parseInt(val) : null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('employees.selectManager')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(e => e.id !== editingEmployee.id)
                      .map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmployee(null)}>{t('employees.cancel')}</Button>
            <Button onClick={handleEditEmployee} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('employees.save')}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('employees.confirmDelete')} "{deletingEmployee?.name}"?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-2">{t('employees.confirmDeleteDesc')}</p>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setDeletingEmployee(null)}>{t('employees.cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteEmployee} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('employees.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
