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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';

interface Position {
  id: number;
  name: string;
  departements: string | null;
  level: number | null;
  access_level: string | null;
}

interface Department {
  id: number;
  name: string;
}

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export default function PositionsPage() {
  const { language } = useI18n();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPosition, setNewPosition] = useState({
    name: '',
    department_id: '',
    level: '1',
    access_level: 'own_only',
  });

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: { positions: { title: 'Positions', subtitle: 'Manage positions', addPosition: 'Add Position', search: 'Search positions...', name: 'Name', department: 'Department', level: 'Level', accessLevel: 'Access Level', actions: 'Actions', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirmDelete: 'Are you sure?', noResults: 'No positions found', loading: 'Loading...', selectDepartment: 'Select Department', full: 'Full Access', manageTeam: 'Manage Team', ownOnly: 'Own Only' }},
      id: { positions: { title: 'Posisi', subtitle: 'Kelola posisi', addPosition: 'Tambah Posisi', search: 'Cari posisi...', name: 'Nama', department: 'Departemen', level: 'Level', accessLevel: 'Akses', actions: 'Aksi', delete: 'Hapus', save: 'Simpan', cancel: 'Batal', confirmDelete: 'Apakah Anda yakin?', noResults: 'Posisi tidak ditemukan', loading: 'Memuat...', selectDepartment: 'Pilih Departemen', full: 'Akses Penuh', manageTeam: 'Kelola Tim', ownOnly: 'Hanya Sendiri' }}
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
      
      const posData = await posRes.json();
      const deptData = await deptRes.json();
      
      setPositions(posData);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return '-';
    const dept = departments.find(d => d.id.toString() === deptId);
    return dept?.name || '-';
  };

  const filteredPositions = positions.filter(pos => 
    pos.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPosition = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPosition.name,
          department_id: parseInt(newPosition.department_id),
          level: parseInt(newPosition.level),
          access_level: newPosition.access_level,
        }),
      });
      
      if (res.ok) {
        await fetchData();
        setIsAddDialogOpen(false);
        setNewPosition({ name: '', department_id: '', level: '1', access_level: 'own_only' });
      }
    } catch (error) {
      console.error('Error creating position:', error);
    }
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm(t('positions.confirmDelete'))) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/positions/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting position:', error);
    }
  };

  const getAccessLevelLabel = (level: string | null) => {
    if (!level) return '-';
    const labels: Record<string, string> = {
      'full': t('positions.full'),
      'manage_team': t('positions.manageTeam'),
      'own_only': t('positions.ownOnly'),
    };
    return labels[level] || level;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('positions.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('positions.title')}</h1>
          <p className="text-muted-foreground">{t('positions.subtitle')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('positions.addPosition')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('positions.addPosition')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>{t('positions.name')}</label>
                <Input 
                  value={newPosition.name} 
                  onChange={(e) => setNewPosition({...newPosition, name: e.target.value})}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <label>{t('positions.department')}</label>
                <Select value={newPosition.department_id} onValueChange={(val) => setNewPosition({...newPosition, department_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('positions.selectDepartment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('positions.level')}</label>
                <Select value={newPosition.level} onValueChange={(val) => setNewPosition({...newPosition, level: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>{t('positions.accessLevel')}</label>
                <Select value={newPosition.access_level} onValueChange={(val) => setNewPosition({...newPosition, access_level: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">{t('positions.full')}</SelectItem>
                    <SelectItem value="manage_team">{t('positions.manageTeam')}</SelectItem>
                    <SelectItem value="own_only">{t('positions.ownOnly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('positions.cancel')}</Button>
              <Button onClick={handleAddPosition} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('positions.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('positions.search')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('positions.name')}</TableHead>
                <TableHead>{t('positions.department')}</TableHead>
                <TableHead>{t('positions.level')}</TableHead>
                <TableHead>{t('positions.accessLevel')}</TableHead>
                <TableHead className="text-right">{t('positions.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.length > 0 ? (
                filteredPositions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-medium">{pos.name}</TableCell>
                    <TableCell>{getDepartmentName(pos.departements)}</TableCell>
                    <TableCell>{pos.level || '-'}</TableCell>
                    <TableCell>{getAccessLevelLabel(pos.access_level)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePosition(pos.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t('positions.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
