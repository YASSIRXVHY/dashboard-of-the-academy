'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  UserPlus,
  Calendar,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TeacherOption {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  language: string;
}

interface GroupListItem {
  id: string;
  name: string;
  level: string;
  language: string;
  schedule: string | null;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  createdAt: string;
}

interface GroupDetail {
  id: string;
  name: string;
  level: string;
  language: string;
  schedule: string | null;
  teacherId: string;
  teacher: { id: string; name: string; email: string | null; phone: string | null; language: string };
  _count: { students: number; payments: number };
}

interface Student {
  id: string;
  name: string;
  age: number;
  phone: string | null;
  email: string | null;
  _count: { payments: number };
}

export function GroupsPage() {
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Dialogs
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [deleteStudentOpen, setDeleteStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Teachers for dropdown
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', level: 'beginner', language: 'english', schedule: '', teacherId: '' });
  const [studentForm, setStudentForm] = useState({ name: '', age: '', phone: '', email: '' });

  const fetchGroups = useCallback(async () => {
    try {
      const data = await apiGet<GroupListItem[]>('/api/groups');
      setGroups(data);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await apiGet<TeacherOption[]>('/api/teachers');
      setTeachers(data);
    } catch {
      setTeachers([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
  }, [fetchGroups, fetchTeachers]);

  const fetchStudents = useCallback(async (groupId: string) => {
    setStudentsLoading(true);
    try {
      const data = await apiGet<Student[]>(`/api/groups/${groupId}/students`);
      setStudents(data);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const openGroupDetail = async (group: GroupListItem) => {
    try {
      const detail = await apiGet<GroupDetail>(`/api/groups/${group.id}`);
      setSelectedGroup(detail);
      fetchStudents(group.id);
    } catch {
      toast.error('Failed to load group details');
    }
  };

  const closeGroupDetail = () => {
    setSelectedGroup(null);
    setStudents([]);
  };

  // Create group
  const handleCreateGroup = async () => {
    if (!groupForm.name.trim() || !groupForm.teacherId) {
      toast.error('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    try {
      await apiPost('/api/groups', {
        name: groupForm.name.trim(),
        level: groupForm.level,
        language: groupForm.language,
        schedule: groupForm.schedule.trim() || null,
        teacherId: groupForm.teacherId,
      });
      toast.success('Group created successfully');
      setCreateGroupOpen(false);
      setGroupForm({ name: '', level: 'beginner', language: 'english', schedule: '', teacherId: '' });
      fetchGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit group
  const openEditGroup = () => {
    if (!selectedGroup) return;
    setGroupForm({
      name: selectedGroup.name,
      level: selectedGroup.level,
      language: selectedGroup.language,
      schedule: selectedGroup.schedule || '',
      teacherId: selectedGroup.teacherId,
    });
    setEditGroupOpen(true);
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !groupForm.name.trim() || !groupForm.teacherId) {
      toast.error('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    try {
      await apiPut(`/api/groups/${selectedGroup.id}`, {
        name: groupForm.name.trim(),
        level: groupForm.level,
        language: groupForm.language,
        schedule: groupForm.schedule.trim() || null,
        teacherId: groupForm.teacherId,
      });
      toast.success('Group updated successfully');
      setEditGroupOpen(false);
      fetchGroups();
      const updated = await apiGet<GroupDetail>(`/api/groups/${selectedGroup.id}`);
      setSelectedGroup(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update group');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete group
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    setFormLoading(true);
    try {
      await apiDelete(`/api/groups/${selectedGroup.id}`);
      toast.success('Group deleted successfully');
      setDeleteGroupOpen(false);
      closeGroupDetail();
      fetchGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete group');
    } finally {
      setFormLoading(false);
    }
  };

  // Add student
  const handleAddStudent = async () => {
    if (!selectedGroup || !studentForm.name.trim() || !studentForm.age) {
      toast.error('Please fill in name and age');
      return;
    }
    setFormLoading(true);
    try {
      await apiPost(`/api/groups/${selectedGroup.id}/students`, {
        name: studentForm.name.trim(),
        age: parseInt(studentForm.age),
        phone: studentForm.phone.trim() || null,
        email: studentForm.email.trim() || null,
      });
      toast.success('Student added successfully');
      setAddStudentOpen(false);
      setStudentForm({ name: '', age: '', phone: '', email: '' });
      fetchStudents(selectedGroup.id);
      fetchGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add student');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete student
  const openDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setDeleteStudentOpen(true);
  };

  const handleDeleteStudent = async () => {
    if (!selectedGroup || !selectedStudent) return;
    setFormLoading(true);
    try {
      await apiDelete(`/api/students/${selectedStudent.id}`);
      toast.success('Student removed successfully');
      setDeleteStudentOpen(false);
      setSelectedStudent(null);
      fetchStudents(selectedGroup.id);
      fetchGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove student');
    } finally {
      setFormLoading(false);
    }
  };

  // Group detail view
  if (selectedGroup) {
    return (
      <div className={cn('space-y-6', mounted && 'page-enter')}>
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="icon" onClick={closeGroupDetail} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground truncate header-enter">{selectedGroup.name}</h2>
            <div className="title-gradient-underline" />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="badge-soft capitalize">{selectedGroup.level}</Badge>
              <Badge variant="outline" className="badge-soft capitalize">{selectedGroup.language}</Badge>
              {selectedGroup.schedule && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedGroup.schedule}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEditGroup} className="transition-all duration-200 active:scale-[0.98]">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-[0.98]" onClick={() => setDeleteGroupOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>

        {/* Group info card */}
        <Card className="border-border/40 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Teacher</span>
                <p className="font-medium">{selectedGroup.teacher.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Students</span>
                <p className="font-medium">{selectedGroup._count.students}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Language</span>
                <p className="font-medium capitalize">{selectedGroup.language}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Level</span>
                <p className="font-medium capitalize">{selectedGroup.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students list */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Students ({selectedGroup._count.students})</h3>
          <Button size="sm" onClick={() => setAddStudentOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Add Student
          </Button>
        </div>

        {studentsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <Card className="border-border/40 rounded-xl">
            <CardContent className="py-14 text-center text-muted-foreground">
              <div className="empty-state-pulse mb-3 inline-flex">
                <Users className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium">No students in this group yet</p>
              <p className="text-xs mt-1">Click &quot;Add Student&quot; to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/40 rounded-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead className="hidden sm:table-cell">Phone</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-center">Monthly Fee</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs badge-soft">{student.age} yrs</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {student.phone || '—'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {student.email || '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={student.age >= 18 ? 'text-amber-600 font-semibold' : 'text-primary font-semibold'}>
                            DH {student.age >= 18 ? '250' : '200'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteStudent(student)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Group Dialog */}
        <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
          <DialogContent className="dialog-premium">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>Update the group information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="Group name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={groupForm.level} onValueChange={(v) => setGroupForm({ ...groupForm, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={groupForm.language} onValueChange={(v) => setGroupForm({ ...groupForm, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Input value={groupForm.schedule} onChange={(e) => setGroupForm({ ...groupForm, schedule: e.target.value })} placeholder="e.g. Mon, Wed, Fri - 10:00 AM" />
              </div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={groupForm.teacherId} onValueChange={(v) => setGroupForm({ ...groupForm, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditGroupOpen(false)}>Cancel</Button>
              <Button onClick={handleEditGroup} disabled={formLoading}>
                {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Group Dialog */}
        <AlertDialog open={deleteGroupOpen} onOpenChange={setDeleteGroupOpen}>
          <AlertDialogContent className="dialog-premium">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{selectedGroup.name}&quot;? This will also remove all students and payments in this group. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGroup} disabled={formLoading} className="bg-destructive text-white hover:bg-destructive/90">
                {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Student Dialog */}
        <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
          <DialogContent className="dialog-premium">
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
              <DialogDescription>Add a new student to {selectedGroup.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} placeholder="Student name" />
              </div>
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input type="number" min="3" max="99" value={studentForm.age} onChange={(e) => setStudentForm({ ...studentForm, age: e.target.value })} placeholder="Age" />
                <p className="text-xs text-muted-foreground">Students 18+ pay DH 250/month. Under 18 pay DH 200/month.</p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} placeholder="Phone number" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="Email address" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddStudentOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStudent} disabled={formLoading}>
                {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Student Dialog */}
        <AlertDialog open={deleteStudentOpen} onOpenChange={setDeleteStudentOpen}>
          <AlertDialogContent className="dialog-premium">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove &quot;{selectedStudent?.name}&quot; from this group? All their payments will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStudent} disabled={formLoading} className="bg-destructive text-white hover:bg-destructive/90">
                {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Groups list view
  return (
    <div className={cn('space-y-6', mounted && 'page-enter')}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground header-enter">Groups</h2>
          <div className="title-gradient-underline" />
          <p className="text-muted-foreground text-sm mt-2">Manage your academy groups and students.</p>
        </div>
        <Button onClick={() => setCreateGroupOpen(true)} className="btn-primary-glow">
          <Plus className="h-4 w-4 mr-1" /> Create Group
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-28 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-border/40 rounded-xl">
          <CardContent className="py-16 text-center text-muted-foreground">
            <div className="empty-state-pulse mb-3 inline-flex">
              <Users className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium">No groups yet</p>
            <p className="text-xs mt-1">Create your first group to get started. You&apos;ll need to add teachers first.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group border-border/40 rounded-xl data-card-hover"
              onClick={() => openGroupDetail(group)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold truncate group-hover:text-[#003B5C] transition-colors">
                      {group.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 badge-soft capitalize">{group.level}</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 badge-soft capitalize">{group.language}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#003B5C]/10 text-[#003B5C] shrink-0 ml-2">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-3" />
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Teacher</p>
                    <p className="font-medium">{group.teacherName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Students</p>
                    <p className="font-bold text-[#003B5C]">{group.studentCount}</p>
                  </div>
                </div>
                {group.schedule && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {group.schedule}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="dialog-premium">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>Set up a new group for your academy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Group Name *</Label>
              <Input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="e.g. English Beginner A" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={groupForm.level} onValueChange={(v) => setGroupForm({ ...groupForm, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={groupForm.language} onValueChange={(v) => setGroupForm({ ...groupForm, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Input value={groupForm.schedule} onChange={(e) => setGroupForm({ ...groupForm, schedule: e.target.value })} placeholder="e.g. Mon, Wed, Fri - 10:00 AM" />
            </div>
            <div className="space-y-2">
              <Label>Teacher *</Label>
              <Select value={groupForm.teacherId} onValueChange={(v) => setGroupForm({ ...groupForm, teacherId: v })}>
                <SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teachers.length === 0 && (
                <p className="text-xs text-amber-600">No teachers available. Please add a teacher first from the Teachers page.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGroupOpen(false)} className="transition-all duration-200 active:scale-[0.98]">Cancel</Button>
            <Button onClick={handleCreateGroup} disabled={formLoading || teachers.length === 0} className="btn-primary-glow">
              {formLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
