import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { theme } = useAuthStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return <Outlet />;
}
