import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import { Error404 } from '@/components/Error404';
import { Layout } from '@/components/Layout';

import type { RouterContext } from '@/utils/createRouterProviderContext.tsx';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RouteComponent,
  notFoundComponent: Error404,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
