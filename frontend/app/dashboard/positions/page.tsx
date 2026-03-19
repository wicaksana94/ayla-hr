'use client';

import { useState, useEffect, Suspense } from 'react';
import { useI18n } from '@/lib/i18n';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';

interface Position { id: number; name: string; department_id: number | null; level: string | null; access_level: string | null; }
interface Department { id: number; name: string; }

const POSITION_LEVELS = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'senior_manager', label: 'Senior Manager' },
];

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

function PositionsContent() {
  const { language } = useI18n();
  const searchParams = useSearchParams();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [newPosition, setNewPosition] = useState({ name: '', department_id: '', level: '' });
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { positions: { title: 'Positions', subtitle: 'Manage positions', addPosition: 'Add Position', search: 'Search...', name: 'Name', department: 'Department', level: 'Level', actions: 'Actions', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirmDelete: 'Are you sure you want to delete', confirmDeleteDesc: 'This action cannot be undone.', noResults: 'No positions found', loading: 'Loading...', saving: 'Saving...', selectDept: 'Select Department', selectLevel: 'Select Level', nameRequired: 'Name is required' }},
      id: { positions: { title: 'Posisi', subtitle: 'Kelola posisi', addPosition: 'Tambah Posisi', search: 'Cari...', name: 'Nama', department: 'Departemen', level: 'Level', actions: 'Aksi', delete: 'Hapus', save: 'Simpan', cancel: 'Batal', confirmDelete: 'Apakah Anda yakin ingin menghapus', confirmDeleteDesc: 'Tindakan ini tidak dapat dibatalkan.', noResults: 'Tidak ada', loading: 'Memuat...', saving: 'Menyimpan...', selectDept: 'Pilih Departemen', selectLevel: 'Pilih Level', nameRequired: 'Nama wajib diisi' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [posRes, deptRes] = await Promise.all([
        fetch(`${apiUrl}/api/positions`),
        fetch(`${apiUrl}/api/departments`),
      ]);
      if (!posRes.ok) throw new Error('Failed to fetch positions');
      if (!deptRes.ok) throw new Error('Failed to fetch departments');
      const posData = await posRes.json();
      const deptData = await deptRes.json();
      setPositions(posData.data || posData);
      setDepartments(deptData);
    } catch (err: any) { console.error('Error:', err); setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const deptId = searchParams.get('dept');
    if (deptId && departments.length > 0) {
      setNewPosition(prev => ({ ...prev, department_id: deptId }));
      setIsAddDialogOpen(true);
    }
  }, [searchParams, departments]);

  const getDeptName = (deptId: number | null) => {
    if (!deptId) return '-';
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || '-';
  };

  const handleAdd = async () => {
    setError(null);
    if (!newPosition.name.trim()) { setError(t('positions.nameRequired')); return; }
    setIsSaving(true);
    try {
      // Map level string to number: staff=1, manager=2, senior_manager=3
      const levelMap: Record<string, number> = { 'staff': 1, 'manager': 2, 'senior_manager': 3 };
      const level = newPosition.level ? levelMap[newPosition.level] : null;
      
      const res = await fetch(`${apiUrl}/api/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newPosition.name, 
          department_id: newPosition.department_id ? parseInt(newPosition.department_id) : null,
          level: level
        }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error: ${res.status}`); }
      await fetchData(); 
      setIsAddDialogOpen(false); 
      setNewPosition({ name: '', department_id: '', level: '' });
    } catch (err: any) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/positions/${deletingPosition.id}`, { method: 'DELETE' });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error: ${res.status}`); }
      await fetchData();
      setDeletingPosition(null);
    } catch (err: any) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  const handleEdit = async () => {
    if (!editingPosition) return;
    setError(null);
    setIsSaving(true);
    try {
      const levelMap: Record<string, number> = { 'staff': 1, 'manager': 2, 'senior_manager': 3 };
      const level = editingPosition.level ? (typeof editingPosition.level === 'string' ? levelMap[editingPosition.level] || parseInt(editingPosition.level) : editingPosition.level) : null;
      
      const res = await fetch(`${apiUrl}/api/positions/${editingPosition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingPosition.name, 
          department_id: editingPosition.department_id,
          level: level
        }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error: ${res.status}`); }
      await fetchData();
      setEditingPosition(null);
    } catch (err: any) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /><span className="ml-2">{t('positions.loading')}</span></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t('positions.title')}</h1><p className="text-muted-foreground">{t('positions.subtitle')}</p></div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('positions.addPosition')}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('positions.addPosition')}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
              <div className="space-y-2"><label>{t('positions.name')}</label><Input value={newPosition.name} onChange={(e) => setNewPosition({...newPosition, name: e.target.value})} placeholder="Software Engineer" /></div>
              <div className="space-y-2"><label>{t('positions.department')}</label>
                <Select value={newPosition.department_id} onValueChange={(val) => setNewPosition({...newPosition, department_id: val})}>
                  <SelectTrigger><SelectValue placeholder={t('positions.selectDept')} /></SelectTrigger>
                  <SelectContent>{departments.map(dept => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><label>{t('positions.level')}</label>
                <Select value={newPosition.level} onValueChange={(val) => setNewPosition({...newPosition, level: val})}>
                  <SelectTrigger><SelectValue placeholder={t('positions.selectLevel')} /></SelectTrigger>
                  <SelectContent>
                    {POSITION_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setError(null); }}>{t('positions.cancel')}</Button>
              <Button onClick={handleAdd} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('positions.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && !isAddDialogOpen && !deletingPosition && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('positions.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>

      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>{t('positions.name')}</TableHead><TableHead>{t('positions.department')}</TableHead><TableHead>{t('positions.level')}</TableHead><TableHead className="text-right">{t('positions.actions')}</TableHead></TableRow></TableHeader>
          <TableBody>
            {positions.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
              positions.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((pos) => {
                const levelMap: Record<string, string> = { '1': 'Staff', '2': 'Manager', '3': 'Senior Manager' };
                return (
                  <TableRow key={pos.id}><TableCell className="font-medium">{pos.name}</TableCell><TableCell>{getDeptName(pos.department_id)}</TableCell><TableCell>{pos.level ? levelMap[String(pos.level)] || pos.level : '-'}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => setEditingPosition(pos)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeletingPosition(pos)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
                );
              })
            ) : (<TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('positions.noResults')}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Edit Position Dialog */}
      <Dialog open={!!editingPosition} onOpenChange={() => { setEditingPosition(null); setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('positions.edit') || 'Edit Position'}: {editingPosition?.name}</DialogTitle>
          </DialogHeader>
          {editingPosition && (
            <div className="space-y-4 py-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
              <div className="space-y-2">
                <label>{t('positions.name')}</label>
                <Input 
                  value={editingPosition.name} 
                  onChange={(e) => setEditingPosition({...editingPosition, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label>{t('positions.department')}</label>
                <Select 
                  value={editingPosition.department_id?.toString() || ''} 
                  onValueChange={(val) => setEditingPosition({...editingPosition, department_id: val ? parseInt(val) : null})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('positions.level')}</label>
                <Select 
                  value={editingPosition.level?.toString() || ''} 
                  onValueChange={(val) => setEditingPosition({...editingPosition, level: val as any})}
                >
                  <SelectTrigger><SelectValue placeholder={t('positions.selectLevel')} /></SelectTrigger>
                  <SelectContent>
                    {POSITION_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingPosition(null); setError(null); }}>{t('positions.cancel')}</Button>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('positions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPosition} onOpenChange={() => { setDeletingPosition(null); setError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('positions.confirmDelete')} "{deletingPosition?.name}"?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-2">{t('positions.confirmDeleteDesc')}</p>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => { setDeletingPosition(null); setError(null); }}>{t('positions.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('positions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PositionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PositionsContent />
    </Suspense>
  );
}
