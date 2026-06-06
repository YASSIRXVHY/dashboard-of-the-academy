import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// PUT /api/students/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, age, phone, email, groupId } = body;

    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (groupId) {
      const group = await db.group.findUnique({ where: { id: groupId } });
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
    }

    const updated = await db.student.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(age !== undefined && { age: Number(age) }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(email !== undefined && { email: email || null }),
        ...(groupId && { groupId }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/students/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Cascade deletes payments via onDelete: Cascade
    await db.student.delete({ where: { id } });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
