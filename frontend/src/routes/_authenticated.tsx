import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { DashboardLayout } from '../components/layouts/DashboardLayout';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const stored = localStorage.getItem('hrms-auth-storage');
    if (stored) {
      const state = JSON.parse(stored)?.state;
      if (!state?.isAuthenticated) {
        throw redirect({ to: '/login' });
      }
    } else {
      throw redirect({ to: '/login' });
    }
  },
  component: () => <DashboardLayout />,
});
