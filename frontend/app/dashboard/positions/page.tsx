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
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';

interface Position { id: number; name: string; departements: string | null; }
interface Department { id: number; name: string; }

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
  const [newPosition, setNewPosition] = useState({ name: '', department_id: '' });

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { positions: { title: 'Positions', subtitle: 'Manage positions', addPosition: 'Add Position', search: 'Search...', name: 'Name', department: 'Department', actions: 'Actions', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirmDelete: 'Are you sure?', noResults: 'No positions found', loading: 'Loading...', saving: 'Saving...', selectDept: 'Select Department' }},
      id: { positions: { title: 'Posisi', subtitle: 'Kelola posisi', addPosition: 'Tambah Posisi', search: 'Cari...', name: 'Nama', department: 'Departemen', actions: 'Aksi', delete: 'Hapus', save: 'Simpan', cancel: 'Batal', confirmDelete: 'Yakin?', noResults: 'Tidak ada', loading: 'Memuat...', saving: 'Menyimpan...', selectDept: 'Pilih Departemen' }}
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [posRes, deptRes] = await Promise.all([
        fetch(`${apiUrl}/api/positions`),
        fetch(`${apiUrl}/api/departments`),
      ]);
      setPositions(await posRes.json());
      setDepartments(await deptRes.json());
    } catch (error) { console.error('Error:', error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-open dialog if dept param in URL
  useEffect(() => {
    const deptId = searchParams.get('dept');
    if (deptId && departments.length > 0) {
      setNewPosition(prev => ({ ...prev, department_id: deptId }));
      setIsAddDialogOpen(true);
    }
  }, [searchParams, departments]);

  const getDeptName = (deptId: string | null) => {
    if (!deptId) return '-';
    const dept = departments.find(d => d.id.toString() === deptId);
    return dept?.name || '-';
  };

  const handleAdd = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPosition.name, departements: newPosition.department_id }),
      });
      if (res.ok) { await fetchData(); setIsAddDialogOpen(false); setNewPosition({ name: '', department_id: '' }); }
    } catch (error) { console.error('Error:', error); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('positions.confirmDelete'))) return;
    try {
      const res = await fetch(`${apiUrl}/api/positions/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (error) { console.error('Error:', error); }
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
              <div className="space-y-2"><label>{t('positions.name')}</label><Input value={newPosition.name} onChange={(e) => setNewPosition({...newPosition, name: e.target.value})} placeholder="Software Engineer" /></div>
              <div className="space-y-2"><label>{t('positions.department')}</label>
                <Select value={newPosition.department_id} onValueChange={(val) => setNewPosition({...newPosition, department_id: val})}>
                  <SelectTrigger><SelectValue placeholder={t('positions.selectDept')} /></SelectTrigger>
                  <SelectContent>{departments.map(dept => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('positions.cancel')}</Button>
              <Button onClick={handleAdd} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('positions.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('positions.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>

      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>{t('positions.name')}</TableHead><TableHead>{t('positions.department')}</TableHead><TableHead className="text-right">{t('positions.actions')}</TableHead></TableRow></TableHeader>
          <TableBody>
            {positions.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
              positions.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((pos) => (
                <TableRow key={pos.id}><TableCell className="font-medium">{pos.name}</TableCell><TableCell>{getDeptName(pos.departements)}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete(pos.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
              ))
            ) : (<TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{t('positions.noResults')}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent></Card>
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
