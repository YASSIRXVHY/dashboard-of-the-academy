import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/teachers
export async function GET(request: NextRequest) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const teachers = await db.teacher.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { groups: true },
        },
      },
    });

    return NextResponse.json(
      teachers.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        language: t.language,
        groupCount: t._count.groups,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Fetch teachers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/teachers
export async function POST(request: NextRequest) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, email, phone, language } = body;

    if (!name || !language) {
      return NextResponse.json({ error: 'Name and language are required' }, { status: 400 });
    }

    if (!['english', 'french'].includes(language)) {
      return NextResponse.json({ error: 'Language must be "english" or "french"' }, { status: 400 });
    }

    const teacher = await db.teacher.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        language,
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error('Create teacher error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
