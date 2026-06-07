import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// POST /api/payments/bulk
// Bulk create payments for all students in a group for a given month
export async function POST(request: NextRequest) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { groupId, month, status } = body;

    if (!groupId || !month || !status) {
      return NextResponse.json({ error: 'groupId, month, and status are required' }, { status: 400 });
    }

    if (!['paid', 'pending', 'overdue'].includes(status)) {
      return NextResponse.json({ error: 'Status must be paid, pending, or overdue' }, { status: 400 });
    }

    // Validate group exists
    const group = await db.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get all students in the group
    const students = await db.student.findMany({
      where: { groupId },
    });

    if (students.length === 0) {
      return NextResponse.json({ error: 'No students found in this group' }, { status: 404 });
    }

    // Determine pricing based on age
    const PRICING_ADULT = 250; // 18 and above
    const PRICING_MINOR = 200; // under 18

    const results: any[] = [];
    const skipped: any[] = [];

    for (const student of students) {
      // Check if payment already exists for this student/group/month
      const existing = await db.payment.findUnique({
        where: {
          studentId_groupId_month: {
            studentId: student.id,
            groupId,
            month,
          },
        },
      });

      if (existing) {
        skipped.push({ studentId: student.id, studentName: student.name, reason: 'Payment already exists' });
        continue;
      }

      const amount = student.age >= 18 ? PRICING_ADULT : PRICING_MINOR;

      const payment = await db.payment.create({
        data: {
          studentId: student.id,
          groupId,
          amount,
          month,
          status,
          paidAt: status === 'paid' ? new Date() : null,
        },
      });

      results.push(payment);
    }

    return NextResponse.json({
      created: results.length,
      skipped: skipped.length,
      payments: results,
      skippedPayments: skipped,
    }, { status: 201 });
  } catch (error) {
    console.error('Bulk create payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
