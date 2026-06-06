import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/groups/[id]/students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const group = await db.group.findUnique({ where: { id } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const students = await db.student.findMany({
      where: { groupId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { payments: true } },
      },
    });

    return NextResponse.json(
      students.map((s) => ({
        id: s.id,
        name: s.name,
        age: s.age,
        phone: s.phone,
        email: s.email,
        groupId: s.groupId,
        createdAt: s.createdAt,
        _count: s._count,
      }))
    );
  } catch (error) {
    console.error('Fetch group students error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups/[id]/students
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, age, phone, email } = body;

    if (!name || age === undefined) {
      return NextResponse.json({ error: 'Name and age are required' }, { status: 400 });
    }

    const group = await db.group.findUnique({ where: { id } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const student = await db.student.create({
      data: {
        name,
        age: Number(age),
        phone: phone || null,
        email: email || null,
        groupId: id,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Create student in group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
