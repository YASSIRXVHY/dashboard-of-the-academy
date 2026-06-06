'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Download,
  Plus,
  Loader2,
  Filter,
  Layers,
  CreditCard,
  Clock,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  amount: number;
  month: string;
  status: string;
  paidAt: string | null;
}

interface GroupOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
  age: number;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <Badge variant="outline" className={cn('text-xs font-medium badge-soft', variants[status] || variants.pending)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function PaymentsPage() {
  const token = useAppStore((s) => s.token);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Filters
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialogs
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [bulkPaymentOpen, setBulkPaymentOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Form state
  const [paymentForm, setPaymentForm] = useState({
    groupId: '',
    studentId: '',
    amount: '',
    month: '',
    status: 'pending',
  });
  const [bulkForm, setBulkForm] = useState({
    groupId: '',
    month: '',
    status: 'pending',
  });
  const [newStatus, setNewStatus] = useState('paid');

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterGroup !== 'all') params.set('groupId', filterGroup);
      if (filterMonth) params.set('month', filterMonth);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiGet<Payment[]>(`/api/payments${query}`);
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filterGroup, filterMonth, filterStatus]);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await apiGet<GroupOption[]>('/api/groups');
      setGroups(data);
    } catch {
      setGroups([]);
    }
  }, []);

  const fetchStudents = useCallback(async (groupId: string) => {
    if (!groupId) {
      setStudents([]);
      return;
    }
    try {
      const data = await apiGet<StudentOption[]>(`/api/groups/${groupId}/students`);
      setStudents(data);
    } catch {
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Record payment
  const handleRecordPayment = async () => {
    if (!paymentForm.studentId || !paymentForm.groupId || !paymentForm.amount || !paymentForm.month) {
      toast.error('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    try {
      await apiPost('/api/payments', {
        studentId: paymentForm.studentId,
        groupId: paymentForm.groupId,
        amount: parseInt(paymentForm.amount),
        month: paymentForm.month,
        status: paymentForm.status,
      });
      toast.success('Payment recorded successfully');
      setRecordPaymentOpen(false);
      setPaymentForm({ groupId: '', studentId: '', amount: '', month: '', status: 'pending' });
      setStudents([]);
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setFormLoading(false);
    }
  };

  // Bulk create payments
  const handleBulkPayment = async () => {
    if (!bulkForm.groupId || !bulkForm.month) {
      toast.error('Please fill in all fields');
      return;
    }
    setFormLoading(true);
    try {
      const result = await apiPost<{ created: number; skipped: number }>('/api/payments/bulk', {
        groupId: bulkForm.groupId,
        month: bulkForm.month,
        status: bulkForm.status,
      });
      toast.success(`Created ${result.created} payments${result.skipped > 0 ? `, ${result.skipped} already existed` : ''}`);
      setBulkPaymentOpen(false);
      setBulkForm({ groupId: '', month: '', status: 'pending' });
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create bulk payments');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit payment status
  const openEditStatus = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewStatus(payment.status);
    setEditStatusOpen(true);
  };

  const handleEditStatus = async () => {
    if (!selectedPayment) return;
    setFormLoading(true);
    try {
      await apiPut(`/api/payments/${selectedPayment.id}`, { status: newStatus });
      toast.success('Payment status updated');
      setEditStatusOpen(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: string) => {
    try {
      await apiDelete(`/api/payments/${paymentId}`);
      toast.success('Payment deleted');
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete payment');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filterGroup !== 'all') params.set('groupId', filterGroup);
      if (filterMonth) params.set('month', filterMonth);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      params.set('type', 'payments');
      const query = params.toString() ? `?${params.toString()}` : '?type=payments';

      const response = await fetch(`/api/export${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch {
      toast.error('Failed to export payments');
    }
  };

  // Summary stats
  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

  return (
    <div className={cn('space-y-6', mounted && 'page-enter')}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground header-enter">Payments</h2>
          <div className="title-gradient-underline" />
          <p className="text-muted-foreground text-sm mt-2">Track and manage student payments.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="transition-all duration-200 active:scale-[0.98]">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkPaymentOpen(true)} className="transition-all duration-200 active:scale-[0.98]">
            <Layers className="h-4 w-4 mr-1" /> Bulk Create
          </Button>
          <Button size="sm" onClick={() => setRecordPaymentOpen(true)} className="btn-primary-glow">
            <Plus className="h-4 w-4 mr-1" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-bold text-emerald-700">DH {totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-amber-700">DH {totalPending.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-lg font-bold text-red-700">DH {totalOverdue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/40 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={filterGroup} onValueChange={(v) => { setFilterGroup(v); setLoading(true); }}>
              <SelectTrigger><SelectValue placeholder="All Groups" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); setLoading(true); }}
              placeholder="Filter by month"
            />
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setLoading(true); }}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments table */}
      {loading ? (
        <Card className="border-border/40 rounded-xl">
          <CardContent className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : payments.length === 0 ? (
        <Card className="border-border/40 rounded-xl">
          <CardContent className="py-16 text-center text-muted-foreground">
            <div className="empty-state-pulse mb-3 inline-flex">
              <DollarSign className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium">No payments found</p>
            <p className="text-xs mt-1">
              {filterGroup !== 'all' || filterMonth || filterStatus !== 'all'
                ? 'Try adjusting your filters.'
                : 'Record your first payment to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/40 rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Paid At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-sm">{payment.studentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.groupName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.month}</TableCell>
                      <TableCell className="text-right text-sm font-medium">DH {payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditStatus(payment)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeletePayment(payment.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={recordPaymentOpen} onOpenChange={(open) => {
        setRecordPaymentOpen(open);
        if (!open) { setStudents([]); setPaymentForm({ groupId: '', studentId: '', amount: '', month: '', status: 'pending' }); }
      }}>
        <DialogContent className="dialog-premium">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a new payment for a student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Group *</Label>
              <Select
                value={paymentForm.groupId}
                onValueChange={(v) => {
                  setPaymentForm({ ...paymentForm, groupId: v, studentId: '', amount: '' });
                  fetchStudents(v);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={paymentForm.studentId}
                onValueChange={(v) => {
                  const student = students.find(s => s.id === v);
                  const amount = student ? (student.age >= 18 ? '250' : '200') : '';
                  setPaymentForm({ ...paymentForm, studentId: v, amount });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} (age {s.age} — DH {s.age >= 18 ? '250' : '200'}/mo)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (DH) *</Label>
                <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="Auto-filled based on age" />
              </div>
              <div className="space-y-2">
                <Label>Month *</Label>
                <Input type="month" value={paymentForm.month} onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={paymentForm.status} onValueChange={(v) => setPaymentForm({ ...paymentForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Pricing Guide:</p>
              <p>• Students aged <strong>18+</strong>: DH 250/month</p>
              <p>• Students aged <strong>under 18</strong>: DH 200/month</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Payments Dialog */}
      <Dialog open={bulkPaymentOpen} onOpenChange={setBulkPaymentOpen}>
        <DialogContent className="dialog-premium">
          <DialogHeader>
            <DialogTitle>Bulk Create Payments</DialogTitle>
            <DialogDescription>Generate payments for ALL students in a group for a specific month. Amount is automatically set based on each student&apos;s age.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Group *</Label>
              <Select value={bulkForm.groupId} onValueChange={(v) => setBulkForm({ ...bulkForm, groupId: v })}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month *</Label>
                <Input type="month" value={bulkForm.month} onChange={(e) => setBulkForm({ ...bulkForm, month: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={bulkForm.status} onValueChange={(v) => setBulkForm({ ...bulkForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Bulk pricing is automatic:</p>
              <p>• Students aged <strong>18+</strong>: DH 250 each</p>
              <p>• Students aged <strong>under 18</strong>: DH 200 each</p>
              <p className="mt-1">Existing payments for the same month will be skipped.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkPayment} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editStatusOpen} onOpenChange={setEditStatusOpen}>
        <DialogContent className="dialog-premium">
          <DialogHeader>
            <DialogTitle>Edit Payment Status</DialogTitle>
            <DialogDescription>
              Change status for {selectedPayment?.studentName}&apos;s payment ({selectedPayment?.month}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedPayment && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p><span className="text-muted-foreground">Student:</span> {selectedPayment.studentName}</p>
                <p><span className="text-muted-foreground">Group:</span> {selectedPayment.groupName}</p>
                <p><span className="text-muted-foreground">Amount:</span> DH {selectedPayment.amount.toLocaleString()}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStatusOpen(false)}>Cancel</Button>
            <Button onClick={handleEditStatus} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
