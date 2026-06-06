import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/students?groupId=xxx
export async function GET(request: NextRequest) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const where = groupId ? { groupId } : {};

    const students = await db.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        group: {
          select: { id: true, name: true },
        },
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
        groupName: s.group.name,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Fetch students error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/students
export async function POST(request: NextRequest) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, age, phone, email, groupId } = body;

    if (!name || age === undefined || !groupId) {
      return NextResponse.json({ error: 'Name, age, and groupId are required' }, { status: 400 });
    }

    const group = await db.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const student = await db.student.create({
      data: {
        name,
        age: Number(age),
        phone: phone || null,
        email: email || null,
        groupId,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
