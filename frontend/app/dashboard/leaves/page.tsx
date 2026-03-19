'use client';

import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  User,
  FileText,
  Paperclip
} from "lucide-react";
import { getLeaves, updateLeaveStatus, Leave, LeaveType, getEmployees } from '@/lib/api/leaves';
import { getLeaveTypes } from '@/lib/api/leaves';
import { useToast } from '@/components/ui/toast';

// Helper to get proper attachment URL
const getAttachmentUrl = (attachment: string | null): string | null => {
  if (!attachment) return null;
  if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
    return attachment;
  }
  return attachment;
};

const hasAttachment = (attachment: string | null): boolean => {
  return !!attachment;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, Record<string, string>> = {
  en: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
  id: { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' },
};

export default function LeavesPage() {
  const { language } = useI18n();
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<{id: number; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: {
        leaves: { title: 'Leave Requests', subtitle: 'Manage employee leave requests', all: 'All' }
      },
      id: {
        leaves: { title: 'Permintaan Cuti', subtitle: 'Kelola permintaan cuti karyawan', all: 'Semua' }
      },
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search) params.search = search;
      
      const data = await getLeaves(params);
      setLeaves(data.data);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const data = await getLeaveTypes();
      setLeaveTypes(data);
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data.map(e => ({ id: e.id, name: e.name })));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus, page, search]);

  const handleStatusUpdate = async (id: number, newStatus: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const approvedBy = 1;
      await updateLeaveStatus(id, newStatus, approvedBy);
      await fetchLeaves();
      showToast(newStatus === 'approved' ? 'Leave approved successfully!' : 'Leave rejected', newStatus === 'approved' ? 'success' : 'error');
    } catch (error) {
      console.error('Failed to update leave status:', error);
      showToast('Failed to update leave status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getLeaveTypeName = (code: string) => {
    const type = leaveTypes.find(t => t.code === code);
    return type?.name || code;
  };

  const getEmployeeName = (userId: number | null) => {
    if (!userId) return '-';
    const emp = employees.find(e => e.id === userId);
    return emp?.name || `User #${userId}`;
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setPage(1); // Reset to first page on filter
  };

  const columns: Column<Leave>[] = [
    { key: 'user_id', header: 'Employee', render: (item) => getEmployeeName(item.user_id) },
    { key: 'leave_type', header: 'Type', render: (item) => getLeaveTypeName(item.leave_type) },
    { key: 'dates', header: 'Dates', render: (item) => `${item.start_date} - ${item.end_date}` },
    { key: 'total_days', header: 'Days' },
    { key: 'reason', header: 'Reason', render: (item) => item.reason || '-' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item) => (
        <Badge className={statusColors[item.status]}>
          {statusLabels[language]?.[item.status] || item.status}
        </Badge>
      )
    },
  ];

  const filterOptions = [
    { value: 'all', label: t('leaves.all') || 'All' },
    { value: 'pending', label: statusLabels[language]?.pending || 'Pending' },
    { value: 'approved', label: statusLabels[language]?.approved || 'Approved' },
    { value: 'rejected', label: statusLabels[language]?.rejected || 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('leaves.title')}</h1>
        <p className="text-muted-foreground">{t('leaves.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={leaves}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={10}
            searchPlaceholder="Search by reason or type..."
            filterOptions={filterOptions}
            filterValue={filterStatus}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onRowClick={(item) => setSelectedLeave(item)}
            renderActions={(item) => (
              item.status === 'pending' && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleStatusUpdate(item.id, 'approved')}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(item.id, 'rejected')}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            )}
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Detailed information for leave request #{selectedLeave?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{getEmployeeName(selectedLeave.user_id)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Leave Period</p>
                  <p className="font-medium">
                    {selectedLeave.start_date} to {selectedLeave.end_date}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ({selectedLeave.total_days} day{selectedLeave.total_days > 1 ? 's' : ''})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <p className="font-medium">{getLeaveTypeName(selectedLeave.leave_type)}</p>
                </div>
              </div>

              {selectedLeave.reason && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-medium">{selectedLeave.reason}</p>
                  </div>
                </div>
              )}

              {hasAttachment(selectedLeave.attachment) && (
                <div className="flex items-center gap-3">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attachment</p>
                    <a 
                      href={getAttachmentUrl(selectedLeave.attachment) || '#'}
                      download
                      className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                    >
                      📎 Download Attachment
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedLeave.status]}>
                    {statusLabels[language]?.[selectedLeave.status] || selectedLeave.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
