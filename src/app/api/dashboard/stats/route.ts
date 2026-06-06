import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/dashboard/stats
export async function GET(request: NextRequest) {
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Total counts
    const [totalStudents, totalGroups, totalTeachers] = await Promise.all([
      db.student.count(),
      db.group.count(),
      db.teacher.count(),
    ]);

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthPayments = await db.payment.findMany({
        where: { month: monthStr, status: 'paid' },
      });
      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      revenueByMonth.push({ month: monthStr, revenue, label: monthNames[d.getMonth()] });
    }

    const totalRevenue = revenueByMonth[revenueByMonth.length - 1]?.revenue || 0;
    const prevMonthRevenue = revenueByMonth[revenueByMonth.length - 2]?.revenue || 0;

    // Students by group
    const groupsWithCount = await db.group.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: 'asc' },
    });
    const studentsByGroup = groupsWithCount.map((g) => ({
      groupId: g.id,
      groupName: g.name,
      count: g._count.students,
    }));

    // Payments by status
    const [paidCount, pendingCount, overdueCount] = await Promise.all([
      db.payment.count({ where: { status: 'paid' } }),
      db.payment.count({ where: { status: 'pending' } }),
      db.payment.count({ where: { status: 'overdue' } }),
    ]);
    const paymentsByStatus = {
      paid: paidCount,
      pending: pendingCount,
      overdue: overdueCount,
    };

    // Recent payments (last 10)
    const recentPayments = await db.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true } },
        group: { select: { name: true } },
      },
    });

    return NextResponse.json({
      totalStudents,
      totalGroups,
      totalTeachers,
      monthlyRevenue: totalRevenue,
      prevMonthRevenue,
      currentMonth,
      revenueByMonth,
      studentsByGroup: studentsByGroup.map(sg => ({ name: sg.groupName, students: sg.count })),
      paymentsByStatus,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        studentName: p.student.name,
        groupName: p.group.name,
        amount: p.amount,
        month: p.month,
        status: p.status,
        paidAt: p.paidAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
