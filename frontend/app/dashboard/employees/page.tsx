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
  DialogDescription, 
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
  SelectValue 
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, MoreHorizontal } from 'lucide-react';

// Mock employee data
const mockEmployees = [
  { id: 1, name: 'John Doe', email: 'john.doe@aylahr.com', department: 'Engineering', position: 'Software Engineer', status: 'active', joinDate: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@aylahr.com', department: 'Human Resources', position: 'HR Manager', status: 'active', joinDate: '2023-06-01' },
  { id: 3, name: 'Michael Johnson', email: 'michael.j@aylahr.com', department: 'Marketing', position: 'Marketing Lead', status: 'active', joinDate: '2023-09-10' },
  { id: 4, name: 'Sarah Williams', email: 'sarah.w@aylahr.com', department: 'Sales', position: 'Sales Executive', status: 'active', joinDate: '2024-02-20' },
  { id: 5, name: 'David Brown', email: 'david.b@aylahr.com', department: 'Engineering', position: 'Senior Developer', status: 'inactive', joinDate: '2022-11-05' },
];

const departments = ['Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Operations'];
const positions = ['Software Engineer', 'Senior Developer', 'HR Manager', 'Marketing Lead', 'Sales Executive', 'Finance Manager', 'Operations Manager'];
const statuses = ['active', 'inactive'];

export default function EmployeesPage() {
  const { language } = useI18n();
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    status: 'active',
  });

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { 
        employees: { 
          title: 'Employees', subtitle: 'Manage employee data', addEmployee: 'Add Employee', search: 'Search employees...', 
          name: 'Name', email: 'Email', department: 'Department', position: 'Position', status: 'Status', joinDate: 'Join Date', 
          actions: 'Actions', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirmDelete: 'Are you sure you want to delete this employee?',
          noResults: 'No employees found', firstName: 'First Name', lastName: 'Last Name'
        }
      },
      id: { 
        employees: { 
          title: 'Karyawan', subtitle: 'Kelola data karyawan', addEmployee: 'Tambah Karyawan', search: 'Cari karyawan...', 
          name: 'Nama', email: 'Email', department: 'Departemen', position: 'Posisi', status: 'Status', joinDate: 'Tanggal Masuk', 
          actions: 'Aksi', edit: 'Edit', delete: 'Hapus', save: 'Simpan', cancel: 'Batal', confirmDelete: 'Apakah Anda yakin ingin menghapus karyawan ini?',
          noResults: 'Karyawan tidak ditemukan', firstName: 'Nama Depan', lastName: 'Nama Belakang'
        }
      },
      es: { 
        employees: { 
          title: 'Empleados', subtitle: 'Gestionar datos de empleados', addEmployee: 'Agregar Empleado', search: 'Buscar empleados...', 
          name: 'Nombre', email: 'Correo', department: 'Departamento', position: 'Posición', status: 'Estado', joinDate: 'Fecha de Ingreso', 
          actions: 'Acciones', edit: 'Editar', delete: 'Eliminar', save: 'Guardar', cancel: 'Cancelar', confirmDelete: '¿Está seguro de que desea eliminar este empleado?',
          noResults: 'No se encontraron empleados', firstName: 'Nombre', lastName: 'Apellido'
        }
      },
      zh: { 
        employees: { 
          title: '员工', subtitle: '管理员工数据', addEmployee: '添加员工', search: '搜索员工...', 
          name: '姓名', email: '邮箱', department: '部门', position: '职位', status: '状态', joinDate: '入职日期', 
          actions: '操作', edit: '编辑', delete: '删除', save: '保存', cancel: '取消', confirmDelete: '您确定要删除此员工吗？',
          noResults: '未找到员工', firstName: '名', lastName: '姓'
        }
      }
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = () => {
    const newId = Math.max(...employees.map(e => e.id)) + 1;
    const today = new Date().toISOString().split('T')[0];
    setEmployees([...employees, { ...newEmployee, id: newId, joinDate: today }]);
    setIsAddDialogOpen(false);
    setNewEmployee({ name: '', email: '', department: '', position: '', status: 'active' });
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
  };

  const handleSaveEdit = () => {
    setEmployees(employees.map(e => e.id === editingEmployee.id ? editingEmployee : e));
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm(t('employees.confirmDelete'))) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>{t('employees.firstName')}</label>
                  <Input 
                    value={newEmployee.name.split(' ')[0]} 
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label>{t('employees.lastName')}</label>
                  <Input 
                    value={newEmployee.name.split(' ').slice(1).join(' ')} 
                    onChange={(e) => setNewEmployee({...newEmployee, name: `${newEmployee.name.split(' ')[0]} ${e.target.value}`})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label>{t('employees.email')}</label>
                <Input 
                  type="email"
                  value={newEmployee.email} 
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="john.doe@aylahr.com"
                />
              </div>
              <div className="space-y-2">
                <label>{t('employees.department')}</label>
                <Select value={newEmployee.department} onValueChange={(val) => setNewEmployee({...newEmployee, department: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('employees.position')}</label>
                <Select value={newEmployee.position} onValueChange={(val) => setNewEmployee({...newEmployee, position: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(pos => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('employees.cancel')}</Button>
              <Button onClick={handleAddEmployee}>{t('employees.save')}</Button>
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employees.name')}</TableHead>
                <TableHead>{t('employees.email')}</TableHead>
                <TableHead>{t('employees.department')}</TableHead>
                <TableHead>{t('employees.position')}</TableHead>
                <TableHead>{t('employees.status')}</TableHead>
                <TableHead>{t('employees.joinDate')}</TableHead>
                <TableHead className="text-right">{t('employees.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {employee.status}
                      </span>
                    </TableCell>
                    <TableCell>{employee.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteEmployee(employee.id)}
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
                <Select value={editingEmployee.department} onValueChange={(val) => setEditingEmployee({...editingEmployee, department: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('employees.position')}</label>
                <Select value={editingEmployee.position} onValueChange={(val) => setEditingEmployee({...editingEmployee, position: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(pos => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('employees.status')}</label>
                <Select value={editingEmployee.status} onValueChange={(val) => setEditingEmployee({...editingEmployee, status: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmployee(null)}>{t('employees.cancel')}</Button>
            <Button onClick={handleSaveEdit}>{t('employees.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
