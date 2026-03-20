'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Loader2, AlertCircle, X } from 'lucide-react';

interface Department { id: number; name: string; code: string | null; }

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export default function DepartmentsPage() {
  const { language } = useI18n();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', code: '' });
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { departments: { title: 'Departments', subtitle: 'Manage departments', addDepartment: 'Add Department', search: 'Search...', name: 'Name', code: 'Code', actions: 'Actions', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirmDelete: 'Are you sure you want to delete', confirmDeleteDesc: 'This action cannot be undone.', noResults: 'No departments found', loading: 'Loading...', saving: 'Saving...', nameRequired: 'Name is required', codeRequired: 'Code is required' }},
      id: { departments: { title: 'Departemen', subtitle: 'Kelola departemen', addDepartment: 'Tambah Departemen', search: 'Cari...', name: 'Nama', code: 'Kode', actions: 'Aksi', edit: 'Edit', delete: 'Hapus', save: 'Simpan', cancel: 'Batal', confirmDelete: 'Apakah Anda yakin ingin menghapus', confirmDeleteDesc: 'Tindakan ini tidak dapat dibatalkan.', noResults: 'Tidak ada', loading: 'Memuat...', saving: 'Menyimpan...', nameRequired: 'Nama wajib diisi', codeRequired: 'Kode wajib diisi' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/departments`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);
    } catch (err: any) { 
      console.error('Error:', err);
      setError(err.message);
    }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleAdd = async () => {
    setError(null);
    if (!newDepartment.name.trim()) { setError(t('departments.nameRequired')); return; }
    if (!newDepartment.code.trim()) { setError(t('departments.codeRequired')); return; }
    if (newDepartment.code.trim().length > 3) { setError(language === 'id' ? 'Kode maksimal 3 karakter' : 'Code must be maximum 3 characters'); return; }

    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/departments`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(newDepartment) 
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error: ${res.status}`); }
      await fetchDepartments(); 
      setIsAddDialogOpen(false); 
      setNewDepartment({ name: '', code: '' });
    } catch (err: any) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  const handleEdit = async () => {
    if (!editingDepartment) return;
    setError(null);
    if (!editingDepartment.name.trim() || !editingDepartment.code?.trim()) { setError(t('departments.nameRequired')); return; }
    if (editingDepartment.code.trim().length > 3) { setError(language === 'id' ? 'Kode maksimal 3 karakter' : 'Code must be maximum 3 characters'); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/departments/${editingDepartment.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name: editingDepartment.name, code: editingDepartment.code }) 
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error: ${res.status}`); }
      await fetchDepartments(); 
      setEditingDepartment(null);
    } catch (err: any) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingDepartment) return;
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/departments/${deletingDepartment.id}`, { method: 'DELETE' });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error: ${res.status}`); }
      await fetchDepartments();
      setDeletingDepartment(null);
    } catch (err: any) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /><span className="ml-2">{t('departments.loading')}</span></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t('departments.title')}</h1><p className="text-muted-foreground">{t('departments.subtitle')}</p></div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('departments.addDepartment')}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('departments.addDepartment')}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
              <div className="space-y-2"><label>{t('departments.name')}</label><Input value={newDepartment.name} onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})} placeholder="Human Resources" /></div>
              <div className="space-y-2"><label>{t('departments.code')}</label><Input value={newDepartment.code} onChange={(e) => setNewDepartment({...newDepartment, code: e.target.value.toUpperCase()})} placeholder="HR" maxLength={3} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setError(null); }}>{t('departments.cancel')}</Button>
              <Button onClick={handleAdd} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('departments.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && !isAddDialogOpen && !editingDepartment && !deletingDepartment && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('departments.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>

      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>{t('departments.name')}</TableHead><TableHead>{t('departments.code')}</TableHead><TableHead className="text-right">{t('departments.actions')}</TableHead></TableRow></TableHeader>
          <TableBody>
            {departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase()))).length > 0 ? (
              departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase()))).map((dept) => (
                <TableRow key={dept.id}><TableCell className="font-medium">{dept.name}</TableCell><TableCell>{dept.code || '-'}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => setEditingDepartment(dept)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeletingDepartment(dept)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell></TableRow>
              ))
            ) : (<TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{t('departments.noResults')}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={() => { setEditingDepartment(null); setError(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('departments.edit')} {editingDepartment?.name}</DialogTitle></DialogHeader>
          {editingDepartment && <div className="space-y-4 py-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
            <div className="space-y-2"><label>{t('departments.name')}</label><Input value={editingDepartment.name} onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})} /></div>
            <div className="space-y-2"><label>{t('departments.code')}</label><Input value={editingDepartment.code || ''} onChange={(e) => setEditingDepartment({...editingDepartment, code: e.target.value.toUpperCase()})} maxLength={3} /></div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => { setEditingDepartment(null); setError(null); }}>{t('departments.cancel')}</Button><Button onClick={handleEdit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('departments.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDepartment} onOpenChange={() => { setDeletingDepartment(null); setError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('departments.confirmDelete')} "{deletingDepartment?.name}"?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-2">{t('departments.confirmDeleteDesc')}</p>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => { setDeletingDepartment(null); setError(null); }}>{t('departments.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('departments.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
