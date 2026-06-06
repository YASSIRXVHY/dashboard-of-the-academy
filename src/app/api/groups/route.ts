import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/groups
export async function GET(request: NextRequest) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const groups = await db.group.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json(
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        level: g.level,
        language: g.language,
        schedule: g.schedule,
        teacherId: g.teacherId,
        teacherName: g.teacher.name,
        studentCount: g._count.students,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Fetch groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups
export async function POST(request: NextRequest) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, level, language, schedule, teacherId } = body;

    if (!name || !level || !teacherId) {
      return NextResponse.json({ error: 'Name, level, and teacherId are required' }, { status: 400 });
    }

    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: 'Level must be beginner, intermediate, or advanced' }, { status: 400 });
    }

    const teacher = await db.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const group = await db.group.create({
      data: {
        name,
        level,
        language: language || 'english',
        schedule: schedule || null,
        teacherId,
      },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        id: group.id,
        name: group.name,
        level: group.level,
        language: group.language,
        schedule: group.schedule,
        teacherId: group.teacherId,
        teacherName: group.teacher.name,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
