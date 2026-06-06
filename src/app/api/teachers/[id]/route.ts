import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// PUT /api/teachers/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, language } = body;

    const teacher = await db.teacher.findUnique({ where: { id } });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (language && !['english', 'french'].includes(language)) {
      return NextResponse.json({ error: 'Language must be "english" or "french"' }, { status: 400 });
    }

    const updated = await db.teacher.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(language && { language }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update teacher error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/teachers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const teacher = await db.teacher.findUnique({
      where: { id },
      include: {
        _count: { select: { groups: true } },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (teacher._count.groups > 0) {
      return NextResponse.json(
        { error: 'Cannot delete teacher: groups are still assigned. Reassign groups first.' },
        { status: 409 }
      );
    }

    await db.teacher.delete({ where: { id } });

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
