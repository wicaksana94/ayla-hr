'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  code: string | null;
}

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export default function DepartmentsPage() {
  const { language } = useI18n();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', code: '' });

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { departments: { title: 'Departments', subtitle: 'Manage departments', addDepartment: 'Add Department', search: 'Search departments...', name: 'Name', code: 'Code', actions: 'Actions', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirmDelete: 'Are you sure?', noResults: 'No departments found', loading: 'Loading...' }},
      id: { departments: { title: 'Departemen', subtitle: 'Kelola departemen', addDepartment: 'Tambah Departemen', search: 'Cari departemen...', name: 'Nama', code: 'Kode', actions: 'Aksi', edit: 'Edit', delete: 'Hapus', save: 'Simpan', cancel: 'Batal', confirmDelete: 'Apakah Anda yakin?', noResults: 'Departemen tidak ditemukan', loading: 'Memuat...' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/departments`);
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.code && dept.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddDepartment = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDepartment),
      });
      if (res.ok) {
        await fetchDepartments();
        setIsAddDialogOpen(false);
        setNewDepartment({ name: '', code: '' });
      }
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment) return;
    try {
      const res = await fetch(`${apiUrl}/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingDepartment.name, code: editingDepartment.code }),
      });
      if (res.ok) {
        await fetchDepartments();
        setEditingDepartment(null);
      }
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm(t('departments.confirmDelete'))) return;
    try {
      const res = await fetch(`${apiUrl}/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('departments.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('departments.title')}</h1>
          <p className="text-muted-foreground">{t('departments.subtitle')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t('departments.addDepartment')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('departments.addDepartment')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>{t('departments.name')}</label>
                <Input value={newDepartment.name} onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})} placeholder="Human Resources" />
              </div>
              <div className="space-y-2">
                <label>{t('departments.code')}</label>
                <Input value={newDepartment.code} onChange={(e) => setNewDepartment({...newDepartment, code: e.target.value})} placeholder="HR" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('departments.cancel')}</Button>
              <Button onClick={handleAddDepartment}>{t('departments.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('departments.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('departments.name')}</TableHead>
                <TableHead>{t('departments.code')}</TableHead>
                <TableHead className="text-right">{t('departments.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.code || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingDepartment(dept)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(dept.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{t('departments.noResults')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('departments.edit')} {editingDepartment?.name}</DialogTitle>
          </DialogHeader>
          {editingDepartment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>{t('departments.name')}</label>
                <Input value={editingDepartment.name} onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label>{t('departments.code')}</label>
                <Input value={editingDepartment.code || ''} onChange={(e) => setEditingDepartment({...editingDepartment, code: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDepartment(null)}>{t('departments.cancel')}</Button>
            <Button onClick={handleEditDepartment}>{t('departments.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
