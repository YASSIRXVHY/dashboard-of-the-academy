'use client';

import { useAppStore } from '@/lib/store';
import { LoginPage } from '@/components/login-page';
import { AppLayout } from '@/components/app-layout';
import { DashboardPage } from '@/components/dashboard-page';
import { GroupsPage } from '@/components/groups-page';
import { PaymentsPage } from '@/components/payments-page';
import { TeachersPage } from '@/components/teachers-page';

function PageRouter() {
  const currentPage = useAppStore((s) => s.currentPage);

  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'groups':
      return <GroupsPage />;
    case 'payments':
      return <PaymentsPage />;
    case 'teachers':
      return <TeachersPage />;
    default:
      return <DashboardPage />;
  }
}

export default function Home() {
  const token = useAppStore((s) => s.token);

  if (!token) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <PageRouter />
    </AppLayout>
  );
}
