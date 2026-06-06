import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// PUT /api/payments/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, month, status, paidAt } = body;

    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (status && !['paid', 'pending', 'overdue'].includes(status)) {
      return NextResponse.json({ error: 'Status must be paid, pending, or overdue' }, { status: 400 });
    }

    const updated = await db.payment.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(month && { month }),
        ...(status && { status }),
        ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/payments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticateRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await db.payment.delete({ where: { id } });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
