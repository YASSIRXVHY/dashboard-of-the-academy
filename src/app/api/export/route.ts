import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = rows.map((row) =>
    headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return [headers.join(','), ...csvRows].join('\n');
}

// GET /api/export/groups?format=csv
export async function GET(request: NextRequest) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'groups';
    const month = searchParams.get('month');

    if (type === 'payments') {
      return exportPayments(month);
    }

    return exportGroups();
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function exportGroups() {
  const groups = await db.group.findMany({
    orderBy: [{ name: 'asc' }],
    include: {
      teacher: { select: { name: true } },
      students: { orderBy: { name: 'asc' } },
    },
  });

  const rows: Record<string, unknown>[] = [];
  for (const group of groups) {
    if (group.students.length === 0) {
      rows.push({
        group: group.name,
        level: group.level,
        language: group.language,
        schedule: group.schedule || '',
        teacher: group.teacher.name,
        student: '',
        'student age': '',
        'student phone': '',
        'student email': '',
      });
    } else {
      for (const student of group.students) {
        rows.push({
          group: group.name,
          level: group.level,
          language: group.language,
          schedule: group.schedule || '',
          teacher: group.teacher.name,
          student: student.name,
          'student age': student.age,
          'student phone': student.phone || '',
          'student email': student.email || '',
        });
      }
    }
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="groups-export.csv"',
    },
  });
}

async function exportPayments(month?: string | null) {
  const where: Record<string, unknown> = {};
  if (month) where.month = month;

  const payments = await db.payment.findMany({
    where,
    orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
    include: {
      student: { select: { name: true } },
      group: { select: { name: true, teacher: { select: { name: true } } } },
    },
  });

  const rows: Record<string, unknown>[] = payments.map((p) => ({
    student: p.student.name,
    group: p.group.name,
    teacher: p.group.teacher.name,
    month: p.month,
    amount: p.amount,
    status: p.status,
    'paid at': p.paidAt ? p.paidAt.toISOString().split('T')[0] : '',
  }));

  const csv = toCsv(rows);
  const filename = month ? `payments-export-${month}.csv` : 'payments-export.csv';

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
