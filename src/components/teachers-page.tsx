'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Users,
  Loader2,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  language: string;
  groupCount: number;
}

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    language: 'english',
  });

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await apiGet<Teacher[]>('/api/teachers');
      setTeachers(data);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Create teacher
  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter the teacher name');
      return;
    }
    setFormLoading(true);
    try {
      await apiPost('/api/teachers', {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        language: form.language,
      });
      toast.success('Teacher added successfully');
      setAddOpen(false);
      setForm({ name: '', email: '', phone: '', language: 'english' });
      fetchTeachers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add teacher');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit teacher
  const openEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone || '',
      language: teacher.language,
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedTeacher || !form.name.trim()) {
      toast.error('Please enter the teacher name');
      return;
    }
    setFormLoading(true);
    try {
      await apiPut(`/api/teachers/${selectedTeacher.id}`, {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        language: form.language,
      });
      toast.success('Teacher updated successfully');
      setEditOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update teacher');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete teacher
  const openDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    setFormLoading(true);
    try {
      await apiDelete(`/api/teachers/${selectedTeacher.id}`);
      toast.success('Teacher removed successfully');
      setDeleteOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove teacher');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className={cn('space-y-6', mounted && 'page-enter')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground header-enter">Teachers</h2>
          <div className="title-gradient-underline" />
          <p className="text-muted-foreground text-sm mt-2">Manage your academy teaching staff.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="btn-primary-glow">
          <Plus className="h-4 w-4 mr-1" /> Add Teacher
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <Card className="border-border/40 rounded-xl">
          <CardContent className="py-16 text-center text-muted-foreground">
            <div className="empty-state-pulse mb-3 inline-flex">
              <GraduationCap className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium">No teachers yet</p>
            <p className="text-xs mt-1">Add your first teacher to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-xl data-card-hover">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{teacher.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 badge-soft capitalize">
                        <Globe className="h-3 w-3 mr-1" />
                        {teacher.language}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 badge-soft">
                        <Users className="h-3 w-3 mr-1" />
                        {teacher.groupCount} {teacher.groupCount === 1 ? 'group' : 'groups'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-1.5 text-sm">
                  {teacher.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{teacher.phone}</span>
                    </div>
                  )}
                  {!teacher.email && !teacher.phone && (
                    <p className="text-xs text-muted-foreground/50 italic">No contact info</p>
                  )}
                </div>

                <Separator className="my-3" />

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 transition-all duration-200 active:scale-[0.98]" onClick={() => openEdit(teacher)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive/10 border-destructive/30 transition-all duration-200 active:scale-[0.98]"
                    onClick={() => openDelete(teacher)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Teacher Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="dialog-premium">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>Add a new teacher to your academy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="transition-all duration-200 active:scale-[0.98]">Cancel</Button>
            <Button onClick={handleCreate} disabled={formLoading} className="btn-primary-glow">
              {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Add Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="dialog-premium">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update teacher information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="transition-all duration-200 active:scale-[0.98]">Cancel</Button>
            <Button onClick={handleEdit} disabled={formLoading} className="btn-primary-glow">
              {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Teacher Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="dialog-premium">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{selectedTeacher?.name}&quot;? All their groups and associated data will be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={formLoading} className="bg-destructive text-white hover:bg-destructive/90">
              {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
