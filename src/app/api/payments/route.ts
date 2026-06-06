import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/payments?groupId=xxx&month=xxx&status=xxx
export async function GET(request: NextRequest) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = groupId;
    if (month) where.month = month;
    if (status) where.status = status;

    const payments = await db.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { id: true, name: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      payments.map((p) => ({
        id: p.id,
        studentId: p.studentId,
        studentName: p.student.name,
        groupId: p.groupId,
        groupName: p.group.name,
        amount: p.amount,
        month: p.month,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payments
export async function POST(request: NextRequest) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { studentId, groupId, amount, month, status, paidAt } = body;

    if (!studentId || !groupId || amount === undefined || !month || !status) {
      return NextResponse.json(
        { error: 'studentId, groupId, amount, month, and status are required' },
        { status: 400 }
      );
    }

    const student = await db.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const group = await db.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (!['paid', 'pending', 'overdue'].includes(status)) {
      return NextResponse.json({ error: 'Status must be paid, pending, or overdue' }, { status: 400 });
    }

    const payment = await db.payment.create({
      data: {
        studentId,
        groupId,
        amount: Number(amount),
        month,
        status,
        paidAt: paidAt ? new Date(paidAt) : null,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
