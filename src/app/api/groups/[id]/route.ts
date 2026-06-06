import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/groups/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const group = await db.group.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true, phone: true, language: true } },
        _count: { select: { students: true, payments: true } },
      },
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    return NextResponse.json(group);
  } catch (error) {
    console.error('Fetch group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/groups/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, level, language, schedule, teacherId } = body;

    const group = await db.group.findUnique({ where: { id } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (level && !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json({ error: 'Level must be beginner, intermediate, or advanced' }, { status: 400 });
    }

    if (teacherId) {
      const teacher = await db.teacher.findUnique({ where: { id: teacherId } });
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }
    }

    const updated = await db.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(level && { level }),
        ...(language && { language }),
        ...(schedule !== undefined && { schedule: schedule || null }),
        ...(teacherId && { teacherId }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/groups/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const group = await db.group.findUnique({ where: { id } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Cascade deletes students and payments via onDelete: Cascade
    await db.group.delete({ where: { id } });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
