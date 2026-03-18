'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  Filter,
  Calendar,
  User,
  FileText,
  Paperclip
} from "lucide-react";
import { getLeaves, updateLeaveStatus, Leave, LeaveType } from '@/lib/api/leaves';
import { getLeaveTypes } from '@/lib/api/leaves';
import { useToast } from '@/components/ui/toast';

// Helper to get proper attachment URL (handles both old filename and new UploadThing URL)
const getAttachmentUrl = (attachment: string | null): string | null => {
  if (!attachment) return null;
  
  // If it's already a full URL, return as-is
  if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
    return attachment;
  }
  
  // For old filenames, return as-is (might not work but at least shows link)
  return attachment;
};

// Helper to check if attachment is available (full URL from UploadThing)
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
  es: { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado' },
  zh: { pending: '待处理', approved: '已批准', rejected: '已拒绝' },
};

export default function LeavesPage() {
  const { language } = useI18n();
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const t = (key: string): string => {
    const trans: Record<string, Record<string, Record<string, string>>> = {
      en: {
        leaves: {
          title: 'Leave Requests',
          subtitle: 'Manage employee leave requests',
          filter: 'Filter by status',
          all: 'All',
          noRequests: 'No leave requests found',
          approve: 'Approve',
          reject: 'Reject',
          processing: 'Processing...'
        }
      },
      id: {
        leaves: {
          title: 'Permintaan Cuti',
          subtitle: 'Kelola permintaan cuti karyawan',
          filter: 'Filter berdasarkan status',
          all: 'Semua',
          noRequests: 'Tidak ada permintaan cuti',
          approve: 'Setuju',
          reject: 'Tolak',
          processing: 'Memproses...'
        }
      },
      es: {
        leaves: {
          title: 'Solicitudes de Permiso',
          subtitle: 'Gestionar solicitudes de permiso de empleados',
          filter: 'Filtrar por estado',
          all: 'Todos',
          noRequests: 'No se encontraron solicitudes de permiso',
          approve: 'Aprobar',
          reject: 'Rechazar',
          processing: 'Procesando...'
        }
      },
      zh: {
        leaves: {
          title: '请假申请',
          subtitle: '管理员工请假申请',
          filter: '按状态筛选',
          all: '全部',
          noRequests: '未找到请假申请',
          approve: '批准',
          reject: '拒绝',
          processing: '处理中...'
        }
      },
    };
    const [category, keyPart] = key.split('.');
    return trans[language]?.[category]?.[keyPart] || key;
  };

  const fetchLeaves = async () => {
    try {
      const params: any = { page: 1, limit: 100 };
      if (filterStatus !== 'all') params.status = filterStatus;
      const data = await getLeaves(params);
      setLeaves(data.data);
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
    fetchLeaves();
    fetchLeaveTypes();
  }, [filterStatus]);

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const approvedBy = 1;
      await updateLeaveStatus(id, status, approvedBy);
      await fetchLeaves();
      showToast(status === 'approved' ? 'Leave approved successfully!' : 'Leave rejected', status === 'approved' ? 'success' : 'error');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('leaves.title')}</h1>
        <p className="text-muted-foreground">{t('leaves.subtitle')}</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('leaves.filter')}:</span>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('leaves.all')}</SelectItem>
            <SelectItem value="pending">{statusLabels[language]?.pending || 'Pending'}</SelectItem>
            <SelectItem value="approved">{statusLabels[language]?.approved || 'Approved'}</SelectItem>
            <SelectItem value="rejected">{statusLabels[language]?.rejected || 'Rejected'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t('leaves.noRequests')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow
                    key={leave.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLeave(leave)}
                  >
                    <TableCell className="font-medium">User #{leave.user_id}</TableCell>
                    <TableCell>{getLeaveTypeName(leave.leave_type)}</TableCell>
                    <TableCell>
                      {leave.start_date} - {leave.end_date}
                    </TableCell>
                    <TableCell>{leave.total_days}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {leave.reason || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[leave.status]}>
                        {statusLabels[language]?.[leave.status] || leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleStatusUpdate(leave.id, 'approved')}
                            disabled={processingId === leave.id}
                          >
                            {processingId === leave.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t('leaves.approve')}
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                            disabled={processingId === leave.id}
                          >
                            {processingId === leave.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                {t('leaves.reject')}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
                  <p className="font-medium">User #{selectedLeave.user_id}</p>
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
                      target="_blank"
                      rel="noopener noreferrer"
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
