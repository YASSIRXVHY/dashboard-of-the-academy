'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  FolderOpen,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  totalTeachers: number;
  monthlyRevenue: number;
  prevMonthRevenue: number;
  currentMonth: string;
  revenueByMonth: { month: string; revenue: number; label: string }[];
  studentsByGroup: { name: string; students: number }[];
  paymentsByStatus: { paid: number; pending: number; overdue: number };
  recentPayments: {
    id: string;
    studentName: string;
    groupName: string;
    amount: number;
    month: string;
    status: string;
    paidAt: string | null;
  }[];
}

function CountUp({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const duration = 800;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = value / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="count-animate">{prefix}{displayed.toLocaleString()}</span>;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  colorClass,
  borderClass,
  animateValue,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendLabel?: string;
  colorClass: string;
  borderClass: string;
  animateValue?: boolean;
}) {
  return (
    <Card className={cn(
      'relative overflow-hidden border-border/40 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
      borderClass
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {animateValue && typeof value === 'number' ? (
              <p className="text-3xl font-bold text-foreground tracking-tight">
                <CountUp value={value} />
              </p>
            ) : (
              <p className="text-3xl font-bold text-foreground tracking-tight count-animate">{value}</p>
            )}
            {trend && trendLabel && (
              <div className="flex items-center gap-1">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={cn(
                  'text-xs font-medium',
                  trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                )}>
                  {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            'flex items-center justify-center w-11 h-11 rounded-xl shadow-sm shrink-0',
            colorClass
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'paid'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : status === 'pending'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-red-100 text-red-700 border-red-200';

  return (
    <Badge variant="outline" className={cn('text-xs font-medium badge-soft', variant)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiGet<DashboardStats>('/api/dashboard/stats');
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={cn('space-y-6', mounted && 'page-enter')}>
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardContent className="p-5"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="p-5"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={cn('space-y-6', mounted && 'page-enter')}>
        <div>
          <h2 className="text-2xl font-bold text-foreground header-enter">Dashboard</h2>
          <div className="title-gradient-underline" />
          <p className="text-muted-foreground text-sm mt-2">Welcome to Abyssal Academy management.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={0} icon={<Users className="h-5 w-5 text-white" />} colorClass="bg-[#003B5C]" borderClass="stat-border-teal" />
          <StatCard title="Total Groups" value={0} icon={<FolderOpen className="h-5 w-5 text-white" />} colorClass="bg-[#003B5C]" borderClass="stat-border-teal" />
          <StatCard title="Total Teachers" value={0} icon={<GraduationCap className="h-5 w-5 text-white" />} colorClass="bg-[#003B5C]" borderClass="stat-border-teal" />
          <StatCard title="Monthly Revenue" value="DH 0" icon={<TrendingUp className="h-5 w-5 text-white" />} colorClass="bg-amber-500" borderClass="stat-border-amber" />
        </div>
        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="empty-state-pulse mb-3 inline-flex">
              <TrendingUp className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No data yet</p>
            <p className="text-muted-foreground text-xs mt-1">Start by adding teachers and creating groups.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revenueTrend = stats.prevMonthRevenue > 0
    ? ((stats.monthlyRevenue - stats.prevMonthRevenue) / stats.prevMonthRevenue * 100).toFixed(1)
    : null;

  const hasRevenueData = stats.revenueByMonth.some(r => r.revenue > 0);
  const hasGroupData = stats.studentsByGroup.length > 0;

  return (
    <div className={cn('space-y-6', mounted && 'page-enter')}>
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground header-enter">Dashboard</h2>
        <div className="title-gradient-underline" />
        <p className="text-muted-foreground text-sm mt-2">Welcome back! Here&apos;s an overview of your academy.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="header-enter">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="h-5 w-5 text-white" />}
            colorClass="bg-[#003B5C]"
            borderClass="stat-border-teal"
            animateValue
          />
        </div>
        <div className="header-enter-delay-1">
          <StatCard
            title="Total Groups"
            value={stats.totalGroups}
            icon={<FolderOpen className="h-5 w-5 text-white" />}
            colorClass="bg-[#003B5C]"
            borderClass="stat-border-teal"
            animateValue
          />
        </div>
        <div className="header-enter-delay-2">
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={<GraduationCap className="h-5 w-5 text-white" />}
            colorClass="bg-[#003B5C]"
            borderClass="stat-border-teal"
            animateValue
          />
        </div>
        <div className="header-enter-delay-3">
          <StatCard
            title="Monthly Revenue"
            value={`DH ${stats.monthlyRevenue.toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            trend={revenueTrend ? (Number(revenueTrend) >= 0 ? 'up' : 'down') : undefined}
            trendLabel={revenueTrend ? `${Math.abs(Number(revenueTrend))}% vs last month` : undefined}
            colorClass="bg-amber-500"
            borderClass="stat-border-amber"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <Card className="border-border/40 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
            <CardDescription>Revenue over the past 6 months (DH)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 chart-container-shadow">
              {hasRevenueData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`DH ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#003B5C"
                      strokeWidth={2.5}
                      dot={{ fill: '#003B5C', r: 4 }}
                      activeDot={{ r: 6, fill: '#D97706' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students per group */}
        <Card className="border-border/40 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Students per Group</CardTitle>
            <CardDescription>Distribution of students across groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 chart-container-shadow">
              {hasGroupData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.studentsByGroup} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`${value} students`, 'Count']}
                    />
                    <Bar dataKey="students" fill="#003B5C" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No groups created yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="border-border/40 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
          <CardDescription>Latest payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentPayments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="empty-state-pulse mb-3 inline-flex">
                <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium">No recent payments</p>
              <p className="text-xs mt-1">Payments will appear here once recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-sm">{payment.studentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.groupName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.month}</TableCell>
                      <TableCell className="text-right text-sm font-medium">DH {payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={payment.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    );
}
